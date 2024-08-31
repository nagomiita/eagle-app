from pathlib import Path
from pillow_heif import register_heif_opener
from PIL import Image
import io
import base64

register_heif_opener()

def try_image_formats(path: Path):
    extensions = ['.png', '.jpg', '.jpeg', '.heic']
    for ext in extensions:
        test_path = path.with_suffix(ext)
        if test_path.exists():
            return test_path
    return None

def encode_image(image_path: Path):
    if image_path.suffix.lower() == '.heic':
        # HEIC ファイルを PNG に変換
        with Image.open(image_path) as img:
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            encoded_string = base64.b64encode(buffer.getvalue()).decode()
            return "png", encoded_string
    else:
        # その他のフォーマットはそのまま読み込む
        with image_path.open('rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode()
        image_format = "png" if image_path.suffix.lower() == '.png' else "jpeg"
        return image_format, encoded_string