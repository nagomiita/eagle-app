from pydantic import BaseModel


class Item(BaseModel):
    id: str
    thumbnail: str | None = None


class ItemListResponse(BaseModel):
    status: str
    data: list[Item]


class OriginalImage(BaseModel):
    id: str
    image: str | None = None
    error: str | None = None


class OriginalImageResponse(BaseModel):
    status: str = "success"
    data: list[OriginalImage]
