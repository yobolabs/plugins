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
