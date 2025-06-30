from app.models.schemas import Tags
from app.services import tag_service
from fastapi import APIRouter

router = APIRouter()


@router.get("/api/tags/list", response_model=list[Tags], operation_id="get_tags")
async def get_tags() -> list[Tags]:
    tags = tag_service.get_tags()
    return tags
