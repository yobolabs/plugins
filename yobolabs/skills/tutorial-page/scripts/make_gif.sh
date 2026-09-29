#!/usr/bin/env bash
# Build a looping GIF from captured frames (capture.py frame()).
#   make_gif.sh <frames-dir> <out.gif> [fps=2] [width=1200]
# Delete bad frames first (e.g. after a dialog closed) — every PNG in the dir is used, in name order.
set -euo pipefail
dir=${1:?frames dir}; out=${2:?out.gif}; fps=${3:-2}; width=${4:-1200}
ffmpeg -loglevel error -y -framerate "$fps" -pattern_type glob -i "$dir/*.png" \
  -vf "scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer" \
  -loop 0 "$out"
echo "$out $(wc -c <"$out" | tr -d ' ') bytes, $(ls "$dir"/*.png | wc -l | tr -d ' ') frames"
