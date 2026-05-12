import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CONFIG,
  PAYMENT_OPTIONS,
} from "@/lib/data";
import type { Product as DbProduct } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  img?: string | null;
  skt?: string | null;
  originalPrice?: number | null;
  animal?: string | null;
}

type BasketItems = Record<string, number>;

interface CampaignItemInfo {
  product_id: number;
  item_type: string;
  campaign_price?: string | number | null;
}

export const KEDI_KUMU_MAX_QTY = 2;

interface CartContextType {
  basket: BasketItems;
  paymentId: string;
  setPaymentId: (id: string) => void;
  updateQty: (id: string, delta: number, fromCampaign?: boolean) => boolean;
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
  updateStock: (id: string, stock: number) => void;
  campaignCartIds: Set<string>;
  isPreorderProduct: (id: string) => boolean;
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

function loadCampaignCartIds(): Set<string> {
  try {
    const saved = localStorage.getItem("jet55_campaign_cart");
    if (saved) return new Set(JSON.parse(saved));
  } catch {}
  return new Set();
}

function saveCampaignCartIds(s: Set<string>) {
  try {
    if (s.size === 0) {
      localStorage.removeItem("jet55_campaign_cart");
    } else {
      localStorage.setItem("jet55_campaign_cart", JSON.stringify([...s]));
    }
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<BasketItems>(loadBasket);
  const [paymentId, setPaymentId] = useState("nakit");
  const [campaignCartIds, setCampaignCartIds] = useState<Set<string>>(loadCampaignCartIds);
  const campaignCartIdsRef = useRef<Set<string>>(campaignCartIds);

  const { data: dbProducts = [] } = useQuery<DbProduct[]>({
    queryKey: ["/api/products"],
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
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

  const campaignPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const ci of campaignData) {
      if (ci.campaign_price) map.set(String(ci.product_id), parseFloat(String(ci.campaign_price)));
    }
    return map;
  }, [campaignData]);

  const allProducts: CartProduct[] = useMemo(() => {
    return dbProducts.map((p) => {
      const pid = String(p.id);
      const cp = campaignCartIds.has(pid) ? campaignPriceMap.get(pid) : undefined;
      return {
        id: pid,
        name: p.name,
        price: cp ?? p.price,
        img: p.img,
        skt: p.skt,
        originalPrice: cp ? p.price : p.originalPrice,
        animal: (p as any).animal ?? null,
      };
    });
  }, [dbProducts, campaignPriceMap, campaignCartIds]);

  const kediKumuIdsRef = useRef<Set<string>>(new Set());
  const kediKumuIds = useMemo(() => {
    const s = new Set(dbProducts.filter(p => p.brandCategoryId === 24).map(p => String(p.id)));
    kediKumuIdsRef.current = s;
    return s;
  }, [dbProducts]);
  const isKediKumu = useCallback((id: string) => kediKumuIdsRef.current.has(id), []);
  const isPreorderProduct = useCallback((id: string) => preorderIdsRef.current.has(id) && (stockMapRef.current.get(id) ?? 0) === 0, []);

  const stockMapRef = useRef<Map<string, number>>(new Map());
  const preorderIdsRef = useRef<Set<string>>(new Set());
  useMemo(() => {
    const m = new Map<string, number>();
    const po = new Set<string>();
    for (const p of dbProducts) {
      m.set(String(p.id), p.stock ?? 0);
      if (p.preorderEnabled) po.add(String(p.id));
    }
    stockMapRef.current = m;
    preorderIdsRef.current = po;
    return m;
  }, [dbProducts]);

  const getProductStock = useCallback((id: string) => stockMapRef.current.get(id) ?? 0, []);

  const updateStock = useCallback((id: string, stock: number) => {
    stockMapRef.current.set(id, stock);
  }, []);

  const dbProductsRef = useRef<DbProduct[]>([]);
  useEffect(() => { dbProductsRef.current = dbProducts; }, [dbProducts]);

  const basketRef = useRef<BasketItems>(basket);
  useEffect(() => { basketRef.current = basket; }, [basket]);

  const updateQty = useCallback((id: string, delta: number, fromCampaign?: boolean): boolean => {
    let blocked = false;
    let actualDelta = 0;
    if (delta > 0) {
      const basketNow = basketRef.current;
      const cartIdsNow = campaignCartIdsRef.current;
      const hasCampaignInCart = Array.from(cartIdsNow).some((cid) => (basketNow[cid] || 0) > 0);
      const hasNormalInCart = Object.keys(basketNow).some((bid) => (basketNow[bid] || 0) > 0 && !cartIdsNow.has(bid));
      const alreadyInCart = (basketNow[id] || 0) > 0;
      if (!alreadyInCart) {
        if (fromCampaign && hasNormalInCart) {
          toast({
            title: "Sepetinizde normal ürün var",
            description: "Kampanya ürünü eklemek için önce sepetinizdeki normal ürünleri çıkarın veya siparişi tamamlayın.",
            variant: "destructive",
          });
          return true;
        }
        if (!fromCampaign && hasCampaignInCart) {
          toast({
            title: "Sepetinizde kampanya ürünü var",
            description: "Normal ürün eklemek için önce kampanya siparişinizi tamamlayın veya kampanya ürününü sepetten çıkarın.",
            variant: "destructive",
          });
          return true;
        }
        const stockNow = stockMapRef.current;
        const preorderSet = preorderIdsRef.current;
        const isPreorderTarget = preorderSet.has(id) && (stockNow.get(id) ?? 0) === 0;
        const hasPreorderInCart = Object.keys(basketNow).some(
          (bid) => (basketNow[bid] || 0) > 0 && preorderSet.has(bid) && (stockNow.get(bid) ?? 0) === 0
        );
        const hasNonPreorderInCart = Object.keys(basketNow).some(
          (bid) => (basketNow[bid] || 0) > 0 && !(preorderSet.has(bid) && (stockNow.get(bid) ?? 0) === 0)
        );
        if (isPreorderTarget && hasNonPreorderInCart) {
          toast({
            title: "Ön sipariş tek başına verilir",
            description: "Ön sipariş ürünleri sepete başka ürünle birlikte eklenemez. Önce sepetteki diğer ürünlerin siparişini tamamlayın.",
            variant: "destructive",
          });
          return true;
        }
        if (!isPreorderTarget && hasPreorderInCart) {
          toast({
            title: "Sepetinizde ön sipariş ürünü var",
            description: "Normal ürün eklemek için önce ön sipariş siparişinizi tamamlayın veya ön sipariş ürününü sepetten çıkarın.",
            variant: "destructive",
          });
          return true;
        }
      }
    }
    if (fromCampaign && delta > 0) {
      setCampaignCartIds(prev => {
        const next = new Set(prev);
        next.add(id);
        campaignCartIdsRef.current = next;
        saveCampaignCartIds(next);
        return next;
      });
    }
    setBasket((prev) => {
      const current = prev[id] || 0;
      let next = current + delta;
      actualDelta = 0;
      const isCampaignItem = campaignCartIdsRef.current.has(id);
      if (isCampaignItem && campaignMainIdsRef.current.has(id)) {
        if (next > 1) next = 1;
        if (delta > 0 && current === 0) {
          const hasAnotherMain = Array.from(campaignMainIdsRef.current).some(
            (mid) => mid !== id && (prev[mid] || 0) > 0 && campaignCartIdsRef.current.has(mid)
          );
          if (hasAnotherMain) return prev;
        }
      }
      if (kediKumuIdsRef.current.has(id) && next > KEDI_KUMU_MAX_QTY) {
        next = KEDI_KUMU_MAX_QTY;
      }
      const stockVal = stockMapRef.current.get(id);
      const isPreorder = preorderIdsRef.current.has(id);
      if (delta > 0 && stockVal !== undefined && next > stockVal && !isPreorder) {
        blocked = true;
        next = stockVal;
        if (next === current) return prev;
      }
      let updated: BasketItems;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        updated = copy;
        setCampaignCartIds(prev2 => {
          const next2 = new Set(prev2);
          next2.delete(id);
          campaignCartIdsRef.current = next2;
          saveCampaignCartIds(next2);
          return next2;
        });
      } else {
        updated = { ...prev, [id]: next };
      }
      actualDelta = next - current;
      saveBasket(updated);
      return updated;
    });
    if (actualDelta > 0 && typeof window !== "undefined" && (window as any).gtag) {
      const p = dbProductsRef.current.find((x) => String(x.id) === id);
      if (p) {
        try {
          (window as any).gtag("event", "add_to_cart", {
            currency: "TRY",
            value: p.price * actualDelta,
            items: [{ item_id: String(p.id), item_name: p.name, price: p.price, quantity: actualDelta }],
          });
        } catch {}
      }
    }
    return blocked;
  }, []);

  const clearCart = useCallback(() => {
    setBasket({});
    saveBasket({});
    setCampaignCartIds(new Set());
    campaignCartIdsRef.current = new Set();
    saveCampaignCartIds(new Set());
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
    const discRate = pay.disc < 0 ? Math.abs(pay.disc) : 0;
    const disc = sub * discRate;
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
    let mainInCart: string | null = null;
    for (const { product, qty } of selectedProducts) {
      const type = campaignSet.get(product.id);
      if (type === "main") {
        mainCount += qty;
        mainInCart = product.id;
      }
    }
    return {
      hasCampaignItems: mainCount > 0,
      campaignMainCount: mainCount,
      campaignExtraCount: 0,
      campaignValid: true,
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
      updateStock,
      campaignCartIds,
      isPreorderProduct,
    }),
    [basket, paymentId, updateQty, clearCart, subtotal, selectedProducts, shipping, discount, grandTotal, minReached, itemCount, minPerc, shipPerc, hasCampaignItems, campaignMainCount, campaignExtraCount, campaignValid, campaignMainInCart, campaignData, isKediKumu, getProductStock, updateStock, campaignCartIds, isPreorderProduct]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
