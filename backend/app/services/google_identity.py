from __future__ import annotations

from typing import Any

import jwt
from fastapi import HTTPException, status

from app.core.config import settings

GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}

google_jwk_client = jwt.PyJWKClient(GOOGLE_JWKS_URL)


def verify_google_id_token(id_token: str) -> dict[str, Any]:
    audiences = settings.google_oidc_audience_list
    if not audiences:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OIDC belum dikonfigurasi di server.",
        )

    try:
        signing_key = google_jwk_client.get_signing_key_from_jwt(id_token)
        claims = jwt.decode(
            id_token,
            signing_key.key,
            algorithms=["RS256"],
            options={
                "require": ["aud", "exp", "iss", "sub"],
                "verify_aud": False,
            },
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Google tidak valid.",
        ) from exc

    issuer = claims.get("iss")
    if issuer not in GOOGLE_ISSUERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Issuer Google tidak valid.",
        )

    audience_claim = claims.get("aud")
    if isinstance(audience_claim, str):
        audience_values = [audience_claim]
    elif isinstance(audience_claim, list):
        audience_values = [value for value in audience_claim if isinstance(value, str)]
    else:
        audience_values = []

    if not any(audience in audiences for audience in audience_values):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Audience Google tidak diizinkan.",
        )

    subject = claims.get("sub")
    email = claims.get("email")
    if not isinstance(subject, str) or not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Subject token Google tidak tersedia.",
        )
    if not isinstance(email, str) or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email Google tidak tersedia pada token.",
        )
    if claims.get("email_verified") is not True:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email Google belum terverifikasi.",
        )

    return claims
