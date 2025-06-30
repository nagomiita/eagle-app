from pydantic import BaseModel


class Tag(BaseModel):
    tag_id: int
    tag_name: str
    category: str | None = None
    genre: str | None = None
