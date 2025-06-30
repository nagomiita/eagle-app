import time
from contextlib import contextmanager
from logging import CRITICAL, INFO, Formatter, StreamHandler, getLogger

# パフォーマンス測定用のロガー設定
perf_logger = getLogger("query_performance")
perf_logger.setLevel(INFO)
if not perf_logger.handlers:
    handler = StreamHandler()
    formatter = Formatter("%(asctime)s - PERF - %(message)s")
    handler.setFormatter(formatter)
    perf_logger.addHandler(handler)


# パフォーマンス測定デコレータ
def measure_time(func_name: str = None, log_threshold: float = 0.001):
    """
    実行時間を測定するデコレータ

    Args:
        func_name: ログに表示する関数名（Noneの場合は実際の関数名）
        log_threshold: この閾値（秒）を超えた場合のみログ出力
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            name = func_name or func.__name__
            start_time = time.perf_counter()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                elapsed = time.perf_counter() - start_time
                if elapsed >= log_threshold:
                    perf_logger.info(f"{name}: {elapsed:.4f}s")
                else:
                    perf_logger.debug(f"{name}: {elapsed:.4f}s")

        return wrapper

    return decorator


@contextmanager
def measure_query_time(query_name: str, log_threshold: float = 0.001):
    """
    クエリ実行時間を測定するコンテキストマネージャ

    Args:
        query_name: クエリの名前
        log_threshold: この閾値（秒）を超えた場合のみログ出力
    """
    start_time = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start_time
        if elapsed >= log_threshold:
            perf_logger.info(f"QUERY [{query_name}]: {elapsed:.4f}s")
        else:
            perf_logger.debug(f"QUERY [{query_name}]: {elapsed:.4f}s")


# ---------------------------- Performance Report Helper ----------------------------


def get_performance_summary():
    """パフォーマンス測定の簡易レポートを取得"""
    handler = perf_logger.handlers[0]
    if hasattr(handler, "stream") and hasattr(handler.stream, "getvalue"):
        return handler.stream.getvalue()
    return "Performance logs are being written to console"


def enable_performance_logging(level=INFO):
    """パフォーマンスロギングを有効化"""
    perf_logger.setLevel(level)


def disable_performance_logging():
    """パフォーマンスロギングを無効化"""
    perf_logger.setLevel(CRITICAL)
