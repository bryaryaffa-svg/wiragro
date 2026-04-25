"use client";

import Script from "next/script";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/components/auth-provider";
import { getGoogleClientId } from "@/lib/config";

function explainPromptReason(reason?: string) {
  switch (reason) {
    case "suppressed_by_user":
      return "Prompt Google ditutup oleh pengguna.";
    case "browser_not_supported":
      return "Browser ini belum mendukung prompt Google One Tap.";
    case "invalid_client":
      return "Client ID Google belum valid untuk domain ini.";
    case "unregistered_origin":
      return "Origin website ini belum didaftarkan di Google OAuth.";
    case "secure_http_required":
      return "Google login butuh HTTPS yang valid.";
    default:
      return "Prompt Google tidak dapat ditampilkan sekarang.";
  }
}

export function GoogleSignInButton({
  onMessage,
}: {
  onMessage: (message: string) => void;
}) {
  const googleClientId = getGoogleClientId();
  const { isBusy, loginGoogle } = useAuth();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [buttonWidth, setButtonWidth] = useState(320);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [promptState, setPromptState] = useState<string | null>(null);

  const handleCredential = useEffectEvent(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      onMessage("Google tidak mengembalikan credential login.");
      return;
    }

    try {
      await loginGoogle(response.credential);
      onMessage("Login Google berhasil.");
    } catch (loginError) {
      onMessage(loginError instanceof Error ? loginError.message : "Login Google gagal.");
    }
  });

  const initializeGoogle = useEffectEvent(() => {
    if (!googleClientId || !buttonRef.current || !window.google) {
      return;
    }

    try {
      buttonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          void handleCredential(response);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
        context: "signin",
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: buttonWidth,
        logo_alignment: "left",
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed?.()) {
          setPromptState(explainPromptReason(notification.getNotDisplayedReason?.()));
          return;
        }

        if (notification.isSkippedMoment?.()) {
          setPromptState(explainPromptReason(notification.getSkippedReason?.()));
          return;
        }

        if (notification.isDismissedMoment?.()) {
          setPromptState(explainPromptReason(notification.getDismissedReason?.()));
          return;
        }

        setPromptState(null);
      });

      setRenderError(null);
    } catch {
      setRenderError("Komponen login Google tidak berhasil dirender. Coba muat ulang halaman.");
    }
  });

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = Math.max(220, Math.min(360, wrapperRef.current?.clientWidth ?? 320));
      setButtonWidth(nextWidth);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(wrapperRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!scriptReady || !googleClientId || !buttonRef.current || !window.google) {
      return;
    }

    initializeGoogle();

    return () => {
      window.google?.accounts.id.cancel?.();
    };
  }, [buttonWidth, initializeGoogle, scriptReady]);

  return (
    <div className="google-auth-block" ref={wrapperRef}>
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
        <div className="panel-card panel-card--inline panel-card--danger">
          NEXT_PUBLIC_GOOGLE_CLIENT_ID belum diisi.
        </div>
      ) : null}
      {scriptError ? (
        <div className="panel-card panel-card--inline panel-card--danger">{scriptError}</div>
      ) : null}
      {renderError ? (
        <div className="panel-card panel-card--inline panel-card--danger">{renderError}</div>
      ) : null}
      {googleClientId ? (
        <>
          <div className="google-signin-slot" ref={buttonRef} />
          <div className="content-shell__cta">
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (!window.google || !scriptReady) {
                  setRenderError("Library Google belum siap. Coba beberapa detik lagi.");
                  return;
                }

                initializeGoogle();
                onMessage("Membuka login Google...");
              }}
              type="button"
            >
              Coba login Google lagi
            </button>
          </div>
          <p className="inline-note">
            Login Google diproses lewat layanan resmi Google agar sesi akun dibuat dengan
            aman.
          </p>
          {promptState ? <p className="inline-note">{promptState}</p> : null}
          {isBusy ? <p className="inline-note">Memproses login Google...</p> : null}
        </>
      ) : null}
    </div>
  );
}
