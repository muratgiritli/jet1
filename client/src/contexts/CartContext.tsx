import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CONFIG,
  PAYMENT_OPTIONS,
  MAIN_PRODUCTS,
  CATEGORIES,
} from "@/lib/data";
import type { Product as DbProduct } from "@shared/schema";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  img?: string | null;
  skt?: string | null;
  originalPrice?: number | null;
}

type BasketItems = Record<string, number>;

interface CartContextType {
  basket: BasketItems;
  paymentId: string;
  setPaymentId: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  selectedProducts: { product: CartProduct; qty: number }[];
  shipping: number;
  discount: number;
  grandTotal: number;
  minReached: boolean;
  itemCount: number;
  minPerc: number;
  shipPerc: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<BasketItems>({});
  const [paymentId, setPaymentId] = useState("nakit");

  const { data: dbProducts = [] } = useQuery<DbProduct[]>({
    queryKey: ["/api/products"],
  });

  const allProducts: CartProduct[] = useMemo(() => {
    const staticProducts: CartProduct[] = [
      ...MAIN_PRODUCTS,
      ...CATEGORIES.flatMap((c) => c.items),
    ];
    const apiProducts: CartProduct[] = dbProducts.map((p) => ({
      id: String(p.id),
      name: p.name,
      price: p.price,
      img: p.img,
      skt: p.skt,
      originalPrice: p.originalPrice,
    }));
    return [...staticProducts, ...apiProducts];
  }, [dbProducts]);

  const updateQty = useCallback((id: string, delta: number) => {
    setBasket((prev) => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  }, []);

  const clearCart = useCallback(() => {
    setBasket({});
  }, []);

  const { subtotal, selectedProducts, shipping, discount, grandTotal, minReached } = useMemo(() => {
    let sub = 0;
    const selected: { product: CartProduct; qty: number }[] = [];
    allProducts.forEach((p) => {
      const key = p.id;
      const qty = basket[key] || 0;
      if (qty > 0) {
        sub += qty * p.price;
        selected.push({ product: p, qty });
      }
    });

    const pay = PAYMENT_OPTIONS.find((p) => p.id === paymentId)!;
    const disc = sub * pay.disc;
    const afterDisc = sub - disc;
    const ship = afterDisc >= CONFIG.shipLimit ? 0 : CONFIG.shipFee;
    const total = afterDisc + ship;
    const min = sub >= CONFIG.minLimit;

    return {
      subtotal: sub,
      selectedProducts: selected,
      shipping: ship,
      discount: disc,
      grandTotal: total,
      minReached: min,
    };
  }, [basket, paymentId, allProducts]);

  const itemCount = Object.values(basket).reduce((a, b) => a + b, 0);
  const minPerc = Math.min((subtotal / CONFIG.minLimit) * 100, 100);
  const shipPerc = Math.min((subtotal / CONFIG.shipLimit) * 100, 100);

  const value = useMemo(
    () => ({
      basket,
      paymentId,
      setPaymentId,
      updateQty,
      clearCart,
      subtotal,
      selectedProducts,
      shipping,
      discount,
      grandTotal,
      minReached,
      itemCount,
      minPerc,
      shipPerc,
    }),
    [basket, paymentId, updateQty, clearCart, subtotal, selectedProducts, shipping, discount, grandTotal, minReached, itemCount, minPerc, shipPerc]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
