from app.core.logger import setup_logging
from app.schemas.folder import FolderCreateRequest, FolderInfo
from app.services import folder_service
from fastapi import APIRouter, HTTPException

router = APIRouter()
logger = setup_logging()


@router.post(
    "/folder",
    operation_id="create_image_folder",
    summary="画像フォルダの作成とサムネイル取得",
)
async def register_folder(request: FolderCreateRequest):
    try:
        folder_service.create_image_folder(
            request.folder_name,
            request.image_ids,
            request.description,
        )
        return {"message": "フォルダを作成しました"}
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
    "/folder/{folder_id}/order",
    summary="フォルダ内の画像順序を更新",
    operation_id="update_folder_order",
)
async def update_folder_order(folder_id: int, image_ids: list[int]):
    try:
        folder_service.update_folder_order(
            folder_id,
            image_ids,
        )
        return {"message": "順番を更新しました"}
    except Exception:
        logger.exception("❌ フォルダ順序更新エラー")
        raise HTTPException(status_code=500, detail="順番の更新に失敗しました")


@router.put(
    "/folder/{folder_id}/add_images",
    summary="既存のフォルダに画像を追加",
    operation_id="add_images_to_folder",
)
async def add_images_to_folder(folder_id: int, image_ids: list[int]):
    try:
        folder_service.add_images_to_folder(folder_id, image_ids)
        return {"message": "画像をフォルダに追加しました"}
    except Exception:
        logger.exception("❌ フォルダへの画像追加エラー")
        raise HTTPException(status_code=500, detail="画像の追加に失敗しました")
