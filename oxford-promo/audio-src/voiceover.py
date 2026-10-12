"""Generate the English voice-over lines with Kokoro (offline).

usage: python voiceover.py <dir with kokoro-fp32.onnx + voices-v1.0.bin> <out dir>
"""
import json, sys
import soundfile as sf
from kokoro_onnx import Kokoro

VOICE = "bm_george"
LINES = {
    "v01": "Seven branches.",
    "v02": "Thousands of students.",
    "v03": "One city.",
    "v04": "But Oxford never stops growing.",
    "v05": "From the heart of Tajikistan...",
    "v06": "to the heart of Dushanbe.",
    "n1": "Sadbarg.",
    "n2": "Guliston.",
    "n3": "Mardon.",
    "n4": "Giprozem.",
    "n5": "Eighty-two.",
    "n6": "Selkhoz.",
    "n7": "O. V. I. R.",
    "v08": "Seven branches, all around the city.",
    "v09": "And now...",
    "v10": "branch number eight.",
    "v11": "Dompechat. Right next to Alfemo.",
    "v12": "Why here?",
    "v13": "It's the very center of Dushanbe.",
    "v14": "Every major route passes through here.",
    "v15": "So you can reach us from any district.",
    "v16": "Oxford. Branch number eight.",
    "v17": "Opening soon. Be the first to join.",
}

k = Kokoro(sys.argv[1] + "/kokoro-fp32.onnx", sys.argv[1] + "/voices-v1.0.bin")
out = {}
for key, text in LINES.items():
    samples, sr = k.create(text, voice=VOICE, speed=0.9, lang="en-gb")
    sf.write(f"{sys.argv[2]}/{key}.wav", samples, sr)
    out[key] = round(len(samples) / sr, 3)
json.dump(out, open(f"{sys.argv[2]}/durations.json", "w"), indent=1)
print(out)
