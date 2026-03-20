from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_customer
from app.core.config import settings
from app.core.database import get_db
from app.models import Customer, Order
from app.models.enums import PaymentStatus
from app.schemas.payments import DuitkuCreateRequest
from app.services.commerce import apply_duitku_callback, create_duitku_payment

router = APIRouter()


@router.post("/customer/payments/duitku/create")
def create_duitku_transaction(payload: DuitkuCreateRequest, db: Session = Depends(get_db)) -> dict:
    order = db.scalar(select(Order).where(Order.id == payload.order_id))
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order tidak ditemukan")
    if order.payment_status != PaymentStatus.UNPAID:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order tidak lagi menunggu pembayaran")
    payment = create_duitku_payment(db, order, str(payload.callback_url), str(payload.return_url))
    return {
        "reference": payment.payment_reference,
        "payment_url": f"https://sandbox.duitku.com/topup/topupdirectv2.aspx?ref={payment.payment_reference}",
        "expiry": order.auto_cancel_at,
        "request_payload": payment.settlement_payload,
        "mode": "server-stub-until-merchant-credentials-enabled",
        "merchant_code": settings.duitku_merchant_code,
    }


@router.post("/customer/payments/duitku/create/me")
def create_duitku_transaction_for_authenticated_order(
    payload: DuitkuCreateRequest,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    order = db.scalar(select(Order).where(Order.id == payload.order_id).where(Order.customer_id == current_customer.id))
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order tidak ditemukan untuk akun ini")
    if order.payment_status != PaymentStatus.UNPAID:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order tidak lagi menunggu pembayaran")
    payment_method = str(order.pricing_snapshot.get("payment_method", "")).lower()
    if payment_method != "duitku-va":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order ini tidak memakai pembayaran Duitku")
    payment = create_duitku_payment(db, order, str(payload.callback_url), str(payload.return_url))
    return {
        "reference": payment.payment_reference,
        "payment_url": f"https://sandbox.duitku.com/topup/topupdirectv2.aspx?ref={payment.payment_reference}",
        "expiry": order.auto_cancel_at,
        "request_payload": payment.settlement_payload,
        "mode": "server-stub-until-merchant-credentials-enabled",
        "merchant_code": settings.duitku_merchant_code,
    }


@router.post("/payments/duitku/callback")
async def duitku_callback(request: Request, db: Session = Depends(get_db)) -> dict:
    form = await request.form()
    payment = apply_duitku_callback(db, {key: value for key, value in form.items()})
    return {"status": "ok", "payment_reference": payment.payment_reference, "payment_status": payment.status.value}
