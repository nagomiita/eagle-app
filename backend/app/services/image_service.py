import base64
from pathlib import Path

from app.config import IMAGE_DIR
from app.db.queries import image
from app.schemas.item import Item, OriginalImage


def fetch_filtered_thumnail_images(
    include_sensitive: bool, favorites_only: bool, selected_tag: str | None = None
) -> list[Item]:
    filtered_image_entries = image.query_filtered_image_entries(
        include_sensitive=include_sensitive,
        favorites_only=favorites_only,
        tag_id=selected_tag,
    )
    thumbnails: list[Item] = []

    for entry in filtered_image_entries:
        thumbnails.append(Item(id=entry.image_path, thumbnail=entry.thumbnail_path))

    return thumbnails


def fetch_original_image(id: str) -> list[OriginalImage]:
    path = Path(IMAGE_DIR, id)
    if path.exists() and path.suffix.lower() in [".png", ".jpg", ".jpeg"]:
        with path.open("rb") as image_file:
            encoded = base64.b64encode(image_file.read()).decode()

        ext = path.suffix.lower().replace(".", "")
    original_images: list[OriginalImage] = []
    original_images.append(
        OriginalImage(id=id, image=f"data:image/{ext};base64,{encoded}")
    )
    return original_images
