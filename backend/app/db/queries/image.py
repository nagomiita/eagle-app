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
