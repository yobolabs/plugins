#!/usr/bin/env python3
"""Decompose a short video: cuts, shots (still / motion), music beats, loudness.

  python3 analyze.py <video file or https url> [--json out.json] [--sheet sheet.jpg]

Needs ffmpeg + ffprobe on PATH and numpy. Prints a short table; --json writes the full result.
Thresholds are tuned on real ads (see references/cuts-and-shots.md); change them there and here together.
"""
import argparse, json, subprocess, sys
import numpy as np

STEP = 0.25          # seconds between sampled frames (4 fps)
SIDE = 32            # frames are compared as 32x32 grey
STILL_MAX = 0.5      # a shot is 'still' only when NO sampled change inside it reaches this
JUMP_MIN, JUMP_RATIO = 40, 1.6   # a cut beside a moving shot: big AND well above both neighbours
SPIKE_MIN, SPIKE_RATIO = 25, 4   # a cut between still shots: from ~0 to 25+
MIN_GAP = 0.45       # two cuts closer than this are one cut (photo slideshows cut every ~0.5 s)
FR_MIN, FR_RATIO, FR_WIN = 20, 4, 5   # full-rate cut: change >= 20 and >= 4x the median of the 5 frames each side
FR_MIN_GAP = 0.1     # ignore a 'cut' in the first/last 3 frames (fades, encoder glitches)


def probe(src):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type',
                                   '-of', 'json', src])
    d = json.loads(out)
    return float(d['format']['duration']), any(s.get('codec_type') == 'audio' for s in d.get('streams', []))


def frames(src):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', 'fps=%g,scale=%d:%d,format=gray' % (1 / STEP, SIDE, SIDE),
                          '-f', 'rawvideo', 'pipe:1'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, SIDE * SIDE).astype(np.float32)


def native_fps(src):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate',
                                   '-of', 'csv=p=0', src]).decode().strip()
    n, _, d = out.partition('/')
    return float(n) / float(d or 1)


def full_rate_cuts(src):
    """Every hard cut, read at the source's own frame rate: one 32x32 grey pass over all frames (cheap for short ads).
    A cut is one frame whose change is big AND far above the frames around it, so cuts inside moving shots and
    cuts a beat apart (~0.25 s) are kept; the time is the first frame of the new shot, counted from the start."""
    fps = native_fps(src)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', 'scale=%d:%d,format=gray' % (SIDE, SIDE),
                          '-fps_mode', 'passthrough', '-f', 'rawvideo', 'pipe:1'], capture_output=True, check=True).stdout
    g = np.frombuffer(raw, np.uint8)
    g = g[: len(g) // (SIDE * SIDE) * SIDE * SIDE].reshape(-1, SIDE * SIDE).astype(np.float32)
    d = np.abs(np.diff(g, axis=0)).mean(axis=1)               # d[i] = change from frame i to i+1
    out = []
    for i, x in enumerate(d):
        around = np.concatenate([d[max(0, i - FR_WIN):i], d[i + 1:i + 1 + FR_WIN]])
        base = float(np.median(around)) if len(around) else 0.0
        if x >= FR_MIN and x >= FR_RATIO * max(base, 1.0) and x == d[max(0, i - 2):i + 3].max():
            out.append({'t': round((i + 1) / fps, 3), 'strength': round(float(x), 1), 'hard': True, 'frame': i + 1})
    return [c for c in out if FR_MIN_GAP <= c['t'] <= len(g) / fps - FR_MIN_GAP]


def cuts_and_shots(f, dur, src=None):
    diffs = np.abs(np.diff(f, axis=0)).mean(axis=1)          # diffs[i] = change from sample i to i+1
    times = (np.arange(1, len(f)) + 0.5) * STEP - STEP / 2    # cut time sits between the two samples
    med = float(np.median(diffs)) if len(diffs) else 0.0
    bar, hard_bar = max(12, med * 3), max(25, med * 6)
    cuts, last = [], 0.0
    for i, x in enumerate(diffs):
        l = diffs[i - 1] if i else 0.0
        r = diffs[i + 1] if i + 1 < len(diffs) else 0.0
        jump = x >= JUMP_MIN and x >= JUMP_RATIO * max(l, r)
        if (x >= bar or jump) and x >= l and x >= r and times[i] - last >= MIN_GAP and dur - times[i] >= 0.3:
            hard = x >= hard_bar or (x >= SPIKE_MIN and x >= SPIKE_RATIO * max(l, r, 1)) or jump
            cuts.append({'t': round(float(times[i]), 2), 'strength': round(float(x), 1), 'hard': bool(hard)})
            last = times[i]
    if src:
        hard = full_rate_cuts(src)          # hard cuts from the full-rate pass; soft ones stay 4 fps unless a hard cut is there
        cuts = hard + [c for c in cuts if not c['hard'] and all(abs(c['t'] - h['t']) > 0.2 for h in hard)]
        cuts.sort(key=lambda c: c['t'])
    edges = [0.0] + [c['t'] for c in cuts if c['hard']] + [round(dur, 3)]
    shots = []
    for a, b in zip(edges, edges[1:]):
        inner = [float(diffs[i]) for i in range(len(diffs)) if a + 0.2 < times[i] < b - 0.2]   # keep the cut itself out
        kind = ('still' if b - a < 1 else 'motion') if not inner else ('still' if max(inner) < STILL_MAX else 'motion')
        shots.append({'a': round(a, 3), 'b': round(b, 3), 'len': round(b - a, 3), 'type': kind,
                      'motion': round(max(inner), 1) if inner else None})
    return cuts, shots, med


def beats(src, dur):
    """Onset envelope (spectral flux) → tempo by autocorrelation → beat grid fitted to the strongest onsets."""
    sr, hop, win = 22050, 512, 2048
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vn', '-ac', '1', '-ar', str(sr), '-f', 'f32le', 'pipe:1'],
                         capture_output=True).stdout
    y = np.frombuffer(pcm, np.float32)
    if len(y) < sr:
        return None
    n = 1 + (len(y) - win) // hop
    idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
    mag = np.abs(np.fft.rfft(y[idx] * np.hanning(win), axis=1))
    flux = np.maximum(0, np.diff(np.log1p(mag), axis=0)).sum(axis=1)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)
    fps = sr / hop
    ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
    lo, hi = int(fps * 60 / 180), int(fps * 60 / 70)              # 70–180 bpm
    if hi >= len(ac):
        return None
    lag = lo + int(np.argmax(ac[lo:hi]))
    bpm = 60 * fps / lag
    phase = max(range(lag), key=lambda p: flux[p::lag].sum())
    grid = [round((phase + k * lag) / fps, 2) for k in range(int((len(flux) - phase) / lag) + 1)]
    loud = 20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-9)
    return {'bpm': round(bpm, 1), 'beats': [t for t in grid if t < dur], 'mean_db': round(float(loud), 1)}


def plan(shots, music, on_beat):
    """Suggested structure: how to make each shot, and the mode for the whole video."""
    steps = []
    for i, s in enumerate(shots, 1):
        if s['type'] == 'still':
            how = 'photo: swap the product into the ad\'s own frame (1 picture)'
        elif s['len'] < 2:
            how = 'video for this shot, then trim to %.2f s in the edit (models stretch short shots to ~4 s)' % s['len']
        else:
            how = 'video for this shot (start from a product-swapped frame to lock the look)'
        steps.append({'shot': i, 'a': s['a'], 'b': s['b'], 'type': s['type'], 'make': how})
    stills = sum(s['type'] == 'still' for s in shots)
    moving = len(shots) - stills
    if stills:
        mode = 'mix: %d photo shot(s) + %d video shot(s), assembled at the source cut times' % (stills, moving)
    elif len(shots) == 1:
        mode = 'one video (single take)'
    elif moving <= 3 and shots[-1]['b'] <= 30:   # Seedance 2.5 makes up to 30 s; the ramp ad's best run was one video
        mode = 'one video for the whole ad (Seedance 2.5) with the cut count and times stated; or one per shot if it drifts'
    else:
        mode = 'one video per shot, assembled at the source cut times'
    notes = []
    if on_beat is not None and on_beat >= 0.5:
        notes.append('cuts land on the beat (%d%%): keep the source cut times and cut the edit to the music' % round(on_beat * 100))
    if any(s['len'] < 1 for s in shots):
        notes.append('very short shots (<1 s): never generate them as video; photos or trimmed clips only')
    return {'mode': mode, 'shots': steps, 'notes': notes}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('--json'); ap.add_argument('--sheet')
    a = ap.parse_args()
    dur, has_audio = probe(a.src)
    cuts, shots, med = cuts_and_shots(frames(a.src), dur, a.src)
    music = beats(a.src, dur) if has_audio else None
    on_beat = None
    if music and music['beats']:
        hard = [c['t'] for c in cuts if c['hard']]
        if hard:
            on_beat = round(sum(1 for t in hard if min(abs(t - b) for b in music['beats']) <= 0.12) / len(hard), 2)
    res = {'duration': round(dur, 2), 'median_change': round(med, 1), 'cuts': cuts, 'shots': shots,
           'music': music, 'cuts_on_beat': on_beat, 'plan': plan(shots, music, on_beat)}
    for s in shots:
        print('%5.2f-%5.2f  %-6s  %4.2f s  motion %s' % (s['a'], s['b'], s['type'], s['len'], s['motion']))
    print('cuts: %d hard, %d soft · music: %s · cuts on beat: %s' % (
        sum(c['hard'] for c in cuts), sum(not c['hard'] for c in cuts),
        ('%s bpm' % music['bpm']) if music else 'none', on_beat))
    print('plan: ' + res['plan']['mode'])
    for n in res['plan']['notes']:
        print('  - ' + n)
    if a.json:
        json.dump(res, open(a.json, 'w'), indent=1)
    if a.sheet:
        subprocess.run(['ffmpeg', '-v', 'error', '-i', a.src, '-vf', 'fps=2,scale=120:-1,tile=10x%d' % max(1, int(dur * 2 / 10) + 1),
                        '-frames:v', '1', '-y', a.sheet], check=True)


if __name__ == '__main__':
    sys.exit(main())
