import asyncio

from app.db.models import Tag, TagTranslation
from app.db.session import get_session
from googletrans import Translator
from sqlalchemy.orm import Session


class TagTranslator:
    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds

    def __init__(self):
        self.translator = Translator()

    async def translate_all_tags(self):
        with get_session() as session:
            tags = self._fetch_untagged_en(session)

            if not tags:
                print("✅ 翻訳対象のタグはありません。")
                return

            for tag in tags:
                try:
                    translated = await self.safe_translate(
                        self._preprocess_tag_for_translation(tag.name)
                    )
                    self._save_translation(session, tag.id, translated)
                    print(f"🈶 '{tag.name}' -> '{translated}'")
                except Exception as e:
                    print(f"❌ '{tag.name}' の翻訳に失敗: {e}")

            session.commit()

    def _fetch_untagged_en(self, session: Session) -> list[Tag]:
        return (
            session.query(Tag)
            .outerjoin(TagTranslation, Tag.id == TagTranslation.tag_id)
            .filter(TagTranslation.translated_name.is_(None))
            .all()
        )

    def _save_translation(self, session: Session, tag_id: int, translated: str):
        translation = TagTranslation(
            tag_id=tag_id, language="ja", translated_name=translated, note="googletrans"
        )
        session.add(translation)

    async def safe_translate(self, text: str, src: str = "en", dest: str = "ja") -> str:
        for attempt in range(self.MAX_RETRIES):
            try:
                result = await self.translator.translate(text, src=src, dest=dest)
                if result and result.text:
                    return self._clean_translation(result.text)
                raise ValueError("Empty result")
            except Exception as e:
                if attempt < self.MAX_RETRIES - 1:
                    await asyncio.sleep(self.RETRY_DELAY)
                    print(f"🔁 Retry {attempt + 1}: '{text}' due to {e}")
                else:
                    raise RuntimeError(f"Failed to translate '{text}': {e}")

    @staticmethod
    def _clean_translation(text: str) -> str:
        return (
            text.replace("\\", "")
            .replace("「", "(")
            .replace("」", ")")
            .replace("（", "(")
            .replace("）", ")")
        )

    def _preprocess_tag_for_translation(self, tag: str) -> str:
        # アンダースコアをスペースに
        return tag.replace("_", " ")


if __name__ == "__main__":
    translator = TagTranslator()
    asyncio.run(translator.translate_all_tags())
