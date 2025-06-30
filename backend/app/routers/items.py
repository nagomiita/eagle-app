from app.schemas.item import ItemListResponse, OriginalImageResponse
from app.services import item_service
from fastapi import APIRouter

router = APIRouter()


@router.get("/api/item/list", response_model=ItemListResponse)
async def get_items(
    include_sensitive: bool = False,
    favorites_only: bool = False,
    selected_tag: str | None = None,
):
    items = item_service.get_items(include_sensitive, favorites_only, selected_tag)
    return ItemListResponse(status="success", data=items)


@router.get("/api/item/original", response_model=OriginalImageResponse)
async def get_original_image(id: str):
    result = item_service.get_original_image(id)
    return OriginalImageResponse(data=result)
