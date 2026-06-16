---
name: Admin list staleness vs global staleTime Infinity
description: Why freshness-critical admin lists (order desk) silently go stale, and how to keep them current.
---

The global react-query client sets `staleTime: Infinity`, `refetchOnWindowFocus: false`, `refetchInterval: false`. So any admin list fetched once NEVER refreshes on its own.

The admin order desk relied solely on the 10s notification poll (`/api/admin/new-order-check`) to `invalidateQueries(['/api/admin/orders'])` — but that poll is gated behind the `notificationEnabled` toggle. With notifications off (or detection missing), the list silently went stale while the page stayed open, so newly-incoming orders never appeared.

**Rule:** freshness-critical admin lists must override the global defaults per-query with their own `refetchInterval` + `refetchOnWindowFocus: true` + `refetchOnReconnect: true` + `staleTime: 0`. Do NOT change the global queryClient defaults (Infinity is intentional for the rest of the app).

**Why:** decouples list freshness from the notification sound/alert toggle and from mutation-only invalidation; the order desk must always reflect current orders.

**How to apply:** the `/api/admin/orders` payload is cheap (order items carry product.img as a short `/product-images/*.webp` path, NOT base64), so a 15s poll for a single admin is fine. If admin concurrency ever grows, switch to an always-on lightweight delta detector that invalidates the heavy list only on change, instead of blind interval polling.
