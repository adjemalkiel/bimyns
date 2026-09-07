"""Extract the template photo silhouette into an alpha mask + white stroke."""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageFilter

SRC = Path(
    r"C:\Users\oadje\.cursor\projects\c-src-bimyns\assets"
    r"\c__Users_oadje_AppData_Roaming_Cursor_User_workspaceStorage"
    r"_bdd81bb2a93fad04548865227cc8bc62_images_image-8ddee8f5-2db2-44ea-9a2b-7bbd8c514ec4.png"
)
OUT_DIR = Path(r"C:\src\bimyns\public\assets")

im = Image.open(SRC).convert("RGB")
arr = np.asarray(im).astype(np.int16)
h, w = arr.shape[:2]

refs = np.array([arr[0, 0], arr[0, -1], arr[-1, 0], arr[-1, -1]], dtype=np.int16)
ref = refs.mean(axis=0)
dist = np.abs(arr - ref).sum(axis=2)
white = (arr[:, :, 0] > 190) & (arr[:, :, 1] > 190) & (arr[:, :, 2] > 190)

THRESH = 70
outside = np.zeros((h, w), dtype=bool)
q = deque()
seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
for x in range(0, w, 8):
    seeds += [(x, 0), (x, h - 1)]
for y in range(0, h, 8):
    seeds += [(0, y), (w - 1, y)]
for x, y in seeds:
    if dist[y, x] < THRESH and not white[y, x]:
        outside[y, x] = True
        q.append((x, y))
while q:
    x, y = q.popleft()
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < w and 0 <= ny < h and not outside[ny, nx]:
            if white[ny, nx] or dist[ny, nx] >= THRESH:
                continue
            outside[ny, nx] = True
            q.append((nx, ny))

inside = ~outside
ys, xs = np.where(inside)
pad = 6
x0, x1 = max(0, int(xs.min()) - pad), min(w, int(xs.max()) + pad + 1)
y0, y1 = max(0, int(ys.min()) - pad), min(h, int(ys.max()) + pad + 1)

mask_l = Image.fromarray((inside[y0:y1, x0:x1] * 255).astype(np.uint8), "L")
mask_l = mask_l.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
mask_l = mask_l.point(lambda v: 255 if v > 127 else 0)
# 2x nearest so the clip stays crisp when the card is larger than the mock
mask_l = mask_l.resize((mask_l.width * 2, mask_l.height * 2), Image.NEAREST)

rgba = Image.new("RGBA", mask_l.size, (255, 255, 255, 0))
rgba.putalpha(mask_l)

ring = ImageChops.difference(
    mask_l.filter(ImageFilter.MaxFilter(5)),
    mask_l.filter(ImageFilter.MinFilter(5)),
)
stroke = Image.new("RGBA", mask_l.size, (255, 255, 255, 0))
stroke.putalpha(ring.point(lambda v: 255 if v > 40 else 0))

mask_path = OUT_DIR / "about-cartouche-mask.png"
stroke_path = OUT_DIR / "about-cartouche-stroke.png"
rgba.save(mask_path)
stroke.save(stroke_path)
print("mask", mask_path, rgba.size, rgba.mode)
print("stroke", stroke_path)
print("aspect", rgba.size[0], "/", rgba.size[1])
