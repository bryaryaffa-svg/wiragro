from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Banner, Category, ContentPage, Product, Store
from app.models.enums import ContentPageType
from app.services.commerce import RESELLER_MEMBER_LEVEL, ROLE_RESELLER, active_promotions, require_store, serialize_product

router = APIRouter()


def _pricing_role(member_level: str | None) -> str:
    return ROLE_RESELLER if (member_level or "").upper().startswith(RESELLER_MEMBER_LEVEL) else "guest"


@router.get("/home")
def storefront_home(store_code: str, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, store_code)
    featured = list(
        db.scalars(
            select(Product)
            .where(Product.store_id == store.id)
            .where(Product.is_active.is_(True))
            .where(Product.is_featured.is_(True))
            .limit(8)
        ).all()
    )
    latest = list(
        db.scalars(
            select(Product)
            .where(Product.store_id == store.id)
            .where(Product.is_active.is_(True))
            .order_by(Product.created_at.desc())
            .limit(8)
        ).all()
    )
    best_sellers = list(
        db.scalars(
            select(Product)
            .where(Product.store_id == store.id)
            .where(Product.is_active.is_(True))
            .where(Product.is_best_seller.is_(True))
            .limit(8)
        ).all()
    )
    categories = list(
        db.scalars(
            select(Category)
            .where(Category.store_id == store.id)
            .where(Category.is_active.is_(True))
            .order_by(Category.sort_order)
            .limit(8)
        ).all()
    )
    banners = list(
        db.scalars(
            select(Banner)
            .where(Banner.store_id == store.id)
            .where(Banner.is_active.is_(True))
            .order_by(Banner.sort_order)
        ).all()
    )
    return {
        "store": {"code": store.code, "name": store.name},
        "banners": [{"title": row.title, "subtitle": row.subtitle, "target_url": row.target_url} for row in banners],
        "featured_products": [serialize_product(db, row, role="guest") for row in featured],
        "new_arrivals": [serialize_product(db, row, role="guest") for row in latest],
        "best_sellers": [serialize_product(db, row, role="guest") for row in best_sellers],
        "category_highlights": [{"name": row.name, "slug": row.slug} for row in categories],
        "seo": {
            "title": f"{store.name} | Toko Online Produk Pertanian",
            "description": "Belanja alat pertanian, herbisida, benih, dan nutrisi yang terhubung ke pusat.",
        },
    }


@router.get("/stores")
def storefront_stores(db: Session = Depends(get_db)) -> dict:
    rows = list(
        db.scalars(
            select(Store)
            .where(Store.is_active.is_(True))
            .order_by(Store.name.asc())
        ).all()
    )
    return {
        "items": [
            {
                "code": row.code,
                "name": row.name,
                "province": row.province,
            }
            for row in rows
        ]
    }


@router.get("/categories")
def storefront_categories(store_code: str, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, store_code)
    rows = list(
        db.scalars(
            select(Category)
            .where(Category.store_id == store.id)
            .where(Category.is_active.is_(True))
            .order_by(Category.sort_order, Category.name)
        ).all()
    )
    return {"items": [{"id": row.id, "name": row.name, "slug": row.slug, "parent_id": row.parent_id} for row in rows]}


@router.get("/products")
def storefront_products(
    store_code: str,
    q: str | None = None,
    category_slug: str | None = None,
    sort: str = Query(default="latest"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    member_level: str | None = None,
    db: Session = Depends(get_db),
) -> dict:
    store = require_store(db, store_code)
    statement = select(Product).where(Product.store_id == store.id).where(Product.is_active.is_(True))
    if q:
        pattern = f"%{q.lower()}%"
        statement = statement.where(or_(Product.name.ilike(pattern), Product.summary.ilike(pattern), Product.description.ilike(pattern)))
    if category_slug:
        category = db.scalar(select(Category).where(Category.store_id == store.id).where(Category.slug == category_slug))
        if category:
            statement = statement.where(Product.category_id == category.id)
    rows = list(db.scalars(statement).all())
    if sort == "best_seller":
        rows.sort(key=lambda product: (not product.is_best_seller, -(product.created_at.timestamp())))
    elif sort == "price_asc":
        rows.sort(
            key=lambda product: Decimal(
                serialize_product(
                    db,
                    product,
                    member_level=member_level,
                    role=_pricing_role(member_level),
                )["pricing"]["active"]["amount"]
            ),
        )
    elif sort == "price_desc":
        rows.sort(
            key=lambda product: Decimal(
                serialize_product(
                    db,
                    product,
                    member_level=member_level,
                    role=_pricing_role(member_level),
                )["pricing"]["active"]["amount"]
            ),
            reverse=True,
        )
    elif sort == "name_asc":
        rows.sort(key=lambda product: product.name.lower())
    else:
        rows.sort(key=lambda product: product.created_at, reverse=True)
    rows = rows[(page - 1) * page_size : page * page_size]
    return {
        "items": [serialize_product(db, row, member_level=member_level, role=_pricing_role(member_level)) for row in rows],
        "pagination": {"page": page, "page_size": page_size, "count": len(rows)},
        "available_filters": {"category_slug": category_slug, "sort": sort},
        "seo": {"title": "Katalog Produk", "description": "Katalog produk pertanian Sidomakmur"},
    }


@router.get("/products/{slug}")
def storefront_product_detail(
    slug: str,
    store_code: str,
    member_level: str | None = None,
    db: Session = Depends(get_db),
) -> dict:
    store = require_store(db, store_code)
    product = db.scalar(select(Product).where(Product.store_id == store.id).where(Product.slug == slug).where(Product.is_active.is_(True)))
    if product is None:
        return {"detail": "Produk tidak ditemukan"}
    related = list(
        db.scalars(
            select(Product)
            .where(Product.store_id == store.id)
            .where(Product.category_id == product.category_id)
            .where(Product.id != product.id)
            .where(Product.is_active.is_(True))
            .limit(4)
        ).all()
    )
    return {
        **serialize_product(db, product, member_level=member_level, role=_pricing_role(member_level)),
        "promotions": [
            {"code": row.promotion_code, "name": row.name, "rule_payload": row.rule_payload}
            for row in active_promotions(db, store.id)
        ],
        "related_products": [serialize_product(db, row, member_level=member_level, role=_pricing_role(member_level)) for row in related],
        "stock_badge": {"state": "AVAILABLE", "message": "Tersedia sesuai publish stok terbaru"},
    }


@router.get("/banners")
def storefront_banners(store_code: str, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, store_code)
    rows = list(
        db.scalars(
            select(Banner)
            .where(Banner.store_id == store.id)
            .where(Banner.is_active.is_(True))
            .order_by(Banner.sort_order)
        ).all()
    )
    return {"items": [{"id": row.id, "title": row.title, "subtitle": row.subtitle, "target_url": row.target_url} for row in rows]}


@router.get("/pages/{slug}")
def storefront_page(slug: str, store_code: str, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, store_code)
    page = db.scalar(
        select(ContentPage)
        .where(ContentPage.store_id == store.id)
        .where(ContentPage.slug == slug)
        .where(ContentPage.page_type == ContentPageType.STATIC)
        .where(ContentPage.is_published.is_(True))
    )
    if page is None:
        return {"detail": "Halaman tidak ditemukan"}
    return {
        "slug": page.slug,
        "title": page.title,
        "excerpt": page.excerpt,
        "body_html": page.body_html,
        "seo": {"title": page.seo_title or page.title, "description": page.seo_description or page.excerpt},
    }


@router.get("/pages")
def storefront_pages(store_code: str, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, store_code)
    rows = list(
        db.scalars(
            select(ContentPage)
            .where(ContentPage.store_id == store.id)
            .where(ContentPage.page_type == ContentPageType.STATIC)
            .where(ContentPage.is_published.is_(True))
            .order_by(ContentPage.published_at.desc(), ContentPage.title.asc())
        ).all()
    )
    return {
        "items": [
            {
                "slug": row.slug,
                "title": row.title,
                "excerpt": row.excerpt,
                "published_at": row.published_at,
            }
            for row in rows
        ]
    }


@router.get("/articles")
def storefront_articles(
    store_code: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=30),
    q: str | None = None,
    db: Session = Depends(get_db),
) -> dict:
    store = require_store(db, store_code)
    statement = (
        select(ContentPage)
        .where(ContentPage.store_id == store.id)
        .where(ContentPage.page_type == ContentPageType.ARTICLE)
        .where(ContentPage.is_published.is_(True))
        .order_by(ContentPage.published_at.desc())
    )
    if q:
        pattern = f"%{q.lower()}%"
        statement = statement.where(or_(ContentPage.title.ilike(pattern), ContentPage.excerpt.ilike(pattern)))
    rows = list(db.scalars(statement.offset((page - 1) * page_size).limit(page_size)).all())
    return {
        "items": [{"slug": row.slug, "title": row.title, "excerpt": row.excerpt, "published_at": row.published_at} for row in rows],
        "pagination": {"page": page, "page_size": page_size, "count": len(rows)},
    }


@router.get("/articles/{slug}")
def storefront_article_detail(slug: str, store_code: str, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, store_code)
    page = db.scalar(
        select(ContentPage)
        .where(ContentPage.store_id == store.id)
        .where(ContentPage.page_type == ContentPageType.ARTICLE)
        .where(ContentPage.slug == slug)
        .where(ContentPage.is_published.is_(True))
    )
    if page is None:
        return {"detail": "Artikel tidak ditemukan"}
    return {
        "slug": page.slug,
        "title": page.title,
        "excerpt": page.excerpt,
        "body_html": page.body_html,
        "seo": {"title": page.seo_title or page.title, "description": page.seo_description or page.excerpt},
    }


@router.get("/seo")
def storefront_seo(path: str, store_code: str, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, store_code)
    title = f"{store.name} | Sidomakmur"
    description = "Marketplace pertanian Sidomakmur untuk Jawa Timur."
    if path.startswith("/artikel/"):
        description = "Artikel dan edukasi produk pertanian."
    return {
        "title": title,
        "description": description,
        "keywords": ["pertanian", "sidomakmur", "benih", "herbisida", "nutrisi"],
        "canonical_url": f"https://sidomakmur.com{path}",
        "open_graph": {"title": title, "description": description},
        "json_ld": {"@context": "https://schema.org", "@type": "Store", "name": store.name},
    }
