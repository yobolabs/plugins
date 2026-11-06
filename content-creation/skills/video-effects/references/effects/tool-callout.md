# Effect: Tool Callout

Back to [SKILL.md](../../SKILL.md). Status: **stub — not proven in runs.** Seen in: `_context/slides/_specs/p131-remix-in-ad-studio/videos/breakdown-ig-De8SPjEAuV0-claude-edited.md` (10.0–12.0 s label · 12.3–13.7 s strike · 15.0–17.0 s repo card).

**Look:** Three small pop-ons that name a tool the moment it is spoken. (a) Label: app logo + name pops near the face. (b) Repo card: a dark code-host card with "<owner>/<repo>", a Public pill, the one-line description and Star / Fork buttons. (c) Icon strike: app icons pop up, then a red line strikes them out ("not this").
**Use when:** Naming tools, apps or libraries; contrasting "use this, not that".

## Layers (bottom → top)
1. Plate (and PiP card if used).
2. Callout, one at a time:
   - Label: logo tile 5% width (radius 22%) + "<tool>" white bold 4% height, soft shadow. Place above the head (y ≈ 40% of the top area) or on the caption line, never on the face.
   - Repo card: 50% width × 9% height at (2%, 4%), fill `#0D1117` at 92%, radius 1.5%. Row 1: icon + "<owner>/<repo>" bold + "Public" outline pill. Row 2: "<description>" grey, one line, ellipsis. Row 3: "Star <n>" and "Fork" buttons.
   - Icon strike: 1–3 app icons 8% width, side by side, on the PiP card or top-left; red `#E5484D` line 6 px at −35° across each icon; struck icon desaturates to 40%.
3. Captions.

## Timing
- Label: logo pops on the tool word (`spring({damping: 10})` scale 0 → 1, 8 frames); name slides in from the logo 4 frames later (x −20 px → 0, opacity 0 → 1). Hold until the phrase ends (≈ 45–60 frames), cut out.
- Repo card: slide down 30 px + fade over 6 frames on the repo name; hold 45–60 frames.
- Icon strike: icons pop on their words, 4 frames apart; each strike line draws over 6 frames (`strokeDashoffset`) on the negating word ("no", "skip").

## Build
- Remotion: `<ToolLabel logo name>`, `<RepoCard owner repo description stars>`, `<IconStrike icons strikeFrames>`. All transparent ProRes 4444 overlays.

## Inputs
- Person matte: no. Word times: yes (every pop is on a word). Assets: logos as SVG/PNG from the tool's own press kit; repo data from the code host API (`gh repo view <owner>/<repo> --json description,stargazerCount`).

## Traps
- A logo that is not on a transparent background shows a white box. Use SVG or check the alpha.
- A stale star count reads as fake. Fetch it at render time, round to "<n>k".
- Striking a competitor's logo in a paid ad can be a trademark problem. Use icon strike only in organic content, or use generic icons.
