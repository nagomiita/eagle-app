from pydantic import BaseModel
from typing import List, Optional

class FolderInfo(BaseModel):
    id: str
    name: str
    children: List['FolderInfo'] = []
    parent: Optional[str]
    folder_image: tuple[str, str]

class TagsResponse(BaseModel):
    historyTags: List[str]
    starredTags: List[str]