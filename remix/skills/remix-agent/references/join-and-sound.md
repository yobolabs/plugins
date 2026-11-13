# Join and sound

Back to [SKILL.md](../SKILL.md). Read when joining video parts, laying music, exporting.

- **Clip length: render at the model minimum, then trim to the scene's measured length.** Never ship a clip longer than its scene.
- **The join runs by itself as soon as every part has landed** (Sean 2026-11-05 ~21:5x: "I expect the final assembled
  video."). There is no parts approval and no join ask: the merchant sees ONE joined video with [Looks good] / [Change a
  part]. Parts shown only on request.
- **The join is part of making the video, never its own step, ask or charge** (Sean 2026-11-06 ~00:4x: "Joining
  should NOT be separated from creating a video. It's an essential part of the delivery. A video's 'price' should be
  all-inclusive."). The merchant sees ONE all-inclusive price for the video: parts + join + every re-join. Never name
  the join in a quote, a price line or a button ("putting it together: N credits" is wrong). The join's credits stay
  in the total (price value unchanged; pricing is parked) and are debited under the video's one consent. A re-join
  after a part or music change runs by itself and adds no charge of its own; a failed-join retry adds none either.
  A closure where every part is kept (free) still has one video price, never a "join" line.

- **Audio = the ad's own music by default when it has no speech**, ONE track laid ONCE over the whole joined video, cuts
  on the source ad's own cut frames (Sean 2026-11-03: "Why not just use the same audio?"; rule in the cut list below). Chat line: "Using the original ad's sound." No extra tap.
- **A remade part that had a voice keeps that voice** (Sean 2026-11-05: "if there's any part that needs to be
  regenerated and if it has a VoiceOver, we would send a clip that contains the voice as a reference so that for newly
  generated video, it has the voice sample to generate with"). The teardown marks which source parts carry a voice
  (measured speech, set by code). The remade part's video call gets that part's source clip with its audio as the voice
  reference, bound in the prompt ("@Audio1 = the speaker's voice; say the brief's line in this voice"). For every source, own or another
  brand's (Sean 2026-11-05: "all sources"). `hasVoice` is MEASURED speech (transcript, else a speech detector on the
  source audio; unsure = voice), never the reader's line kind (a voiceover was once filed as on-screen text). The join keeps each part's own audio (remade = model
  audio, kept = its source slice); the full source track is never laid over a remade voice part (a drink ad's voiceover
  once played over gelato shots this way). A music-only source = the ad's music, cut to the scene windows. No separate
  voiceover, TTS or sound-effect track. Internal keys (`adMusic`) never reach text the agent can relay.
- Parts WITHOUT voices are encoded with no audio (`-an`); a silent AAC per part pads every join and pushed later cuts 33-100 ms late.
- Voiced parts keep the video model's own audio; the ad's track is never laid over them; their cuts follow the speech.
- **With the ad's own audio, every cut lands on the source ad's cut frame exactly.** Never snap cuts to a computed beat grid
  or a guessed tempo. Beat detection (by Cadra) is used only when the ad's audio is replaced (Sean 2026-11-09: "Anytime we
  use the audio from the ad, the edit MUST match"). Proof = the EXPORT: measure its real hard cuts (`analyze.py`),
  including a cut the video model makes inside a part. Matching the slot edges is not proof (2026-11-09 run: slot cuts
  drift 0, export 133 ms longer than the ad, unseen by the slot check). Table: cut · source cut · offset on the export;
  more than 1 frame off is a fail. A miss goes to the Editor role (Cadra decides retime, split or accept); yobo only measures.
- Harm guarded: a cut 100-250 ms off the ad's music reads as a bad edit to the merchant, though every slot was correct.
- Render whole seconds rounded UP, play the exact length; count frames from the running total; stop parts by frame
  count (`-frames:v`, read with 0.5 s spare), never output `-t`.
- Each picture and clip window once; fewer assets than slots -> hold shots for 2 beats; never the same product in two
  shots in a row; payoff of each clip lands on a beat with at least one beat after it; end card lands on the music's last hit.
- A slot under 250 ms is merged into its neighbour (default; the value is the remix join minimum-slot row in `_context/LIMITS.md`).
- Measure the export: re-run the analysis; cut count and times must equal the plan.
- End card: org brand logo, fall back to the yobo brand profile when the slides brand kit has none. Captions and on-screen
  text come from a word-timed transcript in post (Finish); shown to the merchant before export.
- WhatsApp video cap is 16 MB: the chat gets a copy that fits (about 15 MB, 720p if needed); the full file stays in Ad
  Studio. If the send fails: one line in words with a button to Ad Studio, never a raw link.
- Export waiver: the MQL waiver applies at export too (quote passes the remixId).

## Music

Music (Sean 2026-11-05): default = the source ad's own track; the merchant can search or pick a track we already have;
similar-track matching only with a free source (no paid music vendor). From scratch, the same match and search, seeded by the script's mood.
Planned rule: when the original ad talks and no part has a spoken line, the join lays one library track picked by the ad's mood and tempo, named in the ready line with [Change music]; the final QA states it as a fact. Until that is built, such a join is silent by design and the final QA says so without a hold.

## Post

After export the video posts through the Buffer / Hootsuite route; direct Instagram / Facebook posting waits on Meta app review.

## Sound and cuts (Sean HARD rule, 2026-11-09)

- "Anytime we use the audio from the ad, the edit MUST match."
- With the ad's own audio, every cut sits on the source cut frame (`analysis.hardCuts`), frame-exact. The original editor already cut to that audio.
- Never move cuts to a computed beat grid. Beat snapping is only for a new track, from beats found by Cadra and stored in the template.
- Export check: cut times equal the source's cut times within ±1 frame.
- Speech in the source is a voiced script line, or a voice whose style, language or pace describes speech. Two of those saying none or silent means no speech. A voice field that only says "silent" is not speech, so the ad's own sound is laid. A silent join where the ad's sound is wanted is our fault: re-join it once (free) and never ask the merchant.
- The ad's own cut frames are quantised and can drift off their music, and a beat grid can lock at half tempo. Record both grids and their cut shares before choosing one; on such ads no fixed grid reaches a high cut-on-beat share.

## Final QA

- The join lays our own mark in its one ffmpeg pass, so no unmarked file exists. The final QA grabs its frames with the mark's box covered and gets one fact line naming the box. Our own mark is never a finding and never offered as a change, on the draft or the final join.

## A generated part that covers several ad shots

- A video part made in one generation call can hold two or more ad shots. The clip then has its own cut or cuts inside.
- Yobo measures the clip's inner cut or cuts and passes the clip as ONE SLOT PER AD SHOT. Each slot plays a window of the same clip. The boundary at the clip's own cut is fixed: piece A ends exactly at the cut, piece B starts there.
- Trim only each piece's outer end to its ad shot's length. Hold the end frame (`holdMs`) when a piece is short.
- Every ad cut then sits on a join, never inside a clip.
- Never ask for a second render to fix timing. Only a clip whose inner cut is missing or too far from the ad's shot change goes to `unfixable` (one split remake, then the finding).

## Keep scenes in the full-run join

- In the full-run join, keep scenes enter as source slots, cut from the stored copy by the scene's measured shot frames. Earlier they were dropped from the join.
