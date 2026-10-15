"""Hybrid trailer score + VO edit for the Reels cut.

Everything is synthesized: kick, taiko, epic claps, hats, 16th bass ostinato,
string arps, choir pad, brass stabs, braams, risers, impacts, reverb.
Each VO phrase is cut from the take by word timings and dropped on the beat
grid from src/trailer.json. Writes public/trailer_mix.wav and src/beats.json.
"""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TR = json.load(open(os.path.join(ROOT, "src", "trailer.json")))
SR = 48000
DUR = TR["duration"]
N = int(DUR * SR)
BEAT = 60 / TR["bpm"]
SEC = TR["sections"]
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


# ───────── harmony: Dm – Bb – F – C (2 bars each in groove, 1 bar in climax) ─────────
CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]   # D3 F3 A3 etc.
BASS = [38, 34, 41, 36]


def chord_at(t, bars_per_chord):
    bar = int(t / (BEAT * 4))
    return (bar // bars_per_chord) % 4


music = np.zeros((2, N))
drums = np.zeros((2, N))
fx = np.zeros((2, N))

# ── tension: pad + ticking clock + low pulses ──
t0, t1 = SEC["tension"]
place(music, pad([note(38), note(45), note(50)], t1 - t0 + 1.5, 1.4), t0)
x = t0 + 0.5
while x < t1:
    place(fx, tick(0.9 if int(x / BEAT * 2) % 2 == 0 else 0.5), x)
    x += BEAT / 2
for b in np.arange(0, t1, BEAT * 2):
    place(drums, taiko(70, 0.45 + 0.25 * (b / t1)), b)
# build into the groove: taiko 8ths crescendo
G0 = SEC["groove"][0]
x = G0 - 2.0
while x < G0:
    p = (x - (G0 - 2.0)) / 2
    place(drums, taiko(110 if int(x / BEAT * 2) % 2 else 85, 0.35 + 0.6 * p, 0.6), x)
    x += BEAT / 2 if p < 0.5 else BEAT / 4

# ── groove (8–14) and climax (18–28.5) ──
def groove(a, b, double=False):
    bars_per_chord = 1 if double else 2
    x = a
    i = 0
    while x < b - 1e-6:
        beat_in_bar = i % 4
        # drums
        if beat_in_bar in (0, 2) or double:
            place(drums, kick(1.0 if beat_in_bar in (0, 2) else 0.7), x)
        if beat_in_bar in (1, 3):
            place(drums, clap(1.0), x)
        place(drums, taiko(100, 0.5), x + BEAT * 0.75)
        if double and beat_in_bar == 3:
            place(drums, taiko(130, 0.6, 0.5), x + BEAT * 0.5)
        for s in range(4):
            place(drums, hat(0.9 if s == 2 else 0.5), x + s * BEAT / 4)
        # bass + string arps (16ths)
        c = chord_at(x, bars_per_chord)
        for s in range(4):
            tt_ = x + s * BEAT / 4
            bf = note(BASS[c] - (12 if s % 2 == 0 else 0))
            place(music, pluck(bf, 0.2, 700, 2.4), tt_)
            arp = CHORDS[c][[0, 1, 2, 1][s]] + 12
            place(music, np.stack([pluck(note(arp), 0.18, 3500, 1.1), pluck(note(arp + 12), 0.18, 4000, 0.6)]), tt_)
        # pads / brass on bar starts
        if beat_in_bar == 0:
            freqs = [note(n) for n in CHORDS[c]] + [note(CHORDS[c][0] - 12)]
            place(music, pad(freqs, BEAT * 4 * bars_per_chord + 0.8, 1.0 if not double else 1.3, choir=double), x) if (int(x / (BEAT * 4)) % bars_per_chord == 0) else None
            if double:
                place(music, brass([note(n - 12) for n in CHORDS[c]], 0.55, 1.2), x)
                place(music, brass([note(n - 12) for n in CHORDS[c]], 0.3, 0.8), x + BEAT * 1.5)
        x += BEAT
        i += 1


groove(*SEC["groove"])
groove(*SEC["climax"], double=True)

# ── break (14–18): filtered arps only, snare roll, riser, suck-out ──
a, b = SEC["break"]
x = a
while x < b - 0.25:
    c = chord_at(x, 2)
    for s in range(4):
        arp = CHORDS[c][[0, 1, 2, 1][s]] + 12
        place(music, pluck(note(arp), 0.18, 1200, 0.9), x + s * BEAT / 4)
    place(fx, tick(0.6), x)
    x += BEAT
place(music, pad([note(38), note(45), note(53)], b - a, 1.2), a)
roll0 = b - 2.0
roll_t = roll0
while roll_t < b - 0.3:
    p = (roll_t - roll0) / (b - 0.3 - roll0)
    place(drums, clap(0.25 + 0.7 * p), roll_t)
    roll_t += BEAT / 4 if p < 0.5 else BEAT / 8
place(fx, riser(3.6, 1.0), b - 3.6 - 0.25)

# ── fill into the logo ──
a, b = SEC["fill"]
x = a
while x < b - 0.26:
    p = (x - a) / (b - a)
    place(drums, taiko(90 + 60 * p, 0.6 + 0.4 * p, 0.5), x)
    x += BEAT / 4
place(fx, riser(1.8, 0.9), b - 1.8 - 0.2)

# ── outro: huge chord, slow taiko hits ──
a, b = SEC["outro"]
place(music, pad([note(38), note(50), note(53), note(57), note(62)], 8.5, 1.6, choir=True), a)
place(music, pad([note(26), note(38)], 8.5, 1.4), a)
for h in TR["outroDrums"]:
    place(drums, taiko(70, 1.0, 2.0), h)
    place(drums, kick(1.0), h)

# ── hits ──
BIG = TR["bigHits"]
for h in TR["hits"]:
    big = h in BIG or h == SEC["groove"][0]
    place(fx, crash(1.0 if big else 0.6), h)
    if h in BIG:
        place(fx, braam(1.4, 38, 4.5 if h == BIG[-1] else 3.2), h)
        place(fx, impact(1.0 if big else 0.7), h)
    else:
        place(drums, kick(1.0), h)
        place(music, brass([note(n - 12) for n in CHORDS[0]], 0.6, 1.0), h)
place(fx, riser(3.6, 0.8), BIG[0] - 3.6)
place(fx, riser(2.0, 0.7), BIG[1] - 2.0)
place(fx, riser(1.8, 0.6), SEC["groove"][0] - 1.8)
place(fx, riser(1.4, 0.7), SEC["outro"][0] - 1.4 - 0.2)

# silence-suck before the big drops (classic trailer gap)
def duck_gap(buf, a, b):
    i, j = int(a * SR), int(b * SR)
    fade = int(0.03 * SR)
    buf[:, i:i + fade] *= np.linspace(1, 0, fade)
    buf[:, i + fade:j] = 0


for g in ((SEC['climax'][0] - 0.25, SEC['climax'][0]), (SEC['outro'][0] - 0.2, SEC['outro'][0])):
    for buf in (music, drums):
        duck_gap(buf, *g)

# ── buses ──
ir_big = impulse_response(3.0, 1.7)
ir_room = impulse_response(1.2, 4.0)
drums_w = drums + convolve(drums, ir_room) * 0.35
music_w = music + convolve(music, ir_big) * 0.30
fx_w = fx + convolve(fx, ir_big) * 0.25
bed = drums_w * 0.9 + music_w * 1.0 + fx_w * 0.9


def rms_db(x):
    return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)


bed *= 10 ** ((-17.0 - rms_db(bed)) / 20)

# ── voiceover: cut phrases by word timings and drop them on the grid ──
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "data", "vo", TR["vo_file"]), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
take = np.frombuffer(raw, np.float32).astype(np.float64)
vo = np.zeros((2, N))
for p in TR["vo"]:
    a, b = p["src"]
    seg = take[int(a * SR):int(b * SR)].copy()
    f = int(0.012 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    place(vo, seg, p["at"])
# trailer voice chain: low-mid weight, presence, gentle saturation, short plate
vo = vo + fft_filter(vo, hi=220) * 0.5 + fft_filter(vo, lo=2500, hi=6000) * 0.4
vo = np.tanh(vo * 2.2) / np.tanh(2.2)
vo = vo + convolve(vo, impulse_response(1.0, 5.0, 0.01, 5000)) * 0.12
voiced = np.abs(vo).mean(0) > 1e-3
vo *= 10 ** ((-13.0 - rms_db(vo[:, voiced])) / 20)

# sidechain: bed ducks under the voice (but keeps its punch)
ve = np.abs(vo).mean(0)
k = int(0.08 * SR)
ve = np.convolve(ve, np.ones(k) / k, mode="same")
duck = 1 - 0.45 * np.clip(ve / (np.percentile(ve[ve > 1e-4], 90) + 1e-9), 0, 1)
mix = bed * duck + vo

# master: glue + limiter-ish
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix /= np.abs(mix).max() / 0.95
end = int((DUR - 0.4) * SR)
mix[:, end:] *= np.linspace(1, 0, N - end)

out = os.path.join(ROOT, "public", "trailer_mix.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype("<i2").tobytes())

# beat map for the picture: kicks/hits drive camera punches and flashes
kicks = []
for name, dbl in (("groove", False), ("climax", True)):
    a, b = SEC[name]
    x = a
    while x < b - 1e-6:
        kicks.append(round(x, 3))
        x += BEAT if dbl else BEAT * 2
json.dump({"kicks": kicks, "hits": TR["hits"]}, open(os.path.join(ROOT, "src", "beats.json"), "w"))
print("wrote", out)
