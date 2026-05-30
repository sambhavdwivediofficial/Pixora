"""
Metadata route for Pixora Python backend.
POST /api/metadata/extract
POST /api/metadata/strip
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, Response

from services.metadata_handler import extract_metadata, strip_metadata
from utils.formats import normalize_format, get_mime

router = APIRouter()


@router.post("/extract")
async def metadata_extract(file: UploadFile = File(...)):
    try:
        data = await file.read()
        ext = (file.filename or "upload").rsplit(".", 1)[-1]
        fmt = normalize_format(ext)
        meta = extract_metadata(data, fmt)
        return JSONResponse(content={"metadata": meta})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/strip")
async def metadata_strip(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    try:
        data = await file.read()
        tgt = normalize_format(target_format)
        stripped = strip_metadata(data, tgt)
        mime = get_mime(tgt)
        return Response(content=stripped, media_type=mime)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))