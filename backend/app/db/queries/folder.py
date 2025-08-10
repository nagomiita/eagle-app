from pathlib import Path

from app.db.models import ImageEntry, ImageFolder, ImageFolderAssociation
from app.db.session import get_session
from sqlalchemy import func


def create_image_folder(name: str, image_ids: list[int], description: str = "") -> int:
    with get_session() as session:
        existing = session.query(ImageFolder).filter_by(name=name).first()
        if existing:
            raise ValueError(f"Folder '{name}' already exists.")

        # フォルダ作成
        folder = ImageFolder(name=name, description=description)
        session.add(folder)
        session.flush()
        folder_id = folder.id
        # 関連付け挿入
        for position, image_id in enumerate(image_ids):
            association = ImageFolderAssociation(
                folder_id=folder_id, image_id=image_id, position=position
            )
            session.add(association)
        session.commit()
    return folder_id


def query_all_folders(include_sensitive: bool) -> list[dict]:
    with get_session() as session:
        # フォルダ情報 + 紐づく画像IDを一括で取得
        results = (
            session.query(
                ImageFolder.id,
                ImageFolder.name,
                ImageFolder.description,
                ImageFolderAssociation.image_id,
            )
            .join(
                ImageFolderAssociation,
                ImageFolder.id == ImageFolderAssociation.folder_id,
            )
            .order_by(ImageFolderAssociation.position)
            .all()
        )

        # dict にまとめる
        folder_map: dict[int, dict] = {}

        for folder_id, name, desc, image_id in results:
            image_entry = session.query(ImageEntry).filter_by(id=image_id).first()
            if not include_sensitive and getattr(image_entry, "is_sensitive", False):
                continue  # sensitive画像を除外
            image_ids: dict = {
                "id": image_entry.id,
                "name": Path(image_entry.image_path).name,
                "thumbnail": image_entry.thumbnail_path,
                "is_favorite": image_entry.is_favorite,
            }
            if folder_id not in folder_map:
                folder_map[folder_id] = {
                    "id": folder_id,
                    "name": name,
                    "description": desc or "",
                    "thumbnail_images": [],
                }
            folder_map[folder_id]["thumbnail_images"].append(image_ids)

        return list(folder_map.values())


def query_update_folder_order(folder_id: int, image_ids: list[int]) -> None:
    with get_session() as session:
        for position, image_id in enumerate(image_ids):
            assoc = (
                session.query(ImageFolderAssociation)
                .filter_by(folder_id=folder_id, image_id=image_id)
                .first()
            )
            if assoc:
                assoc.position = position
        session.commit()


def query_add_images_to_folder(folder_id: int, image_ids: list[int]):
    with get_session() as session:
        # 🔹 既存の最大 position を取得（None の場合は 0 とする）
        max_position = (
            session.query(func.max(ImageFolderAssociation.position))
            .filter(ImageFolderAssociation.folder_id == folder_id)
            .scalar()
        )
        next_position = (max_position or 0) + 1

        for image_id in image_ids:
            # 🔸 すでに含まれていればスキップ
            exists = (
                session.query(ImageFolderAssociation)
                .filter_by(folder_id=folder_id, image_id=image_id)
                .first()
            )
            if exists:
                continue

            assoc = ImageFolderAssociation(
                folder_id=folder_id, image_id=image_id, position=next_position
            )
            session.add(assoc)
            next_position += 1  # 位置をインクリメント

        session.commit()


def query_remove_images_from_folder(folder_id: int, image_ids: list[int]) -> None:
    with get_session() as session:
        for image_id in image_ids:
            assoc = (
                session.query(ImageFolderAssociation)
                .filter_by(folder_id=folder_id, image_id=image_id)
                .first()
            )
            if assoc:
                session.delete(assoc)
        session.commit()


def query_rename_folder(folder_id: int, new_name: str) -> None:
    with get_session() as session:
        folder = session.query(ImageFolder).filter(ImageFolder.id == folder_id).first()
        if not folder:
            raise ValueError(f"Folder ID {folder_id} does not exist.")

        # 重複チェック
        existing = (
            session.query(ImageFolder).filter(ImageFolder.name == new_name).first()
        )
        if existing and existing.id != folder_id:
            raise ValueError(f"Folder name '{new_name}' is already used.")

        folder.name = new_name
        session.commit()


def query_delete_folder(folder_id: int) -> None:
    with get_session() as session:
        folder = session.query(ImageFolder).filter(ImageFolder.id == folder_id).first()
        if not folder:
            raise ValueError(f"Folder ID {folder_id} does not exist.")

        # 関連付けを削除
        session.query(ImageFolderAssociation).filter(
            ImageFolderAssociation.folder_id == folder_id
        ).delete()

        # フォルダ自体を削除
        session.delete(folder)
        session.commit()
