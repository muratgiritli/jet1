---
name: Scope-test orphan self-heal
description: Why store-scoping.test.ts can fail with doubled per-scope rows after a killed run, and the before() pre-clean that fixes it.
---

`server/__tests__/store-scoping.test.ts` seeds one per-scope row per store (banners,
delivery_neighborhoods, campaign_items, coupons, customers, the MARK product, etc.),
each tagged with a FIXED constant marker `MARK = "__SCOPE_TEST__"`. The scope tests
count only their own rows via `onlyTest(rows)` = `.includes(MARK)`. Cleanup in
`after()` deletes ONLY by tracked id.

**Failure mode:** a run KILLED before `after()` runs (e.g. by the 2-min/115s test
runner cap, or a crash) leaves MARK-tagged rows behind. Because MARK is constant, the
next run's `onlyTest()` counts BOTH the fresh and the orphaned rows, so the
`assert.deepEqual(stores, ["all","jetgo"])` scope assertions see duplicates
(`["all","all","jetgo","jetgo"]`) and fail. The failures look flaky/order-dependent
but are really cross-RUN DB pollution, not anything in the code under test.

**Why:** `after()`-only cleanup can't recover from a process that never reaches it.
The harness already self-heals orphan customers/coupons in `before()` for exactly
this reason; the per-scope CONTENT tables were the gap.

**How to apply:** `before()` must pre-clean orphans for EVERY per-scope table it
seeds, BEFORE seeding. Match by literal substring (`strpos(col, MARK) > 0`),
mirroring `onlyTest`'s `.includes(MARK)` — NOT SQL `LIKE` (MARK contains `_`, a LIKE
wildcard). Delete in FK-safe order (campaign_items referencing the MARK product
before the product). When you add a NEW per-scope seeded table, extend this
pre-clean too. To unblock immediately after a killed run, the same DELETEs can be
run once by hand against the dev DB.
