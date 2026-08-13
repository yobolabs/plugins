---
name: configure-cadra
description: Use when creating, updating, or managing CadraOS building blocks through the REST API — agents, roles, skills, tools, teams, agentic boards, knowledge bases, prompts, guardrails, models, providers, rules, projects, workflows or channels. Also use when the user mentions "cadra agent", "create an agent", "update an agent", "agent role", "role template", "cadra skill", "cadra tool", "register a tool", "MCP tool", "agent team", "deploy agent", "cadra board", "agentic board", "publish board", "knowledge base", "guardrail profile", or a `/api/v1/...` CadraOS path.
---

# Configure CadraOS (agents, roles, skills, tools, teams, boards, KBs)

Create, update, and manage every CadraOS building block from the CLI through the
public REST API — the same operations the in-app copilot runs (`configure_agent`,
`configure_kanban_board`, `configure_knowledge`), but scriptable and reviewable.

Works identically in Claude Code, Codex, or a plain terminal: the helper is
dependency-free Node.

> **Scope.** This skill drives the product from the outside, over its public API.
> For work *inside* the platform — the ReAct loop, provider resolution, why an
> execution hangs, cadra-web/cadra-api code — use the `cadra` plugin
> (`cadra:agents`, `cadra:cadra-api`). Authoring config → here; debugging the
> runtime that consumes it → there.

**Two ways to work:**

| Mode | Use for | Command |
|------|---------|---------|
| **Imperative** | one-off changes, exploring | `cadra agent create '{…}'` |
| **Declarative** | the team's real workflow — definitions live in git | `cadra agent apply @agents/` |

Prefer **declarative** for anything a team maintains. `apply` is an idempotent
upsert keyed on `name`, so the same file re-applies cleanly to local, dev, and
prod.

## Setup

| Env var | Purpose |
|---------|---------|
| `CADRA_BUILDER_API_KEY` | API key with the entity's `*:read/create/update/delete` (+ `publish`/`deploy`) permissions |
| `CADRA_API_URL` | cadra-web origin, no trailing slash — local `http://localhost:3000`, otherwise `https://<cadra-web-host>` (deployed origins are in `_ai/server/server-inventory.yaml`) |

**Get a key:** in CadraOS → profile menu → **API Keys** → create (shown once).
Keys are **org-scoped** — every call only sees and edits that key's organization.
The key inherits its **role's** permission set, so pick a role that has the verbs
you need — deploying an agent needs `agents:publish` *and* `agents:deploy`.

### Server requirements

Three routes are newer than the rest of the v1 API. Against an origin that
predates them you get a **404 on the route itself** (not on the record):

| Route | Needed for | Missing ⇒ |
|---|---|---|
| `/api/v1/roles`, `/api/v1/roles/{id}` | every `cadra role …` command | roles unmanageable — use the app |
| `/api/v1/agents/{id}/publish` | `cadra agent deploy` | agents stay draft; only the app can deploy them |
| `/api/v1/tools/{id}` GET/PUT/DELETE fix | `tool get/update/delete` | **404 on a tool the same key can `list`** |

`cadra ping` does not detect these. Confirm with `cadra role list` against a new
origin before assuming a failure is your payload.

Define the wrapper as a **function** (a `VAR="node …"` alias breaks in zsh, which
does not word-split unquoted parameters):

```bash
cadra(){ node "${CLAUDE_PLUGIN_ROOT}/skills/configure-cadra/scripts/cadra.mjs" "$@"; }
cadra ping     # verify key + origin before anything else
```

Outside Claude Code (Codex, terminal, CI), point at the checked-out path instead
of `${CLAUDE_PLUGIN_ROOT}`.

## Never guess a field name

The single most common failure is inventing a field. Two guards, in order:

```bash
cadra schema agent create     # live field contract from the server's OpenAPI
cadra agent get <id>          # an existing record — the ground truth
```

`references/entities.md` carries the **full** verified contract for each entity
(the OpenAPI subset is thinner than the real validator). Read it before authoring
anything non-trivial. A 400 prints the server's Zod `details` — read them.

## Commands

```
cadra ping | entities | schema <entity> [create|update] | docs

cadra <entity> list [--search S] [--limit N] [--offset N] [--<k> <v> …]
cadra <entity> find <name>                # name → id (substring, case-insensitive)
cadra <entity> get <id>
cadra <entity> create <json|@file>
cadra <entity> update <id> <json|@file>   # partial; PUT or PATCH picked per entity
cadra <entity> delete <id>
cadra <entity> apply <@file|@dir>         # idempotent upsert by name
cadra <entity> export [id] [--out FILE]   # dump as apply-able JSON

cadra agent deploy <id>                   # publish + activate (the full step)
cadra agent publish|activate|runs <id>
cadra agent set-tools  <id> '{"tools":[{"toolId":6387}]}'    # REPLACES
cadra agent set-skills <id> '{"skills":[{"skillId":12}]}'    # REPLACES
cadra board draft <id> <json|@file> | publish <id>
cadra kb    docs <id> | query <id> <json|@file>

--dry-run    print the request, send nothing
--quiet      suppress the per-record apply log
```

**`update` verb is not uniform across the API.** Most item routes implement
**PUT**; `role`, `channel` and `remote-agent` implement PATCH; `board` implements
neither. The helper sends the right one — hitting the wrong verb by hand returns
a bare **405 with an empty body**.

Entities: `agent role skill tool team board kb prompt guardrail model provider
rule project workflow channel remote-agent decision-table webhook execution
artifact` — run `cadra entities` for the path map.

## The four things the team actually builds

### Agent

```bash
cadra agent create '{
  "name": "Drafting Agent",
  "agentType": "SPECIALIST",
  "systemInstruction": "You draft social posts in the brand voice…",
  "modelProvider": "google",
  "modelId": "gemini-3-flash-preview",
  "temperature": 0.7,
  "maxTokens": 4096
}'
cadra agent deploy <id>          # REQUIRED — a draft agent is invisible to the runtime
```

`deploy` is a **two-call composite**: `POST /agents/{id}/publish` (visibility
flip → `deployed` + status `ACTIVE`) then `POST /agents/{id}/deploy` (activate).
The server's `/deploy` route only activates and 412s on a fresh agent, so calling
it alone never works. Verify with `cadra agent get <id>` — you want
`visibility: "deployed"` **and** `status: "ACTIVE"`.

The identity field is **`systemInstruction`**, not `systemPrompt`.
Read `references/agent-authoring.md` before writing one — it covers the
system-instruction structure, model/provider resolution, capability wiring
(skills/tools/KBs/connectors), teams, guardrails and structured output.

### Role

A **role** is a reusable starter config that pre-fills a new agent, and (as a
*product role*, `agentType: "ROLE"`) the unit a team spawns at runtime. Roles have
their own versioning + golden-lock lifecycle — see `references/roles.md`.

```bash
cadra role apply @roles/researcher.json
cadra agent create '{"name":"Researcher #2","roleUuid":"<role-uuid>"}'
```

### Skill

A skill is a **prompt template** an agent can be granted. `template` is required —
omitting it is a 400.

```bash
cadra skill create '{
  "name": "Summarize Thread",
  "description": "Condense a comment thread",
  "template": "Summarize the following thread in {{maxBullets}} bullets:\n\n{{thread}}",
  "inputs": ["thread", "maxBullets"],
  "category": "content"
}'
```

### Tool

```bash
cadra tool create '{
  "name": "Get Customer",
  "implementation": "API",
  "category": "EXTERNAL",
  "endpoint": "https://api.example.com/customers/{id}",
  "method": "GET",
  "schema": { "type":"object", "properties": { "id": {"type":"string"} }, "required":["id"] },
  "agentInstructions": "Use to fetch one customer by id. Do not call for lists."
}'
```

`implementation` is `API | MCP | WEBHOOK`. Multi-endpoint tools, MCP servers,
credential binding, and the `viewPath` link-enrichment contract are all in
`references/tool-authoring.md`.

## Lifecycle rules that bite

- **Agents must be deployed.** `cadra agent deploy <id>` — a draft agent cannot be
  dispatched by a board lane or a team.
- **Boards are draft-then-publish.** New boards are draft v1. Edit with
  `board draft` (which **replaces** the whole definition — GET, mutate, PATCH
  back), then `board publish`. The Conductor only runs the published version.
  There is **no** board update or delete over REST.
- **Capability wiring is by numeric id, not uuid,** on `agent create/update`
  (`skillIds`, `toolIds`, `connectorIds`, `guardrailProfileIds`) — but
  `teamUuids` and `roleUuid` are uuids. Resolve with `cadra tool find <name>`.
- **Capability lists replace.** `set-tools`, `set-skills`, and the `*Ids` arrays
  all overwrite the full set — send everything the agent should keep.
- **Deleting is permanent.** There is no undo; `export` first.

## Errors

| Code | Meaning | Fix |
|------|---------|-----|
| 400 / **422** | field/shape rejected by the validator (most are 422 `VALIDATION_ERROR`) | read the printed `details`; run `cadra schema <entity> create` |
| 401 | bad/expired key | re-mint in CadraOS → API Keys |
| 403 | key lacks the verb's permission | mint a key with e.g. `agents:create`, `agents:publish`, `tools:update` |
| 404 on a record `list` just returned | server predates the tools item-route fix (see Server requirements) | update the origin, or work through `list` |
| 405 (empty body) | wrong HTTP verb for that item route | use the helper; it picks PUT vs PATCH per entity |
| 409 | duplicate name in this org | rename, or use `apply` (which updates instead of colliding) |
| 412 | agent not published yet | `cadra agent deploy <id>`, not `activate` |

A key minted from the UI carries the **role's** permission set. Deploying needs
both `agents:publish` and `agents:deploy` — a key missing `agents:publish` fails
at the first half of `deploy`.

## Reference

- `references/entities.md` — every entity: exact create/update fields, permissions, id semantics. **Read before authoring.**
- `references/agent-authoring.md` — writing an agent that actually works.
- `references/tool-authoring.md` — API/MCP/WEBHOOK tool definitions.
- `references/roles.md` — roles, product roles, golden locks, spawning.
- `references/recipes.md` — git-backed definitions, promoting local → dev, Codex usage.
- Live OpenAPI: `GET {CADRA_API_URL}/api/v1/docs`.
