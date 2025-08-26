import sys
from logging import INFO, FileHandler, Formatter, StreamHandler, getLogger


def setup_logging():
    """
    ロギングの設定を行う関数。

    ローカルファイル（main.log）および標準出力（コンソール）にログを出力するように設定します。
    既にハンドラが追加されている場合は重複して追加しないように制御されます。

    Returns:
        Logger: 設定済みのロガーインスタンス
    """
    # ロガー取得
    logger = getLogger(__name__)
    logger.setLevel(INFO)

    # 重複ハンドラ追加防止
    if not logger.handlers:
        formatter = Formatter("%(asctime)s - %(levelname)s - %(message)s")
        file_handler = FileHandler("main.log", encoding="utf-8")
        file_handler.setFormatter(formatter)
        stream_handler = StreamHandler(sys.stdout)
        stream_handler.setFormatter(formatter)

        logger.addHandler(file_handler)
        logger.addHandler(stream_handler)

    return logger
