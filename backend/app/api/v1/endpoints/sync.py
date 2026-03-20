from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.commerce import build_sync_manifest, require_store

router = APIRouter()


@router.get("/cache-manifest")
def cache_manifest(
    store_code: str,
    since_version: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> dict:
    store = require_store(db, store_code)
    return build_sync_manifest(db, store, since_version)
