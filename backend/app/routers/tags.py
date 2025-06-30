from app.schemas.tag import Tag
from app.services import tag_service
from fastapi import APIRouter

router = APIRouter()


@router.get(
    "/tags/list", response_model=list[Tag], operation_id="fetch_translated_tags"
)
async def fetch_translated_tags() -> list[Tag]:
    tags = tag_service.fetch_translated_tags()
    return tags
