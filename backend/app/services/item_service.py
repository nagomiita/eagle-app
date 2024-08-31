import requests
import logging
from pathlib import Path
from urllib.parse import unquote
import base64
from app.utils.image_utils import try_image_formats, encode_image
from app.config import EAGLE_API_BASE_URL

logger = logging.getLogger(__name__)

async def get_items(limit, offset, orderBy, keyword, ext, tags, folders):
    url = f"{EAGLE_API_BASE_URL}/item/list"
    params = {
        "limit": limit,
        "offset": offset,
        "orderBy": orderBy,
        "keyword": keyword,
        "ext": ext,
        "tags": tags,
        "folders": folders
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        items = response.json()["data"]
        thumbnails = []
        
        for item in items:
            thumbnail = await get_thumbnail(item['id'])
            thumbnails.append(thumbnail)
        
        return thumbnails
    except requests.exceptions.Timeout:
        logger.error("Request to fetch items timed out")
        raise TimeoutError("Request to fetch items timed out")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch items: {str(e)}")
        raise Exception(f"Failed to fetch items: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error occurred: {str(e)}")
        raise Exception("An unexpected error occurred")

async def get_thumbnail(item_id):
    try:
        thumbnail_url = f"{EAGLE_API_BASE_URL}/item/thumbnail?id={item_id}"
        thumbnail_response = requests.get(thumbnail_url, timeout=100)
        thumbnail_response.raise_for_status()
        thumbnail_path = thumbnail_response.json()["data"]
        
        decoded_path = unquote(thumbnail_path)
        unicode_path = Path(decoded_path)

        if unicode_path.exists() and unicode_path.suffix.lower() in ['.png', '.jpg', '.jpeg']:
            with unicode_path.open('rb') as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode()
            
            image_format = "png" if unicode_path.suffix.lower() == '.png' else "jpeg"
            return {
                "id": item_id,
                "thumbnail": f"data:image/{image_format};base64,{encoded_string}"
            }
        else:
            logger.warning(f"Thumbnail not found or unsupported format: {unicode_path}")
            return {
                "id": item_id,
                "thumbnail": None,
                "error": "Thumbnail not found or unsupported format"
            }
    except Exception as e:
        logger.error(f"Error processing thumbnail for item {item_id}: {str(e)}")
        return {
            "id": item_id,
            "thumbnail": None,
            "error": f"Error processing thumbnail: {str(e)}"
        }

async def get_original_image(id):
    try:
        thumbnail_url = f"{EAGLE_API_BASE_URL}/item/thumbnail?id={id}"
        thumbnail_response = requests.get(thumbnail_url, timeout=10)
        thumbnail_response.raise_for_status()
        thumbnail_path = thumbnail_response.json()["data"]

        original_image_path = str(thumbnail_path).replace("_thumbnail", "")
        unicode_path = Path(unquote(original_image_path))

        found_path = try_image_formats(unicode_path)
        if not found_path:
            raise FileNotFoundError(f"Original image not found: {unicode_path}")

        if found_path.suffix.lower() not in ['.png', '.jpg', '.jpeg', '.heic']:
            raise ValueError(f"Unsupported image format: {found_path.suffix}")

        image_format, encoded_string = encode_image(found_path)
        
        return {
            "status": "success",
            "data": [{
                "id": id,
                "image": f"data:image/{image_format};base64,{encoded_string}"
            }]
        }

    except requests.RequestException as e:
        logger.error(f"Failed to fetch thumbnail info: {str(e)}")
        raise Exception("Failed to fetch thumbnail info")

    except (FileNotFoundError, ValueError) as e:
        raise

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise Exception("An unexpected error occurred")