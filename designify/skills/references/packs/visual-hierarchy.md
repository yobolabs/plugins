# Pack: Visual Hierarchy

The lens that decides what the viewer sees first, second, third - and what they never needed to see at all.

## 1. Scope

This lens owns the ORDER of perception in a static ad: focal-point discipline, eye-path engineering, emphasis contrast (size, weight, position), grouping, and whitespace. It answers one question: when a stranger's eye lands on this asset mid-scroll, what happens in the first moment, in what order, and does that order deliver the message?

Not covered here: letterform craft and type scale (typography pack), color mechanics and palette discipline (color-contrast pack), what the CTA says and why the message converts (conversion-craft pack), what each placement's canvas and UI allow (channel-grammar pack). This lens takes their outputs as ingredients and arranges them.

## 2. Core craft principles

- **Viewers triage, they do not read.** An ad in a feed gets a glance, not a viewing. The eye lands on the strongest contrast in the frame, follows the composition's implied lines, and exits. Hierarchy is the craft of deciding that route for the viewer instead of leaving it to chance.
- **Emphasis is relational and budgeted.** An element is only big, bold, or bright relative to its neighbors. Every act of emphasis spends from a fixed budget: emphasize everything and nothing is emphasized. The discipline is choosing what will NOT be prominent.
- **One frame, one winner.** A static ad supports exactly one dominant focal point. Two equally strong elements do not double the impact; they split it, and the viewer resolves the conflict by leaving.
- **Three reads, three tiers.** A working ad resolves into a first read (the hero: product or human moment), a second read (headline or key support), and a third read (CTA, brand, mandatories). Each tier must be visibly distinct in scale or weight; when tiers blur together the triage fails.
- **Proximity is meaning.** Elements placed close together are read as one unit; elements far apart are read as unrelated - this is the working core of Gestalt grouping. Group by message logic: offer with its qualifier, product with its price, CTA separated just enough to be findable.
- **Whitespace is an active element.** Empty space is not unused space - it is the contrast that makes the focal point focal. Space around an element buys it attention at zero pixel cost; filling every gap refunds that attention to nobody.
- **Faces and vectors steer the eye.** Human faces attract attention before anything else in a frame, and gaze direction plus strong diagonals redirect it. A subject looking toward the headline sends the viewer to the headline; a subject staring out of frame sends the viewer out of the frame.
- **Reading gravity is real.** Audiences reading left-to-right enter near the top-left region and exit near the bottom-right. The entry earns the hook; the exit earns the resolution (CTA, brand mark). Fighting gravity is possible with strong contrast, but it must be a choice, never an accident.

## 3. Directive inventory

**VH-1 - Crown one focal point**
- principle: one frame, one winner - the eye needs a single strongest contrast to land on.
- preconditions: every static asset, always. The winner is usually the product or the human moment, chosen by the concept direction. This does not mean one element; it means one WINNER.
- failure modes: two elements at equal weight (hier-focal-conflict); no winner at all, even texture (hier-no-focal); the logo crowned by default (hier-logo-first).
- prompt hooks: "single clear subject", "the [product/person] dominates the frame", "strong subject emphasis, background recedes", "clean composition with one hero element".

**VH-2 - Build the three-tier ladder**
- principle: three reads, three tiers - first read, second read, third read, each visibly distinct in scale or weight.
- preconditions: applies whenever the asset carries more than a pure image (any headline, offer, or CTA present). Skip only for pure brand-atmosphere assets with a single element.
- failure modes: all tiers at similar weight (hier-everything-shouts); the third tier swallowing the second because mandatories multiplied; body copy promoted to headline styling (hier-text-wall).
- prompt hooks: hierarchy lives mostly in layout/composite decisions; for generation, "minimal composition", "generous negative space around the subject", "clear foreground subject, simple supporting background" keep the ladder buildable in post.

**VH-3 - Engineer the eye path**
- principle: faces, gaze, pointing gestures, and diagonals steer attention; compose them so the route runs hero -> message -> action.
- preconditions: applies when the asset contains a face, a figure, or a strong directional shape. When the asset is a flat product-on-color layout, reading gravity does the steering instead.
- failure modes: subject gazing out of frame, exporting the viewer's attention with it; diagonals pointing at the corner instead of the message; the path crossing the CTA before the reason to care exists.
- prompt hooks: "subject looking toward the [left/right] side of frame", "gaze directed at the product", "leading lines toward the subject", "composition flows from upper left to lower right".

**VH-4 - Group by proximity, one idea per cluster**
- principle: proximity is meaning - each cluster of nearby elements is read as one statement.
- preconditions: any asset with three or more elements. Clusters follow message logic, not symmetry: price belongs beside product, disclaimer belongs at the third tier, CTA stands slightly apart so it is findable.
- failure modes: elements pinned to corners with no grouping logic (hier-corner-scatter); a qualifier drifting away from the claim it qualifies, changing the read of both.
- prompt hooks: layout-stage directive; for generation keep "clean uncluttered scene", "subject isolated from background elements" so post-composited clusters have room.

**VH-5 - Protect a quiet zone**
- principle: whitespace is an active element - the focal point needs empty space around it to be focal.
- preconditions: always, and hardest to hold on small canvases and when stakeholders add elements. The quiet zone is usually around the first-read element or the CTA.
- failure modes: every gap filled with badges, starbursts, or secondary claims until the winner drowns (hier-everything-shouts); whitespace trapped in the center while content crowds the edges (hier-corner-scatter).
- prompt hooks: "generous negative space", "minimalist composition", "plain uncluttered background", "breathing room around the subject".

**VH-6 - Resolve at the exit**
- principle: reading gravity - the eye exits near the bottom-right (for left-to-right audiences); place the resolution (CTA, then brand) where the eye already goes.
- preconditions: direct-response assets and any asset with an action. For pure awareness assets the exit carries the brand mark instead. Right-to-left locales invert the gravity - recon flags locale per mission.
- failure modes: CTA off the path or visually last (hier-buried-cta); logo occupying the exit while the CTA floats homeless (hier-logo-first).
- prompt hooks: layout-stage directive; when generating, "lower right of frame kept clear for overlay" reserves the slot.

**VH-7 - Pass the squint test**
- principle: emphasis is relational - blur the asset (squint, or shrink to thumbnail) and check that exactly the intended winner survives, the tiers separate, and the CTA is still findable.
- preconditions: every asset, at actual render size, before it ships. This is the mechanical check for VH-1, VH-2, and VH-6 and part of the craft file's expected-vs-broken checklist.
- failure modes: passes at design size and fails at render size (chan-thumbnail-blind); uniform gray mush under squint (hier-no-focal).
- prompt hooks: verification directive - it becomes the expected-vs-broken line "at thumbnail size, [winner] reads first and the CTA is locatable", not prompt language.

## 4. Signature questions

The director asks these of every draft through this lens:

1. What does the eye hit first, second, third? Say it out loud; if the answer needs a caveat, the hierarchy is broken.
2. If you squint, does exactly one thing win?
3. What is competing with the focal point, and what would happen if it were removed entirely?
4. Where does the eye exit the frame, and is the action sitting there?
5. Is every element a member of a cluster with a message purpose, or is something floating?
6. Which element could be deleted with zero loss of message? (There is almost always one - delete it.)
7. Does any face in the frame look somewhere useful?

## 5. Placement / asset-class mapping

Walk order for the director in deepen mode: primary rows first.

| Placement class | Weight | What this lens demands here |
|---|---|---|
| Feed image (square / tall portrait) | primary | Tight three-tier ladder; one focal point; quiet zone non-negotiable at small render size |
| Story / full-screen vertical | primary | Vertical eye path (top hook, center hero, lower-third action); compose around platform UI zones (channel-grammar owns the exact insets) |
| Marketplace / product card | primary | Product IS the focal point; near-zero decoration budget; price/name cluster tight; grid context steals emphasis, so contrast must come from clarity |
| Banner / leaderboard (wide) | secondary | Horizontal path: hero left, message center, CTA right; one tier may need to be dropped entirely |
| Hero / landing image | secondary | More canvas does not mean more winners - still one focal point, ladder can afford a fourth read |

## 6. Exemplar pointers

The exemplars/ directory is filled by the exemplar stories (Fable-direct missions and curated taste anchors). Slots this pack needs:

- exemplar needed: a feed ad where a single product owns the frame and the squint test visibly holds (positive anchor for VH-1/VH-7)
- exemplar needed: an everything-shouts real ad and its calmer competitor side by side (negative/positive pair for VH-2/VH-5)
- exemplar needed: a story asset whose vertical eye path lands on the action in the lower third (positive anchor for VH-3/VH-6)

## 7. Trap cross-references

This lens's failure shadow lives in `../traps/hierarchy-failures.md`; the render-side shadow in `../traps/ai-artifacts.md`:

- hier-everything-shouts - the emphasis budget spent everywhere (violates VH-2, VH-5)
- hier-buried-cta - resolution missing from the exit (violates VH-6)
- hier-focal-conflict - two winners, no winner (violates VH-1)
- hier-logo-first - vanity crowning (violates VH-1, VH-6)
- hier-text-wall - reading demanded where triage happens (violates VH-2)
- hier-no-focal - wallpaper effect, nothing wins (violates VH-1, VH-7)
- hier-corner-scatter - grouping logic absent (violates VH-4, VH-5)
- ai-physics-violation - broken composition physics can fake a false focal point or shatter the path (undermines VH-3)
