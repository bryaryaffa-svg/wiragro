"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/components/auth-provider";
import {
  addWishlistItem,
  getWishlist,
  removeWishlistItem,
  type ProductSummary,
  type WishlistPayload,
} from "@/lib/api";

interface WishlistContextValue {
  items: WishlistPayload["items"];
  isLoading: boolean;
  error: string | null;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: ProductSummary) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [items, setItems] = useState<WishlistPayload["items"]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshWishlist() {
    if (!session) {
      setItems([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    try {
      const wishlist = await getWishlist(session.access_token);
      startTransition(() => {
        setItems(wishlist.items);
        setError(null);
      });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Gagal memuat wishlist");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshWishlist();
  }, [session?.access_token]);

  function isWishlisted(productId: string) {
    return items.some((item) => item.product_id === productId);
  }

  async function toggleWishlist(product: ProductSummary) {
    if (!session) {
      throw new Error("Silakan login untuk menyimpan wishlist");
    }

    setIsLoading(true);
    try {
      if (isWishlisted(product.id)) {
        await removeWishlistItem(session.access_token, product.id);
      } else {
        await addWishlistItem(session.access_token, product.id);
      }
      await refreshWishlist();
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Wishlist tidak dapat diproses");
      throw fetchError;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <WishlistContext.Provider
      value={{ items, isLoading, error, isWishlisted, toggleWishlist, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist harus dipakai di dalam WishlistProvider");
  }

  return context;
}
