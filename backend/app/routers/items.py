from app.schemas.item import ItemListResponse, OriginalImageResponse
from app.services import item_service
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/api/item/list", response_model=ItemListResponse)
async def get_items(
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    orderBy: str | None = Query(
        None, regex="^-?(CREATEDATE|FILESIZE|NAME|RESOLUTION)$"
    ),
    keyword: str | None = None,
    ext: str | None = None,
    tags: str | None = None,
    folders: str | None = None,
):
    items = await item_service.get_items(
        limit, offset, orderBy, keyword, ext, tags, folders
    )
    return ItemListResponse(status="success", data=items)


@router.get("/api/item/original", response_model=OriginalImageResponse)
async def get_original_image(id: str):
    result = item_service.get_original_image(id)
    return OriginalImageResponse(data=result)
