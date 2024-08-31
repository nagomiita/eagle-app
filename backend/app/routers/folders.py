from fastapi import APIRouter, HTTPException
from app.services import folder_service

router = APIRouter()

@router.get("/api/folder/list")
def fetch_folders():
    try:
        return folder_service.get_folders()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
