from fastapi import APIRouter

from app.api.v1.endpoints import customer, health, payments, storefront, sync

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(storefront.router, prefix="/storefront", tags=["storefront"])
api_router.include_router(customer.router, prefix="/customer", tags=["customer"])
api_router.include_router(payments.router, tags=["payments"])
api_router.include_router(sync.router, prefix="/sync", tags=["sync"])
