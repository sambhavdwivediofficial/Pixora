"""
Core image conversion service for Pixora.
All processing is done entirely in memory — no disk writes.
"""
import io
from typing import Optional, Dict, Any, Tuple

from PIL import Image
from utils.formats import normalize_format, get_mime
from utils.dimensions import compute_dimensions
from utils.helpers import open_image_from_bytes, ensure_rgb


async def convert_image(
    data: bytes,
    source_fmt: str,
    target_fmt: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    preserve_aspect: bool = True,
    quality: int = 90,
    preserve_metadata: bool = True,
) -> Tuple[bytes, str, int, int]:
    """
    Convert image bytes from source_fmt to target_fmt.
    Returns (converted_bytes, mime_type, out_width, out_height).
    """
    src = normalize_format(source_fmt)
    tgt = normalize_format(target_fmt)

    # --- Open source image ---
    img = open_image_from_bytes(data, src)

    # --- Resize ---
    orig_w, orig_h = img.size
    out_w, out_h = compute_dimensions(orig_w, orig_h, width, height, preserve_aspect)
    if (out_w, out_h) != (orig_w, orig_h):
        img = img.resize((out_w, out_h), Image.LANCZOS)

    # --- Handle SVG output (rasterized PNG piped through cairosvg — simplified) ---
    if tgt == "svg":
        # We produce a lossless PNG when SVG is target (SVG generation from raster is complex)
        img = ensure_rgb(img, "png")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        mime = get_mime("png")
        return buf.getvalue(), mime, out_w, out_h

    # --- Handle HEIC output ---
    if tgt in ("heic", "heif"):
        try:
            import pillow_heif
            pillow_heif.register_heif_opener()
            img = img.convert("RGB") if img.mode not in ("RGB", "RGBA") else img
            buf = io.BytesIO()
            heif_file = pillow_heif.from_pillow(img)
            heif_file.save(buf, format="HEIF", quality=quality)
            mime = get_mime("heic")
            return buf.getvalue(), mime, out_w, out_h
        except Exception as e:
            raise RuntimeError(f"HEIC conversion failed: {e}")

    # --- Pillow-based conversion ---
    img = ensure_rgb(img, tgt)
    buf = io.BytesIO()
    save_kwargs: Dict[str, Any] = {}

    if tgt in ("jpg", "jpeg"):
        save_kwargs["format"] = "JPEG"
        save_kwargs["quality"] = quality
        save_kwargs["optimize"] = True
        if preserve_metadata:
            try:
                orig = Image.open(io.BytesIO(data))
                if "exif" in orig.info:
                    save_kwargs["exif"] = orig.info["exif"]
            except Exception:
                pass
    elif tgt == "png":
        save_kwargs["format"] = "PNG"
        save_kwargs["optimize"] = True
    elif tgt == "webp":
        save_kwargs["format"] = "WEBP"
        save_kwargs["quality"] = quality
        save_kwargs["method"] = 6
    elif tgt == "avif":
        save_kwargs["format"] = "AVIF"
        save_kwargs["quality"] = quality
    elif tgt == "bmp":
        save_kwargs["format"] = "BMP"
    elif tgt in ("tiff", "tif"):
        save_kwargs["format"] = "TIFF"
        save_kwargs["compression"] = "tiff_lzw"
    else:
        save_kwargs["format"] = tgt.upper()

    img.save(buf, **save_kwargs)
    mime = get_mime(tgt)
    return buf.getvalue(), mime, out_w, out_h