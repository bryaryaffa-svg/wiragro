"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { useAuth } from "@/components/auth-provider";
import { GoogleSignInButton } from "@/components/google-signin-button";

export function AccountPanel() {
  const { session, isBusy, logout, requestOtpCode, verifyOtpCode } = useAuth();
  const [otpPhone, setOtpPhone] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (session) {
    return (
      <section className="page-stack">
        <div className="page-intro">
          <span className="eyebrow-label">Akun Customer</span>
          <h1>Halo, {session.customer.full_name}</h1>
          <p>
            Session customer sudah aktif di browser ini. Wishlist dan flow auth sudah
            terhubung ke backend storefront.
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
            <strong>Wishlist</strong>
            <p>
              <Link href="/wishlist">Buka wishlist</Link>
            </p>
          </article>
        </div>
        <button className="btn btn-secondary" onClick={logout} type="button">
          Logout
        </button>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-intro">
        <span className="eyebrow-label">Auth Customer</span>
        <h1>Login customer untuk wishlist dan pesanan berikutnya</h1>
        <p>
          Google login sekarang memakai Google OIDC sungguhan lewat Google Identity
          Services. WhatsApp OTP tetap memakai challenge backend dan menampilkan kode debug
          saat mode development aktif.
        </p>
      </div>

      <div className="checkout-grid">
        <div className="form-card">
          <span className="eyebrow-label">Google OIDC</span>
          <h2>Masuk dengan akun Google</h2>
          <p>
            Flow ini memakai popup resmi Google dan mengirim ID token ke backend untuk
            diverifikasi terhadap audience yang diizinkan.
          </p>
          <GoogleSignInButton onMessage={setMessage} />
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
                  setMessage("OTP dikirim. Masukkan kode verifikasi.");
                  return;
                }

                await verifyOtpCode(challengeId, otpCode);
                setMessage("Login WhatsApp OTP berhasil");
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
          <p>Gunakan nomor customer untuk menerima challenge OTP dari backend storefront.</p>
          <label>
            Nomor WhatsApp
            <input
              required
              value={otpPhone}
              onChange={(event) => setOtpPhone(event.target.value)}
            />
          </label>
          {challengeId ? (
            <label>
              Kode OTP
              <input
                required
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
              />
            </label>
          ) : null}
          {debugCode ? <p className="inline-note">Kode debug: {debugCode}</p> : null}
          <button className="btn btn-primary" disabled={isPending || isBusy} type="submit">
            {isPending || isBusy
              ? "Memproses..."
              : challengeId
                ? "Verifikasi OTP"
                : "Kirim OTP"}
          </button>
        </form>
      </div>

      {message ? <div className="panel-card">{message}</div> : null}
    </section>
  );
}
