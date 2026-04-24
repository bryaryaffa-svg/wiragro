from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.commerce import build_sync_manifest, require_store
from app.services.sige_sync import is_sige_sync_configured, sync_storefront_from_sige

router = APIRouter()


@router.get("/cache-manifest")
def cache_manifest(
    store_code: str,
    since_version: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> dict:
    store = require_store(db, store_code)
    return build_sync_manifest(db, store, since_version)


@router.post("/pull-from-sige")
def pull_from_sige(
    store_code: str,
    force_full: bool = Query(default=False),
    db: Session = Depends(get_db),
) -> dict:
    result = sync_storefront_from_sige(db, store_code=store_code, force_full=force_full)
    db.commit()
    return {
        "configured": is_sige_sync_configured(),
        **result,
    }
