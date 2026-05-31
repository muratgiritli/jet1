---
name: Concurrent scraper import pools
description: Why background scraping imports stalled and the watchdog pattern that fixed it
---

# Concurrent scraper/import pools must have a per-item watchdog

When importing by scraping an external site with a concurrency pool (N workers
pulling from a queue), `AbortSignal.timeout(...)` on individual `fetch` calls was
NOT enough to prevent hard stalls — the run repeatedly froze at varying points
(intermittent network hangs that the abort didn't reliably break).

**Fix that worked:** wrap each item's full unit of work in a `Promise.race`
watchdog that resolves a fallback after a hard cap (e.g. `withTimeout(p, ms, fallback)`),
so no single item can wedge a worker. Also reduce pool size (5 → 3) and add the
key to the "already processed" set only is fine because the import is idempotent
(dedupe key = brandCategoryId + product name; reruns skip existing rows).

**Why:** a stalled fetch with no enforced upper bound holds a pool slot forever;
once all slots are held the whole import silently hangs with no error.

**How to apply:** any future background importer/scraper in this repo — guard each
task with a Promise.race watchdog, not just fetch-level abort signals. Run via
`nohup npx tsx scripts/<x>.ts > /tmp/<x>.log 2>&1 &` and poll DB count + log tail.
