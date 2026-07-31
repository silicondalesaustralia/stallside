# Stallside - Subscriptions & Payments (agent handoff)

> **Status: TARGET STATE.** This document describes the Starter/Pro model we are moving to.
> Sections marked **[CURRENT]** describe live behaviour that is unchanged. Sections marked
> **[CHANGE]** describe behaviour that differs from the shipped code and must be implemented.
> Sections marked **[OPEN]** are undecided - do not implement without a decision.
>
> Supersedes the previous Cash/Card version of this doc.

Two separate Stripe concerns share one platform account.

| Layer | Who pays whom | Mechanism |
|-------|----------------|-----------|
| **SaaS subscription** | Stand owner → Stallside | Stripe Billing (Checkout + Customer Portal + webhooks) |
| **Stand checkout** | Shopper → stand owner | Stripe Connect Express (Card / Tap & Go), or honesty-box Cash / AUD PayID |

Platform take on stand sales: **`PLATFORM_FEE_BPS = 0`** (`src/lib/constants.ts`). SaaS fee is the monthly plan only. **[CURRENT]**

---

## 1. Plans & pricing **[CHANGE]**

Two tiers. **Starter is free forever for every account, with no trial and no card.** Pro is the only paid SKU.

| Plan | AUD | USD | GBP | EUR |
|------|-----|-----|-----|-----|
| **Starter** | Free | Free | Free | Free |
| **Pro** | $19.99 | $14.99 | £11.99 | €14.99 |

Per site / month. List prices remain **fixed per currency** (not live FX).
Source: `src/lib/saas-pricing.ts`. Marketing copy: `src/lib/plan-copy.ts`.

Naming: the free tier is **Stallside** / "Starter" in the billing UI; the paid tier is **Stallside Pro**.
Never describe Starter as a trial, a free plan "to get going", or anything implying it expires.
Preferred descriptor in copy: **free forever**.

### Starter (free forever)

- Cash at the stand (customer self-confirms)
- **PayID** bank transfer (Australia / AUD only) - customer confirms; Stallside does not verify
- Unlimited products, **product options / variants**, real stock counts
- Printable QR poster
- Sale alerts + low-stock alerts (email / push)
- Orders + inventory dashboard
- **Public map listing** (see §7)
- **Card-demand counter** (see §6)

### Pro (Starter + extras)

- **Tap & Go** - card, Apple Pay, Google Pay via Stripe Connect (money to owner's Stripe)
- **Pre-orders** - pay to reserve, order-by deadline, collection day
- **Collections** - Ready → Collected; per-order email + **Email all** for a collection day
- Buyer name / email / phone on pre-order + confirmation email
- Message customers from Collections / Orders
- Optional exact pre-order slots on the public stall
- Stand branding (logo, colours) + social links
- Restock notify emails (buyer opt-in; owner never sees addresses)
- Full analytics history
- Enhanced map card (photos, social links, live "stocked today" state)
- No terminal / no % of sales (copy)

### Moved from paid to free **[CHANGE]**

**Product options / variants** move to Starter. They were marketed as Card-tier but were never
gated in server actions (§10 of the old doc), so this ratifies live behaviour rather than
giving anything away. Quantity-break pricing, if built, also belongs on Starter.

### Coming soon **[CURRENT]**

- **PayPal** at the gate - gated by `PAYPAL_CONNECT_ENABLED=1`; default UI says coming soon
- Pix / UPI local transfer methods exist in code but are disabled

### Pro free trial **[CHANGE]**

- **30 days** (`TRIAL_DAYS` in `src/lib/constants.ts`), **one per account, ever**
- **No card required** - app-managed trial, **not** a Stripe `trial_period_days`
- Full Pro features during trial
- **At trial end the account drops to Starter. The dashboard never locks.**
- Data retained in full (see §5)
- Trial reminder cron: `src/app/api/cron/trial-reminders/route.ts` - sequence rewritten (§4)

**Trial trigger: auto-start at signup.** DECIDED. No `proTrialStartedAt` field needed - trial
runs from account creation, as today. Only the trial *end* behaviour changes (drop to Starter,
no lock).

Consequence to design around: a stand in its first 30 days has no regulars to notify and no
repeat buyers, so restock notify and pre-orders are trialled at the moment they are least
useful. The trial therefore cannot be the main conversion mechanism - **the card-demand counter
(§6) is the ongoing upgrade driver**, and it runs indefinitely on Starter. Onboarding during the
trial should lean on Tap & Go and branding, which do work from day one.

### Lifetime / complimentary **[CURRENT]**

- **Not a Stripe SKU** - invite redeem or admin / complimentary
- `Owner.lifetimeAccess` → treated as **Pro** + full app access
- Also complimentary: `Role.ADMIN`, `COMPLIMENTARY_ACCESS_EMAILS`
- Invites: `src/lib/lifetime-invite.ts`, `/invite/[token]`, admin invites

### Coupons **[CURRENT]**

- Stripe promotion codes allowed on Pro Checkout (`allow_promotion_codes: true`)
- Admin can create / apply coupons (`src/app/admin/billing/`, owner admin actions)

### Billing period: monthly only

DECIDED. **No annual plan for now.** Do not create annual Stripe Price IDs, and do not build a
monthly/annual toggle in the billing UI. Keep the billing surface to a single monthly Pro SKU per
currency.

Deferred, not rejected - revisit once there is a retention baseline on the new model:

- **Annual Pro** (~$199/yr AUD, "two months free") - cashflow and retention lever.
- **Multi-site pricing** - Pro remains **per site, per month**. With the $6.99 rung gone, an owner
  with a gate stand, a firewood pile and a market pitch now pays $60/mo where they paid $21.
  Watch for this profile in support and churn; they are the customers most likely to pay and most
  likely to balk. Any fix needs per-owner site counting in billing, which does not exist today.
- **30-day money-back guarantee** on Pro.

---

## 2. Access gating **[CHANGE]**

Core helpers: `src/lib/owner-trial.ts`

| Helper | Old meaning | New meaning |
|--------|-------------|-------------|
| `ownerHasAppAccess` | May use dashboard | **Retire.** Always true for a live account. |
| `ownerNeedsPayment` | Trial/sub lapsed → redirect | **Retire.** Nothing forces billing any more. |
| `ownerHasCardTierAccess` | Card-tier features | **Rename → `ownerHasProAccess`.** Same semantics. |

**Gating moves from app-level to feature-level.** There is no dashboard lock and no billing
redirect. Every owner reaches every screen; Pro-only surfaces render in a locked/preview state
with an upgrade affordance.

**`ownerHasProAccess`** is true if any of: lifetime / complimentary, active Pro trial,
`subscriptionStatus` ∈ `{ACTIVE, PAST_DUE}`, or still inside `currentPeriodEndsAt` after
cancel-at-period-end.

**Remove:** the redirect in `src/app/dashboard/(gated)/layout.tsx`. The `(gated)` route group
either collapses into the normal dashboard or is repurposed as a Pro-preview wrapper.

### Feature → Pro tier (code)

| Feature | Pro-gated? | Note |
|---------|------------|------|
| Stripe Connect / accept Card | Yes | |
| PayPal Connect (when env on) | Yes | |
| Pre-orders - **create new** | Yes | + Stripe charges enabled |
| Pre-orders - **fulfil existing paid** | **No** | See §5 |
| Collections - **new collection days** | Yes | |
| Collections - **existing paid orders** | **No** | See §5 |
| Branding / social | Yes | Reverts to default on lapse, config retained |
| Restock notify - **send** | Yes | |
| Restock notify - **collect opt-ins** | **No** | Collects on Starter; see §5 |
| Owner→customer email actions | Yes | Currently not re-checked - must be added |
| Product options / variants | **No** | Moved to Starter |
| Map listing | **No** | Enhanced card is Pro |
| Card-demand counter | **No** | Starter-only surface, arguably |

---

## 3. Stripe - SaaS subscriptions (owner → Stallside)

### Flow **[CHANGE]**

1. Owner opens **Settings → Billing** (`src/app/dashboard/(billing)/settings/billing/`)
   - reached by choice, never by redirect
2. App ensures Stripe Customer (`stripeCustomerId`)
3. **Stripe Checkout** `mode: "subscription"` with the **Pro** Price ID for billing currency
   - there is no longer a plan choice at this step
4. Metadata: `ownerId`, `purpose: saas_subscription`, `saasPlan: "pro"`, `billingCurrency`
5. Webhooks sync owner: `src/app/api/stripe/webhook/route.ts` + `src/lib/stripe-billing.ts`
   - `checkout.session.completed` (subscription, livemode)
   - `customer.subscription.updated` / `deleted` → **downgrade to Starter, do not lock**
   - `invoice.paid` → lifetime paid cents
6. Manage / cancel → **Stripe Customer Portal** (`openBillingPortal`)
7. Cancel at period end → Pro until `currentPeriodEndsAt`, then Starter
8. Delete account → cancel subscription immediately (`wipe-owner-account.ts`)

Pro Checkout bills immediately (no Stripe trial on the subscription). The free trial remains
app-side only.

### Env (SaaS) **[CHANGE]**

```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_PRO_AUD|USD|GBP|EUR      # renamed from STRIPE_PRICE_ID_CARD_*
# deprecated, keep resolvable for legacy Cash subscribers during migration:
STRIPE_PRICE_ID_CASH_AUD|USD|GBP|EUR
STRIPE_PRICE_ID_CASH                      # legacy ≈ AUD cash
```

Helpers: `src/lib/stripe.ts`.

### Migration of existing Cash subscribers **[CHANGE]**

Existing $6.99 Cash subscribers are now paying for what Starter gives away. Plan:

1. Identify all owners with `subscriptionPlan: "cash"` and an active Stripe subscription.
2. Email before the change ships, framed as thanks for being early.
3. Offer either: N months of Pro at no charge, or cancel the Cash subscription and move them to
   Starter with no loss of function.
4. Do **not** silently cancel their Stripe subscription - that produces a confusing portal state.
5. Keep the Cash Price IDs resolvable until every legacy subscription is closed out.

### Schema **[CHANGE]**

`Owner.subscriptionPlan` enum: `cash` → `starter`, `card` → `pro`. `card_paypal` → `pro_paypal`
or fold into `pro` with a separate PayPal flag. Write a backfill migration; do not rely on
string comparison against old values anywhere in the codebase after it lands.

---

## 4. Trial-end and lapse behaviour **[CHANGE]**

There is no lock, so the owner may not notice a state change. Three touches, not one:

| When | Message |
|------|---------|
| Trial day 23 | What you'll keep, what pauses - with the owner's own numbers |
| Trial day 30 | "You're on Starter now. Nothing's lost." Explicit, not silent. |
| Trial day 45 | What Pro would have done over the last two weeks (card-demand, restock subscribers waiting) |

The same sequence applies to a lapsed or cancelled Pro subscription.

**A silent downgrade reads as a broken product.** An owner who doesn't know the trial ended will
assume Tap & Go is failing. Day 30 is the most important message in the sequence.

---

## 5. Downgrade semantics - freeze, never delete **[CHANGE]**

This section is the contract. Nothing here is optional.

| Asset | On downgrade to Starter |
|-------|-------------------------|
| Restock subscribers | **Retained and counted.** Dashboard shows "40 regulars waiting to hear when you restock - upgrade to notify them." Send is gated; the list is not deleted. |
| Pre-order history | Visible, read-only. Cannot create new pre-order products. |
| **Paid, unfulfilled pre-orders** | **Fully actionable.** Collections stays usable for these orders - Ready / Collected / message buyer. A customer who paid is owed their goods; never paywall a fulfilment obligation. |
| Branding (logo, colours) | Config retained in DB. Public stall reverts to default styling. Restored instantly on re-upgrade. |
| Social links | Same as branding. |
| Analytics history | Retained. Pro-only depth (comparisons, breakdowns) gated; core totals visible. |
| Products, variants, stock | Untouched - Starter features. |
| QR poster | **Never removed.** It is a physical artefact on a fence post. |
| Map listing | **Never removed.** Enhanced card fields revert. |
| Orders history | Untouched. |

### Restock opt-ins on Starter

DECIDED. **Starter stands keep collecting restock opt-ins.** Sending is Pro-gated; collecting is
not. The list grows on a free stand and becomes the upgrade prompt.

This creates a promise to a shopper the owner currently cannot keep, so the customer-facing copy
must be handled carefully:

- **Never state or imply a timeframe.** Not "we'll email you when it's back" with any schedule
  attached - just an opt-in to hear about it.
- Send the shopper a plain confirmation that they're on the list for that stand.
- Give every opt-in email a working unsubscribe, including from Starter stands.
- **[OPEN] Stale-list handling.** If a stand sits on Starter for a long stretch, subscribers are
  waiting on a message that never comes. Options: age out opt-ins after N months, or send a
  single "this stand hasn't restocked in a while - still interested?" from Stallside. Decide
  before the list can plausibly get old; not a launch blocker.

Owner-side: surface the count prominently - *"40 regulars are waiting to hear when you restock.
Upgrade to notify them."* This is the second-strongest upgrade signal after card demand, and
unlike card demand it accrues from the trial period onward.

---

## 6. Card-demand counter **[CHANGE - new feature]**

The mechanism that makes Starter earn its place. Ship it in the same release as the free tier,
not after.

- On a Starter stand's checkout, when the shopper has no cash, offer a low-friction
  **"I'd have paid by card"** tap.
- Log an intent record: stand, timestamp, cart subtotal. No PII.
- Surface in the owner dashboard as lost revenue in their own numbers:
  *"23 people wanted to pay by card this month - about $180."*
- Use it as the trigger for the Pro trial prompt (if trial option (b) is chosen) and for the
  day-45 message.

New model, roughly `CardInterest { id, standId, subtotalCents, currency, createdAt }`.
Rate-limit per session so it can't be tapped repeatedly. Do not create a PENDING order.

---

## 7. Map listing **[CHANGE - new feature, separate workstream]**

Free on both tiers. Full spec belongs in its own doc; the billing-relevant facts:

- Listing is **opt-in**, never automatic - many stands are at the end of a residential driveway.
- Owner can drag the pin off the house to the roadside, and choose suburb-level approximation.
- Auto-hide a stand after a defined period with no sales; show a last-active signal.
  A map of dead stands is worse than no map.
- One-tap "stocked today" from the owner's phone - **[OPEN]** whether this is Starter or Pro.
- Public, crawlable per-region pages (SEO is the point, not just in-app utility).
- Pro adds a richer card: photos, social links, live stock state.

---

## 8. Stripe Connect - customer payments (shopper → owner)

### Onboarding **[CURRENT, with rename]**

1. Owner needs **Pro** (trial or subscription)
2. **Settings → Stripe (Card / Tap & Go)** creates Express Connect account (`card_payments` +
   `transfers`) and Account Link onboarding
3. Status synced from Stripe: `charges_enabled`, onboarding complete, payouts
   (`src/lib/stripe-sync.ts` + Connect webhook `account.updated`)
4. Per-stand toggle: enable **Card / Tap & Go** (`StandPaymentToggles` / `stand-payment-actions.ts`)
5. Checkout only offers card brands when: stand `acceptCard` + Pro + `stripeAccountId` &&
   `stripeChargesEnabled` (`src/lib/stand-payment-brands.ts`)

### Public stall degradation on lapse **[CHANGE - must fix]**

Today the public stand page can still load with a lapsed owner and card checkout simply fails.
That is now a routine state rather than an edge case, and it happens on a roadside with a printed
QR the owner cannot recall.

Required behaviour when a stand's owner is on Starter:

- Card / Tap & Go is **hidden**, not shown-then-failing. No dead buttons, no Stripe error page.
- Cash and PayID (AUD) are presented normally.
- **Edge case that will bite:** a Pro stand with `acceptCard` as its *only* enabled method
  violates the "at least one payment method" rule the moment it lapses. On downgrade, force-enable
  `acceptCash` for any stand left with no available method, and notify the owner.
- Existing paid pre-orders continue to render their collection details for the buyer.

### Checkout **[CURRENT]**

- Creates PENDING order, then Stripe Checkout Session `mode: "payment"`,
  `payment_method_types: ["card"]`, **on the connected account**
- Apple Pay / Google Pay appear via Stripe Checkout wallet config, not a separate integration
- Money lands in the **owner's Connect account**
- Fulfillment: webhook → `fulfillPaidCardOrder` (stock + notifications)

### Pre-orders & card **[CURRENT]**

- Creating pre-order products requires Pro **and** Stripe charges enabled (`parsePreOrderFromForm`)
- Pre-order carts are **card-only** (cash / PayID / PayPal hidden or rejected)
- Cannot mix take-now + pre-order in one cart; cannot mix different collection days

### Env (Connect / demo) **[CURRENT]**

```
STRIPE_SECRET_KEY                    # platform + Connect
STRIPE_WEBHOOK_SECRET_CONNECT
STRIPE_WEBHOOK_SECRET_TEST
STRIPE_WEBHOOK_SECRET_TEST_CONNECT
STRIPE_SECRET_KEY_TEST
DEMO_STRIPE_ACCOUNT_ID
DEMO_STAND_SLUG_AU / DEMO_STAND_SLUG_US
```

---

## 9. Non-Stripe stand payments **[CURRENT]**

### Cash

- Stand toggle `acceptCash`
- Customer taps that they paid cash → `CUSTOMER_CONFIRMED`, stock decrements
- Honesty-box model; no payment rail verification (`src/app/s/[standSlug]/actions.ts`)

### PayID (AUD)

- Local transfer method; owner stores PayID alias
- Customer copies alias, pays in banking app, confirms in Stallside
- **Not verified** by the app (`src/lib/local-transfer.ts`)
- **Stays on Starter.** Costs nothing, is the AU differentiator, and means a free Australian
  stand can still capture the no-cash customer.

### PayPal

- Default: **coming soon** unless `PAYPAL_CONNECT_ENABLED=1`
- Env-gated (`src/lib/paypal.ts`, `settings/paypal/`, `paypal-checkout-actions.ts`)

Stand must keep **at least one** payment method enabled when updating toggles - see the downgrade
edge case in §8.

---

## 10. Mental model for agents

```
┌─────────────────────────────────────────────────────────────┐
│  Stallside platform Stripe account                          │
│                                                             │
│  A) Billing: Owner pays monthly Pro subscription            │
│     Checkout + Portal + webhooks → Owner.* subscription*    │
│     (Starter has no Stripe SKU at all)                      │
│                                                             │
│  B) Connect: Owner Express account                          │
│     Shopper Checkout Session on connected account           │
│     → funds to owner; PLATFORM_FEE_BPS = 0                  │
└─────────────────────────────────────────────────────────────┘

Signup ──► STARTER (free forever, no card, no expiry)
              │
              ├─ 30-day Pro trial, once per account ──► subscribe ──► PRO
              │                                    └── don't ──┐
              └────────────── back to STARTER ◄────────────────┘
                              (freeze, never delete - §5)
```

Do **not** confuse:

- `STRIPE_PRICE_ID_*` → **owner SaaS** prices only
- Connect `stripeAccountId` / `stripeChargesEnabled` → **customer** card checkout
- App trial vs Stripe subscription trial (we use app trial only)
- Starter (a real permanent plan, no Stripe object) vs a lapsed subscription (a Stripe object in
  a terminal state) - both resolve to the same feature set

---

## 11. Key file map

| Area | Path | Change |
|------|------|--------|
| Plan copy / features | `src/lib/plan-copy.ts` | Rename tiers, rewrite feature lists |
| List prices | `src/lib/saas-pricing.ts` | Drop Cash prices, rename Card → Pro |
| Trial + access gates | `src/lib/owner-trial.ts` | Retire two helpers, rename third |
| Constants | `src/lib/constants.ts` | `TRIAL_DAYS` unchanged |
| Stripe client + price IDs | `src/lib/stripe.ts` | Rename env keys, keep legacy resolvable |
| SaaS sub sync | `src/lib/stripe-billing.ts` | Downgrade instead of lock |
| Webhook route | `src/app/api/stripe/webhook/route.ts` | Downgrade path on `subscription.deleted` |
| Billing UI | `src/app/dashboard/(billing)/settings/billing/` | Single paid SKU; remove `?locked=1` |
| Gated lock | `src/app/dashboard/(gated)/layout.tsx` | **Remove redirect** |
| Stripe Connect settings | `src/app/dashboard/(gated)/settings/stripe/` | Pro gate |
| Connect sync | `src/lib/stripe-sync.ts` | - |
| Card checkout | `src/app/s/[standSlug]/digital-checkout-actions.ts` | - |
| Cash / PayID confirm | `src/app/s/[standSlug]/actions.ts` | Add card-demand tap |
| Payment brand rules | `src/lib/stand-payment-brands.ts` | Hide card cleanly on Starter |
| Stand payment toggles | `stand-payment-actions.ts` | Force-enable cash on downgrade |
| Pre-order parse | `src/lib/pre-order.ts` | Pro gate on create only |
| Collections | `src/app/dashboard/(gated)/collections/` | Allow fulfilment of existing paid orders on Starter |
| Owner→customer emails | (email actions) | **Add missing Pro check** |
| Fulfill paid card | `src/lib/fulfill-paid-order.ts` | - |
| Trial reminders cron | `src/app/api/cron/trial-reminders/route.ts` | Rewrite to §4 sequence |
| Lifetime invites | `src/lib/lifetime-invite.ts` | Maps to Pro |
| Owner KB | `src/lib/knowledge-base/orders-alerts-billing.ts` | Rewrite billing answers |
| Marketing site | homepage, `/#pricing`, FAQ | Rewrite - see §12 |
| Env template | `.env.example` | New Pro keys |
| Schema | `prisma/schema.prisma` | Plan enum migration + `CardInterest` |

---

## 12. Marketing surfaces to update

The public site currently describes a two-paid-tier world throughout.

- Homepage hero and the "Free trial & Card plan" badges on pre-orders, restock, and branding
  sections → "Pro"
- Pricing block: two cards (Starter free forever / Pro), currency toggle keeps four currencies
- **Re-check USD / GBP / EUR Pro prices** - they were set relative to a $6.99 AUD anchor that no
  longer exists
- FAQ: "What's the difference between Cash and Card / PayPal?" → rewrite entirely
- FAQ: "How much does it cost?" → free forever + one paid tier + trial mechanics
- Feature columns (`FeatureColumns`) → move product options to the free column
- Add: what happens when the trial ends (a plain, reassuring answer)
- Add map listing to the feature list once §7 ships

---

## 13. Known gaps / caveats

- `AGENT-HANDOFF.md` may still say SaaS billing isn't collected - **ignore that**; Checkout +
  webhooks + portal are live.
- Owner→customer email actions do not re-check tier. This was tolerable when the dashboard locked;
  with no lock it is a real hole. Must be fixed in the same release.
- Collection "Email all" can be used any time a paid pre-order day appears, including before the
  collection date.
- Product options were marketed as Card but never gated - resolved by moving them to Starter.

---

## 14. Suggested build order

1. **Schema migration** - plan enum rename, backfill.
2. **Gating rework** - retire `ownerNeedsPayment`, remove the dashboard lock, rename to
   `ownerHasProAccess`, add the missing email-action check.
3. **Downgrade semantics (§5)** + public stall degradation (§8), including the
   no-payment-method-left edge case.
4. **Card-demand counter (§6)** - ships with the free tier, not after.
5. **Pricing / copy** (§1, §12) and legacy Cash subscriber migration (§3).
6. **Trial-end sequence** (§4).
7. **Map listing** (§7) - separate workstream, regional launch.

Deferred: annual billing, multi-site pricing, money-back guarantee (§1). Monthly-only, per-site,
single Pro SKU at launch.

---

## Ops checklist - legacy Cash subscribers

Do this in Stripe Dashboard before/while deploying (app will not silently cancel):

1. List active subscriptions on Cash Price IDs.
2. Email those owners: Starter is now free forever; they can cancel Cash or take a Pro credit offer.
3. Cancel Cash subs in Portal/Dashboard only after they confirm (or apply N months Pro coupon).
4. Keep Cash Price IDs in env until every legacy sub is closed.
5. Rename Stripe Product display name to **Stallside Pro** (Price IDs can stay).
6. Optionally set `STRIPE_PRICE_ID_PRO_*` to the same values as `STRIPE_PRICE_ID_CARD_*`.
