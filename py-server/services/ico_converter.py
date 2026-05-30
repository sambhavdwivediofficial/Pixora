"""
ICO conversion service — produces multi-size ICO from any supported input.
All operations are in-memory.
"""
import io
from PIL import Image
from utils.formats import ICO_SIZES, normalize_format
from utils.helpers import open_image_from_bytes


def build_ico_bytes(data: bytes, source_fmt: str) -> bytes:
    """
    Convert image to ICO format with all standard sizes embedded.
    Returns raw ICO bytes.
    """
    src = normalize_format(source_fmt)
    img = open_image_from_bytes(data, src)

    # Convert to RGBA for proper transparency support
    img = img.convert("RGBA")

    # Build list of resized images for each ICO size
    imgs = []
    for size in ICO_SIZES:
        resized = img.resize((size, size), Image.LANCZOS)
        imgs.append(resized)

    # Save as ICO with all sizes
    buf = io.BytesIO()
    imgs[0].save(
        buf,
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
        append_images=imgs[1:],
    )
    return buf.getvalue()


def build_individual_pngs(data: bytes, source_fmt: str) -> dict:
    """
    Build individual PNG files for each ICO size.
    Returns dict: { "16x16.png": bytes, ... }
    """
    src = normalize_format(source_fmt)
    img = open_image_from_bytes(data, src)
    img = img.convert("RGBA")

    result = {}
    for size in ICO_SIZES:
        resized = img.resize((size, size), Image.LANCZOS)
        buf = io.BytesIO()
        resized.save(buf, format="PNG")
        result[f"icon_{size}x{size}.png"] = buf.getvalue()

    return result