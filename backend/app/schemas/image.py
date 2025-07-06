from pydantic import BaseModel


class ThumbnailImage(BaseModel):
    id: int
    thumbnail: str | None = None
    is_favorite: bool


class OriginalImage(BaseModel):
    id: int
    image: str | None = None
    tags: list[str]
