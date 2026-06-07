---
name: Branding UI smoke quirks (testing skill)
description: Why automated browser branding smokes give false negatives on this app, and where to assert branding instead.
---

# Branding UI smoke quirks

When verifying per-store branding with the testing skill (Playwright) via the
`?__store=<id>` override (client/src/lib/store.ts), two things bite:

1. **Hidden `#seo-static` crawler block + document `<title>` are NOT brandified
   on the dev/preview host.** index.html ships a visually-hidden (1px/clip)
   `<div id="seo-static">` and a `<title>` that the server brandifies *per request
   host* (server/seo-meta.ts). On the dev preview the host resolves to the default
   (jetgo) store, so both still say "JETGO Pet Shop Samsun". The testing agent's
   accessibility snapshot picks up that hidden text and the title, reporting a
   false "still shows JETGO" failure. **Only assert branding from VISIBLE on-screen
   content** (the header wordmark = `CURRENT_STORE.shortName` via Logo.tsx), never
   the title or hidden SEO block.

2. **Checkout registration is SMS-OTP-gated, but a guarded test bypass exists.**
   The register flow is phone -> OTP -> name + Mahalle, unreachable by automation
   without a real SMS. server/routes.ts (`isTestOtpBypass`) opens it ONLY when
   `NODE_ENV !== "production"` AND env `TEST_OTP_BYPASS=1` (set in development):
   `/api/otp/send` skips SMS and stores the fixed code `0000` that verify accepts.
   The bypass MUST stay double-guarded — never let one condition alone enable it.
   The full registration+checkout path through this bypass is covered by a
   committed integration test in store-scoping.test.ts, so prefer extending that
   over a fresh ephemeral browser smoke. Note for any browser smoke: the checkout
   route is `/odeme` (not `/checkout`) and the auth modal auto-opens only with a
   non-empty cart.

**Where to assert instead:** the data layer that drives the UI, in the validation
suite server/__tests__/store-scoping.test.ts (run by the `test` workflow):
- `getStoreByHost(host)` -> brand name/shortName (wordmark).
- `commerce.fulfillment === "local"` is what gates `!isCargo` in checkout.tsx
  (Mahalle flow + "Getirmesi" label + door payment); "cargo" gives il/ilçe +
  "Kargo Ücreti" + online-only. Assert local vs the samsun cargo contrast.
- `injectAllMeta(indexHtml, "/", host)` -> served homepage `<title>`/og:site_name
  carry the brand + local same-day copy ("Aynı Gün"), not cargo copy ("Türkiye
  geneli"). This is the only place the served HTML branding is unit-testable
  (the test app boots registerRoutes only, not the vite/static index.html route).

**Why:** keeps branding regressions caught automatically in CI despite the
preview-host and OTP limitations of the browser smoke.
