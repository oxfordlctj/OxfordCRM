"""Audio for the notebook-style reel: a quiet lo-fi bed, foley for every pen stroke, and the VO.

Writes public/native_mix.wav (with the bed) and out/native_vo_sfx.wav (voice and foley only, for
posting with a trending Instagram sound instead).
"""
import json, os, subprocess, sys, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import SR, convolve, fft_filter, impulse_response, note, place, rng, tt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = json.load(open(os.path.join(ROOT, "src", "native.json")))
TL = json.load(open(os.path.join(ROOT, "src", "native_tl.json")))
DUR = N["duration"]; LEN = int(DUR * SR)
music = np.zeros((2, LEN)); fol = np.zeros((2, LEN))


def scratch(d, gain=0.16):
    """ballpoint on paper: band-passed noise, chopped into letter-sized strokes"""
    t = tt(d + 0.05)
    n = fft_filter(rng.standard_normal(len(t)), lo=1800, hi=7500)
    strokes = np.clip(np.sin(2 * np.pi * (9 + 3 * rng.random()) * t + rng.random() * 6), 0, 1) ** 0.6
    wob = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 23 * t))
    env = np.minimum(1, t / 0.02) * np.minimum(1, (t[-1] - t) / 0.04)
    return n * strokes * wob * env * gain


def slap(gain=0.6):
    t = tt(0.35)
    thump = np.sin(2 * np.pi * np.cumsum(90 + 120 * np.exp(-t * 40)) / SR) * np.exp(-t * 22)
    crinkle = fft_filter(rng.standard_normal(len(t)), lo=1500, hi=9000) * np.exp(-t * 18) * 0.5
    return (thump + crinkle) * gain


def peel(gain=0.35):
    t = tt(0.4)
    return fft_filter(rng.standard_normal(len(t)), lo=2500, hi=9000) * np.sin(np.pi * t / 0.4) ** 2 * (0.5 + 0.5 * np.sin(2 * np.pi * 60 * t)) * gain


def swish(length=0.6, gain=0.12):
    t = tt(length)
    return fft_filter(rng.standard_normal(len(t)), lo=300, hi=3000) * np.sin(np.pi * t / length) ** 2 * gain


def marker(d, gain=0.1):
    t = tt(d)
    return fft_filter(rng.standard_normal(len(t)), lo=600, hi=2500) * np.sin(np.pi * t / d) * gain


# ── foley
for s, d in TL["strokes"]:
    place(fol, scratch(d), s + N.get("foley_lag", 0.0))
for l in TL["lines"]:
    if l["kind"] != "header":
        place(fol, marker(0.28), l["te"] + l["den"] + 0.08)
x = TL["extra"]; nt = TL["note"]
place(fol, slap(0.55), nt["in"]); place(fol, peel(), nt["out"])
place(fol, slap(0.75), x["sticker"])
place(fol, swish(0.8), x["zoomOut"]); place(fol, swish(0.7), x["toBottom"])

# ── lo-fi bed: 84 BPM, Fmaj7 Em7 Dm7 Cmaj7, soft drums, vinyl crackle
BPM = 84; B = 60 / BPM
CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]


def keys(freqs, length, gain=1.0):
    t = tt(length)
    s = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) for f in freqs)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return fft_filter(s * trem, hi=2200) * np.exp(-t * 0.9) * np.minimum(1, t / 0.01) * 0.05 * gain


def soft_kick(gain=1.0):
    t = tt(0.4)
    return np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-t * 30)) / SR) * np.exp(-t * 9) * 0.7 * gain


def snare(gain=1.0):
    t = tt(0.25)
    return fft_filter(rng.standard_normal(len(t)), lo=900, hi=4500) * np.exp(-t * 22) * 0.35 * gain


def shaker(gain=1.0):
    t = tt(0.08)
    return fft_filter(rng.standard_normal(len(t)), lo=5000) * np.exp(-t * 60) * 0.12 * gain


start = 0.0
k = 0
while start + k * B < DUR - 1.0:
    x0 = start + k * B
    bar = (k // 4) % 4
    beat = k % 4
    swing = 0.06 * B
    if beat == 0:
        place(music, keys([note(n) for n in CH[bar]], B * 4 + 0.4, 1.0), x0)
        place(music, np.sin(2 * np.pi * note(CH[bar][0] - 24) * tt(B * 3.5)) * np.exp(-tt(B * 3.5) * 1.2) * 0.22, x0)
    if x0 > 0.4:
        if beat in (0, 2) or (beat == 3 and k % 8 == 7):
            place(music, soft_kick(0.9 if beat == 0 else 0.7), x0 + (B / 2 if beat == 3 else 0))
        if beat in (1, 3):
            place(music, snare(0.8), x0)
        for s in range(2):
            place(music, shaker(1.0 if s == 0 else 0.6), x0 + s * (B / 2 + swing))
    k += 1
crackle = np.zeros(LEN)
pops = rng.random(LEN) > 0.99965
crackle[pops] = rng.standard_normal(pops.sum()) * 0.5
crackle = fft_filter(crackle, lo=1200, hi=9000) + fft_filter(rng.standard_normal(LEN), lo=3000, hi=8000) * 0.004
music += crackle
music = fft_filter(music, hi=6500)                       # lo-fi: roll off the top
music += convolve(music, impulse_response(1.0, 4.0)) * 0.12


def rms_db(v):
    return 20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-12)


music *= 10 ** ((-27.0 - rms_db(music)) / 20)
fol = fol + convolve(fol, impulse_response(0.35, 9.0)) * 0.15   # small room
fol *= 10 ** ((-29.0 - rms_db(fol)) / 20)

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "data", "vo", N["vo_file"]), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
take = np.frombuffer(raw, np.float32).astype(np.float64)
vo = np.zeros((2, LEN))
place(vo, take, N["lead"])
# phone-ish but clean: gentle presence lift and light compression
vo = vo + fft_filter(vo, lo=2500, hi=6500) * 0.25
vo = np.tanh(vo * 1.6) / np.tanh(1.6)
voiced = np.abs(vo).mean(0) > 1e-3
vo *= 10 ** ((-14.0 - rms_db(vo[:, voiced])) / 20)
ve = np.convolve(np.abs(vo).mean(0), np.ones(int(0.1 * SR)) / int(0.1 * SR), mode="same")
duck = 1 - 0.45 * np.clip(ve / (np.percentile(ve[ve > 1e-4], 90) + 1e-9), 0, 1)


def write(path, mix):
    mix = mix / (np.abs(mix).max() / 0.95)
    end = int((DUR - 0.4) * SR); mix[:, end:] *= np.linspace(1, 0, LEN - end)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix.T * 32767).astype("<i2").tobytes())


write(os.path.join(ROOT, "public", "native_mix.wav"), music * duck + fol + vo)
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
write(os.path.join(ROOT, "out", "native_vo_sfx.wav"), fol + vo)
print("ok")
