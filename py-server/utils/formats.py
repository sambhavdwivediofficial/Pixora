"""
Format constants and mappings for Pixora.
"""

SUPPORTED_INPUT_FORMATS = {
    "png", "jpg", "jpeg", "webp", "bmp", "tiff", "tif",
    "avif", "svg", "ico",
}

SUPPORTED_INPUT_MIMES = {
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/avif",
    "image/svg+xml",
    "image/x-icon",
    "image/vnd.microsoft.icon",
}

UNSUPPORTED_FORMATS = {
    "gif", "mp4", "mov", "avi", "mkv", "webm",
    "mp3", "wav", "ogg", "pdf", "doc", "docx",
    "heic", "heif",
}

OUTPUT_FORMATS = ["png", "jpg", "webp", "bmp", "tiff", "avif", "svg"]

ICO_INPUT_FORMATS = {
    "png", "jpg", "jpeg", "webp", "bmp", "tiff", "tif",
    "avif", "svg",
}

FORMAT_TO_PILLOW = {
    "png":  "PNG",
    "jpg":  "JPEG",
    "jpeg": "JPEG",
    "webp": "WEBP",
    "bmp":  "BMP",
    "tiff": "TIFF",
    "tif":  "TIFF",
    "avif": "AVIF",
    "svg":  "SVG",
    "ico":  "ICO",
}

FORMAT_MIME = {
    "png":  "image/png",
    "jpg":  "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
    "bmp":  "image/bmp",
    "tiff": "image/tiff",
    "tif":  "image/tiff",
    "avif": "image/avif",
    "svg":  "image/svg+xml",
    "ico":  "image/x-icon",
    "zip":  "application/zip",
}

ICO_SIZES = [16, 32, 48, 64, 128, 256]


def normalize_format(fmt: str) -> str:
    """Normalize format string to lowercase without dots."""
    return fmt.lower().lstrip(".")


def get_mime(fmt: str) -> str:
    fmt = normalize_format(fmt)
    return FORMAT_MIME.get(fmt, "application/octet-stream")


def get_pillow_format(fmt: str) -> str:
    fmt = normalize_format(fmt)
    return FORMAT_TO_PILLOW.get(fmt, fmt.upper())