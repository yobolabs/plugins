# Authoring a CadraOS agent

The API call is the easy part. This is what makes the agent actually work.

## 1. Decide the type first

| `agentType` | Use when |
|---|---|
| `SPECIALIST` | does one job well; called directly, by a board lane, or as a team member |
| `ORCHESTRATOR` | decomposes work and delegates to other agents via `handoff_to_agent` |

An orchestrator with no reachable specialists is the most common dead agent.
Give it a team (`teamUuids`) whose members are **deployed**.

## 2. Write the system instruction

`systemInstruction` (≤50 000 chars) is the agent. Structure that survives contact
with the ReAct loop:

```
<role>          one sentence: who it is and what it owns
<inputs>        what it will be given, and what to do if something is missing
<method>        the ordered steps; name the tools it should call and when
<constraints>   what it must never do; the escalation/ask path
<output>        the exact shape expected — format, length, sections
```

Rules that come from how the loop actually behaves:

- **Name tools explicitly in `<method>`.** "Use `Get Customer` before answering
  any account question." Agents under-call tools far more often than they
  over-call them.
- **Give a stop condition.** Without one, an agent keeps iterating until the
  guardrail budget kills it.
- **State the failure path.** "If the tool returns 404, say so and stop" prevents
  invented data.
- **Do not restate the tool's own schema** — that lives on the tool
  (`agentInstructions`), and duplicating it drifts.
- **Do not put secrets, keys, or environment URLs in the instruction.** Those
  belong on a credential or a tool endpoint.

## 3. Pick a model the org can actually serve

```bash
cadra provider list      # which providers this org has configured
cadra model list         # which model ids are registered
```

`modelProvider` + `modelId` are resolved against the org's provider rows at run
time. Choosing a model the org has no key for produces
`No API key configured for provider "…"` — or, worse, an execution stuck
`running` with 0 iterations. **Verify before you create.**

Defaults if omitted: `google` / `gemini-3-flash-preview` / `temperature 0.7` /
`maxTokens 4096` / `thinkingBudget 5`.

Rough guidance: deterministic extraction/classification → `temperature` 0–0.3;
drafting/ideation → 0.7–1.0. Raise `maxTokens` only when output is genuinely long
— it is a ceiling, and guardrails bill against it.

## 4. Wire capabilities

```jsonc
{
  "skillIds":  [12, 15],   // numeric ids  — prompt templates
  "toolIds":   [3, 9],     // numeric ids  — callable tools
  "connectorIds": [2],     // numeric ids  — grants EVERY tool of that connector
  "guardrailProfileIds": [1],
  "teamUuids": ["…uuid…"]  // uuids
}
```

Resolve names → ids first:

```bash
cadra tool find "Get Customer"
cadra skill find "Summarize"
```

Or after creation, via the dedicated sub-routes (also replace-in-full):

```bash
cadra agent set-tools  <id> '{"tools":[{"toolId":6387,"isEnabled":true}]}'
cadra agent set-skills <id> '{"skills":[{"skillId":12}]}'
```

Notes:

- Capability arrays **replace** on update — send the full set, not a delta.
- There is no GET for an agent's grants; read `tools[]` / `skills[]` off
  `cadra agent get <id>`.
- `connectorIds` is a blunt grant; prefer explicit `toolIds` when the connector
  exposes tools the agent should not see.
- `upfrontRag: true` forces a retrieval pass before the loop. Leave it `false`
  (the default) unless the agent must always ground on the KB — otherwise RAG
  runs just-in-time as a tool, which is cheaper.

## 5. Structured output

Set `outputSchema` to a JSON Schema when a downstream consumer parses the result
(a board lane, a workflow, another agent). Keep it shallow — deep nesting raises
the retry rate. Say the same thing in `<output>` in the instruction; the schema
constrains, the instruction explains.

## 6. Deploy

```bash
cadra agent deploy <id>
cadra agent get <id>     # want visibility: "deployed"  AND  status: "ACTIVE"
```

Until deployed, the agent is invisible to boards, teams, and channels. Deploy is
also the point at which a bad config surfaces — deploy right after create, don't
batch it to the end.

`deploy` is two calls: **publish** (visibility flip + status ACTIVE, permission
`agents:publish`) then **activate** (the server's `/deploy` route, permission
`agents:deploy`). Activate alone 412s on a fresh agent — if you script this by
hand, do both, in that order.

Re-deploy after any config change: a deployed agent keeps serving its deployed
snapshot until you publish again.

## 7. Verify it runs

Creating an agent is not testing an agent. Run it from the playground in the app
(or via `/api/v1/executions`) with a real input, then:

```bash
cadra execution list --limit 5
cadra execution get <executionId>
```

An execution stuck `running` with 0 iterations means the run never got past
init — nearly always provider/key resolution, not your prompt.

## Update flow

```bash
cadra agent export <id> --out agents/drafting.json
$EDITOR agents/drafting.json
cadra agent apply @agents/drafting.json     # upsert by name
cadra agent deploy <id>                     # re-deploy after config changes
```

`export` output includes server-managed fields (`uuid`, timestamps, counters);
they are ignored on write, but trimming the file to the fields you own keeps the
diff meaningful.

## Checklist before calling an agent done

- [ ] `agentType` matches how it will be invoked
- [ ] `systemInstruction` names its tools and has a stop condition
- [ ] `modelProvider`/`modelId` exist in this org's provider config
- [ ] capabilities resolved by id and complete (arrays replace)
- [ ] guardrail profile attached if it spends money or touches customers
- [ ] deployed
- [ ] one real execution inspected end to end

---

## Cloning an existing agent

The platform's own **Duplicate** button (`AgentsRepository.clone`,
`src/extensions/agents/repository.ts`) copies **skills and tools only** — no
connectors, no wardrobe, no Core role, and no instruction rewrite. A REST clone
that also sets `connectorIds` is already the more faithful copy. Three traps:

1. **The system instruction hardcodes the agent's own uuid.** A role-handoff
   contract of the form *"always call `handoff_to_agent` with agentUuid set to this
   agent UUID: …"* is copied byte-for-byte, so an unedited clone hands every role
   spawn to **the source agent** — silently, and only in production behaviour.
   The uuid cannot be known before create, so the sequence is create → rewrite the
   instruction → deploy. The private Core role's instruction usually repeats the
   same uuid; patch both.
2. **The auto-created Core role is seeded with the agent's full system
   instruction**, not a Core routing instruction. Left alone, the clone pays the
   entire prefix twice on every turn. Copy the source Core's own (much shorter)
   text across, uuid rewritten.
3. **The source's Core role cannot be attached to the clone.** It is
   lifecycle-bound to its agent (`is_core`, `core_agent_id`) and excluded from the
   shared library. The clone gets its own automatically — populate it, don't
   reassign.

`iterationLimit` / `maxSubtasks` do not survive a REST clone at all — see
`entities.md`. Neither does the wardrobe.

## New agents land in the creator's PERSONAL workspace

`workspaceId` defaults to the personal workspace of the key's `created_by` user
*inside the key's org* — a `type:'personal'` workspace, auto-created on first use.
Workspaces scope agents, so an API-created agent is **invisible** from the org's
shared views (`General` and the team workspaces) even though the row carries the
correct `org_id`. This is the usual cause of "the API said it created the agent but
I can't see it in the app".

Roles, skills, tools and teams are **not** workspace-scoped — only agents are. So a
role created over REST shows up immediately while the agent from the same script
does not.

Pass `workspaceId` explicitly at create time to avoid it.
