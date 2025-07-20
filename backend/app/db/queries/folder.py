from app.db.models import ImageEntry, ImageFolder, ImageFolderAssociation
from app.db.session import get_session


def create_image_folder(
    name: str, image_ids: list[int], description: str = ""
) -> ImageFolder:
    with get_session() as session:
        existing = session.query(ImageFolder).filter_by(name=name).first()
        if existing:
            raise ValueError(f"Folder '{name}' already exists.")

        # フォルダ作成
        folder = ImageFolder(name=name, description=description)
        session.add(folder)
        session.flush()

        # 関連付け挿入
        for position, image_id in enumerate(image_ids):
            association = ImageFolderAssociation(
                folder_id=folder.id, image_id=image_id, position=position
            )
            session.add(association)

        session.commit()


def query_all_folders() -> list[dict]:
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
            .order_by(ImageFolder.id, ImageFolderAssociation.position)
            .all()
        )

        # dict にまとめる
        folder_map: dict[int, dict] = {}

        for folder_id, name, desc, image_id in results:
            image_entry = session.query(ImageEntry).filter_by(id=image_id).first()
            image_ids: dict = {
                "id": image_entry.id,
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
