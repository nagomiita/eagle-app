from typing import List, Optional

from pydantic import BaseModel


class FolderInfo(BaseModel):
    id: str
    name: str
    children: List["FolderInfo"] = []
    parent: Optional[str]
    folder_image: tuple[str, str]


class Tags(BaseModel):
    tag_id: int
    tag_name: str
    category: str | None = None
    genre: str | None = None
