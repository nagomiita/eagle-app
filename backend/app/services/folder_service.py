import requests
from app.models.schemas import FolderInfo
from app.utils.image_utils import encode_image
from pathlib import Path
from urllib.parse import unquote
import re
from app.config import EAGLE_API_BASE_URL

def get_folders():
    url = f"{EAGLE_API_BASE_URL}/folder/list"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    if data["status"] == "success" and data["data"]:
        return [extract_folder_info(folder) for folder in data["data"]]
    else:
        raise ValueError("Invalid response from server")

def extract_folder_info(folder):
    cover_path = None
    folder_image = ("","")
    if folder.get("covers"):
        match = re.search(r'src="file:///([^"]+)"', folder["covers"][0])
        if match:
            cover_path = match.group(1)
            unicode_path = Path(unquote(cover_path))
            folder_image = encode_image(unicode_path)
    
    children = [extract_folder_info(child) for child in folder.get("children", [])]
    
    return FolderInfo(
        id=folder["id"],
        name=folder["name"],
        children=children,
        parent=folder.get("parent"),
        folder_image=folder_image
    )