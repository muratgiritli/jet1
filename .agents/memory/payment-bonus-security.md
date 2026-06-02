---
name: Payment & welcome-bonus security findings
description: Known security/abuse weaknesses in the checkout, Tosla payment callbacks, coupons, loyalty points, and the 100 TL welcome bonus.
---

# Checkout / payment / bonus security weaknesses

Findings from a full audit. The coupon-ownership hole is fixed; the rest are
documented here because they touch the live payment gateway / money logic and
need user sign-off before changing.

## Fixed
- **Coupon ownership**: `POST /api/orders` now requires `!coupon.customerId || coupon.customerId === session.customerId`. Without this, any logged-in customer could redeem another customer's customer-tied coupon (the HG welcome bonus). The route is session-authenticated, so the check is against trusted identity.

## Open (need sign-off — high blast radius)
- **Tosla callback/webhook hash not enforced**: in `/api/tosla/callback` and the Tosla webhook, a hash mismatch only `console.warn`s and still proceeds to mark the order paid; an empty/missing hash skips verification entirely. This is a payment-confirmation auth bypass — forged callbacks can set `payment_status='completed'`.
  - **Why not auto-fixed**: flipping mismatch→reject on a live gateway is dangerous — if our hash formula (`tosla_api_pass+client_id+api_user+OrderId+MdStatus+BankResponseCode+BankResponseMessage+RequestStatus`, sha512 base64) is subtly wrong, ALL real payments would break. Verify against live Tosla before enforcing.
- **Coupon usedCount race**: `notMaxed` is pre-checked in the route but `incrementCouponUsage` is a plain non-conditional `used_count+1` after order creation → concurrent orders can exceed maxUses. Fix = single conditional `UPDATE ... WHERE used_count < max_uses RETURNING`.
- **Loyalty points race + unpaid accrual**: balance check (`getCustomerPointsBalance`) and deduction are separate calls (overspend under concurrency); points are awarded at order creation even for `pending` online payments and never reversed on payment failure/cancel. Move earning to the payment-success path + add compensating reversal; make spend atomic.
- **Welcome-bonus farming**: HG coupon is issued on every new-customer creation in `POST /api/otp/verify`. `DELETE /api/customer/account` hard-deletes the customer's coupons, so delete+re-register with the same phone yields a fresh 100 TL. Multiple phone numbers also bypass the one-time intent (only barrier is OTP SMS per phone). `POST /api/customer/register` does NOT grant the bonus — leave it that way: register has no SMS verification (only IP rate limit) so granting there would be trivially farmable.
