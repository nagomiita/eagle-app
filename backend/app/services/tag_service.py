from app.db.query import get_all_translated_tags
from app.models.schemas import Tags


def get_tags() -> list[Tags]:
    tags = get_all_translated_tags()
    return tags
