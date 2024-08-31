from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import folders, items, tags

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(folders.router)
app.include_router(items.router)
app.include_router(tags.router)