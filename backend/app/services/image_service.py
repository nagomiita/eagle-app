import base64
import random
from pathlib import Path

from app.settings import IMAGE_DIR
from app.db.queries import image, tag
from app.schemas.image import OriginalImage, ThumbnailImage
from app.schemas.tag import Tag
from app.utils import embedding
from send2trash import send2trash


def fetch_filtered_thumnail_images(
    include_sensitive: bool,
    favorites_only: bool,
    selected_tag: str | None = None,
    exclude_in_folder: bool = True,
    shuffle: bool = False,
) -> list[ThumbnailImage]:
    """
    フィルタ条件に基づいて画像エントリを取得し、サムネイル情報のリストを返す。

    Args:
        include_sensitive (bool): センシティブな画像も含めるかどうか。
        favorites_only (bool): お気に入り画像のみを対象とするかどうか。
        selected_tag (str | None, optional): 特定のタグで絞り込む場合のタグID。指定しない場合はNone。

    Raises:
        RuntimeError: データベースからの画像取得に失敗した場合に発生。
        ValueError: 該当する画像データが存在しない場合に発生。

    Returns:
        list[ThumbnailImage]: サムネイル情報（IDとパス）を含むThumbnailImageのリスト。
    """
    try:
        filtered_image_entries = image.query_filtered_image_entries(
            include_sensitive=include_sensitive,
            favorites_only=favorites_only,
            tag_id=selected_tag,
            exclude_in_folder=exclude_in_folder,
        )
    except Exception as e:
        raise RuntimeError("画像データの取得に失敗しました") from e
    if filtered_image_entries is None:
        raise ValueError("画像データが存在しません")
    thumbnails: list[ThumbnailImage] = []

    for entry in filtered_image_entries:
        thumbnails.append(
            ThumbnailImage(
                id=entry.id,
                name=Path(entry.image_path).name,
                thumbnail=entry.thumbnail_path,
                is_favorite=entry.is_favorite,
            )
        )
    if shuffle:
        random.shuffle(thumbnails)
    return thumbnails


def fetch_original_image(id: int) -> OriginalImage:
    """
    指定された画像IDに対応する画像ファイルを読み込み、Base64形式のデータURIとして返す。

    Args:
        id (id): 画像ファイルのID。

    Raises:
        FileNotFoundError: 指定された画像ファイルが存在しない場合に発生。
        ValueError: 対応していないファイル形式（拡張子）の場合に発生。

    Returns:
        OriginalImage: Base64エンコードされた画像を含むデータオブジェクト。
    """
    image_path = image.query_image_path_by_id(id)
    if not image_path:
        raise FileNotFoundError(f"画像が見つかりません: {id}")
    raw_tags = tag.query_translated_tag_names_by_image_id(id)
    tags = [Tag(tag_id=tag["tag_id"], tag_name=tag["translated"]) for tag in raw_tags]
    path = Path(IMAGE_DIR, image_path)
    if not path.exists():
        raise FileNotFoundError(f"画像が見つかりません: {path}")
    if path.suffix.lower() not in [".png", ".jpg", ".jpeg", ".webp"]:
        raise ValueError(f"未対応の画像形式です: {path.suffix}")
    with path.open("rb") as image_file:
        encoded = base64.b64encode(image_file.read()).decode()

    ext = path.suffix.lower().replace(".", "")
    return OriginalImage(id=id, image=f"data:image/{ext};base64,{encoded}", tags=tags)


def register_favorite_image(image_id: int) -> bool:
    is_favorite = image.query_toggle_favorite(image_id)
    return is_favorite


def delete_image(image_id: int) -> bool:
    deleted_image = image.delete_image_by_path(image_id)
    for path in [
        Path(IMAGE_DIR, deleted_image.image_path),
        Path(IMAGE_DIR, deleted_image.thumbnail_path),
    ]:
        try:
            if path.exists():
                send2trash(str(path))
        except Exception as e:
            raise (f"[Error] ファイル削除失敗: {path} -> {e}")


def fetch_similar_images(
    image_id: int, show_sensitive: bool, exclude_in_folder: bool, top_k: int
) -> list[ThumbnailImage]:
    # 1. クエリ画像のベクトル（バイナリ）を取得
    query_vec_blob = image.query_image_tag_embedding(image_id)
    if query_vec_blob is None:
        print("❌ クエリ画像のベクトルがありません")
        return []

    # 2. 比較対象の全ベクトル（バイナリ）を取得（フォルダ除外オプションを渡す）
    all_vectors_blob = image.query_all_image_tag_embedding(
        exclude_id=image_id,
        show_sensitive=show_sensitive,
        exclude_in_folder=exclude_in_folder,
    )
    if not all_vectors_blob:
        print("❌ 比較対象のベクトルが存在しません")
        return []

    # 3. 類似画像IDを取得（top_k件）
    top_ids = embedding.find_similar_image_ids(query_vec_blob, all_vectors_blob, top_k)

    # 4. 類似画像のサムネイル情報を取得（フォルダ除外オプションを渡す）
    similar_thumbnails = image.query_thumbnails_by_ids(
        top_ids, exclude_in_folder=exclude_in_folder
    )

    return [
        ThumbnailImage(
            id=entry.id,
            name=Path(entry.image_path).name,
            thumbnail=entry.thumbnail_path,
            is_favorite=entry.is_favorite,
        )
        for entry in similar_thumbnails
    ]
