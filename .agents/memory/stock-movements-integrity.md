---
name: Stock movements integrity
description: How website sales/stock changes must be logged so the admin "Aylık Stok Hareket Raporu" stays accurate.
---

# Stock movements integrity

Every stock change must write a paired `stock_movements` row, because the admin
monthly stock-movement report ("Aylık Stok Hareket Raporu") is built entirely
from that table — not from order rows. Historically only admin quick-updates
wrote movements, so real website sales were invisible in the report.

Rules:
- A website sale records a `mode='sub'` movement carrying `order_id` so the
  report can show the order number and drill into order detail. A failed
  payment / cancellation that restores stock records a matching `mode='add'`
  reversal movement (also with `order_id`).
- `new_stock` on a movement must come from the DB's atomic `UPDATE ... RETURNING`
  value, never from a pre-loaded product snapshot — concurrent orders or repeated
  same-product lines otherwise log a stale figure.
- Persist the *actual* deducted amount per order item (`deductedQty`) at sale
  time. Preorder items deduct only the available stock (partial) and backorder
  the rest, so restore paths must give back `deductedQty`, not the ordered
  quantity, and must NOT skip preorder items.

**Why:** report accuracy and stock correctness both depend on movements
mirroring reality; partial preorder deductions and concurrency were the two
silent ways the numbers drifted.

**How to apply:** any new code path that changes `products.stock` (new payment
method, bulk tools, returns, etc.) must go through the same decrement/restore
helpers that also write the paired movement — adding a stock mutation without a
movement will silently corrupt the report.
