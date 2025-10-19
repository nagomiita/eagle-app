# from pathlib import Path

from app.routers import folders, images, tags
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# from fastapi.staticfiles import StaticFiles

app = FastAPI(root_path="/api")
# static_dir = Path(__file__).resolve().parent.parent / "thumbnails"
# app.mount(
#     "/static/thumbnails",
#     StaticFiles(directory=static_dir, follow_symlink=True),
#     name="static",
# )

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router, tags=["images"])
app.include_router(folders.router, tags=["folders"])
app.include_router(tags.router, tags=["tags"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
