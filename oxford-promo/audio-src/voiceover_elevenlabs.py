"""Russian voice-over via ElevenLabs.

Needs ELEVENLABS_API_KEY in the environment and network access to api.elevenlabs.io.
usage: python voiceover_elevenlabs.py <out dir> [voice_id]

Lines are the same as voiceover_ru.py so the timeline keys stay valid.
"""
import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from voiceover_lines import LINES  # noqa: E402

KEY = os.environ["ELEVENLABS_API_KEY"]
OUT = sys.argv[1]
VOICE = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")
os.makedirs(OUT, exist_ok=True)

for key, text in LINES.items():
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192",
        data=json.dumps(
            {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "language_code": "ru",
                # trailer read: low stability = more drama, high style = more emphasis
                "voice_settings": {"stability": 0.3, "similarity_boost": 0.9, "style": 0.6, "use_speaker_boost": True},
            }
        ).encode(),
        headers={"xi-api-key": KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"},
    )
    with urllib.request.urlopen(req, timeout=120) as r, open(f"{OUT}/{key}.mp3", "wb") as f:
        f.write(r.read())
    print("ok", key, flush=True)

# Trailer finish: a touch deeper, chest boost, tight compression, big-room tail.
TRAILER_FX = (
    "asetrate=44100*0.94,aresample=48000,atempo=1/0.94,"
    "highpass=f=60,equalizer=f=110:t=q:w=1:g=4,equalizer=f=3200:t=q:w=1.5:g=2,"
    "acompressor=threshold=-20dB:ratio=4:attack=5:release=120:makeup=4,"
    "aecho=0.8:0.6:60|120:0.18|0.1"
)
for key in LINES:
    os.system(f'ffmpeg -v error -y -i "{OUT}/{key}.mp3" -af "{TRAILER_FX}" -ar 48000 "{OUT}/{key}.wav"')
print("trailer fx applied")
