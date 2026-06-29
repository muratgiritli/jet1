---
name: Visitor tracking is a global (non-store-scoped) surface
description: site_visits and its admin report/export are intentionally global, exempt from the strict per-store scoping rule.
---

The `site_visits` table has NO `store` column. Tracking insert (`POST /api/track/visit`),
the admin report (`GET /api/admin/visitors`), and the IP export
(`GET /api/admin/visitors/export`) are all global across the 9 domains by design.

**Why:** Visitor analytics/IP lists are operational data the operator wants in one
place, not branded per-domain customer-facing content. So the otherwise-strict
"jetgo-only changes must keep the other 8 stores behavior-identical" rule does not
force store-scoping here — there is nothing per-store to scope.

**How to apply:** When adding to visitor tracking, do NOT add a `store`/`<store>:`
prefix or per-domain branding. Keep it global. The admin report endpoint takes a
date range via `from`/`to` (Istanbul-local, `to` inclusive) with `?date=` as a
single-day backward-compat fallback; the export emits ONLY IP addresses
(`type=real|bot`, `format=xlsx|txt`).
