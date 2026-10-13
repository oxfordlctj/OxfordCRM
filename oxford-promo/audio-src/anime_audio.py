"""Score, SFX and dub mix for the anime episode (src/v5).

usage: python anime_audio.py <vo dir> <out.wav>
Taiko + koto in the Japanese In scale, synthesized so every hit lands on the picture.
"""
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
DUR = 60.0
N = int(DUR * SR)
rng = np.random.default_rng(9)
BEAT = 60 / 140


def ta(sec):
    return np.arange(int(sec * SR)) / SR


def lp(x, f):
    return sosfilt(butter(2, f / (SR / 2), "low", output="sos"), x)


def hp(x, f):
    return sosfilt(butter(2, f / (SR / 2), "high", output="sos"), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band", output="sos"), x)


def note(n):
    return 440.0 * 2 ** ((n - 69) / 12)


class Bus:
    def __init__(self):
        self.x = np.zeros((2, N + SR * 5))

    def add(self, s, at, g=1.0, pan=0.0):
        i = int(at * SR)
        if i < 0:
            s, i = s[-i:], 0
        e = min(self.x.shape[1], i + len(s))
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.41, np.sin((pan + 1) * np.pi / 4) * 1.41
        self.x[0, i:e] += s[: e - i] * g * l
        self.x[1, i:e] += s[: e - i] * g * r

    def out(self):
        return self.x[:, :N]


IRL = lp(rng.standard_normal(int(SR * 2.2)) * np.exp(-3 * ta(2.2)), 5000)
IRR = lp(rng.standard_normal(int(SR * 2.2)) * np.exp(-3 * ta(2.2)), 5000)
IRL /= np.abs(IRL).sum() / 25
IRR /= np.abs(IRR).sum() / 25


def verb(st, wet):
    return st * (1 - wet) + np.stack([fftconvolve(st[0], IRL)[: st.shape[1]], fftconvolve(st[1], IRR)[: st.shape[1]]]) * wet


# ---------------------------------------------------------------- instruments
def taiko(g=1.0, f0=95):
    t = ta(0.9)
    f = 48 + (f0 - 48) * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    skin = bp(rng.standard_normal(len(t)), 200, 1500) * np.exp(-t * 30) * 0.5
    return np.tanh((body + skin) * 1.8) * g


def rim():
    t = ta(0.12)
    return bp(rng.standard_normal(len(t)), 2000, 7000) * np.exp(-t * 60) * 0.5


def koto(n, sec=1.2):
    t = ta(sec)
    f = note(n)
    s = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (3 + k * 2)) / k for k in range(1, 6))
    pluck = bp(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t * 80) * 0.3
    return (s * 0.35 + pluck) * (1 - np.exp(-t * 400))


def pad(notes, sec, bright=1200, g=0.05):
    t = ta(sec)
    s = sum(2 * ((note(n + d) * t + rng.random()) % 1) - 1 for n in notes for d in (-0.08, 0.07))
    e = np.minimum(1, t / 0.8) * np.minimum(1, (sec - t) / 0.8)
    return lp(s, bright) * e * g


def drone(sec, n=26):
    t = ta(sec)
    s = sum(2 * ((note(n + d) * t) % 1) - 1 for d in (0, 0.1, 12.05))
    e = np.minimum(1, t / 1.0) * np.minimum(1, (sec - t) / 0.6)
    return lp(s, 300) * e * 0.12


def boom(sec=2.0, f0=120, f1=34, g=1.0):
    t = ta(sec)
    f = f1 + (f0 - f1) * np.exp(-t * 7)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * 2) * np.exp(-t * 1.8) * g


def noise_hit(sec=1.5, lo=200, hi=8000, dec=3):
    t = ta(sec)
    return bp(rng.standard_normal(len(t)), lo, hi) * np.exp(-t * dec)


def whoosh(sec=0.5, lo=600, hi=7000):
    t = ta(sec)
    return bp(rng.standard_normal(len(t)), lo, hi) * np.sin(np.pi * t / sec) ** 2


def shing(sec=0.6):
    t = ta(sec)
    return sum(np.sin(2 * np.pi * f * t) for f in (3100, 4650, 6200)) * np.exp(-t * 9) * 0.12 + whoosh(sec, 3000, 10000) * 0.4


def riser(sec, hi=9000):
    t = ta(sec)
    x = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    k = 20
    for i in range(k):
        a, b = int(i * len(t) / k), int((i + 1) * len(t) / k)
        f = 300 * (hi / 300) ** (i / k)
        out[a:b] = bp(x, f * 0.6, f * 1.6)[a:b]
    return out * (t / sec) ** 2


def roar(sec=2.2):
    t = ta(sec)
    f = 70 + 25 * np.sin(2 * np.pi * 7 * t) + 40 * np.exp(-t * 2)
    growl = 2 * ((np.cumsum(f) / SR) % 1) - 1
    breath = bp(rng.standard_normal(len(t)), 150, 2500) * 1.2
    e = np.minimum(1, t / 0.15) * np.exp(-np.maximum(0, t - 1.2) * 3)
    return np.tanh((growl * 0.8 + breath) * 2.5) * e * 0.8


def chime(base, steps=(0, 3, 7, 10, 15), gap=0.06):
    out = np.zeros(int(SR * 2.5))
    for i, s in enumerate(steps):
        t = ta(1.8)
        b = np.sin(2 * np.pi * note(base + s) * t) * np.exp(-t * 3) * 0.3
        k = int(i * gap * SR)
        out[k:k + len(b)] += b
    return out


def boing():
    t = ta(0.6)
    f = 300 + 250 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.5


def ting():
    t = ta(1.0)
    return (np.sin(2 * np.pi * 4200 * t) + 0.5 * np.sin(2 * np.pi * 6300 * t)) * np.exp(-t * 6) * 0.25


# In scale on D: D Eb G A Bb
IN = [62, 63, 67, 69, 70, 74, 75, 79]
mus = Bus()
fx = Bus()

# 0 cold open
mus.add(drone(4.6), 0, 1.0)
for k in range(4):
    fx.add(boom(0.5, 70, 40), 0.3 + k * 0.62, 0.6)
fx.add(boom(2.5, 140, 30), 2.6, 1.0)
fx.add(noise_hit(1.0, 3000, 9000, 6), 3.0, 0.4)

# 1 opening: driving taiko + koto riff
for k in range(int((9.4 - 4.2) / (BEAT / 2))):
    t0 = 4.2 + k * BEAT / 2
    if k % 4 == 0:
        mus.add(taiko(1.0), t0)
    elif k % 4 == 2:
        mus.add(taiko(0.6, 140), t0, pan=0.3)
    mus.add(rim(), t0, 0.5, pan=-0.3 if k % 2 else 0.3)
riff = [62, 67, 69, 70, 69, 67, 63, 62]
for k in range(int((9.4 - 4.2) / (BEAT / 2))):
    mus.add(koto(riff[k % 8] + (12 if k >= 8 else 0)), 4.2 + k * BEAT / 2, 0.8, pan=0.2)
mus.add(pad([50, 57, 62], 5.4, 1800, 0.06), 4.1)
for c in (4.8, 5.8, 6.8):
    fx.add(boom(1.0, 160, 50), c, 0.7)
    fx.add(whoosh(0.4, 1000, 9000), c - 0.2, 0.5)
fx.add(shing(), 7.0, 0.8)

# 2 attack: ominous
mus.add(drone(8.4, 26), 9.2)
for k in range(int(8.2 / BEAT / 2)):
    mus.add(taiko(0.7, 80), 9.3 + k * BEAT * 2)
fx.add(roar(2.4), 12.7, 1.0)
fx.add(boom(2.0, 100, 30), 12.8, 0.6)
fx.add(whoosh(0.9, 200, 3000), 14.4, 0.8)
fx.add(boom(2.5, 150, 30), 15.2, 1.0)
fx.add(noise_hit(2.0, 300, 6000, 2), 15.2, 0.7)

# 3 hero theme
fx.add(whoosh(0.4, 1500, 9000), 17.55, 0.6)
fx.add(boom(1.2, 140, 45), 17.95, 0.8)
melody = [62, 69, 70, 74, 75, 74, 70, 69, 67, 69, 70, 62]
for k, n in enumerate(melody):
    mus.add(koto(n + 12, 1.5), 18.4 + k * BEAT, 0.7)
mus.add(pad([50, 57, 62, 65], 7.0, 2200, 0.07), 17.4)
for k in range(int(7.0 / BEAT)):
    mus.add(taiko(0.6 if k % 2 else 0.9), 17.6 + k * BEAT)
fx.add(boom(1.0, 160, 50), 21.6, 0.5)

# 4 battle
for k in range(int(4.6 / (BEAT / 2))):
    t0 = 24.2 + k * BEAT / 2
    mus.add(taiko(0.9 if k % 2 == 0 else 0.5, 110), t0, pan=0.2 if k % 2 else -0.2)
    mus.add(rim(), t0 + BEAT / 4, 0.4)
for k in range(3):
    fx.add(shing(), 24.7 + k * 0.1, 0.6, pan=0.4)
fx.add(noise_hit(0.4, 2000, 8000, 10), 25.5, 0.5)
fx.add(whoosh(1.2, 400, 8000), 25.4, 0.9)
fx.add(boom(2.0, 180, 35), 27.0, 1.1)
fx.add(noise_hit(1.0, 500, 7000, 4), 27.0, 0.8)
fx.add(roar(1.4), 26.6, 0.6)
fx.add(boom(0.8, 90, 40), 27.8, 0.6)
mus.add(pad([50, 53, 57], 3.0, 900, 0.07), 28.6)

# 5 awaken
mus.add(drone(4.6, 38), 31.2)
fx.add(noise_hit(0.8, 1500, 6000, 4), 31.5, 0.4)
fx.add(chime(86, (0, 3, 7)), 32.6, 0.5)
fx.add(riser(1.6), 34.4, 0.8)
fx.add(boom(2.2, 200, 30), 36.0, 1.2)
fx.add(shing(1.0), 36.0, 0.8)
for k in range(int(3.4 / (BEAT / 2))):
    mus.add(taiko(0.8 if k % 2 == 0 else 0.5, 120), 36.0 + k * BEAT / 2)
mus.add(pad([50, 57, 62, 69], 3.6, 3000, 0.08), 35.9)
fx.add(chime(74, (0, 7, 12, 19)), 37.7, 0.6)

# 6 final
fx.add(riser(2.0, 11000), 39.4, 0.9)
for k in range(int(3.0 / (BEAT / 2))):
    mus.add(taiko(1.0, 120), 39.3 + k * BEAT / 2, pan=0.3 if k % 2 else -0.3)
fx.add(roar(2.6), 40.2, 0.9)
fx.add(noise_hit(1.5, 3000, 12000, 1.5), 41.2, 0.5)
fx.add(boom(3.0, 220, 28), 42.4, 1.3)
fx.add(noise_hit(3.0, 200, 9000, 1.2), 42.4, 0.9)
fx.add(boing(), 44.2, 0.8)
fx.add(koto(86, 0.5), 44.9, 0.6)

# 7 interview: light, comedic
happy = [74, 76, 79, 81, 79, 76, 74, 71, 74, 79, 83, 81, 79, 76, 74, 79]
for k in range(int(8.0 / (BEAT / 2))):
    mus.add(koto(happy[k % 16], 0.6), 46.3 + k * BEAT / 2, 0.55, pan=0.3 if k % 2 else -0.3)
    if k % 2 == 0:
        mus.add(taiko(0.35, 160), 46.3 + k * BEAT / 2)
fx.add(boom(1.2, 160, 50), 49.1, 0.7)
fx.add(whoosh(0.4, 1500, 9000), 48.9, 0.5)
fx.add(ting(), 49.6, 0.8)
fx.add(boing(), 51.0, 0.5)

# 8 to be continued
fx.add(boom(1.5, 150, 40), 54.4, 0.8)
for k, n in enumerate([62, 67, 69, 74, 79]):
    mus.add(koto(n + 12, 2.0), 54.5 + k * 0.12, 0.7)
mus.add(pad([50, 57, 62, 66], 5.6, 2500, 0.07), 54.3)
fx.add(chime(86), 57.2, 0.6)

# ---------------------------------------------------------------- dub
VO = {"n1": 0.8, "n2": 4.9, "n3": 9.8, "r1": 19.0, "r2": 21.6, "r3": 24.6, "r4": 29.2, "n4": 31.6, "r5": 35.6, "r6": 37.6, "r7": 39.6, "q1": 46.8, "r8": 49.0, "n5": 54.8}
vo = np.zeros(N + SR * 5)
duck = np.zeros(N)
for k, at in VO.items():
    v, sr = sf.read(f"{sys.argv[1]}/{k}.wav")
    assert sr == SR
    v = v / (np.abs(v).max() + 1e-9) * (0.95 if k[0] != "n" else 0.85)
    i = int(at * SR)
    vo[i:i + len(v)] += v
    duck[max(0, i - 4800):min(N, i + len(v) + 7200)] = 1
vo = vo[:N]
duck = np.convolve(duck, np.ones(5760) / 5760, mode="same")

m = verb(mus.out(), 0.25) * (1 - 0.5 * duck) * 0.8
e = verb(fx.out(), 0.2) * (1 - 0.3 * duck)
v = verb(np.stack([vo, vo]), 0.1)
mix = m + e * 0.9 + v * 1.3
fade = np.ones(N)
fade[int(59.0 * SR):] = np.linspace(1, 0, N - int(59.0 * SR))
mix *= fade
mix /= np.abs(mix).max() + 1e-9
mix = np.tanh(mix * 1.5) / np.tanh(1.5) * 0.95
sf.write(sys.argv[2], mix.T, SR, subtype="PCM_16")
print("wrote", sys.argv[2])
