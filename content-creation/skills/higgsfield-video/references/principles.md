# Core rules: sent with every prompt

Back to [SKILL.md](../SKILL.md). Read when building any video or picture prompt. These rules are the base layer,
like an agent's base prompt: every prompt carries them unchanged, and per-video words only add to them. Keep
them in ONE place in your tool (a constant), never re-typed inside each prompt builder — scattered copies drift.

`{P}` = the product's name.

## Video (a `CORE RULES` block right after ACTIVE REFERENCES)

| Rule | Text sent | Broken in a run when |
|---|---|---|
| Continuity | one {P}, identical in every shot and frame — same shape, size, colours, materials and printed design. It never morphs, duplicates, splits or swaps for another object. | The product grew another object's parts |
| References do only their job | pictures of the {P} set how it looks, never the framing; storyboards and the CAMERA block set framing, angle and distance. | A product picture became the opening frame |
| Camera obeys the words | no cuts, angles, close-ups, zooms or camera moves beyond the ones written. A static camera never moves. | Extra cuts; a label close-up nobody asked for |
| Time obeys the words | every shot lasts exactly its written length; every cut lands at its written time. | A 1.7 s shot ran 4–5 s (still happens — trim after) |
| Real physics | things move only the way they physically can, or by the means written; contact with the ground and shadows stay consistent; nothing floats unless written. | A can became a rocket; products floated |
| Nothing added | no text, captions, watermarks, extra logos, hands, people, animals, glows or effects that are not written. | A hand, glows and light streaks appeared |
| Printed text | printed text on the {P} stays correct and readable, never mirrored or garbled. | A can label came out mirrored |
| Light | light stays continuous within a shot; it changes only at a cut or where written. | — (keeps the look stable) |

## Pictures (character sheets, storyboard swaps: appended as `Rules:`)

- One {P} identity: same shape, colours, materials, size and printed design as its reference; never a different model or variant.
- Exactly the picture asked for, in the layout asked for; never paste or collage the reference pictures into it.
- Nothing added: no text, captions, watermarks, extra logos, hands, people or effects that are not asked for.
- Printed text on the {P} stays correct and readable, never mirrored or garbled.
- Real contact: the {P} rests, stands or is held naturally, with a matching shadow; never floating unless asked.
- The merchant's own instructions win over every default.

## Changing a rule

Change it in the one constant, note the run that motivated it in the table above, and re-run one Draft to check
it did not break another rule. A rule with no run behind it does not go in.
