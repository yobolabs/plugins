# Learnings → Remix knowledge base (after every finished remix)

Read after a remix delivers its final video, or after any paid run fails. The Remix KB is team-facing: teammates
and their Claude sessions search it (`remix-context` MCP) before they start a remix, so a lesson that stays in one
chat is a lesson the next run pays for again (Sean 2026-11-04).

## 1. Write one learnings note

Name: `<YYYY-MM-DD>-<ad-type>-<4-word-topic>.md`, unique per run (never reuse a name; never edit an earlier note).
Its KB path is always `slides/_specs/p131-remix-in-ad-studio/learnings/<name>` so all learnings sit together.
Write it in a scratch folder on your machine (users of this plugin have no local context files); it only has to
exist until the upload in § 2.

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

**Teammates (the normal case)**: one call with your own upload key (setup: `references/setup.md` § 2).

```bash
F=<path to the note>; N=$(basename "$F")
curl -sS -X POST "https://app.cadraos.com/api/v1/knowledge-bases/$CADRA_REMIX_KB/documents" \
  -H "Authorization: Bearer $CADRA_REMIX_KB_KEY" \
  -F "file=@$F;type=text/markdown" \
  -F "source_path=slides/_specs/p131-remix-in-ad-studio/learnings/$N" -o /tmp/kb-upload.json -w '%{http_code}\n'
```

- `201`/`200` = uploaded (the document indexes in a minute). `401/403` = key missing, expired or without
  `knowledgeBase:update`; `429` = the shared hourly upload budget, wait for `Retry-After`. Never print the key.
- Check it landed: `remix-context` `search` for the note's title. Report `kb: uploaded <name>` in your final message.

**Sean's machines** (they hold the context repo): write the note into
`_context/slides/_specs/p131-remix-in-ad-studio/learnings/` and run the chief-of-staff `kb-sync.py run --kb remix
--since-hours 3` instead (the sanctioned writer there; upsert, never delete).

Never write to the KB any other way, and never put a key, customer data or a personal number in a note.

## 3. Promote what is general

A GENERAL rule candidate becomes a rule in this skill (`SKILL.md` or the stage reference) and a TYPE candidate goes
into `references/types/<type>.md`, through `dev-workflow:update-references` (bump, commit, push). The note stays in
the KB as the evidence; the rule lives in the skill.
