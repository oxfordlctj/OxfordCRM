"""Shared synth instruments (extracted from trailer_score.py)."""
import numpy as np

SR = 48000
rng = np.random.default_rng(11)


# ───────── helpers ─────────
def tt(sec):
    return np.arange(int(sec * SR)) / SR


def place(buf, sig, at, gain=1.0):
    i = int(round(at * SR))
    if i < 0:
        sig, i = sig[:, -i:] if sig.ndim == 2 else sig[-i:], 0
    if sig.ndim == 1:
        sig = np.stack([sig, sig])
    j = min(buf.shape[1], i + sig.shape[1])
    if j > i:
        buf[:, i:j] += sig[:, :j - i] * gain


def fft_filter(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x, axis=-1)
    f = np.fft.rfftfreq(x.shape[-1], 1 / SR)
    H = np.ones_like(f)
    if hi: H *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo: H *= 1 - 1 / np.sqrt(1 + (f / max(lo, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * H, x.shape[-1], axis=-1)


def env_adsr(n, a, d, s, r, sustain_len=None):
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    ns = max(0, n - na - nd - nr) if sustain_len is None else int(sustain_len * SR)
    e = np.concatenate([np.linspace(0, 1, max(na, 1)), np.linspace(1, s, max(nd, 1)), np.full(ns, s), np.linspace(s, 0, max(nr, 1))])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def saw(freq, t, phase=0.0):
    p = (freq * t + phase) % 1.0
    return 2 * p - 1


def note(n):  # midi -> Hz
    return 440 * 2 ** ((n - 69) / 12)


def impulse_response(sec=2.6, damp=2.2, pre=0.02, bright=6000):
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = np.stack([rng.standard_normal(n), rng.standard_normal(n)]) * np.exp(-t * damp)
    ir = fft_filter(ir, hi=bright, order=1)
    ir[:, :int(pre * SR)] = 0
    return ir / np.abs(ir).sum(axis=1, keepdims=True) * 18


def convolve(x, ir):
    L = x.shape[1] + ir.shape[1]
    nfft = 1 << (L - 1).bit_length()
    X = np.fft.rfft(x, nfft, axis=1)
    Hh = np.fft.rfft(ir, nfft, axis=1)
    return np.fft.irfft(X * Hh, nfft, axis=1)[:, :x.shape[1]]


def in_sec(t, name):
    a, b = SEC[name]
    return a <= t < b


# ───────── instruments ─────────
def kick(gain=1.0):
    t = tt(0.6)
    f = 42 + 110 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    click = fft_filter(rng.standard_normal(len(t)), lo=2500) * np.exp(-t * 250) * 0.5
    return np.tanh((body + click) * 2.2) * 0.9 * gain


def taiko(pitch=95, gain=1.0, length=1.2):
    t = tt(length)
    f = pitch * (1 + 0.6 * np.exp(-t * 40))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    skin = fft_filter(rng.standard_normal(len(t)), lo=150, hi=1800) * np.exp(-t * 30) * 0.9
    return np.tanh((body + skin) * 1.8) * 0.8 * gain


def clap(gain=1.0):
    t = tt(0.9)
    n = rng.standard_normal(len(t))
    bursts = sum(np.exp(-np.maximum(t - d, 0) * 90) * (t >= d) for d in (0, 0.011, 0.023))
    body = fft_filter(n, lo=900, hi=5200) * (bursts * 0.6 + np.exp(-t * 9) * 0.5)
    thump = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 22) * 0.6
    return (body + thump) * 0.7 * gain


def hat(gain=1.0, open_=False):
    t = tt(0.35 if open_ else 0.08)
    return fft_filter(rng.standard_normal(len(t)), lo=7000) * np.exp(-t * (14 if open_ else 70)) * 0.35 * gain


def crash(gain=1.0):
    t = tt(3.5)
    n = np.stack([rng.standard_normal(len(t)), rng.standard_normal(len(t))])
    return fft_filter(n, lo=3500) * np.exp(-t * 1.6) * 0.45 * gain


def braam(gain=1.0, root=38, length=3.0):
    t = tt(length)
    sig = np.zeros(len(t))
    for k, (iv, g) in enumerate([(0, 1), (12, .7), (7, .5), (-12, .8), (15, .35)]):
        f = note(root + iv)
        for d in (-0.006, 0, 0.007):
            sig += saw(f * (1 + d), t, rng.random()) * g
    cutoff_env = 300 + 2600 * np.exp(-t * 2.5)
    # time-varying lowpass by crossfading 4 static versions
    v = [fft_filter(sig, hi=c) for c in (300, 800, 1600, 3000)]
    pos = np.interp(cutoff_env, [300, 800, 1600, 3000], [0, 1, 2, 3])
    out = sum(v[i] * np.clip(1 - np.abs(pos - i), 0, 1) for i in range(4))
    out = np.tanh(out * 0.5) * env_adsr(len(t), 0.01, 0.4, 0.6, length * 0.55)
    return out * 0.5 * gain


def riser(length, gain=1.0):
    t = tt(length)
    x = t / length
    n = np.stack([rng.standard_normal(len(t)), rng.standard_normal(len(t))])
    bands = [fft_filter(n, lo=c * 0.5, hi=c) for c in (500, 1200, 2800, 6000, 12000)]
    pos = x * 4
    sig = sum(b * np.clip(1 - np.abs(pos - i), 0, 1) for i, b in enumerate(bands))
    tone = np.sin(2 * np.pi * np.cumsum(90 * 10 ** (x * 1.2)) / SR) * 0.35
    shep = sum(np.sin(2 * np.pi * np.cumsum(note(50 + k * 12) * 2 ** (x * 1.0)) / SR) for k in range(3)) * 0.08
    return (sig + tone + shep) * (x ** 2.4) * 0.8 * gain


def impact(gain=1.0):
    t = tt(4.5)
    sub = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 6)) / SR) * np.exp(-t * 1.3)
    crack = fft_filter(rng.standard_normal(len(t)), lo=800) * np.exp(-t * 18)
    boom = fft_filter(rng.standard_normal(len(t)), hi=400) * np.exp(-t * 3) * 1.5
    return np.tanh((sub * 1.2 + crack * 0.7 + boom) * 1.4) * 0.85 * gain


def tick(gain=1.0):
    t = tt(0.06)
    return (np.sin(2 * np.pi * 1900 * t) + 0.5 * np.sin(2 * np.pi * 3100 * t)) * np.exp(-t * 120) * 0.25 * gain


def pluck(freq, length=0.22, bright=2400, gain=1.0):
    t = tt(length)
    s = saw(freq, t, rng.random()) + saw(freq * 1.004, t, rng.random())
    cutoff = bright
    return fft_filter(s, hi=cutoff) * np.exp(-t * 14) * 0.22 * gain


def pad(freqs, length, gain=1.0, choir=False):
    t = tt(length)
    sig = np.zeros((2, len(t)))
    for f in freqs:
        for ch in (0, 1):
            for d in (-0.005, 0.0, 0.006):
                vib = 1 + 0.004 * np.sin(2 * np.pi * (5.2 + ch * 0.3) * t)
                sig[ch] += saw(f * (1 + d) * vib, t, rng.random())
    if choir:  # 'aah' formants
        sig = fft_filter(sig, lo=500, hi=1300, order=2) * 1.6 + fft_filter(sig, lo=2300, hi=3000, order=2) * 0.5
    else:
        sig = fft_filter(sig, hi=1400, order=2)
    return sig * env_adsr(len(t), 0.6, 0.5, 0.85, 1.2) * 0.05 * gain


def brass(freqs, length=0.6, gain=1.0):
    t = tt(length)
    sig = sum(saw(f * (1 + d), t, rng.random()) for f in freqs for d in (-0.004, 0.004))
    lo = fft_filter(sig, hi=900); hi = fft_filter(sig, hi=3200)
    e = np.exp(-t * 6)
    out = lo * (1 - e) + hi * e
    return np.tanh(out * 0.6) * env_adsr(len(t), 0.008, 0.15, 0.55, 0.25) * 0.35 * gain


