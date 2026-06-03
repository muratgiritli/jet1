---
name: Visitor tracking geo + bot classification
description: How the admin visitor analytics derives real client IP, geolocates it, and separates real visitors from datacenter/crawler bots.
---

# Visitor tracking: geo + bot classification

## Client IP behind Replit/GCP
- The deployed app sits behind multiple GCP proxy hops. `trust proxy=1` + `req.ip`
  yields a *datacenter* hop, so geo resolved to Google datacenters
  (Mountain View / Council Bluffs / Brussels; IPs all `34.*`/`35.*`).
- **Fix:** take the **leftmost public IP** from `X-Forwarded-For` (skip private/CGNAT
  ranges via an isPrivateIp check). That is the real client.
- **Why:** GCP *appends* its hops on the right; the original client is leftmost.
- Tradeoff: raw XFF is spoofable, so analytics can be poisoned by a crafted header.
  Accepted for an internal analytics feature; not a security boundary.

## Geo + datacenter detection
- ip-api.com free tier is **http-only** (don't force https) and rate-limited.
- Request `isp,org,as,hosting,proxy` fields; cache them in `ip_geo_cache`
  (cols `isp`, `is_hosting`).
- A visit is a bot if `UA_BOT_RE.test(ua) || geo.hosting`, where hosting =
  `d.hosting || d.proxy || CLOUD_ORG_RE.test(org)`.

## Real-vs-bot separation (don't drop bots)
- `site_visits` has `is_bot` + `isp`. track/visit records *everything*; it no longer
  discards bot-UA traffic.
- admin/visitors returns real stats (`is_bot=false`) AND a separate `bots` block
  (`{total,uniques,byName,recent}`) grouped by ISP. Frontend renders a distinct
  "Bot / Otomatik Trafik" panel.

## Bot UA regex must stay narrow
- **Do NOT** include broad tokens like `telegram`, `fetch`, `monitor`, `preview` in
  `UA_BOT_RE`: real users in Telegram/Facebook in-app browsers contain those strings
  and would be wrongly excluded from real stats. Keep only genuine crawler
  signatures (bot/crawl/spider/googlebot/facebookexternalhit/headless/curl/etc.) and
  lean on the `hosting` signal for the rest.

## Misc
- Legacy GCP rows are backfilled `is_bot=true WHERE ip LIKE '34.%' OR '35.%'` at
  startup (idempotent; those ranges are pure cloud, no TR residential traffic).
- Daily filter must be a sargable UTC `created_at` range.
- queryClient default fetcher joins queryKey with "/", so use a single-element key
  like [`/api/admin/visitors?date=${date}`].
