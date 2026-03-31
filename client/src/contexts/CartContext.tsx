import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CONFIG,
  PAYMENT_OPTIONS,
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

interface CampaignItemInfo {
  product_id: number;
  item_type: string;
}

export const KEDI_KUMU_MAX_QTY = 2;

interface CartContextType {
  basket: BasketItems;
  paymentId: string;
  setPaymentId: (id: string) => void;
  updateQty: (id: string, delta: number) => boolean;
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
  hasCampaignItems: boolean;
  campaignMainCount: number;
  campaignExtraCount: number;
  campaignValid: boolean;
  campaignMainInCart: string | null;
  campaignData: CampaignItemInfo[];
  isKediKumu: (id: string) => boolean;
  getProductStock: (id: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

function loadBasket(): BasketItems {
  try {
    const saved = localStorage.getItem("jet55_cart");
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function saveBasket(b: BasketItems) {
  try {
    if (Object.keys(b).length === 0) {
      localStorage.removeItem("jet55_cart");
    } else {
      localStorage.setItem("jet55_cart", JSON.stringify(b));
    }
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<BasketItems>(loadBasket);
  const [paymentId, setPaymentId] = useState("nakit");

  const { data: dbProducts = [] } = useQuery<DbProduct[]>({
    queryKey: ["/api/products"],
  });

  const { data: campaignData = [] } = useQuery<CampaignItemInfo[]>({
    queryKey: ["/api/campaign-items"],
  });

  const campaignMainIdsRef = useRef<Set<string>>(new Set());
  const campaignLitterIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const mainSet = new Set<string>();
    const litterSet = new Set<string>();
    for (const ci of campaignData) {
      const pid = String(ci.product_id);
      if (ci.item_type === "main") mainSet.add(pid);
    }
    campaignMainIdsRef.current = mainSet;
    campaignLitterIdsRef.current = litterSet;
    if (mainSet.size > 0) {
      setBasket((prev) => {
        let changed = false;
        const copy = { ...prev };
        let foundMain = false;
        for (const id of mainSet) {
          if (copy[id]) {
            if (foundMain) {
              delete copy[id];
              changed = true;
            } else {
              foundMain = true;
              if (copy[id] > 1) {
                copy[id] = 1;
                changed = true;
              }
            }
          }
        }
        if (changed) {
          saveBasket(copy);
          return copy;
        }
        return prev;
      });
    }
  }, [campaignData]);

  const allProducts: CartProduct[] = useMemo(() => {
    return dbProducts.map((p) => ({
      id: String(p.id),
      name: p.name,
      price: p.price,
      img: p.img,
      skt: p.skt,
      originalPrice: p.originalPrice,
    }));
  }, [dbProducts]);

  const kediKumuIdsRef = useRef<Set<string>>(new Set());
  const kediKumuIds = useMemo(() => {
    const s = new Set(dbProducts.filter(p => p.brandCategoryId === 24).map(p => String(p.id)));
    kediKumuIdsRef.current = s;
    return s;
  }, [dbProducts]);
  const isKediKumu = useCallback((id: string) => kediKumuIdsRef.current.has(id), []);

  const stockMapRef = useRef<Map<string, number>>(new Map());
  useMemo(() => {
    const m = new Map<string, number>();
    for (const p of dbProducts) m.set(String(p.id), p.stock ?? 0);
    stockMapRef.current = m;
    return m;
  }, [dbProducts]);

  const getProductStock = useCallback((id: string) => stockMapRef.current.get(id) ?? 0, []);

  const updateQty = useCallback((id: string, delta: number): boolean => {
    let blocked = false;
    setBasket((prev) => {
      const current = prev[id] || 0;
      let next = current + delta;
      if (campaignMainIdsRef.current.has(id)) {
        if (next > 1) next = 1;
        if (delta > 0 && current === 0) {
          const hasAnotherMain = Array.from(campaignMainIdsRef.current).some(
            (mid) => mid !== id && (prev[mid] || 0) > 0
          );
          if (hasAnotherMain) return prev;
        }
      }
      if (kediKumuIdsRef.current.has(id) && next > KEDI_KUMU_MAX_QTY) {
        next = KEDI_KUMU_MAX_QTY;
      }
      const stock = stockMapRef.current.get(id) ?? 0;
      if (delta > 0 && next > stock) {
        blocked = true;
        next = stock;
        if (next === current) return prev;
      }
      let updated: BasketItems;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        updated = copy;
      } else {
        updated = { ...prev, [id]: next };
      }
      saveBasket(updated);
      return updated;
    });
    return blocked;
  }, []);

  const clearCart = useCallback(() => {
    setBasket({});
    saveBasket({});
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

  const campaignSet = useMemo(() => {
    const map = new Map<string, string>();
    for (const ci of campaignData) {
      map.set(String(ci.product_id), ci.item_type);
    }
    return map;
  }, [campaignData]);

  const { hasCampaignItems, campaignMainCount, campaignExtraCount, campaignValid, campaignMainInCart } = useMemo(() => {
    let mainCount = 0;
    let extraCount = 0;
    let mainInCart: string | null = null;
    for (const { product, qty } of selectedProducts) {
      const type = campaignSet.get(product.id);
      if (type === "main") {
        mainCount += qty;
        mainInCart = product.id;
      }
      if (type === "extra") extraCount += qty;
    }
    const hasCampaign = mainCount > 0 || extraCount > 0;
    return {
      hasCampaignItems: hasCampaign,
      campaignMainCount: mainCount,
      campaignExtraCount: extraCount,
      campaignValid: !hasCampaign || (mainCount >= 1 && extraCount >= 1),
      campaignMainInCart: mainInCart,
    };
  }, [selectedProducts, campaignSet]);

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
      hasCampaignItems,
      campaignMainCount,
      campaignExtraCount,
      campaignValid,
      campaignMainInCart,
      campaignData,
      isKediKumu,
      getProductStock,
    }),
    [basket, paymentId, updateQty, clearCart, subtotal, selectedProducts, shipping, discount, grandTotal, minReached, itemCount, minPerc, shipPerc, hasCampaignItems, campaignMainCount, campaignExtraCount, campaignValid, campaignMainInCart, campaignData, isKediKumu, getProductStock]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
