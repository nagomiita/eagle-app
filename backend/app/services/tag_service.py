from app.db.queries import tag
from app.schemas.tag import Tag


def fetch_translated_tags(language: str = "ja") -> list[Tag]:
    """
    指定された言語で翻訳されたタグ一覧を取得する

    Args:
        language (str): タグを翻訳する対象の言語。デフォルトは "ja"。

    Raises:
        RuntimeError: タグの取得中に予期しないエラーが発生した場合
        ValueError: タグ情報が取得できなかった場合

    Returns:
        list[Tag]: 翻訳されたタグのリスト
    """
    try:
        tags = tag.query_all_translated_tags(language)
    except Exception as e:
        raise RuntimeError(f"タグの取得に失敗しました: {e}") from e

    if not tags:
        raise ValueError("タグ情報が存在しません")

    return [
        Tag(
            tag_id=tag_id,
            tag_name=translated_name or default_name,
            category=category,
            genre=genre,
        )
        for tag_id, default_name, translated_name, category, genre in tags
    ]
