"""
ICO conversion route for Pixora Python backend.
POST /api/ico/convert  — Returns ZIP file with favicon.ico + individual PNGs
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response

from services.ico_converter import build_ico_bytes, build_individual_pngs
from services.zip_generator import build_ico_zip
from utils.formats import normalize_format, ICO_INPUT_FORMATS

router = APIRouter()


@router.post("/convert")
async def convert_to_ico(file: UploadFile = File(...)):
    ext = (file.filename or "upload").rsplit(".", 1)[-1]
    fmt = normalize_format(ext)

    if fmt not in ICO_INPUT_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported input format for ICO conversion: {fmt}. ICO files cannot be converted to ICO.",
        )

    try:
        data = await file.read()

        ico_bytes = build_ico_bytes(data, fmt)
        png_files = build_individual_pngs(data, fmt)
        zip_bytes = build_ico_zip(ico_bytes, png_files)

        headers = {
            "X-Output-Size": str(len(zip_bytes)),
            "Content-Disposition": 'attachment; filename="pixora_favicon_package.zip"',
        }
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers=headers,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))