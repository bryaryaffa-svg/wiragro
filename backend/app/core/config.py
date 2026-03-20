from __future__ import annotations

from functools import lru_cache

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="Kios Sidomakmur API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_debug: bool = Field(default=True, alias="APP_DEBUG")
    app_auto_seed_demo: bool = Field(default=True, alias="APP_AUTO_SEED_DEMO")
    api_prefix: str = Field(default="/api/v1", alias="API_PREFIX")
    database_url: str = Field(default="sqlite:///./kios_sidomakmur.db", alias="DATABASE_URL")
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    jwt_secret_key: str = Field(default="change-me", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=120, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    guest_token_expire_days: int = Field(default=30, alias="GUEST_TOKEN_EXPIRE_DAYS")
    cors_origins: str = Field(default="", alias="CORS_ORIGINS")
    default_brand_code: str = Field(default="sidomakmur", alias="DEFAULT_BRAND_CODE")
    default_brand_name: str = Field(default="Sidomakmur", alias="DEFAULT_BRAND_NAME")
    default_store_code: str = Field(default="SIDO-JATIM-ONLINE", alias="DEFAULT_STORE_CODE")
    default_store_name: str = Field(default="Kios Sidomakmur Jawa Timur", alias="DEFAULT_STORE_NAME")
    duitku_merchant_code: str = Field(default="DXXXX", alias="DUITKU_MERCHANT_CODE")
    duitku_api_key: str = Field(default="change-me", alias="DUITKU_API_KEY")
    duitku_base_url: str = Field(
        default="https://sandbox.duitku.com/webapi/api/merchant",
        alias="DUITKU_BASE_URL",
    )
    google_oidc_audience: str = Field(default="", alias="GOOGLE_OIDC_AUDIENCE")
    google_oidc_audiences: str = Field(default="", alias="GOOGLE_OIDC_AUDIENCES")
    sige_sync_base_url: str = Field(default="", alias="SIGE_SYNC_BASE_URL")
    sige_sync_token: str = Field(default="", alias="SIGE_SYNC_TOKEN")

    @computed_field
    @property
    def cors_origin_list(self) -> list[str]:
        if not self.cors_origins:
            return []
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @computed_field
    @property
    def google_oidc_audience_list(self) -> list[str]:
        merged: list[str] = []
        for raw in (self.google_oidc_audiences, self.google_oidc_audience):
            if not raw:
                continue
            for item in raw.split(","):
                audience = item.strip()
                if audience and audience not in merged:
                    merged.append(audience)
        return merged


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
