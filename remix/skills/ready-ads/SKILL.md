---
name: ready-ads
description: "Use when a YoboLabs team member makes a new Remix ready ad (a template merchants can remix) or checks saved ones before merchants see them. Also use when the user mentions \"ready ad\", \"make a ready ad\", \"QC ready ads\", \"check the templates\", \"save as template\", \"why is my ready ad held\", \"fix my template\". Default with no ask: QC every ready ad in the live back office and show the pass/fail table. For the team, not developers: Claude drives the Remix Lab and the back office in the browser; the user installs nothing."
---

# Ready ads: make one, QC them

A **ready ad** is an ad a merchant can remix in one tap. The back office calls it a "template"; say "ready ad" to the
team. It is three things: the original Instagram video, its plan (which parts keep the ad's own footage and which are
made again with the merchant's product), and what the merchant must give to finish it.

**Default (no ask):** run **QC** (below) on every ready ad in the live back office and show the pass/fail table.

Write to the user in plain words. No code, no ids unless they ask, no internal names.

## Before anything

1. Search the Remix knowledge base (`remix-context` → `search`) for "product-rules" (the rules behind every check),
   then for the ad's Instagram link or name (earlier notes on the same ad).
   No KB tools in this session → follow the `remix` skill's `references/setup.md` first.
2. Drive the browser yourself with browser-use, as the `remix` skill's `references/lab.md` says; no browser-use in this
   session → use the browser tool the session has, and say which. Say which window and tab you use. The only thing you
   may ask the user for is a sign-in.
3. **Where:** the live Yobo back office (prod), because the Remix Lab saves every run there and that is where the
   team's ready ads are. The only changes this skill makes there are **Save as template** and **Hold** (see *Never*).
4. The back office needs a **staff** sign-in (a YoboLabs staff account, not a merchant one). A merchant account lands on
   the merchant home instead: say so and ask the user to sign in with their staff account.

## Make a ready ad

1. **Pick the ad.** It must be an Instagram reel or post link and 30 s or shorter. A file with no Instagram post, an
   Ad Library cut or a brand-site video cannot become a ready ad: say so and ask for the Instagram post.
2. **Run it in the Remix Lab** with `?ad=<Instagram link>`, the full remix, with a sample product. Follow the `remix`
   skill's lab steps. This is a small paid run: say the number of pictures and video seconds before you press Make.
3. **Look at the result** (frame strip, as in `lab.md` step 7): product real and right size, kept parts free of the old
   product (props too), cuts on the beat. Bad → fix in the lab's Prompt box and run again.
4. **Save it.** Back office → sidebar **Remix runs** (the lab's saved runs) → open this run → **Save as template**. It
   becomes "Waiting for review", which merchants never see. The save keeps yobo's own reading of the Instagram link,
   not the lab's plan, so QC that reading (step 5). "Not read" or "Source video not saved" means yobo has no reading of that Instagram link yet: use
   Templates → **New template**, paste the same Instagram link, **Read the ad (free)**, then save again.
5. **QC it** (below). All checks pass → tell the user it is ready for the remix lead. The lead approves it only after one
   test remix on dev passes (Q11). This skill never presses Approve.
6. The remix lead reviews the first batch each team member makes. Tell the user that once.

## QC

Checklist, how to check each item on the page, and the report format: [`references/checklist.md`](references/checklist.md).
Read it in full before the first QC of a session.

1. Back office → the **Remix** tab bar → **Templates** (path `/backoffice/remix/templates`), List view. List every ready ad
   with its status as the list shows it: Approved, Waiting for review, Not reviewed, On hold, Not usable. Default scope: Approved + Waiting for review. Not reviewed and
   On hold only when the user asks ("check all", "re-check held").
   **The user names one ("the canvas one")** → names repeat: list every row that matches, QC all of them, and say which
   is which by name, status and date.
2. For each one, open its page and run every check in the checklist. Rule checks read the page; look checks need a
   frame strip of the original and of a remix made from it.
3. Write the report (format in the checklist) to a file and show the summary table: one row per ready ad, Pass / Fail
   per check, and one line saying what to fix.
4. Then act, without a second question (the user can say Stop or Change):
   - **Fail** on any check → **Hold** it with the reason (the check number and one plain line).
   - **All pass and it was waiting for review** → list it for the remix lead to approve; say so.
   - **Approved and failing** → Hold does not work on approved ones yet: list it for the remix lead, never try to Hold.
   - A warning (⚠) alone never holds anything; list it in the report.
   - **A recorded exception** (the Remix KB search for this ad's link or name finds a decision by Sean to keep it as is)
     → write "kept by Sean <date>: <what>" in its row, never a fail to act on.
5. Fixing an outdated one is the same as making a new one from its Instagram post (Make, steps 1–5). A fixed reading
   needs a fresh read: old readings are reused per ad.

## Never

- Delete a ready ad or its reading. Hold it instead. A delete is Sean's call.
- Press Approve, Not usable or Universal, anywhere. Approving is the remix lead's step.
- Change anything in the back office other than Save as template and Hold.
- Start a paid run without saying its size first, or more than one per ready ad.
- Message merchants or the team.

## Where things are

| What | Where |
|---|---|
| Rules behind every check | Remix KB: "product-rules" (R22 ready ads only, R23 Instagram link, R24 readiness, R25 local → dev → prod, R28 draft model) |
| Plan this skill follows | Remix KB: "Ready-ad skill — plan" |
| Lab steps | `remix` skill → `references/lab.md` |
| Something the skill cannot do (a check the page does not show) | tell the user in one line and name the remix lead; never work around it |
