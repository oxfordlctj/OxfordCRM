"""Download Terrarium (SRTM-based) elevation tiles and stitch them into a float32 .npy grid in Web Mercator."""
import math, sys, io, os, concurrent.futures as cf, urllib.request
import numpy as np
from PIL import Image

def tile_xy(lon, lat, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y

def fetch(z, x, y, cache):
    p = f"{cache}/{z}_{x}_{y}.png"
    if not os.path.exists(p):
        url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
        for _ in range(4):
            try:
                data = urllib.request.urlopen(url, timeout=30).read(); break
            except Exception as e:
                err = e
        else:
            raise err
        open(p, "wb").write(data)
    a = np.asarray(Image.open(p).convert("RGB"), dtype=np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768

def build(name, lon0, lat0, lon1, lat1, z, out):
    cache = os.path.join(out, "tiles"); os.makedirs(cache, exist_ok=True)
    fx0, fy0 = tile_xy(lon0, lat1, z)   # top-left
    fx1, fy1 = tile_xy(lon1, lat0, z)   # bottom-right
    tx0, ty0, tx1, ty1 = int(fx0), int(fy0), int(fx1), int(fy1)
    W, H = (tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256
    grid = np.zeros((H, W), np.float32)
    jobs = [(x, y) for x in range(tx0, tx1 + 1) for y in range(ty0, ty1 + 1)]
    with cf.ThreadPoolExecutor(16) as ex:
        for (x, y), a in zip(jobs, ex.map(lambda j: fetch(z, j[0], j[1], cache), jobs)):
            grid[(y - ty0) * 256:(y - ty0 + 1) * 256, (x - tx0) * 256:(x - tx0 + 1) * 256] = a
    # crop to exact bbox
    px0, py0 = int((fx0 - tx0) * 256), int((fy0 - ty0) * 256)
    px1, py1 = int((fx1 - tx0) * 256), int((fy1 - ty0) * 256)
    grid = grid[py0:py1, px0:px1]
    np.save(os.path.join(out, f"dem_{name}.npy"), grid)
    print(name, grid.shape, float(grid.min()), float(grid.max()))

if __name__ == "__main__":
    out = sys.argv[1]
    build("country", 65.8, 35.9, 76.2, 41.7, 9, out)
    build("city", 68.62, 38.46, 68.95, 38.67, 13, out)
