---
name: Sitemap/robots GSC fetchability + canonical-301 exemption
description: Why crawler files must skip the apex→www 301 and reference the fetched host, while page <loc> stay canonical.
---

Google Search Console reports a sitemap as "Getirilemedi / couldn't fetch" when the
sitemap URL answers with a 3xx redirect. On a multi-domain app with an apex→www
canonical 301, that 301 silently breaks every SUB-sitemap fetch on the apex host
(the index itself may pass while children fail).

**Rules:**
- EXEMPT crawler files from the canonical 301: `/robots.txt` and
  `/^\/sitemap[\w-]*\.xml$/` must serve 200 on EVERY host (apex + www).
- The DISCOVERABLE file chain must be same-host / no-redirect: the sitemap INDEX's
  sub-sitemap `<loc>` refs and robots.txt `Sitemap:` line use the FETCHED request
  origin (x-forwarded-proto + first-token x-forwarded-host), NOT the canonical
  domain — else the child fetch redirects and GSC fails it again.
- PAGE `<loc>` URLs inside the sub-sitemaps stay CANONICAL (store.domain = www) so
  indexing consolidates on one host. Hybrid = request-host file chain + canonical
  page URLs.

**Host parsing must be consistent across helpers (cost an architect finding):** the
request-origin helper and the store resolver must derive the host the SAME way. A
proxy can emit a comma-joined `X-Forwarded-Host` ("real.com, proxy"); take the
FIRST token in BOTH paths — centralize it in `normalizeHost` (used by
`getStoreByHost`/reqStore) so it matches reqOrigin. Otherwise store resolution
falls back to the DEFAULT store while the file chain uses the right host → page
`<loc>` point at the wrong store's domain.
**Why:** the canonical 301 + per-request store resolution already read
x-forwarded-host; the sitemap surfaces just have to opt OUT of the redirect and
opt IN to the fetched host.
**Operational:** prefer a GSC *Domain* property (an apex URL-prefix property can't
see www-canonical content); submit `https://www.<domain>/sitemap.xml`.
