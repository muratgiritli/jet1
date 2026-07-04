import { useQuery } from "@tanstack/react-query";
import { CARD_SURCHARGE } from "@/lib/data";
import { CURRENT_STORE } from "@/lib/store";

// Admin-configurable non-cash payment surcharge (POS / Havale-EFT / QR / Online
// card). Stored per-store in app_settings as `card_surcharge_percent` (a plain
// percent, e.g. "5"). Falls back to the CARD_SURCHARGE default (5%) when unset.
// Backed by the shared /api/public-settings query so every caller dedupes to a
// single request.
export function useSurchargeRate(): number {
  const { data } = useQuery<Record<string, string>>({ queryKey: ["/api/public-settings"] });
  return parseSurchargeRate(data?.card_surcharge_percent);
}

// Per-product non-cash surcharge overrides. jetgomarket-only feature: a stored
// JSON map { "<productId>": <percent> } (app_settings `product_surcharge_overrides`,
// jetgo-prefixed). Returns a rate map { productId: rate } (e.g. { 12: 0.08 }).
// Hard-gated to store id "jetgo" so the other 8 domains always get {} and keep
// the single store-wide rate byte-identical.
export function parseSurchargeOverrides(raw: string | undefined | null): Record<number, number> {
  if (CURRENT_STORE.id !== "jetgo" || !raw) return {};
  try {
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return {};
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(obj)) {
      const id = Number(k);
      const pct = Number(v);
      if (Number.isFinite(id) && Number.isFinite(pct) && pct >= 0 && pct <= 100) out[id] = pct / 100;
    }
    return out;
  } catch {
    return {};
  }
}

export function useSurchargeOverrides(): Record<number, number> {
  const { data } = useQuery<Record<string, string>>({ queryKey: ["/api/public-settings"] });
  return parseSurchargeOverrides(data?.product_surcharge_overrides);
}

// Effective non-cash rate for a single product: its override if present, else the
// store-wide base rate. When the overrides map is empty (all non-jetgo stores),
// this always returns baseRate, so callers reduce to the single-rate behavior.
export function effectiveSurchargeRate(
  productId: number | string | undefined | null,
  baseRate: number,
  overrides: Record<number, number>,
): number {
  const id = Number(productId);
  if (Number.isFinite(id) && overrides[id] !== undefined) return overrides[id];
  return baseRate;
}

// Parse a stored percent string ("5") into a rate (0.05). Invalid/empty falls
// back to the default. Negative values are ignored.
export function parseSurchargeRate(percent: string | undefined | null): number {
  const p = Number(percent);
  return Number.isFinite(p) && p >= 0 ? p / 100 : CARD_SURCHARGE;
}

// Human label for a surcharge rate, e.g. 0.05 -> "+%5", 0.075 -> "+%7,5".
export function surchargeLabel(rate: number): string {
  const pct = Math.round(rate * 1000) / 10;
  const txt = Number.isInteger(pct) ? String(pct) : pct.toFixed(1).replace(".", ",");
  return `+%${txt}`;
}
