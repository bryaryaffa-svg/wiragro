"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { useAuth } from "@/components/auth-provider";
import {
  type CustomerProductReviewStatusPayload,
  type ProductReviewFeedPayload,
  getCustomerProductReviewStatus,
  submitProductReview,
} from "@/lib/api";

function renderStars(value: number) {
  return "★".repeat(value) + "☆".repeat(Math.max(0, 5 - value));
}

export function ProductReviewSection({
  productId,
  productName,
  reviewFeed,
}: {
  productId: string;
  productName: string;
  reviewFeed: ProductReviewFeedPayload | null;
}) {
  const { session, isReady } = useAuth();
  const [eligibility, setEligibility] = useState<CustomerProductReviewStatusPayload | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [usageContext, setUsageContext] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isReady || !session?.access_token) {
      return;
    }

    let isCancelled = false;

    void getCustomerProductReviewStatus(session.access_token, productId)
      .then((payload) => {
        if (isCancelled) {
          return;
        }

        setEligibility(payload);

        if (payload.existing_review) {
          setRating(payload.existing_review.rating);
          setTitle(payload.existing_review.title ?? "");
          setBody(payload.existing_review.body ?? "");
          setUsageContext(payload.existing_review.usage_context ?? "");
        }
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setFeedback(
          error instanceof Error ? error.message : "Status review belum bisa dimuat sekarang.",
        );
      });

    return () => {
      isCancelled = true;
    };
  }, [isReady, productId, session?.access_token]);

  const ownReview = eligibility?.existing_review ?? null;
  const canSubmit =
    Boolean(session?.access_token) &&
    Boolean(eligibility?.eligible) &&
    ownReview?.moderation_status !== "approved";

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Review terverifikasi</span>
          <h2>Social proof mulai dirilis bertahap untuk pembeli yang benar-benar sudah checkout.</h2>
          <p>
            Review publik hanya muncul setelah pembelian terverifikasi dan lolos moderasi ringan.
            Ini menjaga trust tetap jujur saat fitur baru mulai diaktifkan.
          </p>
        </div>
      </div>

      <div className="product-review-layout">
        <div className="product-review-summary">
          <div className="product-review-summary__score">
            <strong>{reviewFeed?.summary.average_rating?.toFixed(1) ?? "-"}</strong>
            <span>{reviewFeed?.summary.average_rating ? renderStars(Math.round(reviewFeed.summary.average_rating)) : "Belum ada rating publik"}</span>
            <small>
              {reviewFeed?.summary.total_reviews
                ? `${reviewFeed.summary.total_reviews} review tampil`
                : "Review publik masih dikurasi"}
            </small>
          </div>

          <div className="product-review-breakdown">
            {(reviewFeed?.summary.rating_breakdown ?? []).map((item) => {
              const total = reviewFeed?.summary.total_reviews ?? 0;
              const width = total ? `${(item.count / total) * 100}%` : "0%";

              return (
                <div className="product-review-breakdown__row" key={`${productId}-${item.rating}`}>
                  <span>{item.rating}★</span>
                  <div className="product-review-breakdown__bar">
                    <i style={{ width }} />
                  </div>
                  <strong>{item.count}</strong>
                </div>
              );
            })}
          </div>

          <div className="product-review-list">
            {reviewFeed?.items.length ? (
              reviewFeed.items.map((item) => (
                <article className="product-review-card" key={item.id}>
                  <div className="product-review-card__header">
                    <div>
                      <strong>{item.title || `${item.rating} bintang untuk ${productName}`}</strong>
                      <span>{renderStars(item.rating)}</span>
                    </div>
                    <div className="product-review-card__meta">
                      <small>{item.reviewer_name}</small>
                      <small>{item.verified_purchase ? "Pembeli terverifikasi" : "Review"}</small>
                    </div>
                  </div>
                  {item.body ? <p>{item.body}</p> : null}
                  {item.usage_context ? <em>{item.usage_context}</em> : null}
                </article>
              ))
            ) : (
              <article className="product-review-card product-review-card--empty">
                <strong>Belum ada review publik yang tayang.</strong>
                <p>
                  Produk ini sudah siap menerima review pembeli terverifikasi. Review baru akan
                  tampil setelah dikurasi ringan oleh tim.
                </p>
              </article>
            )}
          </div>
        </div>

        <aside className="product-review-submit">
          <span className="eyebrow-label">Tulis review</span>
          {!isReady ? (
            <p>Menyiapkan status akun Anda untuk cek kelayakan review.</p>
          ) : !session ? (
            <>
              <h3>Login dulu untuk review pembelian terverifikasi.</h3>
              <p>
                Review hanya dibuka untuk customer yang sudah login dan punya order terbayar
                dengan produk ini.
              </p>
              <Link className="btn btn-primary btn-block" href="/masuk">
                Login customer
              </Link>
            </>
          ) : !eligibility?.eligible ? (
            <>
              <h3>Review aktif setelah ada order terverifikasi.</h3>
              <p>
                Akun ini belum punya pembelian terbayar untuk produk ini, jadi review belum
                bisa dikirim.
              </p>
            </>
          ) : ownReview?.moderation_status === "approved" ? (
            <>
              <h3>Review Anda sudah tayang.</h3>
              <p>
                Terima kasih. Review ini sudah lolos moderasi ringan dan ikut membangun trust
                di PDP.
              </p>
              <div className="product-review-submit__status">
                <strong>{ownReview.title || "Review terverifikasi"}</strong>
                <span>{renderStars(ownReview.rating)}</span>
                {ownReview.body ? <p>{ownReview.body}</p> : null}
              </div>
            </>
          ) : (
            <form
              className="product-review-form"
              onSubmit={(event) => {
                event.preventDefault();
                setFeedback(null);

                if (!session?.access_token) {
                  return;
                }

                startTransition(async () => {
                  try {
                    const response = await submitProductReview(session.access_token, productId, {
                      rating,
                      title,
                      body,
                      usageContext,
                    });

                    setEligibility((current) =>
                      current
                        ? {
                            ...current,
                            existing_review: response.review,
                          }
                        : current,
                    );
                    setFeedback("Review berhasil dikirim dan sedang menunggu moderasi ringan.");
                  } catch (submitError) {
                    setFeedback(
                      submitError instanceof Error
                        ? submitError.message
                        : "Review belum berhasil dikirim.",
                    );
                  }
                });
              }}
            >
              <h3>Tulis review untuk pembelian Anda.</h3>
              <p>
                Review Anda akan dicek singkat sebelum tayang. Fokuskan pada pengalaman pakai,
                kecocokan konteks, dan kualitas bantuan produk ini.
              </p>

              <label>
                <span>Rating</span>
                <select
                  onChange={(event) => setRating(Number(event.target.value))}
                  value={rating}
                >
                  <option value={5}>5 bintang</option>
                  <option value={4}>4 bintang</option>
                  <option value={3}>3 bintang</option>
                  <option value={2}>2 bintang</option>
                  <option value={1}>1 bintang</option>
                </select>
              </label>

              <label>
                <span>Judul singkat</span>
                <input
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Cocok untuk fase awal"
                  value={title}
                />
              </label>

              <label>
                <span>Konteks penggunaan</span>
                <input
                  onChange={(event) => setUsageContext(event.target.value)}
                  placeholder="Contoh: Cabai fase vegetatif"
                  value={usageContext}
                />
              </label>

              <label>
                <span>Isi review</span>
                <textarea
                  minLength={24}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Ceritakan kecocokan produk, konteks tanam, dan apa yang paling membantu."
                  required
                  rows={5}
                  value={body}
                />
              </label>

              {ownReview ? (
                <div className="product-review-submit__status">
                  <strong>Status saat ini: {ownReview.moderation_status}</strong>
                  <p>
                    Anda masih bisa memperbarui review ini. Setiap perubahan akan masuk ke
                    antrean moderasi ringan lagi.
                  </p>
                </div>
              ) : null}

              {feedback ? <div className="product-review-submit__feedback">{feedback}</div> : null}

              <button className="btn btn-primary btn-block" disabled={isPending} type="submit">
                {isPending ? "Mengirim review..." : "Kirim review terverifikasi"}
              </button>
            </form>
          )}
        </aside>
      </div>
    </section>
  );
}
