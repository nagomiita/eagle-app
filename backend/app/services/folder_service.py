from app.db.queries import folder
from app.schemas.folder import FolderInfo


def register_image_folder(
    folder_name: str, image_ids: list[int], description: str
) -> bool:
    folder.create_image_folder(folder_name, image_ids, description)


def fetch_all_folders() -> list[FolderInfo]:
    """全てのフォルダ情報を取得"""
    raw_folders = folder.query_all_folders()
    return [FolderInfo.model_validate(folder_dict) for folder_dict in raw_folders]
