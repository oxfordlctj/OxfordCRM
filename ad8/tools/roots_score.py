"""Score + SFX + VO mix for the "6000-year-old words" reel (src/roots.json -> public/roots_mix.wav).

Ancient drone and taiko under the hook, dead air before "Mother!", then the drop into a 96 BPM
trap groove (808, rolling hats) with a whoosh into every Tajik word and a shimmer on every morph.
The groove drops out for the "бад = bad?" trap and slams back on "Не!".
"""
import json, os, subprocess, sys, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import (SR, braam, clap, convolve, crash, fft_filter, hat, impact, impulse_response, kick, note, pad, place, pluck, riser, rng, taiko, tick, tt)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = json.load(open(os.path.join(ROOT, "src", "roots.json")))
DUR = R["duration"]; N = int(DUR * SR); BEAT = 60 / R["bpm"]; DROP = R["drop"]
GAPS = R["silences"]

music = np.zeros((2, N)); fx = np.zeros((2, N))


def in_gap(t):
    return any(a - 0.02 <= t < b for a, b in GAPS)


def sub808(freq, length=0.9, gain=1.0):
    t = tt(length)
    f = freq * (1 + 1.5 * np.exp(-t * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    s = np.tanh(s * 2.2) / np.tanh(2.2)
    return s * np.exp(-t * 2.4) * gain * 0.9


def whoosh(length=0.45, gain=0.32):
    t = tt(length)
    sweep = np.exp(np.linspace(np.log(500), np.log(6000), len(t)))
    n = fft_filter(rng.standard_normal(len(t)), lo=300, hi=7000)
    return n * np.sin(np.pi * t / length) ** 2 * gain * (0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(sweep) / SR * 0.001))


def shimmer(gain=0.22):
    out = np.zeros(int(1.4 * SR))
    for k, n in enumerate([84, 88, 91, 96]):
        t = tt(1.4 - k * 0.04)
        s = (np.sin(2 * np.pi * note(n) * t) + 0.25 * np.sin(2 * np.pi * note(n) * 3 * t)) * np.exp(-t * 3.2) * gain
        i = int(k * 0.04 * SR); out[i:i + len(s)] += s
    return out


def stamp():
    t = tt(0.6)
    thud = np.sin(2 * np.pi * np.cumsum(60 + 140 * np.exp(-t * 30)) / SR) * np.exp(-t * 7)
    slap = fft_filter(rng.standard_normal(len(t)), lo=200, hi=3000) * np.exp(-t * 40) * 0.8
    return (thud + slap) * 0.9


def heartbeat(gain=0.7):
    t = tt(0.45)
    return np.sin(2 * np.pi * np.cumsum(52 + 40 * np.exp(-t * 25)) / SR) * np.exp(-t * 12) * gain


# ── hook: ancient drone, taiko pulse, riser into dead air
place(music, pad([note(38), note(45), note(50)], DROP + 0.6, 1.2, choir=True), 0.0)
place(fx, braam(0.55, 38, 3.4), 0.15)
for k in range(int(4.1 / BEAT)):
    x = k * BEAT
    place(fx, taiko(85 if k % 2 == 0 else 110, 0.55 + 0.35 * x / 4, 1.0), x)
place(fx, riser(2.3, 0.9), GAPS[0][0] - 2.3)

# ── after the drop: Dm Bb F C, half-time build until the word run, then the full trap groove
CH = [[62, 65, 69], [58, 62, 65], [53, 57, 60], [60, 64, 67]]
ROOTS = [38, 34, 41, 36]
RUN = R["pairs"][0]["at"]
x, i = DROP, 0
while x < DUR - 1.2:
    bar = int((x - DROP) / (BEAT * 4)) % 4
    beat = i % 4
    full = x >= RUN - 0.01
    if not in_gap(x):
        if beat == 0 or (full and beat == 2 and i % 8 == 6):
            place(music, kick(1.0), x)
        if full and beat == 1:
            place(music, kick(0.8), x + BEAT / 2)
        if beat in (1, 3) if full else beat == 2:
            place(music, clap(0.85), x)
        if beat == 0:
            place(music, sub808(note(ROOTS[bar]), BEAT * (2.0 if full else 3.6), 1.0), x)
            place(music, pad([note(n) for n in CH[bar]], BEAT * 4 + 0.3, 0.75 if full else 1.0, choir=True), x)
        if full:
            roll = (i % 8 == 7)
            sub = 8 if roll else 2
            for s in range(sub):
                place(music, hat(0.55 if s % 2 == 0 else 0.35), x + s * BEAT / sub)
            arp = CH[bar][[0, 2, 1, 2][beat]] + 12
            place(music, np.stack([pluck(note(arp), 0.2, 4200, 0.6), pluck(note(arp + 12), 0.2, 4600, 0.3)]), x + BEAT / 2)
        else:
            place(fx, taiko(95, 0.7, 1.0), x)
    x += BEAT; i += 1

# ── hits and transitions
place(fx, impact(1.0), DROP); place(fx, braam(1.2, 38, 2.8), DROP); place(fx, crash(1.0), DROP)
for p in R["pairs"]:
    place(fx, whoosh(0.28, 0.24), p["at"] - 0.2)
    place(fx, shimmer(), p["enAt"])
place(fx, riser(1.4, 0.5), RUN - 1.4); place(fx, crash(0.8), RUN)

# "бад = bad?": the groove is gone, a clock and a heartbeat
a, b = GAPS[1]
k = 0
while a + k * 0.5 < b - 0.1:
    place(fx, tick(0.7 if k % 2 == 0 else 0.45), a + k * 0.5)
    if k % 2 == 0:
        place(fx, heartbeat(0.6 + 0.1 * k / 4), a + k * 0.5 + 0.03)
    k += 1
place(fx, riser(1.0, 0.5), b - 1.0)
place(fx, stamp(), R["no"]); place(fx, impact(1.0), R["no"]); place(fx, crash(1.0), R["no"])
place(fx, braam(0.9, 38, 2.0), R["no"])

place(fx, riser(1.6, 0.6), R["oxford"] - 1.6)
place(fx, impact(1.0), R["oxford"]); place(fx, braam(1.2, 38, 3.0), R["oxford"]); place(fx, crash(1.0), R["oxford"])
# tail drone that loops back into the hook
place(music, pad([note(38), note(45), note(50)], 1.6, 0.9, choir=True), DUR - 1.6)


def gap(buf, a, b):
    i0, i1 = int(a * SR), int(b * SR); f = int(0.02 * SR)
    buf[:, i0:i0 + f] *= np.linspace(1, 0, f); buf[:, i0 + f:i1] = 0


for a, b in GAPS:
    gap(music, a, b)
# the first gap is total silence (dead air before "Mother!")
gap(fx, GAPS[0][0], GAPS[0][1])

bed = music + convolve(music, impulse_response(1.3, 3.6)) * 0.18
bed = bed * 0.9 + fx + convolve(fx, impulse_response(1.2, 4.0)) * 0.2


def rms_db(x):
    return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)


bed *= 10 ** ((-20.0 - rms_db(bed)) / 20)

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "data", "vo", R["vo_file"]), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
take = np.frombuffer(raw, np.float32).astype(np.float64)
vo = np.zeros((2, N))
for p in R["vo"]:
    a, b = p["src"]; seg = take[int(a * SR):int(b * SR)].copy(); f = int(0.012 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    place(vo, seg * 10 ** (p.get("g", 0) / 20), p["at"])
vo = vo + fft_filter(vo, hi=220) * 0.35 + fft_filter(vo, lo=2500, hi=7000) * 0.35
vo = np.tanh(vo * 2.0) / np.tanh(2.0)
voiced = np.abs(vo).mean(0) > 1e-3
vo *= 10 ** ((-12.5 - rms_db(vo[:, voiced])) / 20)
ve = np.convolve(np.abs(vo).mean(0), np.ones(int(0.08 * SR)) / int(0.08 * SR), mode="same")
duck = 1 - 0.68 * np.clip(ve / (np.percentile(ve[ve > 1e-4], 90) + 1e-9), 0, 1)
mix = bed * duck + vo
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix /= np.abs(mix).max() / 0.95
end = int((DUR - 0.3) * SR); mix[:, end:] *= np.linspace(1, 0, N - end)
with wave.open(os.path.join(ROOT, "public", "roots_mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype("<i2").tobytes())
kicks = [round(DROP + k * BEAT, 3) for k in range(int((DUR - DROP) / BEAT)) if not in_gap(DROP + k * BEAT) and k % 4 == 0 or (DROP + k * BEAT >= RUN and not in_gap(DROP + k * BEAT) and k % 2 == 0)]
json.dump({"kicks": sorted(set(kicks))}, open(os.path.join(ROOT, "src", "roots_beats.json"), "w"))
print("ok")
