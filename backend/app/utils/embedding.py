import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def find_similar_image_ids(
    query_vector_blob: bytes,
    candidate_vector_blobs: list[tuple[int, bytes]],
    top_k: int = 30,
) -> list[int]:
    """
    クエリ画像に類似する画像IDを取得する。
    """
    query_vector = __load_vector_from_blob(query_vector_blob)

    candidate_vectors = [
        (image_id, __load_vector_from_blob(blob))
        for image_id, blob in candidate_vector_blobs
    ]

    return __search_top_similar_image_ids(query_vector, candidate_vectors, top_k=top_k)


def __load_vector_from_blob(blob: bytes) -> np.ndarray:
    return np.frombuffer(blob, dtype=np.float32)


def __search_top_similar_image_ids(
    query_vec: np.ndarray, db_vectors: list[tuple[int, np.ndarray]], top_k: int = 30
) -> list[int]:
    if query_vec is None or not db_vectors:
        return []

    ids, vecs = zip(*db_vectors)
    sims = cosine_similarity([query_vec], vecs)[0]
    sorted_indices = np.argsort(sims)[::-1]
    return [ids[i] for i in sorted_indices[:top_k]]
