from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.core.config import settings
from app.core.database import SessionLocal, engine, get_db
from app.core.logging import configure_logging
from app.models import Base, Invoice, Order
from app.services.commerce import seed_demo_data


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    Base.metadata.create_all(bind=engine)
    if settings.app_auto_seed_demo:
        with SessionLocal() as db:
            seed_demo_data(db)
    yield


app = FastAPI(title=settings.app_name, debug=settings.app_debug, lifespan=lifespan)

if settings.cors_origin_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.api_prefix)


def _escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_simple_pdf(lines: list[str]) -> bytes:
    content_lines = ["BT", "/F1 12 Tf"]
    y = 800
    for line in lines:
        content_lines.append(f"1 0 0 1 48 {y} Tm ({_escape_pdf_text(line)}) Tj")
        y -= 18
    content_lines.append("ET")
    stream = "\n".join(content_lines).encode("latin-1", errors="replace")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length %d >>\nstream\n%s\nendstream" % (len(stream), stream),
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, body in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("latin-1"))
        pdf.extend(body)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(
        (
            "trailer\n"
            f"<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF"
        ).encode("latin-1")
    )
    return bytes(pdf)


@app.get("/documents/invoices/{filename}")
def serve_invoice_document(filename: str, db: Session = Depends(get_db)) -> Response:
    invoice = db.scalar(select(Invoice).where(Invoice.document_url.like(f"%/{filename}")))
    if invoice is None:
        raise HTTPException(status_code=404, detail="Dokumen invoice tidak ditemukan")
    order = db.scalar(select(Order).where(Order.id == invoice.order_id))
    if order is None:
        raise HTTPException(status_code=404, detail="Order untuk dokumen invoice tidak ditemukan")

    lines = [
        f"Kios Sidomakmur - Nota {invoice.invoice_type.value}",
        f"Nomor invoice: {invoice.invoice_number}",
        f"Nomor order: {order.order_number}",
        f"Status order: {order.status.value}",
        f"Status pembayaran: {order.payment_status.value}",
        f"Grand total: Rp {order.grand_total}",
        f"Sumber nota: {order.pricing_snapshot.get('invoice_source', 'STORE')}",
    ]
    pdf_bytes = _build_simple_pdf(lines)
    headers = {"Content-Disposition": f'inline; filename="{filename}"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
