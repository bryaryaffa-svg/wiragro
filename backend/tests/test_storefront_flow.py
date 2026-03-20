from __future__ import annotations

import hashlib
from decimal import Decimal

from sqlalchemy import select

from app.core.config import settings
from app.models import Order, SyncLog
from app.models.enums import PaymentStatus, SyncStatus


def test_google_oidc_login(test_context: dict, monkeypatch):
    client = test_context["client"]

    def fake_verify_google_id_token(id_token: str) -> dict:
        assert id_token == "google-real-id-token"
        return {
            "sub": "google-sub-001",
            "email": "siti@example.com",
            "email_verified": True,
            "name": "Siti Tani",
        }

    monkeypatch.setattr(
        "app.api.v1.endpoints.customer.verify_google_id_token",
        fake_verify_google_id_token,
    )

    response = client.post(
        "/api/v1/customer/auth/google",
        json={
            "store_code": settings.default_store_code,
            "id_token": "google-real-id-token",
        },
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["mode"] == "google-oidc"
    assert payload["customer"]["email"] == "siti@example.com"
    assert "access_token" in payload


def test_storefront_catalog_and_detail(test_context: dict):
    client = test_context["client"]

    stores = client.get("/api/v1/storefront/stores")
    assert stores.status_code == 200, stores.text
    assert len(stores.json()["items"]) >= 1

    home = client.get("/api/v1/storefront/home", params={"store_code": settings.default_store_code})
    assert home.status_code == 200, home.text
    home_data = home.json()
    assert len(home_data["featured_products"]) >= 1
    first_product = home_data["featured_products"][0]

    catalog = client.get(
        "/api/v1/storefront/products",
        params={"store_code": settings.default_store_code, "category_slug": "benih"},
    )
    assert catalog.status_code == 200, catalog.text
    assert len(catalog.json()["items"]) >= 1

    detail = client.get(
        f"/api/v1/storefront/products/{first_product['slug']}",
        params={"store_code": settings.default_store_code},
    )
    assert detail.status_code == 200, detail.text
    assert detail.json()["slug"] == first_product["slug"]

    pages = client.get("/api/v1/storefront/pages", params={"store_code": settings.default_store_code})
    assert pages.status_code == 200, pages.text
    assert any(page["slug"] == "faq" for page in pages.json()["items"])


def test_guest_checkout_payment_callback_and_tracking(test_context: dict):
    client = test_context["client"]
    session_factory = test_context["session_factory"]

    catalog = client.get("/api/v1/storefront/products", params={"store_code": settings.default_store_code})
    product = catalog.json()["items"][0]

    cart_response = client.post("/api/v1/customer/carts/guest", json={"store_code": settings.default_store_code})
    assert cart_response.status_code == 200, cart_response.text
    cart = cart_response.json()

    item_response = client.post(
        "/api/v1/customer/carts/items",
        json={
            "cart_id": cart["cart_id"],
            "guest_token": cart["guest_token"],
            "product_id": product["id"],
            "qty": 2,
        },
    )
    assert item_response.status_code == 200, item_response.text
    assert Decimal(item_response.json()["grand_total"]) > Decimal("0")

    checkout = client.post(
        "/api/v1/customer/checkout/guest",
        json={
            "cart_id": cart["cart_id"],
            "guest_token": cart["guest_token"],
                "customer": {
                    "full_name": "Budi Tani",
                    "phone": "081234567890",
                    "email": "budi@example.com",
                },
            "shipping_method": "delivery",
            "address": {
                "recipient_name": "Budi Tani",
                "recipient_phone": "081234567890",
                "address_line": "Jl. Sawah Makmur No. 1",
                "city": "Malang",
                "province": "Jawa Timur",
                "postal_code": "65111",
            },
            "payment_method": "duitku-va",
        },
    )
    assert checkout.status_code == 200, checkout.text
    order = checkout.json()["order"]

    payment_create = client.post(
        "/api/v1/customer/payments/duitku/create",
        json={
            "order_id": order["id"],
            "callback_url": "https://sidomakmur.com/callback",
            "return_url": "https://sidomakmur.com/return",
        },
    )
    assert payment_create.status_code == 200, payment_create.text
    reference = payment_create.json()["reference"]
    amount = str(int(Decimal(order["grand_total"])))
    signature = hashlib.md5(
        f"{settings.duitku_merchant_code}{amount}{order['order_number']}{settings.duitku_api_key}".encode()
    ).hexdigest()

    callback = client.post(
        "/api/v1/payments/duitku/callback",
        data={
            "merchantOrderId": order["order_number"],
            "amount": amount,
            "merchantCode": settings.duitku_merchant_code,
            "resultCode": "00",
            "reference": reference,
            "signature": signature,
        },
    )
    assert callback.status_code == 200, callback.text
    assert callback.json()["payment_status"] == "PAID"

    tracking = client.get(
        "/api/v1/customer/orders/track",
        params={"order_number": order["order_number"], "phone": "081234567890"},
    )
    assert tracking.status_code == 200, tracking.text
    assert tracking.json()["payment_status"] == "PAID"

    invoice = client.get(
        f"/api/v1/customer/orders/{order['order_number']}/invoice/putih",
        params={"phone": "081234567890"},
    )
    assert invoice.status_code == 200, invoice.text
    assert invoice.json()["invoice_type"] == "PUTIH"

    invoice_pdf = client.get(invoice.json()["document_url"])
    assert invoice_pdf.status_code == 200, invoice_pdf.text
    assert invoice_pdf.headers["content-type"].startswith("application/pdf")

    with session_factory() as db:
        order_row = db.scalar(select(Order).where(Order.id == order["id"]))
        assert order_row is not None
        assert order_row.payment_status == PaymentStatus.PAID

        sync_log = db.scalar(select(SyncLog).where(SyncLog.entity_type == "order").where(SyncLog.entity_id == order["id"]))
        assert sync_log is not None
        assert sync_log.status == SyncStatus.SYNCED


def test_cart_qty_update_and_remove(test_context: dict):
    client = test_context["client"]

    catalog = client.get("/api/v1/storefront/products", params={"store_code": settings.default_store_code})
    product = catalog.json()["items"][0]

    cart_response = client.post("/api/v1/customer/carts/guest", json={"store_code": settings.default_store_code})
    cart = cart_response.json()

    item_response = client.post(
        "/api/v1/customer/carts/items",
        json={
            "cart_id": cart["cart_id"],
            "guest_token": cart["guest_token"],
            "product_id": product["id"],
            "qty": 1,
        },
    )
    item = item_response.json()["items"][0]

    updated = client.patch(
        f"/api/v1/customer/carts/items/{item['id']}",
        json={
            "cart_id": cart["cart_id"],
            "guest_token": cart["guest_token"],
            "qty": 3,
        },
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["items"][0]["qty"] == 3

    removed = client.patch(
        f"/api/v1/customer/carts/items/{item['id']}",
        json={
            "cart_id": cart["cart_id"],
            "guest_token": cart["guest_token"],
            "qty": 0,
        },
    )
    assert removed.status_code == 200, removed.text
    assert removed.json()["items"] == []


def test_whatsapp_otp_and_cache_manifest(test_context: dict):
    client = test_context["client"]

    challenge = client.post(
        "/api/v1/customer/auth/whatsapp/request-otp",
        json={"store_code": settings.default_store_code, "phone": "081111111111"},
    )
    assert challenge.status_code == 200, challenge.text
    challenge_data = challenge.json()

    verify = client.post(
        "/api/v1/customer/auth/whatsapp/verify-otp",
        json={
            "store_code": settings.default_store_code,
            "challenge_id": challenge_data["challenge_id"],
            "otp_code": challenge_data["debug_otp_code"],
        },
    )
    assert verify.status_code == 200, verify.text
    verify_data = verify.json()
    assert "access_token" in verify_data

    catalog = client.get("/api/v1/storefront/products", params={"store_code": settings.default_store_code})
    product = catalog.json()["items"][0]

    wishlist_add = client.post(
        "/api/v1/customer/wishlist/items",
        headers={"Authorization": f"Bearer {verify_data['access_token']}"},
        json={"product_id": product["id"]},
    )
    assert wishlist_add.status_code == 200, wishlist_add.text

    wishlist = client.get(
        "/api/v1/customer/wishlist",
        headers={"Authorization": f"Bearer {verify_data['access_token']}"},
    )
    assert wishlist.status_code == 200, wishlist.text
    assert wishlist.json()["items"][0]["product_id"] == product["id"]

    wishlist_remove = client.delete(
        f"/api/v1/customer/wishlist/items/{product['id']}",
        headers={"Authorization": f"Bearer {verify_data['access_token']}"},
    )
    assert wishlist_remove.status_code == 200, wishlist_remove.text

    manifest = client.get("/api/v1/sync/cache-manifest", params={"store_code": settings.default_store_code, "since_version": 0})
    assert manifest.status_code == 200, manifest.text
    manifest_data = manifest.json()
    assert len(manifest_data["products"]) >= 1
    assert len(manifest_data["categories"]) >= 1


def test_reseller_activation_login_and_checkout_rules(test_context: dict):
    client = test_context["client"]

    activation = client.post(
        "/api/v1/customer/auth/reseller/activate/check",
        json={
            "store_code": settings.default_store_code,
            "username": "reseller-demo",
        },
    )
    assert activation.status_code == 200, activation.text
    assert activation.json()["status"] == "activation_required"

    set_password = client.post(
        "/api/v1/customer/auth/reseller/set-password",
        json={
            "store_code": settings.default_store_code,
            "username": "reseller-demo",
            "password": "reseller123",
        },
    )
    assert set_password.status_code == 200, set_password.text

    login = client.post(
        "/api/v1/customer/auth/reseller/login",
        json={
            "store_code": settings.default_store_code,
            "username": "reseller-demo",
            "password": "reseller123",
        },
    )
    assert login.status_code == 200, login.text
    session = login.json()
    assert session["role"] == "reseller"
    assert session["pricing_mode"] == "reseller"

    catalog = client.get(
        "/api/v1/storefront/products",
        params={"store_code": settings.default_store_code, "category_slug": "benih", "member_level": "RESELLER"},
    )
    assert catalog.status_code == 200, catalog.text
    product = catalog.json()["items"][0]
    assert product["pricing"]["reseller"]["amount"] == "62000.00"

    add_item = client.post(
        "/api/v1/customer/carts/me/items",
        headers={"Authorization": f"Bearer {session['access_token']}"},
        json={"product_id": product["id"], "qty": 1},
    )
    assert add_item.status_code == 200, add_item.text
    cart = add_item.json()
    assert cart["pricing_mode"] == "reseller"
    assert cart["items"][0]["price_snapshot"]["amount"] == "62000.00"
    assert cart["checkout_rules"]["minimum_order_amount"] == "500000"

    checkout_under_minimum = client.post(
        "/api/v1/customer/checkout/me",
        headers={"Authorization": f"Bearer {session['access_token']}"},
        json={
            "shipping_method": "delivery",
            "payment_method": "COD",
            "address": {
                "recipient_name": "Reseller Demo Sidomakmur",
                "recipient_phone": "081300000001",
                "address_line": "Jl. Reseller No. 1",
                "city": "Surabaya",
                "province": "Jawa Timur",
            },
        },
    )
    assert checkout_under_minimum.status_code == 400, checkout_under_minimum.text
    assert "Minimum order reseller" in checkout_under_minimum.text

    item_id = cart["items"][0]["id"]
    update_item = client.patch(
        f"/api/v1/customer/carts/me/items/{item_id}",
        headers={"Authorization": f"Bearer {session['access_token']}"},
        json={"qty": 9},
    )
    assert update_item.status_code == 200, update_item.text
    assert Decimal(update_item.json()["grand_total"]) >= Decimal("500000")

    checkout_success = client.post(
        "/api/v1/customer/checkout/me",
        headers={"Authorization": f"Bearer {session['access_token']}"},
        json={
            "shipping_method": "delivery",
            "payment_method": "COD",
            "address": {
                "recipient_name": "Reseller Demo Sidomakmur",
                "recipient_phone": "081300000001",
                "address_line": "Jl. Reseller No. 1",
                "city": "Surabaya",
                "province": "Jawa Timur",
            },
            "notes": "COD reseller",
        },
    )
    assert checkout_success.status_code == 200, checkout_success.text
    payload = checkout_success.json()
    assert payload["order"]["customer_role"] == "reseller"
    assert payload["order"]["invoice_source"] == "STORE"
    assert payload["order"]["payment_method"] == "COD"
    assert sorted(invoice["type"] for invoice in payload["invoices"]) == ["MERAH", "PUTIH"]


def test_authenticated_order_history_detail_and_duitku_payment(test_context: dict):
    client = test_context["client"]

    challenge = client.post(
        "/api/v1/customer/auth/whatsapp/request-otp",
        json={"store_code": settings.default_store_code, "phone": "081222222222"},
    )
    challenge_data = challenge.json()
    login = client.post(
        "/api/v1/customer/auth/whatsapp/verify-otp",
        json={
            "store_code": settings.default_store_code,
            "challenge_id": challenge_data["challenge_id"],
            "otp_code": challenge_data["debug_otp_code"],
        },
    )
    assert login.status_code == 200, login.text
    access_token = login.json()["access_token"]

    catalog = client.get("/api/v1/storefront/products", params={"store_code": settings.default_store_code})
    product = catalog.json()["items"][0]

    cart = client.post(
        "/api/v1/customer/carts/me/items",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"product_id": product["id"], "qty": 2},
    )
    assert cart.status_code == 200, cart.text

    checkout = client.post(
        "/api/v1/customer/checkout/me",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "shipping_method": "delivery",
            "payment_method": "duitku-va",
            "address": {
                "recipient_name": "Customer Android",
                "recipient_phone": "081222222222",
                "address_line": "Jl. Android No. 1",
                "city": "Malang",
                "province": "Jawa Timur",
            },
        },
    )
    assert checkout.status_code == 200, checkout.text
    order = checkout.json()["order"]

    payment = client.post(
        "/api/v1/customer/payments/duitku/create/me",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "order_id": order["id"],
            "callback_url": "https://sidomakmur.com/api/v1/payments/duitku/callback",
            "return_url": "https://sidomakmur.com/android/return",
        },
    )
    assert payment.status_code == 200, payment.text
    assert payment.json()["payment_url"].startswith("https://sandbox.duitku.com/")

    history = client.get(
        "/api/v1/customer/orders/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert history.status_code == 200, history.text
    assert history.json()["items"][0]["id"] == order["id"]

    detail = client.get(
        f"/api/v1/customer/orders/me/{order['id']}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert detail.status_code == 200, detail.text
    detail_payload = detail.json()
    assert detail_payload["can_pay_online"] is True
    assert detail_payload["payment"]["reference"] is not None
    assert detail_payload["items"][0]["product_id"] == product["id"]


def test_authenticated_profile_and_saved_addresses(test_context: dict):
    client = test_context["client"]

    challenge = client.post(
        "/api/v1/customer/auth/whatsapp/request-otp",
        json={"store_code": settings.default_store_code, "phone": "081355555555"},
    )
    challenge_data = challenge.json()
    login = client.post(
        "/api/v1/customer/auth/whatsapp/verify-otp",
        json={
            "store_code": settings.default_store_code,
            "challenge_id": challenge_data["challenge_id"],
            "otp_code": challenge_data["debug_otp_code"],
        },
    )
    access_token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    profile = client.get("/api/v1/customer/me", headers=headers)
    assert profile.status_code == 200, profile.text
    assert profile.json()["role"] == "customer"
    assert profile.json()["addresses"] == []

    updated = client.patch(
        "/api/v1/customer/me",
        headers=headers,
        json={
            "full_name": "Petani Profil",
            "phone": "081355555555",
            "email": "profil@example.com",
        },
    )
    assert updated.status_code == 200, updated.text
    updated_payload = updated.json()
    assert updated_payload["customer"]["full_name"] == "Petani Profil"
    assert updated_payload["customer"]["email"] == "profil@example.com"
    assert updated_payload["customer"]["phone"] == "+6281355555555"

    first_address = client.post(
        "/api/v1/customer/me/addresses",
        headers=headers,
        json={
            "label": "Gudang",
            "recipient_name": "Petani Profil",
            "recipient_phone": "081355555555",
            "address_line": "Jl. Gudang Tani No. 1",
            "district": "Lowokwaru",
            "city": "Malang",
            "province": "Jawa Timur",
            "postal_code": "65141",
            "notes": "Depan kios pupuk",
            "is_default": False,
        },
    )
    assert first_address.status_code == 200, first_address.text
    first_address_payload = first_address.json()["address"]
    assert first_address_payload["is_default"] is True

    second_address = client.post(
        "/api/v1/customer/me/addresses",
        headers=headers,
        json={
            "label": "Rumah",
            "recipient_name": "Petani Profil",
            "recipient_phone": "081366666666",
            "address_line": "Jl. Sawah Indah No. 2",
            "city": "Blitar",
            "province": "Jawa Timur",
            "is_default": True,
        },
    )
    assert second_address.status_code == 200, second_address.text
    second_address_payload = second_address.json()["address"]
    assert second_address_payload["is_default"] is True

    addresses = client.get("/api/v1/customer/me/addresses", headers=headers)
    assert addresses.status_code == 200, addresses.text
    items = addresses.json()["items"]
    assert len(items) == 2
    assert items[0]["id"] == second_address_payload["id"]
    assert items[0]["is_default"] is True
    assert items[1]["is_default"] is False

    edited = client.patch(
        f"/api/v1/customer/me/addresses/{first_address_payload['id']}",
        headers=headers,
        json={
            "label": "Gudang Utama",
            "recipient_name": "Petani Profil",
            "recipient_phone": "081377777777",
            "address_line": "Jl. Gudang Tani No. 1A",
            "district": "Lowokwaru",
            "city": "Malang",
            "province": "Jawa Timur",
            "postal_code": "65141",
            "notes": "Pintu samping",
            "is_default": True,
        },
    )
    assert edited.status_code == 200, edited.text
    assert edited.json()["address"]["label"] == "Gudang Utama"
    assert edited.json()["address"]["is_default"] is True

    deleted = client.delete(
        f"/api/v1/customer/me/addresses/{second_address_payload['id']}",
        headers=headers,
    )
    assert deleted.status_code == 200, deleted.text

    final_profile = client.get("/api/v1/customer/me", headers=headers)
    assert final_profile.status_code == 200, final_profile.text
    final_addresses = final_profile.json()["addresses"]
    assert len(final_addresses) == 1
    assert final_addresses[0]["label"] == "Gudang Utama"
    assert final_addresses[0]["is_default"] is True
