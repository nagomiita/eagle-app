from pathlib import Path

import numpy as np
from app.db.queries import folder, image
from app.schemas.folder import FolderInfo
from app.schemas.image import ThumbnailImage
from sklearn.metrics.pairwise import cosine_similarity


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


def sort_images_by_chained_similarity(
    folder_id: int, seed_image_id: int, include_sensitive: bool = True
) -> list[ThumbnailImage]:
    """
    指定フォルダ内の画像を、指定した画像IDを起点に「最も近いものへ順に辿る」
    という貪欲法で並べ替えて返す。

    返却は `ThumbnailImage` のリスト。
    埋め込みが無い画像は対象外（返却にも含めない）。
    """
    # 1) 起点ベクトル取得
    seed_blob = image.query_image_tag_embedding(seed_image_id)
    if seed_blob is None:
        return []

    seed_vec = np.frombuffer(seed_blob, dtype=np.float32)

    # 2) フォルダ内候補ベクトル取得（起点は除外されていてもいなくても良いので後で除外）
    candidates = folder.query_folder_image_embeddings(
        folder_id=folder_id, include_sensitive=include_sensitive
    )
    if not candidates:
        return []

    # (id, vec) に変換し、起点は除外
    remaining: list[tuple[int, np.ndarray]] = [
        (img_id, np.frombuffer(blob, dtype=np.float32))
        for img_id, blob in candidates
        if img_id != seed_image_id
    ]

    if not remaining:
        # フォルダに起点しか無い場合
        thumbs = image.query_thumbnails_by_ids([seed_image_id])
        return [
            ThumbnailImage(
                id=entry.id,
                name=Path(entry.image_path).name,
                thumbnail=entry.thumbnail_path,
                is_favorite=entry.is_favorite,
            )
            for entry in thumbs
        ]

    ordered_ids: list[int] = [seed_image_id]
    current_vec = seed_vec

    # 3) 貪欲法でチェーン
    while remaining:
        ids = [i for i, _ in remaining]
        vecs = [v for _, v in remaining]
        mat = np.vstack(vecs)
        sims = cosine_similarity(current_vec.reshape(1, -1), mat)[0]
        best_idx = int(np.argmax(sims))
        best_id, best_vec = remaining.pop(best_idx)
        ordered_ids.append(best_id)
        current_vec = best_vec

    # 4) サムネイル情報を順序通りに取得して返却
    entries = image.query_thumbnails_by_ids(ordered_ids)
    return [
        ThumbnailImage(
            id=e.id,
            name=Path(e.image_path).name,
            thumbnail=e.thumbnail_path,
            is_favorite=e.is_favorite,
        )
        for e in entries
    ]
