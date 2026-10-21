"""Score + VO mix for the guest-lecture reel (src/event.json -> public/event_mix.wav).

Intro: low pad, clock ticks and a heartbeat under the mystery lines, a short silence,
then the drop into a 120 BPM groove with a hit and riser on every scene change.
"""
import json, os, subprocess, sys, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import (SR, braam, clap, convolve, crash, fft_filter, hat, impact, impulse_response, kick, note, pad, place, pluck, riser, rng, tt)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = json.load(open(os.path.join(ROOT, "src", "event.json")))
DUR = E["duration"]; N = int(DUR * SR); BEAT = 60 / E["bpm"]; DROP = E["drop"]

music = np.zeros((2, N)); fx = np.zeros((2, N))

# intro: suspense
place(music, pad([note(45), note(52), note(57)], DROP + 0.5, 1.3), 0.0)
for k in range(int(DROP / BEAT)):
    x = k * BEAT
    t = tt(0.08)
    tick = (np.sin(2 * np.pi * (2400 if k % 2 == 0 else 1800) * t)) * np.exp(-t * 90) * 0.35
    place(fx, tick, x)
    if k % 2 == 0:
        hb = tt(0.45)
        place(fx, np.sin(2 * np.pi * np.cumsum(52 + 40 * np.exp(-hb * 25)) / SR) * np.exp(-hb * 12) * (0.6 + 0.4 * x / DROP), x)
place(fx, riser(2.6, 1.0), DROP - 2.6 - 0.28)

# groove after the drop: Am F C G, four-on-the-floor with offbeat claps and bright arps
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
BASS = [45, 41, 36, 43]
x, i = DROP, 0
while x < DUR - 0.9:
    bar = int((x - DROP) / (BEAT * 4)) % 4
    beat = i % 4
    place(music, kick(1.0), x)
    if beat in (1, 3):
        place(music, clap(0.8), x)
    for s in range(4):
        place(music, hat(0.75 if s == 2 else 0.4), x + s * BEAT / 4)
    for s in range(2):
        place(music, pluck(note(BASS[bar] - 12), 0.22, 650, 2.8), x + s * BEAT / 2)
    for s in range(2):
        arp = CH[bar][[0, 2, 1, 2][(beat * 2 + s) % 4]] + 12
        place(music, np.stack([pluck(note(arp), 0.18, 4400, 0.9), pluck(note(arp + 12), 0.18, 4800, 0.45)]), x + s * BEAT / 2)
    if beat == 0:
        place(music, pad([note(n) for n in CH[bar]], BEAT * 4 + 0.3, 0.9, choir=True), x)
    x += BEAT; i += 1

for h in E["hits"]:
    big = h in E["bigHits"]
    place(fx, crash(1.0 if big else 0.55), h)
    if big:
        place(fx, braam(1.2, 45, 2.6), h); place(fx, impact(0.9), h)
    else:
        place(fx, riser(1.2, 0.35), h - 1.2)
        n = tt(0.5); place(fx, fft_filter(rng.standard_normal(len(n)), lo=500, hi=5000) * np.sin(np.pi * n / 0.5) ** 2 * 0.3, h - 0.25)

def gap(buf, a, b):
    i0, i1 = int(a * SR), int(b * SR); f = int(0.02 * SR)
    buf[:, i0:i0 + f] *= np.linspace(1, 0, f); buf[:, i0 + f:i1] = 0
for a, b in E["silences"]:
    gap(music, a, b); gap(fx, a, b)

bed = music + convolve(music, impulse_response(1.3, 3.6)) * 0.18
bed = bed * 0.9 + fx + convolve(fx, impulse_response(1.2, 4.0)) * 0.2

def rms_db(x): return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)
bed *= 10 ** ((-20.0 - rms_db(bed)) / 20)

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "data", "vo", E["vo_file"]), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
take = np.frombuffer(raw, np.float32).astype(np.float64)
vo = np.zeros((2, N))
for p in E["vo"]:
    a, b = p["src"]; seg = take[int(a * SR):int(b * SR)].copy(); f = int(0.01 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    place(vo, seg, p["at"])
vo = vo + fft_filter(vo, hi=220) * 0.35 + fft_filter(vo, lo=2500, hi=7000) * 0.35
vo = np.tanh(vo * 2.0) / np.tanh(2.0)
voiced = np.abs(vo).mean(0) > 1e-3
vo *= 10 ** ((-12.5 - rms_db(vo[:, voiced])) / 20)
ve = np.convolve(np.abs(vo).mean(0), np.ones(int(0.08 * SR)) / int(0.08 * SR), mode="same")
duck = 1 - 0.68 * np.clip(ve / (np.percentile(ve[ve > 1e-4], 90) + 1e-9), 0, 1)
mix = bed * duck + vo
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix /= np.abs(mix).max() / 0.95
end = int((DUR - 0.5) * SR); mix[:, end:] *= np.linspace(1, 0, N - end)
with wave.open(os.path.join(ROOT, "public", "event_mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype("<i2").tobytes())
kicks = [round(DROP + k * BEAT, 3) for k in range(int((DUR - DROP) / BEAT))]
json.dump({"kicks": kicks}, open(os.path.join(ROOT, "src", "event_beats.json"), "w"))
print("ok")
