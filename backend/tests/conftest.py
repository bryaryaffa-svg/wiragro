from __future__ import annotations

import os
from pathlib import Path

os.environ.setdefault("DATABASE_URL", "sqlite:///./tests-kios-bootstrap.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-kios-0123456789abcdef")
os.environ.setdefault("APP_AUTO_SEED_DEMO", "false")
os.environ.setdefault("APP_DEBUG", "true")
os.environ.setdefault("SIGE_SYNC_BASE_URL", "")
os.environ.setdefault("SIGE_SYNC_TOKEN", "")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import get_db
from app.main import app
from app.models import Base
from app.services.commerce import seed_demo_data


@pytest.fixture()
def test_context(tmp_path: Path):
    db_path = tmp_path / "integration.db"
    engine = create_engine(
        f"sqlite:///{db_path.as_posix()}",
        connect_args={"check_same_thread": False},
        future=True,
    )
    testing_session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    with testing_session_local() as db:
        seed_demo_data(db)

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield {
            "client": client,
            "session_factory": testing_session_local,
        }

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
