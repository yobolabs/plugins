"""ffprobe metadata + ffmpeg silence detection. Durations returned in microseconds."""
import json, re, subprocess

US_PER_S = 1_000_000


def _run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=False).stdout


def _run_stderr(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=False).stderr


def probe(path):
    out = _run(["ffprobe", "-v", "quiet", "-print_format", "json",
                "-show_streams", "-show_format", path])
    data = json.loads(out)
    streams = data.get("streams", [])
    v = next((s for s in streams if s.get("codec_type") == "video"), {})
    has_audio = any(s.get("codec_type") == "audio" for s in streams)
    dur_s = float(data.get("format", {}).get("duration", 0.0))
    return {"dur_us": int(round(dur_s * US_PER_S)),
            "width": int(v.get("width", 0)), "height": int(v.get("height", 0)),
            "has_audio": has_audio}


def silence_trim(path, noise_db=-35, min_sil_s=0.2):
    log = _run_stderr(["ffmpeg", "-i", path, "-af",
                       f"silencedetect=noise={noise_db}dB:d={min_sil_s}", "-f", "null", "-"])
    starts = [float(m) for m in re.findall(r"silence_start:\s*([0-9.]+)", log)]
    ends = [float(m) for m in re.findall(r"silence_end:\s*([0-9.]+)", log)]
    total = probe(path)["dur_us"]
    start_us = int(round(ends[0] * US_PER_S)) if ends else 0
    end_us = int(round(starts[-1] * US_PER_S)) if starts else total
    return start_us, end_us
