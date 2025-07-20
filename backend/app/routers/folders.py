from app.core.logger import setup_logging
from app.schemas.folder import FolderCreateRequest, FolderInfo, FolderReorderRequest
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


@router.get(
    "/folder",
    response_model=list[FolderInfo],
    operation_id="fetch_all_folders",
    summary="全フォルダ情報を取得",
)
async def fetch_all_folders():
    try:
        return folder_service.fetch_all_folders()
    except Exception:
        logger.exception("❌ フォルダ情報取得中にエラーが発生しました")
        raise HTTPException(status_code=500, detail="フォルダ取得に失敗しました")


@router.put(
    "/folder/order",
    summary="フォルダ内の画像順序を更新",
    operation_id="update_folder_order",
)
async def update_folder_order(request: FolderReorderRequest):
    try:
        folder_service.update_folder_order(
            request.folder_id,
            request.image_ids,
        )
        return {"message": "順番を更新しました"}
    except Exception:
        logger.exception("❌ フォルダ順序更新エラー")
        raise HTTPException(status_code=500, detail="順番の更新に失敗しました")
