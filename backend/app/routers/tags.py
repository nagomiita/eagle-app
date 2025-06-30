from app.models.schemas import Tags
from app.services import tag_service
from fastapi import APIRouter

router = APIRouter()


@router.get(
    "/api/tags/list", response_model=list[Tags], operation_id="fetch_translated_tags"
)
async def fetch_translated_tags() -> list[Tags]:
    tags = tag_service.fetch_translated_tags()
    return tags
