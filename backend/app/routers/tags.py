from app.core.logger import setup_logging
from app.schemas.tag import Tag
from app.services import tag_service
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()
logger = setup_logging()


@router.get(
    "/tags/list",
    response_model=list[Tag],
    operation_id="fetch_translated_tags",
    description="""
翻訳済みのタグ一覧を取得するエンドポイント。

- 指定した言語（例: `"ja"` や `"en"`）に対応したタグを返します。
- 使用用途：多言語対応のフロントエンド表示など。

### クエリパラメータ:
- `language` (str): 翻訳対象の言語コード（デフォルト: `"ja"`）

### レスポンス:
- `200 OK`: 成功時に翻訳済みタグの配列を返します
- `404 Not Found`: タグが存在しない場合
- `500 Internal Server Error`: サーバ内部でエラーが発生した場合
""",
)
async def fetch_translated_tags(
    language: str = Query("ja", description="翻訳対象の言語コード（例: 'ja', 'en'）"),
) -> list[Tag]:
    try:
        tags = tag_service.fetch_translated_tags(language)
        return tags
    except ValueError as ve:
        logger.warning(f"タグが存在しません: {ve}")
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"タグ取得中に予期しないエラーが発生しました: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="タグの取得に失敗しました。")
