from __future__ import annotations

from enum import Enum


class ProductType(str, Enum):
    TOOL = "TOOL"
    HERBICIDE = "HERBICIDE"
    SEED = "SEED"
    NUTRITION = "NUTRITION"


class PriceType(str, Enum):
    RETAIL = "RETAIL"
    WHOLESALE = "WHOLESALE"
    MEMBER = "MEMBER"


class PromotionType(str, Enum):
    BUY_X_GET_Y = "BUY_X_GET_Y"
    MANUAL = "MANUAL"


class PromotionStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    ENDED = "ENDED"


class CartStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CHECKED_OUT = "CHECKED_OUT"
    ABANDONED = "ABANDONED"


class OrderStatus(str, Enum):
    MENUNGGU_PEMBAYARAN = "MENUNGGU_PEMBAYARAN"
    DIBAYAR = "DIBAYAR"
    DIPROSES = "DIPROSES"
    DIKEMAS = "DIKEMAS"
    DIKIRIM = "DIKIRIM"
    SELESAI = "SELESAI"
    DIBATALKAN = "DIBATALKAN"


class PaymentStatus(str, Enum):
    UNPAID = "UNPAID"
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"


class FulfillmentStatus(str, Enum):
    PENDING = "PENDING"
    DIPROSES = "DIPROSES"
    DIKEMAS = "DIKEMAS"
    DIKIRIM = "DIKIRIM"
    SELESAI = "SELESAI"


class ShipmentStatus(str, Enum):
    PENDING = "PENDING"
    READY = "READY"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"


class InvoiceType(str, Enum):
    PUTIH = "PUTIH"
    MERAH = "MERAH"


class ContentPageType(str, Enum):
    STATIC = "STATIC"
    ARTICLE = "ARTICLE"


class PaymentMethodType(str, Enum):
    CASH = "CASH"
    COD = "COD"
    BANK_TRANSFER = "BANK_TRANSFER"
    QRIS = "QRIS"
    VA = "VA"
    EWALLET = "EWALLET"
    TEMPO = "TEMPO"
    OTHER = "OTHER"


class SyncDirection(str, Enum):
    INBOUND = "INBOUND"
    OUTBOUND = "OUTBOUND"


class SyncStatus(str, Enum):
    PENDING = "PENDING"
    SYNCED = "SYNCED"
    FAILED = "FAILED"
