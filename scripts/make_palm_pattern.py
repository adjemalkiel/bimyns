from PIL import Image
import os

src = r"C:\Users\oadje\.cursor\projects\c-src-bimyns\assets\c__Users_oadje_AppData_Roaming_Cursor_User_workspaceStorage_bdd81bb2a93fad04548865227cc8bc62_images_extrait_les_motifs_de_feuilles_202609040140-afefa7fc-cdc1-4114-be86-b5599558b91b.jpg"
out = r"C:\src\bimyns\public\assets\palm-pattern.png"

im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.load()
out_im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
op = out_im.load()

# Source tile: bg ~ (16,46,30) lum~35, leaves darker ~26
for y in range(h):
    for x in range(w):
        r, g, b, _ = px[x, y]
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        if lum >= 32:
            continue
        strength = min(190, int((32 - lum) * 22))
        op[x, y] = (1, 20, 26, max(55, strength))

out_im.save(out, "PNG")
print("saved", out, out_im.size, "bbox", out_im.getbbox())
