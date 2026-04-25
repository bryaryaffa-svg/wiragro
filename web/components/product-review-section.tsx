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

const STAR_FILLED = "\u2605";
const STAR_EMPTY = "\u2606";
const EMPTY_BREAKDOWN = [5, 4, 3, 2, 1].map((rating) => ({
  rating,
  count: 0,
}));

function renderStars(value: number) {
  return STAR_FILLED.repeat(value) + STAR_EMPTY.repeat(Math.max(0, 5 - value));
}

function formatModerationStatus(status?: string | null) {
  if (status === "approved") {
    return "Sudah tayang";
  }

  if (status === "pending") {
    return "Menunggu moderasi";
  }

  if (status === "rejected") {
    return "Perlu revisi";
  }

  return "Sedang diproses";
}

function formatReviewDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
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
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");
  const [isEligibilityLoading, setIsEligibilityLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [usageContext, setUsageContext] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!session?.access_token) {
      setEligibility(null);
      setFeedback(null);
      setIsEligibilityLoading(false);
      return;
    }

    let isCancelled = false;
    setIsEligibilityLoading(true);

    void getCustomerProductReviewStatus(session.access_token, productId)
      .then((payload) => {
        if (isCancelled) {
          return;
        }

        setEligibility(payload);
        setFeedbackTone("success");
        setFeedback(null);

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

        setEligibility(null);
        setFeedbackTone("error");
        setFeedback(
          error instanceof Error ? error.message : "Status review belum bisa dimuat sekarang.",
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsEligibilityLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isReady, productId, session?.access_token]);

  const ownReview = eligibility?.existing_review ?? null;
  const reviewSummary = reviewFeed?.summary ?? null;
  const totalReviews = reviewSummary?.total_reviews ?? 0;
  const averageRating = reviewSummary?.average_rating ?? null;
  const breakdown = reviewSummary?.rating_breakdown ?? EMPTY_BREAKDOWN;
  const hasPublicReviews = totalReviews > 0 && averageRating !== null;
  const reviewFeedUnavailable = reviewFeed === null;
  const publicReviewSummary = hasPublicReviews
    ? `${totalReviews} review terverifikasi tayang`
    : reviewFeedUnavailable
      ? "Ringkasan review belum tersedia saat ini."
      : "Belum ada review pembeli terverifikasi yang tayang.";

  return (
    <section className="section-block" id="review-terverifikasi">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Review terverifikasi</span>
          <h2>Ulasan pembeli membantu menilai kecocokan produk sebelum membeli.</h2>
          <p>
            Semua review publik berasal dari order terverifikasi dan tetap melalui peninjauan
            singkat agar informasi yang tampil tetap jujur, relevan, dan aman dibaca calon pembeli.
          </p>
        </div>
      </div>

      <div className="product-review-layout">
        <div className="product-review-summary">
          <div className="product-review-summary__score">
            <strong>{averageRating?.toFixed(1) ?? "-"}</strong>
            <span>
              {hasPublicReviews ? renderStars(Math.round(averageRating)) : "Belum ada rating publik"}
            </span>
            <small>{publicReviewSummary}</small>
          </div>

          <div className="product-review-breakdown">
            {breakdown.map((item) => {
              const width = totalReviews ? `${(item.count / totalReviews) * 100}%` : "0%";

              return (
                <div className="product-review-breakdown__row" key={`${productId}-${item.rating}`}>
                  <span>{`${item.rating}${STAR_FILLED}`}</span>
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
              reviewFeed.items.map((item) => {
                const publishedLabel = formatReviewDate(item.approved_at ?? item.submitted_at);

                return (
                  <article className="product-review-card" key={item.id}>
                    <div className="product-review-card__header">
                      <div>
                        <strong>{item.title || `${item.rating} bintang untuk ${productName}`}</strong>
                        <span>{renderStars(item.rating)}</span>
                      </div>
                      <div className="product-review-card__meta">
                        <small>{item.reviewer_name}</small>
                        <small>{item.verified_purchase ? "Pembeli terverifikasi" : "Review"}</small>
                        {publishedLabel ? <small>{publishedLabel}</small> : null}
                      </div>
                    </div>
                    {item.body ? <p>{item.body}</p> : null}
                    {item.usage_context ? <em>{item.usage_context}</em> : null}
                  </article>
                );
              })
            ) : reviewFeedUnavailable ? (
              <article className="product-review-card product-review-card--empty">
                <strong>Ringkasan review belum tersedia saat ini.</strong>
                <p>
                  Feed review publik sedang tidak bisa dimuat. Review untuk pembeli terverifikasi
                  tetap aktif dan bisa dicek lagi beberapa saat lagi.
                </p>
              </article>
            ) : (
              <article className="product-review-card product-review-card--empty">
                <strong>Belum ada review pembeli terverifikasi yang tayang.</strong>
                <p>
                  Produk ini sudah siap menerima review pembeli terverifikasi. Review pertama yang
                  lolos peninjauan akan langsung menambah kepercayaan di halaman produk ini.
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
              <h3>Login untuk menulis review dari pembelian Anda.</h3>
              <p>
                Review hanya dibuka untuk pembeli yang sudah login dan punya order terbayar
                dengan produk ini.
              </p>
              <Link className="btn btn-primary btn-block" href="/masuk">
                Masuk ke akun
              </Link>
            </>
          ) : isEligibilityLoading ? (
            <>
              <h3>Memeriksa riwayat pembelian Anda.</h3>
              <p>
                Kami sedang memastikan apakah akun ini sudah punya order terverifikasi untuk
                produk ini.
              </p>
            </>
          ) : feedbackTone === "error" && !eligibility ? (
            <>
              <h3>Status review belum bisa dicek.</h3>
              <p>
                Coba muat ulang halaman atau kembali beberapa saat lagi. Review tetap hanya
                tersedia untuk pembeli dengan order terbayar.
              </p>
              {feedback ? (
                <div className={`product-review-submit__feedback is-${feedbackTone}`}>{feedback}</div>
              ) : null}
            </>
          ) : !eligibility?.eligible ? (
            <>
              <h3>Review aktif setelah ada order terbayar.</h3>
              <p>
                Akun ini belum punya pembelian terbayar untuk produk ini, jadi review belum
                bisa dikirim.
              </p>
            </>
          ) : ownReview?.moderation_status === "approved" ? (
            <>
              <h3>Review Anda sudah tayang.</h3>
              <p>
                Terima kasih. Review ini sudah tayang dan membantu pembeli lain memahami
                kecocokan produk ini.
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
                setFeedbackTone("success");

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
                    setFeedback("Review berhasil dikirim dan sedang menunggu peninjauan singkat.");
                  } catch (submitError) {
                    setFeedbackTone("error");
                    setFeedback(
                      submitError instanceof Error
                        ? submitError.message
                        : "Review belum berhasil dikirim.",
                    );
                  }
                });
              }}
            >
              <h3>Tulis review dari pengalaman pakai Anda.</h3>
              <p>
                Review akan ditinjau singkat sebelum tayang. Fokuskan pada pengalaman pakai, konteks
                penggunaan, dan hasil yang paling terasa setelah produk digunakan.
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
                    <strong>Status saat ini: {formatModerationStatus(ownReview.moderation_status)}</strong>
                    <p>
                      Anda masih bisa memperbarui review ini. Setiap perubahan akan masuk ke
                      antrean peninjauan lagi.
                    </p>
                  {ownReview.moderation_note ? <p>{ownReview.moderation_note}</p> : null}
                </div>
              ) : null}

              {feedback ? (
                <div className={`product-review-submit__feedback is-${feedbackTone}`}>{feedback}</div>
              ) : null}

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
