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

- `id`: オリジナル画像ファイルのファイル名（拡張子を含む）を指定します。

対応形式は `.png`, `.jpg`, `.jpeg`, `.webp` のみです。

### エラー
- 404: 指定された画像ファイルが存在しない場合
- 400: 対応していない画像形式の場合
- 500: その他の内部エラー
""",
)
async def fetch_original_image(id: str):
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
async def register_favorite_image(image_id: str = Body(..., embed=True)):
    try:
        # image_service.register_favorite_image(image_id) などの処理を将来的に実装
        return {"message": f"画像 {image_id} をお気に入りに登録しました"}
    except Exception as e:
        logger.error(f"お気に入り登録中にエラー: {e}")
        raise HTTPException(
            status_code=500, detail="お気に入り登録中にエラーが発生しました"
        )
