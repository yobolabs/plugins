# Join and sound

Back to [SKILL.md](../SKILL.md). Read when joining video parts, laying music, exporting.

- **The join runs by itself as soon as every part has landed** (Sean 2026-11-05 ~21:5x: "I expect the final assembled
  video."). There is no parts approval and no join ask: the merchant sees ONE joined video with [Looks good] / [Change a
  part]. The join keeps its existing price (pricing is parked): it is included in the parts go's price ("video parts +
  putting it together: N credits") and debited under that one consent, and a failed-join retry adds no charge. A re-join
  after a part or music change also runs by itself, its credits shown on that change's quote. Parts shown only on request.

- **Audio = the ad's own music by default when it has no speech**, ONE track laid ONCE over the whole joined video, cuts
  on its beats (Sean 2026-11-03: "Why not just use the same audio?"). Chat line: "Using the original ad's sound." No extra tap.
- **A source track with speech (voiceover, spoken lines) is a known fault, default not yet decided** (Sean 2026-11-05:
  "The audio is strange. Doesn't really match the scene": a drink ad's voiceover played over gelato shots). There is NO
  own music library (yobo `music.ts` searches only the paid Epidemic vendor, unconfigured), and a KB rule says never swap
  in crossfades or a library track. Until Sean picks the default (voice removed from the ad's track / generated
  instrumental / licensed library), the join keeps the ad's track; `remix_sources.has_voice` marks the case. Internal keys
  (`adMusic`) never reach text the agent can relay. A picked track must reach the join.
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
