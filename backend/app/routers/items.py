from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
from app.services import item_service

router = APIRouter()

@router.get("/api/item/list")
async def get_items(
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    orderBy: Optional[str] = Query(None, regex="^-?(CREATEDATE|FILESIZE|NAME|RESOLUTION)$"),
    keyword: Optional[str] = None,
    ext: Optional[str] = None,
    tags: Optional[str] = None,
    folders: Optional[str] = None
):
    try:
        items = await item_service.get_items(limit, offset, orderBy, keyword, ext, tags, folders)
        return {"status": "success", "data": items}
    except TimeoutError:
        raise HTTPException(status_code=504, detail="Request to fetch items timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/item/original")
async def get_original_image(id: str):
    try:
        result = await item_service.get_original_image(id)
        return JSONResponse(result)
    except FileNotFoundError as e:
        return JSONResponse({
            "status": "error",
            "data": [{
                "id": id,
                "image": None,
                "error": "Original image not found"
            }]
        }, status_code=404)
    except ValueError as e:
        return JSONResponse({
            "status": "error",
            "data": [{
                "id": id,
                "image": None,
                "error": "Unsupported image format"
            }]
        }, status_code=400)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))