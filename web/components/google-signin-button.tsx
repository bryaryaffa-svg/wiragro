"use client";

import Script from "next/script";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/components/auth-provider";
import { googleClientId } from "@/lib/config";

export function GoogleSignInButton({
  onMessage,
}: {
  onMessage: (message: string) => void;
}) {
  const { isBusy, loginGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  const handleCredential = useEffectEvent(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      onMessage("Google tidak mengembalikan credential login.");
      return;
    }

    try {
      await loginGoogle(response.credential);
      onMessage("Login Google berhasil.");
    } catch (loginError) {
      onMessage(
        loginError instanceof Error ? loginError.message : "Login Google gagal.",
      );
    }
  });

  useEffect(() => {
    if (!scriptReady || !googleClientId || !buttonRef.current || !window.google) {
      return;
    }

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        void handleCredential(response);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      context: "signin",
      ux_mode: "popup",
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 320,
      logo_alignment: "left",
    });
  }, [handleCredential, scriptReady]);

  return (
    <div className="google-auth-block">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onError={() => {
          setScriptError("Library Google Identity Services gagal dimuat.");
        }}
        onLoad={() => {
          setScriptReady(true);
          setScriptError(null);
        }}
      />
      {!googleClientId ? (
        <div className="panel-card panel-card--inline">
          NEXT_PUBLIC_GOOGLE_CLIENT_ID belum diisi.
        </div>
      ) : null}
      {scriptError ? (
        <div className="panel-card panel-card--inline">{scriptError}</div>
      ) : null}
      {googleClientId ? (
        <>
          <div className="google-signin-slot" ref={buttonRef} />
          <p className="inline-note">
            Google sign-in memakai popup OIDC resmi Google. Backend memverifikasi ID token
            sebelum session customer dibuat.
          </p>
          {isBusy ? <p className="inline-note">Memproses login Google...</p> : null}
        </>
      ) : null}
    </div>
  );
}
