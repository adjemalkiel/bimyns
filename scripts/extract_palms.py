from PIL import Image, ImageDraw, ImageFilter

src = r'C:\Users\oadje\.cursor\projects\c-src-bimyns\assets\c__Users_oadje_AppData_Roaming_Cursor_User_workspaceStorage_bdd81bb2a93fad04548865227cc8bc62_images_5155520-991a3af2-6459-4fad-952b-43e1c81ca827.jpg'
out = r'C:\src\bimyns\public\assets\palm-watermark.png'
preview_path = r'C:\src\bimyns\public\assets\_palm-preview.jpg'

img = Image.open(src).convert('RGBA')
w, h = img.size
crop_w = int(w * 0.55)
panel = img.crop((0, 0, crop_w, h))
cw, ch = panel.size

bg = (5, 49, 60)
pixels = panel.load()
result = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
rp = result.load()

for y in range(ch):
    max_x = int(cw * (1.0 - 0.22 * (y / max(ch - 1, 1))))
    for x in range(min(max_x, cw)):
        r, g, b, a = pixels[x, y]
        # skip lights / UI colors
        if r > 140 and g > 140 and b > 140:
            continue
        if r > 170 and g > 90 and b < 130:
            continue
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        bg_lum = 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]
        # only clearly darker palm ink
        if lum <= bg_lum - 8:
            strength = min(210, int((bg_lum - lum) * 16))
            strength = max(50, strength)
            rp[x, y] = (0, 0, 0, strength)

# Erase UI / text rectangles (coords relative to left crop, template 1024x682 → crop ~563)
# Scale factors if needed — crop is 0.55*1024 ≈ 563
sx = cw / (0.55 * 1024)
sy = ch / 682

def rect(x0, y0, x1, y1):
    return (
        int(x0 * sx), int(y0 * sy),
        int(x1 * sx), int(y1 * sy),
    )

mask = Image.new('L', (cw, ch), 255)
draw = ImageDraw.Draw(mask)
# nav links
draw.rectangle(rect(10, 10, 480, 70), fill=0)
# HOTEL title
draw.rectangle(rect(20, 160, 420, 290), fill=0)
# LANDING PAGE + body
draw.rectangle(rect(20, 290, 430, 430), fill=0)
# READ MORE button
draw.rectangle(rect(20, 430, 260, 510), fill=0)
# price badge area on diagonal
draw.rectangle(rect(400, 60, 560, 240), fill=0)
# bottom amenity bar
draw.rectangle(rect(0, 560, 560, 682), fill=0)
# soft feather erase edges of masks
mask = mask.filter(ImageFilter.GaussianBlur(radius=6))

# apply mask to alpha
from PIL import ImageChops
new_alpha = ImageChops.multiply(result.split()[3], mask)
result.putalpha(new_alpha)

# light blur for natural edges
result = result.filter(ImageFilter.GaussianBlur(radius=0.6))
result.save(out, 'PNG')
print('saved', out, result.size, 'bbox', result.getbbox())

preview = Image.new('RGBA', result.size, (*bg, 255))
preview = Image.alpha_composite(preview, result)
preview.convert('RGB').save(preview_path, quality=92)
print('preview ok')
