#!/usr/bin/env python3
"""Rebuild club-aquatique.png 3-panel collage. Run: python scripts/rebuild_club_aquatique.py"""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT_W, OUT_H = 1200, 960
GUTTER = 6
LEFT_W = 624
RIGHT_W = OUT_W - GUTTER - LEFT_W  # 570
TOP_H = 460
BOT_H = OUT_H - GUTTER - TOP_H  # 494

LEFT_SRC = ROOT / "images" / "la-piscine-au-3-bassins.jpg"
KIDS_SRC = Path(
    r"C:\Users\oadje\.cursor\projects\c-src-bimyns\assets\club-aquatique-kids-pool.png"
)
KAYAK_SRC = Path(
    r"C:\Users\oadje\.cursor\projects\c-src-bimyns\assets\club-aquatique-kayak.png"
)
OUTPUT = ROOT / "public" / "assets" / "club-aquatique.png"


def fit_cover(im: Image.Image, tw: int, th: int) -> Image.Image:
    """Center-crop to aspect then resize."""
    sw, sh = im.size
    target_ratio = tw / th
    src_ratio = sw / sh
    if src_ratio > target_ratio:
        nh = sh
        nw = int(sh * target_ratio)
    else:
        nw = sw
        nh = int(sw / target_ratio)
    x0 = (sw - nw) // 2
    y0 = (sh - nh) // 2
    cropped = im.crop((x0, y0, x0 + nw, y0 + nh))
    out = cropped.resize((tw, th), Image.Resampling.LANCZOS)
    return out.filter(ImageFilter.UnsharpMask(radius=1.2, percent=90, threshold=2))


def main() -> None:
    left = fit_cover(Image.open(LEFT_SRC).convert("RGB"), LEFT_W, OUT_H)
    kids_pool = fit_cover(Image.open(KIDS_SRC).convert("RGB"), RIGHT_W, TOP_H)
    kayak = fit_cover(Image.open(KAYAK_SRC).convert("RGB"), RIGHT_W, BOT_H)

    canvas = Image.new("RGB", (OUT_W, OUT_H), (255, 255, 255))
    canvas.paste(left, (0, 0))
    canvas.paste(kids_pool, (LEFT_W + GUTTER, 0))
    canvas.paste(kayak, (LEFT_W + GUTTER, TOP_H + GUTTER))
    canvas.save(OUTPUT, optimize=True)

    print(f"Saved {OUTPUT} @ {canvas.size}")
    print(f"Sources: left={LEFT_SRC.name} ({Image.open(LEFT_SRC).size})")
    print(f"  top-right={KIDS_SRC.name} ({Image.open(KIDS_SRC).size}) [generated]")
    print(f"  bottom-right={KAYAK_SRC.name} ({Image.open(KAYAK_SRC).size}) [generated]")


if __name__ == "__main__":
    main()
