from pydantic import BaseModel


class FolderCreateRequest(BaseModel):
    folder_name: str
    image_ids: list[int]
    description: str = ""
