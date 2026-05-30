import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.validate import router as validate_router
from routes.convert import router as convert_router
from routes.metadata import router as metadata_router
from routes.ico import router as ico_router

load_dotenv()

app = FastAPI(
    title="Pixora API",
    description="Image conversion API for Pixora — Python backend",
    version="1.0.0",
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:9539").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(validate_router, prefix="/api/validate", tags=["Validate"])
app.include_router(convert_router, prefix="/api/convert", tags=["Convert"])
app.include_router(metadata_router, prefix="/api/metadata", tags=["Metadata"])
app.include_router(ico_router, prefix="/api/ico", tags=["ICO"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Pixora Python Backend",
        "status": "running",
        "version": "1.0.0",
        "backend": "python",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "backend": "python"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8598)),
        reload=True,
    )