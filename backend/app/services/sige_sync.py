from __future__ import annotations

import hashlib
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any

import httpx
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import (
    AppSetting,
    Banner,
    Brand,
    Category,
    ContentPage,
    PaymentMethod,
    Product,
    ProductImage,
    ProductPrice,
    Store,
    SyncLog,
)
from app.models.enums import ContentPageType, PaymentMethodType, PriceType, ProductType, SyncDirection, SyncStatus
from app.services.commerce import slugify, utcnow


def is_sige_sync_configured() -> bool:
    return bool(settings.sige_sync_base_url.strip() and settings.sige_sync_token.strip())


def _payload_hash(payload: dict[str, Any]) -> str:
    return hashlib.sha256(str(payload).encode("utf-8")).hexdigest()


def _normalized_sige_base_url() -> str:
    return settings.sige_sync_base_url.rstrip("/")


def _parse_decimal(value: Any, *, fallback: Decimal = Decimal("0")) -> Decimal:
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return fallback


def _parse_datetime(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value))
    except ValueError:
        return None


def _build_summary(description: str | None, unit: str) -> str:
    if description and description.strip():
        trimmed = description.strip()
        return trimmed[:180]
    return f"Produk tersinkron dari SiGe Manajer ({unit})."


def _infer_product_type(category_name: str | None, product_name: str, description: str | None) -> ProductType:
    haystack = " ".join(
        part for part in [category_name or "", product_name, description or ""] if part
    ).lower()
    if "benih" in haystack or "seed" in haystack:
        return ProductType.SEED
    if "herbisida" in haystack:
        return ProductType.HERBICIDE
    if "nutrisi" in haystack or "pupuk" in haystack:
        return ProductType.NUTRITION
    return ProductType.TOOL


def _current_max_source_version(db: Session, store_id: str) -> int:
    values = [
        db.scalar(select(func.max(Category.source_version)).where(Category.store_id == store_id)),
        db.scalar(select(func.max(Product.source_version)).where(Product.store_id == store_id)),
        db.scalar(select(func.max(ProductPrice.source_version)).where(ProductPrice.store_id == store_id)),
        db.scalar(select(func.max(Banner.source_version)).where(Banner.store_id == store_id)),
        db.scalar(select(func.max(ContentPage.source_version)).where(ContentPage.store_id == store_id)),
        db.scalar(select(func.max(PaymentMethod.source_version)).where(PaymentMethod.store_id == store_id)),
        db.scalar(select(func.max(AppSetting.source_version)).where(AppSetting.store_id == store_id)),
    ]
    return max(int(value or 0) for value in values)


def _ensure_store(db: Session, store_code: str) -> Store:
    store = db.scalar(select(Store).where(Store.code == store_code))
    if store is not None:
        return store
    brand = db.scalar(select(Brand).where(Brand.code == settings.default_brand_code))
    if brand is None:
        brand = Brand(code=settings.default_brand_code, name=settings.default_brand_name)
        db.add(brand)
        db.flush()
    store = Store(
        brand_id=brand.id,
        code=store_code,
        name=settings.default_store_name,
        province="Jawa Timur",
        is_active=True,
    )
    db.add(store)
    db.flush()
    return store


def _get_last_sige_cursor(db: Session, store_id: str) -> str | None:
    row = db.scalar(
        select(SyncLog)
        .where(SyncLog.store_id == store_id)
        .where(SyncLog.entity_type == "sige-delta")
        .where(SyncLog.status == SyncStatus.SYNCED)
        .order_by(SyncLog.processed_at.desc(), SyncLog.created_at.desc())
    )
    if row and row.payload_json:
        cursor = row.payload_json.get("cursor")
        if isinstance(cursor, str) and cursor.strip():
            return cursor
    return None


def _ensure_fallback_category(db: Session, store: Store, *, next_version: int) -> tuple[Category, int]:
    row = db.scalar(
        select(Category)
        .where(Category.store_id == store.id)
        .where(Category.slug == "umum")
    )
    if row is None:
        row = Category(
            brand_id=store.brand_id,
            store_id=store.id,
            source_id="sige-category-general",
            source_version=next_version,
            name="Umum",
            slug="umum",
            description="Kategori fallback untuk produk yang belum dipetakan.",
            sort_order=999,
            is_active=True,
            seo_title="Umum",
            seo_description="Produk umum storefront.",
        )
        db.add(row)
    else:
        row.source_version = next_version
        row.is_active = True
    db.flush()
    return row, next_version + 1


def _fetch_sige_delta(cursor: str | None) -> dict[str, Any]:
    if not is_sige_sync_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Konfigurasi sync SiGe belum lengkap.",
        )

    headers = {"Authorization": f"Bearer {settings.sige_sync_token.strip()}"}
    params = {"target_code": settings.sige_sync_target_code.strip() or "SIDOMAKMUR_KIOS"}
    if cursor:
        params["since_cursor"] = cursor

    try:
        with httpx.Client(timeout=settings.sige_sync_timeout_seconds) as client:
            response = client.get(
                f"{_normalized_sige_base_url()}/api/v1/sync/download-delta",
                headers=headers,
                params=params,
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gagal menarik delta SiGe: HTTP {exc.response.status_code}",
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gagal menghubungi SiGe Manajer: {exc}",
        ) from exc

    if not isinstance(payload, dict):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Payload delta SiGe tidak valid")
    return payload


def _sync_categories(
    db: Session,
    store: Store,
    items: list[dict[str, Any]],
    *,
    next_version: int,
) -> tuple[dict[str, Category], int]:
    category_by_source_id: dict[str, Category] = {}
    pending_parent_links: list[tuple[Category, str | None]] = []

    for item in items:
        source_id = str(item.get("id") or "").strip()
        if not source_id:
            continue
        row = db.scalar(
            select(Category)
            .where(Category.store_id == store.id)
            .where(Category.source_id == source_id)
        )
        if row is None:
            row = Category(
                brand_id=store.brand_id,
                store_id=store.id,
                source_id=source_id,
                source_version=next_version,
                name=str(item.get("name") or "Kategori"),
                slug=str(item.get("slug") or slugify(str(item.get("name") or "kategori"))),
                description=None,
                sort_order=int(item.get("sort_order") or 0),
                is_active=bool(item.get("is_active", True)),
                seo_title=str(item.get("name") or "Kategori"),
                seo_description=str(item.get("name") or "Kategori"),
            )
            db.add(row)
        else:
            row.name = str(item.get("name") or row.name)
            row.slug = str(item.get("slug") or row.slug)
            row.sort_order = int(item.get("sort_order") or row.sort_order)
            row.is_active = bool(item.get("is_active", True))
            row.seo_title = row.name
            row.seo_description = row.name
            row.source_version = next_version
        category_by_source_id[source_id] = row
        pending_parent_links.append((row, item.get("parent_id")))
        next_version += 1

    db.flush()
    for row, parent_source_id in pending_parent_links:
        row.parent_id = category_by_source_id.get(str(parent_source_id)).id if parent_source_id else None
    db.flush()
    return category_by_source_id, next_version


def _sync_products(
    db: Session,
    store: Store,
    items: list[dict[str, Any]],
    *,
    categories_by_source_id: dict[str, Category],
    next_version: int,
) -> tuple[dict[str, Product], int]:
    fallback_category, next_version = _ensure_fallback_category(db, store, next_version=next_version)
    product_by_source_id: dict[str, Product] = {}

    for item in items:
        source_id = str(item.get("id") or "").strip()
        if not source_id:
            continue
        row = db.scalar(
            select(Product)
            .where(Product.store_id == store.id)
            .where(Product.source_id == source_id)
        )
        category = categories_by_source_id.get(str(item.get("category_id") or "")) or fallback_category
        description = str(item.get("description") or "").strip() or None
        name = str(item.get("name") or "Produk")
        active_flag = bool(item.get("target_visibility_active", item.get("is_active", True)))
        if row is None:
            row = Product(
                brand_id=store.brand_id,
                store_id=store.id,
                category_id=category.id,
                source_id=source_id,
                source_version=next_version,
                sku=str(item.get("sku") or source_id).upper(),
                slug=str(item.get("slug") or slugify(name)),
                name=name,
                summary=_build_summary(description, str(item.get("unit") or "pcs")),
                description=description,
                product_type=_infer_product_type(category.name, name, description),
                unit=str(item.get("unit") or "pcs"),
                weight_grams=_parse_decimal(item.get("weight_grams")),
                min_qty=max(1, int(_parse_decimal(item.get("min_stock_default"), fallback=Decimal("1")))),
                is_active=active_flag,
                is_featured=False,
                is_new_arrival=False,
                is_best_seller=False,
                seo_title=name,
                seo_description=description or name,
                seo_keywords=name,
            )
            db.add(row)
        else:
            row.category_id = category.id
            row.source_version = next_version
            row.sku = str(item.get("sku") or row.sku).upper()
            row.slug = str(item.get("slug") or row.slug)
            row.name = name
            row.summary = _build_summary(description, str(item.get("unit") or row.unit))
            row.description = description
            row.product_type = _infer_product_type(category.name, name, description)
            row.unit = str(item.get("unit") or row.unit)
            row.weight_grams = _parse_decimal(item.get("weight_grams"), fallback=row.weight_grams)
            row.min_qty = max(1, int(_parse_decimal(item.get("min_stock_default"), fallback=Decimal(row.min_qty))))
            row.is_active = active_flag
            row.seo_title = name
            row.seo_description = description or name
            row.seo_keywords = name
        db.flush()

        existing_images = list(
            db.scalars(
                select(ProductImage)
                .where(ProductImage.product_id == row.id)
            ).all()
        )
        for image in existing_images:
            db.delete(image)
        for sort_order, image_payload in enumerate(item.get("images") or [], start=1):
            db.add(
                ProductImage(
                    product_id=row.id,
                    image_url=str(image_payload.get("file_url") or ""),
                    alt_text=name,
                    sort_order=int(image_payload.get("sort_order") or sort_order),
                    is_primary=bool(image_payload.get("is_primary", sort_order == 1)),
                    created_at=utcnow(),
                )
            )
        product_by_source_id[source_id] = row
        next_version += 1

    db.flush()
    return product_by_source_id, next_version


def _sync_prices(
    db: Session,
    store: Store,
    items: list[dict[str, Any]],
    *,
    products_by_source_id: dict[str, Product],
    next_version: int,
) -> tuple[int, int]:
    synced_count = 0
    for item in items:
        product = products_by_source_id.get(str(item.get("product_id") or ""))
        if product is None:
            product = db.scalar(
                select(Product)
                .where(Product.store_id == store.id)
                .where(Product.source_id == str(item.get("product_id") or ""))
            )
        if product is None:
            continue
        source_id = str(item.get("id") or "")
        row = None
        if source_id:
            row = db.scalar(
                select(ProductPrice)
                .where(ProductPrice.store_id == store.id)
                .where(ProductPrice.source_id == source_id)
            )
        if row is None:
            row = db.scalar(
                select(ProductPrice)
                .where(ProductPrice.store_id == store.id)
                .where(ProductPrice.product_id == product.id)
                .where(ProductPrice.price_type == PriceType.RETAIL)
            )
        if row is None:
            row = ProductPrice(
                product_id=product.id,
                brand_id=store.brand_id,
                store_id=store.id,
                source_id=source_id or None,
                source_version=next_version,
                price_type=PriceType.RETAIL,
                member_level=None,
                min_qty=1,
                currency_code=str(item.get("currency_code") or "IDR"),
                amount=_parse_decimal(item.get("amount")),
                compare_at_amount=None,
                starts_at=_parse_datetime(item.get("effective_from")),
                ends_at=_parse_datetime(item.get("effective_until")),
                is_active=bool(item.get("is_active", True)),
            )
            db.add(row)
        else:
            row.product_id = product.id
            row.brand_id = store.brand_id
            row.store_id = store.id
            row.source_id = source_id or row.source_id
            row.source_version = next_version
            row.price_type = PriceType.RETAIL
            row.member_level = None
            row.min_qty = 1
            row.currency_code = str(item.get("currency_code") or row.currency_code)
            row.amount = _parse_decimal(item.get("amount"), fallback=row.amount)
            row.compare_at_amount = None
            row.starts_at = _parse_datetime(item.get("effective_from"))
            row.ends_at = _parse_datetime(item.get("effective_until"))
            row.is_active = bool(item.get("is_active", True))
        next_version += 1
        synced_count += 1
    db.flush()
    return synced_count, next_version


def _normalize_setting_value(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    return {"value": value}


def _sync_banners(
    db: Session,
    store: Store,
    items: list[dict[str, Any]],
    *,
    next_version: int,
) -> tuple[int, int]:
    synced_count = 0
    for item in items:
        source_id = str(item.get("id") or "").strip()
        if not source_id:
            continue
        row = db.scalar(
            select(Banner)
            .where(Banner.store_id == store.id)
            .where(Banner.source_id == source_id)
        )
        if row is None:
            row = Banner(
                brand_id=store.brand_id,
                store_id=store.id,
                source_id=source_id,
                source_version=next_version,
                title=str(item.get("title") or "Banner"),
                subtitle=str(item.get("subtitle") or "").strip() or None,
                image_url=str(item.get("image_url") or "").strip() or None,
                mobile_image_url=str(item.get("mobile_image_url") or "").strip() or None,
                target_url=str(item.get("target_url") or "").strip() or None,
                sort_order=int(item.get("sort_order") or 0),
                starts_at=_parse_datetime(item.get("starts_at")),
                ends_at=_parse_datetime(item.get("ends_at")),
                is_active=bool(item.get("is_active", True)),
            )
            db.add(row)
        else:
            row.source_version = next_version
            row.title = str(item.get("title") or row.title)
            row.subtitle = str(item.get("subtitle") or "").strip() or None
            row.image_url = str(item.get("image_url") or "").strip() or None
            row.mobile_image_url = str(item.get("mobile_image_url") or "").strip() or None
            row.target_url = str(item.get("target_url") or "").strip() or None
            row.sort_order = int(item.get("sort_order") or 0)
            row.starts_at = _parse_datetime(item.get("starts_at"))
            row.ends_at = _parse_datetime(item.get("ends_at"))
            row.is_active = bool(item.get("is_active", True))
        next_version += 1
        synced_count += 1
    db.flush()
    return synced_count, next_version


def _sync_content_pages(
    db: Session,
    store: Store,
    items: list[dict[str, Any]],
    *,
    next_version: int,
) -> tuple[int, int]:
    synced_count = 0
    for item in items:
        source_id = str(item.get("id") or "").strip()
        if not source_id:
            continue
        row = db.scalar(
            select(ContentPage)
            .where(ContentPage.store_id == store.id)
            .where(ContentPage.source_id == source_id)
        )
        page_type = ContentPageType(str(item.get("page_type") or ContentPageType.STATIC.value))
        if row is None:
            row = db.scalar(
                select(ContentPage)
                .where(ContentPage.store_id == store.id)
                .where(ContentPage.page_type == page_type)
                .where(ContentPage.slug == str(item.get("slug") or "").strip())
            )
        if row is None:
            row = ContentPage(
                brand_id=store.brand_id,
                store_id=store.id,
                source_id=source_id,
                source_version=next_version,
                page_type=page_type,
                slug=str(item.get("slug") or "halaman"),
                title=str(item.get("title") or "Halaman"),
                excerpt=str(item.get("excerpt") or "").strip() or None,
                body_html=str(item.get("body_html") or "<p>Konten kosong</p>"),
                cover_image_url=str(item.get("cover_image_url") or "").strip() or None,
                is_published=bool(item.get("is_published", True)),
                published_at=_parse_datetime(item.get("published_at")),
                seo_title=str(item.get("seo_title") or "").strip() or None,
                seo_description=str(item.get("seo_description") or "").strip() or None,
                seo_keywords=str(item.get("seo_keywords") or "").strip() or None,
            )
            db.add(row)
        else:
            row.source_id = source_id
            row.source_version = next_version
            row.page_type = page_type
            row.slug = str(item.get("slug") or row.slug)
            row.title = str(item.get("title") or row.title)
            row.excerpt = str(item.get("excerpt") or "").strip() or None
            row.body_html = str(item.get("body_html") or row.body_html)
            row.cover_image_url = str(item.get("cover_image_url") or "").strip() or None
            row.is_published = bool(item.get("is_published", True))
            row.published_at = _parse_datetime(item.get("published_at"))
            row.seo_title = str(item.get("seo_title") or "").strip() or None
            row.seo_description = str(item.get("seo_description") or "").strip() or None
            row.seo_keywords = str(item.get("seo_keywords") or "").strip() or None
        next_version += 1
        synced_count += 1
    db.flush()
    return synced_count, next_version


def _sync_payment_methods(
    db: Session,
    store: Store,
    items: list[dict[str, Any]],
    *,
    next_version: int,
) -> tuple[int, int]:
    synced_count = 0
    for item in items:
        source_id = str(item.get("id") or "").strip()
        code = str(item.get("code") or "").strip().upper()
        if not source_id or not code:
            continue
        row = db.scalar(
            select(PaymentMethod)
            .where(PaymentMethod.store_id == store.id)
            .where(PaymentMethod.source_id == source_id)
        )
        if row is None:
            row = db.scalar(
                select(PaymentMethod)
                .where(PaymentMethod.store_id == store.id)
                .where(PaymentMethod.code == code)
            )
        payment_type = PaymentMethodType(str(item.get("payment_type") or PaymentMethodType.OTHER.value))
        if row is None:
            row = PaymentMethod(
                brand_id=store.brand_id,
                store_id=store.id,
                source_id=source_id,
                source_version=next_version,
                code=code,
                name=str(item.get("name") or code),
                description=str(item.get("description") or "").strip() or None,
                payment_type=payment_type,
                provider_code=str(item.get("provider_code") or "").strip() or None,
                instructions_html=str(item.get("instructions_html") or "").strip() or None,
                icon_url=str(item.get("icon_url") or "").strip() or None,
                sort_order=int(item.get("sort_order") or 0),
                is_active=bool(item.get("is_active", True)),
                config_json=item.get("config_json") if isinstance(item.get("config_json"), dict) else {},
            )
            db.add(row)
        else:
            row.source_id = source_id
            row.source_version = next_version
            row.code = code
            row.name = str(item.get("name") or row.name)
            row.description = str(item.get("description") or "").strip() or None
            row.payment_type = payment_type
            row.provider_code = str(item.get("provider_code") or "").strip() or None
            row.instructions_html = str(item.get("instructions_html") or "").strip() or None
            row.icon_url = str(item.get("icon_url") or "").strip() or None
            row.sort_order = int(item.get("sort_order") or 0)
            row.is_active = bool(item.get("is_active", True))
            row.config_json = item.get("config_json") if isinstance(item.get("config_json"), dict) else {}
        next_version += 1
        synced_count += 1
    db.flush()
    return synced_count, next_version


def _sync_app_settings(
    db: Session,
    store: Store,
    items: list[dict[str, Any]],
    *,
    next_version: int,
) -> tuple[int, int]:
    synced_count = 0
    for item in items:
        setting_group = str(item.get("setting_group") or "").strip().lower()
        setting_key = str(item.get("setting_key") or "").strip().lower()
        if not setting_group or not setting_key:
            continue
        row = db.scalar(
            select(AppSetting)
            .where(AppSetting.store_id == store.id)
            .where(AppSetting.setting_group == setting_group)
            .where(AppSetting.setting_key == setting_key)
        )
        if row is None:
            row = AppSetting(
                brand_id=store.brand_id,
                store_id=store.id,
                setting_group=setting_group,
                setting_key=setting_key,
                setting_value=_normalize_setting_value(item.get("value")),
                source_id=str(item.get("id") or "") or None,
                source_version=next_version,
                is_public=bool(item.get("is_active", True)),
            )
            db.add(row)
        else:
            row.setting_value = _normalize_setting_value(item.get("value"))
            row.source_id = str(item.get("id") or "") or row.source_id
            row.source_version = next_version
            row.is_public = bool(item.get("is_active", True))
        next_version += 1
        synced_count += 1
    db.flush()
    return synced_count, next_version


def sync_storefront_from_sige(db: Session, *, store_code: str, force_full: bool = False) -> dict[str, Any]:
    store = _ensure_store(db, store_code)
    cursor = None if force_full else _get_last_sige_cursor(db, store.id)
    payload = _fetch_sige_delta(cursor)

    next_version = _current_max_source_version(db, store.id) + 1
    categories_by_source_id, next_version = _sync_categories(
        db,
        store,
        payload.get("categories") or [],
        next_version=next_version,
    )
    products_by_source_id, next_version = _sync_products(
        db,
        store,
        payload.get("products") or [],
        categories_by_source_id=categories_by_source_id,
        next_version=next_version,
    )
    prices_count, next_version = _sync_prices(
        db,
        store,
        payload.get("prices") or [],
        products_by_source_id=products_by_source_id,
        next_version=next_version,
    )
    banners_count, next_version = _sync_banners(
        db,
        store,
        payload.get("banners") or [],
        next_version=next_version,
    )
    content_pages_count, next_version = _sync_content_pages(
        db,
        store,
        payload.get("content_pages") or [],
        next_version=next_version,
    )
    payment_methods_count, next_version = _sync_payment_methods(
        db,
        store,
        payload.get("payment_methods") or [],
        next_version=next_version,
    )
    settings_count, next_version = _sync_app_settings(
        db,
        store,
        payload.get("app_settings") or [],
        next_version=next_version,
    )

    summary = {
        "store_code": store.code,
        "target_code": settings.sige_sync_target_code,
        "cursor": payload.get("cursor"),
        "target": payload.get("target"),
        "categories_synced": len(payload.get("categories") or []),
        "products_synced": len(payload.get("products") or []),
        "prices_synced": prices_count,
        "banners_synced": banners_count,
        "content_pages_synced": content_pages_count,
        "payment_methods_synced": payment_methods_count,
        "settings_synced": settings_count,
        "force_full": force_full,
    }
    db.add(
        SyncLog(
            direction=SyncDirection.INBOUND,
            entity_type="sige-delta",
            entity_id=store.id,
            store_id=store.id,
            source_version=next_version - 1,
            idempotency_key=None,
            status=SyncStatus.SYNCED,
            attempt_count=1,
            last_error=None,
            payload_hash=_payload_hash(payload),
            payload_json=summary,
            processed_at=utcnow(),
        )
    )
    db.flush()
    return summary
