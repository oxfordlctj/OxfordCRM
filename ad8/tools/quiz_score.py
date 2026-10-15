"""Score + SFX + VO mix for the Oxford quiz reel (src/quiz.json -> public/quiz_mix.wav).

Upbeat 128 BPM groove; on each 3-second timer the groove drops out to a ticking clock and
heartbeat, then the reveal fires a buzzer on the wrong option and a chime on the right one.
"""
import json, os, subprocess, sys, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import (SR, braam, clap, convolve, crash, fft_filter, hat, impact, impulse_response, kick, note, pad, place, pluck, riser, rng, tt)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Q = json.load(open(os.path.join(ROOT, "src", "quiz.json")))
DUR = Q["duration"]
N = int(DUR * SR)
BEAT = 60 / Q["bpm"]
TIMERS = Q["timers"]


def in_timer(t, pad_=0.0):
    return any(a - pad_ <= t < b for a, b in TIMERS)


def buzzer():
    t = tt(0.45)
    s = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5 + np.sign(np.sin(2 * np.pi * 116 * t)) * 0.5
    return fft_filter(s, hi=1800) * np.exp(-t * 3) * 0.32


def chime():
    out = np.zeros(int(1.6 * SR))
    for k, n in enumerate([76, 79, 84, 88]):
        t = tt(1.6 - k * 0.07)
        s = (np.sin(2 * np.pi * note(n) * t) + 0.3 * np.sin(2 * np.pi * note(n) * 2 * t)) * np.exp(-t * 4) * 0.22
        i = int(k * 0.07 * SR)
        out[i:i + len(s)] += s
    return out


def clock_tick(accent):
    t = tt(0.09)
    f = 2600 if accent else 1900
    return (np.sin(2 * np.pi * f * t) + fft_filter(rng.standard_normal(len(t)), lo=3000) * 0.4) * np.exp(-t * 90) * (0.55 if accent else 0.35)


def heartbeat():
    t = tt(0.5)
    a = np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-t * 25)) / SR) * np.exp(-t * 12)
    return a * 0.8


def whoosh(length=0.6):
    t = tt(length)
    n = rng.standard_normal(len(t))
    e = np.sin(np.pi * t / length) ** 2
    return (fft_filter(n, lo=400, hi=5000)) * e * 0.35


music = np.zeros((2, N))
fx = np.zeros((2, N))

CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G
BASS = [45, 41, 36, 43]

# groove everywhere except the timers
x = 0.0
i = 0
while x < DUR - 0.5:
    bar = int(x / (BEAT * 4)) % 4
    beat = i % 4
    if not in_timer(x, 0.05):
        place(music, kick(0.95), x)
        if beat in (1, 3):
            place(music, clap(0.7), x)
        for s in range(2):
            place(music, hat(0.7 if s else 0.45), x + s * BEAT / 2)
        place(music, hat(0.3), x + BEAT * 0.75)
        for s in range(2):
            place(music, pluck(note(BASS[bar] - 12), 0.22, 600, 2.6), x + s * BEAT / 2)
        arp = CH[bar][[0, 2, 1, 2][beat]] + 12
        place(music, np.stack([pluck(note(arp), 0.2, 4200, 0.9), pluck(note(arp + 12), 0.2, 4500, 0.45)]), x + BEAT / 2)
        if beat == 0:
            place(music, pad([note(n) for n in CH[bar]], BEAT * 4 + 0.4, 0.8), x)
    x += BEAT
    i += 1

# timers: drop to clock + heartbeat; riser into the reveal
for a, b in TIMERS:
    for k in range(3):
        place(fx, clock_tick(True), a + k)
        place(fx, clock_tick(False), a + k + 0.5)
        place(fx, heartbeat(), a + k + 0.02)
    place(fx, riser(1.4, 0.45), b - 1.4)
    # soft low pad under the tension
    place(music, pad([note(45), note(52)], b - a, 0.7), a)

for r in Q["reveals"]:
    place(fx, buzzer(), r)
    place(fx, chime(), r + 0.22)
    place(fx, crash(0.6), r + 0.22)
    place(fx, kick(1.0), r + 0.22)

for q in Q["questions"]:
    place(fx, whoosh(0.5), q - 0.25)

# hook + brand hits
place(fx, braam(1.0, 45, 2.4), 0.0)
place(fx, impact(0.6), 0.0)
place(fx, impact(0.8), Q["cta"]["brand"])
place(fx, braam(1.0, 45, 3.0), Q["cta"]["brand"])
place(fx, crash(0.8), Q["cta"]["count"])

bed = music + convolve(music, impulse_response(1.4, 3.5)) * 0.18
fx = fx + convolve(fx, impulse_response(1.2, 4.0)) * 0.2
bed = bed * 0.85 + fx


def rms_db(x):
    return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)


bed *= 10 ** ((-20.5 - rms_db(bed)) / 20)

# VO
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "data", "vo", Q["vo_file"]), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
take = np.frombuffer(raw, np.float32).astype(np.float64)
vo = np.zeros((2, N))
for p in Q["vo"]:
    a, b = p["src"]
    seg = take[int(a * SR):int(b * SR)].copy()
    f = int(0.01 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    place(vo, seg, p["at"])
vo = vo + fft_filter(vo, lo=2500, hi=7000) * 0.35
vo = np.tanh(vo * 2.0) / np.tanh(2.0)
voiced = np.abs(vo).mean(0) > 1e-3
vo *= 10 ** ((-12.5 - rms_db(vo[:, voiced])) / 20)

ve = np.convolve(np.abs(vo).mean(0), np.ones(int(0.08 * SR)) / int(0.08 * SR), mode="same")
duck = 1 - 0.68 * np.clip(ve / (np.percentile(ve[ve > 1e-4], 90) + 1e-9), 0, 1)
mix = bed * duck + vo
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix /= np.abs(mix).max() / 0.95
end = int((DUR - 0.25) * SR)
mix[:, end:] *= np.linspace(1, 0, N - end)

out = os.path.join(ROOT, "public", "quiz_mix.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype("<i2").tobytes())

kicks = [round(k * BEAT, 3) for k in range(int(DUR / BEAT)) if not in_timer(k * BEAT, 0.05)]
json.dump({"kicks": kicks}, open(os.path.join(ROOT, "src", "quiz_beats.json"), "w"))
print("wrote", out)
