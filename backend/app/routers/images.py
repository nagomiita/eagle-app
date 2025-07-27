from app.core.logger import setup_logging
from app.schemas.image import OriginalImage, ThumbnailImage
from app.services import image_service
from fastapi import APIRouter, Body, HTTPException

router = APIRouter()


logger = setup_logging()


@router.get(
    "/image/thumbnails",
    response_model=list[ThumbnailImage],
    operation_id="fetch_filtered_thumnail_images",
    description="""
指定された条件に基づいて、画像のサムネイル一覧を取得します。

- `include_sensitive`: センシティブな画像（NSFWなど）も含めるかどうかを指定します（デフォルト: False）。
- `favorites_only`: お気に入りに登録された画像のみを対象とするかを指定します（デフォルト: False）。
- `selected_tag`: 特定のタグに紐づいた画像のみを対象とする場合に指定します。

取得に失敗した場合は、適切なエラーメッセージとステータスコードを返します。
""",
)
async def fetch_filtered_thumnail_images(
    include_sensitive: bool = False,
    favorites_only: bool = False,
    selected_tag: str | None = None,
):
    try:
        thumnail_images = image_service.fetch_filtered_thumnail_images(
            include_sensitive, favorites_only, selected_tag
        )
        return thumnail_images
    except ValueError as ve:
        logger.warning(f"ValueError: {ve}")
        raise HTTPException(status_code=404, detail=str(ve))
    except RuntimeError as re:
        logger.error(f"RuntimeError: {re}")
        raise HTTPException(
            status_code=500, detail="画像の取得中にエラーが発生しました"
        )
    except Exception as e:
        logger.exception(f"Unhandled exception: {e}")
        raise HTTPException(status_code=500, detail="予期しないエラーが発生しました")


@router.get(
    "/image/original",
    response_model=OriginalImage,
    operation_id="fetch_original_image",
    description="""
指定された画像IDに対応するオリジナル画像をBase64形式で取得します。

- `id`: オリジナル画像ファイルのidを指定します。

対応形式は `.png`, `.jpg`, `.jpeg`, `.webp` のみです。

### エラー
- 404: 指定された画像ファイルが存在しない場合
- 400: 対応していない画像形式の場合
- 500: その他の内部エラー
""",
)
async def fetch_original_image(id: int):
    try:
        original_image = image_service.fetch_original_image(id)
        return original_image
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"内部エラーが発生しました: {str(e)}"
        )


@router.post(
    "/image/favorite",
    operation_id="register_favorite_image",
    description="""
指定された画像IDをお気に入りとして登録します。

- `image_id`: お気に入り登録対象の画像IDを指定します。

成功時はステータス200を返します。
""",
)
async def register_favorite_image(image_id: int = Body(..., embed=True)):
    try:
        is_favorite = image_service.register_favorite_image(image_id)
        return {"message": f"画像 {image_id} を{is_favorite}に登録しました"}
    except Exception as e:
        logger.error(f"お気に入り登録中にエラー: {e}")
        raise HTTPException(
            status_code=500, detail="お気に入り登録中にエラーが発生しました"
        )


@router.delete(
    "/image",
    operation_id="delete_image",
    description="""
指定された画像IDに対応する画像を削除します。

- `image_id`: 削除対象の画像IDを指定します。

### 成功時
- ステータス200（削除成功）

### 失敗時
- 404: 対象画像が存在しない
- 500: その他の削除処理中のエラー
""",
)
async def delete_image(image_id: int = Body(..., embed=True)):
    try:
        image_service.delete_image(image_id)
        return {"message": f"画像 {image_id} を削除しました"}
    except FileNotFoundError as e:
        logger.warning(f"画像が見つかりません: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"画像削除中にエラー: {e}")
        raise HTTPException(status_code=500, detail="画像削除中にエラーが発生しました")


@router.get(
    "/image/similar",
    response_model=list[ThumbnailImage],
    operation_id="fetch_similar_images",
    description="""
指定された画像IDに基づいて、類似画像のサムネイル一覧を取得します。

- `image_id`: 類似画像検索の基準となる画像のIDを指定します。
- `show_sensitive`: センシティブな画像（NSFWなど）を含めるかどうかを指定します（True で含める）。
- `top_k`: 類似度が高い上位K件の画像を取得します（デフォルト: 20）。

類似度の計算には、事前に保存された埋め込みベクトルを使用し、コサイン類似度に基づいて類似画像を検索します。
センシティブ画像の除外も埋め込み検索対象からフィルタリングされます。

### レスポンス
- `200 OK`: 類似画像のサムネイル情報のリスト（`ThumbnailImage`）を返します。

### エラー
- `404 Not Found`: 指定された画像に埋め込みベクトルが存在しないか、該当する画像が見つからない場合。
- `500 Internal Server Error`: 類似画像の検索処理中にエラーが発生した場合。
""",
)
async def fetch_similar_images(image_id: int, show_sensitive: bool, top_k: int = 60):
    try:
        similar_images = image_service.fetch_similar_images(
            image_id, show_sensitive, top_k
        )
        return similar_images
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"画像が見つかりません: {e}")
    except Exception as e:
        logger.exception(f"類似画像の取得中にエラーが発生しました: {e}")
        raise HTTPException(
            status_code=500, detail="類似画像の取得中にエラーが発生しました"
        )
