---
name: Dev and production databases are separate and diverged
description: JETGO's deployed (production) Postgres is a different DB from development, with its own live data
---

# Dev DB and Prod DB are SEPARATE and have diverged

This project's deployed app uses a **different** PostgreSQL database than the
workspace/development one. They are NOT in sync:
- Development has its own catalog (used as a playground / import target).
- Production holds the REAL live store data, including real customer orders, and
  has its own independently-created products (higher max product id than dev).

**Why this matters:** importing/seeding data via scripts in the workspace only
touches the DEVELOPMENT database. Publishing (deploy) ships CODE and migrates
SCHEMA, but does NOT copy table DATA to production. So new catalog rows added in
dev will NOT appear on the live site.

**How to apply:**
- To read live data, use the database skill with `environment: "production"`
  (read-only SELECT).
- To WRITE data to production you cannot use the workspace (no prod DB creds).
  The only write path is through the deployed app itself — e.g. an
  admin-protected endpoint that runs the insert/import, deployed and then
  triggered against the live domain. Make such imports idempotent (re-read
  existing rows from DB each run and skip) so retries are safe.
- Always confirm with the user before writing to production (it holds real orders).
