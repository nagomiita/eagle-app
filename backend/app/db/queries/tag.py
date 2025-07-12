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
                    Tag.is_sensitive.label("is_sensitive"),
                    Tag.is_favorite.label("is_favorite"),
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


def update_tag_flag(tag_id: int, flag: str, value: bool, language: str = "ja") -> dict:
    """
    タグのお気に入りまたはセンシティブフラグをオン/オフする

    Args:
        tag_id (int): フラグを変更する対象のタグID
        flag (str): フラグの種類。'favorite' または 'sensitive'
        value (bool): フラグの値。True でオン、False でオフ

    Raises:
        ValueError: 無効なフラグ名が指定された場合
        RuntimeError: タグの更新中に予期しないエラーが発生した場合

    Returns:
        dict: 更新されたタグ情報の辞書
    """
    if flag not in ["favorite", "sensitive"]:
        raise ValueError(
            "無効なフラグ名です。'favorite' または 'sensitive' を指定してください。"
        )

    with get_session() as session:
        tag = session.query(Tag).filter(Tag.id == tag_id).one_or_none()
        if not tag:
            raise RuntimeError(f"タグID {tag_id} が見つかりません")

        setattr(tag, f"is_{flag}", value)
        session.commit()
        translated = (
            session.query(TagTranslation.translated_name)
            .filter(
                TagTranslation.tag_id == tag_id,
                TagTranslation.language == language,
            )
            .scalar()
        )

        # 必要に応じて他のフィールドも追加可能
        return {
            "tag_id": tag.id,
            "tag_name": translated if translated else tag.name,
            "is_favorite": tag.is_favorite,
            "is_sensitive": tag.is_sensitive,
            "category": tag.category.name if tag.category else None,
            "genre": next(
                (rel.genre.name for rel in tag.genre_relations if rel.genre), None
            ),
        }
