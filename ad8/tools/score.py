"""Synthesize the trailer score + sound design and mix it under the voiceover.

Everything is generated here (no samples): drones, sub braams, risers, whooshes,
pin pings, a ticking pulse and the reveal impact. Output: public/soundtrack.wav
"""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
T = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
DUR = T["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(3)
t = np.arange(N) / SR


def env(n, a, r, curve=2.0):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** curve
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def place(buf, sig, at):
    i = int(at * SR)
    if i < 0: sig, i = sig[-i:], 0
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[:j - i]


def lp_fast(x, fc):
    # FFT brickwall-ish smooth lowpass for static cutoffs
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def hp_fast(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / (1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


L = np.zeros(N); R = np.zeros(N)

# ── drone bed: D minor, slowly breathing, opens up at the reveal ──
def saw(f, tt, detune=0.0):
    ph = (f * (1 + detune)) * tt
    return 2 * (ph % 1) - 1

reveal = T["hits"]["reveal"]
bed_gain = np.interp(t, [0, 3, 14, 29, 33.5, reveal, reveal + 2, 55, 57, DUR - 3, DUR],
                     [0, .5, .55, .65, .9, .35, .7, .6, .85, .7, 0])
for f, pan, g in [(36.71, .5, .9), (73.42, .3, .6), (110.0, .7, .45), (146.83, .2, .25), (220.0, .8, .14), (174.61, .6, .12)]:
    s = saw(f, t, rng.uniform(-.003, .003)) + saw(f, t, rng.uniform(.002, .006))
    s = lp_fast(s, 380 if f < 150 else 900) * g
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * t / rng.uniform(7, 13) + rng.uniform(0, 6))
    L += s * lfo * bed_gain * (1 - pan) * 0.12
    R += s * lfo * bed_gain * pan * 0.12
# airy shimmer on top after the reveal
air = hp_fast(rng.standard_normal(N), 5000) * np.interp(t, [0, reveal, reveal + 3, DUR - 2, DUR], [0, 0, .015, .02, 0])
L += air; R += np.roll(air, 211)

# ── sub braams on scene changes ──
def braam(at, gain=1.0, length=3.2, f0=36.7):
    n = int(length * SR); tt = np.arange(n) / SR
    pitch = f0 * (1 + 0.5 * np.exp(-tt * 18))
    ph = np.cumsum(pitch) / SR
    body = np.sin(2 * np.pi * ph) + 0.6 * np.sin(4 * np.pi * ph) + 0.3 * saw(f0 * 2, tt, .004)
    grit = lp_fast(rng.standard_normal(n), 1200) * np.exp(-tt * 6) * 0.6
    sig = np.tanh((body + grit) * 1.6) * env(n, .005, length * .8, 1.6) * gain * 0.5
    place(L, sig, at); place(R, sig, at)

def riser(end, length=2.4, gain=0.6):
    n = int(length * SR); tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sweep = 400 * (30 ** (tt / length))
    sig = np.zeros(n)
    # cheap time-varying filter: crossfade 6 static bands
    bands = [lp_fast(noise, fc) - lp_fast(noise, fc * .45) for fc in (600, 1200, 2400, 4800, 9000, 15000)]
    pos = np.clip(np.log(sweep / 600) / np.log(25) * 5, 0, 5)
    for k, b in enumerate(bands):
        sig += b * np.clip(1 - np.abs(pos - k), 0, 1)
    tone = np.sin(2 * np.pi * np.cumsum(110 * (8 ** (tt / length))) / SR) * 0.25
    sig = (sig + tone) * (tt / length) ** 2.2 * gain * 0.6
    place(L, sig, end - length); place(R, sig[::-1][::-1] * 0.95, end - length + 0.004)

def whoosh(at, length=1.1, gain=0.5, pan=0.5):
    n = int(length * SR); tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sig = lp_fast(noise, 2500) - lp_fast(noise, 300)
    e = np.sin(np.pi * np.clip(tt / length, 0, 1)) ** 3
    sig = sig * e * gain * 0.5
    place(L, sig * (1 - pan) * 2, at - length / 2); place(R, sig * pan * 2, at - length / 2)

def ping(at, f=1318.5, gain=0.35, pan=0.5):
    n = int(2.6 * SR); tt = np.arange(n) / SR
    sig = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 6) +
           0.2 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt * 12)) * np.exp(-tt * 2.2) * env(n, .002, .3)
    tick = lp_fast(rng.standard_normal(int(.02 * SR)), 6000) * np.linspace(1, 0, int(.02 * SR)) * 0.8
    sig[:len(tick)] += tick
    sig *= gain * 0.5
    place(L, sig * (1.2 - pan), at); place(R, sig * (0.2 + pan), at + 0.012)

def impact(at, gain=1.0):
    braam(at, gain * 1.4, 5.5, 27.5)
    n = int(.6 * SR); tt = np.arange(n) / SR
    crack = (rng.standard_normal(n) * np.exp(-tt * 14)) * 0.9
    place(L, hp_fast(crack, 900) * gain * .5, at); place(R, hp_fast(np.roll(crack, 37), 900) * gain * .5, at)
    # long reverse-ish tail
    n = int(4 * SR); tt = np.arange(n) / SR
    tail = lp_fast(rng.standard_normal(n), 3000) * np.exp(-tt * 1.2) * 0.12 * gain
    place(L, tail, at); place(R, np.roll(tail, 1999), at)

H = T["hits"]
braam(H["open"], 0.9)
riser(H["country"], 2.6, 0.5); braam(H["country"], 0.8); whoosh(H["country"] + .1, 1.6, .7)
riser(H["city"], 2.0, 0.55); braam(H["city"], 1.0); whoosh(H["city"], 1.4, .8, .3)
for k, p in enumerate(T["pins"]):
    ping(p, [1318.5, 1174.7, 1568.0, 1318.5, 1760.0, 1568.0, 1975.5][k % 7], 0.32, 0.25 + 0.5 * (k % 2))
    whoosh(p - 0.15, 0.7, 0.18, 0.5)

# ticking pulse: clock that builds to the question
bpm = 96; beat = 60 / bpm
k = 0
tt0, tt1 = H["growth"] - 8, reveal - 0.15
x = tt0
while x < tt1:
    prog = (x - tt0) / (tt1 - tt0)
    n = int(.05 * SR); tt = np.arange(n) / SR
    clk = hp_fast(rng.standard_normal(n), 3000) * np.exp(-tt * 120) * (0.10 + 0.25 * prog)
    place(L, clk * (1 if k % 2 else .6), x); place(R, clk * (.6 if k % 2 else 1), x)
    if k % 2 == 0 and x > H["growth"]:
        n = int(.5 * SR); tt = np.arange(n) / SR
        kick = np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 7) * (0.35 + 0.4 * prog)
        place(L, kick, x); place(R, kick, x)
    x += beat / (1 + prog * 1.0); k += 1
riser(reveal, 3.2, 0.9)
# silence-suck right before impact
impact(reveal, 1.0)
whoosh(H["orbit"], 2.0, 0.5, 0.7)
for r_ in T["reasons"]:
    whoosh(r_, 0.9, 0.35, 0.4); ping(r_ + .05, 880, .18, .5)
riser(H["logo"], 2.4, 0.6); impact(H["logo"], 0.75)
# final sustained chord
n = int((DUR - H["logo"]) * SR); tt = np.arange(n) / SR
chord = sum(np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) * g for f, g in [(146.83, .5), (220, .4), (293.66, .35), (349.23, .25), (440, .2)])
chord = chord * env(n, 1.2, 2.5) * 0.08
place(L, chord, H["logo"]); place(R, np.roll(chord, 300), H["logo"])

music = np.stack([L, R])

# ── voiceover ──
def read_raw_stereo(path):
    import subprocess
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).T.astype(np.float64)

vo = read_raw_stereo(os.path.join(ROOT, "data", "vo", T["vo_file"]))
voice = np.zeros_like(music)
i = int(T["vo_offset"] * SR)
voice[:, i:i + vo.shape[1]] = vo[:, :N - i]
# light presence + compression on VO
voice = voice + 0.25 * np.stack([hp_fast(voice[0], 2500), hp_fast(voice[1], 2500)])
ve = np.abs(voice).mean(0)
k = int(.15 * SR)
ve = np.convolve(ve, np.ones(k) / k, mode="same")
duck = 1 - 0.55 * np.clip(ve / (ve.max() * 0.25), 0, 1)
mix = music * duck + voice * 1.15
# master: soft clip + normalize
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
mix /= np.abs(mix).max() / 0.92
fade = env(N, 0.02, 0.6, 1)
mix *= fade

out = os.path.join(ROOT, "public", "soundtrack.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype("<i2").tobytes())
print("wrote", out, DUR)
