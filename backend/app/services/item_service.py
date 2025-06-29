import base64
import logging
from pathlib import Path

from app.config import THUMB_DIR
from app.db.query import get_filtered_image_entries
from app.schemas.item import Item, OriginalImage

logger = logging.getLogger(__name__)


def get_items(limit, offset, orderBy, keyword, ext, tags, folders):
    filtered_image_entries = get_filtered_image_entries(
        limit=limit, include_sensitive=False
    )
    print(f"Filtered image entries: {len(filtered_image_entries)}")
    thumbnails: list[Item] = []

    for entry in filtered_image_entries:
        thumbnail = get_thumbnail(entry.thumbnail_path)
        thumbnails.append(Item(id=entry.image_path, thumbnail=thumbnail))

    return thumbnails


def get_thumbnail(thumbnail_path: str):
    path = Path(THUMB_DIR, thumbnail_path)
    if path.exists() and path.suffix.lower() in [".png", ".jpg", ".jpeg"]:
        with path.open("rb") as image_file:
            encoded = base64.b64encode(image_file.read()).decode()

        ext = path.suffix.lower().replace(".", "")
        return f"data:image/{ext};base64,{encoded}"


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
