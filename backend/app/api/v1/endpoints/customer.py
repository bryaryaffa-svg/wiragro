from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_customer
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_guest_token, hash_password, verify_password
from app.models import Cart, CartItem, Customer, CustomerAddress, Invoice, Order, OrderItem, Payment, Product, ResellerCredential, Shipment, Store, WishlistItem
from app.models.enums import InvoiceType
from app.schemas.customer import (
    AddAuthenticatedCartItemRequest,
    AddCartItemRequest,
    AuthenticatedCheckoutRequest,
    CustomerAddressUpsertRequest,
    CreateGuestCartRequest,
    GoogleLoginRequest,
    GuestCheckoutRequest,
    ResellerActivationRequest,
    ResellerLoginRequest,
    ResellerSetPasswordRequest,
    UpdateCustomerProfileRequest,
    UpdateAuthenticatedCartItemRequest,
    UpdateCartItemRequest,
    WhatsAppOtpRequest,
    WhatsAppOtpVerifyRequest,
    WishlistAddRequest,
)
from app.services.commerce import (
    RESELLER_MEMBER_LEVEL,
    create_or_update_customer,
    create_order_from_cart,
    create_otp_challenge,
    determine_customer_role,
    determine_pricing_mode,
    find_reseller_credential,
    get_or_create_guest_cart,
    normalize_phone,
    recalculate_cart,
    require_store,
    resolve_cart_for_customer,
    resolve_cart_for_guest,
    serialize_checkout_rules,
    serialize_product,
    serialize_session,
    utcnow,
    validate_checkout_constraints,
    verify_otp_challenge,
)
from app.services.google_identity import verify_google_id_token

router = APIRouter()


def _serialize_cart(
    db: Session,
    cart: Cart,
    *,
    role: str,
    member_level: str | None = None,
) -> dict:
    cart = recalculate_cart(db, cart, role=role, member_level=member_level)
    items = list(db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all())
    product_ids = [item.product_id for item in items]
    products = list(db.scalars(select(Product).where(Product.id.in_(product_ids))).all()) if product_ids else []
    product_lookup = {product.id: product for product in products}
    return {
        "id": cart.id,
        "guest_token": cart.guest_token,
        "status": cart.status.value,
        "subtotal": str(cart.subtotal),
        "discount_total": str(cart.discount_total),
        "grand_total": str(cart.grand_total),
        "pricing_mode": "reseller" if role == "reseller" else "retail",
        "customer_role": role,
        "checkout_rules": serialize_checkout_rules(db, cart.store_id, role),
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": product_lookup.get(item.product_id).name if product_lookup.get(item.product_id) else None,
                "qty": item.qty,
                "price_snapshot": item.price_snapshot,
                "promotion_snapshot": item.promotion_snapshot,
                "subtotal": str(item.subtotal),
                "total": str(item.total),
            }
            for item in items
        ],
    }


def _serialize_checkout_response(order: Order, db: Session) -> dict:
    invoices = list(db.scalars(select(Invoice).where(Invoice.order_id == order.id)).all())
    payment_method = order.pricing_snapshot.get("payment_method")
    return {
        "order": {
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status.value,
            "payment_status": order.payment_status.value,
            "grand_total": str(order.grand_total),
            "auto_cancel_at": order.auto_cancel_at,
            "shipping_method": order.pricing_snapshot.get("shipping_method"),
            "payment_method": payment_method,
            "invoice_source": order.pricing_snapshot.get("invoice_source"),
            "customer_role": order.customer_snapshot.get("role"),
        },
        "payment_instruction": {
            "method": payment_method,
            "status": "pending",
        },
        "next_action": "await_cod_confirmation" if str(payment_method).upper() == "COD" else "redirect_payment",
        "invoices": [{"type": invoice.invoice_type.value, "document_url": invoice.document_url} for invoice in invoices],
    }


def _serialize_address(address: CustomerAddress) -> dict:
    return {
        "id": address.id,
        "label": address.label,
        "recipient_name": address.recipient_name,
        "recipient_phone": address.recipient_phone,
        "address_line": address.address_line,
        "district": address.district,
        "city": address.city,
        "province": address.province,
        "postal_code": address.postal_code,
        "notes": address.notes,
        "is_default": address.is_default,
    }


def _serialize_customer_profile(db: Session, customer: Customer) -> dict:
    username = None
    if determine_customer_role(customer) == "reseller":
        credential = db.scalar(select(ResellerCredential).where(ResellerCredential.customer_id == customer.id))
        username = credential.username if credential else None
    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "phone": customer.phone,
        "email": customer.email,
        "member_tier": customer.member_tier,
        "username": username,
    }


def _serialize_account_snapshot(db: Session, customer: Customer) -> dict:
    role = determine_customer_role(customer)
    addresses = list(
        db.scalars(
            select(CustomerAddress)
            .where(CustomerAddress.customer_id == customer.id)
            .order_by(CustomerAddress.is_default.desc(), CustomerAddress.created_at.desc())
        ).all()
    )
    return {
        "customer": _serialize_customer_profile(db, customer),
        "role": role,
        "pricing_mode": determine_pricing_mode(role),
        "addresses": [_serialize_address(address) for address in addresses],
    }


def _ensure_default_address(db: Session, customer_id: str, preferred_address_id: str | None = None) -> None:
    addresses = list(
        db.scalars(
            select(CustomerAddress)
            .where(CustomerAddress.customer_id == customer_id)
            .order_by(CustomerAddress.created_at.asc())
        ).all()
    )
    if not addresses:
        return

    default_id = preferred_address_id
    if default_id is None:
        current_default = next((address.id for address in addresses if address.is_default), None)
        default_id = current_default or addresses[0].id

    for address in addresses:
        address.is_default = address.id == default_id


def _serialize_order_summary(order: Order) -> dict:
    return {
        "id": order.id,
        "order_number": order.order_number,
        "status": order.status.value,
        "payment_status": order.payment_status.value,
        "fulfillment_status": order.fulfillment_status.value,
        "grand_total": str(order.grand_total),
        "created_at": order.created_at,
        "shipping_method": order.pricing_snapshot.get("shipping_method"),
        "payment_method": order.pricing_snapshot.get("payment_method"),
        "invoice_source": order.pricing_snapshot.get("invoice_source"),
        "customer_role": order.customer_snapshot.get("role"),
    }


def _serialize_order_detail(db: Session, order: Order) -> dict:
    shipment = db.scalar(select(Shipment).where(Shipment.order_id == order.id))
    payment = db.scalar(select(Payment).where(Payment.order_id == order.id))
    invoices = list(db.scalars(select(Invoice).where(Invoice.order_id == order.id)).all())
    rows = list(db.scalars(select(OrderItem).where(OrderItem.order_id == order.id)).all())
    product_ids = [row.product_id for row in rows]
    products = list(db.scalars(select(Product).where(Product.id.in_(product_ids))).all()) if product_ids else []
    product_lookup = {product.id: product for product in products}
    return {
        **_serialize_order_summary(order),
        "payment_due_at": order.payment_due_at,
        "auto_cancel_at": order.auto_cancel_at,
        "notes": order.notes,
        "customer": order.customer_snapshot,
        "address": order.address_snapshot,
        "pricing": order.pricing_snapshot,
        "shipment": {
            "shipment_number": shipment.shipment_number if shipment else None,
            "status": shipment.status.value if shipment else None,
            "tracking_number": shipment.tracking_number if shipment else None,
            "delivery_method": shipment.delivery_method if shipment else None,
            "pickup_store_code": shipment.pickup_store_code if shipment else None,
        },
        "payment": {
            "reference": payment.payment_reference if payment else None,
            "status": payment.status.value if payment else None,
            "gateway_code": payment.gateway_code if payment else None,
            "method_code": payment.method_code if payment else None,
            "amount": str(payment.amount) if payment else None,
            "paid_at": payment.paid_at if payment else None,
        },
        "can_pay_online": order.payment_status.value == "UNPAID" and str(order.pricing_snapshot.get("payment_method")).lower() == "duitku-va",
        "items": [
            {
                "id": row.id,
                "product_id": row.product_id,
                "product_name": product_lookup.get(row.product_id).name if product_lookup.get(row.product_id) else row.product_snapshot.get("product_name"),
                "product_slug": product_lookup.get(row.product_id).slug if product_lookup.get(row.product_id) else row.product_snapshot.get("product_slug"),
                "qty": row.qty,
                "unit_price": str(row.unit_price),
                "discount_total": str(row.discount_total),
                "line_total": str(row.line_total),
                "price_snapshot": row.product_snapshot,
            }
            for row in rows
        ],
        "invoices": [{"type": invoice.invoice_type.value, "document_url": invoice.document_url} for invoice in invoices],
    }


def _require_customer_order(order: Order | None, current_customer: Customer) -> Order:
    if order is None or order.customer_id != current_customer.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order tidak ditemukan untuk akun ini")
    return order


@router.post("/auth/google")
def login_google(payload: GoogleLoginRequest, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, payload.store_code)
    claims = verify_google_id_token(payload.id_token)
    email = claims["email"].lower()
    google_sub = claims["sub"]
    full_name = claims.get("name") or email.split("@", 1)[0]
    customer = create_or_update_customer(
        db,
        store=store,
        full_name=full_name,
        phone=None,
        email=email,
        auth_provider="google",
        is_guest=False,
        google_sub=google_sub,
    )
    db.commit()
    return serialize_session(customer, mode="google-oidc")


@router.post("/auth/whatsapp/request-otp")
def request_otp(payload: WhatsAppOtpRequest, db: Session = Depends(get_db)) -> dict:
    require_store(db, payload.store_code)
    challenge = create_otp_challenge(db, payload.phone)
    response = {"challenge_id": challenge.id, "expires_in_seconds": 300}
    if settings.app_debug:
        response["debug_otp_code"] = challenge.otp_code
    return response


@router.post("/auth/whatsapp/verify-otp")
def verify_otp(payload: WhatsAppOtpVerifyRequest, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, payload.store_code)
    challenge = verify_otp_challenge(db, payload.challenge_id, payload.otp_code)
    customer = create_or_update_customer(
        db,
        store=store,
        full_name=f"Pelanggan {challenge.phone[-4:]}",
        phone=challenge.phone,
        email=None,
        auth_provider="whatsapp",
        is_guest=False,
        whatsapp_verified=True,
    )
    db.commit()
    return serialize_session(customer, mode="whatsapp-otp")


@router.post("/auth/reseller/activate/check")
def check_reseller_activation(payload: ResellerActivationRequest, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, payload.store_code)
    credential = find_reseller_credential(db, store.id, payload.username)
    if credential is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Username reseller tidak ditemukan")

    status_value = "ready_for_login" if credential.password_hash else "activation_required"
    return {
        "username": credential.username,
        "status": status_value,
        "can_set_password": credential.password_hash is None,
        "message": (
            "Username reseller valid dan siap aktivasi password."
            if credential.password_hash is None
            else "Username reseller sudah aktif. Silakan login dengan password reseller."
        ),
    }


@router.post("/auth/reseller/set-password")
def set_reseller_password(payload: ResellerSetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, payload.store_code)
    credential = find_reseller_credential(db, store.id, payload.username)
    if credential is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Username reseller tidak ditemukan")
    if credential.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reseller sudah aktif. Silakan login dengan username dan password reseller.",
        )

    credential.password_hash = hash_password(payload.password)
    credential.password_set_at = credential.activated_at = utcnow()
    customer = db.get(Customer, credential.customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Akun reseller tidak ditemukan")
    customer.auth_provider = "reseller"
    customer.is_guest = False
    customer.member_tier = RESELLER_MEMBER_LEVEL
    db.commit()
    return {
        "status": "password_set",
        "username": credential.username,
        "message": "Password reseller berhasil disimpan. Silakan login sebagai reseller.",
    }


@router.post("/auth/reseller/login")
def login_reseller(payload: ResellerLoginRequest, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, payload.store_code)
    credential = find_reseller_credential(db, store.id, payload.username)
    if credential is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Username reseller tidak ditemukan")
    if not credential.password_hash:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password reseller belum diatur. Aktivasi akun reseller terlebih dahulu.")
    if not verify_password(payload.password, credential.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Username atau password reseller tidak valid")

    customer = db.get(Customer, credential.customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Akun reseller tidak ditemukan")
    customer.auth_provider = "reseller"
    customer.is_guest = False
    customer.member_tier = RESELLER_MEMBER_LEVEL
    db.commit()
    return serialize_session(customer, mode="reseller-password", reseller_username=credential.username)


@router.get("/me")
def get_my_account(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    return _serialize_account_snapshot(db, current_customer)


@router.patch("/me")
def update_my_account(
    payload: UpdateCustomerProfileRequest,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    current_customer.full_name = payload.full_name.strip()
    current_customer.phone = normalize_phone(payload.phone) if payload.phone else None
    current_customer.email = payload.email.lower() if payload.email else None
    db.commit()
    db.refresh(current_customer)
    return _serialize_account_snapshot(db, current_customer)


@router.get("/me/addresses")
def list_my_addresses(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    addresses = list(
        db.scalars(
            select(CustomerAddress)
            .where(CustomerAddress.customer_id == current_customer.id)
            .order_by(CustomerAddress.is_default.desc(), CustomerAddress.created_at.desc())
        ).all()
    )
    return {"items": [_serialize_address(address) for address in addresses]}


@router.post("/me/addresses")
def create_my_address(
    payload: CustomerAddressUpsertRequest,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    address = CustomerAddress(
        customer_id=current_customer.id,
        label=payload.label.strip(),
        recipient_name=payload.recipient_name.strip(),
        recipient_phone=normalize_phone(payload.recipient_phone),
        address_line=payload.address_line.strip(),
        district=payload.district.strip() if payload.district else None,
        city=payload.city.strip(),
        province=payload.province.strip(),
        postal_code=payload.postal_code.strip() if payload.postal_code else None,
        notes=payload.notes.strip() if payload.notes else None,
        is_default=False,
    )
    db.add(address)
    db.flush()
    _ensure_default_address(
        db,
        current_customer.id,
        preferred_address_id=address.id if payload.is_default else None,
    )
    db.commit()
    db.refresh(address)
    return {"status": "saved", "address": _serialize_address(address)}


@router.patch("/me/addresses/{address_id}")
def update_my_address(
    address_id: str,
    payload: CustomerAddressUpsertRequest,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    address = db.scalar(
        select(CustomerAddress)
        .where(CustomerAddress.id == address_id)
        .where(CustomerAddress.customer_id == current_customer.id)
    )
    if address is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alamat tidak ditemukan")

    address.label = payload.label.strip()
    address.recipient_name = payload.recipient_name.strip()
    address.recipient_phone = normalize_phone(payload.recipient_phone)
    address.address_line = payload.address_line.strip()
    address.district = payload.district.strip() if payload.district else None
    address.city = payload.city.strip()
    address.province = payload.province.strip()
    address.postal_code = payload.postal_code.strip() if payload.postal_code else None
    address.notes = payload.notes.strip() if payload.notes else None
    _ensure_default_address(
        db,
        current_customer.id,
        preferred_address_id=address.id if payload.is_default else None,
    )
    db.commit()
    db.refresh(address)
    return {"status": "saved", "address": _serialize_address(address)}


@router.delete("/me/addresses/{address_id}")
def delete_my_address(
    address_id: str,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    address = db.scalar(
        select(CustomerAddress)
        .where(CustomerAddress.id == address_id)
        .where(CustomerAddress.customer_id == current_customer.id)
    )
    if address is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alamat tidak ditemukan")

    was_default = address.is_default
    db.delete(address)
    db.flush()
    if was_default:
        _ensure_default_address(db, current_customer.id)
    db.commit()
    return {"status": "removed", "address_id": address_id}


@router.post("/carts/guest")
def create_guest_cart(payload: CreateGuestCartRequest, db: Session = Depends(get_db)) -> dict:
    store = require_store(db, payload.store_code)
    cart = get_or_create_guest_cart(db, store)
    cart.guest_token = create_guest_token(cart.id)
    db.commit()
    db.refresh(cart)
    return {"cart_id": cart.id, "guest_token": cart.guest_token}


@router.get("/carts/current")
def current_cart(
    cart_id: str = Query(...),
    guest_token: str = Query(...),
    db: Session = Depends(get_db),
) -> dict:
    cart = resolve_cart_for_guest(db, cart_id, guest_token)
    return _serialize_cart(db, cart, role="guest")


@router.post("/carts/items")
def add_cart_item(payload: AddCartItemRequest, db: Session = Depends(get_db)) -> dict:
    cart = resolve_cart_for_guest(db, payload.cart_id, payload.guest_token)
    existing = db.scalar(select(CartItem).where(CartItem.cart_id == cart.id).where(CartItem.product_id == payload.product_id))
    if existing:
        existing.qty = payload.qty
    else:
        db.add(CartItem(cart_id=cart.id, product_id=payload.product_id, qty=payload.qty))
    db.flush()
    db.commit()
    db.refresh(cart)
    return _serialize_cart(db, cart, role="guest")


@router.patch("/carts/items/{item_id}")
def update_cart_item(item_id: str, payload: UpdateCartItemRequest, db: Session = Depends(get_db)) -> dict:
    cart = resolve_cart_for_guest(db, payload.cart_id, payload.guest_token)
    item = db.scalar(select(CartItem).where(CartItem.id == item_id).where(CartItem.cart_id == cart.id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item keranjang tidak ditemukan")
    if payload.qty == 0:
        db.delete(item)
    else:
        item.qty = payload.qty
    db.commit()
    db.refresh(cart)
    return _serialize_cart(db, cart, role="guest")


@router.get("/carts/me")
def current_customer_cart(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    store = db.get(Store, current_customer.store_id)
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store tidak ditemukan")
    cart = resolve_cart_for_customer(db, store, current_customer)
    role = determine_customer_role(current_customer)
    return _serialize_cart(db, cart, role=role, member_level=current_customer.member_tier)


@router.post("/carts/me/items")
def add_customer_cart_item(
    payload: AddAuthenticatedCartItemRequest,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    store = db.get(Store, current_customer.store_id)
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store tidak ditemukan")
    product = db.scalar(
        select(Product)
        .where(Product.id == payload.product_id)
        .where(Product.store_id == store.id)
        .where(Product.is_active.is_(True))
    )
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produk tidak ditemukan")

    cart = resolve_cart_for_customer(db, store, current_customer)
    existing = db.scalar(select(CartItem).where(CartItem.cart_id == cart.id).where(CartItem.product_id == payload.product_id))
    if existing:
        existing.qty += payload.qty
    else:
        db.add(CartItem(cart_id=cart.id, product_id=payload.product_id, qty=payload.qty))
    db.flush()
    db.commit()
    db.refresh(cart)
    role = determine_customer_role(current_customer)
    return _serialize_cart(db, cart, role=role, member_level=current_customer.member_tier)


@router.patch("/carts/me/items/{item_id}")
def update_customer_cart_item(
    item_id: str,
    payload: UpdateAuthenticatedCartItemRequest,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    store = db.get(Store, current_customer.store_id)
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store tidak ditemukan")
    cart = resolve_cart_for_customer(db, store, current_customer)
    item = db.scalar(select(CartItem).where(CartItem.id == item_id).where(CartItem.cart_id == cart.id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item keranjang tidak ditemukan")
    if payload.qty == 0:
        db.delete(item)
    else:
        item.qty = payload.qty
    db.commit()
    db.refresh(cart)
    role = determine_customer_role(current_customer)
    return _serialize_cart(db, cart, role=role, member_level=current_customer.member_tier)


@router.post("/checkout/guest")
def checkout_guest(payload: GuestCheckoutRequest, db: Session = Depends(get_db)) -> dict:
    cart = resolve_cart_for_guest(db, payload.cart_id, payload.guest_token)
    store = db.get(Store, cart.store_id)
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store tidak ditemukan")
    if payload.shipping_method.lower() == "delivery" and payload.address is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alamat wajib untuk delivery")

    checkout_rules = serialize_checkout_rules(db, cart.store_id, "guest")
    validate_checkout_constraints(
        cart=recalculate_cart(db, cart, role="guest"),
        role="guest",
        checkout_rules=checkout_rules,
        shipping_method=payload.shipping_method,
        payment_method=payload.payment_method,
    )
    customer = create_or_update_customer(
        db,
        store=store,
        full_name=payload.customer.full_name,
        phone=payload.customer.phone,
        email=payload.customer.email,
        auth_provider="guest",
        is_guest=True,
    )
    address_snapshot = (
        payload.address.model_dump() if payload.address is not None else {"pickup_store_code": payload.pickup_store_code}
    )
    order = create_order_from_cart(
        db,
        cart=cart,
        customer=customer,
        shipping_method=payload.shipping_method,
        address_snapshot=address_snapshot,
        payment_method=payload.payment_method,
        notes=payload.notes,
        checkout_rules=checkout_rules,
    )
    return _serialize_checkout_response(order, db)


@router.post("/checkout/me")
def checkout_authenticated(
    payload: AuthenticatedCheckoutRequest,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    store = db.get(Store, current_customer.store_id)
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store tidak ditemukan")
    if payload.shipping_method.lower() == "delivery" and payload.address is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alamat wajib untuk delivery")

    role = determine_customer_role(current_customer)
    cart = resolve_cart_for_customer(db, store, current_customer)
    cart = recalculate_cart(db, cart, role=role, member_level=current_customer.member_tier)
    checkout_rules = serialize_checkout_rules(db, cart.store_id, role)
    validate_checkout_constraints(
        cart=cart,
        role=role,
        checkout_rules=checkout_rules,
        shipping_method=payload.shipping_method,
        payment_method=payload.payment_method,
    )
    address_snapshot = (
        payload.address.model_dump() if payload.address is not None else {"pickup_store_code": payload.pickup_store_code}
    )
    order = create_order_from_cart(
        db,
        cart=cart,
        customer=current_customer,
        shipping_method=payload.shipping_method,
        address_snapshot=address_snapshot,
        payment_method=payload.payment_method,
        notes=payload.notes,
        checkout_rules=checkout_rules,
    )
    return _serialize_checkout_response(order, db)


@router.get("/orders/me")
def list_my_orders(
    limit: int = Query(default=20, ge=1, le=50),
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    rows = list(
        db.scalars(
            select(Order)
            .where(Order.customer_id == current_customer.id)
            .order_by(Order.created_at.desc())
            .limit(limit)
        ).all()
    )
    return {"items": [_serialize_order_summary(order) for order in rows]}


@router.get("/orders/me/{order_id}")
def get_my_order_detail(
    order_id: str,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    order = _require_customer_order(db.get(Order, order_id), current_customer)
    return _serialize_order_detail(db, order)


@router.get("/orders/track")
def track_order(order_number: str, phone: str, db: Session = Depends(get_db)) -> dict:
    order = db.scalar(select(Order).where(Order.order_number == order_number))
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order tidak ditemukan")
    if normalize_phone(phone) != order.customer_snapshot.get("phone"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Data pelacakan tidak cocok")
    shipment = db.scalar(select(Shipment).where(Shipment.order_id == order.id))
    invoices = list(db.scalars(select(Invoice).where(Invoice.order_id == order.id)).all())
    return {
        "order_number": order.order_number,
        "status": order.status.value,
        "payment_status": order.payment_status.value,
        "fulfillment_status": order.fulfillment_status.value,
        "invoice_source": order.pricing_snapshot.get("invoice_source"),
        "shipment": {
            "shipment_number": shipment.shipment_number if shipment else None,
            "status": shipment.status.value if shipment else None,
            "tracking_number": shipment.tracking_number if shipment else None,
        },
        "invoices": [{"type": invoice.invoice_type.value, "document_url": invoice.document_url} for invoice in invoices],
    }


@router.get("/orders/{order_number}/invoice/{invoice_type}")
def get_invoice(order_number: str, invoice_type: str, phone: str, db: Session = Depends(get_db)) -> dict:
    order = db.scalar(select(Order).where(Order.order_number == order_number))
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order tidak ditemukan")
    if normalize_phone(phone) != order.customer_snapshot.get("phone"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Data invoice tidak cocok")
    normalized_type = invoice_type.upper()
    try:
        enum_type = InvoiceType(normalized_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipe invoice tidak valid") from exc
    invoice = db.scalar(select(Invoice).where(Invoice.order_id == order.id).where(Invoice.invoice_type == enum_type))
    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice tidak ditemukan")
    return {"invoice_number": invoice.invoice_number, "invoice_type": invoice.invoice_type.value, "document_url": invoice.document_url}


@router.get("/wishlist")
def get_wishlist(
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    rows = list(
        db.scalars(select(WishlistItem).where(WishlistItem.customer_id == current_customer.id).order_by(WishlistItem.created_at.desc())).all()
    )
    products = [db.get(Product, row.product_id) for row in rows]
    role = determine_customer_role(current_customer)
    items = [
        {
            "product_id": product.id,
            "product_name": product.name,
            "product_slug": product.slug,
            "product": serialize_product(
                db,
                product,
                member_level=current_customer.member_tier,
                role=role,
            ),
            "created_at": row.created_at,
        }
        for row, product in zip(rows, products, strict=False)
        if product is not None
    ]
    return {"items": items}


@router.post("/wishlist/items")
def add_wishlist_item(
    payload: WishlistAddRequest,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    product = db.get(Product, payload.product_id)
    if product is None or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produk tidak ditemukan")
    existing = db.scalar(
        select(WishlistItem)
        .where(WishlistItem.customer_id == current_customer.id)
        .where(WishlistItem.product_id == payload.product_id)
    )
    if existing is None:
        db.add(WishlistItem(customer_id=current_customer.id, product_id=payload.product_id))
        db.commit()
    return {"status": "saved", "product_id": payload.product_id}


@router.delete("/wishlist/items/{product_id}")
def delete_wishlist_item(
    product_id: str,
    current_customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> dict:
    row = db.scalar(
        select(WishlistItem)
        .where(WishlistItem.customer_id == current_customer.id)
        .where(WishlistItem.product_id == product_id)
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item tidak ditemukan")
    db.delete(row)
    db.commit()
    return {"status": "removed", "product_id": product_id}
