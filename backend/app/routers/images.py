from app.schemas.image import OriginalImage, ThumbnailImage
from app.services import image_service
from fastapi import APIRouter

router = APIRouter()


@router.get(
    "/image/thumbnails",
    response_model=list[ThumbnailImage],
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
    return thumnail_images


@router.get(
    "/image/original",
    response_model=OriginalImage,
    operation_id="fetch_original_image",
)
async def fetch_original_image(id: str):
    original_image = image_service.fetch_original_image(id)
    return original_image
