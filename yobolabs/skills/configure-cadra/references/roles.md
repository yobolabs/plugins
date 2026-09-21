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
`temperature` 0–2, `maxTokens` 1000–500000, `taskTypes` ≤50, `toolIds` (numeric),
`outputSchema` (object | `null`, p81 — see *Structured output*).

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

## Structured output (`outputSchema`)

A product role can pin its final result to a JSON Schema: promote freezes the
role's `outputSchema` into the golden lock, and a spawn of that role returns a
schema-validated object instead of free text.

**Availability: once cadra-web `develop` carries p81** (branch
`feature/p81-role-config-panel`, not yet merged); **not on prod**. An origin
without p81 still takes the key and **drops it silently** — 200/201, nothing
stored. After any write, `cadra role get` and check the field before trusting it.

### Set, change, clear

`outputSchema` is a field on `POST /api/v1/roles` and `PATCH|PUT /api/v1/roles/{uuid}`:

| Send | Effect |
|---|---|
| an object | checked (below), then stored |
| `null` | clears it — free-text output |
| key omitted | unchanged |
| the stored value again | no-op — key order ignored, not re-checked, not rewritten, so a `get` body PUT back as-is succeeds |

```bash
cadra role update <roleUuid> '{"outputSchema": {
  "type": "object",
  "properties": {
    "verdict": { "type": "string", "enum": ["approve", "revise", "reject"] },
    "summary": { "type": "string" },
    "issues":  { "type": "array", "items": { "type": "string" } }
  },
  "required": ["verdict", "summary"]
}}'

cadra role get <roleUuid>    # → "outputSchema": {…}   (null when unset)
```

`cadra role list` **omits** `outputSchema` — read it with `get`.

**Saving does not change what a team spawns.** Spawn runs the golden lock, so the
new schema goes live only when the role is **promoted to golden in the app**
(promote stays app-only, see above).

### Rules, limits and codes

On create/update the root must be an object schema — `"type": "object"` with at
least one entry in `properties`. Checks run in this order; the first failure wins:

| Check | Limit | `error.message` | Also at |
|---|---|---|---|
| root is `type: "object"` | — | `ROLE_OUTPUT_SCHEMA_NOT_OBJECT: root must be an object schema` | |
| root has properties | ≥ 1 | `ROLE_OUTPUT_SCHEMA_EMPTY: add at least one field` | |
| compact JSON, UTF-8 | ≤ 16 KB (16384 B) | `ROLE_OUTPUT_SCHEMA_TOO_LARGE: <n> bytes exceeds 16384` | promote, spawn |
| JSON nesting anywhere (incl. inside `enum`, `default`) | ≤ 64 | `ROLE_OUTPUT_SCHEMA_TOO_DEEP: json nesting <n> exceeds 64` | promote |
| depth along `properties` / `items` | ≤ 8 | `ROLE_OUTPUT_SCHEMA_TOO_DEEP: depth <n> exceeds 8` | promote, spawn |
| declared properties, whole schema | ≤ 256 | `ROLE_OUTPUT_SCHEMA_TOO_MANY_PROPS: <n> fields exceeds 256` | promote, spawn |

A breach is **HTTP 400** and nothing is stored:

```json
{"success": false, "error": {"code": "INTERNAL_ERROR",
  "message": "ROLE_OUTPUT_SCHEMA_TOO_DEEP: depth 9 exceeds 8",
  "details": {"trpcCode": "BAD_REQUEST"}}}
```

**Read `error.message`, never `error.code`** — `code` is `INTERNAL_ERROR` for every
one of these (a quirk of the REST bridge). Split on the first `": "` for the code.

**Core roles are agent-owned.** On a Core role (`isCore: true`, an agent's own
role) a *changed* `outputSchema` — object or `null` — is **403**
`ROLE_CORE_OUTPUT_SCHEMA_FORBIDDEN: a Core role's output schema is owned by its agent`,
before any bounds check. Change the agent's `outputSchema` instead. Sending the
stored value unchanged still passes (the no-op rule).

**Promote re-checks.** Promote runs the runtime bounds against the saved role, with
a looser root rule: any plain JSON object passes (legacy `{}` schemas copied from
agents still promote); an array or scalar root fails with
`ROLE_OUTPUT_SCHEMA_NOT_OBJECT: root must be a JSON object`. A breach is not an HTTP
error — the promotion job fails with that code, no lock is written, and golden does
not move.

**At spawn** cadra-api checks the lock again
(`src/services/agent-runtime/output-schema-bounds.ts`), then the result:

| Result check | Error code |
|---|---|
| validated result ≤ 256 KB | `ROLE_OUTPUT_RESULT_TOO_LARGE` |
| result not JSON / fails schema | `ROLE_OUTPUT_VALIDATION_FAILED` |

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

### Other paths

- **`cadra role export` → `apply`** carries it when the target origin has p81
  (dropped silently where it does not). A legacy `{}` schema fails `create` with
  `ROLE_OUTPUT_SCHEMA_NOT_OBJECT` — the no-op rule covers update only — so set it to
  `null` or a real schema in the file first.
- **Save as Role** on an agent (in the app) still copies the agent's schema onto
  the new role; it is no longer the only writer.
- **Role documents (.md import/export) do not carry it.** Export omits
  `outputSchema` and import never changes it — the frontmatter cannot hold a JSON
  Schema (cadra-web `src/extensions/agents/lib/role-doc.ts`).

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
