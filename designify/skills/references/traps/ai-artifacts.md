# Traps: AI Artifacts

AI-degenerate render failures - defects the generator produces that human viewers clock instantly, consciously or not. This class is the render-side shadow of the authenticity pack: one uncanny detail re-classifies the whole asset from "image" to "AI image", and the fake-detector does the rest. Most entries here are also the reason execute's L2 vision check exists - these defects pass L0 (the file rendered) and L1 (the dims are right) and still kill the asset.

How these entries are consumed: craft-file avoid-lists cite entries by id; execute feeds each entry's negative-prompt phrasing to actuators verbatim; the crit pass and the L2 vision check use the markers as a defect checklist on the actual render. Each entry carries the eight schema fields (id, anti-pattern, markers, why-it-fails, negative-prompt, severity, provenance-class, privacy-check). Severity bands are closed and honest: kills-the-asset (unshippable), hurts (ships only with a recorded reason), cosmetic (note it, fix on regeneration).

### ai-hands-anatomy
- id: ai-hands-anatomy
- anti-pattern: Malformed hands - wrong finger counts, fused or extra digits, impossible joints, on any hand visible in frame.
- markers: Count the fingers on every visible hand, including background figures and hands holding the product; check knuckle spacing, thumb direction, wrist angle; check where a hand meets an object - fingers merging into cups, phones, and railings are the same defect.
- why-it-fails: Hands are a hard-wired human attention target; a single wrong hand flips the entire asset to uncanny and trips the fake-detector before the message is read (authenticity pack AU-1).
- negative-prompt: extra fingers, missing fingers, fused fingers, six fingers, deformed hands, malformed hands, twisted wrist, backwards thumb, extra limbs, hands merging into objects
- severity: kills-the-asset
- provenance-class: session corpus
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data

### ai-face-teeth-eyes
- id: ai-face-teeth-eyes
- anti-pattern: Uncanny faces - undifferentiated tooth bands, asymmetric or glassy eyes, mismatched gaze, warped features on any face in frame.
- markers: Teeth rendered as a continuous white strip with no tooth separation; pupils of different sizes or at different heights; eyes focused in two different directions; a smile whose muscles do not reach the eyes; ears, glasses, or hairlines blending into skin; background faces melted (see ai-background-melt for the crowd case).
- why-it-fails: Faces get more viewer scrutiny than any other region of an image; micro-wrongness in a face registers before the headline does, and the viewer's takeaway is "fake" rather than the offer.
- negative-prompt: deformed face, asymmetric eyes, cross-eyed, dead eyes, glassy stare, extra teeth, malformed teeth, uneven pupils, warped facial features, distorted face
- severity: kills-the-asset
- provenance-class: session corpus
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data

### ai-text-garble
- id: ai-text-garble
- anti-pattern: Generated in-image text - pseudo-letters, gibberish signage, melted labels, alien characters on packaging, menus, storefronts, or price tags.
- markers: Any string in the render that is not a real word on inspection; letterforms that almost resolve but do not; brand or packaging text with mutated glyphs; a storefront sign with letter-shaped noise; numbers with impossible digit shapes.
- why-it-fails: Text is binary - it is either right or visibly wrong, and garble both outs the asset as AI instantly and can misrepresent the product or price. The typography pack's rule (TY-7) exists because of this entry: words belong to the overlay layer, not the generator.
- negative-prompt: text, letters, words, writing, signage, labels, watermark, caption, garbled text, gibberish lettering, distorted typography, fake logo
- severity: kills-the-asset
- provenance-class: session corpus
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data

### ai-plastic-skin
- id: ai-plastic-skin
- anti-pattern: Waxy over-smooth skin and texture - the airbrushed-mannequin surface generators default to on people, food, and fabric.
- markers: No pores or texture at a close crop; a uniform specular sheen across the whole face; every subject in the batch sharing the same complexion; food surfaces reading as molded plastic; fabric without weave.
- why-it-fails: Over-perfection of surface is among the strongest single AI tells; real light on real material always produces texture, and its absence reads as filter or fake (authenticity AU-2 - imperfection is evidence).
- negative-prompt: plastic skin, waxy skin, airbrushed skin, overly smooth skin, doll-like face, porcelain skin, artificial texture, uncanny valley
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data

### ai-hair-merge
- id: ai-hair-merge
- anti-pattern: Hair losing physical identity - strands melting into the background, blending into clothing, or fusing with another person's hair.
- markers: Hair boundary loses strand definition and becomes a soft blob; hair color bleeding into the wall behind it; hairline dissolving into a hat or collar; two adjacent people sharing a continuous hair mass.
- why-it-fails: Boundary coherence between a subject and its surroundings is a subconscious realness check; when edges stop behaving like matter, the scene stops being a place.
- negative-prompt: melted hair, hair merging into background, blurred hair edges, hair blending into clothing, undefined hair strands
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data

### ai-physics-violation
- id: ai-physics-violation
- anti-pattern: Composition physics broken - shadows disagreeing with light sources, impossible reflections, floating or interpenetrating objects, liquids ignoring gravity.
- markers: Shadow directions differing between subject and props; a mirror or window reflecting content that is not in the scene; an object resting on nothing; a hand passing through a solid; liquid surfaces tilted against the vessel; stairs or furniture that could not be built.
- why-it-fails: Viewers cannot name the error but feel the wrongness - physical coherence is how humans verify a scene is one scene (authenticity AU-5); the feeling of wrongness attaches to the brand.
- negative-prompt: impossible shadows, wrong reflections, floating objects, objects clipping through each other, warped perspective, impossible geometry, distorted proportions
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data

### ai-product-mutation
- id: ai-product-mutation
- anti-pattern: The hero product itself warped - wrong label geometry, mutated packaging, invented features, distorted proportions, or a rendered dish that is not the actual dish.
- markers: Compare the render against the real product reference from entity resolution: label shape and placement, count of features (handles, buttons, straps, toppings), proportions, color fidelity; any invented variant the product line does not contain.
- why-it-fails: Misrepresenting the item being sold is a trust kill AND a claims exposure - the one defect class that is simultaneously a craft failure and a potential M-rule (legal) violation. The audience that knows the product spots it immediately; the audience that does not will feel deceived on arrival.
- negative-prompt: deformed product, warped packaging, distorted label, mutated object, wrong proportions, invented product details, inaccurate product shape
- severity: kills-the-asset
- provenance-class: session corpus
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data

### ai-lighting-mismatch
- id: ai-lighting-mismatch
- anti-pattern: Subject lit from a different world than the background - the composite look: mixed light directions or color temperatures with no in-scene cause.
- markers: Subject rim-lit while the scene is overcast; shadows at multiple sun angles; an interior with three inconsistent shadow directions; the subject's white balance warmer or cooler than the room; an outline glow where subject meets background.
- why-it-fails: Lighting coherence is the primary cue by which humans verify a single scene; the composite look reads as assembly, and assembly reads as deception even when every element is individually clean (authenticity AU-5, color-contrast one-grade principle).
- negative-prompt: inconsistent lighting, mismatched shadows, composite look, cut-out subject, mixed color temperature, subject pasted onto background, halo edges
- severity: hurts
- provenance-class: published craft knowledge
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data

### ai-background-melt
- id: ai-background-melt
- anti-pattern: Background degeneration - warped architecture, blob crowds, fused background faces, repeating texture tiles, furniture blending into walls.
- markers: Straight structural lines that bend without a perspective reason; background people sharing limbs or faces; identical figures repeated across a crowd; window and shelf contents dissolving into noise; patterns that tile visibly.
- why-it-fails: Viewers scan backgrounds for context even when focused on the subject; melt reads instantly at story and hero sizes, and a clean subject cannot save a dissolving world.
- negative-prompt: warped background, melting background, distorted architecture, blurry deformed crowd, duplicated background people, fused background faces, mutated background objects
- severity: hurts
- provenance-class: session corpus
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data

### ai-accessory-glitch
- id: ai-accessory-glitch
- anti-pattern: Small-region accessory incoherence - mismatched earrings, asymmetric glasses, garbled watch faces, jewelry merging with skin, buttons out of line.
- markers: Compare left and right of every worn accessory; check glasses frames against ears and nose; check watch/jewelry detail at a close crop; check clothing closures for coherent rows.
- why-it-fails: Small regions escape casual viewing but are exactly where scrutiny lands on portrait crops and close-ups; on most feed renders the defect goes unseen, which is why this band is honest rather than alarmist.
- negative-prompt: mismatched earrings, asymmetric glasses, garbled watch face, jewelry merging into skin, misaligned buttons
- severity: cosmetic
- provenance-class: published craft knowledge
- privacy-check: pass - generalized render-defect class; no merchant, campaign, or customer data
