# Traps: Brand Drift

Failures of brand fidelity - the asset (or the batch) stops being recognizably the brand: off-palette color, off-tone mood, logo abuse, silent typeface substitution, and the signature failure of generated batches: asset 10 no longer matching asset 1. The M-rule manifest is the enforcement instrument for this class - most entries below are checked rule-by-rule in the crit pass, and the craft file's batch-discipline section (re-grounding checkpoints, drift check against asset #1) exists specifically because of the batch entries here.

Entries carry the eight schema fields; ids are cited by craft-file avoid-lists and by M-rule conformance findings. Negative-prompt fields for kit-relative entries are written as phrasing patterns - the mission's craft file instantiates them with the actual kit values recon pinned at entity resolution.

### brand-off-palette
- id: brand-off-palette
- anti-pattern: Colors drifting from the kit - near-miss hues, unauthorized accent colors, invented gradients and duotones the kit never defined.
- markers: Sampled colors do not match kit values; an accent appears that no kit swatch produces; background tints shift between assets; a generated scene's grade pulls the brand color off its true value.
- why-it-fails: Palette is the brand's fastest recognition signal (color-contrast CC-3); near-miss color reads as counterfeit to repeat customers - close enough to reference the brand, wrong enough to feel fake.
- negative-prompt: off-brand colors, random accent colors, unauthorized gradients, color cast over brand elements
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized brand-failure class; no merchant, campaign, or customer data

### brand-off-tone
- id: brand-off-tone
- anti-pattern: Visual tone contradicting the brand's voice - playful visuals on a formal brand, corporate stiffness on a playful one, edgy grammar on a warm one.
- markers: Mood and styling mismatched against the kit's tone words; imagery from the kit's banned-imagery list present; humor or drama at a level the brand's history never uses; the asset plausible only for a different brand in the category.
- why-it-fails: Audiences hold a relationship with the brand's persona; tone whiplash breaks it, and a brand performing a personality it does not have is inauthenticity at brand scale (authenticity AU-8) - one off-tone asset makes the whole presence feel unmanaged.
- negative-prompt: instantiate from the kit's banned-tone list, e.g. cartoon style, edgy grunge styling, corporate stock mood, slapstick humor scene
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized brand-failure class; no merchant, campaign, or customer data

### brand-logo-abuse
- id: brand-logo-abuse
- anti-pattern: The mark mistreated - stretched, recolored, shadowed, outlined, rotated, cropped, or crowded past its clear-space rule.
- markers: Logo aspect ratio off from the source file; logo in a color no kit variant defines; effects (glow, bevel, drop shadow) applied; other elements inside the clear-space margin; the mark below its minimum legible size; a generated pseudo-logo standing in for the real file.
- why-it-fails: The mark is the one element with hard rules precisely because recognition accrues to its exact form; every abuse spends accumulated brand equity to solve a local layout problem - and a generated fake mark is ai-text-garble wearing the brand's face.
- negative-prompt: distorted logo, stretched logo, recolored logo, logo with drop shadow, warped brand mark, generated logo
- severity: kills-the-asset
- provenance-class: published craft knowledge
- privacy-check: pass - generalized brand-failure class; no merchant, campaign, or customer data

### brand-type-swap
- id: brand-type-swap
- anti-pattern: Near-miss typeface substitution - a lookalike font silently replacing the kit face, often via a rendering tool's fallback.
- markers: Letterform details differ from the kit face (single-story vs double-story a and g, terminal shapes, number forms); a weight in use that the kit does not license; the rendering pipeline's default font detected in one asset of the batch.
- why-it-fails: Type is identity at glance distance (typography TY-6); regular customers notice without knowing what changed - the asset just feels off-brand, which is worse than obviously wrong because it cannot be argued with.
- negative-prompt: generic default font, wrong typeface, substituted font rendering
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized brand-failure class; no merchant, campaign, or customer data

### brand-batch-drift
- id: brand-batch-drift
- anti-pattern: Asset 10 no longer matching asset 1 - style, palette, framing, and tone drifting monotonically across a generated batch as prompts mutate and nobody re-grounds.
- markers: Asset 1 and the latest asset side by side show visibly diverged grade, lighting style, or palette; prompt text has accreted edits across the batch without returning to the craft file's canonical blocks; M-rule conformance was checked early and then assumed; the drift is invisible asset-to-asset and obvious end-to-end.
- why-it-fails: A campaign is consumed as a set; drift makes the set incoherent and reveals unattended automation. This is the exact failure the craft file's batch-discipline section (re-grounding checkpoints, drift check vs asset #1) and execute's batch re-grounding exist to catch - skipping them is how it ships.
- negative-prompt: inconsistent style across series, palette drift between assets, changing visual treatment mid-campaign
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized brand-failure class; no merchant, campaign, or customer data

### brand-visual-patchwork
- id: brand-visual-patchwork
- anti-pattern: One campaign, several visual worlds - mixed photography styles, an illustration system that appears in some assets only, inconsistent grades and filters across the set.
- markers: The side-by-side campaign view reads as work from multiple brands; some assets photographic and others illustrated with no system governing which; grade and temperature varying by asset; different eras of brand template mixed in one flight.
- why-it-fails: Campaign coherence is what makes repeated exposure compound - each impression should reinforce the last (authenticity AU-5 applied at campaign scale); patchwork resets recognition on every impression and spends the media budget teaching nothing.
- negative-prompt: mixed art styles, inconsistent visual treatment, clashing photo filters, mismatched illustration and photography
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized brand-failure class; no merchant, campaign, or customer data

### brand-implied-claim
- id: brand-implied-claim
- anti-pattern: Imagery implying claims the brand cannot back - visual superlatives, results depictions, health or outcome implications beyond the approved claims in the M-rules.
- markers: The visual shows an outcome the offer does not promise; before/after framing; perfection of result exceeding what a customer will experience; imagery contradicting the legal/claims lines in the M-rule manifest; a depicted product state (portion, finish, scale) better than the real one.
- why-it-fails: Claims live in images as much as words - regulators and audiences both read visual implication as a promise; a legal M-rule violation is unshippable regardless of craft, and an oversold image converts into disappointed customers who feel lied to on arrival (conversion-craft CV-5's honest-demonstration rule).
- negative-prompt: before and after comparison, exaggerated results imagery, idealized outcome depiction, medical claim visuals
- severity: kills-the-asset
- provenance-class: published craft knowledge
- privacy-check: pass - generalized brand-failure class; no merchant, campaign, or customer data
