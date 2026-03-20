"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  type CustomerSession,
  loginGoogleIdToken,
  requestWhatsAppOtp,
  verifyWhatsAppOtp,
} from "@/lib/api";

interface OtpChallengeState {
  challengeId: string;
  expiresInSeconds: number;
  debugCode?: string;
}

interface AuthContextValue {
  session: CustomerSession | null;
  isReady: boolean;
  isBusy: boolean;
  loginGoogle: (idToken: string) => Promise<void>;
  requestOtpCode: (phone: string) => Promise<OtpChallengeState>;
  verifyOtpCode: (challengeId: string, otpCode: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "kios-sidomakmur-web-auth";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) {
      return;
    }

    hydrated.current = true;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSession(JSON.parse(raw) as CustomerSession);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [isReady, session]);

  async function loginGoogle(idToken: string) {
    setIsBusy(true);
    try {
      const nextSession = await loginGoogleIdToken(idToken);
      startTransition(() => {
        setSession(nextSession);
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function requestOtpCode(phone: string) {
    setIsBusy(true);
    try {
      const challenge = await requestWhatsAppOtp(phone);
      return {
        challengeId: challenge.challenge_id,
        expiresInSeconds: challenge.expires_in_seconds,
        debugCode: challenge.debug_otp_code,
      };
    } finally {
      setIsBusy(false);
    }
  }

  async function verifyOtpCode(challengeId: string, otpCode: string) {
    setIsBusy(true);
    try {
      const nextSession = await verifyWhatsAppOtp(challengeId, otpCode);
      startTransition(() => {
        setSession(nextSession);
      });
    } finally {
      setIsBusy(false);
    }
  }

  function logout() {
    if (typeof window !== "undefined") {
      window.google?.accounts.id.disableAutoSelect();
    }
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isReady,
        isBusy,
        loginGoogle,
        requestOtpCode,
        verifyOtpCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }

  return context;
}
