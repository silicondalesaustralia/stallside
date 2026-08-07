# Release notes - Free / Pro

What shipped for the current subscription model.  
Source of truth: [SUBSCRIPTIONS-AND-PAYMENTS.md](./SUBSCRIPTIONS-AND-PAYMENTS.md).

---

## Headline

**Free ($0/mo, all features, Vendl card fee) / Vendl Pro (no Vendl fee).**  
The dashboard never locks. New owners start on Free from day one - there is no app Pro trial.

---

## Plans

| Plan | Price | Notes |
|------|--------|--------|
| **Free** | $0/mo | All features. Vendl fee 2.5% on card / Tap & Go / pay-later. Cash and PayID free. Absorb or pass on the fee. Stripe processing fees still apply. |
| **Vendl Pro** | AUD $19.99 / USD $14.99 / GBP £11.99 / EUR €14.99 per site / month | Same features; no Vendl fee. Stripe Billing Checkout. |

- No signup trial. Upgrade anytime from Settings → Billing.
- Lifetime / complimentary invites map to Pro **features**; complimentary does not waive the Vendl fee unless lifetime.
- Cash plan is **no longer sold**.
- Annual / multi-site pricing: **not** in this release.

---

## Access & gating

- Dashboard is never payment-locked.
- Vendl fee waived for lifetime and paid Pro only (`shouldChargeVendlFee`).
- On Pro lapse: if a stand would have no payment method, **Cash is force-enabled** and the owner is emailed.

---

## Billing / Stripe

- Single paid SKU: **Pro** Checkout.
- Env: `STRIPE_PRICE_ID_PRO_{AUD,USD,GBP,EUR}` (falls back to legacy `CARD_*` if unset).
- Webhook sync: cancel/lapse → Free plan (no lock).
- Cron `/api/cron/lifecycle` (daily 09:00 UTC): Pro lapse Day 23 + Day 45 only.
  Legacy `/api/cron/trial-reminders` aliases the same handler.

---

## Marketing / copy / KB

- Homepage: Free + Pro.
- Knowledge base billing article: Free and Vendl Pro (no trial).

---

## Files to know

| Area | Path |
|------|------|
| Access helpers | `src/lib/owner-trial.ts` |
| Fee waiver | `src/lib/stallside-fee.ts` |
| Stripe prices / Checkout | `src/lib/stripe.ts`, `…/billing/actions.ts` |
| Plan copy / pricing UI | `src/lib/plan-copy.ts`, `PricingTiers.tsx` |
| Cron | `src/app/api/cron/lifecycle/route.ts` |
| Full behaviour | `SUBSCRIPTIONS-AND-PAYMENTS.md` |
