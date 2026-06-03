---
name: Visitor tracking geo + timezone
description: Durable constraints for the admin visitor-tracking feature (IP geo provider, day-bucketing).
---

- **ip-api.com is HTTP-only on the free tier** (HTTPS requires a paid key). The visitor geo lookup intentionally calls `http://ip-api.com`. Do not "fix" this to https without a paid key — it will just fail. Free tier ~45 req/min, so results are cached per-IP in `ip_geo_cache`.
  **Why:** architect flagged the http transport; it is a known provider limitation, not a bug.

- **Client IP must come from `req.ip`, never raw `x-forwarded-for`.** `trust proxy` is set in `server/index.ts`, so `req.ip` is the resolved, non-spoofable client IP. Parsing the raw XFF header is spoofable and pollutes stats/geo cache.

- **Daily filtering uses a sargable UTC range, not a function on the column.** Convert the Istanbul-local day to UTC instants: `created_at >= ($1::date::timestamp AT TIME ZONE 'Europe/Istanbul') AND created_at < (($1::date + 1)::timestamp AT TIME ZONE 'Europe/Istanbul')`. Wrapping `created_at` in `AT TIME ZONE ...::date = ...` disables `idx_site_visits_created`.
