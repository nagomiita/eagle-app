import base64
import hashlib
import io
from datetime import datetime
from multiprocessing import Pool, cpu_count
from pathlib import Path

from app.settings import IMAGE_DIR, THUMB_DIR
from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()

# Configuration defaults
SUPPORTED_FORMATS = {".png", ".jpg", ".jpeg", ".heic", ".gif", ".bmp", ".webp"}
THUMBNAIL_SIZE = (200, 200)
ENABLE_IMAGE_CACHE = True


def _process_and_save(args) -> tuple[Path, Path] | None:
    """画像をリサイズしてサムネイルを保存するマルチプロセス対象の関数"""
    img_path, thumbnail_size, thumb_dir = args
    try:
        with Image.open(img_path) as img:
            # 検証
            img.verify()  # ファイルが有効か確認

            # 再度開く（verify後は再オープンが必要）
            with Image.open(img_path) as img:
                img = img.convert("RGB")
                img.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)
                thumb_hash = hashlib.md5(
                    img_path.as_posix().encode("utf-8")
                ).hexdigest()
                thumb_path = thumb_dir / f"{thumb_hash}_thumbnail.png"
                thumb_dir.mkdir(exist_ok=True)
                img.save(thumb_path)
                return (img_path, thumb_path)
    except Exception as e:
        print(f"⚠ スキップ: {img_path} → {type(e).__name__}: {e}")
        return None  # 失敗時はNoneを返してスキップ


class ImageProcessor:
    """画像処理の基本機能を提供するクラス"""

    def __init__(self, thumbnail_size: tuple[int, int] = THUMBNAIL_SIZE):
        self.thumbnail_size = thumbnail_size

    def resize_image(
        self, img_path: Path, size: tuple[int, int], channel: str = "RGBA"
    ) -> Image.Image:
        """画像を指定サイズにリサイズしたPIL Imageを返す"""
        with Image.open(img_path) as img:
            img = img.convert(channel)
            img.thumbnail(size, Image.Resampling.LANCZOS)
            return img

    def create_thumbnail(self, image_path: Path, size: tuple[int, int]) -> Image.Image:
        """サムネイル画像を生成（GUI依存なし）"""
        img = self.resize_image(image_path, size)
        canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        x = (size[0] - img.width) // 2
        y = (size[1] - img.height) // 2
        canvas.paste(img, (x, y), img)
        return canvas

    def extract_captured_at(self, img_path: Path) -> datetime:
        """ファイルの作成日時を抽出してISO形式で返す"""
        ts = img_path.stat().st_birthtime
        return datetime.fromtimestamp(ts)


class ImageCache:
    """画像キャッシュを管理するクラス"""

    def __init__(self, enable_cache: bool = ENABLE_IMAGE_CACHE):
        self.enable_cache = enable_cache
        self._cache: dict = {}

    def _cache_key(self, image_path: Path, size: tuple[int, int]) -> str:
        """キャッシュキーを生成"""
        return f"{image_path}:{size}"

    def get_thumbnail(
        self,
        image_path: Path,
        size: tuple[int, int],
        processor: ImageProcessor,
    ) -> Image.Image:
        """サムネイル画像を取得（キャッシュ有効時はキャッシュから）"""
        if not self.enable_cache:
            return processor.create_thumbnail(image_path, size)

        cache_key = self._cache_key(image_path, size)
        if cache_key not in self._cache:
            self._cache[cache_key] = processor.create_thumbnail(image_path, size)
        return self._cache[cache_key]

    def clear_cache(self):
        """キャッシュをクリア"""
        self._cache.clear()


class ImageFileManager:
    """画像ファイルの管理を行うクラス"""

    def __init__(self, image_dir: Path = IMAGE_DIR, thumb_dir: Path = THUMB_DIR):
        self.image_dir = image_dir
        self.thumb_dir = thumb_dir
        self.supported_formats = SUPPORTED_FORMATS

    def _hash_path(self, path: Path) -> str:
        """パスのハッシュを生成"""
        return hashlib.md5(path.as_posix().encode("utf-8")).hexdigest()

    def _is_valid_image(self, img_path: Path, registered: set[str]) -> bool:
        """画像がサポート形式で、未登録かどうかを判定"""
        return (
            img_path.suffix.lower() in self.supported_formats
            and "_thumbnail" not in img_path.stem
            and str(img_path) not in registered
        )

    def find_unregistered_images(self, registered: set[str]) -> list[Path]:
        """登録されていない画像のパスを探索"""
        unregistered: list[Path] = []
        for img_path in self.image_dir.rglob("*"):
            if img_path.is_symlink():
                for child_path in img_path.rglob("*"):
                    if self._is_valid_image(child_path, registered):
                        unregistered.append(child_path)
            elif self._is_valid_image(img_path, registered):
                unregistered.append(img_path)
        return unregistered

    def _save_thumbnail(self, img: Image.Image, img_path: Path) -> Path:
        """PIL Imageをサムネイルパスに保存"""
        self.thumb_dir.mkdir(exist_ok=True)
        thumb_hash = self._hash_path(img_path)
        thumb_path = self.thumb_dir / f"{thumb_hash}_thumbnail.png"
        img.save(thumb_path)
        return thumb_path

    def generate_thumbnails(
        self, image_paths: list[Path], processor: ImageProcessor
    ) -> list[tuple[Path, Path]]:
        """画像をサムネイルとして並列リサイズ＆保存"""
        args = [
            (path, processor.thumbnail_size, self.thumb_dir) for path in image_paths
        ]
        with Pool(processes=cpu_count()) as pool:
            results = list(pool.imap(_process_and_save, args))
        return [r for r in results if r is not None]

    def delete_image_files(self, image_path: Path, thumbnail_path: Path) -> None:
        """画像とサムネイルのファイルを削除"""
        for path in [image_path, thumbnail_path]:
            try:
                if path.exists():
                    path.unlink()
            except Exception as e:
                print(f"[Error] ファイル削除失敗: {path} -> {e}")


class ImageManager:
    """画像管理の統合クラス"""

    def __init__(
        self,
        image_dir: Path = IMAGE_DIR,
        thumb_dir: Path = THUMB_DIR,
        thumbnail_size: tuple[int, int] = THUMBNAIL_SIZE,
        enable_cache: bool = ENABLE_IMAGE_CACHE,
    ):
        self.processor = ImageProcessor(thumbnail_size)
        self.cache = ImageCache(enable_cache=enable_cache)
        self.file_manager = ImageFileManager(image_dir, thumb_dir)

    def load_thumbnail(
        self, image_path: Path, size: tuple[int, int] = THUMBNAIL_SIZE
    ) -> Image.Image:
        """サムネイル画像を読み込み"""
        return self.cache.get_thumbnail(image_path, size, self.processor)

    def find_unregistered_images(self, registered: set[str]) -> list[Path]:
        """未登録画像を検索"""
        return self.file_manager.find_unregistered_images(registered)

    def generate_thumbnails(self, image_paths: list[Path]) -> list[tuple[Path, Path]]:
        """サムネイル生成"""
        return self.file_manager.generate_thumbnails(image_paths, self.processor)

    def extract_captured_at(self, img_path: Path) -> datetime:
        """画像のキャプチャ日時を抽出"""
        return self.processor.extract_captured_at(img_path)

    def delete_image_files(self, image_path: Path, thumbnail_path: Path) -> None:
        """画像ファイル削除"""
        self.file_manager.delete_image_files(image_path, thumbnail_path)

    def clear_cache(self):
        """キャッシュクリア"""
        self.cache.clear_cache()


def try_image_formats(path: Path):
    """複数の拡張子を試してファイルを探す"""
    extensions = [".png", ".jpg", ".jpeg", ".heic"]
    for ext in extensions:
        test_path = path.with_suffix(ext)
        if test_path.exists():
            return test_path
    return None


def encode_image(image_path: Path) -> tuple[str, str]:
    """画像をBase64エンコード"""
    if image_path.suffix.lower() == ".heic":
        # HEIC ファイルを PNG に変換
        with Image.open(image_path) as img:
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            encoded_string = base64.b64encode(buffer.getvalue()).decode()
            return "png", encoded_string
    else:
        # その他のフォーマットはそのまま読み込む
        with image_path.open("rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode()
        image_format = "png" if image_path.suffix.lower() == ".png" else "jpeg"
        return image_format, encoded_string


# グローバルインスタンス
image_manager = ImageManager()
