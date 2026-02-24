import { useEffect, useState } from "react";

interface RecentProduct {
  id: number;
  name: string;
  price: number;
  img?: string | null;
}

const STORAGE_KEY = "jet55_recently_viewed";
const MAX_ITEMS = 10;

export function addRecentlyViewed(product: RecentProduct) {
  try {
    const items: RecentProduct[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = items.filter((p) => p.id !== product.id);
    filtered.unshift(product);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {}
}

export function getRecentlyViewed(): RecentProduct[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useRecentlyViewed(excludeId?: number) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const all = getRecentlyViewed();
    setItems(excludeId ? all.filter((p) => p.id !== excludeId) : all);
  }, [excludeId]);

  return items;
}
