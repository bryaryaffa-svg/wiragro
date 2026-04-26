"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { AccountDashboard } from "@/components/account-dashboard";
import { useAuth } from "@/components/auth-provider";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { trackUiEvent } from "@/lib/analytics";

function normalizeNextPath(rawValue: string | null) {
  if (!rawValue || !rawValue.startsWith("/") || rawValue.startsWith("//")) {
    return null;
  }

  return rawValue;
}

export function AccountPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isBusy, logout, requestOtpCode, verifyOtpCode } = useAuth();
  const [otpPhone, setOtpPhone] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [, setDebugCode] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const redirected = useRef(false);
  const nextPath = normalizeNextPath(searchParams.get("next"));
  const reviewOrderNumber = searchParams.get("reviewOrder");

  useEffect(() => {
    if (!session || !nextPath || redirected.current) {
      return;
    }

    redirected.current = true;
    router.replace(nextPath);
  }, [nextPath, router, session]);

  if (session) {
    return (
      <section className="page-stack account-page">
        <div className="account-hero account-hero--signed">
          <div className="account-hero__copy">
            <span className="eyebrow-label">Akun Wiragro</span>
            <h1>Halo, {session.customer.full_name}</h1>
            <p>
              Akun Anda aktif di browser ini. Wishlist, checkout, pelacakan pesanan, dan
              akses berikutnya akan memakai data yang sama sampai Anda logout.
            </p>
          </div>
          <div className="account-actions">
            <Link className="btn btn-primary" href={nextPath ?? "/wishlist"}>
              {nextPath ? "Lanjut ke halaman tujuan" : "Buka wishlist"}
            </Link>
            <Link className="btn btn-secondary" href="/produk">
              Jelajahi produk
            </Link>
            <button
              className="btn btn-secondary"
              onClick={() => {
                void logout();
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="account-summary-grid">
          <article className="account-summary">
            <span className="eyebrow-label">Identitas</span>
            <strong>ID akun</strong>
            <p>{session.customer.id}</p>
          </article>
          <article className="account-summary">
            <span className="eyebrow-label">Kontak</span>
            <strong>Email</strong>
            <p>{session.customer.email || "Belum tersedia"}</p>
          </article>
          <article className="account-summary">
            <span className="eyebrow-label">Kontak</span>
            <strong>WhatsApp</strong>
            <p>{session.customer.phone || "Belum tersedia"}</p>
          </article>
          <article className="account-summary">
            <span className="eyebrow-label">Akses</span>
            <strong>Mode akun</strong>
            <p>{session.pricing_mode || session.customer.member_tier || "Pengguna"}</p>
          </article>
        </div>

        <AccountDashboard reviewOrderNumber={reviewOrderNumber} session={session} />
      </section>
    );
  }

  return (
    <section className="page-stack account-page">
      <div className="account-hero">
        <div className="account-hero__copy">
          <span className="eyebrow-label">Masuk ke Wiragro</span>
          <h1>Masuk ke Wiragro</h1>
          <p>Akses akun, wishlist, checkout, dan pesanan Anda.</p>
          {nextPath ? (
            <div className="account-hero__next">
              Setelah login Anda akan diarahkan ke <strong>{nextPath}</strong>.
            </div>
          ) : null}
          <ul className="account-benefits">
            <li>
              <strong>Wishlist tersimpan</strong>
              <span>Produk favorit dapat dibuka lagi dari akun yang sama.</span>
            </li>
            <li>
              <strong>Checkout wajib login</strong>
              <span>Belanja tetap bebas, tetapi penyelesaian order memakai akun yang aktif.</span>
            </li>
            <li>
              <strong>Dua metode login</strong>
              <span>Gunakan Google atau OTP sesuai cara yang paling nyaman.</span>
            </li>
          </ul>
          <div className="account-actions">
            <Link className="btn btn-secondary" href="/produk">
              Jelajahi dulu
            </Link>
            <Link className="btn btn-secondary" href="/wishlist">
              Buka wishlist
            </Link>
          </div>
        </div>

        <div className="auth-stack">
          <div className="auth-panel">
            <span className="eyebrow-label">Google</span>
            <h2>Masuk dengan akun Google</h2>
            <p>
              Pilihan tercepat untuk pengguna yang ingin login langsung dengan popup resmi
              Google.
            </p>
            <GoogleSignInButton onMessage={setMessage} />
            <div className="panel-card panel-card--inline">
              Jika login Google belum berhasil, pastikan popup browser diizinkan lalu coba
              beberapa saat lagi.
            </div>
          </div>

          <form
            className="auth-panel"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage(null);

              startTransition(async () => {
                try {
                  if (!challengeId) {
                    trackUiEvent("login_started", {
                      provider: "whatsapp_otp",
                    });
                    const challenge = await requestOtpCode(otpPhone);
                    setChallengeId(challenge.challengeId);
                    setDebugCode(challenge.debugCode || null);
                    setMessage("OTP dikirim. Masukkan kode verifikasi yang Anda terima.");
                    return;
                  }

                  await verifyOtpCode(challengeId, otpCode);
                  setMessage("Login WhatsApp OTP berhasil.");
                } catch (otpError) {
                  setMessage(
                    otpError instanceof Error ? otpError.message : "OTP tidak valid",
                  );
                }
              });
            }}
          >
            <span className="eyebrow-label">WhatsApp OTP</span>
            <h2>Masuk dengan WhatsApp OTP</h2>
            <p>Masukkan nomor WhatsApp, minta OTP, lalu verifikasi tanpa perlu password.</p>
            <label>
              Nomor WhatsApp
              <input
                required
                inputMode="tel"
                placeholder="08xxxxxxxxxx"
                value={otpPhone}
                onChange={(event) => setOtpPhone(event.target.value)}
              />
            </label>

            {challengeId ? (
              <label>
                Kode OTP
                <input
                  required
                  inputMode="numeric"
                  placeholder="Masukkan kode OTP"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                />
              </label>
            ) : null}
            <div className="content-shell__cta">
              <button className="btn btn-primary" disabled={isPending || isBusy} type="submit">
                {isPending || isBusy
                  ? "Memproses..."
                  : challengeId
                    ? "Verifikasi OTP"
                    : "Kirim OTP"}
              </button>
              {challengeId ? (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setChallengeId(null);
                    setOtpCode("");
                    setDebugCode(null);
                    setMessage("Nomor WhatsApp bisa diubah lalu minta OTP baru.");
                  }}
                  type="button"
                >
                  Ganti nomor
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      {message ? <div className="panel-card">{message}</div> : null}
    </section>
  );
}
