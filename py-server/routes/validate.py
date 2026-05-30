"""
Validation route for Pixora Python backend.
POST /api/validate
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from services.validator import validate_image

router = APIRouter()


@router.post("")
async def validate(file: UploadFile = File(...)):
    try:
        data = await file.read()
        filename = file.filename or "upload"
        result = await validate_image(data, filename)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))