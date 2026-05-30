"""
Misc helpers for Pixora.
"""
import io
from PIL import Image


def open_image_from_bytes(data: bytes, fmt: str) -> Image.Image:
    """Open an image from raw bytes, handling HEIC/SVG specially."""
    fmt = fmt.lower().lstrip(".")

    if fmt in ("heic", "heif"):
        import pillow_heif
        pillow_heif.register_heif_opener()

    if fmt == "svg":
        import cairosvg
        png_bytes = cairosvg.svg2png(bytestring=data)
        return Image.open(io.BytesIO(png_bytes)).convert("RGBA")

    img = Image.open(io.BytesIO(data))
    return img


def ensure_rgb(img: Image.Image, target_fmt: str) -> Image.Image:
    """Convert image mode appropriately for the target format."""
    target_fmt = target_fmt.lower()
    if target_fmt in ("jpg", "jpeg", "bmp"):
        if img.mode in ("RGBA", "LA", "P"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            if img.mode in ("RGBA", "LA"):
                bg.paste(img, mask=img.split()[-1])
            else:
                bg.paste(img)
            return bg
        return img.convert("RGB")
    return img