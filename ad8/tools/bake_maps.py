"""Bake photoreal shaded-relief plates for the ad from SRTM (Terrarium) DEMs + Natural Earth vectors.

Outputs into public/:
  country.jpg      daylight relief of Tajikistan, neighbours dimmed
  country.json     border path + label positions in plate pixels
  city.jpg         Dushanbe at night: relief + city lights
  city_lights.png  additive light layer (for flicker / bloom in comp)
  city.json        branch positions in plate pixels
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
PUB = os.path.join(ROOT, "public")
os.makedirs(PUB, exist_ok=True)
rng = np.random.default_rng(8)

COUNTRY = dict(lon0=65.8, lat0=35.9, lon1=76.2, lat1=41.7, z=9)
CITY = dict(lon0=68.62, lat0=38.46, lon1=68.95, lat1=38.67, z=13)


def merc(lon, lat, z):
    n = 2 ** z * 256
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def projector(box):
    x0, y0 = merc(box["lon0"], box["lat1"], box["z"])
    # the stitched grid was cropped at int(frac*256) of the tile origin -> same as floor of absolute px
    x0, y0 = math.floor(x0), math.floor(y0)
    return lambda lon, lat: (merc(lon, lat, box["z"])[0] - x0, merc(lon, lat, box["z"])[1] - y0)


def blur(a, r):
    """separable box blur x3 ~ gaussian"""
    for _ in range(3):
        for ax in (0, 1):
            c = np.cumsum(np.pad(a, [(r + 1, r) if i == ax else (0, 0) for i in range(2)], mode="edge"), axis=ax)
            if ax == 0:
                a = (c[2 * r + 1:] - c[:-2 * r - 1]) / (2 * r + 1)
            else:
                a = (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)
    return a


def shade(dem, mpp, exag, az=315, alt=38):
    gy, gx = np.gradient(dem * exag, mpp)
    nx, ny, nz = -gx, gy, np.ones_like(dem)
    l = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    nx, ny, nz = nx / l, ny / l, nz / l
    a, e = math.radians(az), math.radians(alt)
    lx, ly, lz = math.sin(a) * math.cos(e), math.cos(a) * math.cos(e), math.sin(e)
    direct = np.clip(nx * lx + ny * ly + nz * lz, 0, 1)
    sky = 0.5 + 0.5 * nz
    return direct, sky, nz


def ramp(h, stops):
    hs = np.array([s[0] for s in stops], np.float32)
    cs = np.array([s[1] for s in stops], np.float32)
    out = np.zeros(h.shape + (3,), np.float32)
    for k in range(3):
        out[..., k] = np.interp(h, hs, cs[:, k])
    return (out / 255) ** 2.2


def polys_of(geom):
    return geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]


def lines_of(geom):
    return geom["coordinates"] if geom["type"] == "MultiLineString" else [geom["coordinates"]]


def to_u8(img):
    return Image.fromarray((np.clip(img, 0, 1) ** (1 / 2.2) * 255).astype(np.uint8))


# ───────────────────────────── country plate ─────────────────────────────
def bake_country():
    dem = np.load(os.path.join(DATA, "dem_country.npy")).astype(np.float32)
    dem = np.clip(dem, 150, None)
    H, W = dem.shape
    P = projector(COUNTRY)
    lat_mid = (COUNTRY["lat0"] + COUNTRY["lat1"]) / 2
    mpp = 156543.03 * math.cos(math.radians(lat_mid)) / 2 ** COUNTRY["z"]

    sm = blur(dem, 1)
    direct, sky, nz = shade(sm, mpp, 2.2)
    direct2, _, _ = shade(blur(dem, 6), mpp, 2.2, az=300, alt=30)  # broad forms
    relief = dem - blur(dem, 14)
    ao = np.clip(0.75 + relief / 900, 0.35, 1.15)

    slope = np.clip(1 - nz, 0, 1)
    rocky = np.clip(slope * 4.0, 0, 1)
    base = ramp(dem, [
        (150, (200, 176, 128)), (450, (190, 168, 116)), (700, (128, 140, 78)),
        (1100, (104, 118, 66)), (1700, (140, 116, 80)), (2500, (132, 106, 84)),
        (3400, (122, 108, 96)), (4300, (140, 128, 118)), (8000, (156, 150, 146))])
    rock = ramp(dem, [(0, (120, 104, 88)), (3000, (104, 96, 90)), (8000, (120, 118, 120))])
    col = base * (1 - rocky[..., None] * 0.55) + rock * (rocky[..., None] * 0.55)

    # snow: high + not too steep + facing north gets more
    peak = np.clip((sm - blur(sm, 10)) / 300, 0, 1)
    snow = np.clip((sm - 4700) / 700, 0, 1) * np.clip(0.4 + peak * 1.4, 0, 1) * np.clip(1.3 - slope * 1.5, 0, 1)
    col = col * (1 - snow[..., None]) + np.array([0.86, 0.9, 0.96]) * snow[..., None]

    # fine grain so close-ups are not plastic
    tex = blur(rng.standard_normal((H, W)).astype(np.float32), 1) * 0.06
    light = (0.10 + 0.95 * direct * (0.65 + 0.35 * direct2) + 0.22 * sky) * ao
    img = col * light[..., None] * (1 + tex[..., None])
    img = img ** 1.0

    # water
    wm = Image.new("L", (W, H), 0)
    dw = ImageDraw.Draw(wm)
    lakes = json.load(open(os.path.join(DATA, "ne_10m_lakes.geojson")))
    for f in lakes["features"]:
        for poly in polys_of(f["geometry"]):
            pts = [P(*c) for c in poly[0]]
            if any(0 <= x < W and 0 <= y < H for x, y in pts):
                dw.polygon(pts, fill=255)
    rivers = json.load(open(os.path.join(DATA, "ne_10m_rivers_lake_centerlines.geojson")))
    river_paths = []
    for f in rivers["features"]:
        for line in lines_of(f["geometry"]):
            pts = [P(*c) for c in line]
            if any(0 <= x < W and 0 <= y < H for x, y in pts):
                w = 5 if f["properties"].get("scalerank", 9) <= 6 else 3
                dw.line(pts, fill=255, width=w, joint="curve")
                river_paths.append(pts)
    water = np.asarray(wm.filter(ImageFilter.GaussianBlur(1.2)), np.float32)[..., None] / 255
    wcol = np.array([0.10, 0.28, 0.38]) * (0.6 + 0.6 * sky[..., None])
    img = img * (1 - water) + wcol * water

    # Tajikistan mask
    cm = Image.new("L", (W, H), 0)
    dc = ImageDraw.Draw(cm)
    countries = json.load(open(os.path.join(DATA, "ne_10m_admin_0_countries.geojson")))
    tjk = next(f for f in countries["features"] if f["properties"]["ADM0_A3"] == "TJK")
    border_paths = []
    for poly in polys_of(tjk["geometry"]):
        pts = [P(*c) for c in poly[0]]
        dc.polygon(pts, fill=255)
        border_paths.append(pts)
    inside = np.asarray(cm.filter(ImageFilter.GaussianBlur(3)), np.float32)[..., None] / 255

    lum = img.mean(-1, keepdims=True)
    outside = (lum * 0.55 + img * 0.45) * np.array([0.42, 0.48, 0.62]) * 0.75
    img = img * inside + outside * (1 - inside)

    # haze toward the edges of the plate, like an aerial lens
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    haze = np.clip((d - 0.6) * 0.6, 0, 0.45)[..., None]
    img = img * (1 - haze) + np.array([0.05, 0.07, 0.11]) * haze

    to_u8(img).save(os.path.join(PUB, "country.jpg"), quality=90)

    def svgpath(paths, simplify=1.5):
        out = []
        for pts in paths:
            keep = [pts[0]]
            for p in pts[1:]:
                if math.hypot(p[0] - keep[-1][0], p[1] - keep[-1][1]) >= simplify:
                    keep.append(p)
            out.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in keep) + "Z")
        return "".join(out)

    labels = {
        "dushanbe": P(68.7739, 38.5598), "khujand": P(69.6220, 40.2826), "kulob": P(69.7845, 37.9146),
        "khorog": P(71.5530, 37.4897), "bokhtar": P(68.7809, 37.8364), "somoni": P(72.0167, 38.9389),
        "pamir_c": P(73.0, 38.2), "hissar_c": P(68.45, 38.55), "fann": P(68.25, 39.1),
    }
    json.dump({"w": W, "h": H, "border": svgpath(border_paths), "labels": labels},
              open(os.path.join(PUB, "country.json"), "w"))
    print("country", W, H, "dushanbe at", labels["dushanbe"])


# ───────────────────────────── city plate ─────────────────────────────
BRANCHES = json.load(open(os.path.join(ROOT, "src", "branches.json")))


def bake_city():
    dem = np.load(os.path.join(DATA, "dem_city.npy")).astype(np.float32)
    P0 = projector(CITY)
    S = 2  # upscale for crisp close-ups
    H0, W0 = dem.shape
    dem = np.asarray(Image.fromarray(dem).resize((W0 * S, H0 * S), Image.BICUBIC), np.float32)
    H, W = dem.shape
    P = lambda lon, lat: tuple(v * S for v in P0(lon, lat))
    mpp = 156543.03 * math.cos(math.radians(38.56)) / 2 ** CITY["z"] / S

    sm = blur(dem, 2)
    direct, sky, nz = shade(sm, mpp, 3.0, az=200, alt=28)   # low moon from the south
    rim, _, _ = shade(sm, mpp, 3.0, az=40, alt=18)            # cold sky light from NE
    relief = sm - blur(sm, 40)
    ao = np.clip(0.8 + relief / 160, 0.4, 1.2)

    # urban footprint (real, Natural Earth)
    um = Image.new("L", (W, H), 0)
    du = ImageDraw.Draw(um)
    urban = json.load(open(os.path.join(DATA, "ne_10m_urban_areas.geojson")))
    for f in urban["features"]:
        for poly in polys_of(f["geometry"]):
            pts = [P(*c) for c in poly[0]]
            if any(0 <= x < W and 0 <= y < H for x, y in pts):
                du.polygon(pts, fill=255)
    urb = np.asarray(um.filter(ImageFilter.GaussianBlur(10)), np.float32) / 255
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    def fbm(oct_, base):
        acc = np.zeros((H, W), np.float32); amp = 1.0
        for o in range(oct_):
            g = max(4, int(base / 2 ** o))
            n = rng.standard_normal((H // g + 2, W // g + 2)).astype(np.float32)
            acc += np.asarray(Image.fromarray(n).resize((W + 2 * g, H + 2 * g), Image.BICUBIC))[g:g + H, g:g + W] * amp
            amp *= 0.55
        return acc
    cx, cy = P(68.78, 38.572)
    core = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * (W * 0.16) ** 2)))
    ragged = np.clip(urb + fbm(4, 160) * 0.22 - 0.1, 0, 1)
    flat = np.clip(1.4 - (1 - nz) * 18, 0, 1)
    low = np.clip((1000 - sm) / 160, 0, 1)
    density = (ragged * (0.45 + 0.75 * core) + 0.07 * low) * flat * (0.35 + 0.65 * low)
    density *= np.clip(0.75 + fbm(3, 90) * 0.5, 0.15, 1.2)   # parks / dark pockets

    def grid(angle, pitch, width, wobble):
        a_ = math.radians(angle)
        u = xx * math.cos(a_) + yy * math.sin(a_)
        v = -xx * math.sin(a_) + yy * math.cos(a_)
        w = fbm(2, 300) * wobble
        du_ = np.abs(((u + w) % pitch) - pitch / 2)
        dv_ = np.abs(((v - w) % (pitch * 1.25)) - pitch * 0.625)
        return np.maximum(np.clip(1 - (pitch / 2 - du_) / width, 0, 1) ** 3, np.clip(1 - (pitch * 0.625 - dv_) / width, 0, 1) ** 3)
    lamps = (rng.random((H, W)) < 0.35).astype(np.float32)
    streets = np.maximum(grid(6, 38, 1.5, 8), grid(-12, 52, 1.5, 12) * 0.7) * lamps
    arterial = np.maximum(grid(4, 300, 2.4, 10), grid(-30, 520, 2.2, 14) * 0.8)
    blocks = (rng.random((H, W)) < 0.010).astype(np.float32) * (0.6 + rng.random((H, W)) * 1.8)
    lights = (streets * 0.75 + arterial * 1.3 + blocks) * density
    lights = np.clip(lights, 0, 1.6)
    glow = blur(lights, 3) * 1.2 + blur(lights, 14) * 1.5 + blur(density, 70) * 0.10

    sodium = np.array([1.0, 0.62, 0.28]); led = np.array([0.75, 0.86, 1.0])
    mix = blur(rng.random((H, W)).astype(np.float32), 50)[..., None]
    mix = np.clip((mix - 0.45) * 6, 0, 1)
    lcol = sodium * (1 - mix * 0.5) + led * (mix * 0.5)

    terrain = np.array([0.010, 0.017, 0.032]) * (0.15 + 1.6 * direct[..., None] + 0.3 * sky[..., None]) * ao[..., None]
    terrain += np.array([0.03, 0.05, 0.09]) * (rim[..., None] ** 2) * 0.9
    base = terrain + lcol * glow[..., None] * 0.16
    to_u8(base).save(os.path.join(PUB, "city.jpg"), quality=90)
    L = np.clip(lcol * (lights[..., None] * 0.9 + blur(lights, 2)[..., None] * 0.6), 0, 1)
    a = np.clip(L.max(-1), 0, 1)
    rgba = np.dstack([np.clip(L / np.maximum(a[..., None], 1e-3), 0, 1), a])
    Image.fromarray((rgba * 255).astype(np.uint8), "RGBA").save(os.path.join(PUB, "city_lights.png"), optimize=True)

    pins = {b["id"]: P(b["lon"], b["lat"]) for b in BRANCHES}
    json.dump({"w": W, "h": H, "pins": pins, "mpp": mpp}, open(os.path.join(PUB, "city.json"), "w"))
    print("city", W, H, pins)


if __name__ == "__main__":
    what = sys.argv[1:] or ["country", "city"]
    if "country" in what: bake_country()
    if "city" in what: bake_city()
