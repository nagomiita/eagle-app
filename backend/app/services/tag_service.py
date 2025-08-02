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
            is_sensitive=is_sensitive,
            is_favorite=is_favorite,
            usage_count=usage_count,
        )
        for tag_id, default_name, translated_name, category, genre, is_sensitive, is_favorite, usage_count in tags
    ]


def toggle_tag_flag(tag_id: int, flag: str, value: bool) -> Tag:
    """
    タグのお気に入りまたはセンシティブフラグをオン/オフする
    Args:
        tag_id (int): フラグを変更する対象のタグID
        flag (str): フラグの種類。'favorite' または 'sensitive'
        value (bool): フラグの値。True でオン、False でオフ
    Raises:
        ValueError: 無効なフラグ名が指定された場合
        RuntimeError: タグの更新中に予期しないエラーが発生した場合
    Returns:
        Tag: 更新されたタグ情報
    """
    if flag not in ["favorite", "sensitive"]:
        raise ValueError(
            "無効なフラグ名です。'favorite' または 'sensitive' を指定してください。"
        )

    try:
        updated_tag = tag.update_tag_flag(tag_id, flag, value)
    except Exception as e:
        raise RuntimeError(f"タグの更新に失敗しました: {e}") from e

    return Tag(**updated_tag)
