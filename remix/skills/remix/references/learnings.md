# Learnings → Remix knowledge base (after every finished remix)

Read after a remix delivers its final video, or after any paid run fails. The Remix KB is team-facing: teammates
and their Claude sessions search it (`remix-context` MCP) before they start a remix, so a lesson that stays in one
chat is a lesson the next run pays for again (Sean 2026-11-04).

## 1. Write one learnings note

No repo access → send the note text to Sean's session or the chief of staff; they file it.
Where (team): `_context/slides/_specs/p131-remix-in-ad-studio/learnings/<YYYY-MM-DD>-<ad-type>-<4-word-topic>.md`
(that spec folder is on the Remix KB allow-list; a file anywhere else never reaches the KB). One note per run or
per sitting; never overwrite an earlier one.

```markdown
---
title: "<ad type> remix — <one-line verdict>"
date: YYYY-MM-DD
run_by: <teammate or session name>
ad_type: <product-hero | people-dialogue | montage | mixed | screens | template reel>
verdict: <shipped | usable draft | failed>
---
## Runs
| # | Ad (link or file) | Product (+ real size) | Mode | Request ids | Billed | Result |
## What worked
## What failed and why (cause, not symptom)
## Rule candidates
- GENERAL: <a rule true for every remix, no brand or product names>
- TYPE <type>: <true only for this ad type>
## Verdict from the person who asked (quote)
```

Rules for the note:
- Ground every claim: request id, file, frame time, a quote. "Looked off" is not a learning; "the tin stood on an
  ironing board for 1.5 s because the still part was one edited frame" is.
- Put the verdict of the person who asked in their words, especially when it is "failed".
- Name the cost: seconds billed and pictures made, so the KB shows which modes are cheap.
- No secrets, keys, customer data or personal phone numbers (the sync skips files that hold them).

## 2. Upload it to the Remix KB

The only writer is the chief-of-staff `kb-sync.py` (upsert, never delete). On a machine that has it and the vault:

```bash
python3 <chief-of-staff>/skills/chief-of-staff/scripts/kb-sync.py run --kb remix --since-hours 3
```

Report `kb: <N uploaded>` in your final message. Check it landed: `remix-context` `search` for the note's title.

No `kb-sync.py` on your machine (most teammates): still write the note, then put its path in your final message
and send it to the chief or Sean's session; the daily 06:17 sync uploads it once the file is in `_context`.
Never upload to a KB by any other route and never write to the KB directly.

## 3. Promote what is general

A GENERAL rule candidate becomes a rule in this skill (`SKILL.md` or the stage reference) and a TYPE candidate goes
into `references/types/<type>.md`, through `dev-workflow:update-references` (bump, commit, push). The note stays in
the KB as the evidence; the rule lives in the skill.
