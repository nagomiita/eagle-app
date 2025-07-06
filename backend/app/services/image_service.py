import base64
from pathlib import Path

from app.config import IMAGE_DIR
from app.db.queries import image
from app.schemas.image import OriginalImage, ThumbnailImage


def fetch_filtered_thumnail_images(
    include_sensitive: bool, favorites_only: bool, selected_tag: str | None = None
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
        )
    except Exception as e:
        raise RuntimeError("画像データの取得に失敗しました") from e
    if filtered_image_entries is None:
        raise ValueError("画像データが存在しません")
    thumbnails: list[ThumbnailImage] = []

    for entry in filtered_image_entries:
        if not entry.image_path or not entry.thumbnail_path:
            continue
        thumbnails.append(
            ThumbnailImage(
                id=entry.image_path,
                thumbnail=entry.thumbnail_path,
                is_favorite=entry.is_favorite,
            )
        )

    return thumbnails


def fetch_original_image(id: str) -> OriginalImage:
    """
    指定された画像IDに対応する画像ファイルを読み込み、Base64形式のデータURIとして返す。

    Args:
        id (str): 画像ファイルのファイル名またはID（ファイル名と一致する文字列）。

    Raises:
        FileNotFoundError: 指定された画像ファイルが存在しない場合に発生。
        ValueError: 対応していないファイル形式（拡張子）の場合に発生。

    Returns:
        OriginalImage: Base64エンコードされた画像を含むデータオブジェクト。
    """
    path = Path(IMAGE_DIR, id)

    if not path.exists():
        raise FileNotFoundError(f"画像が見つかりません: {id}")

    if path.suffix.lower() not in [".png", ".jpg", ".jpeg", ".webp"]:
        raise ValueError(f"未対応の画像形式です: {path.suffix}")

    with path.open("rb") as image_file:
        encoded = base64.b64encode(image_file.read()).decode()

    ext = path.suffix.lower().replace(".", "")
    return OriginalImage(id=id, image=f"data:image/{ext};base64,{encoded}")


def register_favorite_image(image_path: str) -> bool:
    is_favorite = image.query_toggle_favorite(image_path)
    return is_favorite
