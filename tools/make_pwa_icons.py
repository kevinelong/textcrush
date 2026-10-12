"""Render the install icons for the web app (PWA / Add to Home Screen).

    python tools/make_pwa_icons.py

Same mark as the Android launcher icon - four letter tiles on the game's ground - so the phone icon
is recognisable whichever way the game was installed. Writes into source/web/icons/ so the files sit
next to the manifest that names them. Pillow only, no network.
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ICONS = os.path.join(ROOT, "source", "web", "icons")

BOARD = (34, 17, 0, 255)
TILES = [
    ((199, 79, 160, 255), "T"),
    ((57, 179, 106, 255), "E"),
    ((63, 169, 199, 255), "X"),
    ((224, 138, 60, 255), "T"),
]
LETTER = (255, 255, 255, 255)
LETTER_EDGE = (34, 17, 0, 255)

FONTS = [
    r"C:\Windows\Fonts\arialbd.ttf",
    r"C:\Windows\Fonts\segoeuib.ttf",
    r"C:\Windows\Fonts\arial.ttf",
]
SS = 8  # supersample factor


def pick_font() -> str:
    for path in FONTS:
        if os.path.exists(path):
            return path
    raise SystemExit("no truetype font found")


def render(size: int, span: float, font_path: str, background: bool) -> Image.Image:
    """Four letter tiles inside a centred square of `span` of the canvas."""
    canvas = Image.new("RGBA", (size, size), BOARD if background else (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    tile = span / 2
    radius = tile * 0.42
    letter_px = int(tile * 0.72)
    font = ImageFont.truetype(font_path, letter_px)
    origin = (size - span) / 2

    for index, (color, letter) in enumerate(TILES):
        col, row = index % 2, index // 2
        cx = origin + col * tile + tile / 2
        cy = origin + row * tile + tile / 2
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)

        box = draw.textbbox((0, 0), letter, font=font, stroke_width=max(1, letter_px // 12))
        draw.text(
            (cx - (box[0] + box[2]) / 2, cy - (box[1] + box[3]) / 2),
            letter,
            font=font,
            fill=LETTER,
            stroke_width=max(1, letter_px // 12),
            stroke_fill=LETTER_EDGE,
        )

    return canvas


def write(name: str, size: int, span: float, font_path: str, background: bool = True) -> None:
    os.makedirs(ICONS, exist_ok=True)
    image = render(size * SS, span * size * SS, font_path, background)
    image.resize((size, size), Image.LANCZOS).save(os.path.join(ICONS, name))
    print("wrote", os.path.relpath(os.path.join(ICONS, name), ROOT))


def main() -> None:
    font_path = pick_font()
    write("icon-192.png", 192, 0.84, font_path)
    write("icon-512.png", 512, 0.84, font_path)
    # A maskable icon is cropped to a circle by the launcher, so the mark has to sit inside one:
    # 0.56 of the canvas keeps it clear of every mask shape.
    write("icon-maskable-512.png", 512, 0.56, font_path)
    # iOS ignores the manifest icons and uses this one, unmasked, on the home screen.
    write("apple-touch-icon-180.png", 180, 0.84, font_path)


if __name__ == "__main__":
    main()
