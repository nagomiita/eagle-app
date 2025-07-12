from app.core.logger import setup_logging
from app.schemas.tag import Tag, TagFlagUpdate
from app.services import tag_service
from fastapi import APIRouter, Body, HTTPException, Path, Query

router = APIRouter()
logger = setup_logging()


@router.get(
    "/tags",
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


@router.patch(
    "/tags/{tag_id}/toggle_flag",
    response_model=Tag,
    operation_id="toggle_tag_flag",
    description="""
タグのお気に入りまたはセンシティブフラグをオン/オフします。

### パスパラメータ:
- `tag_id` (int): フラグを変更する対象のタグID

### リクエストボディ:
- `flag` (str): `"favorite"` もしくは `"sensitive"`
- `value` (bool): `true` でオン、`false` でオフ

### レスポンス:
- `200 OK`: 更新されたタグ情報
- `400 Bad Request`: 不正なフラグ指定
- `404 Not Found`: 指定IDのタグが存在しない
""",
)
async def toggle_tag_flag(
    tag_id: int = Path(..., description="対象のタグID"),
    payload: TagFlagUpdate = Body(...),
) -> Tag:
    try:
        if payload.flag not in {"favorite", "sensitive"}:
            raise HTTPException(
                status_code=400,
                detail="flagは 'favorite' または 'sensitive' のみ指定できます。",
            )

        updated_tag = tag_service.toggle_tag_flag(tag_id, payload.flag, payload.value)
        if not updated_tag:
            raise HTTPException(
                status_code=404, detail="指定されたタグが見つかりません。"
            )
        return updated_tag

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"タグのフラグ更新中にエラー: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="タグの更新に失敗しました。")
