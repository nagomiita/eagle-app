import json
import requests
from app.config import EAGLE_API_BASE_URL

async def get_tags():
    try:
        # Eagle APIからライブラリ情報を取得
        library_info_url = f"{EAGLE_API_BASE_URL}/library/info"
        response = requests.get(library_info_url)
        response.raise_for_status()
        library_data = response.json()

        if "data" not in library_data or "library" not in library_data["data"] or "path" not in library_data["data"]["library"]:
            raise ValueError("Invalid response from Eagle API: Missing library path")

        # tags.jsonファイルのパスを構築
        library_path = library_data["data"]["library"]["path"]
        tags_file_path = f"{library_path}\\tags.json"

        # tags.jsonファイルを読み込む
        with open(tags_file_path, "r", encoding="utf-8") as file:
            tags_data = json.load(file)

        # 必要なタグ情報を抽出
        return {
            "historyTags": tags_data.get("historyTags", []),
            "starredTags": tags_data.get("starredTags", [])
        }

    except requests.RequestException as e:
        raise ValueError(f"Failed to fetch library info from Eagle API: {str(e)}")
    except FileNotFoundError:
        raise FileNotFoundError(f"Tags file not found: {tags_file_path}")
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON format in tags file")
    except Exception as e:
        raise Exception(f"An unexpected error occurred: {str(e)}")