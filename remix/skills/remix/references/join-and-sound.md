# Join and sound

Back to [SKILL.md](../SKILL.md). Read when joining video parts, laying music, exporting.

- **Audio = the ad's own music by default** on every remix, ONE track laid ONCE over the whole joined video, cuts on its
  beats (Sean 2026-11-03: "Why not just use the same audio?"). Chat line: "Using the original ad's sound." No extra tap.
  Licensed-track plumbing is later work.
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
