from app.db.queries import tag
from app.schemas.tag import Tag


def fetch_translated_tags(language: str = "ja") -> list[Tag]:
    tags = tag.query_all_translated_tags(language)
    return [
        Tag(
            tag_id=tag_id,
            tag_name=translated_name or default_name,
            category=category,
            genre=genre,
        )
        for tag_id, default_name, translated_name, category, genre in tags
    ]
