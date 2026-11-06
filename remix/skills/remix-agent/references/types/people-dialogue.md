# Type: people / dialogue

Back to [SKILL.md](../../SKILL.md). Load when people speak or act in the source.

- **One storyboard picture per shot**, never a multi-panel sheet (wrong person per panel, cast board drawn in). No labels.
- **Fixed set**: one approved master picture of the place + a written seat map in the layout the source really has.
- **Masters per camera setup**: list the source's camera setups (who is in frame, size, angle, facing, depth of field, background); one master per setup framed like the source; every other shot of that setup is an edit of its master (Image 1 = master, Image 2 = person). Inserts (object, screen) are their own pictures, no people.
- **Named cast**: every role has a name, cast files renamed to it, one identity card used word for word in storyboard prompts, video prompts, voices and reviews. Every visible person, background included, has their own picture; one with no picture gets invented. Never merge people into one cast sheet for a model that takes them singly. Clean logos off cast pictures first.
- Background people the ad shows stay, as the new team, softly out of focus. Write the feeling for them (else everyone smiles in a tense scene).
- **Model fit**: two-image models edit Image 1 but cannot move the camera; many-reference model (up to 16) keeps identities and seats from set + each person, but ignores Image 1 as a camera reference, so write the camera in words every time.
- **Video in parts, never one clip per scene**: n = ceil(length / model max) near-equal parts, each ending on a hard cut (Seedance 2.5 max 30 s). Make one after another; QC part N, then part N+1 with part N's video as a reference. Never fire all parts at once.
- **One voice per role**: a fixed voice description from the NEW cast member, word for word in every part. The video model speaks the lines; no TTS over; the source soundtrack is never laid over voiced parts.
- The part request agrees with the approved storyboards: camera words come from the storyboard; a single picture is "one picture of the shot", not "panels"; each line names its speaker and marks off-screen voices.
- Fix by splicing (1-2 shots) or remake the part; every clip bills at least 4 s.
- Dialogue track in the brief carries time/speaker/ON-OFF; the dialogue-across-scenes check is mandatory for this type.
