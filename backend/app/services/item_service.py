import base64
import logging
from pathlib import Path

from app.config import THUMB_DIR
from app.db.query import get_filtered_image_entries
from app.schemas.item import Item, OriginalImage

logger = logging.getLogger(__name__)


def get_items(include_sensitive, favorites_only, selected_tag):
    filtered_image_entries = get_filtered_image_entries(
        include_sensitive=include_sensitive,
        favorites_only=favorites_only,
        tag_id=selected_tag,
    )
    print(f"Filtered image entries: {len(filtered_image_entries)}")
    thumbnails: list[Item] = []

    for entry in filtered_image_entries:
        thumbnails.append(Item(id=entry.image_path, thumbnail=entry.thumbnail_path))

    return thumbnails


def get_original_image(id) -> list[OriginalImage]:
    path = Path(THUMB_DIR, id)
    if path.exists() and path.suffix.lower() in [".png", ".jpg", ".jpeg"]:
        with path.open("rb") as image_file:
            encoded = base64.b64encode(image_file.read()).decode()

        ext = path.suffix.lower().replace(".", "")
    original_images: list[OriginalImage] = []
    original_images.append(
        OriginalImage(id=id, image=f"data:image/{ext};base64,{encoded}")
    )
    return original_images
