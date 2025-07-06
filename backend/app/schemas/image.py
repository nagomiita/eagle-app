from pydantic import BaseModel


class ThumbnailImage(BaseModel):
    id: str
    thumbnail: str | None = None
    is_favorite: bool


class OriginalImage(BaseModel):
    id: str
    image: str | None = None
