from app.schemas.image import ThumbnailImage
from pydantic import BaseModel


class FolderCreateRequest(BaseModel):
    folder_name: str
    image_ids: list[int]
    description: str = ""


class FolderInfo(BaseModel):
    id: int
    name: str
    description: str
    thumbnail_images: list[ThumbnailImage]


class FolderReorderRequest(BaseModel):
    folder_id: int
    image_ids: list[int]
