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


def query_toggle_favorite(image_id: int) -> bool:
    """image_path に対応する画像の is_favorite をトグルし、更新後の値を返す"""
    with get_session() as session:
        entry = session.get(ImageEntry, image_id)

        if entry is None:
            raise ValueError(f"画像が見つかりません: {image_id}")

        entry.is_favorite = not entry.is_favorite
        session.commit()
        return entry.is_favorite  # 更新後の状態を返す


def delete_image_by_path(image_id: int) -> ImageEntry:
    """image_path に対応する画像レコードを削除し、削除したレコードを返す"""
    with get_session() as session:
        entry = session.get(ImageEntry, image_id)

        if entry is None:
            raise FileNotFoundError(f"画像が見つかりません: {image_id}")

        deleted_image = ImageEntry(
            id=entry.id,
            image_path=entry.image_path,
            thumbnail_path=entry.thumbnail_path,
            tag_embedding=entry.tag_embedding,
            created_at=entry.created_at,
            registered_at=entry.registered_at,
            is_favorite=entry.is_favorite,
            is_sensitive=entry.is_sensitive,
            view_count=entry.view_count,
        )

        session.delete(entry)
        session.commit()
        return deleted_image


@measure_time("query_image_path_by_id")
def query_image_path_by_id(image_id: int) -> str | None:
    with get_session() as session:
        with measure_query_time(f"query_image_by_id_{image_id}"):
            entry = session.get(ImageEntry, image_id)
            if not entry:
                return None
            entry.view_count += 1
            session.commit()
            return entry.image_path


@measure_time("query_image_tag_embedding")
def query_image_tag_embedding(image_id: int) -> bytes | None:
    with get_session() as session:
        with measure_query_time(f"query_image_embedding_{image_id}"):
            entry = session.get(ImageEntry, image_id)
            if entry and entry.tag_embedding_blob:
                return entry.tag_embedding_blob
        return None


@measure_time("query_all_image_tag_embedding")
def query_all_image_tag_embedding(
    exclude_id: int | None = None, show_sensitive: bool = True
) -> list[tuple[int, bytes]]:
    with get_session() as session:
        with measure_query_time("build_embedding_query"):
            query = session.query(ImageEntry.id, ImageEntry.tag_embedding_blob).filter(
                ImageEntry.tag_embedding_blob.isnot(None)
            )

            if exclude_id is not None:
                query = query.filter(ImageEntry.id != exclude_id)

            if not show_sensitive:
                query = query.filter(ImageEntry.is_sensitive.is_(False))

        with measure_query_time("execute_embedding_query"):
            return query.all()


@measure_time("query_thumbnails_by_ids")
def query_thumbnails_by_ids(image_ids: list[int]) -> list[ImageEntry]:
    if not image_ids:
        return []

    with get_session() as session:
        with measure_query_time("fetch_thumbnails_by_ids"):
            # SQLAlchemy の in_ でIDリストを指定して一括取得
            entries = (
                session.query(ImageEntry).filter(ImageEntry.id.in_(image_ids)).all()
            )

    # ID順の整列（入力順を保ちたい場合）
    entry_map = {entry.id: entry for entry in entries}
    sorted_entries = [entry_map[i] for i in image_ids if i in entry_map]
    return sorted_entries
