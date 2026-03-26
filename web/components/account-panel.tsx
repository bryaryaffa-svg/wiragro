"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { useAuth } from "@/components/auth-provider";
import { GoogleSignInButton } from "@/components/google-signin-button";

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
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const redirected = useRef(false);
  const nextPath = normalizeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (!session || !nextPath || redirected.current) {
      return;
    }

    redirected.current = true;
    router.replace(nextPath);
  }, [nextPath, router, session]);

  if (session) {
    return (
      <section className="page-stack">
        <div className="page-intro page-intro--compact">
          <span className="eyebrow-label">Akun customer</span>
          <h1>Halo, {session.customer.full_name}</h1>
          <p>
            Session customer aktif di browser ini. Wishlist, login customer, dan order
            berikutnya akan memakai akun yang sama sampai Anda logout.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <strong>ID customer</strong>
            <p>{session.customer.id}</p>
          </article>
          <article className="feature-card">
            <strong>Email</strong>
            <p>{session.customer.email || "-"}</p>
          </article>
          <article className="feature-card">
            <strong>WhatsApp</strong>
            <p>{session.customer.phone || "-"}</p>
          </article>
          <article className="feature-card">
            <strong>Mode akun</strong>
            <p>{session.pricing_mode || session.customer.member_tier || "Customer"}</p>
          </article>
        </div>

        <div className="content-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Aksi cepat</span>
              <h2>Lanjutkan belanja</h2>
            </div>
          </div>
          <div className="content-shell__cta">
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
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Masuk customer</span>
        <h1>Login ke website Sidomakmur dengan alur yang lebih jelas</h1>
        <p>
          Anda bisa masuk dengan Google atau WhatsApp OTP. Setelah berhasil, website akan
          langsung melanjutkan ke halaman yang Anda butuhkan.
        </p>
      </div>

      {nextPath ? (
        <div className="panel-card panel-card--inline">
          Setelah login Anda akan diarahkan ke <strong>{nextPath}</strong>.
        </div>
      ) : null}

      <div className="feature-grid">
        <article className="feature-card">
          <strong>Wishlist sinkron</strong>
          <p>Simpan produk favorit dan akses lagi dari browser yang sama dengan akun customer.</p>
        </article>
        <article className="feature-card">
          <strong>Checkout lebih cepat</strong>
          <p>Data customer tidak perlu diulang terus saat Anda kembali belanja.</p>
        </article>
        <article className="feature-card">
          <strong>OTP atau Google</strong>
          <p>Pilih login yang paling nyaman tanpa harus memaksa satu metode saja.</p>
        </article>
      </div>

      <div className="checkout-grid">
        <div className="form-card">
          <span className="eyebrow-label">Google OIDC</span>
          <h2>Masuk dengan akun Google</h2>
          <p>
            Cocok untuk customer yang ingin login cepat dan langsung diproses dengan popup
            resmi Google.
          </p>
          <GoogleSignInButton onMessage={setMessage} />
          <div className="panel-card panel-card--inline">
            Jika login Google gagal, penyebab paling umum adalah origin domain belum
            didaftarkan di Google Cloud Console atau popup diblokir browser.
          </div>
        </div>

        <form
          className="form-card"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);

            startTransition(async () => {
              try {
                if (!challengeId) {
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
          <p>Masukkan nomor customer, minta OTP, lalu verifikasi tanpa perlu password.</p>

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

          {debugCode ? <p className="inline-note">Kode debug: {debugCode}</p> : null}

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

      <div className="content-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Tetap bisa belanja</span>
            <h2>Tidak wajib login untuk mulai memilih produk</h2>
          </div>
        </div>
        <div className="content-shell__cta">
          <Link className="btn btn-secondary" href="/produk">
            Lanjut sebagai guest
          </Link>
        </div>
      </div>

      {message ? <div className="panel-card">{message}</div> : null}
    </section>
  );
}
