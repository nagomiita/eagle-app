from app.db.queries import folder
from app.schemas.folder import FolderInfo


def create_image_folder(
    folder_name: str, image_ids: list[int], description: str
) -> int:
    return folder.create_image_folder(folder_name, image_ids, description)


def fetch_all_folders(include_sensitive: bool) -> list[FolderInfo]:
    """全てのフォルダ情報を取得"""
    raw_folders = folder.query_all_folders(include_sensitive)
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


def remove_images_from_folder(folder_id: int, image_ids: list[int]) -> None:
    """
    フォルダから画像を削除する

    Args:
        folder_id (int): 画像を削除する対象のフォルダID
        image_ids (list[int]): 削除する画像IDのリスト

    Raises:
        RuntimeError: 画像の削除中に予期しないエラーが発生した場合
    """
    try:
        folder.query_remove_images_from_folder(folder_id, image_ids)
    except Exception as e:
        raise RuntimeError(f"フォルダからの画像削除に失敗しました: {e}") from e


def rename_folder(folder_id: int, new_name: str) -> None:
    """
    フォルダの名前を変更する

    Args:
        folder_id (int): 変更対象のフォルダID
        new_name (str): 新しいフォルダ名

    Raises:
        ValueError: フォルダが存在しない場合
        RuntimeError: フォルダの更新中に予期しないエラーが発生した場合
    """
    try:
        folder.query_rename_folder(folder_id, new_name)
    except ValueError as ve:
        raise ve
    except Exception as e:
        raise RuntimeError(f"フォルダ名の変更に失敗しました: {e}") from e


def delete_folder(folder_id: int) -> None:
    """
    フォルダを削除する

    Args:
        folder_id (int): 削除するフォルダのID

    Raises:
        RuntimeError: フォルダの削除中に予期しないエラーが発生した場合
    """
    try:
        folder.query_delete_folder(folder_id)
    except Exception as e:
        raise RuntimeError(f"フォルダの削除に失敗しました: {e}") from e
