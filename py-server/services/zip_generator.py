"""
ZIP generation service for ICO package.
All in-memory — no disk writes.
"""
import io
import zipfile
from typing import Dict


def build_ico_zip(ico_bytes: bytes, png_files: Dict[str, bytes]) -> bytes:
    """
    Build a ZIP archive containing:
      - favicon.ico (multi-size)
      - icon_16x16.png
      - icon_32x32.png
      - icon_48x48.png
      - icon_64x64.png
      - icon_128x128.png
      - icon_256x256.png
    Returns raw ZIP bytes.
    """
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("favicon.ico", ico_bytes)
        for name, png_data in png_files.items():
            zf.writestr(name, png_data)
    return buf.getvalue()