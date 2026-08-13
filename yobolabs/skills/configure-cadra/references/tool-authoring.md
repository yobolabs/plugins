# Authoring a CadraOS tool

A tool is what lets an agent do something outside the model. Three
`implementation` kinds; pick by how the capability is reached.

| `implementation` | Reached by | Use for |
|---|---|---|
| `API` | direct HTTP call the runtime makes | REST endpoints you control or consume |
| `MCP` | an MCP server (stdio / HTTP / websocket) | an existing MCP toolset |
| `WEBHOOK` | fire-and-forget POST | notifications, triggers with no useful response |

`category` is `INTERNAL` (Cadra's own surfaces), `EXTERNAL` (third-party), or
`DATA` (reads a datastore). It drives grouping and some policy — set it honestly.

## Single-endpoint API tool

The simplest and most common shape:

```json
{
  "name": "Get Customer",
  "description": "Fetch one customer record by id",
  "implementation": "API",
  "category": "EXTERNAL",
  "endpoint": "https://api.example.com/customers/{id}",
  "method": "GET",
  "schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "description": "Customer uuid" }
    },
    "required": ["id"]
  },
  "agentInstructions": "Use to fetch ONE customer by id. Never call it to list customers. If it 404s, report that the customer does not exist — do not guess.",
  "authCredentialId": 4
}
```

- `schema` is the **JSON Schema the LLM fills in**. Every property needs a
  `description` — that text is the only thing the model sees explaining the
  parameter. Mark `required` accurately; optional-everything schemas produce
  empty calls.
- `agentInstructions` is where call-time policy lives (when to call, when not to,
  what to do on failure). Keep it out of the agent's system instruction so it
  travels with the tool.
- `authCredentialId` points at a stored credential. **Never inline a key** into
  `endpoint` or `headers`.

## Multi-endpoint API tool

One tool, several operations — the agent picks the endpoint by `name`:

```json
{
  "name": "Customers",
  "implementation": "API",
  "endpoints": [
    {
      "id": "get-customer",
      "name": "getCustomer",
      "method": "GET",
      "path": "https://api.example.com/customers/{id}",
      "description": "Fetch one customer by id",
      "parameters": { "type": "object", "properties": { "id": {"type":"string"} }, "required": ["id"] }
    },
    {
      "id": "create-customer",
      "name": "createCustomer",
      "method": "POST",
      "path": "https://api.example.com/customers",
      "requestBody": {
        "type": "object",
        "properties": { "email": {"type":"string"}, "name": {"type":"string"} },
        "required": ["email"]
      },
      "headers": { "X-Source": "cadra" }
    }
  ]
}
```

Per-endpoint fields: `id` (stable, required), `name` (what the model calls,
≤100), `method`, `path`, `description` (≤500), `parameters` (path/query JSON
Schema), `requestBody` (body JSON Schema), `headers`, `viewResult`.

**`id` is a stable key — do not renumber it.** Changing it detaches history and
any binding that references it.

## MCP tool

```json
{
  "name": "Filesystem MCP",
  "implementation": "MCP",
  "mcpConfig": {
    "transport": "STDIO",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/data"],
    "envVars": { "LOG_LEVEL": "info" }
  }
}
```

`transport` is `STDIO | HTTP | WEBSOCKET`. **`STDIO` requires `command`;
`HTTP`/`WEBSOCKET` require `serverUrl`** — the validator rejects the mismatch.
`availableTools` optionally pins which of the server's tools are exposed.

## Making results clickable — `viewPath`

`viewPath` turns ids in a tool result into links into the portal. It must be
root-relative and contain **exactly one** `{uuid}` or `{id}` placeholder:

```json
{ "viewPath": "/customers/{uuid}" }
```

If the response nests the entity, tell the enricher where to look with the
endpoint's `viewResult` (paths are relative to the unwrapped `data`):

```json
{
  "viewResult": {
    "collectionPath": "items",      // the array in a list response; omit for a single entity
    "entityPath": "",               // the entity within each item; empty = the item itself
    "when": { "field": "type", "in": ["customer"] }
  }
}
```

Set `viewResult.enabled: false` to opt one endpoint out.

## Testing

```bash
cadra tool create @tools/get-customer.json
cadra tool find "Get Customer"        # → id
cadra agent update <agentId> '{"toolIds":[<toolId>, …]}'   # arrays REPLACE
```

Then run the agent against a real case and read the execution. A tool that
"doesn't get called" is almost always a thin `description`/`agentInstructions`
problem, not a wiring problem.

## Gotchas

- **`endpoint` is effectively frozen once agents depend on it.** Repointing a
  live tool's URL changes behaviour for every agent holding it, with no version
  boundary. Create a new tool and migrate instead.
- **Capability arrays replace.** `agent update {"toolIds":[…]}` drops any tool
  not in the list.
- **`isGlobal` / `isEnabled` / `targetOrgId` are backoffice-only** — an ordinary
  org key cannot set them, and trying returns 403.
- **`isActive: false` hides the tool from agents** without deleting it; prefer it
  over `delete` while debugging.
- Deleting a tool that agents reference leaves those agents with a dangling
  grant. Detach first.
