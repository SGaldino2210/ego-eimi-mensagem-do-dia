"""Gera ícones placeholder para o PWA Ego Eimi (bege + dourado + cruz fina)."""
from PIL import Image, ImageDraw
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT_DIR, exist_ok=True)

BG = (250, 244, 233, 255)      # off-white quente
GOLD = (176, 132, 62, 255)     # dourado acolhedor
DARK = (58, 42, 30, 255)       # marrom escuro

def make_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)

    pad = int(size * (0.16 if maskable else 0.08))
    circle_box = [pad, pad, size - pad, size - pad]
    draw.ellipse(circle_box, fill=GOLD)

    cx, cy = size / 2, size / 2
    arm = size * 0.17
    thick = max(2, int(size * 0.028))
    draw.line([(cx, cy - arm), (cx, cy + arm)], fill=DARK, width=thick)
    draw.line([(cx - arm * 0.62, cy - arm * 0.15), (cx + arm * 0.62, cy - arm * 0.15)], fill=DARK, width=thick)

    return img

for size in (192, 512):
    make_icon(size).save(os.path.join(OUT_DIR, f"icon-{size}.png"))

make_icon(512, maskable=True).save(os.path.join(OUT_DIR, "icon-512-maskable.png"))

print("Ícones gerados em", os.path.abspath(OUT_DIR))
