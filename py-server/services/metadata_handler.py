"""
Metadata extraction and stripping for Pixora.
"""
import io
from typing import Dict, Any, Optional
from PIL import Image


def extract_metadata(data: bytes, fmt: str) -> Dict[str, Any]:
    """Extract available metadata from image bytes."""
    meta: Dict[str, Any] = {}
    try:
        img = Image.open(io.BytesIO(data))
        info = img.info or {}

        # EXIF
        if "exif" in info:
            try:
                import piexif
                exif_data = piexif.load(info["exif"])
                meta["exif"] = {
                    ifd: {
                        piexif.TAGS[ifd].get(tag, {}).get("name", str(tag)): val
                        for tag, val in tags.items()
                        if isinstance(val, (str, int, float, bytes))
                    }
                    for ifd, tags in exif_data.items()
                    if isinstance(tags, dict)
                }
            except Exception:
                meta["exif"] = "present (unreadable)"

        # DPI
        if "dpi" in info:
            meta["dpi"] = info["dpi"]

        # ICC profile presence
        if "icc_profile" in info:
            meta["icc_profile"] = "present"

        meta["mode"] = img.mode
        meta["size"] = {"width": img.width, "height": img.height}

    except Exception as e:
        meta["error"] = str(e)

    return meta


def strip_metadata(data: bytes, fmt: str) -> bytes:
    """Return image bytes with metadata stripped."""
    fmt = fmt.lower()
    try:
        img = Image.open(io.BytesIO(data))

        # Flatten palette
        if img.mode == "P":
            img = img.convert("RGBA")

        buf = io.BytesIO()
        save_kwargs: Dict[str, Any] = {}

        if fmt in ("jpg", "jpeg"):
            if img.mode in ("RGBA", "LA"):
                bg = Image.new("RGB", img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[-1])
                img = bg
            elif img.mode != "RGB":
                img = img.convert("RGB")
            img.save(buf, format="JPEG", quality=95)
        elif fmt == "png":
            img.save(buf, format="PNG", optimize=True)
        elif fmt == "webp":
            img.save(buf, format="WEBP")
        else:
            img.save(buf, format=fmt.upper())

        return buf.getvalue()
    except Exception:
        return data