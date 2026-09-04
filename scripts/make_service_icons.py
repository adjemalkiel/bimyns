from PIL import Image, ImageDraw, ImageFilter
import os

out_dir = r"C:\src\bimyns\public\assets\icons"
os.makedirs(out_dir, exist_ok=True)

TEAL = (5, 49, 60, 255)
strip = r"C:\Users\oadje\.cursor\projects\c-src-bimyns\assets\c__Users_oadje_AppData_Roaming_Cursor_User_workspaceStorage_bdd81bb2a93fad04548865227cc8bc62_images_image-d57f6f48-3d76-4adf-809a-db5ef7b50830.png"


def isolate_dark(im, pad=18):
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r + g + b < 420:
                op[x, y] = TEAL
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    side = max(out.size) + pad
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.size[0]) // 2, (side - out.size[1]) // 2), out)
    return canvas.resize((128, 128), Image.Resampling.LANCZOS)


src = Image.open(strip)
w, h = src.size
cols = {
    "restaurant": 0,
    "roomservice": 1,
    "confort": 2,
}
col_w = w // 3
icon_h = int(h * 0.62)
for name, i in cols.items():
    x0 = i * col_w
    x1 = (i + 1) * col_w if i < 2 else w
    icon = isolate_dark(src.crop((x0, 0, x1, icon_h)))
    path = os.path.join(out_dir, f"{name}.png")
    icon.save(path)
    print("saved", path)


def stroke_icon(draw_fn, name):
    size = 256
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    draw_fn(d)
    im = im.resize((128, 128), Image.Resampling.LANCZOS)
    path = os.path.join(out_dir, f"{name}.png")
    im.save(path)
    print("saved", path)


def draw_swimmer(d):
    c = TEAL
    d.ellipse((158, 22, 202, 66), outline=c, width=11)
    d.arc((28, 72, 210, 168), 200, 18, fill=c, width=11)
    d.line((86, 122, 36, 158), fill=c, width=11)
    d.line((156, 132, 222, 108), fill=c, width=11)
    d.arc((16, 178, 88, 226), 200, 340, fill=c, width=9)
    d.arc((86, 178, 158, 226), 200, 340, fill=c, width=9)
    d.arc((156, 178, 228, 226), 200, 340, fill=c, width=9)


def draw_tennis(d):
    c = TEAL
    d.ellipse((28, 28, 228, 228), outline=c, width=12)
    d.arc((-8, 40, 128, 216), 300, 60, fill=c, width=10)
    d.arc((128, 40, 264, 216), 120, 240, fill=c, width=10)


stroke_icon(draw_swimmer, "piscine")
stroke_icon(draw_tennis, "tennis")

for leftover in ("_src_breakfast.png", "_src_phone.png", "_src_bed.png"):
    p = os.path.join(out_dir, leftover)
    if os.path.exists(p):
        os.remove(p)
        print("removed", leftover)
