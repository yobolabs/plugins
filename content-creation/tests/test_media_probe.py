# content-creation/tests/test_media_probe.py
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "skills", "capcut", "scripts"))
import media_probe as mp

PROBE_JSON = '{"streams":[{"codec_type":"video","width":1080,"height":1920},{"codec_type":"audio"}],"format":{"duration":"5.000000"}}'
SILENCE_LOG = ("[silencedetect] silence_start: 0\n[silencedetect] silence_end: 0.8 | silence_duration: 0.8\n"
               "[silencedetect] silence_start: 4.5 | silence_duration: 0.5\n")

def test_probe_parses_streams(monkeypatch):
    monkeypatch.setattr(mp, "_run", lambda cmd: PROBE_JSON)
    out = mp.probe("x.mp4")
    assert out == {"dur_us": 5_000_000, "width": 1080, "height": 1920, "has_audio": True}

def test_silence_trim(monkeypatch):
    monkeypatch.setattr(mp, "_run_stderr", lambda cmd: SILENCE_LOG)
    monkeypatch.setattr(mp, "_run", lambda cmd: '{"streams":[],"format":{"duration":"6.0"}}')
    start, end = mp.silence_trim("x.mp4")
    assert start == 800_000
    assert end == 4_500_000
