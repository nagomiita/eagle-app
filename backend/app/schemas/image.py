from pydantic import BaseModel


class ThumbnailImage(BaseModel):
    id: str
    thumbnail: str | None = None


class OriginalImage(BaseModel):
    id: str
    image: str | None = None
