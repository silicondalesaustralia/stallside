# Vendl.app — Current Build Brief

**Snapshot date:** 1 September 2026  
**Product:** Vendl · domain [vendl.app](https://vendl.app)  
**Repo:** [silicondalesaustralia/vendl](https://github.com/silicondalesaustralia/vendl) (local folder may still be named `MyFarmStand`)  
**Branch:** `main` @ `b2f6832`  
**Tagline / SEO:** *Scan. Pay. Fresh.* · “Make more money from your stall. No website needed.”

This brief describes **what the codebase ships today**. Prefer the code over older handoffs (`AGENT-HANDOFF.md`, parts of `SUBSCRIPTIONS-AND-PAYMENTS.md`) when they conflict.

---

## 1. What it is

QR self-checkout + inventory SaaS for **unmanned / honesty stalls** (farm stands, bakers, firewood, flowers, ice, car-park honesty boxes, etc.).

| Audience | Surface | Job |
|----------|---------|-----|
| **Shopper** | Phone browser via printed QR → `/s/{slug}` | Browse, cart, pay cash / local bank / card / Tap & Go (and PayPal when env-on) |
| **Owner** | Web dashboard + Capacitor iOS/Android shell | Stands, products, stock, orders, QR print, Stripe, alerts, pre-orders, subscriptions |
| **Platform admin** | Desktop `/admin` only | Owners, stands, orders, billing, gallery, invites |

**Not in scope:** customer App Store directory, hardware card readers, NFC terminals.

---

## 2. Stack

| Layer | Choice |
|-------|--------|
| App | **Next.js 16.2** App Router, React 19, TypeScript |
| UI | Tailwind CSS v4, tokens in `src/app/globals.css` |
| Auth | **Auth.js** (next-auth v5 beta) + Prisma adapter, magic link (+ OTP code path) |
| DB | **PostgreSQL** + **Prisma 7** (`@prisma/adapter-pg`); client → `src/generated/prisma` |
| Hosting | **Vercel** (`vercel.json`); build runs TinyMCE copy + `prisma generate` (+ migrate on Vercel) |
| Blob | **Vercel Blob** (gallery / uploads) |
| Email | **Resend** (magic links, sale/low-stock, lifecycle); console fallback locally |
| Payments | **Stripe** Connect Express + Checkout + Billing; **PayPal** multiparty (env-gated) |
| Push | Web Push (VAPID), APNs (iOS Capacitor), optional FCM |
| Owner apps | **Capacitor 8** iOS/Android; `appId` `com.myfarmstand.owner`; loads hosted web |
| Editor | TinyMCE (self-hosted copy via `scripts/copy-tinymce.js`) |
| Validation | Zod 4 |

Path alias: `@/*` → `src/*`. This Next.js release may differ from training data — see `AGENTS.md` / `node_modules/next/dist/docs/`.

---

## 3. Business model (shipped)

**Two tiers. Dashboard never locks. No app Pro trial.**

| Plan | Price (per site / month) | Economics |
|------|--------------------------|-----------|
| **Free** | $0 | Every product feature. **2.5% Vendl fee** on card / Tap & Go / pay-later (`STALLSIDE_FEE_BPS = 250`). Cash + local bank free. Owner can absorb or pass fee to customer. |
| **Vendl Pro** | AUD **$19.99** · USD **$14.99** · GBP **£11.99** · EUR **€14.99** | Same features; **no Vendl fee**. Stripe Billing Checkout. |

Sources of truth: `src/lib/constants.ts`, `src/lib/saas-pricing.ts`, `src/lib/plan-copy.ts`, `src/lib/stallside-fee.ts`, `RELEASE-STARTER-PRO.md`.

### Fee waiver

`shouldChargeVendlFee` is **false** for: paid Pro (`pro` / legacy `card` / `*_paypal`), lifetime access, platform admin / complimentary emails.

### Access helpers

- `ownerHasProAccess` — paid Pro / lifetime / complimentary (fee-waiver semantics; marketing treats Free as full-feature).
- New owners: `createOwnerWithTrial` → `subscriptionPlan: "free"`, no trial end date.
- Lifetime / complimentary: invites (`/invite/[token]`), admin grants, `COMPLIMENTARY_ACCESS_EMAILS`.

### Not sold anymore

Legacy **Cash $6.99** SKU — Price IDs kept resolvable until migrated. Annual / multi-site billing: deferred.

### SaaS billing flow

Settings → Billing → Stripe Checkout (`mode: subscription`, Pro price for billing currency) → Customer Portal for cancel/manage. Webhooks in `src/app/api/stripe/webhook` + `src/lib/stripe-billing.ts`. Cron: `/api/cron/lifecycle` (Pro lapse Day 23 / 45); `/api/cron/trial-reminders` aliases it.

---

## 4. Stand checkout payments

Per-stand toggles + owner Connect readiness (`src/lib/stand-payment-brands.ts`).

| Method | How it works |
|--------|----------------|
| **Cash** | Honesty box — customer confirms → `CUSTOMER_CONFIRMED`, stock down |
| **Local transfer** | PayID (AUD) and region methods (PayTo, Pay by Bank, Cash App, etc.) — alias shown; customer confirms; **not verified by Vendl** |
| **Card / Tap & Go** | Stripe Checkout on **Connect Express** account; Apple Pay / Google Pay via Checkout wallets |
| **PayPal (+ Venmo USD)** | Multiparty / Partner Referrals; **off until `PAYPAL_CONNECT_ENABLED=1`** |

Currency is **per stand** (`AUD`, `USD`, `GBP`, `EUR`, `CAD`, `NZD`). Stand timezone (IANA, default `Australia/Adelaide`) drives pre-order wall-clock times.

**Cart modes:** `PRODUCT` (catalogue) or `CUSTOMER_CHOICE` (open dollar amount).

**Public stock:** exact counts off by default → Available / Low stock / Sold out; optional scarcity “Only N left”; optional exact stock.

---

## 5. Product features (built)

### Core stall ops

- Stands CRUD, slug URLs, QR poster print/download/copy (editable sign fields, poster blocks)
- Products, inventory adjust + adjustment log, low-stock threshold + 6h alert cooldown
- Orders list; sale + low-stock email/push
- Owner settings: alerts, Stripe Connect, billing, fee absorb/pass-on
- Mobile bottom nav (`DashboardNav`) for phone / Capacitor

### Conversion / basket (see `docs/CONVERSION-FEATURES.md`)

- Cart upsell (stand-level “suggest this”)
- Volume / bundle tiers (XOR with option groups)
- First-order discount + email capture
- Product options / variants (up to 3 groups × 12 choices)
- Cart / pre-order upsell add-ons; first-order discount stacking rules as coded

### Pre-orders & collections

- Pre-order pages (`/pre-orders/[slug]`, stand `/s/.../pre`, dashboard `pre-order-pages`)
- Order-by deadline + collection day; payment timing: pay now / upfront / deposit-then-balance
- Collections: Ready → Collected; buyer messaging; balance dunning cron
- Handover: collect or deliver

### Shopper subscriptions

- Owner offers: weekly / fortnightly / monthly boxes
- Stripe Connect Billing; fulfill + fee helpers
- Public `/s/[standSlug]/sub`

### Branding & discovery

- Stand logo, accent/secondary colours, social links (public stall + QR)
- Public gallery (`/gallery`) + admin moderation; owner submit
- Card-demand counter (`CardInterest` — “I’d have paid by card”)
- Channel interest logging
- Vertical config (`verticalSlug`: bakers, farm-stalls, firewood, …)

### Notifications

- Sale, low/out of stock, restock opt-in (buyer), owner→customer emails
- Lifecycle / Stripe nudge / Pro lapse / creator day-3 emails
- Push: `PushDevice` + `/api/push/*`; Capacitor + web push

### Auth & account

- Magic link + `/login/code` OTP path
- Onboarding; soft-delete owners; impersonation (admin); ad attribution on signup
- Knowledge base under `/dashboard/knowledge`

### Marketing / SEO content

- Landing `/`, LPs (`/lp/missed-sales`, `/lp/pre-orders/...`)
- Cottage food / sell-from-home / jurisdiction guides (`content/jurisdictions`, AU + US hubs)
- Farms-stand news, testimonials, about, contact, waitlist, demo stalls
- Legal: privacy, terms; unsubscribe routes

### Admin

- `/admin` · owners · stands · orders · billing · gallery · invites

---

## 6. Route map (high level)

| Area | Routes |
|------|--------|
| Marketing | `/`, `/about`, `/contact`, `/gallery`, `/testimonials`, `/waitlist`, `/demo`, `/lp/*` |
| Legal / SEO | `/privacy`, `/terms`, `/cottage-food-laws/*`, `/sell-food-from-home/*`, `/farms-stand-news/*` |
| Auth | `/login`, `/login/check-email`, `/login/code`, `/signup`, `/signup-complete`, `/onboarding`, `/invite/[token]` |
| Public stall | `/s/[standSlug]`, product, `/cart`, `/pay`, `/pre`, `/sub` |
| Checkout return | `/checkout/success`, `/checkout/cancelled`, `/checkout/balance/[orderId]` |
| Pre-order public | `/pre-orders/[slug]` |
| Owner | `/dashboard/*` (gated ops + billing settings + knowledge) |
| Admin | `/admin/*` |
| PayPal return | `/paypal/connect-return` |
| APIs | `/api/auth/*`, `/api/stripe/webhook`, `/api/paypal/webhook`, `/api/push/*`, `/api/restock/*`, `/api/cron/*` |

---

## 7. Data model (highlights)

Prisma schema ~880 lines. Core entities:

- **User / Owner / Stand / Product** (+ option groups/choices, SKU/UPC/cost, freshness)
- **Order / OrderItem** — methods `CASH | LOCAL_TRANSFER | CARD | PAYPAL`; statuses include deposit/balance states
- **PreOrderPage**, **SubscriptionOffer**, **ShopperSubscription**
- **InventoryAdjustment**, **LowStockAlert**, **RestockSubscriber**
- **PushDevice**, **Notification**, **GalleryStand**
- **CardInterest**, **ChannelInterest**, **LifetimeInvite**, **WaitlistEntry**, **SignupIntent**

Fee tracking: application fee / platform fee cents on card paths; Free plan uses stallside fee helpers in `src/lib/money.ts`.

---

## 8. Key source files

```text
src/lib/constants.ts              # name, fees, currencies, admin allowlists
src/lib/auth.ts / login-otp.ts    # Auth.js + OTP
src/lib/checkout.ts               # cart load, stock, fulfill orchestration
src/lib/fulfill-paid-order.ts     # card fulfillment idempotency
src/lib/stallside-fee.ts          # Free 2.5% fee logic
src/lib/owner-trial.ts            # Free signup + Pro access helpers
src/lib/stand-payment-brands.ts   # what checkout may offer
src/lib/stripe.ts / stripe-*.ts   # Billing + Connect
src/lib/paypal*.ts                # Connect, orders, webhook, SDK URL
src/lib/notify*.ts                # email + push orchestration
src/lib/pre-order.ts / deposit-*  # pre-orders + balance
prisma/schema.prisma
capacitor.config.ts
```

Brand tokens: field green / leaf / marigold sparingly; fonts via `layout.tsx` (display + DM Sans family). Assets under `public/brand/`.

---

## 9. Environment (see `.env.example`)

**Required for prod:** `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH_SECRET` / `AUTH_URL`, `RESEND_API_KEY` + `EMAIL_FROM`, Stripe secret + webhook secrets, Pro Price IDs (`STRIPE_PRICE_ID_PRO_{AUD,USD,GBP,EUR}`).

**Optional / feature:** VAPID, APNs, FCM, Blob token, cron secret, demo stand slugs, PayPal partner credentials + `PAYPAL_CONNECT_ENABLED=1`.

Pilot sequence: `PILOT-GO-LIVE.md`. Deploy notes: `README.md`.

---

## 10. Owner mobile shell

```bash
CAPACITOR_SERVER_URL=https://vendl.app npx cap sync ios
npm run cap:ios
```

Local Simulator: `CAPACITOR_SERVER_URL=http://127.0.0.1:3000`. Admin stays desktop web — not in the shell.

---

## 11. Current WIP / uncommitted (as of this snapshot)

Working tree includes substantial **PayPal marketplace** work (connect, orders, checkout UI, webhook, stand toggles, success resolution) plus docs updates (`SUBSCRIPTIONS-AND-PAYMENTS.md`, `AGENT-HANDOFF.md`, `UI-HANDOFF.md`). PayPal remains **env-gated** until Partner Referrals + `PAYPAL_CONNECT_ENABLED=1`.

Also present: debug/test scripts under `scripts/`, large test image `vendl-large-test-9mb.jpg` (do not commit casually).

---

## 12. Doc map (what to trust)

| Doc | Role |
|-----|------|
| **This file** | Current build snapshot |
| `RELEASE-STARTER-PRO.md` | Shipped Free / Pro headline |
| `SUBSCRIPTIONS-AND-PAYMENTS.md` | Deep payments/billing; mixed **[CURRENT]** / **[CHANGE]** — verify against code |
| `docs/CONVERSION-FEATURES.md` | Upsells, tiers, first-order discount spec |
| `PILOT-GO-LIVE.md` | Own-stall go-live checklist |
| `AGENT-HANDOFF.md` / `UI-HANDOFF.md` | **Stale in places** (old $9.99 / Cash-Card framing) |
| `README.md` | Quick local + deploy |

---

## 13. Known gaps / watch items

1. Some billing docs still describe **Pro-gated Card** or Starter/Pro feature splits that marketing/code treat as **Free = all features + fee**. Trust `standOffersCard` + `shouldChargeVendlFee`.
2. Map listing (public geo map) — specified in subscriptions doc; not a full product surface yet.
3. PayPal production: Partner approval, live keys, webhook, then flip env flag.
4. Legacy Cash subscribers / plan enum string cleanup (`cash`/`card` → `free`/`pro`).
5. npm package name still `myfarmstand`; Capacitor bundle id unchanged by design.
6. Push on real devices needs VAPID and/or APNs configured; Simulator push is weak.
7. Agent rules: no new packages without asking; build must stay green; don’t change cash trust copy without sign-off.

---

## 14. Success criteria (product stays true)

- QR → cash / local bank / Tap & Go (and PayPal when enabled) on a phone at the roadside.
- Owner manages stands, stock, QR, orders, pre-orders, and alerts from phone or Capacitor.
- Free accounts get the full product with 2.5% card fee; Pro removes that fee.
- Admin remains desktop-only.
- Brand stays Vendl (field green; not generic purple SaaS).
- `npm run build` green; Capacitor still opens hosted owner web at `/login`.

---

*Generated as a complete brief of the Vendl.app build as of 1 Sep 2026. Prefer the repository over this file if they diverge after further commits.*
