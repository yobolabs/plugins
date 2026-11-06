# Learnings → Remix knowledge base (after every finished remix)

Read after a remix delivers its final video, or after any paid run fails. The Remix KB is team-facing: teammates
and their Claude sessions search it (`remix-context` MCP) before they start a remix, so a lesson that stays in one
chat is a lesson the next run pays for again (Sean 2026-11-04).

- **Every finished remix uploads its learnings to the Remix knowledge base** (Sean 2026-11-04: "because it's run by
  internal users … after a remix completes a video, it needs to upload the learnings up to the remix knowledge base").
  Finished = a final video delivered, or a paid run that failed. Same turn, before you report done: write one
  learnings note and sync it (sections below: where, format, how to upload, what goes to the skill).
  Never leave a paid run's lesson only in chat. Read the KB first (`remix-context` MCP: `search`, then `read_document`)
  before any remix, so the team's past learnings are applied.

## 1. Write one learnings note

Name: `<YYYY-MM-DD>-<ad-type>-<4-word-topic>.md`, unique per run (never reuse a name; never edit an earlier note).
Its KB path is always `slides/_specs/p131-remix-in-ad-studio/learnings/<name>` so all learnings sit together.
Write it as text in the chat (users of this plugin have no local context files and install nothing); § 2 says how
it gets into the KB.

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

**Teammates (the normal case) — nothing to install:** put the note into the lab's **Share learnings** box (title +
text) and press **Save to the Remix knowledge base** — you drive it, like the rest of the lab. The lab's server
uploads it to the Remix KB under `slides/_specs/p131-remix-in-ad-studio/learnings/<date>-<title>-<id>.md` and the box
answers "Saved … as <name>". Never upload it any other way and never ask the user for a key.
Check it landed: `remix-context` `search` for the note's title.

**Sean's machines, only when the session's working directory IS the monorepo context repo** (`_context/` present): write the note into
`_context/slides/_specs/p131-remix-in-ad-studio/learnings/` and run the chief-of-staff `kb-sync.py run --kb remix
--since-hours 3` instead (the sanctioned writer there; upsert, never delete).
Any other working directory (an Obsidian vault, a home folder, a teammate's machine) → use the lab's Share learnings box, even on Sean's Mac.

Never write to the KB any other way, and never put a key, customer data or a personal number in a note.

## 3. Promote what is general

A GENERAL rule candidate becomes a rule in this skill (`SKILL.md` or the stage reference) and a TYPE candidate goes
into `references/types/<type>.md`, through `dev-workflow:update-references` (bump, commit, push). The note stays in
the KB as the evidence; the rule lives in the skill.
