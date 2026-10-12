"""Synthesises the score + sound design and mixes the voice-over.

usage: python soundtrack.py <timeline.json> <trimmed vo dir> <out.wav>

Everything is generated from code so every hit lands exactly on the picture.
"""
import json
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
TL = json.load(open(sys.argv[1]))
VO_DIR = sys.argv[2]
OUT = sys.argv[3]
DUR = TL["duration"]
N = int(DUR * SR)
HIT = TL["hits"]
VO = TL["vo"]
rng = np.random.default_rng(8)

BPM = 120
BEAT = 60 / BPM


def note(n):
    """MIDI note -> Hz."""
    return 440.0 * 2 ** ((n - 69) / 12)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100) / (SR / 2), "low", output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f / (SR / 2), "high", output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band", output="sos"), x)


def saw(freq, sec, phase=0.0):
    t = t_axis(sec)
    return 2 * ((freq * t + phase) % 1.0) - 1


def env_adsr(n, a, d, s, r, sus_len=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sus = max(0, n - a - d - r) if sus_len is None else int(sus_len * SR)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(sus, s), np.linspace(s, 0, max(r, 1))])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


class Bus:
    def __init__(self):
        self.l = np.zeros(N + SR * 4)
        self.r = np.zeros(N + SR * 4)

    def add(self, sig, at, gain=1.0, pan=0.0):
        i = int(at * SR)
        if i < 0:
            sig = sig[-i:]
            i = 0
        if sig.ndim == 1:
            gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sl, sr_ = sig * gl * 1.414, sig * gr * 1.414
        else:
            sl, sr_ = sig[0], sig[1]
        end = min(len(self.l), i + len(sl))
        self.l[i:end] += sl[: end - i] * gain
        self.r[i:end] += sr_[: end - i] * gain

    def stereo(self):
        return np.stack([self.l[:N], self.r[:N]])


def reverb_ir(sec=2.6, damp=3.2):
    t = t_axis(sec)
    e = np.exp(-damp * t)
    irl = lp(rng.standard_normal(len(t)) * e, 6000)
    irr = lp(rng.standard_normal(len(t)) * e, 6000)
    return irl / np.abs(irl).sum() * 30, irr / np.abs(irr).sum() * 30


IR = reverb_ir()


def reverb(st, wet=0.3):
    l = fftconvolve(st[0], IR[0])[: st.shape[1]]
    r = fftconvolve(st[1], IR[1])[: st.shape[1]]
    return st * (1 - wet) + np.stack([l, r]) * wet


# ---------------------------------------------------------------- instruments

def kick(gain=1.0):
    t = t_axis(0.5)
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7)
    click = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 200) * 0.3
    return np.tanh((body + click) * 1.6) * gain


def hat(dec=40):
    t = t_axis(0.12)
    return hp(rng.standard_normal(len(t)), 7500) * np.exp(-t * dec) * 0.35


def clap():
    t = t_axis(0.35)
    n = bp(rng.standard_normal(len(t)), 900, 4000) * np.exp(-t * 18)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5
    return (n + body) * 0.6


def sub_boom(sec=2.5, f0=110, f1=38):
    t = t_axis(sec)
    f = f1 + (f0 - f1) * np.exp(-t * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(np.sin(ph) * 1.8) * np.exp(-t * 1.6)


def braam(sec=3.5, root=38):
    t = t_axis(sec)
    sig = np.zeros(len(t))
    for n, g in [(root, 1.0), (root + 12, 0.8), (root + 19, 0.5), (root + 24, 0.35)]:
        for det in (-0.12, 0.0, 0.11):
            sig += saw(note(n + det), sec, rng.random()) * g
    sig = np.tanh(sig * 0.8)
    cutoff_env = 300 + 2600 * np.exp(-t * 1.8)
    # crude time-varying LPF: blend of two static filters
    a = lp(sig, 2900)
    b = lp(sig, 300)
    mix = (cutoff_env - 300) / 2600
    out = (a * mix + b * (1 - mix)) * env_adsr(len(t), 0.02, 0.4, 0.6, sec - 0.5)
    return out * 0.18 + sub_boom(sec, 90, note(root - 12)) * 0.7


def noise_riser(sec, hi=9000):
    t = t_axis(sec)
    x = rng.standard_normal(len(t))
    chunks = 24
    out = np.zeros(len(t))
    edges = np.linspace(0, len(t), chunks + 1).astype(int)
    for k in range(chunks):
        f = 300 * (hi / 300) ** (k / chunks)
        seg = bp(x, f * 0.6, f * 1.6)[edges[k]:edges[k + 1]]
        out[edges[k]:edges[k + 1]] = seg
    pitch = note(50) * 2 ** (2 * t / sec)
    ph = 2 * np.pi * np.cumsum(pitch) / SR
    tone = lp(np.sign(np.sin(ph)) * 0.15, 3000)
    e = (t / sec) ** 2.2
    return (out * 0.8 + tone) * e


def whoosh(sec=0.9, lo=400, hi=5000):
    t = t_axis(sec)
    x = rng.standard_normal(len(t))
    e = np.sin(np.pi * t / sec) ** 2
    return bp(x, lo, hi) * e * 0.9


def bell(n, sec=2.5):
    t = t_axis(sec)
    f = note(n)
    s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3) + 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)
    return s * np.exp(-t * 2.2) * 0.4


def pluck(n, sec=0.35):
    t = t_axis(sec)
    s = saw(note(n), sec) + saw(note(n + 0.08), sec, 0.3)
    f_env = 400 + 3000 * np.exp(-t * 18)
    hi_ = lp(s, 3400)
    lo_ = lp(s, 400)
    m = (f_env - 400) / 3000
    return (hi_ * m + lo_ * (1 - m)) * np.exp(-t * 9) * 0.22


def pad_chord(notes, sec, bright=1400):
    l = np.zeros(int(sec * SR))
    r = np.zeros(int(sec * SR))
    for n in notes:
        for det, side in [(-0.09, 0), (0.0, 2), (0.08, 1)]:
            s = saw(note(n + det), sec, rng.random())
            if side in (0, 2):
                l += s
            if side in (1, 2):
                r += s
    e = env_adsr(len(l), 0.6, 0.3, 0.85, 0.9)
    return np.stack([lp(l, bright) * e, lp(r, bright) * e]) * 0.035


def reverse_cymbal(sec=1.6):
    t = t_axis(sec)
    x = hp(rng.standard_normal(len(t)), 5000)
    return x * (t / sec) ** 3 * 0.5


# ---------------------------------------------------------------- arrangement
music = Bus()
fx = Bus()

CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]  # Dm Bb F C
ROOTS = [38, 34, 41, 36]
ARP = [[62, 65, 69, 74], [58, 62, 65, 70], [60, 65, 69, 72], [60, 64, 67, 72]]

BREAK = (HIT["impact"] - 1.6, HIT["impact"])  # drop-out before №8


def in_break(t):
    return BREAK[0] <= t < BREAK[1]


# pads across the whole film
bar = 2 * 2 * BEAT  # 2 bars per chord = 4 s
for i in range(int(DUR / bar) + 1):
    t0 = i * bar
    bright = 900 if t0 < HIT["toMap"] else 1600 if t0 < HIT["toCity"] else 2400
    music.add(pad_chord(CHORDS[i % 4], bar + 0.8, bright), t0, 1.0)

# sub bass pulses (8ths) from the city on, off in the break
bass_on = HIT["toCity"]
for k in range(int((DUR - bass_on) / (BEAT / 2))):
    t0 = bass_on + k * BEAT / 2
    if in_break(t0) or t0 > HIT["outro"] + 0.4:
        continue
    ci = int(t0 // bar) % 4
    tt = t_axis(BEAT / 2)
    b = np.tanh(np.sin(2 * np.pi * note(ROOTS[ci] - 12 + 12) * tt) * 2) * np.exp(-tt * 6) * 0.35
    music.add(lp(b, 400), t0)

# arp: starts on the map, opens up in the city
arp_on = HIT["toMap"] + 0.3
for k in range(int((DUR - arp_on) / (BEAT / 4))):
    t0 = arp_on + k * BEAT / 4
    if in_break(t0) or t0 > HIT["outro"] + 2:
        continue
    ci = int(t0 // bar) % 4
    n = ARP[ci][k % 4] + (12 if (k // 8) % 2 and t0 > HIT["toCity"] else 0)
    g = 0.5 if t0 < HIT["toCity"] else 0.8
    music.add(pluck(n), t0, g, pan=0.35 if k % 2 else -0.35)

# drums
for k in range(int(DUR / BEAT)):
    t0 = k * BEAT
    if in_break(t0):
        continue
    if HIT["toMap"] + 2 <= t0 < HIT["toCity"]:
        music.add(kick(0.5), t0)
    elif HIT["toCity"] <= t0 < HIT["outro"]:
        music.add(kick(0.85), t0)
        music.add(hat(), t0 + BEAT / 2, 0.8, pan=0.2)
        if t0 > HIT["impact"]:
            music.add(hat(80), t0 + BEAT / 4, 0.5, pan=-0.3)
            music.add(hat(80), t0 + 3 * BEAT / 4, 0.5, pan=0.3)
        if k % 2 == 1 and t0 > HIT["toCity"] + 4:
            music.add(clap(), t0, 0.7)

# ticking clock in the intro
for k in range(int(HIT["toMap"] / BEAT)):
    music.add(hat(120), k * BEAT + 0.3, 0.6, pan=0.4 if k % 2 else -0.4)

# ---------------------------------------------------------------- sound design
fx.add(braam(3.5, 38), HIT["intro"], 0.9)
fx.add(whoosh(0.5, 1500, 9000), HIT["intro"] - 0.25, 0.5)
fx.add(sub_boom(1.6), HIT["students"], 0.7)
fx.add(whoosh(0.6), HIT["students"] - 0.3, 0.6, pan=-0.3)
fx.add(sub_boom(1.6), HIT["oneCity"], 0.7)
fx.add(bell(74, 3), HIT["oneCity"], 0.6)
fx.add(braam(3.0, 41), HIT["oxford"], 0.8)
fx.add(noise_riser(1.2), HIT["toMap"] - 1.2, 0.55)
fx.add(whoosh(1.0, 300, 7000), HIT["toMap"] - 0.3, 0.9)
fx.add(sub_boom(2.0), HIT["toMap"] + 0.15, 0.6)
fx.add(braam(3.0, 34), HIT["dushanbe"], 0.7)
fx.add(bell(81, 3), HIT["dushanbe"] + 0.1, 0.5)
fx.add(noise_riser(1.6), HIT["toCity"] - 1.6, 0.7)
fx.add(whoosh(1.0, 200, 8000), HIT["toCity"] - 0.4, 1.0)
fx.add(sub_boom(2.2), HIT["toCity"], 0.8)

# a bell for every branch, climbing the D minor pentatonic
PENTA = [62, 65, 67, 69, 72, 74, 77]
for i in range(7):
    t0 = VO[f"n{i + 1}"]
    fx.add(bell(PENTA[i] + 12, 2.0), t0, 0.55, pan=-0.5 + i / 6)
    fx.add(whoosh(0.35, 2000, 9000), t0 - 0.12, 0.25)

# suspense + the big reveal
fx.add(reverse_cymbal(BREAK[1] - BREAK[0]), BREAK[0], 0.9)
fx.add(noise_riser(BREAK[1] - BREAK[0], 12000), BREAK[0], 0.8)
for k in range(3):  # heartbeat
    fx.add(sub_boom(0.4, 70, 40), BREAK[0] + 0.1 + k * 0.45, 0.6)
fx.add(braam(4.5, 38), HIT["impact"], 1.2)
fx.add(sub_boom(4.0, 150, 30), HIT["impact"], 1.0)
fx.add(hp(rng.standard_normal(int(SR * 2.5)), 3000) * np.exp(-t_axis(2.5) * 2.0) * 0.4, HIT["impact"], 0.8)
fx.add(bell(86, 3.5), HIT["impact"] + 0.05, 0.6)
fx.add(bell(81, 3.5), HIT["impact"] + 0.05, 0.5)

fx.add(sub_boom(1.2), HIT["whyHere"], 0.7)
fx.add(whoosh(0.5, 800, 6000), HIT["whyHere"] - 0.2, 0.6)
for k in ("r1", "r2", "r3"):
    fx.add(whoosh(0.7, 500, 7000), HIT[k] - 0.3, 0.7, pan=0.5)
    fx.add(sub_boom(0.9, 100, 45), HIT[k], 0.45)
    fx.add(bell(74, 1.5), HIT[k] + 0.05, 0.3)

fx.add(noise_riser(1.0), HIT["outro"] - 1.0, 0.5)
fx.add(whoosh(1.0, 300, 9000), HIT["outro"] - 0.2, 0.9)
fx.add(braam(5.0, 38), HIT["logo"] + 1.0, 1.0)
for k, n in enumerate([74, 78, 81, 86]):
    fx.add(bell(n, 3.0), HIT["soon"] + 0.5 + k * 0.08, 0.35, pan=-0.3 + k * 0.2)
fx.add(sub_boom(4.0, 90, 32), DUR - 4.2, 0.6)

# ---------------------------------------------------------------- voice
vo_bus = np.zeros(N + SR * 4)
duck = np.zeros(N)
for key, at in VO.items():
    v, sr = sf.read(f"{VO_DIR}/{key}.wav")
    if v.ndim > 1:
        v = v.mean(axis=1)
    assert sr == SR, (key, sr)
    v = hp(v, 80)
    v = v / (np.abs(v).max() + 1e-9) * 0.9
    i = int(at * SR)
    vo_bus[i:i + len(v)] += v
    duck[max(0, i - int(0.1 * SR)):min(N, i + len(v) + int(0.15 * SR))] = 1
vo_bus = vo_bus[:N]
# smooth the ducking envelope
k = np.ones(int(0.12 * SR)) / int(0.12 * SR)
duck = np.convolve(duck, k, mode="same")
music_gain = 1 - 0.45 * duck

# gentle compression on the voice
env = np.convolve(np.abs(vo_bus), np.ones(480) / 480, mode="same")
gain = np.where(env > 0.25, (0.25 + (env - 0.25) * 0.35) / (env + 1e-9), 1.0)
vo_c = vo_bus * gain
vo_st = reverb(np.stack([vo_c, vo_c]), wet=0.12)

mus = reverb(music.stereo(), 0.22) * music_gain * 0.9
fxs = reverb(fx.stereo(), 0.3) * (1 - 0.25 * duck)
mix = mus + fxs + vo_st * 1.25

# fade in/out + soft limiting
mix[:, : int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))
mix[:, -int(0.8 * SR):] *= np.linspace(1, 0, int(0.8 * SR))
mix = mix / (np.abs(mix).max() + 1e-9)
mix = np.tanh(mix * 1.6) / np.tanh(1.6) * 0.95
sf.write(OUT, mix.T, SR, subtype="PCM_16")
print("wrote", OUT, mix.shape[1] / SR, "s")
