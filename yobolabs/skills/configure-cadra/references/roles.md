# Roles

A **role** is a reusable configuration for an agent — identity, method
(system instruction), model settings, and a capability preset. Two distinct
things share the table, and confusing them is the main source of "why isn't my
role showing up".

| | Starter config | Product role |
|---|---|---|
| `agentType` | `SPECIALIST` / `ORCHESTRATOR` | **`ROLE`** |
| What it does | pre-fills the create-agent form | the unit a team **spawns at runtime** |
| Appears in the role library / spawn menu | ❌ no | ✅ yes |
| Origin | "Save as role" from an existing agent | authored deliberately |

If you want a role a team can spawn, it **must** be `"agentType": "ROLE"`.
Everything else is a starter config, no matter what it is called.

## Scope

- **Platform roles** — `orgId` is null. Visible to every org, writable only from
  backoffice. Your org key can read them, not edit them.
- **Org roles** — scoped to the key's organization. This is what you author.

`list --source platform|org|all` filters; `all` is the default.

## Create / update

```bash
cadra role create '{
  "name": "Researcher",
  "agentType": "ROLE",
  "description": "Finds and cites primary sources",
  "icon": "search",
  "systemInstruction": "<role>…</role><method>…</method>",
  "modelProvider": "google",
  "modelId": "gemini-3-flash-preview",
  "temperature": 0.3,
  "maxTokens": 8192,
  "taskTypes": ["research", "citation"]
}'
```

`create` accepts: `name` (required, ≤200), `description` ≤2000, `icon` ≤100,
`agentType`, `systemInstruction` ≤50000, `modelProvider`, `modelId`,
`temperature` 0–2, `maxTokens` 1000–500000, `taskTypes` ≤50, `toolIds` (numeric).

`update` accepts everything above **plus** the portable capability presets, which
are the ones you should actually use:

| Field | Type | Note |
|---|---|---|
| `toolUuids` | string[] ≤200 | stable uuids — portable across environments |
| `skillUuids` | string[] ≤200 | may carry a `@version` suffix; bare slug = unpinned |
| `knowledgeBaseUuids` | string[] ≤200 | |
| `changeNotes` | string ≤2000 | recorded on the version this save mints |

**Prefer the `*Uuids` presets over legacy numeric `toolIds`.** Numeric ids are
per-environment; a role exported from dev and applied to prod with `toolIds` will
point at the wrong tools or nothing at all. Because they are update-only, the
portable pattern is create-then-update:

```bash
cadra role apply @roles/researcher.json   # create (or update) by name
cadra role update <uuid> '{"toolUuids":["…","…"],"changeNotes":"grant search tools"}'
```

## Using a role

```bash
cadra agent create '{"name":"Researcher #2","roleUuid":"<role-uuid>"}'
```

The role's settings pre-fill the new agent. The agent is a **copy** from that
point on — later role edits do not propagate to agents already created from it.

## Versioning and golden locks — app-only, by design

A role's method text is versioned: each canonical change to the system
instruction mints a new version, and reordering keys or editing whitespace does
**not** (a content hash gates it). On top of that sit *golden locks* — a frozen,
promoted version that spawning binds to — with promote, rollback, drift check and
routing-confusion checks.

**This helper deliberately does not expose promote / rollback / lock.** Those are
governance actions with a human gate; run them in the app. Over REST you get
CRUD, which is what belongs in git.

Two consequences to know:

- **Editing `systemInstruction` mints a draft version, it does not change what a
  team spawns.** Spawning uses the promoted golden version until someone promotes
  the new one. A role edit that "has no effect" is usually this.
- Pass `changeNotes` on updates that change the method — it is the only
  human-readable label the version history gets.

## Structured output (`outputSchema`) — NOT settable over REST

A product role can pin its final result to a JSON Schema: the column
`agent_roles.output_schema` exists, promote freezes it into the golden lock, and a
spawn of that role returns a schema-validated object instead of free text.

**The public API cannot write it.** `POST /api/v1/roles` and `PATCH /api/v1/roles/{id}`
accept an `outputSchema` key and **drop it without an error** — you get a 200/201 and
the stored schema is unchanged. Verified on cadra-web `develop` and `main` (2026-09-21):

| Layer | Evidence |
|---|---|
| Zod input strips unknown keys | `src/extensions/agents/roles-schemas.ts:20` (create), `:37` (update) — no `outputSchema` |
| Repository never writes it | `src/extensions/agents/roles-repository.ts:247` (`create`), `:283` (`update`) |
| OpenAPI does not list it | `src/app/api/v1/docs/route.ts:3756` (`RoleCreate`), `:3782` (`RoleUpdate`) |
| Copilot `configure_role` | `src/app/api/v1/internal/copilot-tools/configure_role/route.ts:64` — no field |

Do not send `outputSchema` to a role endpoint and treat the 200 as success.

### The path that works today

The only writer is **create-from-agent**, which copies the source agent's schema
onto a new product role (`roles-repository.ts:452`). Agents *do* accept
`outputSchema` over REST, so the path is REST for the schema, then the app:

1. Put the schema on a source agent (`PUT /api/v1/agents/{id}`):

```bash
cadra agent update <agentUuid> '{"outputSchema": {
  "type": "object",
  "properties": {
    "verdict":    { "type": "string", "enum": ["approve", "revise", "reject"] },
    "summary":    { "type": "string" },
    "issues":     { "type": "array", "items": { "type": "string" } }
  },
  "required": ["verdict", "summary"]
}}'
```

2. In the app: open that agent → **Save as Role**. That calls
   `agentRoles.createFromAgent` (tRPC only, no REST route), which creates an
   `agentType: "ROLE"` role carrying the schema.
3. **Promote the role to golden in the app.** Spawn always runs the current golden
   lock; promote reads the role row's schema into the lock
   (cadra-web `src/extensions/agents/promote-job.ts:390`). Until then the schema is not live.
4. Read it back:

```bash
cadra role get <roleUuid>    # → "outputSchema": {…}   (null when unset)
```

`cadra role list` does **not** return `outputSchema` — use `get`.

To **change** a role's schema there is no edit path: change the agent's schema,
**Save as Role** again (a new role), promote it, and point the team at it.

### Runtime limits (cadra-api `src/services/agent-runtime/output-schema-bounds.ts`)

Checked when a spawn reads the lock, **not** at save or promote. An oversized
schema promotes cleanly, then every spawn of that role fails with the code below.

| Bound | Limit | Error code |
|---|---|---|
| serialized schema | ≤ 16 KB | `ROLE_OUTPUT_SCHEMA_TOO_LARGE` |
| nesting depth | ≤ 8 | `ROLE_OUTPUT_SCHEMA_TOO_DEEP` |
| declared properties | ≤ 256 | `ROLE_OUTPUT_SCHEMA_TOO_MANY_PROPS` |
| validated result | ≤ 256 KB | `ROLE_OUTPUT_RESULT_TOO_LARGE` |
| result not JSON / fails schema | — | `ROLE_OUTPUT_VALIDATION_FAILED` |

The result check enforces `type`, `enum`, `required`, `properties` and array
`items`. Other keywords (`additionalProperties`, `pattern`, `minLength` …) reach the
model but are not re-checked on the result.

**Do not fall back to a per-call schema.** A parent's `handoff_to_agent` call can
carry its own `outputSchema`, but that schema is unlocked, and an unlocked schema
rejects the **whole handoff** with `ROLE_OUTPUT_UNLOCKED_SCHEMA_REJECTED` unless a
gate flag is on. No production code sets the flag
(cadra-api `src/services/tool-executor/meta-tools.ts:2346`), so the rejection happens even
when the role's lock carries a schema. The locked role schema is the only
structured-result path for a spawn.

### Other paths that do not carry it

- **`cadra role export` → `apply`.** `export <id>` includes `outputSchema`; `apply`
  sends it; create/update drop it. The copy in the target environment has none.
- **Role documents (.md import/export).** The frontmatter parser takes scalars,
  inline arrays and block maps of scalars only (cadra-web `src/extensions/agents/lib/role-doc.ts`).
  A JSON Schema cannot ride in it.

## Core roles (private, per-agent)

An agent may own a private "Core" role — its own hands — marked by an owner
reference. A Core role is excluded from the shared library and cannot be attached
to any other agent; deleting the agent deletes it. You will see these in raw
listings; do not try to reuse or reassign one.

## Gotchas

- `agentType: "SPECIALIST"` on something you intended to be spawnable → it never
  appears in the spawn menu. This is the single most common role bug.
- Platform roles are read-only to org keys — a 403 on update usually means you
  targeted a platform role.
- Roles are keyed by name for `apply`; two roles with the same name in one org
  make `apply` ambiguous and it will refuse rather than guess.
- A role can reference a capability that does not exist in the target
  environment. Nothing fails at save time — it fails at spawn. Verify uuids
  against the target with `cadra tool find` / `cadra skill find` before applying
  to a new environment.
