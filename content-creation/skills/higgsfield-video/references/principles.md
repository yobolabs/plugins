# Core rules: sent with every prompt

Back to [SKILL.md](../SKILL.md). Read when building any video or picture prompt. These rules are the base layer,
like an agent's base prompt: every prompt carries them unchanged, and per-video words only add to them. Keep
them in ONE place in your tool (a constant), never re-typed inside each prompt builder — scattered copies drift.

`{P}` = the product's name.

## Video (a `CORE RULES` block right after ACTIVE REFERENCES)

Grouped by what must stay consistent. Source: a run that broke it, or a known AI-video failure ("slop") class.

| Rule | Text sent (shortened) | Guards against |
|---|---|---|
| **Look (first rule, pictures and videos)** | one style for the whole ad — preset (photoreal live-action, clean 3D render, claymation, 2D cartoon, anime) plus the ad's own look and light, or the merchant's own words; names the styles it must never drift into | Separate generations of one ad coming back mixed — one photoreal, one plastic CGI, one cartoon or clay (Sean) |
| Product | one {P}, identical in every shot — shape, size, colours, materials, printed design; never morphs, duplicates, splits, melts or swaps | The product growing another object's parts (run) |
| **Orientation is physical** | keeps its orientation until something visibly turns it; upside down stays upside down until seen rotating; the printed design turns WITH it, never redrawn upright | A can upside down that "lands" right way up with its logo re-drawn, no rotation seen (Sean) |
| Object permanence | nothing appears, vanishes or changes count without a visible cause; same number of products, people and props in a shot | Extra cans, people popping in |
| People | same face, age, hair, skin, build, clothes, accessories in every shot; five fingers; correct limbs, joints, teeth; held objects stay in the hand | Face drift, extra fingers, swapped hands |
| **Cast per role** | each role is played only by its cast member, as in that role's sheet and the storyboard; look-alike cast members never swap; the people behind or around a speaker stay as in the storyboard, softly out of focus; nobody is duplicated | Two look-alike cast members swapped; a speaker alone on a bare wall; repeated people (run) |
| **Voice per role** | each speaking role keeps ONE fixed voice description, taken from the new cast member, identical in every part; each line is spoken by the role the script names; no other voices | Voice drift between clips; the old ad's speaker's voice (run) |
| Screens | an app, chat or website screen appears only inside a phone held by a character, screen flat chroma green, held steady; no screen text drawn | A laptop with garbled text instead of a phone (run) |
| Place | same layout, structures, signs, surfaces, weather, time of day within a scene; left stays left | A curved slab becoming a loop (run); walls moving |
| Real physics | moves only as it physically can or by the written means; believable gravity, momentum, speed; ground contact and shadows match the light; liquids, smoke, fabric behave for real; nothing floats unless written | A can flying like a rocket (run); floating products (run) |
| Cause and effect | every change has a visible cause — landing makes dust, impact moves what it hits, a glow has a source | Glows and effects from nowhere (run) |
| Screen direction | moving right keeps moving right across a cut; eyelines and camera side stay consistent | Flipped direction after a cut |
| References do only their job | product and people pictures set looks, never framing; storyboards and CAMERA set framing | A product picture as the opening frame (run) |
| Camera obeys the words | no cuts, angles, close-ups, zooms or moves beyond the written ones; static never moves | Extra cuts; a label close-up (run) |
| Time obeys the words | each shot its written length; cuts at written times | 1.7 s shot ran 4–5 s (run; still happens — trim after) |
| Nothing added | no text, captions, numbers, watermarks, logos, end cards, the source brand's logos or mascots, hands, people, animals, glows, sparkles, effects not written | A hand, glows, light streaks (run); burned-in captions and storyboard labels (run) |
| Printed text | on the product and on signs: correct, readable, identical frame to frame; never mirrored, garbled, rewritten | Mirrored can label (run) |
| Light | same direction, colour, strength within a shot; changes only at a cut or where written | Flicker, light jumping sides |

For prompt limits (Kling, 2,500 characters) send each rule's first sentence only.

## Pictures (character sheets, storyboard swaps: appended as `Rules:`)

- LOOK, identical in every picture and every shot of this ad: <the look>. (Same rule leads the video rules; one setting feeds both.)
- One {P} identity: same shape, colours, materials, size and printed design as its reference; never a different model or variant.
- Same form as the subject it replaces: when the ad shows the food, drink or contents itself, show what is inside the {P} that way, never its package; when the ad shows a package, show the {P}'s package. The {P} keeps its own real shape and make-up, never the old subject's shape, layers or filling. The same count as the old subject; never extra copies, packs or logos. *(Run: a food-burst photo swapped to a packaged food came back as the new food moulded into the old food's shape, the old food's sauces kept, and small packs scattered around.)*
- The old subject's packaging parts (caps, lids, applicators, tubes, wands) are removed, never kept or redrawn; only its food-like pieces (ingredients, sauces, crumbs) become the new product's. *(Run: a swap kept the old product's clear cap floating beside the new product.)*
- Orientation is physical: printed text and logos sit where the {P}'s pose puts them, turned with it; never redrawn upright on a tilted or upside-down object.
- People keep their face, hair, clothes and build; hands have five fingers; nothing anatomically wrong.
- Each person is the cast member for their role (from that role's sheet); the people behind or around the speaker
  in the source stay, as the new team, softly out of focus; nobody duplicated. A speaker is never alone on a bare
  wall unless the source shows that.
- People ads: every visible person is a NAMED cast member drawn from their own picture and identity card, seated
  as the seat map says, in the approved set picture; faces show the brief's feeling (never default smiles).
- The camera is written in words in every picture prompt (shot size, angle, who is in frame); never left to
  Image 1 alone.
- Clean storyboard: no captions, text or logos drawn anywhere; per-shot pictures carry no labels or numbers.
  Keyframe-sequence frame sheets keep only their small panel labels; a label never reaches a video (one leaked
  into a final video). The source brand's logos, mascots and signs are removed; clothes carry no
  logos or emblems.
- A phone, app or website screen is a phone held by a character, its screen flat chroma green, no screen text.
- The place keeps its structures, layout and light; nothing in it changes unless asked. (The scene plan's re-themed place counts as asked: see `remix-workflow.md` step 4 — a place that suits the old product, not the new one, is a planning bug, not a rule to obey.)
- Exactly the picture asked for, in the layout asked for; never paste or collage the reference pictures into it.
- Nothing added: no text, captions, watermarks, extra logos, hands, people or effects that are not asked for.
- Printed text on the {P} stays correct and readable, never mirrored or garbled.
- Real contact: the {P} rests, stands, is held or floats exactly as the subject it replaces does, with a matching shadow.
- The merchant's own instructions win over every default.

## Changing a rule

Change it in the one constant, note the run that motivated it in the table above, and re-run one Draft to check
it did not break another rule. A rule needs a reason: a run that broke it, or a known AI-video failure class named in the table.
