from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import FulfillmentStatus, InvoiceType, OrderStatus, PaymentStatus, ShipmentStatus, SyncDirection, SyncStatus


class Order(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "orders"
    __table_args__ = (
        UniqueConstraint("store_id", "order_number", name="uq_orders_store_number"),
        UniqueConstraint("idempotency_key", name="uq_orders_idempotency"),
    )

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"), nullable=True, index=True)
    cart_id: Mapped[str | None] = mapped_column(ForeignKey("carts.id"), nullable=True, index=True)
    order_number: Mapped[str] = mapped_column(String(60), index=True)
    external_order_number: Mapped[str | None] = mapped_column(String(60), nullable=True)
    channel: Mapped[str] = mapped_column(String(30), default="WEB")
    checkout_type: Mapped[str] = mapped_column(String(30), default="GUEST")
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.MENUNGGU_PEMBAYARAN, index=True)
    payment_status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.UNPAID, index=True)
    fulfillment_status: Mapped[FulfillmentStatus] = mapped_column(
        Enum(FulfillmentStatus),
        default=FulfillmentStatus.PENDING,
        index=True,
    )
    customer_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    address_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    pricing_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    discount_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    shipping_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    grand_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    payment_due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    auto_cancel_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    source_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)
    sync_status: Mapped[SyncStatus] = mapped_column(Enum(SyncStatus), default=SyncStatus.PENDING, index=True)
    idempotency_key: Mapped[str] = mapped_column(String(120))


class OrderItem(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "order_items"

    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    product_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    qty: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    discount_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    line_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class Payment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "payments"

    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), index=True)
    payment_reference: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    gateway_code: Mapped[str] = mapped_column(String(30), default="duitku")
    gateway_transaction_id: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    gateway_session_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    method_code: Mapped[str] = mapped_column(String(50), default="duitku-va")
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.PENDING, index=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    callback_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    callback_signature: Mapped[str | None] = mapped_column(String(255), nullable=True)
    settlement_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String(120), unique=True)


class Shipment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "shipments"

    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), index=True)
    shipment_number: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    delivery_method: Mapped[str] = mapped_column(String(30), default="PICKUP")
    courier_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    tracking_number: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    pickup_store_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[ShipmentStatus] = mapped_column(Enum(ShipmentStatus), default=ShipmentStatus.PENDING, index=True)
    shipped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    tracking_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class Invoice(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "invoices"

    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), index=True)
    invoice_number: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    invoice_type: Mapped[InvoiceType] = mapped_column(Enum(InvoiceType))
    document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    printed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class SyncLog(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "sync_logs"

    direction: Mapped[SyncDirection] = mapped_column(Enum(SyncDirection), index=True)
    entity_type: Mapped[str] = mapped_column(String(80), index=True)
    entity_id: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    store_id: Mapped[str | None] = mapped_column(ForeignKey("stores.id"), nullable=True, index=True)
    source_version: Mapped[int | None] = mapped_column(Integer, nullable=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(120), nullable=True, unique=True)
    status: Mapped[SyncStatus] = mapped_column(Enum(SyncStatus), default=SyncStatus.PENDING, index=True)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    payload_hash: Mapped[str | None] = mapped_column(String(120), nullable=True)
    payload_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
