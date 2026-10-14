"""Vectorize the Oxford logo (emblem, Tajik tagline, wordmark) into SVG path data for crisp full-screen use."""
import json, os
import numpy as np
import potrace
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCALE = 4
im = Image.open(os.path.join(ROOT, "data", "logo_src.png")).convert("RGBA")
im = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
a = np.asarray(im).astype(np.float32)
ink = (a[..., 3] / 255) * (1 - a[..., :3].mean(-1) / 255)
W, H = im.size

PARTS = {"emblem": (0, 352), "tagline": (362, 395), "wordmark": (398, 467)}


def trace(mask):
    bm = potrace.Bitmap(~mask)  # potracer traces False pixels
    plist = bm.trace(turdsize=6, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    for curve in plist:
        s = curve.start_point
        d.append(f"M{s.x / SCALE:.2f},{s.y / SCALE:.2f}")
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x / SCALE:.2f},{seg.c.y / SCALE:.2f}L{seg.end_point.x / SCALE:.2f},{seg.end_point.y / SCALE:.2f}")
            else:
                d.append(f"C{seg.c1.x / SCALE:.2f},{seg.c1.y / SCALE:.2f} {seg.c2.x / SCALE:.2f},{seg.c2.y / SCALE:.2f} {seg.end_point.x / SCALE:.2f},{seg.end_point.y / SCALE:.2f}")
        d.append("Z")
    return "".join(d)


out = {"w": W / SCALE, "h": H / SCALE}
for name, (y0, y1) in PARTS.items():
    m = np.zeros_like(ink, bool)
    m[y0 * SCALE:y1 * SCALE] = ink[y0 * SCALE:y1 * SCALE] > 0.5
    out[name] = trace(m)
    out[name + "_box"] = [0, y0, W / SCALE, y1 - y0]
json.dump(out, open(os.path.join(ROOT, "src", "logo.json"), "w"))
print({k: (len(v) if isinstance(v, str) else v) for k, v in out.items()})
