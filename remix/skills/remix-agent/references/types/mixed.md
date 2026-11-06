# Type: mixed (video -> montage -> video)

Back to [SKILL.md](../../SKILL.md). Load when the source alternates moving shots and held stills.

- Per scene a type: `moving` (paid video), `still` (held picture), `keep` (merchant's clip used as is), `mine` (merchant's clip mined for a window).
- Windows tile the audio; moving scenes render whole seconds rounded up and play exact length; a short scene renders at the model minimum with all action in the first part of the window.
- Keep/mine clips: pick each clip's payoff moment (landing, reveal, label to camera) and put it on a beat with a beat after it; never a second window of a clip already shown unless it looks clearly different.
- Join: one music track laid once; moving parts encoded without audio unless voiced.
- Voiced moving parts follow `people-dialogue.md` rules for those parts only.
