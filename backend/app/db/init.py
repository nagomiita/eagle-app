from pathlib import Path

from app.db.engine import engine
from app.db.models import Base
from app.db.queries.image import add_image_entries, get_registered_image_paths
from app.settings import settings
from app.utils.folder import image_link_manager
from app.utils.image import image_manager
from tqdm import tqdm


def initialize_database():
    """Initialize the database by creating all tables."""
    print("📦 初期化処理開始: データベース作成")

    # Ensure data directory exists
    db_dir = settings.db_path.parent
    db_dir.mkdir(parents=True, exist_ok=True)
    print(f"✓ Database directory created: {db_dir}")

    # Ensure image directory exists
    image_dir = Path(settings.image_dir)
    image_dir.mkdir(parents=True, exist_ok=True)
    print(f"✓ Image directory created: {image_dir}")

    # Create all tables
    Base.metadata.create_all(engine)
    print("✓ Database tables created successfully")

    print("🔍 未登録画像パスを取得中...")
    registered = get_registered_image_paths()
    if not registered:
        print("⚠️ 画像がまだ登録されていません。画像フォルダを選択してください。")
        selected_folder = image_link_manager.select_image_folder()
        if selected_folder:
            image_link_manager.create_symlink(selected_folder)
        else:
            print("❌ 画像フォルダが選択されませんでした。初期化を中止します。")
            return
    unregistered = image_manager.find_unregistered_images(registered)
    if not unregistered:
        print("✅ すでに全ての画像が登録されています。")
        return

    print("🖼 サムネイル画像の生成中...")
    image_paths = image_manager.generate_thumbnails(tqdm(unregistered))

    print(f"📥 {len(image_paths)} 件の画像をDBに登録中...")
    add_image_entries(tqdm(image_paths))

    print("\n✅ 初期化完了")

    # TODO: seed_categories_and_tags() when ready
    # seed_categories_and_tags()
    print("イラストのセットアップ")


def dispose_engine():
    print("🧹 Disposing SQLAlchemy engine...")
    engine.dispose()
