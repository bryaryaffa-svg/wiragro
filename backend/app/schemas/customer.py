from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class GoogleLoginRequest(BaseModel):
    store_code: str
    id_token: str = Field(description="Google ID token dari Google Identity Services")


class WhatsAppOtpRequest(BaseModel):
    store_code: str
    phone: str


class WhatsAppOtpVerifyRequest(BaseModel):
    store_code: str
    challenge_id: str
    otp_code: str


class ResellerActivationRequest(BaseModel):
    store_code: str
    username: str


class ResellerSetPasswordRequest(BaseModel):
    store_code: str
    username: str
    password: str = Field(min_length=8, max_length=64)


class ResellerLoginRequest(BaseModel):
    store_code: str
    username: str
    password: str = Field(min_length=8, max_length=64)


class UpdateCustomerProfileRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str | None = None
    email: EmailStr | None = None


class CustomerAddressUpsertRequest(BaseModel):
    label: str = Field(min_length=1, max_length=60)
    recipient_name: str
    recipient_phone: str
    address_line: str
    district: str | None = None
    city: str
    province: str
    postal_code: str | None = None
    notes: str | None = None
    is_default: bool = False


class CreateGuestCartRequest(BaseModel):
    store_code: str


class AddCartItemRequest(BaseModel):
    cart_id: str
    guest_token: str
    product_id: str
    qty: int = Field(gt=0)


class UpdateCartItemRequest(BaseModel):
    cart_id: str
    guest_token: str
    qty: int = Field(ge=0)


class AddAuthenticatedCartItemRequest(BaseModel):
    product_id: str
    qty: int = Field(gt=0)


class UpdateAuthenticatedCartItemRequest(BaseModel):
    qty: int = Field(ge=0)


class GuestCheckoutCustomer(BaseModel):
    full_name: str
    phone: str
    email: EmailStr | None = None


class GuestCheckoutAddress(BaseModel):
    recipient_name: str
    recipient_phone: str
    address_line: str
    district: str | None = None
    city: str
    province: str
    postal_code: str | None = None
    notes: str | None = None


class GuestCheckoutRequest(BaseModel):
    cart_id: str
    guest_token: str
    customer: GuestCheckoutCustomer
    shipping_method: str = Field(description="pickup atau delivery")
    pickup_store_code: str | None = None
    address: GuestCheckoutAddress | None = None
    payment_method: str
    notes: str | None = None


class AuthenticatedCheckoutRequest(BaseModel):
    shipping_method: str = Field(description="pickup atau delivery")
    pickup_store_code: str | None = None
    address: GuestCheckoutAddress | None = None
    payment_method: str
    notes: str | None = None


class WishlistAddRequest(BaseModel):
    product_id: str
