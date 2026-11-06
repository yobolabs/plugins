# Join and sound

Back to [SKILL.md](../SKILL.md). Read when joining video parts, laying music, exporting.

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
  on its beats (Sean 2026-11-03: "Why not just use the same audio?"). Chat line: "Using the original ad's sound." No extra tap.
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
- **Cuts land ON the beat** (`cuts[].on_beat`), not on the source's cut frames (those lag 100-250 ms). Proof = a table
  cut · beat · offset on the export; more than 1 frame off is a fail.
- Render whole seconds rounded UP, play the exact length; count frames from the running total; stop parts by frame
  count (`-frames:v`, read with 0.5 s spare), never output `-t`.
- Each picture and clip window once; fewer assets than slots -> hold shots for 2 beats; never the same product in two
  shots in a row; payoff of each clip lands on a beat with at least one beat after it; end card lands on the music's last hit.
- A slot under about 1 s is merged into its neighbour (default; a number needs a LIMITS row).
- Measure the export: re-run the analysis; cut count and times must equal the plan.
- End card: org brand logo, fall back to the yobo brand profile when the slides brand kit has none. Captions and on-screen
  text come from a word-timed transcript in post (Finish); shown to the merchant before export.
- WhatsApp video cap is 16 MB: the chat gets a copy that fits (about 15 MB, 720p if needed); the full file stays in Ad
  Studio. If the send fails: one line with the link.
- Export waiver: the MQL waiver applies at export too (quote passes the remixId).

## Music

Music (Sean 2026-11-05): default = the source ad's own track; the merchant can search or pick a track we already have;
similar-track matching only with a free source (no paid music vendor). From scratch, the same match and search, seeded by the script's mood.

## Post

After export the video posts through the Buffer / Hootsuite route; direct Instagram / Facebook posting waits on Meta app review.
