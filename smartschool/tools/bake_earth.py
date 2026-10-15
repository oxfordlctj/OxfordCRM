"""Bake equirectangular Earth textures for the canvas globe.

public/earth_day.jpg     terrain + bathymetry colour with hillshade (4096x2048)
public/earth_lights.jpg  night lights from Natural Earth populated places (pop-weighted)
public/earth_clouds.jpg  procedural cloud cover, wraps at the antimeridian
"""
import json, math, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA, PUB = os.path.join(ROOT, "data"), os.path.join(ROOT, "public")
rng = np.random.default_rng(5)

dem = np.load(os.path.join(DATA, "world_dem.npy")).astype(np.float32)
dem = np.clip(dem, -11000, 8800)
H, W = dem.shape
lat = (90 - (np.arange(H) + 0.5) / H * 180)[:, None] * np.ones((1, W))
lon = ((np.arange(W) + 0.5) / W * 360 - 180)[None, :] * np.ones((H, 1))


def blur_wrap(a, r):
    """box-blur x3, wrapping in longitude"""
    for _ in range(3):
        p = np.pad(a, ((0, 0), (r + 1, r)), mode="wrap")
        c = np.cumsum(p, axis=1)
        a = (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)
        p = np.pad(a, ((r + 1, r), (0, 0)), mode="edge")
        c = np.cumsum(p, axis=0)
        a = (c[2 * r + 1:] - c[:-2 * r - 1]) / (2 * r + 1)
    return a


def ramp(x, stops):
    xs = np.array([s[0] for s in stops], np.float32)
    cs = np.array([s[1] for s in stops], np.float32) / 255
    return np.stack([np.interp(x, xs, cs[:, k]) for k in range(3)], -1) ** 2.2


land = (dem > 0).astype(np.float32)
alat = np.abs(lat)

# continentality: far from the sea = drier
cont = 1 - blur_wrap(1 - land, 40)
cont = np.clip((cont - 0.6) / 0.4, 0, 1)

# climate bands -> greenness
green = np.interp(alat, [0, 10, 16, 24, 32, 40, 50, 60, 68, 75], [1.0, 0.95, 0.6, 0.1, 0.35, 0.85, 0.95, 0.9, 0.5, 0.25])
# the big deserts sit in the subtropics *and* far from the sea
green = np.clip(green - cont * 0.3 * np.interp(alat, [0, 12, 20, 32, 45, 55], [0.2, 0.6, 1.6, 1.6, 1.0, 0.3]), 0, 1)
green = green ** 0.5
boreal = np.clip((alat - 50) / 12, 0, 1) * np.clip((70 - alat) / 6, 0, 1)

desert = ramp(dem, [(0, (196, 166, 118)), (1500, (176, 146, 108)), (4000, (156, 136, 120))])
forest = ramp(dem, [(0, (38, 84, 34)), (1200, (58, 88, 44)), (3000, (104, 98, 78))])
taiga = ramp(dem, [(0, (36, 62, 40)), (1500, (60, 70, 55))])
col = desert * (1 - green[..., None]) + forest * green[..., None]
col = col * (1 - boreal[..., None] * 0.6) + taiga * (boreal[..., None] * 0.6)
rock = ramp(dem, [(2500, (120, 112, 104)), (5000, (150, 146, 142))])
mnt = np.clip((dem - 2600) / 1600, 0, 1)[..., None]
col = col * (1 - mnt) + rock * mnt

# ice: high latitudes, Greenland, Antarctica, high peaks
ice = np.clip((alat - 66) / 8, 0, 1) * land
ice = np.maximum(ice, ((lat > 59) & (lon > -74) & (lon < -11) & (dem > 0)).astype(np.float32))
ice = np.maximum(ice, (lat < -60).astype(np.float32) * land)
ice = np.maximum(ice, np.clip((dem - 4600) / 900, 0, 1))
col = col * (1 - ice[..., None]) + np.array([0.86, 0.9, 0.95]) * ice[..., None]

ocean = ramp(-dem, [(0, (40, 120, 140)), (40, (22, 82, 120)), (200, (14, 52, 96)), (2500, (8, 30, 70)), (7000, (4, 16, 44))])
sea_ice = np.clip((alat - 72) / 6, 0, 1)
ocean = ocean * (1 - sea_ice[..., None] * 0.85) + np.array([0.8, 0.85, 0.9]) * sea_ice[..., None] * 0.85

# hillshade
mpp = 40075000 / W
gy, gx = np.gradient(blur_wrap(dem, 1) * 18, mpp)
gx = gx / np.maximum(np.cos(np.radians(lat)), 0.1)
nx, ny, nz = -gx, gy, np.ones_like(dem)
l = np.sqrt(nx ** 2 + ny ** 2 + 1)
sh = np.clip((nx * -0.55 + ny * 0.55 + nz * 0.63) / l, 0, 1)
shade = 0.55 + 0.75 * sh
col = col * shade[..., None]
coast = np.clip(blur_wrap(land, 1), 0, 1)[..., None]
img = col * coast + ocean * (1 - coast)
Image.fromarray((np.clip(img, 0, 1) ** (1 / 2.2) * 255).astype(np.uint8)).save(os.path.join(PUB, "earth_day.jpg"), quality=90)

# night lights
pts = json.load(open(os.path.join(DATA, "ne_10m_populated_places_simple.geojson")))["features"]
lights = np.zeros((H, W), np.float32)
for f in pts:
    pr = f["properties"]
    pop = pr.get("pop_max") or 0
    if pop < 20000:
        continue
    lo, la = f["geometry"]["coordinates"]
    x, y = (lo + 180) / 360 * W, (90 - la) / 180 * H
    s = 0.6 + math.log10(pop) * 0.55 - 2.2
    s = max(0.8, s * 1.6)
    sx = s / max(math.cos(math.radians(la)), 0.25)
    x0, x1, y0, y1 = int(x - 4 * sx), int(x + 4 * sx) + 1, int(y - 4 * s), int(y + 4 * s) + 1
    yy, xx = np.mgrid[y0:y1, x0:x1]
    g = np.exp(-(((xx - x) / sx) ** 2 + ((yy - y) / s) ** 2) / 2) * (math.log10(pop) - 3.6)
    lights[np.clip(yy, 0, H - 1), xx % W] += g
# sprawl texture: lights break into specks
speck = blur_wrap(rng.random((H, W)).astype(np.float32), 1)
lights = lights * (0.55 + 0.9 * speck) * land
lights = blur_wrap(lights, 1) * 0.5 + lights * 0.5
lights = np.clip(lights / 1.6, 0, 1) ** 0.8
Image.fromarray((lights * 255).astype(np.uint8)).save(os.path.join(PUB, "earth_lights.jpg"), quality=92)

# clouds: wrapped fbm, more at the ITCZ and mid-latitude storm tracks
acc = np.zeros((H, W), np.float32)
amp = 1.0
for o in range(7):
    g = max(2, 256 >> o)
    n = rng.standard_normal((H // g + 3, W // g)).astype(np.float32)
    n = np.pad(n, ((0, 0), (1, 2)), mode="wrap")
    up = np.asarray(Image.fromarray(n).resize((n.shape[1] * g, n.shape[0] * g), Image.BICUBIC))
    acc += up[g:g + H, g:g + W] * amp
    amp *= 0.55
acc = (acc - acc.mean()) / acc.std()
band = np.interp(alat, [0, 6, 15, 25, 40, 55, 70, 90], [0.6, 0.5, -0.2, -0.7, 0.35, 0.6, 0.3, 0.0])
cl = np.clip((acc + band - 0.35) * 0.9, 0, 1) ** 1.2
Image.fromarray((cl * 255).astype(np.uint8)).save(os.path.join(PUB, "earth_clouds.jpg"), quality=88)
print("baked", W, H)
