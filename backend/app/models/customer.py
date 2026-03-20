from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import CartStatus


class Customer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "customers"

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    customer_code: Mapped[str] = mapped_column(String(50), index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    google_sub: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    auth_provider: Mapped[str] = mapped_column(String(30), default="guest")
    whatsapp_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_guest: Mapped[bool] = mapped_column(Boolean, default=True)
    member_tier: Mapped[str | None] = mapped_column(String(30), nullable=True)
    last_order_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    source_customer_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)


class CustomerAddress(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "customer_addresses"

    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    label: Mapped[str] = mapped_column(String(60))
    recipient_name: Mapped[str] = mapped_column(String(120))
    recipient_phone: Mapped[str] = mapped_column(String(30))
    address_line: Mapped[str] = mapped_column(Text)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    city: Mapped[str] = mapped_column(String(120))
    province: Mapped[str] = mapped_column(String(120))
    postal_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    latitude: Mapped[str | None] = mapped_column(String(30), nullable=True)
    longitude: Mapped[str | None] = mapped_column(String(30), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, index=True)


class Cart(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "carts"

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    customer_id: Mapped[str | None] = mapped_column(ForeignKey("customers.id"), nullable=True, index=True)
    guest_token: Mapped[str | None] = mapped_column(String(500), nullable=True, index=True)
    channel: Mapped[str] = mapped_column(String(30), default="WEB")
    status: Mapped[CartStatus] = mapped_column(Enum(CartStatus), default=CartStatus.ACTIVE, index=True)
    currency_code: Mapped[str] = mapped_column(String(3), default="IDR")
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    discount_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    grand_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class CartItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "cart_items"
    __table_args__ = (UniqueConstraint("cart_id", "product_id", name="uq_cart_item_product"),)

    cart_id: Mapped[str] = mapped_column(ForeignKey("carts.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    qty: Mapped[int] = mapped_column(Integer)
    price_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    discount_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    promotion_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)


class OtpChallenge(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "otp_challenges"

    phone: Mapped[str] = mapped_column(String(30), index=True)
    otp_code: Mapped[str] = mapped_column(String(10))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ResellerCredential(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reseller_credentials"
    __table_args__ = (
        UniqueConstraint("store_id", "username", name="uq_reseller_credentials_store_username"),
        UniqueConstraint("customer_id", name="uq_reseller_credentials_customer"),
    )

    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    username: Mapped[str] = mapped_column(String(60), index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    activated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    password_set_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    source_reseller_id: Mapped[str | None] = mapped_column(String(64), nullable=True)


class WishlistItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (UniqueConstraint("customer_id", "product_id", name="uq_wishlist_customer_product"),)

    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
