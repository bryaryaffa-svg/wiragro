from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ContentPageType, PaymentMethodType, PriceType, ProductType, PromotionStatus, PromotionType


class Brand(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "brands"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))


class Store(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "stores"

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    province: Mapped[str] = mapped_column(String(100), default="Jawa Timur")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    brand: Mapped[Brand] = relationship()


class Category(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("store_id", "slug", name="uq_categories_store_slug"),)

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    parent_id: Mapped[str | None] = mapped_column(ForeignKey("categories.id"), nullable=True, index=True)
    source_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)
    name: Mapped[str] = mapped_column(String(120), index=True)
    slug: Mapped[str] = mapped_column(String(140))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    seo_title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(255), nullable=True)


class Product(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (
        UniqueConstraint("store_id", "sku", name="uq_products_store_sku"),
        UniqueConstraint("store_id", "slug", name="uq_products_store_slug"),
    )

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("categories.id"), index=True)
    source_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)
    sku: Mapped[str] = mapped_column(String(60), index=True)
    slug: Mapped[str] = mapped_column(String(160))
    name: Mapped[str] = mapped_column(String(160), index=True)
    summary: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    product_type: Mapped[ProductType] = mapped_column(Enum(ProductType))
    unit: Mapped[str] = mapped_column(String(20), default="pcs")
    weight_grams: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    min_qty: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_new_arrival: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_best_seller: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    seo_title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_keywords: Mapped[str | None] = mapped_column(String(255), nullable=True)

    category: Mapped[Category] = relationship()


class ProductImage(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "product_images"

    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    image_url: Mapped[str] = mapped_column(String(500))
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class ProductVideo(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "product_videos"

    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    video_url: Mapped[str] = mapped_column(String(500))
    platform: Mapped[str] = mapped_column(String(30), default="youtube")
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class ProductPrice(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "product_prices"

    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    source_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)
    price_type: Mapped[PriceType] = mapped_column(Enum(PriceType))
    member_level: Mapped[str | None] = mapped_column(String(30), nullable=True)
    min_qty: Mapped[int] = mapped_column(Integer, default=1)
    currency_code: Mapped[str] = mapped_column(String(3), default="IDR")
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    compare_at_amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


class Promotion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "promotions"
    __table_args__ = (UniqueConstraint("store_id", "promotion_code", name="uq_promotions_store_code"),)

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    source_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)
    promotion_code: Mapped[str] = mapped_column(String(60))
    name: Mapped[str] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    promotion_type: Mapped[PromotionType] = mapped_column(Enum(PromotionType))
    rule_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    allow_store_override: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by_center: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[PromotionStatus] = mapped_column(Enum(PromotionStatus), default=PromotionStatus.DRAFT)


class Banner(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "banners"

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    source_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(160))
    subtitle: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    mobile_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    target_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


class ContentPage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "content_pages"
    __table_args__ = (UniqueConstraint("store_id", "page_type", "slug", name="uq_content_page_slug"),)

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    source_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)
    page_type: Mapped[ContentPageType] = mapped_column(Enum(ContentPageType))
    slug: Mapped[str] = mapped_column(String(160))
    title: Mapped[str] = mapped_column(String(160))
    excerpt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    body_html: Mapped[str] = mapped_column(Text)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    seo_title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_keywords: Mapped[str | None] = mapped_column(String(255), nullable=True)


class PaymentMethod(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "payment_methods"
    __table_args__ = (UniqueConstraint("store_id", "code", name="uq_payment_methods_store_code"),)

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    source_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)
    code: Mapped[str] = mapped_column(String(60))
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payment_type: Mapped[PaymentMethodType] = mapped_column(Enum(PaymentMethodType))
    provider_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    instructions_html: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    config_json: Mapped[dict] = mapped_column(JSON, default=dict)


class AppSetting(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "app_settings"
    __table_args__ = (UniqueConstraint("store_id", "setting_group", "setting_key", name="uq_app_setting_key"),)

    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"), index=True)
    setting_group: Mapped[str] = mapped_column(String(60))
    setting_key: Mapped[str] = mapped_column(String(80))
    setting_value: Mapped[dict] = mapped_column(JSON, default=dict)
    source_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_version: Mapped[int] = mapped_column(Integer, default=1)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
