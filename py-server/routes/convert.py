"""
Conversion route for Pixora Python backend.
POST /api/convert
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from typing import Optional

from services.converter import convert_image
from utils.formats import normalize_format, OUTPUT_FORMATS, get_mime

router = APIRouter()


@router.post("")
async def convert(
    file: UploadFile = File(...),
    target_format: str = Form(...),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    preserve_aspect: bool = Form(True),
    quality: int = Form(90),
    preserve_metadata: bool = Form(True),
):
    tgt = normalize_format(target_format)

    if tgt not in OUTPUT_FORMATS and tgt not in ("heic", "heif"):
        raise HTTPException(status_code=400, detail=f"Unsupported output format: {tgt}")

    try:
        data = await file.read()
        source_fmt = (file.filename or "upload").rsplit(".", 1)[-1]

        converted, mime, out_w, out_h = await convert_image(
            data=data,
            source_fmt=source_fmt,
            target_fmt=tgt,
            width=width,
            height=height,
            preserve_aspect=preserve_aspect,
            quality=quality,
            preserve_metadata=preserve_metadata,
        )

        ext = "jpg" if tgt in ("jpeg",) else tgt
        headers = {
            "X-Output-Width": str(out_w),
            "X-Output-Height": str(out_h),
            "X-Output-Size": str(len(converted)),
            "X-Output-Format": tgt.upper(),
            "Content-Disposition": f'attachment; filename="pixora_converted.{ext}"',
        }
        return Response(content=converted, media_type=mime, headers=headers)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))