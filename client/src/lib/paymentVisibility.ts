// Single source of truth for WHICH payment surfaces are allowed to render at
// checkout. The checkout page imports these pure helpers so the rendering
// decision can be unit-tested without booting React. The most important
// invariant they encode: on an online-payment-only store (e.g. the cargo
// store, StoreConfig.commerce.onlinePaymentOnly === true) the ONLY payment
// surface is the online card option — every in-person ("Kapıda") surface and
// the door-POS installment block must be hidden.

import { PAYMENT_OPTIONS, type PaymentOption } from "./data";

export interface PaymentVisibilityState {
  /** StoreConfig.commerce.onlinePaymentOnly — cargo / online-only store. */
  onlinePaymentOnly: boolean;
  /** Tosla or iyzico configured & enabled. */
  onlineCardEnabled: boolean;
  /** payment_nakit_enabled (Kapıda Nakit). */
  nakitEnabled: boolean;
  /** payment_eft_enabled (Banka Havalesi / EFT). */
  eftEnabled: boolean;
  /** payment_qr_enabled (Kapıda QR). */
  qrEnabled: boolean;
  /** Cart is a charity ("Askıda Mama") donation delivery. */
  donationDelivery: boolean;
  /** Cart contains at least one pre-order product. */
  hasPreorder: boolean;
  /** Per-product hidden payment-method ids merged across the cart. */
  hiddenPaymentMethods: Iterable<string>;
}

// Mirror of the RadioGroup filter in checkout.tsx. Keep them in lockstep.
export function visiblePaymentOptions(s: PaymentVisibilityState): PaymentOption[] {
  const hiddenByProduct = new Set<string>();
  for (const m of s.hiddenPaymentMethods) hiddenByProduct.add(String(m));
  return PAYMENT_OPTIONS.filter((opt) => {
    if (hiddenByProduct.has(opt.id)) return false;
    if (s.onlinePaymentOnly) return opt.id === "online" && s.onlineCardEnabled;
    if (opt.id === "pos") return false;
    if (s.donationDelivery && opt.id !== "eft" && opt.id !== "online") return false;
    if (opt.id === "nakit") return s.nakitEnabled;
    if (opt.id === "eft") return s.eftEnabled;
    if (opt.id === "qr") return s.qrEnabled;
    if (s.hasPreorder) {
      if (opt.id === "online") return s.onlineCardEnabled;
      if (opt.id === "eft") return s.eftEnabled;
      return false;
    }
    if (opt.id === "online") return s.onlineCardEnabled;
    return true;
  });
}

export interface DoorPosState {
  /** StoreConfig.commerce.onlinePaymentOnly — cargo / online-only store. */
  onlinePaymentOnly: boolean;
  /** Cart contains campaign-bundle items. */
  hasCampaignItems: boolean;
  /** Cart contains pre-order items. */
  hasPreorderItems: boolean;
  /** payment_pos_enabled (door card POS). */
  posEnabled: boolean;
}

// Mirror of the "Kapıda Kredi Kartı ile Ödeme Yap" POS installment block gate
// in checkout.tsx. Must stay false on online-payment-only stores.
export function showDoorPosInstallments(s: DoorPosState): boolean {
  return !s.onlinePaymentOnly && !s.hasCampaignItems && !s.hasPreorderItems && s.posEnabled;
}

// Combined input for the single checkout payment-visibility memo. Carries every
// signal that gates any payment surface so the decision is made in ONE place.
export interface PaymentSurfaceState {
  onlinePaymentOnly: boolean;
  onlineCardEnabled: boolean;
  nakitEnabled: boolean;
  eftEnabled: boolean;
  qrEnabled: boolean;
  posEnabled: boolean;
  donationDelivery: boolean;
  hasCampaignItems: boolean;
  hasPreorderItems: boolean;
  hiddenPaymentMethods: Iterable<string>;
}

// Result of the single source of truth. Every payment surface in checkout
// (the RadioGroup, the door-POS installment block, the EFT/cash/QR info panels)
// reads from this object instead of re-deriving its own visibility condition.
export interface PaymentSurfaceVisibility {
  /** Ordered radio options to render in the method picker. */
  options: PaymentOption[];
  /** Visible radio option ids, for cheap membership checks by info panels. */
  visibleIds: Set<string>;
  /** Whether the door-POS installment block may render. */
  showDoorPos: boolean;
  /** Whether the Banka Havalesi/EFT info panel may render (when selected). */
  showEftInfo: boolean;
  /** Whether the Kapıda Nakit info hint may render (when selected). */
  showNakitInfo: boolean;
}

// THE single source of truth for which payment surfaces show at checkout.
// Combines the RadioGroup filter and the door-POS gate, and derives panel
// visibility from the same computed option set so nothing duplicates conditions.
export function computePaymentVisibility(s: PaymentSurfaceState): PaymentSurfaceVisibility {
  const options = visiblePaymentOptions({
    onlinePaymentOnly: s.onlinePaymentOnly,
    onlineCardEnabled: s.onlineCardEnabled,
    nakitEnabled: s.nakitEnabled,
    eftEnabled: s.eftEnabled,
    qrEnabled: s.qrEnabled,
    donationDelivery: s.donationDelivery,
    hasPreorder: s.hasPreorderItems,
    hiddenPaymentMethods: s.hiddenPaymentMethods,
  });
  const visibleIds = new Set(options.map((o) => o.id));
  const showDoorPos = showDoorPosInstallments({
    onlinePaymentOnly: s.onlinePaymentOnly,
    hasCampaignItems: s.hasCampaignItems,
    hasPreorderItems: s.hasPreorderItems,
    posEnabled: s.posEnabled,
  });
  return {
    options,
    visibleIds,
    showDoorPos,
    showEftInfo: visibleIds.has("eft"),
    showNakitInfo: visibleIds.has("nakit"),
  };
}
