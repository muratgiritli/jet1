import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import {
  CONFIG,
  PAYMENT_OPTIONS,
  getAllProducts,
  type Product,
} from "@/lib/data";

type BasketItems = Record<string, number>;

interface CartContextType {
  basket: BasketItems;
  paymentId: string;
  setPaymentId: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  subtotal: number;
  selectedProducts: { product: Product; qty: number }[];
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

  const allProducts = useMemo(() => getAllProducts(), []);

  const { subtotal, selectedProducts, shipping, discount, grandTotal, minReached } = useMemo(() => {
    let sub = 0;
    const selected: { product: Product; qty: number }[] = [];
    allProducts.forEach((p) => {
      const qty = basket[p.id] || 0;
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
    [basket, paymentId, updateQty, subtotal, selectedProducts, shipping, discount, grandTotal, minReached, itemCount, minPerc, shipPerc]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
