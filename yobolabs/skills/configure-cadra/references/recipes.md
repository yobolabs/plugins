# Recipes

## Definitions in git (the intended team workflow)

Keep one JSON file per record. `apply` upserts by name, so the same tree applies
to local, dev, and prod.

```
cadra-config/
  agents/    drafting-agent.json  research-agent.json
  roles/     researcher.json
  skills/    summarize-thread.json
  tools/     get-customer.json
```

```bash
cadra tool  apply @cadra-config/tools/      # tools first — agents reference them
cadra skill apply @cadra-config/skills/
cadra role  apply @cadra-config/roles/
cadra agent apply @cadra-config/agents/
```

Order matters: a thing must exist before something references it. Tools and
skills → roles → agents → teams → boards.

Review before applying:

```bash
cadra agent apply @cadra-config/agents/ --dry-run
```

## Seeding a new environment from an existing one

```bash
# source
export CADRA_API_URL=http://localhost:3000 CADRA_BUILDER_API_KEY=$LOCAL_KEY
cadra tool  export --out /tmp/tools.json
cadra agent export --out /tmp/agents.json

# target
export CADRA_API_URL=https://<cadra-web-host> CADRA_BUILDER_API_KEY=$DEV_KEY
cadra tool  apply @/tmp/tools.json
cadra agent apply @/tmp/agents.json
```

**Numeric ids do not survive the hop.** `skillIds` / `toolIds` /
`connectorIds` / `guardrailProfileIds` are per-environment. Strip them from the
export, apply, then re-resolve in the target:

```bash
cadra tool find "Get Customer"      # → the target's id
cadra agent update <agentId> '{"toolIds":[<targetId>]}'
```

Roles avoid this entirely if you use `toolUuids` / `skillUuids` /
`knowledgeBaseUuids` instead — see `roles.md`.

## Renaming

`apply` keys on name, so renaming in the file **creates a second record** rather
than renaming the first. Rename through the id:

```bash
cadra agent find "Old Name"
cadra agent update <id> '{"name":"New Name"}'
```

…then update the filename and the `name` in the file to match.

## Auditing what exists

```bash
cadra agent list --limit 100 | jq '[.items[] | {name, visibility, modelId}]'
cadra tool  list --isActive false | jq '[.items[].name]'      # disabled tools
cadra agent tools <id>                                        # what one agent can call
```

List payload shapes differ per entity (`items`, `configs`, a bare array). `find`
and `apply` normalize this; raw `list` output does not.

## Using this from Codex or a plain terminal

The helper has no Claude-specific dependency. Point at the checked-out path:

```bash
# <plugin-root> = this plugin's installed directory. Inside Claude Code that is
# ${CLAUDE_PLUGIN_ROOT}; elsewhere, resolve it once and hardcode nothing else.
cadra(){ node "<plugin-root>/skills/configure-cadra/scripts/cadra.mjs" "$@"; }
export CADRA_API_URL=https://<cadra-web-host>     # or http://localhost:3000
export CADRA_BUILDER_API_KEY=<api-key>
cadra ping
```

For Codex, put that function plus a pointer to this skill's `SKILL.md` and
`entities.md` in the repo's `AGENTS.md`, so the model has the field contracts
without re-deriving them.

## CI / scripted use

```bash
set -euo pipefail
cadra agent apply @cadra-config/agents/ --quiet
```

Every command exits non-zero on failure, prints the server's validation
`details` on a 400, and writes progress to stderr — so stdout stays clean JSON
for `jq`.

## Safety

- `delete` is permanent. `export` first, or set `isActive: false` instead.
- A key is scoped to one org. Double-check `CADRA_API_URL` and which key is
  exported before an `apply` — the same command against prod is not a drill.
- `--dry-run` prints the exact request for every write in the batch.
