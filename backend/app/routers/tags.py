from fastapi import APIRouter, HTTPException
from app.services import tag_service
from app.models.schemas import TagsResponse

router = APIRouter()

@router.get("/api/tags/list", response_model=TagsResponse)
async def get_tags():
    try:
        tags = await tag_service.get_tags()
        return TagsResponse(**tags)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="JSON file not found")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")