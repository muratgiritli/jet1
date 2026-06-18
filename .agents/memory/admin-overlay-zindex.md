---
name: Admin sticky nav z-index vs overlays
description: Why dropdowns/popovers in the admin can render hidden behind the nav, and how to fix.
---

# Admin sticky nav z-index vs overlays

The admin page has two stacked sticky bars with extreme z-index: the top header
(`z-[9999]`) and the section nav grid (`z-[9998]`). There is also a fixed
new-order alert at `z-[10000]`.

shadcn `SelectContent` (and other Radix overlays) default to `z-50`. When a long
Select flips upward (trigger near the bottom of the viewport), its top portion
renders **behind** the sticky nav and the top items become unreachable — the user
sees only a scroll-up chevron. Symptom report: "üst kısım gözükmüyor".

**Rule:** any admin overlay that can overlap the sticky nav (Select/Dropdown/
Popover content) must be raised above it — add `className="z-[10001]"` to the
content. The nav height varies by breakpoint (grid-cols-4 mobile → many rows), so
collisionPadding is unreliable; raising z-index is the robust fix.

**Why:** the nav's 9998/9999 z-index far exceeds the shadcn default, so the
default stacking assumption (overlays above nav) is broken in this app.

**How to apply:** fix locally per-Select when reported; if it recurs broadly,
promote to the shared `client/src/components/ui/select.tsx` default. tailwind-merge
makes the passed `z-[10001]` override the base `z-50`.
