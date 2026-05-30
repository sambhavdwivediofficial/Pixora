"""
Core validation service for Pixora.
"""
import io
from typing import Dict, Any

from utils.formats import normalize_format, SUPPORTED_INPUT_FORMATS
from utils.validators import validate_file_size, is_readable_image


async def validate_image(data: bytes, filename: str) -> Dict[str, Any]:
    """
    Full validation pipeline.
    Returns a dict: { valid, format, width, height, size_bytes, message }
    """
    # 1. File exists / non-empty
    if not data or len(data) == 0:
        return {"valid": False, "message": "File is empty"}

    # 2. Format check
    ext = filename.rsplit(".", 1)[-1] if "." in filename else ""
    fmt = normalize_format(ext)

    if fmt not in SUPPORTED_INPUT_FORMATS:
        return {"valid": False, "message": f"Unsupported format: {fmt or 'unknown'}"}

    # 3. Size check
    size_ok, size_msg = validate_file_size(data, max_mb=50)
    if not size_ok:
        return {"valid": False, "message": size_msg}

    # 4. Readable / not corrupted
    readable, msg, width, height = is_readable_image(data, fmt)
    if not readable:
        return {"valid": False, "message": msg}

    # 5. Dimensions
    if width == 0 or height == 0:
        return {"valid": False, "message": "Could not read image dimensions"}

    return {
        "valid": True,
        "format": fmt.upper(),
        "width": width,
        "height": height,
        "size_bytes": len(data),
        "message": "ok",
    }