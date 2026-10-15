"""World DEM (land + bathymetry) from Terrarium z4 tiles, reprojected to equirectangular 4096x2048."""
import io, os, math, sys, urllib.request, concurrent.futures as cf
import numpy as np
from PIL import Image

OUT = sys.argv[1]
Z = 4
n = 2 ** Z
cache = os.path.join(OUT, "tiles"); os.makedirs(cache, exist_ok=True)

def get(x, y):
    p = f"{cache}/{Z}_{x}_{y}.png"
    if not os.path.exists(p):
        open(p, "wb").write(urllib.request.urlopen(f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png", timeout=30).read())
    a = np.asarray(Image.open(p).convert("RGB"), np.float32)
    return x, y, a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768

merc = np.zeros((n * 256, n * 256), np.float32)
with cf.ThreadPoolExecutor(16) as ex:
    for x, y, a in ex.map(lambda j: get(*j), [(x, y) for x in range(n) for y in range(n)]):
        merc[y * 256:(y + 1) * 256, x * 256:(x + 1) * 256] = a

W, H = 4096, 2048
lon = (np.arange(W) + 0.5) / W * 360 - 180
lat = 90 - (np.arange(H) + 0.5) / H * 180
latc = np.clip(lat, -85.05, 85.05)
my = (1 - np.log(np.tan(np.radians(latc)) + 1 / np.cos(np.radians(latc))) / math.pi) / 2 * merc.shape[0]
mx = (lon + 180) / 360 * merc.shape[1]
eq = merc[np.clip(my.astype(int), 0, merc.shape[0] - 1)[:, None], np.clip(mx.astype(int), 0, merc.shape[1] - 1)[None, :]]
np.save(os.path.join(OUT, "world_dem.npy"), eq)
print(eq.shape, eq.min(), eq.max())
