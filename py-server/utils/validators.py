"""
Validation utilities for Pixora.
"""
import io
from typing import Tuple
from utils.formats import SUPPORTED_INPUT_FORMATS, normalize_format


def is_supported_format(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1] if "." in filename else ""
    return normalize_format(ext) in SUPPORTED_INPUT_FORMATS


def validate_file_size(data: bytes, max_mb: int = 50) -> Tuple[bool, str]:
    size_mb = len(data) / (1024 * 1024)
    if size_mb > max_mb:
        return False, f"File too large: {size_mb:.1f} MB (max {max_mb} MB)"
    return True, "ok"


def is_readable_image(data: bytes, fmt: str) -> Tuple[bool, str, int, int]:
    """
    Try to open with Pillow. Returns (ok, message, width, height).
    Handles HEIC via pillow-heif and SVG via cairosvg.
    """
    fmt = normalize_format(fmt)

    if fmt == "svg":
        try:
            import cairosvg
            png_bytes = cairosvg.svg2png(bytestring=data)
            from PIL import Image
            img = Image.open(io.BytesIO(png_bytes))
            return True, "ok", img.width, img.height
        except Exception as e:
            return False, f"SVG parse error: {e}", 0, 0

    if fmt in ("heic", "heif"):
        try:
            import pillow_heif
            pillow_heif.register_heif_opener()
        except ImportError:
            return False, "HEIC support not available", 0, 0

    try:
        from PIL import Image, UnidentifiedImageError
        img = Image.open(io.BytesIO(data))
        img.verify()
        # Re-open after verify (verify closes the file)
        img = Image.open(io.BytesIO(data))
        return True, "ok", img.width, img.height
    except Exception as e:
        return False, f"Image unreadable: {e}", 0, 0