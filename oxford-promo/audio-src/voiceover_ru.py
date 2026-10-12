"""Russian voice-over with RHVoice (offline, voice "Aleksandr").

usage: python voiceover_ru.py <out dir>
"""
import ctypes
import json
import sys
import wave

import rhvoice_wrapper_bin as b
from rhvoice_wrapper import rhvoice_proxy

LINES = {
    "s01": "Семь филиалов.",
    "s02": "Тысячи студентов.",
    "s03": "Один большой Оксфорд.",
    "s04": "И мы продолжаем расти.",
    "s05": "Это Таджикистан.",
    "s06": "Его сердце — Душанбе.",
    "s07": "Здесь уже работают семь наших филиалов.",
    "n1": "Садбарг.",
    "n2": "Гулистон.",
    "n3": "Мардон.",
    "n4": "Гипрозем.",
    "n5": "Восемьдесят второй.",
    "n6": "Сельхоз.",
    "n7": "ОВИР.",
    "s08": "Но где откроется восьмой?",
    "s09": "Мы искали место, куда легко добраться из любой точки города.",
    "s10": "И нашли его.",
    "s11": "Домпечать. Рядом с Алфемо.",
    "s12": "Почему именно здесь?",
    "s13": "Первое. Это самый центр Душанбе.",
    "s14": "Второе. Здесь сходятся главные маршруты города.",
    "s15": "Третье. Рядом Алфемо — место, куда каждый день приходят тысячи людей.",
    "s16": "Оксфорд. Филиал номер восемь.",
    "s17": "Скоро открытие. Запишись первым!",
}

buf = bytearray()
rate = [24000]


def play(samples, count, _):
    buf.extend(ctypes.string_at(samples, count * 2))
    return 1


def setrate(r, _):
    rate[0] = r
    return 1


e = rhvoice_proxy.Engine(lib_path=b.lib_path)
e.init(play, setrate, data_path=b.data_path, config_path="/nonexistent")
out = {}
for key, text in LINES.items():
    buf.clear()
    e.set_params(voice_profile="Aleksandr", absolute_rate=-0.08, absolute_pitch=-0.05)
    e.generate(text)
    with wave.open(f"{sys.argv[1]}/{key}.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate[0])
        w.writeframes(bytes(buf))
    out[key] = round(len(buf) / 2 / rate[0], 3)
json.dump(out, open(f"{sys.argv[1]}/durations.json", "w"), indent=1)
print(out)
