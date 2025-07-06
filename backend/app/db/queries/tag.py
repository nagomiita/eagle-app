from app.db.models import (
    Category,
    Genre,
    ImageTag,
    Tag,
    TagGenre,
    TagTranslation,
)
from app.db.query_performance import measure_query_time, measure_time
from app.db.session import get_session


@measure_time("query_all_translated_tags")
def query_all_translated_tags(language: str = "ja") -> list[tuple]:
    with get_session() as session:
        with measure_query_time("query_all_translated_tags"):
            return (
                session.query(Tag)
                .outerjoin(
                    TagTranslation,
                    (Tag.id == TagTranslation.tag_id)
                    & (TagTranslation.language == language),
                )
                .join(Tag.category)
                .outerjoin(TagGenre, Tag.id == TagGenre.tag_id)
                .outerjoin(Genre, TagGenre.genre_id == Genre.id)
                .with_entities(
                    Tag.id.label("tag_id"),
                    Tag.name.label("default_name"),
                    TagTranslation.translated_name.label("translated_name"),
                    Category.name.label("category"),
                    Genre.name.label("genre_name"),
                )
                .order_by(Tag.name)
                .all()
            )


@measure_time("query_translated_tag_names_by_image_id")
def query_translated_tag_names_by_image_id(
    image_id: int, language: str = "ja"
) -> list[dict]:
    with get_session() as session:
        with measure_query_time(f"query_translated_tag_names_by_image_id_{image_id}"):
            results = (
                session.query(
                    Tag.id.label("tag_id"),
                    Tag.name.label("default_name"),
                    TagTranslation.translated_name.label("translated_name"),
                )
                .join(ImageTag, ImageTag.tag_id == Tag.id)
                .filter(ImageTag.image_id == image_id)
                .outerjoin(
                    TagTranslation,
                    (Tag.id == TagTranslation.tag_id)
                    & (TagTranslation.language == language),
                )
                .order_by(Tag.name)
                .all()
            )

            return [
                {
                    "tag_id": tag_id,
                    "translated": translated_name if translated_name else default_name,
                }
                for tag_id, default_name, translated_name in results
            ]
