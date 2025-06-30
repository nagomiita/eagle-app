from app.db.queries import tag
from app.models.schemas import Tags


def fetch_translated_tags(language: str = "ja") -> list[Tags]:
    tags = tag.query_all_translated_tags(language)
    return [
        Tags(
            tag_id=tag_id,
            tag_name=translated_name or default_name,
            category=category,
            genre=genre,
        )
        for tag_id, default_name, translated_name, category, genre in tags
    ]
