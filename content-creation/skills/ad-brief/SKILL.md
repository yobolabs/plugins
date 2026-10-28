---
name: ad-brief
description: "Use when a source ad or video has been broken down and you must analyse it like a strategist and write the creative brief a remix (or a new ad) will follow: who made it and why, the objective and audience, the strategy and message, themes, the visual system, how it is assembled, what each scene is for, and what made it work. Also use when the user mentions \"brief\", \"creative brief\", \"analyse this ad\", \"what is this ad trying to do\", \"who made this ad\", \"strategy behind the ad\", \"creative review\" or \"review against the brief\". Runs after content-creation:analyze-video and the video reading; feeds content-creation:higgsfield-video."
---

# Ad brief: analyse the source ad, then brief the remix

A remix copies what made the source work and changes what belongs to the old product. Neither is possible
until someone has said, in writing, what the source is trying to achieve and how it does it. This skill turns
the breakdown into that analysis, then into the brief every later step reads (scene purposes, rewrites,
pictures, videos, the creative review).

**Order:** cuts and shots (`analyze-video`) → video reading (beats, camera, people, places, props, on-screen
text, speech) → **this analysis** → the merchant fills the remix part → everything else follows the brief.
The brief is generated, never typed from scratch; the merchant edits it.

## Inputs

- Measured breakdown: exact cuts, shot lengths, still/moving, music tempo, cuts on the beat.
- The reading: per-scene action, camera, characters, locations, props, on-screen text, speech.
- Post facts when the source is a social post: account name and handle, caption, hashtags, date, views/likes.
- Saved notes for this exact ad, if it was remixed before (knowledge base, keyed by the source link).

**How to think while analysing** (watch three times, start from the job, hook and hold, message architecture,
why each visual choice was made, what transfers vs what is category- or brand-bound, specific testable claims):
read `references/how-to-analyse.md` before writing. The sections below are the output; that file is the expertise.

## The analysis (write every section; mark a guess as unverified)

1. **Who made it and why.** Brand, agency, creator/freelancer, UGC, or spec work ("fake campaigns until they
   hire me" = portfolio piece). Evidence: account, caption, logos, end card. Then the **overarching objective**
   in one line (awareness, launch, conversion, retention, portfolio) and who it is for.
2. **Strategy and message.** The single idea; the hook in the first 1–2 s; proof points; the emotion or desire
   it plays on; the call to action (or none).
3. **Themes.** Recurring motifs, tone, the world it lives in.
4. **Visual system.** Product scale in frame, framing and angles, colour palette, light, sets/backgrounds,
   people and hands, typography and on-screen text, graphic devices.
5. **Assembly.** Structure (one story, a reel of one-shot ads, a demo, a talking head…), shot count and lengths,
   pacing, cuts on the beat, transitions, music and sound role, where text appears.
6. **Scene table.** Per scene: time · what it shows · what it is FOR (what the viewer should feel or believe).
7. **What made it work.** The 3–5 things a remix must keep. Name the matching style reference in
   `content-creation:higgsfield-video` `references/styles/` when one fits.

## The brief (analysis + the merchant's remix)

- Brand and products to feature; which product per scene; colours to spread.
- Goal, platform/placement, length, shape.
- **Must keep** (from "what made it work"), **must change** (the old product, places and actions that don't fit
  the new one), **never** (old brand, old packaging parts, the same idea twice…).
- Text on screen (as overlays) and music (keep the source's track or not).

## Rules

- Evidence for every claim: a time, a scene, a frame, the caption. No evidence → "unverified".
- Generic sections only here. A style type's rules live in its style reference; one ad's specifics (its cuts,
  caption box, scene ideas that worked) live in that ad's notes in the knowledge base; one product's specifics
  (shape sentence, packs) in its product notes.
- The creative review at the end checks every finished picture and video against this brief, scene by scene,
  before anything paid is re-made.
