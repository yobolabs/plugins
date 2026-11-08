---
name: remix
description: "Use when working on Ad Studio Remix (spec p131): remaking an existing video ad (Ad Library ad, YouTube/IG/TikTok link or upload) for a merchant's own business, in slides, yobo, msg-api or the Cadra agent and functions, on the web or on WhatsApp. Covers the fixed pipeline, the brief, storyboards, the AI review gate, human approval, video parts, join with the ad's own music, export and post. Also use when the user mentions \"remix\", \"remix video\", \"storyboard\", \"storyboard review\", \"line drawing\", \"brief\", \"Use these\", \"go:yes\", \"needs:use\", \"join\", \"remix stuck\", \"remix journey\", or \"remix_make\". Invoked with or without an ad link: first-time setup if needed (Remix KB MCP), then open the team Remix Lab in the browser with the ad loaded, then follow the pipeline below."
---

# Remix (p131)

Remix = take an existing video ad (or a script) and make something NEW for THIS merchant. It is the main entry of Ad
Studio video; general Ad Studio video, Higgsfield routes and the editor stay in `yobo:ad-studio-video`.

**How this file is written (p152 §2a).** Principles first (why, what good looks like, the harm). State a principle
once; no case rule overrides one; every never/always names its harm. Facts and case rules live in `references/` (one
stage or ad type per file); never a brand, customer or run name here. On a miss, ask "which principle should have
covered it?" before adding a rule.

**Every invocation, first:** connect the `remix-context` MCP (the users' only source: `search` → `read_document`, cite
the URI; not connected → `references/setup.md`; never guess a rule from memory, it drifts from the team's record), then
open and drive the lab per `references/lab.md` (Sean 2026-11-04: "You're supposed to drive it"). Users install nothing.

## Principles

P1–P6 live once in [`../remix-agent/SKILL.md`](../remix-agent/SKILL.md) (the Cadra agent body); read them first.

## The fixed pipeline (no step optional, none skippable)

1. **Read the ad**: cuts, shots, still/moving, music bpm from pixels and audio (code, never the LLM: an LLM guesses cut times and the beats drift), then one
   reading (`video_blueprint`) fed the measured cut list. A script start skips this.
2. **Brief** → `../remix-agent/references/brief.md`. Rewritten when the merchant's answers come in.
3. **Needs / questions**: ask everything missing ONCE, filled first from what the business already has.
4. **Line drawings**: an internal framing input, position and framing only, per shot, from its own source frame. The merchant never sees one (not in chat, review, album, cards or video). Never sent to a video model alone (it copies the sketch look into the video).
5. **Storyboard images** → `../remix-agent/references/storyboard.md`: line drawing redrawn with new cast, set, product.
6. **AI review + code checks** → `../remix-agent/references/review.md`.
7. **Human approval** of each storyboard. Only the merchant approves; the agent never does.
8. **Video parts** (draft 480p first, final on request). Type decides how: `../remix-agent/references/types/`.
9. **Join** → `../remix-agent/references/join-and-sound.md`: the ad's own music laid ONCE, cuts on its beats.
10. **Final → approve / export → post**.
Exception: "Just swap the product" (merchant's choice only) skips 2–7 → `../remix-agent/references/fast-swap.md`.

## Pick the type

Decide from the reading, before the brief: people talking -> people-dialogue, else product-hero; the merchant's pick wins.

| Source ad is | Load |
|---|---|
| people on screen, speech or dialogue | `../remix-agent/references/types/people-dialogue.md` |
| a product moving through shots, no people speaking | `../remix-agent/references/types/product-hero.md` |
| fast cuts of stills held on beats | `../remix-agent/references/types/montage.md` |
| video and stills mixed (keep/mine clips) | `../remix-agent/references/types/mixed.md` |
| a phone / app / website screen shown | `../remix-agent/references/types/screens.md` (also applies inside any other type) |
| the ad beside a static prompt panel (template post) | `../remix-agent/references/types/template-reel.md` (also applies inside any other type) |
| ingredients turning into the product (making-of) | `../remix-agent/references/types/product-hero.md` "A making-of ad needs a real recipe" (any type) |

## References (load on demand)

| File | When |
|---|---|
| `references/lab.md` | every invocation: open the lab, drive it, who does what, lab defaults |
| `../remix-agent/references/fast-swap.md` | "Just swap the product", templates, reuse, source download, swap allowed or not |
| `../remix-agent/references/brief.md` | writing, rewriting or feeding the brief |
| `../remix-agent/references/storyboard.md` | line drawings, storyboard cards, per-card fields. Required reading, in full, for any storyboard-stage change (with review.md and the lab manual) |
| `../remix-agent/references/review.md` | AI review, fit, benchmark verdicts, set check, code checks, known gaps |
| `../remix-agent/references/join-and-sound.md` | joining parts, music, beats, export |
| `../remix-agent/references/whatsapp-journey.md` | tap ids, words, copy rows, buttons, problem solver, failure lines |
| `references/engineering.md` | builders: shipping and proof rules, who decides, budget, pricing |
| `references/code-map.md` | where each step runs in slides / yobo / msg-api / Cadra |
| `references/learnings.md` | after every finished or failed paid remix: the learnings note + Remix KB upload |
| `references/setup.md` | first use on a machine: connect the Remix KB MCP (nothing else) |
| `../remix-agent/references/types/*.md` | one per ad type |

Related: `yobo:ad-studio-video`, `yobo:whatsapp`, `yobo:social`, `yobo:messaging`; KB search "p131", "remix lab", "higgsfield gotchas".
