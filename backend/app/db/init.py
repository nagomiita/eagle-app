from app.db.engine import engine

# def initialize_database():
#     print("📦 初期化処理開始: データベース作成")
#     Base.metadata.create_all(engine)
#     seed_categories_and_tags()
#     print("イラストのセットアップ")


def dispose_engine():
    print("🧹 Disposing SQLAlchemy engine...")
    engine.dispose()
