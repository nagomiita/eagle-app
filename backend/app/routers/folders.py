from app.core.logger import setup_logging
from app.schemas.folder import FolderCreateRequest
from app.services import folder_service
from fastapi import APIRouter, HTTPException

router = APIRouter()
logger = setup_logging()


@router.post(
    "/folder",
    operation_id="register_image_folder",
    summary="画像フォルダの作成とサムネイル取得",
)
async def register_folder(request: FolderCreateRequest):
    try:
        folder_service.register_image_folder(
            request.folder_name,
            request.image_ids,
            request.description,
        )
    except ValueError as ve:
        logger.warning(f"📛 フォルダ作成エラー: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        logger.error(f"🔥 サービス層エラー: {re}")
        raise HTTPException(status_code=500, detail="画像取得中にエラーが発生しました")
    except Exception as e:
        logger.exception(f"❌ 未処理の例外: {e}")
        raise HTTPException(status_code=500, detail="予期しないエラーが発生しました")
