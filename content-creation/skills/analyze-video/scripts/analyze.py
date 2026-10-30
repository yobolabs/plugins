#!/usr/bin/env python3
"""Decompose a short video: cuts, shots (still / motion), music beats, loudness.

  python3 analyze.py <video file or https url> [--json out.json] [--sheet sheet.jpg]
  python3 analyze.py <music file> --music-only [--json out.json]     # beat grid of a track, no picture

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
MAX_EDIT_BPM = 140   # a grid faster than this is a double-tempo lock (186 on a 93 bpm track): halve it, keep the kick phase
FADE_DB = 10         # last hit: an onset counts while the music is within 10 dB of its mean level (not the fade tail)


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
    """Beat grid: spectral-flux onsets timed at the window CENTRE (hop 5.8 ms) → tempo by autocorrelation →
    period + phase refined by fitting the low-band (kick) onsets, then least squares on the inliers.
    The old version timed onsets at the window start (+1 hop from the diff), ~70 ms early, with a whole-hop tempo;
    its grid locked off the beat (Social Sauce reel: cuts_on_beat 0.04)."""
    sr, hop, win = 22050, 128, 1024
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vn', '-ac', '1', '-ar', str(sr), '-f', 'f32le', 'pipe:1'],
                         capture_output=True).stdout
    y = np.frombuffer(pcm, np.float32)
    if len(y) < 2 * sr:
        return None
    n = 1 + (len(y) - win) // hop
    idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
    mag = np.abs(np.fft.rfft(y[idx] * np.hanning(win), axis=1))
    fq = np.fft.rfftfreq(win, 1 / sr)
    t = (np.arange(n) * hop + win / 2) / sr                          # window centre

    def flux(band):
        f = np.maximum(0, np.diff(np.log1p(mag[:, band] * 10), axis=0)).sum(axis=1)
        return np.concatenate([[0], f])                              # flux[i] = rise INTO frame i

    def onsets(f):
        thr, g = np.median(f) + 1.5 * f.std(), int(0.12 * sr / hop)
        return np.array([t[i] for i in range(1, n - 1) if f[i] >= thr and f[i] == f[max(0, i - g):i + g + 1].max()])

    full, low = flux(fq >= 0), flux(fq < 160)
    fps = sr / hop
    z = full - full.mean()
    ac = np.correlate(z, z, 'full')[len(z) - 1:]
    lo, hi = int(fps * 60 / 180), int(fps * 60 / 70)              # 70–180 bpm
    if hi >= len(ac):
        return None
    period = (lo + int(np.argmax(ac[lo:hi]))) / fps
    ons = onsets(low)
    if len(ons) < 8:
        ons = onsets(full)
    if len(ons) < 4:
        return None
    best = None
    for pc in np.arange(period * 0.97, period * 1.03, 0.0005):
        for ph in np.arange(0, pc, 0.002):
            r = (ons - ph) / pc
            err = np.abs(r - np.round(r)) * pc
            hit = err < 0.04
            key = (hit.sum(), -(err[hit].mean() if hit.any() else 1))
            if best is None or key > best[0]:
                best = (key, pc, ph)
    _, pc, ph = best
    k = np.round((ons - ph) / pc)
    inl = np.abs((ons - ph) / pc - k) * pc < 0.04
    if inl.sum() >= 3:
        pc, ph = np.linalg.lstsq(np.vstack([k[inl], np.ones(inl.sum())]).T, ons[inl], rcond=None)[0]
    ph %= pc
    if 60 / pc > MAX_EDIT_BPM:                                    # double-tempo lock (hats/off-beats): edit on every 2nd beat,
        kick = lambda p: low[np.clip(np.round((np.arange(p, len(y) / sr, 2 * pc) * sr - win / 2) / hop).astype(int), 0, n - 1)].sum()
        ph = ph if kick(ph) >= kick(ph + pc) else ph + pc          # the phase that carries the kick
        pc *= 2
        ph %= pc
    grid = [round(ph + i * pc, 3) for i in range(int(dur / pc) + 2) if ph + i * pc < dur]
    loud = 20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-9)
    return {'bpm': round(60 / pc, 2), 'period': round(float(pc), 4), 'beats': grid, 'mean_db': round(float(loud), 1),
            'last_hit': last_hit(y, sr, onsets(full), grid, loud)}


def last_hit(y, sr, ons, grid, loud):
    """The track's last hit: the last strong onset while the music still plays at level (short-term RMS within
    FADE_DB of the track's mean), i.e. before the fade-out / tail. On the grid when within 40 ms of a beat.
    The end card starts here, not at a fixed time before the end."""
    if not len(ons):
        return None
    w = int(0.1 * sr)
    level = lambda t: 20 * np.log10(np.sqrt(np.mean(y[max(0, int(t * sr) - w // 2):int(t * sr) + w // 2] ** 2)) + 1e-9)
    hits = [float(t) for t in ons if level(t) >= loud - FADE_DB]
    if not hits:
        return None
    h = hits[-1]
    b = min(grid, key=lambda g: abs(g - h)) if grid else None
    return round(b if b is not None and abs(b - h) < 0.04 else h, 3)


def snap_to_beat(t, music, prev=None):
    """Nearest whole beat; if the cut before already took that beat (a fast flash), the half-beat after it."""
    p, b0 = music['period'], music['beats'][0]
    b = b0 + round((t - b0) / p) * p
    if prev is not None and b <= prev + 0.001:
        b = prev + p / 2
    return round(b, 3)


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
    if music and music.get('beats'):
        notes.append('cut the edit ON the beat grid: put each cut at its snapped time (cuts[].on_beat), not the source cut '
                     'time; source reels often cut 100-250 ms after the beat (source cuts on the beat: %s%%)'
                     % (round(on_beat * 100) if on_beat is not None else '?'))
    if any(s['len'] < 1 for s in shots):
        notes.append('very short shots (<1 s): never generate them as video; photos or trimmed clips only')
    return {'mode': mode, 'shots': steps, 'notes': notes}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('--json'); ap.add_argument('--sheet')
    ap.add_argument('--music-only', action='store_true', help='beat grid of a music track only (no picture pass)')
    a = ap.parse_args()
    dur, has_audio = probe(a.src)
    if a.music_only:
        music = beats(a.src, dur) if has_audio else None
        print('music: %s · %d beats · last hit %s' % (('%s bpm' % music['bpm']) if music else 'none',
              len(music['beats']) if music else 0, music['last_hit'] if music else None))
        if a.json:
            json.dump({'duration': round(dur, 2), 'music': music}, open(a.json, 'w'), indent=1)
        return
    cuts, shots, med = cuts_and_shots(frames(a.src), dur, a.src)
    music = beats(a.src, dur) if has_audio else None
    on_beat = None
    if music and music['beats']:
        prev = None                                              # only hard cuts chain: a soft cut never pushes a hard one
        for c in cuts:
            if c['hard']:
                c['on_beat'] = prev = snap_to_beat(c['t'], music, prev)
            else:
                c['on_beat'] = snap_to_beat(c['t'], music)
            c['beat_off_ms'] = round(1000 * (c['t'] - c['on_beat']))
        hard = [c['t'] for c in cuts if c['hard']]
        if hard:
            on_beat = round(sum(1 for t in hard if min(abs(t - b) for b in music['beats']) <= 0.05) / len(hard), 2)
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
