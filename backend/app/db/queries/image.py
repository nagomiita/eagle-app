from app.db.models import (
    ImageEntry,
    ImageTag,
)
from app.db.query_performance import measure_query_time, measure_time
from app.db.session import get_session


@measure_time("get_filtered_image_entries")
def query_filtered_image_entries(
    favorites_only: bool = False,
    include_sensitive: bool = True,
    tag_id: str | None = None,
) -> list[ImageEntry]:
    with get_session() as session:
        with measure_query_time("build_filtered_query"):
            query = session.query(ImageEntry)
            if favorites_only:
                query = query.filter(ImageEntry.is_favorite.is_(True))
            if not include_sensitive:
                query = query.filter(ImageEntry.is_sensitive.is_(False))
            query = query.order_by(ImageEntry.id.desc())
            if tag_id:
                subquery = session.query(ImageTag.image_id).filter(
                    ImageTag.tag_id == tag_id
                )
                query = query.filter(ImageEntry.id.in_(subquery))
        with measure_query_time("execute_filtered_query"):
            return query.all()


def query_toggle_favorite(image_path: str) -> bool:
    """image_path に対応する画像の is_favorite をトグルし、更新後の値を返す"""
    with get_session() as session:
        image = session.query(ImageEntry).filter_by(image_path=image_path).first()

        if image is None:
            raise ValueError(f"画像が見つかりません: {image_path}")

        image.is_favorite = not image.is_favorite
        session.commit()
        return image.is_favorite  # 更新後の状態を返す


def delete_image_by_path(image_path: str) -> ImageEntry:
    """image_path に対応する画像レコードを削除し、削除したレコードを返す"""
    with get_session() as session:
        image = session.query(ImageEntry).filter_by(image_path=image_path).first()

        if image is None:
            raise FileNotFoundError(f"画像が見つかりません: {image_path}")

        deleted_image = ImageEntry(
            id=image.id,
            image_path=image.image_path,
            thumbnail_path=image.thumbnail_path,
            tag_embedding=image.tag_embedding,
            created_at=image.created_at,
            registered_at=image.registered_at,
            is_favorite=image.is_favorite,
            is_sensitive=image.is_sensitive,
            view_count=image.view_count,
        )

        session.delete(image)
        session.commit()
        return deleted_image


def query_increment_view_count(image_path: str) -> None:
    with get_session() as session:
        entry = session.query(ImageEntry).filter_by(image_path=image_path).first()
        if entry:
            entry.view_count += 1
            session.commit()
