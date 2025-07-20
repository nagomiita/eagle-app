from app.db.queries import folder
from app.schemas.folder import FolderInfo


def create_image_folder(
    folder_name: str, image_ids: list[int], description: str
) -> bool:
    folder.create_image_folder(folder_name, image_ids, description)


def fetch_all_folders() -> list[FolderInfo]:
    """全てのフォルダ情報を取得"""
    raw_folders = folder.query_all_folders()
    return [FolderInfo.model_validate(folder_dict) for folder_dict in raw_folders]


def update_folder_order(folder_id: int, image_ids: list[int]) -> None:
    """
    フォルダ内の画像順序を更新する

    Args:
        folder_id (int): 更新対象のフォルダID
        image_ids (list[int]): 新しい画像IDの順序リスト

    Raises:
        RuntimeError: フォルダの更新中に予期しないエラーが発生した場合
    """
    try:
        folder.query_update_folder_order(folder_id, image_ids)
    except Exception as e:
        raise RuntimeError(f"フォルダの順序更新に失敗しました: {e}") from e


def add_images_to_folder(folder_id: int, image_ids: list[int]):
    folder.query_add_images_to_folder(folder_id, image_ids)
