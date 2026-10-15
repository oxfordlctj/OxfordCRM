"""Synthesizes the trailer score + SFX for the A+ Kids reel.

Timeline is in composition seconds (voiceover starts at VO_OFFSET).
Act 1 (pain): dark drone, ticking clock, heartbeat, braam hits, riser.
Act 2 (solution): uplifting 128 BPM drive in D major, whooshes, final hit.

Usage: python3 scripts/make_music.py public/music.wav
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 55.5
N = int(SR * DUR)
rng = np.random.default_rng(7)

# Cues in composition seconds (voiceover onsets + 2.5 s cold open), see src/theme.ts.
OFF = 2.5 - 1 / 30
VO = dict(oneDay=0.14, but=4.16, pain1=8.3, pain2=9.8, pain3=11.48, peers=13.14, andHe=15.3,
          question=17.64, no=21.82, center=22.74, aplus=23.76, english=26.4, russian=27.76, math=29.0,
          world=30.2, reading=31.42, writing=32.4, logic=33.5, confidence=34.54, yourChild=36.26,
          smile=40.06, seats=42.2, enroll=43.64, brand=45.36)
T = {k: v + OFF for k, v in VO.items()}
DROP = T["no"]
BEAT_START = T["center"]
BPM = 128
BEAT = 60 / BPM
END_HIT = T["brand"]

L = np.zeros(N)
R = np.zeros(N)


def t_arr(n):
    return np.arange(n) / SR


def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    lg = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    rg = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    L[i : i + len(sig)] += sig * gain * lg
    R[i : i + len(sig)] += sig * gain * rg


def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = np.ones_like(f)
    if hi:
        h *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo:
        h *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** 4)
    return np.fft.irfft(X * h, len(x))


def env_adsr(n, a=0.01, d=0.1, s=0.7, r=0.2):
    e = np.ones(n) * s
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    ai = min(ai, n)
    e[:ai] = np.linspace(0, 1, ai)
    di = min(di, n - ai)
    e[ai : ai + di] = np.linspace(1, s, di)
    ri = min(ri, n)
    e[n - ri :] *= np.linspace(1, 0, ri)
    return e


def saw(freq, n, detune=0.0):
    t = t_arr(n)
    ph = (freq * (1 + detune) * t + rng.random()) % 1.0
    return 2 * ph - 1


def supersaw(freq, n, voices=7, spread=0.012):
    out = np.zeros(n)
    for k in range(voices):
        d = spread * (k - voices // 2) / (voices // 2)
        out += saw(freq, n, d)
    return out / voices


def reverb(x, secs=2.5, mix=0.3, bright=6000):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = fft_filter(ir, hi=bright)
    ir /= np.sqrt(np.sum(ir**2))
    size = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return x * (1 - mix) + y * mix * 1.2


def note(midi):
    return 440 * 2 ** ((midi - 69) / 12)


# ---------- building blocks ----------
def boom(length=3.0, f0=55, f1=28):
    n = int(length * SR)
    t = t_arr(n)
    f = f1 + (f0 - f1) * np.exp(-t * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 1.6)
    click = fft_filter(rng.standard_normal(n), hi=3000) * np.exp(-t * 40) * 0.6
    return np.tanh((body + click) * 1.8)


def braam(length=2.6, root=38):
    """Brassy low cluster hit (Inception-style)."""
    n = int(length * SR)
    t = t_arr(n)
    sig = np.zeros(n)
    for m, g in [(root, 1), (root + 12, 0.7), (root + 7, 0.5), (root - 12, 0.6)]:
        sig += supersaw(note(m), n, 5, 0.006) * g
    e = env_adsr(n, 0.02, 0.6, 0.35, 1.2)
    sig = fft_filter(np.tanh(sig * 2.5), hi=900) * e
    return sig + boom(length, 60, 30) * 0.8


def tick(high=True):
    n = int(0.05 * SR)
    t = t_arr(n)
    f = 3200 if high else 2400
    return (np.sin(2 * np.pi * f * t) + fft_filter(rng.standard_normal(n), lo=2000) * 0.5) * np.exp(-t * 180)


def heartbeat():
    n = int(0.5 * SR)
    t = t_arr(n)

    def thump(delay, g):
        tt = np.clip(t - delay, 0, None)
        return np.sin(2 * np.pi * (45 + 30 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 18) * (t >= delay) * g

    return np.tanh((thump(0, 1) + thump(0.18, 0.7)) * 2)


def whoosh(length=1.2, rise=True):
    n = int(length * SR)
    noise = rng.standard_normal(n)
    bands = [fft_filter(noise, lo=c * 0.5, hi=c * 1.5) for c in (300, 800, 2000, 5000)]
    pos = np.linspace(0, 1, n) if rise else np.linspace(1, 0, n)
    out = np.zeros(n)
    for k, b in enumerate(bands):
        w = np.clip(1 - np.abs(pos * 3 - k), 0, 1)
        out += b * w
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    return out * e / np.max(np.abs(out) + 1e-9)


def riser(length=3.6):
    n = int(length * SR)
    t = t_arr(n)
    w = whoosh(length, True) * np.linspace(0.2, 1, n) ** 2
    f = 200 * 2 ** (t / length * 3)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.linspace(0, 0.35, n) ** 1.5
    # Shepard-ish tremolo accelerating
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(4 + 20 * (t / length) ** 2) / SR)
    return (w + tone) * trem


def shimmer(length=2.5, root=74):
    n = int(length * SR)
    t = t_arr(n)
    sig = np.zeros(n)
    for i, m in enumerate([root, root + 4, root + 7, root + 12, root + 16]):
        d = int(i * 0.06 * SR)
        s = np.sin(2 * np.pi * note(m) * t) * np.exp(-t * 2.2)
        sig[d:] += s[: n - d] * 0.4
    return sig


def kick():
    n = int(0.45 * SR)
    t = t_arr(n)
    f = 48 + 110 * np.exp(-t * 35)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    return np.tanh(s * 2.2)


def clap():
    n = int(0.3 * SR)
    t = t_arr(n)
    noise = fft_filter(rng.standard_normal(n), lo=900, hi=6000)
    e = np.exp(-t * 22)
    for d in (0.0, 0.012, 0.024):
        e += np.exp(-np.clip(t - d, 0, None) * 120) * (t >= d) * 0.6
    return noise * e * 0.6


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    t = t_arr(n)
    return fft_filter(rng.standard_normal(n), lo=7000) * np.exp(-t * (14 if open_ else 70))


def pluck(freq, length=0.35):
    n = int(length * SR)
    t = t_arr(n)
    s = supersaw(freq, n, 3, 0.004)
    cutoff_env = np.exp(-t * 14)
    s = fft_filter(s, hi=5000) * (0.25 + 0.75 * cutoff_env)
    return s * np.exp(-t * 7)


def pad(chord, length):
    n = int(length * SR)
    sig = sum(supersaw(note(m), n, 7, 0.01) for m in chord) / len(chord)
    sig = fft_filter(sig, hi=2600)
    return sig * env_adsr(n, 0.25, 0.3, 0.85, 0.4)


def bass(freq, length):
    n = int(length * SR)
    t = t_arr(n)
    s = np.tanh((np.sin(2 * np.pi * freq * t) + 0.4 * saw(freq, n)) * 1.6)
    s = fft_filter(s, hi=600)
    # sidechain pump feel
    return s * env_adsr(n, 0.02, 0.1, 0.8, 0.08)


# ---------- COLD OPEN ----------
place(boom(3.0, 60, 30), 0.15, 0.8)
place(shimmer(2.4, 74), 0.3, 0.25)
place(whoosh(1.4, True), 1.0, 0.25)


def piano(freq, length=1.6):
    n = int(length * SR)
    t = t_arr(n)
    s = sum(np.sin(2 * np.pi * freq * h * t) * g * np.exp(-t * (2.5 + h)) for h, g in [(1, 1), (2, 0.4), (3, 0.18), (4, 0.08)])
    return s * (1 - np.exp(-t * 400))


# ---------- MORNING: warm, hopeful ----------
m0, m1 = 2.3, T["but"]
place(pad([62, 66, 69, 73], m1 - m0 + 0.6), m0, 0.12)
place(pad([38, 50], m1 - m0 + 0.6), m0, 0.12)
arp = [62, 66, 69, 73, 74, 73, 69, 66]
k = 0
tt = m0 + 0.1
while tt < m1 - 0.1:
    place(piano(note(arp[k % 8] + 12)), tt, 0.14, pan=-0.3 if k % 2 else 0.3)
    tt += 60 / 100 / 2
    k += 1

# ---------- "Аммо..." freeze: tape-stop + tension ----------
n = int(0.7 * SR)
tt_ = t_arr(n)
f = 300 * np.exp(-tt_ * 4)
place(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt_ * 3), T["but"], 0.25)
place(boom(2.5, 50, 28), T["but"], 0.6)

dn_end = DROP - 0.3
n = int((dn_end - T["but"]) * SR)
t = t_arr(n)
drone = (supersaw(note(38), n, 5, 0.004) + 0.6 * supersaw(note(45), n, 5, 0.004)) * 0.5
drone = fft_filter(drone, hi=500)
drone *= np.clip(t / 1.5, 0, 1) * (0.5 + 0.5 * t / t[-1])
drone[-int(0.25 * SR):] *= np.linspace(1, 0, int(0.25 * SR))
place(drone, T["but"], 0.42)

# pulsing ostinato (strings feel) D minor, accelerating into the race
tt = T["pain1"]
k = 0
seq = [50, 50, 53, 50, 57, 50, 53, 55]
while tt < dn_end - 0.1:
    place(pluck(note(seq[k % 8]), 0.25), tt, 0.12, pan=0.25 if k % 2 else -0.25)
    tt += 0.25 if tt < T["peers"] else 0.1875
    k += 1
# heartbeat in the race
for hb in np.arange(T["peers"], dn_end - 0.4, 0.8):
    place(heartbeat(), hb, 0.45)
# ticking clock
tt = T["pain1"]
while tt < dn_end - 0.2:
    place(tick(int(tt * 4) % 2 == 0), tt, 0.1, pan=0.3)
    tt += 0.5
# hits on each pain card
for at in (T["pain1"], T["pain2"], T["pain3"]):
    place(braam(2.2, 38), at - 0.02, 0.32)
    place(boom(1.5, 90, 40), at, 0.45)
place(whoosh(0.8, True), T["peers"] - 0.6, 0.25)
place(riser(3.4), DROP - 3.5, 0.5)

# ---------- DROP ----------
place(boom(4.5, 70, 26), DROP, 1.1)
place(braam(3.2, 38), DROP, 0.5)
place(fft_filter(rng.standard_normal(int(1.2 * SR)), lo=500) * np.exp(-t_arr(int(1.2 * SR)) * 5), DROP, 0.35)
place(shimmer(3.0, 74), DROP + 0.05, 0.3)

# ---------- ACT 2: solution ----------
prog = [  # D  A  Bm  G (bars of 4 beats)
    ([62, 66, 69, 74], 38),
    ([61, 64, 69, 73], 45),
    ([62, 66, 71, 74], 47),
    ([62, 67, 71, 74], 43),
]
bar = 4 * BEAT
music_end = END_HIT
b = 0
tb = BEAT_START
arp_pattern = [0, 2, 1, 3, 2, 1, 3, 2]
while tb < music_end - 0.01:
    chord, broot = prog[b % 4]
    length = min(bar, music_end - tb)
    place(pad(chord, length + 0.3), tb, 0.16)
    for k in range(4):
        bt = tb + k * BEAT
        if bt >= music_end:
            break
        place(kick(), bt, 0.75)
        place(bass(note(broot - 12 + 0), BEAT * 0.5), bt + BEAT * 0.5, 0.32)
        if k in (1, 3):
            place(clap(), bt, 0.38)
        place(hat(), bt + BEAT * 0.5, 0.12, pan=0.3)
        place(hat(), bt + BEAT * 0.25, 0.05, pan=-0.3)
        place(hat(), bt + BEAT * 0.75, 0.05, pan=-0.3)
    for k in range(8):
        pt = tb + k * BEAT / 2
        if pt >= music_end:
            break
        m = chord[arp_pattern[k]] + 12
        place(pluck(note(m)), pt, 0.11, pan=(-0.4 if k % 2 else 0.4))
    tb += bar
    b += 1

# accents
place(whoosh(1.0, True), T["aplus"] - 1.0, 0.35)
place(shimmer(3.0, 74), T["aplus"], 0.3)
place(boom(2.5, 80, 40), T["aplus"], 0.5)
for at in (T["english"], T["russian"], T["math"], T["world"], T["reading"], T["writing"], T["logic"]):
    place(boom(0.6, 140, 70), at, 0.28)
    place(hat(True), at, 0.22)
place(shimmer(2.0, 81), T["confidence"], 0.3)
place(boom(1.5, 90, 45), T["confidence"], 0.4)
place(whoosh(0.8, True), T["yourChild"] - 0.4, 0.25)
place(shimmer(2.0, 81), T["smile"], 0.22)
place(whoosh(1.0, True), T["seats"] - 0.5, 0.3)
place(boom(0.8, 160, 80), T["enroll"] + 0.6, 0.3)
place(riser(1.8), END_HIT - 1.85, 0.35)

# ---------- END ----------
place(boom(5.0, 70, 28), END_HIT, 1.0)
place(pad([62, 66, 69, 74, 78], DUR - END_HIT), END_HIT, 0.22)
place(shimmer(4.0, 74), END_HIT, 0.35)
place(braam(3.0, 50), END_HIT, 0.25)

# ---------- master ----------
mixL = reverb(L, 2.8, 0.22)
mixR = reverb(R, 3.0, 0.22)
fade = np.ones(N)
fade[-int(2.0 * SR):] = np.linspace(1, 0, int(2.0 * SR)) ** 1.5
mixL *= fade
mixR *= fade
peak = max(np.max(np.abs(mixL)), np.max(np.abs(mixR)))
mixL = np.tanh(mixL / peak * 1.3) * 0.89
mixR = np.tanh(mixR / peak * 1.3) * 0.89

out = np.stack([mixL, mixR], axis=1)
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", sys.argv[1], DUR, "s")
