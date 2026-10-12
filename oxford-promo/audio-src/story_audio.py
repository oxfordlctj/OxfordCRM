"""Music + sound design for the 60 s story (src/v4).

usage: python story_audio.py <music.mp3> <out.wav>
Music: "The Upbeat Inspiring Corporate" (Pixabay, royalty-free, bundled with the promo-video skill).
Its drop at 18.5 s is where the magic door bursts open.
"""
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 60.0
N = int(DUR * SR)
rng = np.random.default_rng(4)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band", output="sos"), x)


def lp(x, f):
    return sosfilt(butter(2, f / (SR / 2), "low", output="sos"), x)


def note(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def whoosh(sec=0.6, lo=500, hi=6000):
    t = t_axis(sec)
    return bp(rng.standard_normal(len(t)), lo, hi) * np.sin(np.pi * t / sec) ** 2 * 0.8


def page(sec=0.7):
    t = t_axis(sec)
    x = bp(rng.standard_normal(len(t)), 1500, 9000) * np.sin(np.pi * t / sec) ** 1.5
    flutter = 0.6 + 0.4 * np.sin(2 * np.pi * 18 * t)
    return x * flutter * 0.7


def pop(n=79, sec=0.18):
    t = t_axis(sec)
    f = note(n) * (1 + 0.6 * np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * 0.5


def bell(n, sec=1.6):
    t = t_axis(sec)
    f = note(n)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4)) * np.exp(-t * 3) * 0.35


def chime(base=79, steps=(0, 4, 7, 12), gap=0.07):
    out = np.zeros(int(SR * (1.8 + gap * len(steps))))
    for i, s in enumerate(steps):
        b = bell(base + s)
        k = int(i * gap * SR)
        out[k:k + len(b)] += b
    return out


def boom(sec=2.2, f0=120, f1=38):
    t = t_axis(sec)
    f = f1 + (f0 - f1) * np.exp(-t * 8)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * 1.8) * np.exp(-t * 1.8) * 0.9


def thunder(sec=2.5):
    t = t_axis(sec)
    x = lp(rng.standard_normal(len(t)), 300) * np.exp(-t * 1.6) * 3
    crack = bp(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t * 25) * 0.6
    return np.tanh(x + crack) * 0.7


def swirl(sec=2.4):
    t = t_axis(sec)
    x = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    for k in range(12):
        a, b = int(k * len(t) / 12), int((k + 1) * len(t) / 12)
        f = 600 + 900 * (0.5 + 0.5 * np.sin(k * 1.7))
        out[a:b] = bp(x, f * 0.7, f * 1.4)[a:b]
    return out * np.sin(np.pi * t / sec) * 0.5


def pluck_run(notes, gap=0.09):
    out = np.zeros(int(SR * (gap * len(notes) + 0.5)))
    for i, n in enumerate(notes):
        t = t_axis(0.4)
        s = (2 * ((note(n) * t) % 1) - 1) * np.exp(-t * 10) * 0.25
        k = int(i * gap * SR)
        out[k:k + len(s)] += lp(s, 3000)
    return out


fx = np.zeros(N + SR * 4)


def add(sig, at, gain=1.0):
    i = int(at * SR)
    fx[i:i + len(sig)] += sig * gain


# page turns (match src/v4/timeline.ts)
for at in (7.2, 14.8, 43.6, 51.6):
    add(page(), at, 0.9)
# narration cards popping in
for at in (0.4, 3.2, 7.8, 11.25, 13.4, 15.3, 44.1, 48.1):
    add(pop(84), at, 0.5)
add(bell(76, 2.5), 3.4, 0.5)  # the dream
add(thunder(), 7.3 + 2.15, 0.9)
add(thunder(), 7.3 + 6.25, 1.0)
add(swirl(), 7.3 + 3.8, 0.8)
# the door on the music drop
add(whoosh(1.2, 300, 8000), 17.6, 0.8)
add(boom(), 18.5, 1.0)
add(chime(86, (0, 4, 7, 12, 16)), 18.55, 0.8)
add(whoosh(0.9, 400, 9000), 20.9, 0.7)
# five secrets: badge pop, then level-up
for i, r in enumerate((21.9, 26.3, 30.7, 35.1, 39.5)):
    add(pop(81 + i), r + 0.15, 0.6)
    add(pop(88), r + 1.0, 0.5)
    add(whoosh(0.6, 1200, 8000), r + 3.2, 0.5)
    add(chime(74 + i * 2), r + 3.9, 0.9)
add(chime(91, (0, 7, 12)), 21.9 + 2.0, 0.6)  # golden key
add(pluck_run([72, 76, 79, 84, 88]), 26.3 + 0.5, 0.6)  # "Hello!"
for k in range(4):
    add(pop(76 + k * 3), 30.7 + 0.3 + k * 0.12, 0.5)  # kids pop in
add(boom(0.8, 200, 80), 35.1 + 0.2, 0.35)  # confetti
add(whoosh(0.5, 2000, 9000), 35.1 + 0.2, 0.7)
for k in range(8):
    add(pop(79 + k), 39.5 + 0.6 + k * 0.12, 0.35)  # pins
add(chime(86, (0, 4, 7, 12, 16, 19)), 39.5 + 1.6, 0.6)
# summit
for k in range(6):
    add(pop(72 + k * 2, 0.12), 43.7 + 0.6 + k * 0.58, 0.35)  # footsteps on blocks
add(boom(1.5, 140, 50), 43.7 + 4.1, 0.6)
add(chime(84, (0, 4, 7, 12, 16)), 43.7 + 4.15, 0.8)
for k in range(3):
    add(pop(86 + k * 2), 43.7 + 4.8 + k * 0.5, 0.45)
# finale
add(whoosh(0.8, 300, 8000), 51.7 + 1.1, 0.6)
for k in range(6):
    add(pop(79 + k * 2), 51.7 + 1.3 + k * 0.07, 0.45)
add(chime(88, (0, 4, 7, 12)), 51.7 + 3.9, 0.7)

# music
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-t", str(DUR), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
m = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).T.copy()
m = np.pad(m, ((0, 0), (0, max(0, N - m.shape[1]))))[:, :N]
fade = np.ones(N)
k0 = int(57.8 * SR)
fade[k0:] = np.linspace(1, 0, N - k0)
m *= fade * 0.8

fxs = fx[:N]
mix = m + np.stack([fxs, fxs]) * 0.55
mix /= np.abs(mix).max() + 1e-9
mix = np.tanh(mix * 1.3) / np.tanh(1.3) * 0.95
sf.write(sys.argv[2], mix.T, SR, subtype="PCM_16")
print("wrote", sys.argv[2])
