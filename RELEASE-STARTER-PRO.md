# Release notes - Starter / Pro

What shipped in this release (subscription model change + conversion mechanics).  
Source of truth for ongoing behaviour: [SUBSCRIPTIONS-AND-PAYMENTS.md](./SUBSCRIPTIONS-AND-PAYMENTS.md).

---

## Headline

**Cash / Card → Starter (free forever) / Stallside Pro (paid).**  
The dashboard never locks. Trial ends → Starter. Card-demand counter ships in the same release so free stands have a measured reason to upgrade.

---

## Plans

| Plan | Price | Notes |
|------|--------|--------|
| **Starter** | Free forever | No card, no expiry, no trial framing |
| **Stallside Pro** | AUD $19.99 / USD $14.99 / GBP £11.99 / EUR €14.99 per site / month | Stripe Billing Checkout only |

- **30-day Pro trial** still auto-starts at signup (no card). One per account.
- After trial: account stays on **Starter** - not locked.
- Lifetime / complimentary invites map to **Pro**.
- Cash plan is **no longer sold**. Legacy Cash Price IDs kept resolvable for migration only.
- Annual / multi-site pricing: **not** in this release.

### Starter includes

- Cash + PayID (AUD)
- Unlimited products **and product options / variants**
- Stock, QR posters, sale + low-stock alerts
- Orders / inventory dashboard
- **Card-demand counter**
- Restock **opt-in collection** (send is Pro)

### Pro adds

- Tap & Go (Stripe Connect - card / Apple Pay / Google Pay)
- Pre-orders + Collections (+ Email all)
- Stand branding + social on the public stall
- Restock **notify** (send)
- Messaging customers (with fulfilment exception below)

---

## Access & gating

- Removed dashboard payment lock (`(gated)` layout no longer redirects to billing).
- `ownerHasProAccess` replaces Card-tier checks.
- Feature-level gates instead of app-level lock.
- Public stall on Starter: **Card brands hidden** (no dead buttons).
- On Pro lapse: if a stand would have no payment method, **Cash is force-enabled** and the owner is emailed.

### Downgrade contract (freeze, never delete)

- Restock subscribers retained and counted; send gated.
- Paid, unfulfilled pre-orders stay actionable in Collections (Ready / Collected / message buyer).
- Branding config kept in DB; public stall reverts to defaults until re-upgrade.
- Products, stock, QR, orders history untouched.

---

## Card-demand counter (launch blocker - shipped)

Shopper on a stand without card checkout can tap **“I'd have paid by card”**.

- New `CardInterest` rows: stand, subtotal, currency, timestamp (no PII).
- Cookie rate-limit (~1/hour per stand).
- Owner dashboard: *“N people wanted to pay by card this month - about $X”* + Upgrade CTA.
- Also feeds day-45 trial email stats.

---

## Billing / Stripe

- Single paid SKU: **Pro** Checkout (`saasPlan: "pro"`).
- Env: `STRIPE_PRICE_ID_PRO_{AUD,USD,GBP,EUR}` (falls back to legacy `CARD_*` if unset).
- Webhook sync: cancel/lapse → `subscriptionPlan: "starter"` (no lock).
- Billing UI: Starter status + Upgrade to Pro; no Cash subscribe form; soft trial-ended messaging.

**Ops (manual):** rename Stripe Product to Stallside Pro; migrate legacy Cash subscribers via Portal/coupons (see checklist in subscriptions doc). Do not silently cancel.

---

## Trial emails

Cron sequence rewritten (Cash upgrade emails removed from the active path):

| When | Message |
|------|---------|
| Day 23 | What you keep vs what pauses |
| Day 30 | “You're on Starter now. Nothing's lost.” + status → Starter |
| Day 45 | Card-demand / restock counts + Pro CTA |

---

## Marketing / copy / KB

- Homepage pricing: Starter free forever + Pro.
- Feature columns, FAQs, terms, signup, landing section eyebrows.
- Knowledge base billing + customer-payments articles updated for Starter/Pro.

---

## Schema / migrations

Migration `20260731090000_starter_pro_plans`:

- Backfill `cash`→`starter`, `card`→`pro`, `card_paypal`→`pro_paypal`
- Default plan `starter`, default fee `0`
- `CardInterest` table
- `trialDay23SentAt`, `trialDay45SentAt`, `proLapseDay23SentAt`, `proLapseDay45SentAt`

**Deploy note:** run Prisma migrate on production so `CardInterest` exists before relying on the counter.

---

## Out of scope (this release)

- Public map listing
- Annual billing
- Multi-site discounted pricing
- Stale restock-list aging
- New analytics product depth

---

## Files to know

| Area | Path |
|------|------|
| Access helpers | `src/lib/owner-trial.ts` |
| Stripe prices / Checkout | `src/lib/stripe.ts`, `…/billing/actions.ts` |
| Sub sync / downgrade | `src/lib/stripe-billing.ts` |
| Card demand | `CardInterest` + `card-interest-actions.ts` + `CardInterestButton.tsx` |
| Dashboard signals | `src/components/StarterUpgradeSignals.tsx` |
| Plan copy / pricing UI | `src/lib/plan-copy.ts`, `PricingTiers.tsx` |
| Trial cron | `src/app/api/cron/trial-reminders/route.ts` |
| Full target behaviour | `SUBSCRIPTIONS-AND-PAYMENTS.md` |
