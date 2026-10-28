# Reviewing a result against the source

Back to [SKILL.md](../SKILL.md). Read after every paid run, before changing the prompt.

## Commands

```bash
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

## Checklist

- [ ] Number of cuts and their times match
- [ ] Each shot's size, height, three-quarter / side-on, distance
- [ ] The setting keeps its shape (in one run a curved slab became a loop)
- [ ] People: same number, same actions, faces consistent across shots; lines spoken as written
- [ ] The action order and timing — every step present, not early, not skipped
- [ ] The product is the product: no parts, features or text of the old subject
- [ ] Slop check, frame by frame: orientation changes only with a visible turn (printed design turns with it); nothing appears or vanishes; counts stay the same; faces, hands and clothes stay the same; the place keeps its layout; nothing floats; every glow or effect has a source; screen direction holds across cuts
- [ ] Logo only where asked
- [ ] Sound present and not silent
