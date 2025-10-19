from app.core.logger import setup_logging
from app.schemas.folder import FolderCreateRequest, FolderInfo
from app.schemas.image import ThumbnailImage
from app.services import folder_service
from fastapi import APIRouter, HTTPException

router = APIRouter()
logger = setup_logging()


@router.get(
    "/folder",
    response_model=list[FolderInfo],
    operation_id="fetch_all_folders",
    summary="全フォルダ情報を取得",
)
async def fetch_all_folders(include_sensitive: bool = False):
    try:
        return folder_service.fetch_all_folders(include_sensitive)
    except Exception:
        logger.exception("❌ フォルダ情報取得中にエラーが発生しました")
        raise HTTPException(status_code=500, detail="フォルダ取得に失敗しました")


@router.get(
    "/folder/{folder_id}/similar_chain",
    response_model=list[ThumbnailImage],
    summary="フォルダ内を類似度チェーンで並べ替えて返却",
    operation_id="chain_similar_images_in_folder",
)
async def chain_similar_images_in_folder(
    folder_id: int, seed_image_id: int, include_sensitive: bool = True
):
    try:
        return folder_service.sort_images_by_chained_similarity(
            folder_id=folder_id,
            seed_image_id=seed_image_id,
            include_sensitive=include_sensitive,
        )
    except Exception:
        logger.exception("フォルダ内類似チェーン取得エラー")
        raise HTTPException(status_code=500, detail="類似チェーンの取得に失敗しました")


@router.post(
    "/folder",
    operation_id="create_image_folder",
    response_model=int,
    summary="画像フォルダの作成とサムネイル取得",
)
async def register_folder(request: FolderCreateRequest):
    try:
        return folder_service.create_image_folder(
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


@router.put(
    "/folder/{folder_id}/remove_images",
    summary="既存のフォルダから画像を省く",
    operation_id="remove_images_from_folder",
)
async def remove_images_from_folder(folder_id: int, image_ids: list[int]):
    try:
        folder_service.remove_images_from_folder(folder_id, image_ids)
        return {"message": "画像をフォルダから省きました"}
    except Exception:
        logger.exception("❌ フォルダから画像省くエラー")
        raise HTTPException(status_code=500, detail="画像の省きに失敗しました")


@router.put(
    "/folder/{folder_id}/rename",
    summary="フォルダ名を変更",
    operation_id="rename_folder",
)
async def rename_folder(folder_id: int, new_name: str):
    try:
        folder_service.rename_folder(
            folder_id=folder_id,
            new_name=new_name,
        )
        return {"message": "フォルダ名を変更しました"}
    except ValueError as ve:
        logger.warning(f"📛 フォルダ名変更バリデーションエラー: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception(f"❌ フォルダ名変更中に例外発生: {e}")
        raise HTTPException(status_code=500, detail="フォルダ名の変更に失敗しました")


@router.delete(
    "/folder/{folder_id}",
    summary="フォルダ削除",
    operation_id="delete_folder",
)
async def delete_folder(folder_id: int):
    try:
        folder_service.delete_folder(folder_id)
        return {"message": "フォルダを削除しました"}
    except ValueError as ve:
        logger.warning(f"📛 フォルダ削除バリデーションエラー: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception(f"❌ フォルダ削除中に例外発生: {e}")
        raise HTTPException(status_code=500, detail="フォルダの削除に失敗しました")
