# Structuring a video from its analysis

Back to [SKILL.md](../SKILL.md). Read when deciding how to make each shot and how to configure the scenes.

## Per shot

| Shot | Make it as | Why |
|---|---|---|
| Still photo | Swap the product into the ad's own frame (1 picture). Optional slow zoom in the edit. | A video model is wasted on a still and drifts |
| Moving, under 2 s | Video, then trim to the exact length in the edit | Models stretch short shots to about 4 s whatever the prompt says |
| Moving, simple (a hand, a product turning, handheld) | Image-to-video from a product-swapped frame | Locks the product's look from frame 1 |
| Moving, complex (stunt, physics, people acting) | Seedance 2.5 with storyboard + character sheets | Needs the full reference set |
| Must stay exactly as in the source | Keep the ad's own clip | No cost; check rights |

## Whole video

| Analysis | Mode |
|---|---|
| Any still shots | **Mix**: photos for stills, a video per moving shot, assembled at the source cut times |
| One shot | One video |
| ≤ 3 moving shots, ≤ 30 s | One video for the whole ad (Seedance 2.5), cut count and times stated; per shot if it drifts |
| More | One video per shot, assembled at the source cut times |

## Timing and music

- Assemble at the **source cut times** when there is no music to follow (voice, ambient sound).
- With music, the music is the timeline: put each cut at its snapped time `cuts[].on_beat`, not the source cut time.
  Source reels often cut 100–250 ms after the beat, so their cut times are not on the beat even when they look it.
- Shots under 1 s are never generated as video.
- Using the source's music in a published ad needs rights; for publishing, use a licensed track in the same tempo.
