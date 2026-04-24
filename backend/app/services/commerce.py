from __future__ import annotations

import hashlib
import random
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.models import (
    AppSetting,
    Banner,
    Brand,
    Cart,
    CartItem,
    Category,
    ContentPage,
    Customer,
    Invoice,
    Order,
    OrderItem,
    OtpChallenge,
    Payment,
    PaymentMethod,
    Product,
    ProductImage,
    ProductPrice,
    ProductVideo,
    Promotion,
    ResellerCredential,
    Shipment,
    Store,
    SyncLog,
)
from app.models.enums import (
    CartStatus,
    ContentPageType,
    FulfillmentStatus,
    InvoiceType,
    OrderStatus,
    PaymentMethodType,
    PaymentStatus,
    PriceType,
    ProductType,
    PromotionStatus,
    PromotionType,
    ShipmentStatus,
    SyncDirection,
    SyncStatus,
)

ROLE_GUEST = "guest"
ROLE_CUSTOMER = "customer"
ROLE_RESELLER = "reseller"
PRICING_MODE_RETAIL = "retail"
PRICING_MODE_RESELLER = "reseller"
RESELLER_MEMBER_LEVEL = "RESELLER"
DEFAULT_RESELLER_POLICY = {
    "pricing_member_level": RESELLER_MEMBER_LEVEL,
    "minimum_order_amount": "500000",
    "allow_cod": True,
    "allow_store_delivery": True,
    "allow_pickup": True,
    "invoice_source": "STORE",
}


def utcnow() -> datetime:
    return datetime.now(UTC)


def slugify(value: str) -> str:
    base = "".join(ch.lower() if ch.isalnum() else "-" for ch in value)
    while "--" in base:
        base = base.replace("--", "-")
    return base.strip("-")


def normalize_phone(value: str) -> str:
    digits = "".join(ch for ch in value if ch.isdigit())
    if digits.startswith("62"):
        return f"+{digits}"
    if digits.startswith("0"):
        return f"+62{digits[1:]}"
    if digits.startswith("8"):
        return f"+62{digits}"
    return f"+{digits}"


def require_store(db: Session, store_code: str) -> Store:
    store = db.scalar(select(Store).where(Store.code == store_code).where(Store.is_active.is_(True)))
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store tidak ditemukan")
    return store


def normalize_username(value: str) -> str:
    return value.strip().lower()


def determine_customer_role(customer: Customer | None) -> str:
    if customer is None:
        return ROLE_GUEST
    member_tier = (customer.member_tier or "").upper()
    if member_tier.startswith(RESELLER_MEMBER_LEVEL):
        return ROLE_RESELLER
    if customer.is_guest:
        return ROLE_GUEST
    return ROLE_CUSTOMER


def determine_pricing_mode(role: str) -> str:
    return PRICING_MODE_RESELLER if role == ROLE_RESELLER else PRICING_MODE_RETAIL


def get_reseller_policy(db: Session, store_id: str) -> dict:
    policy = DEFAULT_RESELLER_POLICY.copy()
    row = db.scalar(
        select(AppSetting)
        .where(AppSetting.store_id == store_id)
        .where(AppSetting.setting_group == "reseller")
        .where(AppSetting.setting_key == "policy")
    )
    if row and row.setting_value:
        policy.update(row.setting_value)
    return policy


def serialize_checkout_rules(db: Session, store_id: str, role: str) -> dict:
    policy = get_reseller_policy(db, store_id)
    minimum_order_amount = str(policy.get("minimum_order_amount", DEFAULT_RESELLER_POLICY["minimum_order_amount"]))
    shipping_methods: list[dict[str, str]] = []
    if bool(policy.get("allow_store_delivery", True)):
        shipping_methods.append({"code": "delivery", "label": "Kirim langsung oleh toko"})
    if bool(policy.get("allow_pickup", True)):
        shipping_methods.append({"code": "pickup", "label": "Ambil di toko"})

    synced_methods = list(
        db.scalars(
            select(PaymentMethod)
            .where(PaymentMethod.store_id == store_id)
            .where(PaymentMethod.is_active.is_(True))
            .order_by(PaymentMethod.sort_order.asc(), PaymentMethod.name.asc())
        ).all()
    )
    payment_methods = [
        {
            "code": method.code,
            "label": method.name,
            "description": method.description,
            "type": method.payment_type.value,
            "provider_code": method.provider_code,
            "instructions_html": method.instructions_html,
            "icon_url": method.icon_url,
        }
        for method in synced_methods
        if bool(policy.get("allow_cod", True)) or method.payment_type != PaymentMethodType.COD
    ]
    if not payment_methods:
        payment_methods = [{"code": "duitku-va", "label": "Pembayaran online Duitku"}]
        if bool(policy.get("allow_cod", True)):
            payment_methods.append({"code": "COD", "label": "Bayar di tempat (COD)"})
    allow_cod = any(item["code"].upper() == "COD" or item.get("type") == "COD" for item in payment_methods)
    return {
        "role": role,
        "pricing_mode": determine_pricing_mode(role),
        "minimum_order_amount": minimum_order_amount if role == ROLE_RESELLER else None,
        "apply_minimum_order": role == ROLE_RESELLER,
        "allow_cod": allow_cod,
        "allow_store_delivery": bool(policy.get("allow_store_delivery", True)),
        "allow_pickup": bool(policy.get("allow_pickup", True)),
        "invoice_source": str(policy.get("invoice_source", "STORE")),
        "shipping_methods": shipping_methods,
        "payment_methods": payment_methods,
    }


def validate_checkout_constraints(
    *,
    cart: Cart,
    role: str,
    checkout_rules: dict,
    shipping_method: str,
    payment_method: str,
) -> None:
    normalized_shipping = shipping_method.lower()
    normalized_payment = payment_method.upper()
    allowed_shipping = {item["code"] for item in checkout_rules["shipping_methods"]}
    allowed_payment = {item["code"].upper() for item in checkout_rules["payment_methods"]}

    if normalized_shipping not in allowed_shipping:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Metode pengiriman tidak didukung")
    if normalized_payment not in allowed_payment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Metode pembayaran tidak didukung")

    if role == ROLE_RESELLER and checkout_rules.get("apply_minimum_order"):
        minimum_order_amount = Decimal(str(checkout_rules["minimum_order_amount"]))
        if Decimal(cart.grand_total) < minimum_order_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minimum order reseller adalah Rp500.000 per transaksi",
            )


def serialize_session(customer: Customer, *, mode: str, reseller_username: str | None = None) -> dict:
    role = determine_customer_role(customer)
    return {
        "access_token": create_access_token(customer.id),
        "customer": {
            "id": customer.id,
            "full_name": customer.full_name,
            "email": customer.email,
            "phone": customer.phone,
            "member_tier": customer.member_tier,
            "username": reseller_username,
        },
        "mode": mode,
        "role": role,
        "pricing_mode": determine_pricing_mode(role),
        "auth_provider": customer.auth_provider,
    }


def seed_demo_data(db: Session) -> None:
    if db.scalar(select(func.count(Brand.id))) and db.scalar(select(func.count(Product.id))):
        existing_store = db.scalar(select(Store).where(Store.code == settings.default_store_code))
        if existing_store is not None:
            ensure_demo_extensions(db, existing_store)
            ensure_demo_branch_variants(db, existing_store)
            db.commit()
        return

    now = utcnow()
    brand = Brand(code=settings.default_brand_code, name=settings.default_brand_name)
    store = Store(
        brand=brand,
        code=settings.default_store_code,
        name=settings.default_store_name,
        province="Jawa Timur",
        is_active=True,
    )
    db.add_all([brand, store])
    db.flush()

    categories = [
        Category(
            brand_id=brand.id,
            store_id=store.id,
            name="Alat Pertanian",
            slug="alat-pertanian",
            description="Peralatan pertanian untuk penggunaan harian.",
            sort_order=1,
        ),
        Category(
            brand_id=brand.id,
            store_id=store.id,
            name="Herbisida",
            slug="herbisida",
            description="Produk pengendali gulma.",
            sort_order=2,
        ),
        Category(
            brand_id=brand.id,
            store_id=store.id,
            name="Benih",
            slug="benih",
            description="Benih unggulan untuk lahan produktif.",
            sort_order=3,
        ),
        Category(
            brand_id=brand.id,
            store_id=store.id,
            name="Nutrisi",
            slug="nutrisi",
            description="Nutrisi tanaman dan penunjang pertumbuhan.",
            sort_order=4,
        ),
    ]
    db.add_all(categories)
    db.flush()

    products = [
        Product(
            brand_id=brand.id,
            store_id=store.id,
            category_id=categories[0].id,
            sku="KS-ALT-001",
            slug="sprayer-punggung-16l",
            name="Sprayer Punggung 16L",
            summary="Sprayer ringan untuk penyemprotan intensif.",
            description="Cocok untuk aplikasi herbisida dan nutrisi pada lahan sawah maupun kebun.",
            product_type=ProductType.TOOL,
            unit="unit",
            weight_grams=Decimal("3500"),
            is_active=True,
            is_featured=True,
            is_new_arrival=True,
        ),
        Product(
            brand_id=brand.id,
            store_id=store.id,
            category_id=categories[1].id,
            sku="KS-HRB-001",
            slug="herbisida-gulma-tuntas-500ml",
            name="Herbisida Gulma Tuntas 500ml",
            summary="Formulasi cair untuk pengendalian gulma daun lebar.",
            description="Efektif pada gulma muda dan cocok untuk aplikasi terukur.",
            product_type=ProductType.HERBICIDE,
            unit="botol",
            weight_grams=Decimal("650"),
            is_active=True,
            is_best_seller=True,
        ),
        Product(
            brand_id=brand.id,
            store_id=store.id,
            category_id=categories[2].id,
            sku="KS-BNH-001",
            slug="benih-jagung-hibrida-premium",
            name="Benih Jagung Hibrida Premium",
            summary="Benih jagung unggul untuk produktivitas tinggi.",
            description="Dikembangkan untuk lahan dataran rendah dan menengah.",
            product_type=ProductType.SEED,
            unit="pack",
            weight_grams=Decimal("1200"),
            is_active=True,
            is_featured=True,
        ),
        Product(
            brand_id=brand.id,
            store_id=store.id,
            category_id=categories[3].id,
            sku="KS-NTR-001",
            slug="nutrisi-daun-maxgrow-1l",
            name="Nutrisi Daun MaxGrow 1L",
            summary="Nutrisi cair untuk fase vegetatif.",
            description="Membantu pertumbuhan daun lebih merata dan hijau.",
            product_type=ProductType.NUTRITION,
            unit="botol",
            weight_grams=Decimal("1200"),
            is_active=True,
            is_new_arrival=True,
            is_best_seller=True,
        ),
    ]
    db.add_all(products)
    db.flush()

    db.add_all(
        [
            ProductImage(
                product_id=products[0].id,
                image_url="https://images.unsplash.com/photo-1581578731548-c64695cc6952",
                alt_text=products[0].name,
                sort_order=1,
                is_primary=True,
                created_at=now,
            ),
            ProductImage(
                product_id=products[1].id,
                image_url="https://images.unsplash.com/photo-1625246333195-78d9c38ad449",
                alt_text=products[1].name,
                sort_order=1,
                is_primary=True,
                created_at=now,
            ),
            ProductImage(
                product_id=products[2].id,
                image_url="https://images.unsplash.com/photo-1500382017468-9049fed747ef",
                alt_text=products[2].name,
                sort_order=1,
                is_primary=True,
                created_at=now,
            ),
            ProductImage(
                product_id=products[3].id,
                image_url="https://images.unsplash.com/photo-1464226184884-fa280b87c399",
                alt_text=products[3].name,
                sort_order=1,
                is_primary=True,
                created_at=now,
            ),
            ProductVideo(
                product_id=products[0].id,
                video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                platform="youtube",
                thumbnail_url=None,
                sort_order=1,
                created_at=now,
            ),
        ]
    )
    db.add_all(
        [
            ProductPrice(
                product_id=products[0].id,
                brand_id=brand.id,
                store_id=store.id,
                price_type=PriceType.RETAIL,
                amount=Decimal("385000"),
                min_qty=1,
            ),
            ProductPrice(
                product_id=products[1].id,
                brand_id=brand.id,
                store_id=store.id,
                price_type=PriceType.RETAIL,
                amount=Decimal("92000"),
                min_qty=1,
            ),
            ProductPrice(
                product_id=products[2].id,
                brand_id=brand.id,
                store_id=store.id,
                price_type=PriceType.RETAIL,
                amount=Decimal("68000"),
                min_qty=1,
            ),
            ProductPrice(
                product_id=products[3].id,
                brand_id=brand.id,
                store_id=store.id,
                price_type=PriceType.RETAIL,
                amount=Decimal("54000"),
                min_qty=1,
            ),
            ProductPrice(
                product_id=products[2].id,
                brand_id=brand.id,
                store_id=store.id,
                price_type=PriceType.WHOLESALE,
                amount=Decimal("62000"),
                min_qty=10,
            ),
        ]
    )
    db.add(
        Promotion(
            brand_id=brand.id,
            store_id=store.id,
            promotion_code="BXGY-JAGUNG-SAMPLE",
            name="Beli 10 Benih Gratis 1 Sample",
            description="Promo pusat untuk pembelian benih jagung tertentu.",
            promotion_type=PromotionType.BUY_X_GET_Y,
            rule_payload={
                "buy_product_id": products[2].id,
                "buy_qty": 10,
                "free_product_name": "Sample Nutrisi Daun 100ml",
                "free_qty": 1,
            },
            allow_store_override=False,
            created_by_center=True,
            priority=10,
            status=PromotionStatus.ACTIVE,
        )
    )
    db.add(
        Banner(
            brand_id=brand.id,
            store_id=store.id,
            title="Belanja Sarana Tani Lebih Ringan",
            subtitle="Katalog online Sidomakmur terhubung ke pusat.",
            image_url=None,
            mobile_image_url=None,
            target_url="/produk",
            sort_order=1,
            is_active=True,
        )
    )
    db.add_all(
        [
            ContentPage(
                brand_id=brand.id,
                store_id=store.id,
                page_type=ContentPageType.STATIC,
                slug="tentang-kami",
                title="Tentang Kami",
                excerpt="Profil singkat Kios Sidomakmur",
                body_html="<p>Kios Sidomakmur melayani kebutuhan produk pertanian untuk Jawa Timur.</p>",
                is_published=True,
                published_at=now,
            ),
            ContentPage(
                brand_id=brand.id,
                store_id=store.id,
                page_type=ContentPageType.STATIC,
                slug="kontak",
                title="Kontak",
                excerpt="Hubungi tim Sidomakmur",
                body_html="<p>WhatsApp: 0812-0000-0000</p>",
                is_published=True,
                published_at=now,
            ),
            ContentPage(
                brand_id=brand.id,
                store_id=store.id,
                page_type=ContentPageType.STATIC,
                slug="kebijakan-privasi",
                title="Kebijakan Privasi",
                excerpt="Cara Kios Sidomakmur mengelola data customer.",
                body_html="<p>Data customer dipakai hanya untuk operasional order, pembayaran, dan pengiriman.</p>",
                is_published=True,
                published_at=now,
            ),
            ContentPage(
                brand_id=brand.id,
                store_id=store.id,
                page_type=ContentPageType.STATIC,
                slug="syarat-dan-ketentuan",
                title="Syarat dan Ketentuan",
                excerpt="Aturan penggunaan storefront Kios Sidomakmur.",
                body_html="<p>Seluruh transaksi mengikuti status final yang diproses dan divalidasi pusat.</p>",
                is_published=True,
                published_at=now,
            ),
            ContentPage(
                brand_id=brand.id,
                store_id=store.id,
                page_type=ContentPageType.STATIC,
                slug="faq",
                title="FAQ",
                excerpt="Pertanyaan umum seputar order, pembayaran, dan pengiriman.",
                body_html="<p>Order yang belum dibayar dalam 24 jam akan dibatalkan otomatis oleh sistem.</p>",
                is_published=True,
                published_at=now,
            ),
            ContentPage(
                brand_id=brand.id,
                store_id=store.id,
                page_type=ContentPageType.ARTICLE,
                slug="cara-memilih-herbisida-untuk-lahan-padi",
                title="Cara Memilih Herbisida untuk Lahan Padi",
                excerpt="Panduan singkat untuk memilih herbisida sesuai fase gulma.",
                body_html="<p>Pilih herbisida berdasarkan fase gulma, tipe lahan, dan pola tanam.</p>",
                is_published=True,
                published_at=now,
            ),
        ]
    )
    db.add_all(
        [
            AppSetting(
                brand_id=brand.id,
                store_id=store.id,
                setting_group="storefront",
                setting_key="brand_theme",
                setting_value={"primary": "#74C365", "accent": "#E9F7E5"},
            ),
            AppSetting(
                brand_id=brand.id,
                store_id=store.id,
                setting_group="operational",
                setting_key="payment_timeout_hours",
                setting_value={"value": 24},
            ),
        ]
    )
    ensure_demo_extensions(db, store)
    ensure_demo_branch_variants(db, store)
    db.commit()


def ensure_demo_extensions(db: Session, store: Store) -> None:
    products = list(db.scalars(select(Product).where(Product.store_id == store.id)).all())
    product_by_slug = {product.slug: product for product in products}
    reseller_prices = {
        "sprayer-punggung-16l": Decimal("355000"),
        "herbisida-gulma-tuntas-500ml": Decimal("84000"),
        "benih-jagung-hibrida-premium": Decimal("62000"),
        "nutrisi-daun-maxgrow-1l": Decimal("48000"),
    }

    for slug, amount in reseller_prices.items():
        product = product_by_slug.get(slug)
        if product is None:
            continue
        existing_price = db.scalar(
            select(ProductPrice)
            .where(ProductPrice.product_id == product.id)
            .where(ProductPrice.store_id == store.id)
            .where(ProductPrice.price_type == PriceType.MEMBER)
            .where(ProductPrice.member_level == RESELLER_MEMBER_LEVEL)
        )
        if existing_price is None:
            db.add(
                ProductPrice(
                    product_id=product.id,
                    brand_id=store.brand_id,
                    store_id=store.id,
                    price_type=PriceType.MEMBER,
                    member_level=RESELLER_MEMBER_LEVEL,
                    amount=amount,
                    min_qty=1,
                )
            )

    reseller_setting = db.scalar(
        select(AppSetting)
        .where(AppSetting.store_id == store.id)
        .where(AppSetting.setting_group == "reseller")
        .where(AppSetting.setting_key == "policy")
    )
    if reseller_setting is None:
        db.add(
            AppSetting(
                brand_id=store.brand_id,
                store_id=store.id,
                setting_group="reseller",
                setting_key="policy",
                setting_value=DEFAULT_RESELLER_POLICY.copy(),
            )
        )

    reseller_customer = db.scalar(
        select(Customer)
        .where(Customer.store_id == store.id)
        .where(Customer.auth_provider == "reseller")
        .where(Customer.member_tier == RESELLER_MEMBER_LEVEL)
        .where(Customer.customer_code == "RES-DEM-001")
    )
    if reseller_customer is None:
        reseller_customer = Customer(
            brand_id=store.brand_id,
            store_id=store.id,
            customer_code="RES-DEM-001",
            full_name="Reseller Demo Sidomakmur",
            phone=normalize_phone("081300000001"),
            email="reseller.demo@sidomakmur.local",
            auth_provider="reseller",
            is_guest=False,
            member_tier=RESELLER_MEMBER_LEVEL,
        )
        db.add(reseller_customer)
        db.flush()

    reseller_credential = db.scalar(
        select(ResellerCredential)
        .where(ResellerCredential.store_id == store.id)
        .where(ResellerCredential.username == "reseller-demo")
    )
    if reseller_credential is None:
        db.add(
            ResellerCredential(
                customer_id=reseller_customer.id,
                store_id=store.id,
                username="reseller-demo",
                is_active=True,
            )
        )
    db.flush()


def ensure_demo_branch_variants(db: Session, source_store: Store) -> None:
    branch_specs = [
        ("SIDO-MALANG-ONLINE", "Kios Sidomakmur Malang", "Jawa Timur"),
        ("SIDO-SURABAYA-ONLINE", "Kios Sidomakmur Surabaya", "Jawa Timur"),
    ]
    for store_code, store_name, province in branch_specs:
        branch = db.scalar(select(Store).where(Store.code == store_code))
        if branch is None:
            branch = Store(
                brand_id=source_store.brand_id,
                code=store_code,
                name=store_name,
                province=province,
                is_active=True,
            )
            db.add(branch)
            db.flush()
            _clone_store_catalog(db, source_store, branch)
            ensure_demo_extensions(db, branch)
    db.flush()


def _clone_store_catalog(db: Session, source_store: Store, target_store: Store) -> None:
    now = utcnow()
    source_categories = list(
        db.scalars(
            select(Category)
            .where(Category.store_id == source_store.id)
            .order_by(Category.sort_order, Category.name)
        ).all()
    )
    category_map: dict[str, Category] = {}
    for source_category in source_categories:
        cloned_category = Category(
            brand_id=target_store.brand_id,
            store_id=target_store.id,
            parent_id=None,
            source_id=source_category.source_id or source_category.id,
            source_version=source_category.source_version,
            name=source_category.name,
            slug=source_category.slug,
            description=source_category.description,
            sort_order=source_category.sort_order,
            is_active=source_category.is_active,
            seo_title=source_category.seo_title,
            seo_description=source_category.seo_description,
        )
        db.add(cloned_category)
        db.flush()
        category_map[source_category.id] = cloned_category

    source_products = list(
        db.scalars(
            select(Product)
            .where(Product.store_id == source_store.id)
            .order_by(Product.created_at.asc())
        ).all()
    )
    product_map: dict[str, Product] = {}
    for source_product in source_products:
        cloned_product = Product(
            brand_id=target_store.brand_id,
            store_id=target_store.id,
            category_id=category_map[source_product.category_id].id,
            source_id=source_product.source_id or source_product.id,
            source_version=source_product.source_version,
            sku=source_product.sku,
            slug=source_product.slug,
            name=source_product.name,
            summary=source_product.summary,
            description=source_product.description,
            product_type=source_product.product_type,
            unit=source_product.unit,
            weight_grams=source_product.weight_grams,
            min_qty=source_product.min_qty,
            is_active=source_product.is_active,
            is_featured=source_product.is_featured,
            is_new_arrival=source_product.is_new_arrival,
            is_best_seller=source_product.is_best_seller,
            seo_title=source_product.seo_title,
            seo_description=source_product.seo_description,
            seo_keywords=source_product.seo_keywords,
        )
        db.add(cloned_product)
        db.flush()
        product_map[source_product.id] = cloned_product

    source_images = list(db.scalars(select(ProductImage).where(ProductImage.product_id.in_(product_map.keys()))).all())
    for source_image in source_images:
        db.add(
            ProductImage(
                product_id=product_map[source_image.product_id].id,
                image_url=source_image.image_url,
                alt_text=source_image.alt_text,
                sort_order=source_image.sort_order,
                is_primary=source_image.is_primary,
                created_at=source_image.created_at or now,
            )
        )

    source_videos = list(db.scalars(select(ProductVideo).where(ProductVideo.product_id.in_(product_map.keys()))).all())
    for source_video in source_videos:
        db.add(
            ProductVideo(
                product_id=product_map[source_video.product_id].id,
                video_url=source_video.video_url,
                platform=source_video.platform,
                thumbnail_url=source_video.thumbnail_url,
                sort_order=source_video.sort_order,
                created_at=source_video.created_at or now,
            )
        )

    source_prices = list(
        db.scalars(select(ProductPrice).where(ProductPrice.store_id == source_store.id)).all()
    )
    for source_price in source_prices:
        db.add(
            ProductPrice(
                product_id=product_map[source_price.product_id].id,
                brand_id=target_store.brand_id,
                store_id=target_store.id,
                source_id=source_price.source_id or source_price.id,
                source_version=source_price.source_version,
                price_type=source_price.price_type,
                member_level=source_price.member_level,
                min_qty=source_price.min_qty,
                currency_code=source_price.currency_code,
                amount=source_price.amount,
                compare_at_amount=source_price.compare_at_amount,
                starts_at=source_price.starts_at,
                ends_at=source_price.ends_at,
                is_active=source_price.is_active,
            )
        )

    source_promotions = list(db.scalars(select(Promotion).where(Promotion.store_id == source_store.id)).all())
    for source_promotion in source_promotions:
        mapped_rule = dict(source_promotion.rule_payload or {})
        source_product_id = mapped_rule.get("buy_product_id")
        if source_product_id in product_map:
            mapped_rule["buy_product_id"] = product_map[source_product_id].id
        db.add(
            Promotion(
                brand_id=target_store.brand_id,
                store_id=target_store.id,
                source_id=source_promotion.source_id or source_promotion.id,
                source_version=source_promotion.source_version,
                promotion_code=source_promotion.promotion_code,
                name=source_promotion.name,
                description=source_promotion.description,
                promotion_type=source_promotion.promotion_type,
                rule_payload=mapped_rule,
                allow_store_override=source_promotion.allow_store_override,
                created_by_center=source_promotion.created_by_center,
                priority=source_promotion.priority,
                starts_at=source_promotion.starts_at,
                ends_at=source_promotion.ends_at,
                status=source_promotion.status,
            )
        )

    source_banners = list(db.scalars(select(Banner).where(Banner.store_id == source_store.id)).all())
    for source_banner in source_banners:
        db.add(
            Banner(
                brand_id=target_store.brand_id,
                store_id=target_store.id,
                source_id=source_banner.source_id or source_banner.id,
                source_version=source_banner.source_version,
                title=source_banner.title,
                subtitle=source_banner.subtitle,
                image_url=source_banner.image_url,
                mobile_image_url=source_banner.mobile_image_url,
                target_url=source_banner.target_url,
                sort_order=source_banner.sort_order,
                starts_at=source_banner.starts_at,
                ends_at=source_banner.ends_at,
                is_active=source_banner.is_active,
            )
        )

    source_pages = list(db.scalars(select(ContentPage).where(ContentPage.store_id == source_store.id)).all())
    for source_page in source_pages:
        db.add(
            ContentPage(
                brand_id=target_store.brand_id,
                store_id=target_store.id,
                source_id=source_page.source_id or source_page.id,
                source_version=source_page.source_version,
                page_type=source_page.page_type,
                slug=source_page.slug,
                title=source_page.title,
                excerpt=source_page.excerpt,
                body_html=source_page.body_html,
                cover_image_url=source_page.cover_image_url,
                is_published=source_page.is_published,
                published_at=source_page.published_at,
                seo_title=source_page.seo_title,
                seo_description=source_page.seo_description,
                seo_keywords=source_page.seo_keywords,
            )
        )

    source_settings = list(db.scalars(select(AppSetting).where(AppSetting.store_id == source_store.id)).all())
    for source_setting in source_settings:
        db.add(
            AppSetting(
                brand_id=target_store.brand_id,
                store_id=target_store.id,
                setting_group=source_setting.setting_group,
                setting_key=source_setting.setting_key,
                setting_value=source_setting.setting_value,
                source_id=source_setting.source_id or source_setting.id,
                source_version=source_setting.source_version,
                is_public=source_setting.is_public,
            )
        )
    db.flush()


def _find_price_by_type(
    db: Session,
    *,
    product_id: str,
    store_id: str,
    price_type: PriceType,
    qty: int,
    member_level: str | None = None,
) -> ProductPrice | None:
    statement = (
        select(ProductPrice)
        .where(ProductPrice.product_id == product_id)
        .where(ProductPrice.store_id == store_id)
        .where(ProductPrice.is_active.is_(True))
        .where(ProductPrice.price_type == price_type)
        .where(ProductPrice.min_qty <= qty)
    )
    if member_level is not None:
        statement = statement.where(ProductPrice.member_level == member_level)
    return db.scalar(statement.order_by(ProductPrice.min_qty.desc()))


def _serialize_price(price: ProductPrice | None, label: str | None = None) -> dict:
    if price is None:
        return {
            "type": None,
            "amount": None,
            "min_qty": None,
            "member_level": None,
            "label": label,
        }
    return {
        "type": price.price_type.value,
        "amount": str(price.amount),
        "min_qty": price.min_qty,
        "member_level": price.member_level,
        "label": label,
    }


def build_product_pricing(
    db: Session,
    *,
    product_id: str,
    store_id: str,
    qty: int = 1,
    role: str = ROLE_GUEST,
    member_level: str | None = None,
) -> tuple[dict, ProductPrice | None]:
    retail = _find_price_by_type(
        db,
        product_id=product_id,
        store_id=store_id,
        price_type=PriceType.RETAIL,
        qty=qty,
    )

    reseller_member_level = member_level or RESELLER_MEMBER_LEVEL
    reseller = _find_price_by_type(
        db,
        product_id=product_id,
        store_id=store_id,
        price_type=PriceType.MEMBER,
        member_level=reseller_member_level,
        qty=qty,
    )
    if reseller is None and role == ROLE_RESELLER:
        reseller = _find_price_by_type(
            db,
            product_id=product_id,
            store_id=store_id,
            price_type=PriceType.WHOLESALE,
            qty=qty,
        )

    active = reseller if role == ROLE_RESELLER and reseller is not None else retail or reseller
    mode = PRICING_MODE_RESELLER if role == ROLE_RESELLER and reseller is not None else PRICING_MODE_RETAIL
    bundle = {
        "mode": mode,
        "label": "Harga Reseller" if mode == PRICING_MODE_RESELLER else "Harga Umum",
        "active": _serialize_price(active, label="Harga aktif"),
        "retail": _serialize_price(retail, label="Harga umum"),
        "reseller": _serialize_price(reseller, label="Harga reseller"),
    }
    return bundle, active


def resolve_price(
    db: Session,
    product_id: str,
    store_id: str,
    qty: int = 1,
    member_level: str | None = None,
    role: str = ROLE_GUEST,
) -> ProductPrice | None:
    _, active = build_product_pricing(
        db,
        product_id=product_id,
        store_id=store_id,
        qty=qty,
        member_level=member_level,
        role=role,
    )
    return active


def find_reseller_credential(db: Session, store_id: str, username: str) -> ResellerCredential | None:
    return db.scalar(
        select(ResellerCredential)
        .where(ResellerCredential.store_id == store_id)
        .where(ResellerCredential.username == normalize_username(username))
        .where(ResellerCredential.is_active.is_(True))
    )


def get_or_create_customer_cart(db: Session, store: Store, customer: Customer, channel: str = "ANDROID") -> Cart:
    cart = db.scalar(
        select(Cart)
        .where(Cart.store_id == store.id)
        .where(Cart.customer_id == customer.id)
        .where(Cart.status == CartStatus.ACTIVE)
    )
    if cart is None:
        cart = Cart(
            brand_id=store.brand_id,
            store_id=store.id,
            customer_id=customer.id,
            channel=channel,
            status=CartStatus.ACTIVE,
        )
        db.add(cart)
        db.flush()
    return cart


def resolve_cart_for_customer(db: Session, store: Store, customer: Customer) -> Cart:
    return get_or_create_customer_cart(db, store, customer)


def product_media(db: Session, product_id: str) -> tuple[list[ProductImage], list[ProductVideo]]:
    images = list(
        db.scalars(select(ProductImage).where(ProductImage.product_id == product_id).order_by(ProductImage.sort_order)).all()
    )
    videos = list(
        db.scalars(select(ProductVideo).where(ProductVideo.product_id == product_id).order_by(ProductVideo.sort_order)).all()
    )
    return images, videos


def active_promotions(db: Session, store_id: str) -> list[Promotion]:
    now = utcnow()
    return list(
        db.scalars(
            select(Promotion)
            .where(Promotion.store_id == store_id)
            .where(Promotion.status == PromotionStatus.ACTIVE)
            .where(or_(Promotion.starts_at.is_(None), Promotion.starts_at <= now))
            .where(or_(Promotion.ends_at.is_(None), Promotion.ends_at >= now))
            .order_by(Promotion.priority.desc())
        ).all()
    )


def serialize_product(
    db: Session,
    product: Product,
    member_level: str | None = None,
    qty: int = 1,
    role: str = ROLE_GUEST,
) -> dict:
    pricing, price = build_product_pricing(
        db,
        product_id=product.id,
        store_id=product.store_id,
        qty=qty,
        member_level=member_level,
        role=role,
    )
    images, videos = product_media(db, product.id)
    return {
        "id": product.id,
        "sku": product.sku,
        "slug": product.slug,
        "name": product.name,
        "summary": product.summary,
        "description": product.description,
        "product_type": product.product_type.value,
        "unit": product.unit,
        "weight_grams": str(product.weight_grams),
        "badges": {
            "featured": product.is_featured,
            "new_arrival": product.is_new_arrival,
            "best_seller": product.is_best_seller,
        },
        "price": pricing["active"],
        "pricing": pricing,
        "images": [
            {
                "id": image.id,
                "url": image.image_url,
                "alt_text": image.alt_text,
                "is_primary": image.is_primary,
            }
            for image in images
        ],
        "videos": [
            {
                "id": video.id,
                "url": video.video_url,
                "platform": video.platform,
                "thumbnail_url": video.thumbnail_url,
            }
            for video in videos
        ],
        "seo": {
            "title": product.seo_title or product.name,
            "description": product.seo_description or product.summary,
            "keywords": product.seo_keywords,
        },
    }


def get_or_create_guest_cart(db: Session, store: Store) -> Cart:
    cart = Cart(brand_id=store.brand_id, store_id=store.id, status=CartStatus.ACTIVE)
    db.add(cart)
    db.flush()
    return cart


def resolve_cart_for_guest(db: Session, cart_id: str, guest_token: str) -> Cart:
    cart = db.scalar(select(Cart).where(Cart.id == cart_id).where(Cart.guest_token == guest_token))
    if cart is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Keranjang tidak ditemukan")
    return cart


def recalculate_cart(
    db: Session,
    cart: Cart,
    *,
    role: str = ROLE_GUEST,
    member_level: str | None = None,
) -> Cart:
    items = list(db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all())
    subtotal = Decimal("0")
    discount_total = Decimal("0")
    promotions = active_promotions(db, cart.store_id)
    for item in items:
        pricing, price = build_product_pricing(
            db,
            product_id=item.product_id,
            store_id=cart.store_id,
            qty=item.qty,
            member_level=member_level,
            role=role,
        )
        if price is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Harga produk belum tersedia")
        item.price_snapshot = pricing["active"] | {"pricing_mode": pricing["mode"]}
        item.discount_snapshot = {"amount": "0"}
        item.promotion_snapshot = {"matched_promotions": []}
        for promo in promotions:
            buy_product_id = promo.rule_payload.get("buy_product_id")
            buy_qty = int(promo.rule_payload.get("buy_qty", 0))
            if buy_product_id == item.product_id and item.qty >= buy_qty:
                item.promotion_snapshot["matched_promotions"].append(
                    {
                        "promotion_code": promo.promotion_code,
                        "name": promo.name,
                        "benefit": promo.rule_payload.get("free_product_name"),
                    }
                )
        item.subtotal = Decimal(item.qty) * Decimal(price.amount)
        item.total = item.subtotal
        subtotal += item.subtotal

    cart.subtotal = subtotal
    cart.discount_total = discount_total
    cart.grand_total = subtotal - discount_total
    db.flush()
    return cart


def create_or_update_customer(
    db: Session,
    *,
    store: Store,
    full_name: str,
    phone: str | None,
    email: str | None,
    auth_provider: str,
    is_guest: bool,
    google_sub: str | None = None,
    whatsapp_verified: bool = False,
) -> Customer:
    normalized_phone = normalize_phone(phone) if phone else None
    normalized_email = email.lower() if email else None
    customer = None
    if google_sub:
        customer = db.scalar(select(Customer).where(Customer.google_sub == google_sub))
    if customer is None and normalized_email:
        customer = db.scalar(select(Customer).where(Customer.email == normalized_email).where(Customer.store_id == store.id))
    if customer is None and normalized_phone:
        customer = db.scalar(select(Customer).where(Customer.phone == normalized_phone).where(Customer.store_id == store.id))

    if customer is None:
        customer = Customer(
            brand_id=store.brand_id,
            store_id=store.id,
            customer_code=f"CUST-{utcnow():%Y%m%d%H%M%S}-{random.randint(100,999)}",
            full_name=full_name,
            phone=normalized_phone,
            email=normalized_email,
            google_sub=google_sub,
            auth_provider=auth_provider,
            is_guest=is_guest,
            whatsapp_verified_at=utcnow() if whatsapp_verified else None,
        )
        db.add(customer)
    else:
        customer.full_name = full_name or customer.full_name
        customer.phone = normalized_phone or customer.phone
        customer.email = normalized_email or customer.email
        customer.auth_provider = auth_provider
        customer.google_sub = google_sub or customer.google_sub
        customer.is_guest = is_guest
        if whatsapp_verified:
            customer.whatsapp_verified_at = utcnow()
    db.flush()
    return customer


def create_otp_challenge(db: Session, phone: str) -> OtpChallenge:
    challenge = OtpChallenge(
        phone=normalize_phone(phone),
        otp_code=f"{random.randint(0, 999999):06d}",
        expires_at=utcnow() + timedelta(minutes=5),
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge


def verify_otp_challenge(db: Session, challenge_id: str, otp_code: str) -> OtpChallenge:
    challenge = db.get(OtpChallenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OTP challenge tidak ditemukan")
    if challenge.verified_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP sudah dipakai")
    expires_at = challenge.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if expires_at < utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP sudah kadaluarsa")
    if challenge.otp_code != otp_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP salah")
    challenge.verified_at = utcnow()
    db.flush()
    return challenge


def create_order_from_cart(
    db: Session,
    *,
    cart: Cart,
    customer: Customer,
    shipping_method: str,
    address_snapshot: dict,
    payment_method: str,
    notes: str | None,
    checkout_rules: dict | None = None,
) -> Order:
    role = determine_customer_role(customer)
    rules = checkout_rules or serialize_checkout_rules(db, cart.store_id, role)
    recalculate_cart(db, cart, role=role, member_level=customer.member_tier)
    items = list(db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all())
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Keranjang kosong")

    order = Order(
        brand_id=cart.brand_id,
        store_id=cart.store_id,
        customer_id=customer.id,
        cart_id=cart.id,
        order_number=f"KS-{utcnow():%Y%m%d%H%M%S}-{random.randint(100,999)}",
        channel=cart.channel,
        checkout_type="GUEST" if customer.is_guest else "AUTHENTICATED",
        customer_snapshot={
            "id": customer.id,
            "full_name": customer.full_name,
            "phone": customer.phone,
            "email": customer.email,
            "role": role,
        },
        address_snapshot=address_snapshot,
        pricing_snapshot={
            "payment_method": payment_method,
            "shipping_method": shipping_method,
            "pricing_mode": determine_pricing_mode(role),
            "invoice_source": rules["invoice_source"],
            "minimum_order_amount": rules["minimum_order_amount"],
        },
        notes=notes,
        subtotal=cart.subtotal,
        discount_total=cart.discount_total,
        shipping_total=Decimal("0"),
        grand_total=cart.grand_total,
        payment_due_at=utcnow() + timedelta(hours=24),
        auto_cancel_at=utcnow() + timedelta(hours=24),
        sync_status=SyncStatus.PENDING,
        idempotency_key=str(uuid4()),
    )
    db.add(order)
    db.flush()

    products = list(db.scalars(select(Product).where(Product.id.in_([item.product_id for item in items]))).all()) if items else []
    product_lookup = {product.id: product for product in products}
    for cart_item in items:
        product = product_lookup.get(cart_item.product_id)
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                product_snapshot=cart_item.price_snapshot
                | {
                    "product_id": cart_item.product_id,
                    "product_name": product.name if product else None,
                    "product_slug": product.slug if product else None,
                    "product_unit": product.unit if product else None,
                },
                qty=cart_item.qty,
                unit_price=Decimal(cart_item.price_snapshot["amount"]),
                discount_total=Decimal("0"),
                line_total=cart_item.total,
                created_at=utcnow(),
            )
        )

    db.add(
        Invoice(
            order_id=order.id,
            invoice_number=f"INV-PTH-{utcnow():%Y%m%d%H%M%S}-{random.randint(100,999)}",
            invoice_type=InvoiceType.PUTIH,
            document_url=f"/documents/invoices/{order.order_number}-putih.pdf",
            printed_at=None,
            created_at=utcnow(),
        )
    )
    if payment_method.upper() in {"COD", "TEMPO"}:
        db.add(
            Invoice(
                order_id=order.id,
                invoice_number=f"INV-MRH-{utcnow():%Y%m%d%H%M%S}-{random.randint(100,999)}",
                invoice_type=InvoiceType.MERAH,
                document_url=f"/documents/invoices/{order.order_number}-merah.pdf",
                printed_at=None,
                created_at=utcnow(),
            )
        )

    db.add(
        Shipment(
            order_id=order.id,
            shipment_number=f"SHP-{utcnow():%Y%m%d%H%M%S}-{random.randint(100,999)}",
            delivery_method=shipping_method.upper(),
            pickup_store_code=settings.default_store_code if shipping_method.upper() == "PICKUP" else None,
            status=ShipmentStatus.PENDING,
        )
    )
    db.add(
        SyncLog(
            direction=SyncDirection.OUTBOUND,
            entity_type="order",
            entity_id=order.id,
            store_id=order.store_id,
            idempotency_key=order.idempotency_key,
            status=SyncStatus.PENDING,
            payload_hash=hashlib.sha256(order.order_number.encode()).hexdigest(),
            payload_json={"order_number": order.order_number, "grand_total": str(order.grand_total)},
        )
    )
    cart.status = CartStatus.CHECKED_OUT
    customer.last_order_at = utcnow()
    db.commit()
    db.refresh(order)
    return order


def create_duitku_payment(db: Session, order: Order, callback_url: str, return_url: str) -> Payment:
    existing = db.scalar(select(Payment).where(Payment.order_id == order.id).where(Payment.status != PaymentStatus.FAILED))
    if existing:
        return existing

    reference = f"REF-{utcnow():%Y%m%d%H%M%S}-{random.randint(100,999)}"
    payment = Payment(
        order_id=order.id,
        payment_reference=reference,
        gateway_code="duitku",
        method_code="duitku-va",
        amount=order.grand_total,
        status=PaymentStatus.PENDING,
        settlement_payload={
            "merchantCode": settings.duitku_merchant_code,
            "merchantOrderId": order.order_number,
            "paymentAmount": str(order.grand_total.quantize(Decimal('1'))),
            "signature": hashlib.md5(
                f"{settings.duitku_merchant_code}{order.order_number}{int(order.grand_total)}{settings.duitku_api_key}".encode()
            ).hexdigest(),
            "callbackUrl": callback_url,
            "returnUrl": return_url,
        },
        idempotency_key=f"duitku-{order.order_number}",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def apply_duitku_callback(db: Session, form_data: dict[str, str]) -> Payment:
    merchant_order_id = form_data["merchantOrderId"]
    amount = form_data["amount"]
    signature = form_data["signature"]
    expected_signature = hashlib.md5(
        f"{settings.duitku_merchant_code}{amount}{merchant_order_id}{settings.duitku_api_key}".encode()
    ).hexdigest()
    if signature != expected_signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signature callback tidak valid")

    order = db.scalar(select(Order).where(Order.order_number == merchant_order_id))
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order tidak ditemukan")
    payment = db.scalar(select(Payment).where(Payment.order_id == order.id))
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment tidak ditemukan")
    if Decimal(amount) != Decimal(order.grand_total):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount callback tidak cocok")

    result_code = form_data.get("resultCode", "01")
    payment.gateway_transaction_id = form_data.get("reference")
    payment.callback_signature = signature
    payment.callback_payload = form_data
    if result_code == "00":
        payment.status = PaymentStatus.PAID
        payment.paid_at = utcnow()
        order.payment_status = PaymentStatus.PAID
        order.status = OrderStatus.DIBAYAR
        order.fulfillment_status = FulfillmentStatus.DIPROSES
    else:
        payment.status = PaymentStatus.FAILED
        order.payment_status = PaymentStatus.FAILED

    sync_log = db.scalar(select(SyncLog).where(SyncLog.entity_type == "order").where(SyncLog.entity_id == order.id))
    if sync_log:
        sync_log.status = SyncStatus.SYNCED if payment.status == PaymentStatus.PAID else SyncStatus.FAILED
        sync_log.processed_at = utcnow()
    db.commit()
    db.refresh(payment)
    return payment


def build_sync_manifest(db: Session, store: Store, since_version: int) -> dict:
    categories = list(db.scalars(select(Category).where(Category.store_id == store.id).where(Category.source_version > since_version)).all())
    products = list(db.scalars(select(Product).where(Product.store_id == store.id).where(Product.source_version > since_version)).all())
    prices = list(
        db.scalars(
            select(ProductPrice)
            .where(ProductPrice.store_id == store.id)
            .where(ProductPrice.source_version > since_version)
        ).all()
    )
    banners = list(db.scalars(select(Banner).where(Banner.store_id == store.id).where(Banner.source_version > since_version)).all())
    pages = list(db.scalars(select(ContentPage).where(ContentPage.store_id == store.id).where(ContentPage.source_version > since_version)).all())
    payment_methods = list(
        db.scalars(
            select(PaymentMethod)
            .where(PaymentMethod.store_id == store.id)
            .where(PaymentMethod.source_version > since_version)
        ).all()
    )
    settings_rows = list(
        db.scalars(select(AppSetting).where(AppSetting.store_id == store.id).where(AppSetting.source_version > since_version)).all()
    )
    max_version = max(
        [since_version]
        + [row.source_version for row in categories]
        + [row.source_version for row in products]
        + [row.source_version for row in prices]
        + [row.source_version for row in banners]
        + [row.source_version for row in pages]
        + [row.source_version for row in payment_methods]
        + [row.source_version for row in settings_rows]
    )
    payload = {
        "cursor": f"{utcnow().isoformat()}:{max_version}",
        "etag": hashlib.sha256(f"{store.id}:{max_version}".encode()).hexdigest(),
        "categories": [{"id": row.id, "slug": row.slug, "name": row.name, "version": row.source_version} for row in categories],
        "products": [{"id": row.id, "slug": row.slug, "name": row.name, "version": row.source_version} for row in products],
        "prices": [{"id": row.id, "product_id": row.product_id, "amount": str(row.amount), "version": row.source_version} for row in prices],
        "banners": [{"id": row.id, "title": row.title, "version": row.source_version} for row in banners],
        "content_pages": [{"id": row.id, "slug": row.slug, "title": row.title, "version": row.source_version} for row in pages],
        "payment_methods": [
            {"id": row.id, "code": row.code, "name": row.name, "type": row.payment_type.value, "version": row.source_version}
            for row in payment_methods
        ],
        "settings": [
            {"id": row.id, "group": row.setting_group, "key": row.setting_key, "value": row.setting_value, "version": row.source_version}
            for row in settings_rows
        ],
        "deleted_ids": {"products": [], "categories": []},
    }
    db.add(
        SyncLog(
            direction=SyncDirection.INBOUND,
            entity_type="cache-manifest",
            entity_id=store.id,
            store_id=store.id,
            source_version=max_version,
            status=SyncStatus.SYNCED,
            payload_hash=hashlib.sha256(str(payload).encode()).hexdigest(),
            payload_json={"since_version": since_version, "cursor": payload["cursor"]},
            processed_at=utcnow(),
        )
    )
    db.commit()
    return payload
