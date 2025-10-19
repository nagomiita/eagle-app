from pathlib import Path

from app.routers import folders, images, tags
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(root_path="/api")

# 静的ファイル配信（Electronモードでも使用）
static_dir = Path(__file__).resolve().parent.parent / "thumbnails"
app.mount(
    "/static/thumbnails",
    StaticFiles(directory=static_dir),
    name="static",
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS設定 - Electronとnginx両方に対応
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite開発サーバー
        "http://127.0.0.1:5173",
        "http://localhost",            # Electron
        "http://127.0.0.1",
        "http://192.168.11.11",        # nginx (LAN)
        "http://192.168.11.11:80",
        "*",                           # 開発用（本番では削除推奨）
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router, tags=["images"])
app.include_router(folders.router, tags=["folders"])
app.include_router(tags.router, tags=["tags"])

if __name__ == "__main__":
    import uvicorn
    import os

    # 環境変数でモード切り替え
    mode = os.environ.get("APP_MODE", "server")

    if mode == "electron":
        # Electronモード: localhostのみ
        print("Starting FastAPI in Electron mode (localhost only)")
        uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
    else:
        # サーバーモード: LAN内からアクセス可能
        print("Starting FastAPI in Server mode (LAN accessible)")
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
