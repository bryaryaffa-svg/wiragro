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
  addItemToCart,
  createGuestCart,
  getGuestCart,
  type CartPayload,
  updateCartItem,
} from "@/lib/api";

interface StoredSession {
  cartId: string;
  guestToken: string;
}

interface CartContextValue {
  cart: CartPayload | null;
  isReady: boolean;
  isBusy: boolean;
  error: string | null;
  addItem: (productId: string, qty?: number) => Promise<void>;
  setItemQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const STORAGE_KEY = "kios-sidomakmur-web-cart";
const CartContext = createContext<CartContextValue | null>(null);

async function createSession(): Promise<StoredSession> {
  const response = await createGuestCart();
  return { cartId: response.cart_id, guestToken: response.guest_token };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [cart, setCart] = useState<CartPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        const parsed = JSON.parse(raw) as StoredSession;
        setSession(parsed);
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

    if (!session) {
      setCart(null);
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    void getGuestCart(session.cartId, session.guestToken)
      .then((nextCart) => {
        startTransition(() => {
          setCart(nextCart);
          setError(null);
        });
      })
      .catch(() => {
        setSession(null);
        setCart(null);
      });
  }, [isReady, session]);

  async function ensureSession() {
    if (session) {
      return session;
    }

    const nextSession = await createSession();
    setSession(nextSession);
    return nextSession;
  }

  async function refreshCart() {
    if (!session) {
      return;
    }

    setIsBusy(true);
    try {
      const nextCart = await getGuestCart(session.cartId, session.guestToken);
      startTransition(() => {
        setCart(nextCart);
        setError(null);
      });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Gagal memuat keranjang");
    } finally {
      setIsBusy(false);
    }
  }

  async function addItem(productId: string, qty = 1) {
    setIsBusy(true);
    try {
      const activeSession = await ensureSession();
      const nextCart = await addItemToCart(
        activeSession.cartId,
        activeSession.guestToken,
        productId,
        qty,
      );
      startTransition(() => {
        setCart(nextCart);
        setError(null);
      });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Gagal menambahkan produk");
      throw fetchError;
    } finally {
      setIsBusy(false);
    }
  }

  async function setItemQty(itemId: string, qty: number) {
    if (!session) {
      throw new Error("Keranjang guest belum tersedia");
    }

    setIsBusy(true);
    try {
      const nextCart = await updateCartItem(itemId, session.cartId, session.guestToken, qty);
      startTransition(() => {
        setCart(nextCart);
        setError(null);
      });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Gagal memperbarui keranjang");
      throw fetchError;
    } finally {
      setIsBusy(false);
    }
  }

  async function removeItem(itemId: string) {
    await setItemQty(itemId, 0);
  }

  function clearCart() {
    setSession(null);
    setCart(null);
    setError(null);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isReady,
        isBusy,
        error,
        addItem,
        setItemQty,
        removeItem,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus dipakai di dalam CartProvider");
  }

  return context;
}
