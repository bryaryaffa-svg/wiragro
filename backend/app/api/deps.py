from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models import Customer


def get_current_customer(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Customer:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token customer wajib ada")

    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if payload.get("type") != "customer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token customer tidak valid")

    customer = db.get(Customer, payload.get("sub"))
    if customer is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Customer tidak ditemukan")

    return customer
