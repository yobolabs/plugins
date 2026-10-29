# Reviewing a result against the source

Back to [SKILL.md](../SKILL.md). Read after every paid run, before changing the prompt.

## Commands

Check EVERY clip and every part, second by second, never one frame per scene (a one-frame check missed burned-in
captions in 7 kept clips). Compare against the source AND against the brief.

```bash
# 1 fps strip, source on top, remix below (whole part)
ffmpeg -v error -i source.mp4 -vf "fps=1,scale=150:-1,tile=30x1" -frames:v 1 -y s_strip.jpg
ffmpeg -v error -i result.mp4 -vf "fps=1,scale=150:-1,tile=30x1" -frames:v 1 -y o_strip.jpg
ffmpeg -v error -i s_strip.jpg -i o_strip.jpg -filter_complex vstack -y strip.jpg

# matched frames: source time t, result time t * (result_len / source_len)
for t in 0.8 2.5 5 7.5 9.5 10.5 11.5 12.5 14 15.5; do
  ffmpeg -v error -ss $t -i source.mp4 -frames:v 1 -vf scale=150:267 -y s_$t.jpg
  ffmpeg -v error -ss $(python3 -c "print(round($t*0.75,2))") -i result.mp4 -frames:v 1 -vf scale=150:267 -y o_$t.jpg
done
# then hstack each row and vstack source over result into one compare.jpg

ffmpeg -v error -i result.mp4 -vf "fps=2,scale=150:-1,tile=8x3" -frames:v 1 grid.jpg   # every half second
ffprobe -v error -show_entries stream=codec_type,codec_name -of csv=p=0 result.mp4      # audio stream present?
ffmpeg -i result.mp4 -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume" # not silent
```

Also look at the references that were actually sent (download each `image_urls` entry): most failures trace to
a reference, not the words.

## Report as a table

| Time | Source | Result | Verdict |
|---|---|---|---|

Then: the cause (with evidence: the prompt line or the reference), the fix, and what to try next.

## Storyboard review (before the human sees a storyboard)

AI review of every storyboard image against the brief; any fail is redone before it is shown. Then the human
approves each one; an agent never clicks Approve for them.

- [ ] The right cast member for each role in every panel; look-alikes not swapped; nobody repeated or duplicated
- [ ] The people the ad shows behind or around the speaker are kept, as the new team, softly out of focus — never a speaker alone on a bare wall unless the ad shows that
- [ ] Room, set and colours match the brief's set + palette
- [ ] No text, panel labels, numbers, captions or logos drawn; no logos, mascots or signs of the old brand
- [ ] App / chat / website screens are a phone held by a character with a flat green screen
- [ ] Product is the product (shape, label), at the source subject's size and place

## Checklist (every generated part)

- [ ] Number of cuts and their times match — re-run `analyze-video` on the export; same count, same frames
- [ ] Each clip shows its payoff (landing, reveal, label to camera), not a fixed offset
- [ ] No product in two shots in a row
- [ ] On-screen text copies the source's own type look (font weight, size, position, logo spot), not a generic box
- [ ] **Against the brief, row by row** (must keep / must change / never / text / end card / size) before the merchant sees it
- [ ] Each shot's size, height, three-quarter / side-on, distance
- [ ] The setting keeps its shape (in one run a curved slab became a loop)
- [ ] People: same number, same actions, faces consistent across shots; lines spoken as written
- [ ] The action order and timing — every step present, not early, not skipped
- [ ] The product is the product: no parts, features or text of the old subject
- [ ] Slop check, frame by frame: orientation changes only with a visible turn (printed design turns with it); nothing appears or vanishes; counts stay the same; faces, hands and clothes stay the same; the place keeps its layout; nothing floats; every glow or effect has a source; screen direction holds across cuts
- [ ] No logo anywhere except the product's own printed label
- [ ] No text, captions, prices or logos burned in anywhere (they are added in post)
- [ ] Right person per role in every shot; the background people present; no repeated people
- [ ] Set and colours as the brief; phone shots: phone held steady, screen green and keyable
- [ ] Timing drift against the source per cut; voices the same per role across parts
- [ ] Sound present and not silent

## Fixing a part

1–2 shots wrong → splice: cut them out and remake just those shots, using that part's own audio as the lip-sync
reference, so the voices stay identical. Most shots wrong → remake the whole part (every clip bills at least 4 s, so
many small remakes cost more).
