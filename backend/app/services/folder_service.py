from app.db.queries import folder


def register_image_folder(
    folder_name: str, image_ids: list[int], description: str
) -> bool:
    folder.create_image_folder(folder_name, image_ids, description)
