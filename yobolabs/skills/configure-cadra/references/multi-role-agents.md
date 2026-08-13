# Structuring a large multi-role agent

The design question behind "one master chat agent that can do everything a growth
marketer does — creative, Klaviyo, data, segmentation."

Everything here maps to a mechanism the platform actually implements. Where a rule
has a machine check, `scripts/audit.mjs` runs it.

## The core decision: wear vs spawn

An agent does not hold capability directly at scale. It **wears** roles, and each
worn role is in one of two modes:

| Mode | What happens | Cost | Use when |
|---|---|---|---|
| **`wear`** | the role's abilities merge into the agent's own context (the *wear-union*, deduped by tool/skill id) | paid on **every turn** — the tools sit in the static prompt | the capability is used in most conversations |
| **`spawn`** | the role becomes a delegation target, spawned at its **golden lock** | paid only when delegated to | the capability is occasional, deep, or has its own method |

Constraints the platform enforces:

- **Spawn requires a promoted golden version.** A role with no golden lock cannot
  be set to spawn — promote it in the app first.
- **Pins are wear-only.** A wear assignment can pin a specific version; spawn
  always runs the current golden. Switching a pinned wear → spawn clears the pin
  and needs an explicit confirm.
- **The Core role is always wear.** Every agent may own one private Core role —
  its own hands. It never appears in the shared library and cannot be attached to
  another agent.
- **Narrowing only.** A role can never gain a capability that is not in the
  team/org pool: the effective set is `declared ∩ pool`, deduped, fail-closed. An
  empty pool grants nothing. *"The orchestrator may narrow, never expand."*

**So the master agent is mostly `spawn`, not mostly `wear`.** Wear the handful of
abilities every conversation needs; spawn the rest. A "growth marketer" that wears
creative + Klaviyo + analytics + segmentation all at once pays for all four on
every "hi".

## Why one mega-agent degrades — the number

The static prompt is re-sent on every call. Measured on this platform: **14
meta-tools ≈ 3,350 tokens** of surface on their own (`update_task_list` alone
≈ 690). The platform's own budget targets are **static prefix ≤ 5k tokens** and
**≤ 8k total for a trivial message**; a run that ignored this hit ~70,832 prompt
tokens for the message "hi", and the first LLM call went from ~300–600ms
(cache-warm, in budget) to ~1,700ms.

Two things break past the budget, and only one is obvious:

1. **Latency**, linearly, on every turn.
2. **Routing accuracy.** More near-neighbour tools and roles in one context means
   more chances to pick the wrong one — and that failure is silent, not an error.

There is also a caching cliff: the compiled static prompt is cached as **immutable
bytes**, with dynamic content appended strictly after it. Anything that reorders or
rewrites the prefix per turn loses the provider cache entirely.

`audit.mjs --only prompt-budget` estimates this per agent.

## Role descriptions are the router's only input

This is the highest-leverage rule in the document, and the platform gates on it.

A role description **must** contain both a when-to-use and a NOT-for section.
Recognized markers (case-insensitive):

| Section | Accepted markers |
|---|---|
| when-to-use | `When to use:` · `Use when:` · `Use this role when:` · `Use for:` |
| NOT-for | `Not for:` · `Do not use:` · `Never use:` · `Avoid using:` · `Not to be used for:` |

```
When to use: writing and iterating ad creative — headlines, body copy, image
briefs, variant sets for a campaign that already has a defined audience.

Not for: choosing WHO to send to (segmentation owns that), sending or scheduling
in Klaviyo (lifecycle owns that), or reporting on results (analytics owns that).
```

Then the **overlap lint** compares every pair of roles: it tokenizes the
when-to-use text (lowercase, drop tokens < 3 chars, drop a fixed stopword list) and
flags any pair with **Jaccard similarity ≥ 0.50** as routing-confusable.

Three consequences worth internalizing:

- **The NOT-for section is what makes the roles separable.** Write it as
  counter-examples that name the *sibling role* that owns the case. Vague
  NOT-for text does nothing.
- **A role missing when-to-use contributes an empty token set and therefore never
  overlaps.** A green overlap report across roles that all fail description
  discipline means nothing. Fix descriptions first, then read the overlap result.
- **The lint is lexical, not semantic.** "draft marketing copy" vs "compose
  promotional text" share intent but few tokens, so they pass the lint and still
  confuse the router. The NOT-for veto is the defense the lint cannot provide.

Two further defenses exist above this: a **sanctioned-role enum** (a role not in
the team's sanctioned list cannot be routed to at all, fail-closed) and an
**`outputSchema` backstop** — a schema a mis-routed role cannot satisfy is the last
catch. Give each role a distinct `outputSchema` when its output shape genuinely
differs; it converts a silent mis-route into a loud failure.

## Multiple goals per role

Keep a role to **one job with one output shape**. The moment a role has two
`outputSchema`s it wants to emit, it is two roles.

The test: can you write a NOT-for section that cleanly excludes every sibling? If
the NOT-for has to say "except when…", the boundary is wrong.

Prefer many small roles over few broad ones — **but** every added role is another
pair in the overlap matrix (n roles ⇒ n(n−1)/2 pairs). Past roughly a dozen roles
in one spawn menu, write the descriptions against each other deliberately, and run
the audit after every addition.

## Tools

The model chooses a tool from its `description` + `agentInstructions` alone.

| Field | Carries |
|---|---|
| `description` | what it does, one line |
| `agentInstructions` | **call-time policy** — when to call, when *not* to, what to do on failure |
| `schema` properties' `description` | what each parameter means; the model sees nothing else |

`agentInstructions` is the tool-level equivalent of a role's NOT-for section. A
tool without it is the most common cause of "the agent never calls my tool" and of
random calls. Keep the policy on the tool, not in the agent's system instruction —
it travels with the tool and cannot drift out of sync.

Sizing: a tool's prose is paid on every turn for every agent that holds it. Terse
and discriminating beats thorough.

## Connectors

A connector is a **service-level connection that groups related tools** (Klaviyo,
Notion, Slack…) with one OAuth/credential state per org.

Granting `connectorIds` on an agent grants **every tool of that connector**. That
is the right move when the agent genuinely owns the service, and the wrong move for
a mega-agent — it is how a prompt budget disappears in one field.

**Rule: connectors define the pool; roles select from it.** Connect Klaviyo at the
org level so its tools exist, then let a `lifecycle` role declare the three Klaviyo
tools it actually uses via `toolUuids`. Reserve blanket `connectorIds` for
single-purpose agents.

## The master agent's system instruction

At this scale the master agent's own instruction is a **router**, not a worker. It
should be short — most of its length belongs in the roles.

```
<role>      one sentence: the domain you own and the fact that you delegate
<routing>   the roles you can reach, one line each: name → when to reach for it.
            This mirrors, and must not contradict, each role's own when-to-use.
<direct>    the narrow set you handle yourself without delegating (worn abilities)
<clarify>   what to ask the user before routing, when the request is ambiguous
<never>     never do a specialist's job inline; never invent data a tool returns
<output>    how to present a delegate's result back to the user
```

Rules that come from how the runtime behaves:

- **State a stop condition.** Without one the agent iterates until a guardrail
  budget kills it.
- **Do not restate role or tool schemas.** They are already in context; duplicating
  them burns prefix and drifts.
- **Keep the prefix byte-stable.** Anything varying per turn (dates, user names,
  session state) belongs in the appended dynamic section, never in the instruction.
- **Ambiguity gets a question, not a guess.** Explicitly authorize asking. A
  mega-agent that guesses which sub-domain a request belongs to guesses wrong at a
  rate proportional to how many roles it holds.

## Teams

Teams still exist and are the pool boundary for delegation: members must be
**deployed** agents, and the team's capability pool is what any role can narrow
against.

Cross-menu dedupe applies: **a role cannot be both a team member and a template.**
Pick one.

Choose by shape, not fashion:

| Shape | Use |
|---|---|
| One agent + spawn roles | one conversational surface, many skills — the chat master agent |
| Orchestrator + team of deployed specialists | independently deployable, separately owned, individually monitored units |

They compose, but do not model the same capability both ways — that is exactly the
cross-menu collision the platform rejects.

## Auditing

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/configure-cadra/scripts/audit.mjs"
node "${CLAUDE_PLUGIN_ROOT}/skills/configure-cadra/scripts/audit.mjs" --json > audit.json
node "${CLAUDE_PLUGIN_ROOT}/skills/configure-cadra/scripts/audit.mjs" --only role-description,role-overlap
```

| Check | Severity | Catches |
|---|---|---|
| `role-description` | ERROR | missing when-to-use / NOT-for — the platform's own publish gate |
| `role-overlap` | ERROR | pairwise when-to-use Jaccard ≥ 0.50 |
| `role-spawnable` | WARN | `agentType` ≠ `ROLE` — will never appear in the spawn menu |
| `prompt-budget` | WARN/ERROR | static instruction + tool surface vs `--budget-tokens` (default 5000) |
| `tool-legibility` | WARN/ERROR | tools with no `description`/`agentInstructions` |
| `agent-capability` | WARN/ERROR | specialists with no tools or skills; agents with no instruction |
| `duplicate-names` | WARN | names the model — and `apply` — cannot disambiguate |
| `model-resolvable` | ERROR | `modelProvider` matching no provider available to the org |

Exit code is 1 when any ERROR is present, 0 otherwise, so it works as a CI gate.
Read-only — it never writes.

**What this audit cannot see.** The REST API exposes no org-scope field on
providers, so `model-resolvable` catches only a provider available nowhere. It
cannot detect an agent running on the **platform-wide key** — which works today,
but bills to the platform and stops the day that fallback closes. No agent should
be in that state. The in-app assistant's own audit reads the provider rows
directly and does report it; ask it to *"audit my agents"* for the provider
verdict, and treat a clean result here as "no agent is broken", not "every agent
is on your own key".

Order of work when the report is long: **descriptions → overlap → budget.** The
first two gate the third's meaning, and overlap results are not trustworthy until
descriptions pass.
