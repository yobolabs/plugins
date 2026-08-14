# CadraOS entity contracts

The **authoritative** create/update contract for each entity, taken from the
server-side validators (`src/extensions/<entity>/schemas.ts` in cadra-web), not
from the OpenAPI doc — the OpenAPI at `/api/v1/docs` is a hand-maintained subset
and lists fewer fields than the validator accepts.

Verification order when something 400s:

1. Read the `details` the helper prints — it is the raw validator error.
2. `cadra schema <entity> create` — live, but partial.
3. `cadra <entity> get <id>` on a record that already works — ground truth.
4. This file.

Common to every entity: responses use `{ success, data }` (the helper unwraps
`data`); `limit` and pagination params vary per route; every key is org-scoped.

## The update verb is not uniform

Verified against the routes themselves. Sending the wrong verb returns a bare
**405 with an empty body** — no error code, no message. The helper picks
correctly; hand-rolled `curl` does not.

| Update verb | Entities |
|---|---|
| **PUT** | agent, skill, tool, team, kb, prompt, guardrail, model, rule, project, workflow, decision-table |
| **PATCH** | role, channel, remote-agent |
| **neither** | board (`/board-configs/{uuid}` is GET-only — edit via `draft`, then `publish`) |

Validation failures come back as **422 `VALIDATION_ERROR`** with a per-field
`errors` map, not 400.

---

## agent → `/api/v1/agents`

Permissions: `agents:read` / `agents:create` / `agents:update` / `agents:delete`.
`POST` validates with `createAgentSchema` directly.

| Field | Req | Type / range | Default |
|---|---|---|---|
| `name` | ✅ | string ≤200 | |
| `agentType` | | `ORCHESTRATOR` \| `SPECIALIST` | `SPECIALIST` |
| `description` | | string ≤2000 | |
| `systemInstruction` | | string ≤50000 | |
| `roleUuid` | | uuid — pre-fills everything from a role | |
| `roleTemplate` | | string ≤100 (legacy label) | |
| `taskTypes` | | string[] ≤50 | `[]` |
| `modelProvider` | | string ≤100 | `google` |
| `modelId` | | string ≤100 | `gemini-3-flash-preview` |
| `temperature` | | number 0–2 | `0.7` |
| `thinkingBudget` | | number 1–100 | `5` |
| `maxTokens` | | number 1000–500000 | `4096` |
| `upfrontRag` | | boolean — force RAG before the loop instead of JIT | `false` |
| `outputSchema` | | JSON Schema — structured output | |
| `skillIds` | | **number[]** (numeric ids, not uuids) | |
| `toolIds` | | **number[]** | |
| `connectorIds` | | **number[]** — grants every tool of each connector | |
| `guardrailProfileIds` | | **number[]** | |
| `teamUuids` | | **uuid[]** | `[]` |
| `workspaceId` | | int — defaults to the creator's personal workspace | |
| `memoryEnabled` | | boolean | `false` |
| `memoryScope` | | `isolated` \| `org` | `isolated` |
| `memoryExtractionModel` | | string ≤100 | `gpt-4o-mini` |
| `memoryRetrievalTopK` | | int ≤50 | `20` |
| `memoryMaxObservationsPerPeer` | | int ≤1000 | `500` |
| `memoryConsolidationThreshold` | | int ≤200 | `50` |
| `memoryProfileEnabled` | | boolean | `false` |

**Mixed id types is the #1 trip-up**: capability arrays are numeric ids,
`teamUuids`/`roleUuid` are uuids.

### Agent sub-routes (all take the agent **uuid**)

| Route | Method | What it does |
|---|---|---|
| `/{uuid}/publish` | POST | draft → `deployed` + status `ACTIVE`. Permission `agents:publish`. |
| `/{uuid}/deploy` | POST | **activate only** — 412s unless already published. Permission `agents:deploy`. Misnamed; `publish` is the one that makes a new agent runnable. |
| `/{uuid}/tools` | POST | replace the tool assignments: `{"tools":[{"toolId":6387,"isEnabled":true}]}` |
| `/{uuid}/skills` | POST | replace the skill assignments: `{"skills":[{"skillId":12}]}` |
| `/{uuid}/runs` | GET | recent executions |
| `/{uuid}/execute` | POST | run the agent |

There is **no GET** on `/tools` or `/skills` — read the grants from
`agent get <uuid>` (`tools[]` / `skills[]` on the record).

`cadra agent deploy` issues publish-then-activate, which is what the UI's Deploy
button does.

---

## role → `/api/v1/roles`

Permissions: `agents:read` / `agents:create` / `agents:update` / `agents:delete`
(roles are governed by the agents permission family). Item route is **PATCH**
(PUT accepted as an alias).

List query: `limit`, `offset`, `search`, `source=all|platform|org`,
`agentType`, `spawnableOnly=true` (product roles only). The list payload is
`{ roles: [...], total }`.

| Field | Req | Type | Default |
|---|---|---|---|
| `name` | ✅ | string ≤200 | |
| `description` | | string ≤2000 | |
| `icon` | | string ≤100 | |
| `agentType` | | `ORCHESTRATOR` \| `SPECIALIST` \| `ROLE` | `SPECIALIST` |
| `systemInstruction` | | string ≤50000 | |
| `modelProvider` | | string ≤100 | |
| `modelId` | | string ≤200 | |
| `temperature` | | number 0–2 | |
| `maxTokens` | | number 1000–500000 | |
| `taskTypes` | | string[] ≤50 | `[]` |
| `toolIds` | | number[] | `[]` |

Roles carry a lot more state than they accept on create (uuid capability presets,
golden locks, the versioned method prompt) — see `roles.md`.

---

## skill → `/api/v1/skills`

Permissions: `skills:*`. A skill is a **prompt template**, not code.

| Field | Req | Type |
|---|---|---|
| `name` | ✅ | string ≤200 |
| `template` | ✅ | string ≤50000 — the prompt body, `{{var}}` placeholders |
| `description` | | string ≤1000 |
| `inputs` | | string[] ≤50 — the variable names used in `template` |
| `knowledgeBaseId` | | int |
| `category` | | string ≤100 |

Forgetting `template` is the most common 400 on this entity.

---

## tool → `/api/v1/tools`

Permissions: `tools:*`. Full authoring guide in `tool-authoring.md`.

| Field | Req | Type | Default |
|---|---|---|---|
| `name` | ✅ | string ≤200 | |
| `implementation` | ✅ | `API` \| `MCP` \| `WEBHOOK` | |
| `description` | | string ≤1000 | |
| `category` | | `INTERNAL` \| `EXTERNAL` \| `DATA` | `EXTERNAL` |
| `endpoint` | | URL (single-endpoint form) | |
| `method` | | `GET` \| `POST` \| `PUT` \| `PATCH` \| `DELETE` | |
| `schema` | | JSON Schema of the tool's parameters | |
| `endpoints` | | endpoint[] (multi-endpoint form) | `[]` |
| `mcpConfig` | | see `tool-authoring.md` | |
| `agentInstructions` | | string ≤50000 — when/how the agent should call it | |
| `authCredentialId` | | int — a stored credential | |
| `viewPath` | | root-relative path with exactly one `{uuid}` or `{id}` | |
| `isActive` | | boolean | `true` |
| `isGlobal` / `isEnabled` / `targetOrgId` | | backoffice-only | |

---

## team → `/api/v1/teams`

Permissions: `teams:*`. Routed through the tRPC bridge, so validation errors come
back from the tRPC layer.

| Field | Req | Type |
|---|---|---|
| `name` | ✅ | string |
| `description` | | string |
| `leadAgentUuid` | | uuid |
| `memberAgentUuids` | | uuid[] |
| `defaultGuardrailProfileUuid` | | uuid |

List query: `limit` (≤100), `offset`, `search`, `isActive`,
`orderBy=name|createdAt`, `orderDir=asc|desc`.

Members must be **deployed** agents.

---

## board → `/api/v1/board-configs`

Permissions: `board_config:read/create/update/delete/publish`.

Create takes `{ name, description? }` and yields **draft v1**. The lifecycle
definition is edited separately:

- `PATCH /{uuid}/draft` — **replaces** the whole draft definition. Always
  GET → mutate → PATCH back; never send a partial.
- `POST /{uuid}/publish` — draft → published. The Conductor executes the
  **published** version only.

A lane handler is `{ "type": "cadra_agent" | "remote_agent" | "none", … }`; a
lane `trigger` is `event` (card enters the lane) or `scheduled` (swept on the
board `cadence`). Confirm `BoardDefinition` / `BoardStage` / `BoardHandler`
shapes at `/api/v1/docs`.

Note: this list route returns `{ configs: [...] }`, not `{ items }` — the helper
normalizes it.

---

## kb → `/api/v1/knowledge-bases`

Permissions: `knowledgeBase:*`.

| Field | Req | Type |
|---|---|---|
| `name` | ✅ | string ≤200 |
| `embeddingModel` | ✅ | string (e.g. `text-embedding-3-small`) |
| `vectorDB` | ✅ | string (e.g. `pgvector`) |
| `description` | | string ≤1000 |

Extra ops: `GET /{id}/documents`, `POST /{id}/query`.

---

## prompt → `/api/v1/prompts`

Permissions: `prompt:*`. **Identity field is `title`, not `name`** — `find` and
`apply` key on `title` for this entity.

| Field | Req | Type |
|---|---|---|
| `title` | ✅ | string ≤200 |
| `content` | ✅ | string ≤100000 |
| `description` | | string ≤2000 |
| `systemPrompt` | | string ≤50000 |
| `category` | | string ≤100 |
| `tags` | | tag[] ≤20 |
| `variables` | | variable[] ≤50 |

---

## guardrail → `/api/v1/guardrails`

Permissions: `guardrails:*`. A guardrail *profile* is attached to agents via
`guardrailProfileIds`, or to a team as its default.

| Field | Req | Type | Default |
|---|---|---|---|
| `name` | ✅ | string ≤200 | |
| `description` | | string ≤5000 | |
| `piiRedaction` | | boolean | `true` |
| `profanityFilter` | | boolean | `true` |
| `bannedTopics` | | string[] ≤50 | `[]` |
| `humanApprovalTrigger` | | `NEVER` \| `ALWAYS` \| `ON_HIGH_RISK` … | `NEVER` |
| `maxCostPerRun` | | number ≤10000 (USD) | |
| `apiCallBudget` | | int ≤10000 | |
| `tokenLimit` | | int ≤1000000 | |
| `timeLimitSeconds` | | int ≤86400 | |
| `compactionThreshold` | | number 0.01–0.99 | |
| `historyWindowPct` | | number 0.01–0.99 | |
| `isDefault` | | boolean | `false` |
| `isActive` | | boolean | `true` |

---

## The rest

Same generic verbs, contracts via `cadra schema <entity> create`:

| Alias | Path | Permission family |
|---|---|---|
| `model` | `/models` | `model:*` |
| `provider` | `/providers` | `providers:read` |
| `rule` | `/rules` | `rules:*` |
| `project` | `/projects` | `projects:*` |
| `workflow` | `/workflows` | `workflow:*` |
| `channel` | `/channels` | `channel:*` |
| `remote-agent` | `/remote-agents` | `remote_agents:*` |
| `decision-table` | `/decision-tables` | `decisioning:*` |
| `webhook` | `/webhooks` | — |
| `execution` | `/executions` | read-mostly |
| `artifact` | `/artifacts` | read-mostly |

`provider` is read-only over REST — provider **credentials** are configured in
the app, never through this helper.

---

## Verified coverage gaps

Full verb sweep against a **production** origin (2026-08-14). Everything not listed
here passed: `ping`, `entities`, `docs`, `schema`, `--dry-run`, `--quiet`, `list`
(20 entities), `find`/`get`/`export`, `create`, `update`, `set-tools`, `set-skills`,
`deploy`, `runs`, `apply` (idempotency confirmed), `delete`, `kb list`/`docs`,
`board list`.

| Entity / verb | Status | Detail |
|---|---|---|
| **wardrobe (worn/spawn roles)** | ✗ no REST at all | Write path is tRPC `agents.assignRole` (`src/extensions/agents/router.ts`). The only REST surface is `GET /api/v1/internal/agents/{uuid}/worn-roles` — **internal-key**, not a builder key. `assignWornRoleSchema` carries no `mode`, so wear-vs-spawn is a separate p53 tRPC call. **Attaching roles to an agent cannot be scripted**: the multi-role flow this plugin documents ends in the app UI. |
| `project` | ✗ broken | `404 INTERNAL_ERROR: No procedure found on path "projects,list"` — the route bridges to an unregistered tRPC procedure. |
| `artifact list` | ✗ 404 | `src/app/api/v1/artifacts/` contains only `[artifactId]`; there is no collection route, though `artifact` is listed as an entity. |
| `rule`, `decision-table` | ⚠ ungrantable | Routes demand `rules:read` / `decisioning:read`. `src/permissions/registry.ts` defines only `rule:read` (**singular**) and `copilot:configure_decisioning` — so **no role can grant them** and no UI-minted key reaches these entities. Both work the instant the slug exists (proved by writing it straight into `api_keys.permissions`, which is what `validateApiKey` reads). |
| `kb query` | ✗ retired | `503 SERVICE_UNAVAILABLE` — "Direct knowledge-base vector search over this REST endpoint has been retired. Use an agent with the knowledge base attached (native retrieval via cadra-api)." |

⚠ The permission families in *The rest* table above are aspirational for three
rows: `rule → rules:*`, `project → projects:*`, `decision-table → decisioning:*`
name families the registry does not define.

**Environments drift.** A deployed origin can sit many commits behind the branch
these docs are written against — a route that exists in the repo may still 404 in
production. `cadra ping` does not detect it. Probe the specific route
unauthenticated before concluding a payload is wrong: **404 = route absent from
that origin, 401 = route present.**

## Item routes take the uuid, not the numeric id

`get` / `update` / `delete` on an item route return `422 VALIDATION_ERROR
(Invalid uuid)` when handed the numeric id that `list` prints. `find` already
returns the **uuid** in its `id` field, so `find` → `get` chains correctly.
Numeric ids are for the capability arrays (`skillIds`, `toolIds`, `connectorIds`)
and for `set-tools` / `set-skills` — nowhere else.

## Fields no REST verb can set

`iterationLimit` and `maxSubtasks` appear in **neither** `createAgentSchema` nor
`updateAgentSchema`, and have no `.tsx` surface anywhere in the app — the DB or the
p49 config-io import are the only paths. Worse, the v1 route docblock
(`src/app/api/v1/agents/route.ts`) documents `iterationLimit (1-10, default 3)`
as if it were accepted; it is **silently stripped**, and real orchestrators run
values above that documented maximum. An orchestrator created over REST therefore
inherits the default and stalls part-way through a delegation round-trip.
