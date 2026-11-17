"""Draw fictional stills and leave paths the demo already references."""

from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "photos"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1280, 960


def grain(image: Image.Image, amount: int = 18) -> Image.Image:
    rnd = random.Random(image.size[0] + amount)
    pixels = image.load()
    for _ in range(9000):
        x = rnd.randrange(W)
        y = rnd.randrange(H)
        r, g, b = pixels[x, y]
        delta = rnd.randint(-amount, amount)
        pixels[x, y] = (
            max(0, min(255, r + delta)),
            max(0, min(255, g + delta)),
            max(0, min(255, b + delta)),
        )
    return image


def save(name: str, image: Image.Image) -> None:
    grain(image).filter(ImageFilter.SMOOTH_MORE).save(OUT / name, quality=78, optimize=True)


def lantern() -> None:
    image = Image.new("RGB", (W, H), (28, 42, 58))
    draw = ImageDraw.Draw(image, "RGBA")
    for y in range(H):
        shade = int(28 + 40 * (y / H))
        draw.line([(0, y), (W, y)], fill=(shade, 36 + y // 40, 48))
    draw.rectangle([0, 700, W, H], fill=(42, 36, 32, 255))
    for index, x in enumerate(range(140, 1160, 140)):
        draw.rectangle([x, 760, x + 90, 900], fill=(92, 62, 42, 255))
        draw.polygon([(x - 10, 760), (x + 45, 720), (x + 100, 760)], fill=(120, 78, 48, 255))
        glow = (232, 164, 72, 180 - index * 8)
        draw.ellipse([x + 10, 180 + (index % 3) * 30, x + 70, 250 + (index % 3) * 30], fill=glow)
        draw.line([(x + 40, 250), (x + 40, 760)], fill=(214, 176, 110, 160), width=2)
    save("lantern.jpg", image)


def glasshouse() -> None:
    image = Image.new("RGB", (W, H), (186, 206, 196))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.polygon([(180, 860), (640, 180), (1100, 860)], fill=(214, 228, 220, 255))
    draw.polygon([(300, 860), (640, 300), (980, 860)], fill=(232, 168, 96, 90))
    for x in range(220, 1080, 70):
        draw.line([(x, 860), (640, 190)], fill=(70, 96, 88, 180), width=3)
    for y in range(320, 860, 70):
        draw.line([(200, y), (1080, y)], fill=(70, 96, 88, 140), width=3)
    draw.rectangle([0, 820, W, H], fill=(54, 72, 64, 255))
    save("glasshouse.jpg", image)


def civic() -> None:
    image = Image.new("RGB", (W, H), (92, 48, 40))
    draw = ImageDraw.Draw(image)
    for y in range(0, H, 28):
        draw.rectangle([0, y, W, y + 14], fill=(120, 64, 52))
    draw.rectangle([180, 160, 1100, 820], fill=(64, 42, 36))
    for row in range(8):
        for col in range(10):
            draw.ellipse(
                [240 + col * 84, 240 + row * 64, 300 + col * 84, 286 + row * 64],
                fill=(150, 96, 64),
            )
    draw.rectangle([560, 140, 720, 230], fill=(214, 176, 120))
    save("civic.jpg", image)


def supper() -> None:
    image = Image.new("RGB", (W, H), (48, 36, 28))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse([80, 360, 1200, 860], fill=(92, 58, 36, 255))
    for x in range(220, 1100, 140):
        draw.ellipse([x, 470, x + 90, 530], fill=(236, 228, 214, 255))
        draw.ellipse([x + 28, 430, x + 48, 470], fill=(255, 196, 110, 220))
    draw.rectangle([0, 780, W, H], fill=(36, 28, 24, 255))
    save("supper.jpg", image)


def rooftop() -> None:
    image = Image.new("RGB", (W, H), (16, 24, 48))
    draw = ImageDraw.Draw(image, "RGBA")
    for index in range(40):
        x = 40 + (index * 97) % W
        y = 30 + (index * 53) % 420
        draw.ellipse([x, y, x + 3, y + 3], fill=(240, 236, 220, 220))
    for index, height in enumerate([180, 260, 140, 320, 220, 280, 160, 240]):
        x = 80 + index * 150
        draw.rectangle([x, 700 - height, x + 90, 760], fill=(28, 36, 58, 255))
        for window_y in range(720 - height, 740, 28):
            draw.rectangle([x + 18, window_y, x + 34, window_y + 12], fill=(232, 186, 96, 255))
    draw.polygon([(180, 620), (460, 620), (420, 180)], fill=(255, 214, 140, 70))
    draw.rectangle([0, 740, W, H], fill=(24, 26, 32, 255))
    save("rooftop.jpg", image)


def sketch() -> None:
    image = Image.new("RGB", (W, H), (168, 196, 204))
    draw = ImageDraw.Draw(image)
    draw.rectangle([0, 0, W, 520], fill=(186, 210, 214))
    draw.rectangle([0, 520, W, 700], fill=(72, 110, 124))
    draw.polygon([(0, 700), (1280, 640), (1280, 960), (0, 960)], fill=(88, 96, 78))
    draw.rectangle([180, 640, 460, 700], fill=(120, 92, 64))
    draw.rectangle([210, 600, 420, 650], fill=(236, 228, 210))
    draw.line([(230, 615), (400, 628)], fill=(40, 44, 48), width=2)
    draw.line([(240, 630), (360, 638)], fill=(40, 44, 48), width=2)
    save("sketch.jpg", image)


def quartet() -> None:
    image = Image.new("RGB", (W, H), (32, 24, 28))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse([280, 80, 1000, 820], fill=(255, 196, 120, 40))
    draw.rectangle([160, 620, 1120, 860], fill=(72, 48, 36, 255))
    for x in (300, 480, 700, 900):
        draw.rectangle([x, 520, x + 70, 700], fill=(120, 78, 52, 255))
        draw.ellipse([x + 8, 470, x + 62, 540], fill=(214, 186, 150, 255))
        draw.line([(x + 36, 430), (x + 36, 500)], fill=(40, 28, 24, 255), width=4)
    save("quartet.jpg", image)


def orchard() -> None:
    image = Image.new("RGB", (W, H), (18, 28, 36))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle([160, 120, 1120, 860], fill=(236, 224, 196, 255))
    draw.rectangle([200, 170, 1080, 760], fill=(24, 36, 32, 255))
    for index, x in enumerate(range(260, 1000, 120)):
        color = (196, 64, 48, 255) if index % 2 == 0 else (214, 168, 48, 255)
        draw.ellipse([x, 360, x + 80, 440], fill=color)
        draw.ellipse([x + 20, 470, x + 90, 550], fill=(72, 120, 64, 255))
    for x in range(240, 1040, 70):
        draw.ellipse([x, 210, x + 12, 222], fill=(255, 214, 140, 230))
        if x < 1000:
            draw.line([(x + 6, 216), (x + 76, 216)], fill=(255, 214, 140, 180), width=2)
    save("orchard.jpg", image)


if __name__ == "__main__":
    lantern()
    glasshouse()
    civic()
    supper()
    rooftop()
    sketch()
    quartet()
    orchard()
    print(f"wrote stills to {OUT}")
