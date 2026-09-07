"""Key checkerboard out of the attached washi tape and save a transparent PNG."""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path(
    r"C:\Users\oadje\.cursor\projects\c-src-bimyns\assets"
    r"\c__Users_oadje_AppData_Roaming_Cursor_User_workspaceStorage"
    r"_bdd81bb2a93fad04548865227cc8bc62_images_image.png_202609041441-8ebb223f-a7cd-4f52-98dd-bedf8bda0259.jpg"
)
OUT = Path(r"C:\src\bimyns\public\assets\about-washi-tape.png")

arr = np.asarray(Image.open(SRC).convert("RGB"))
h, w = arr.shape[:2]
mx = arr.max(axis=2).astype(np.int16)
mn = arr.min(axis=2).astype(np.int16)
chroma = mx - mn
# checkerboard is near-neutral gray; tape is warm (chroma ~40)
is_gray = chroma < 22

bg = np.zeros((h, w), dtype=bool)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if is_gray[y, x]:
            bg[y, x] = True
            q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if is_gray[y, x] and not bg[y, x]:
            bg[y, x] = True
            q.append((x, y))
while q:
    x, y = q.popleft()
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < w and 0 <= ny < h and not bg[ny, nx] and is_gray[ny, nx]:
            bg[ny, nx] = True
            q.append((nx, ny))

alpha = np.where(bg, 0, 255).astype(np.uint8)
rgba = np.dstack([arr, alpha])
im = Image.fromarray(rgba, "RGBA")
bbox = im.getbbox()
if not bbox:
    raise SystemExit("no tape pixels")
pad = 4
x0, y0, x1, y1 = bbox
im = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))
im.save(OUT)
print("saved", OUT, im.size, "opaque", int((np.array(im)[..., 3] > 0).mean() * 100), "%")
