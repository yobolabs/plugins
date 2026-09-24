---
name: jev
description: Use when something needs to be CLASSIFIED or DECIDED from text — a typed yes/no, pick-one-bucket, or position-on-a-scale answer — and you would otherwise burn an LLM turn (or a subagent) to make the call. Calls Jev, TypeSafe AI's decision-only model, via the `jev` CLI: one call, all questions, ~300ms, typed JSON back. Also use when the user says "/jev", "jev", "ask jev", "classify", "decide", "which bucket", "is this X or Y", "route this", "triage", "label these", "sort these into", or when an agent fleet needs a cheap typed decision in a loop (triage many Jira cards, flag escalations, map tasks to goals).
---

# /jev — typed decisions from Jev

**Jev** is TypeSafe AI's System One model. It writes no text. You send a **state** (the thing
to judge) and typed **questions**; it returns one typed answer per question in one pass.
Input tokens only ($0.042/M), p50 ~340ms. Same vendor and contract as msg-api's live inbound
classifier (`msg-api/src/services/typesafe.client.ts`).

## Run it

```bash
JEV="${CLAUDE_PLUGIN_ROOT}/bin/jev"; [ -x "$JEV" ] || JEV=$(command -v jev)

"$JEV" --state "TEXT" \
  --bool  needs_human "The customer needs a human member of staff" \
  --enum  intent "What does the customer want?" "billing: payment, refund, invoice|order: place or track an order|other" \
  --score urgency "How time-critical is this?" "Level 0: can wait days|Level 1: today|Level 2: blocked now"
```

State comes from `--state`, `--state-file PATH`, or stdin. Bigger question sets go in a
file: `--questions q.json` (`{id: {type, question, options|levels}}` or a list with `id`).

Output (stdout):

```json
{"model":"jev-1.13.0","requested":"jev-latest","latency_ms":312,"input_tokens":88,
 "answers":{"needs_human":{"type":"bool","value":true,"p":0.93,"threshold":0.5},
            "intent":{"type":"enum","value":"billing","confidence":0.81},
            "urgency":{"type":"score","value":1.7,"level":2,"level_label":"Level 2: blocked now","confidence":0.6}}}
```

Branch on `value`. Treat `p` / `confidence` as a rank, not odds.

| Flag | Does |
|---|---|
| `--preview` | ask `jev-preview` instead of `jev-latest` |
| `--threshold 0.4` | bool cut-off for `value` (default 0.5) |
| `--json-state` | send the state as a JSON object, not a string |
| `--no-strip` | keep `[Current date: …]` / `<system-reminder>` blocks (stripped by default) |
| `--dry-run` | print the request body; no key, no call |
| `--mock` / `JEV_MOCK=1` | fake answers, no network — for testing a skill or script |
| `--explain-traps` | print the traps below to stderr |
| `--raw`, `--compact` | include Jev's raw response · one-line JSON |

**Fails loud.** Exit 0 ok · 1 API/response failure (HTTP code + body on stderr) · 2 bad input ·
3 no key. Never read an empty stdout as "no". Mock output carries `"mock": true`.

## API key

Read from `JEV_API_KEY`, then `TYPESAFE_API_KEY`, then `~/.config/jev/api_key` (chmod 600).
Put it in ONE of: `export JEV_API_KEY=…` in `~/.zshrc`, or the key file. Get a **personal**
key from TypeSafe — never copy msg-api's `TYPESAFE_API_KEY` from Vercel/Coolify. Never print it.

## Jev or an LLM turn?

| Use Jev | Use an LLM turn |
|---|---|
| Answer is a label, yes/no, or level | Answer is prose, a plan, a summary |
| Same question over many items (loop) | One-off judgement needing tools or file reads |
| You can list every option up front | Options are open-ended |
| Speed/cost matters (fleet, hooks, cron) | Needs dates, counts, arithmetic, lookups |

Do the computable parts in code first (dates, counts, regex, lookups); ask Jev only the
judgement left over.

## Phrasing state and questions

- **State = only the thing being judged.** Label speakers (`customer:`, `staff:`). Cut
  boilerplate, IDs and your own instructions — Jev reads the state literally.
- **Bool = a declarative statement**, not a question: "The customer needs a human", and say
  when it is true AND false. `msg-api/src/services/classifier.ts` `QUESTIONS` is the model.
- **Enum options carry a description.** `bug: something that used to work is broken` beats
  `bug`. Add an `other` bucket so it is never forced into a wrong one.
- **Score levels are ordered, 2–10**, each described. `value` can land between levels.
- **Batch every question into ONE call.** The tenth question is nearly free. Never call twice
  for the same state.

## Traps

1. Only `jev-latest` / `jev-preview` are requestable. A pinned name (`jev-1.13.0`) = `400
   Unknown model`. The served version comes back in `model`; a threshold is only valid for
   the version it was measured on.
2. `p` and `confidence` are **ranks, not probabilities** (msg-api saw 3.8/10.5/11.8/0/100…%
   real rates across bands). Never show as a percentage, multiply by cost, or average.
3. Injected scaffolding in the state gets judged as the author's words — it once labelled 34%
   of msg-api traffic "fake". The CLI strips known blocks; clean the rest yourself.
4. The state is **not injection-sandboxed**. When the answer drives an action, phrase it so YES
   can only ADD a protective step (escalate, flag, ask Sean) — never skip one.
5. Always a valid option ≠ the right option. For anything irreversible, confirm before acting.
6. No production customer data in ad-hoc runs — synthetic or internal text only.

## Worked examples

**1. Triage a Jira card → board + type** (Sean works CAD, YMS, AVA)

```bash
"$JEV" --state "Title: Avatar replies twice to the same WhatsApp message
Body: Since yesterday the assistant sends each reply two times in group chats." \
  --enum board "Which board owns this card?" \
    "CAD: Cadra agent platform, agents, workflows, cadra-web/api|YMS: Yobo merchant app, orders, campaigns, CRM inbox|AVA: Avatar personal WhatsApp assistant, avatar-host/web|other: none of these" \
  --enum kind "What kind of work is this?" \
    "bug: something that worked is broken|feature: new capability|chore: upkeep, config, docs"
```
→ `board.value` = `AVA`, `kind.value` = `bug`. Loop over cards: one call per card, both questions in it.

**2. Is this inbound message an escalation?** (the msg-api question, synthetic text)

```bash
printf 'customer: this is the third time I ask, the refund never arrived\nassistant: I can check that for you\ncustomer: no, get me a real person' |
"$JEV" --threshold 0.4 \
  --bool needs_human "The customer needs a human member of staff. True when they ask for a person, repeat an unresolved problem, dispute money or complain about the bot. False when an assistant can still help." \
  --score urgency "How time-critical is this?" "Level 0: can wait days|Level 1: wants an answer today|Level 2: blocked or angry right now"
```
0.4 is msg-api's measured knee (94.7% precision) — valid only for that question on `jev-1.13.0`.
A YES here may only ADD a human, never remove one.

**3. Which goal does this task serve?**

```bash
"$JEV" --state "Task: add a retry with backoff to the Xero invoice sync cron" \
  --enum goal "Which goal does this task serve?" \
    "revenue: ships or sells product|reliability: keeps existing systems up and correct|cost: lowers spend|admin: finance, legal, paperwork|none: serves no listed goal" \
  --bool worth_doing "This task clearly serves one of the goals above"
```
→ `goal.value` = `reliability`. Route `none` / `worth_doing=false` to Sean, not to the bin.

## Deeper reference

- `core:jev-classifier` skill — building a production Jev gate (breaker, drift alarm, threshold sweeps).
- Wiki: `/Volumes/HD/code/monorepo/_context/_general/_wiki/jev-classifier/_index.md`.
- CLI source: `tools/bin/jev` (stdlib python3; `jev --help`).

**Source of truth is `tools/skills/jev`** (`/Volumes/HD/code/ai/plugins/tools/skills/jev/SKILL.md` +
`tools/bin/jev`). This copy lives in `yobolabs` for the dev team; keep both in sync by hand.
