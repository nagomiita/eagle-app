from contextlib import contextmanager
from typing import Generator

from app.db.engine import engine
from sqlalchemy.orm import Session


@contextmanager
def get_session() -> Generator[Session, None, None]:
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()
