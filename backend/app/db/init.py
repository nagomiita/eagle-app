from pathlib import Path

from app.db.engine import engine
from app.db.models import Base
from app.settings import settings


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
    
    # TODO: seed_categories_and_tags() when ready
    # seed_categories_and_tags()
    print("イラストのセットアップ")


def dispose_engine():
    print("🧹 Disposing SQLAlchemy engine...")
    engine.dispose()
