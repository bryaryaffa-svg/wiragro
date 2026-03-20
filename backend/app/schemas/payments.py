from __future__ import annotations

from pydantic import BaseModel, HttpUrl


class DuitkuCreateRequest(BaseModel):
    order_id: str
    callback_url: HttpUrl
    return_url: HttpUrl
