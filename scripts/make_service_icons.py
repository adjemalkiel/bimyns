from PIL import Image
import os

out_dir = r"C:\src\bimyns\public\assets\icons"
os.makedirs(out_dir, exist_ok=True)

TEAL = (5, 49, 60, 255)
src_dir = r"C:\Users\oadje\.cursor\projects\c-src-bimyns\assets"
files = {
    "restaurant": "icon-restaurant.png",
    "confort": "icon-confort.png",
    "piscine": "icon-piscine.png",
    "tennis": "icon-tennis.png",
}


def isolate_dark(im, pad=48):
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r + g + b < 500:
                op[x, y] = TEAL
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    side = int(max(out.size) * 1.28) + pad
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.size[0]) // 2, (side - out.size[1]) // 2), out)
    return canvas.resize((160, 160), Image.Resampling.LANCZOS)


for name, fname in files.items():
    pad = 72 if name == "piscine" else 48
    icon = isolate_dark(Image.open(os.path.join(src_dir, fname)), pad=pad)
    path = os.path.join(out_dir, f"{name}.png")
    icon.save(path)
    print("saved", path, icon.size)
