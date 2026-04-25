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

interface StoredCartState {
  session: StoredSession | null;
  cart: CartPayload | null;
  updatedAt: string;
}

interface CartContextValue {
  cart: CartPayload | null;
  isReady: boolean;
  isBusy: boolean;
  error: string | null;
  addItem: (productId: string, qty?: number) => Promise<void>;
  addItems: (items: Array<{ productId: string; qty: number }>) => Promise<void>;
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

function persistCartState(session: StoredSession | null, cart: CartPayload | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const payload: StoredCartState = {
    session,
    cart,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function readStoredState(): StoredCartState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredCartState | StoredSession;
    if ("session" in parsed) {
      return parsed;
    }

    return {
      session: parsed,
      cart: null,
      updatedAt: new Date(0).toISOString(),
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function normalizeCartBatch(items: Array<{ productId: string; qty: number }>) {
  const grouped = new Map<string, number>();

  items.forEach((item) => {
    if (!item.productId || item.qty <= 0) {
      return;
    }

    grouped.set(item.productId, (grouped.get(item.productId) ?? 0) + item.qty);
  });

  return Array.from(grouped.entries()).map(([productId, qty]) => ({
    productId,
    qty,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [cart, setCart] = useState<CartPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const hydrated = useRef(false);
  const sessionRef = useRef<StoredSession | null>(null);
  const sessionPromiseRef = useRef<Promise<StoredSession> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (hydrated.current) {
      return;
    }

    hydrated.current = true;
    const stored = readStoredState();
    if (stored?.session) {
      setSession(stored.session);
      setCart(stored.cart);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    persistCartState(session, cart);
  }, [cart, isReady, session]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const stored = readStoredState();
      startTransition(() => {
        setSession(stored?.session ?? null);
        setCart(stored?.cart ?? null);
        setError(null);
      });
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isReady]);

  useEffect(() => {
    if (!isReady || !session) {
      if (isReady && !session) {
        setCart(null);
      }
      return;
    }

    const nextRequestId = ++requestIdRef.current;

    void getGuestCart(session.cartId, session.guestToken)
      .then((nextCart) => {
        if (requestIdRef.current !== nextRequestId) {
          return;
        }

        startTransition(() => {
          setCart(nextCart);
          setError(null);
        });
      })
      .catch(() => {
        if (requestIdRef.current !== nextRequestId) {
          return;
        }

        startTransition(() => {
          setSession(null);
          setCart(null);
          setError("Keranjang sebelumnya sudah tidak tersedia. Silakan mulai lagi.");
        });
      });
  }, [isReady, session]);

  async function ensureSession() {
    if (sessionRef.current) {
      return sessionRef.current;
    }

    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = createSession()
        .then((nextSession) => {
          sessionRef.current = nextSession;
          setSession(nextSession);
          return nextSession;
        })
        .finally(() => {
          sessionPromiseRef.current = null;
        });
    }

    return sessionPromiseRef.current;
  }

  async function refreshCart() {
    if (!sessionRef.current) {
      return;
    }

    setIsBusy(true);
    const nextRequestId = ++requestIdRef.current;
    try {
      const nextCart = await getGuestCart(
        sessionRef.current.cartId,
        sessionRef.current.guestToken,
      );
      if (requestIdRef.current !== nextRequestId) {
        return;
      }
      startTransition(() => {
        setCart(nextCart);
        setError(null);
      });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Gagal memuat keranjang");
      throw fetchError;
    } finally {
      setIsBusy(false);
    }
  }

  async function addItem(productId: string, qty = 1) {
    await addItems([{ productId, qty }]);
  }

  async function addItems(items: Array<{ productId: string; qty: number }>) {
    const normalizedItems = normalizeCartBatch(items);

    if (!normalizedItems.length) {
      return;
    }

    setIsBusy(true);
    const nextRequestId = ++requestIdRef.current;
    try {
      const activeSession = await ensureSession();
      let nextCart: CartPayload | null = null;

      for (const item of normalizedItems) {
        nextCart = await addItemToCart(
          activeSession.cartId,
          activeSession.guestToken,
          item.productId,
          item.qty,
        );
      }

      if (requestIdRef.current !== nextRequestId) {
        return;
      }
      startTransition(() => {
        if (nextCart) {
          setCart(nextCart);
        }
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
    if (!sessionRef.current) {
      throw new Error("Keranjang sementara belum tersedia");
    }

    setIsBusy(true);
    const nextRequestId = ++requestIdRef.current;
    try {
      const nextCart = await updateCartItem(
        itemId,
        sessionRef.current.cartId,
        sessionRef.current.guestToken,
        qty,
      );
      if (requestIdRef.current !== nextRequestId) {
        return;
      }
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
    sessionRef.current = null;
    setSession(null);
    setCart(null);
    setError(null);
    persistCartState(null, null);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isReady,
        isBusy,
        error,
        addItem,
        addItems,
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
