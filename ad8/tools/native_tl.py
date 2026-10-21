"""Timeline for the notebook-style reel (src/native.json -> src/native_tl.json).

Everything that gets written on the page is a stroke with a start time and a duration; the
composition animates the handwriting from it and the score puts a pen-scratch sound on each one.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = json.load(open(os.path.join(ROOT, "src", "native.json")))
ev = N["ev"]


def dur(word, k=0.085):
    return round(min(0.75, max(0.3, 0.12 + k * len(word))), 3)


LINE0, GAP = 430, 160
pairs = [
    ("модар", "mother", "madar", "mother", None),
    ("бародар", "brother", "barodar", "brother", None),
    ("духтар", "daughter", "dukhtar", "daughter", None),
    ("ном", "name", "nom", "name", None),
    ("нав", "new", "nav", "new", None),
    ("дар", "door", "dar", "door", None),
    ("ситора", "star", "sitora", "star", None),
    None,  # header row: "рақамҳо ҳам!"
    ("ду", "two", "du", "two", "2"),
    ("се", "three", "se", "three", "3"),
    ("нӯҳ", "nine", "nuh", "nine", "9"),
    ("бад", "bad?", "bad", "badEn", None),
]
lines = []
for i, p in enumerate(pairs):
    y = LINE0 + GAP * i
    if p is None:
        lines.append({"kind": "header", "y": y, "text": "рақамҳо ҳам!", "t": ev["numbers"], "d": 0.6})
        continue
    tj, en, a, b, num = p
    t, te = ev[a], ev[b]
    dtj = min(dur(tj), te - t - 0.08)
    arrow_t = t + dtj + 0.02
    arrow_d = round(max(0.12, min(0.24, te - arrow_t - 0.02)), 3)
    lines.append({"kind": "bad" if tj == "бад" else "pair", "y": y, "tj": tj, "en": en, "num": num,
                  "t": t, "dtj": round(dtj, 3), "arrowT": round(arrow_t, 3), "arrowD": arrow_d,
                  "te": te, "den": dur(en)})

# writing strokes in time order: (start, duration) for the pen and the scratch sound
strokes = []
for l in lines:
    if l["kind"] == "header":
        strokes.append([l["t"], l["d"]])
    else:
        strokes += [[l["t"], l["dtj"]], [l["arrowT"], l["arrowD"]], [l["te"], l["den"]]]
note = {"in": round(ev["notcoin"] - 0.15, 3), "out": round(ev["nom"] - 0.3, 3),
        "head": ev["notcoin"], "root": round(ev["words6000"] + 0.5, 3), "trunk": round(ev["words6000"] + 1.0, 3),
        "en": round(ev["words6000"] + 1.9, 3), "tj": round(ev["words6000"] + 2.5, 3)}
strokes += [[note["head"], 0.6], [note["root"], 0.6], [note["trunk"], 0.9], [note["en"], 0.5], [note["tj"], 0.5]]
extra = {
    "scribble": round(ev["no"] - 0.05, 3), "noText": round(ev["no"] + 0.45, 3),
    "zoomOut": round(ev["khulosa"] - 0.25, 3), "ten": round(ev["dah"] - 0.1, 3),
    "toBottom": round(ev["boqi"] - 0.3, 3), "sticker": round(ev["oxford"] - 0.05, 3),
    "blank": round(ev["boz"] + 0.05, 3), "commentNote": round(ev["comment"] - 0.1, 3),
    "tenY": LINE0 + GAP * len(pairs) + 10, "stickerY": 2610, "blankY": 2860,
}
strokes += [[extra["scribble"], 0.35], [extra["noText"], 0.5], [extra["ten"], 0.7], [extra["blank"], 0.9], [extra["commentNote"], 0.6]]
strokes.sort()
TL = {"lines": lines, "note": note, "extra": extra, "strokes": strokes}
json.dump(TL, open(os.path.join(ROOT, "src", "native_tl.json"), "w"), indent=1, ensure_ascii=False)
print(len(strokes), "strokes;", extra)
