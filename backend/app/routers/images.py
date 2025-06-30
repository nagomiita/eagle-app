from app.schemas.item import ItemListResponse, OriginalImageResponse
from app.services import image_service
from fastapi import APIRouter

router = APIRouter()


@router.get(
    "/api/item/list",
    response_model=ItemListResponse,
    operation_id="fetch_filtered_thumnail_images",
)
async def fetch_filtered_thumnail_images(
    include_sensitive: bool = False,
    favorites_only: bool = False,
    selected_tag: str | None = None,
):
    thumnail_images = image_service.fetch_filtered_thumnail_images(
        include_sensitive, favorites_only, selected_tag
    )
    return ItemListResponse(status="success", data=thumnail_images)


@router.get(
    "/api/item/original",
    response_model=OriginalImageResponse,
    operation_id="fetch_original_image",
)
async def fetch_original_image(id: str):
    result = image_service.fetch_original_image(id)
    return OriginalImageResponse(data=result)
