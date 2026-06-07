---
name: Publish migration churn from DESC / undeclared indexes
description: Why "Generated migrations to apply to production database" keeps re-proposing the same DROP/CREATE INDEX on every publish, and how to stop it.
---

The Replit "Generated migrations to apply to production database" prompt re-proposes
the SAME `DROP INDEX ...; CREATE INDEX ... USING btree (col);` on every republish and
never converges when an index is created with descending order, e.g.
`CREATE INDEX ... ON t(created_at DESC)`.

**Why:** the migration diff cannot round-trip a `DESC` btree index — it introspects it
but always re-emits a plain ascending `CREATE`, so the diff is never empty. Indexes
created imperatively at startup in `server/routes.ts` (`CREATE INDEX IF NOT EXISTS ...`)
that are NOT also declared in the Drizzle schema make it worse, because the schema isn't
the source of truth for them.

**How to apply:** for any `_created` style index, create it as plain ascending (no
`DESC`) and ALSO declare it in `shared/schema.ts` via the table's third-arg
`(t) => ({ idx: index("name").on(t.col) })`, matching the existing `site_visits` /
`stock_movements` pattern. A plain btree still serves `ORDER BY col DESC` via reverse
scan, so dropping `DESC` costs nothing. To converge an existing DB, drop & recreate the
index ascending once (dev via SQL; prod by applying the pending publish migration a
single time) — after both sides are ascending the prompt stops.
