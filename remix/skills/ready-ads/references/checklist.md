# Ready-ad QC checklist

Back to [SKILL.md](../SKILL.md). One ready ad passes only when **every** check passes. **Q3 comes first**: a ready ad that is not complete fails, whatever else passes. The checks come from the team's
rules (Remix KB "product-rules" R22–R28) and the readiness check the developers run. Write each finding in plain
words; the check number goes in the Hold reason.

## Where each fact is (back office → Templates)

| Fact | Where | Note |
|---|---|---|
| Status, category | page header ("Approved · Food & drink · …"); list status words: Approved · Not reviewed · Waiting for review · On hold | "Not reviewed" = never looked at; "Waiting for review" = saved as template |
| Rights | list row chip "Rights not set" (List view); no chip = no rights warning | not shown on the ready ad's page. Match a row to its page by the row's link (it ends in the ready ad's id), never by name: names repeat |
| Original video | first video on the page; the panel may say "Not made yet" when only the source file exists: use the Source line for length | |
| Source, length | page header ("Instagram reel · 8.4 s" or "Upload · 8.7 s") + Configuration → Source | an "Upload" can still have its Instagram link: an uploaded copy of an Instagram ad is fine |
| Instagram link | "open the ad" under Original | missing = no link. A `/reels/<code>/` link opens a feed: the **first** video in it is the post |
| Kept vs remade | Assets | Assets may list "Kept as is" parts. Time not in any Assets line is also the ad's own kept footage. The header shows one chip per shot: never count chips to judge parts |
| Parts | Assets: `Part N · start–end s · Remade · 1 picture / Remade · video · N s of new video` | |
| Cuts | Configuration → Cuts | |
| Video model | Configuration → Make | absent when Settings says "Not captured yet" (saved before settings were recorded) |
| Product prompt | "Product-scene prompt" block | **collapsed**: read it with `textContent` or open the block first; `innerText` shows only the heading |

Read numbers from page text, not screenshots. The "Needs storyboards … No check ran" banner is not part of QC: ignore it.

### Frames (Q8, Q11)

The page video has no CORS header, so drawing it on a canvas throws a security error. Instead, in the page:
`fetch(video.currentSrc)` → `blob()` → `URL.createObjectURL` → a new `<video muted>` with that src → seek to each time →
`drawImage` at the video's own `videoWidth × videoHeight` (not the small on-page size) → `toDataURL('image/jpeg')` →
save → look at it. The Original is the first video on the page. A small original (under 400 px wide) cannot show small print: add ⚠ "small source" to Q8. The fetch fails too → write "could not read frames" and treat the check as not done, never as Pass.

## The checks

| # | Check | Pass when | How to check | On fail |
|---|---|---|---|---|
| Q1 | **Instagram link** | "open the ad" goes to an Instagram reel or post, and that post's video is the same ad as the Original: same opening shot **and** the same product in the product shots | open the link. `/reels/<code>/` → the first video in the feed is the post. Compare its first shot and a product shot near the end with the Original (Instagram shows no length: skip length). Only a login wall → "link ok, cut not compared" (pass). Cannot tell → ⚠ "needs a human look" | no link → Hold "Q1 no Instagram post". Same idea but another product or cut → Hold "Q1 Instagram post is a different cut" (approved → list for the remix lead). Fix = Make from the right post |
| Q2 | **Length** | the Source line says 30 s or less | Configuration → Source | Hold: "Q2 longer than 30 s" |
| Q3 | **Template is complete** | the page shows the full template: Configuration has its Settings (Sound, Make, Look), "What the agent asks the merchant" lists its questions, and Assets lists the parts. A merchant run follows this template and never re-plans, so anything missing breaks the video | "Not captured yet" under Settings or under the questions → **FAIL**. "No stored parts" → FAIL. Plan version needs the readiness report | Hold: "Q3 template not complete: <what is missing>". Approved → list for the remix lead. Fix = remake it so the full template is saved |
| Q4 | **Plan covers the ad** | every part edge sits on one of the **Cuts** (within 0.05 s), parts do not overlap, and the last part ends at or before the ad's length. Time before Part 1, between parts or after the last part is kept footage: fine when the header shows a "kept" chip | Assets vs Cuts vs Source length. A gap with no "kept" chip, or a hidden gap the page cannot show → readiness report | Hold: "Q4 part N cuts mid-shot at N s" or "Q4 parts overlap" |
| Q5 | **Video parts can be made** | every "Remade · video" part has 4–15 s of new video; its own length is 30 s or less | Assets lines | Hold: "Q5 part N too short / too long for the video model" |
| Q6 | **Stored clips match the plan** | readiness report has no `stored_parts_mismatch` | readiness report | Hold: "Q6 stored clips do not match the plan" |
| Q7 | **Product prompt** | the prompt contains `@Video1`; contains `@Image1 is <product>` (the literal `<product>` slot is correct: the merchant's product fills it); says the product photo is shown from several sides; has no word "template" or "preset" | Configuration → product prompt text | Missing `@Video1` or `@Image1 is <…>` → Hold "Q7 prompt does not name the ad clip / the product". Only the "several sides" line missing → note it, no hold (developers rewrite it) |
| Q8 | **Kept parts are clean** | no frame of the kept footage shows the old product, its logo, its packaging or its brand, including on posters, screens, clothes and flyers | frames (method above) at 2–3 points inside each kept stretch. No kept footage → N/A | Hold: "Q8 old product shows in kept footage at N s" |
| Q9 | **Fits its category** | the category in the page header is what the Original shows (food & drink shows food or drink, and so on), the category fits the product itself (a paint kit is Home, not Retail; when two fit, say both as ⚠), and the product name is a whole name, not cut with "…" | page header + Original | Hold: "Q9 wrong category" or "Q9 product name cut" |
| Q10 | **Rights** | no licensed characters, artwork or another brand's logo on every frame. The creator's own posters, text and burned-in captions are not a rights problem (Q8 covers old-product text). "Rights not set" is a **warning**, not a fail: say it, staff set rights | list row chip + frames | licensed art / brand on every frame → Not usable "Q10 licensed art or brand" |
| Q11 | **A real remix works** | one remix from this ready ad on dev (the merchant gallery) finishes: cuts on the ad's beat, the sample product shown at real size, no broken or frozen part | make one (small paid dev run; say its size first), frame strip of the result | Hold: "Q11 remix failed: <what you saw>" |
| Q12 | **Fits the draft video model** | every video part is 4–15 s of new video; Make shows Seedance 2.0 when Settings are recorded | Assets; Configuration → Make. No Make line → write "model not shown" (warning) | under 4 s or over 15 s → Hold "Q12 part N does not fit the draft model". A part showing more than 9 pictures → ⚠ "part N has more than 9 pictures: the draft will drop some" (warning only, never a Hold) |
| Q13 | **No bare links** | no raw URL (http, https, presigned or storage link) appears in the page copy, the chat text or the fallback line; each link sits behind a button or short link text, and media goes as media | page copy and the chat preview; remix journey text | Fix the copy: put the link behind a button or in words. Hold: "Q13 bare link on page or chat" |

Q11 runs only when Q1–Q10 and Q12 pass (a paid run on a failing ready ad is wasted), and only in Make or when the user asks: a QC of many ready ads writes "— not run" for Q11.

## What the page cannot show (yet)

Q3 (plan version), Q4 hidden gaps, Q6 (stored clips) and the reading's link key (the reading must be stored under the Instagram code,
or a merchant who pastes the link never finds the ready ad) come from the developers' readiness report. Until the back
office shows them:

- Write "needs readiness report" in those cells, never Pass.
- Tell the user once: the remix lead runs the readiness report; the result belongs on the ready ad's page.

## Report

Save one file per QC run: `ready-ads-QC-<date>.md` in the user's working folder. Show the summary table in chat.

```
# Ready-ad QC · <live or dev> · <date> · <N> checked

| Ready ad | Status | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Q11 | Q12 | Q13 | Result | Fix |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| iced matcha latte (food & drink) | approved | ✅ | ✅ | report | ✅ | ✅ | report | ✅ | ✅ | ✅ | ✅ | — | ✅ | PASS* | — |
| paint-by-numbers (home) | held | ❌ | ✅ | … | | | | | | | | | | FAIL | find its Instagram post, make again |

✅ pass · ❌ fail · ⚠ warning · N/A · report = needs readiness report · — = not run (an earlier check failed)
PASS* = passes everything the page shows; waiting for the readiness report.

## Actions taken
- Held: <name> — <reason>
- Left for you to approve: <name>
- For the remix lead (approved but failing): <name> — <reason>
```
