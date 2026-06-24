import { useQuery } from "@tanstack/react-query";
import { CARD_SURCHARGE } from "@/lib/data";

// Admin-configurable non-cash payment surcharge (POS / Havale-EFT / QR / Online
// card). Stored per-store in app_settings as `card_surcharge_percent` (a plain
// percent, e.g. "5"). Falls back to the CARD_SURCHARGE default (5%) when unset.
// Backed by the shared /api/public-settings query so every caller dedupes to a
// single request.
export function useSurchargeRate(): number {
  const { data } = useQuery<Record<string, string>>({ queryKey: ["/api/public-settings"] });
  return parseSurchargeRate(data?.card_surcharge_percent);
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
