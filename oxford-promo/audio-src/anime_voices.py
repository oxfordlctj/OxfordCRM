"""English anime dub voices with Kokoro (offline).

usage: python anime_voices.py <dir with kokoro-fp32.onnx + voices-v1.0.bin> <out dir>
"""
import json
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

NARRATOR = ("bm_george", 0.88)
REN = ("am_puck", 1.0)
REPORTER = ("af_bella", 1.05)

LINES = {
    "n1": (NARRATOR, "Long ago... the Nine-Tailed Fox awoke."),
    "n2": (NARRATOR, "Oxford Shinobi. Episode eight. The Nine Tails."),
    "n3": (NARRATOR, "It came to burn our village to the ground."),
    "r1": (REN, "Not today, fox!"),
    "r2": (REN, "I will protect everyone!"),
    "r3": (REN, "Take this!"),
    "r4": (REN, "He's... too strong..."),
    "n4": (NARRATOR, "Only the Eye of Knowledge can read the ancient seal."),
    "r5": (REN, "Eye of Knowledge... awaken!"),
    "r6": (REN, "Seal of Light... activate!"),
    "r7": (REN, "This is the end!"),
    "q1": (REPORTER, "Ren! What helped you win?"),
    "r8": (REN, "Oxford Learning Centre!"),
    "n5": (NARRATOR, "To be continued... Your episode starts at Oxford."),
}

k = Kokoro(sys.argv[1] + "/kokoro-fp32.onnx", sys.argv[1] + "/voices-v1.0.bin")
out = {}
for key, ((voice, speed), text) in LINES.items():
    s, sr = k.create(text, voice=voice, speed=speed, lang="en-us" if voice[0] == "a" else "en-gb")
    sf.write(f"{sys.argv[2]}/{key}.wav", s, sr)
    out[key] = round(len(s) / sr, 2)
json.dump(out, open(f"{sys.argv[2]}/durations.json", "w"), indent=1)
print(out)
