from pydantic import BaseModel


class Tag(BaseModel):
    tag_id: int
    tag_name: str
    category: str | None = None
    genre: str | None = None
    is_sensitive: bool = False
    is_favorite: bool = False


class TagFlagUpdate(BaseModel):
    flag: str  # 'favorite' or 'sensitive'
    value: bool
