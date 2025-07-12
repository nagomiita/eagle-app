from app.db.models import ImageFolder, ImageFolderAssociation
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
