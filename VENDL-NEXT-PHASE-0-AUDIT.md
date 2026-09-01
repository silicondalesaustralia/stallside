# Vendl Next — Phase 0 Audit

**Date:** 1 September 2026  
**Inputs:** Repository (source of truth), `VENDL-BUILD-BRIEF.md`,  
`VENDL-NEXT-AU-FOOD-FARM-COMMERCE-BUILD-BRIEF`  
**Rule:** Prefer code over older handoffs when they conflict.

This audit is the required gate before Phase 1 (dashboard shell + Getting Started)  
and Phase 2 (business-mode onboarding).

---

## Executive summary

Vendl already ships a production QR commerce stack: stands, products, inventory,  
multi-rail checkout, pre-orders, deposits/balances, collections, shopper  
subscriptions, Free/Pro fee logic, Capacitor owner shell, and marketing SEO  
surfaces.

It does **not** yet ship: business-mode onboarding presets, a first-class  
Customer CRM, product categories, GST/ABN business profile fields, a  
merchant website builder, fulfilment zones/windows as entities, recipes/costing,  
or growth tools (coupons/forms/reviews/loyalty/gift cards).

**Architecture constraint that will dominate Phase 3+:** `Product` is  
**stand-scoped** (`standId` required). The Next brief wants one catalogue  
sellable across storefront + stands + pre-order pages. That is an additive  
migration, not a rename — plan carefully; do not break existing `/s/{slug}`  
product URLs.

**Immediate reuse wins for Phase 1–2:**

- Extend `dashboard/layout.tsx` + `dash-nav-links.ts` (no AppShell yet)
- Formalise Getting Started from `dashboard-setup-alerts` +  
  `dashboard-onboarding-path` / `DashboardNextCard`
- Onboarding presets are net-new; OTP already creates `Owner` on signup
- Keep fee helpers untouched (`stallside-fee.ts`, `money.ts`, `constants.ts`)

---

## 1. Current dashboard route tree

Route groups `(gated)` and `(billing)` do **not** appear in URLs.  
`(gated)` no longer payment-locks the dashboard (Free is $0/mo).  
`(billing)` historically kept billing reachable; keep paths stable.

### Shell

| File | Role |
|------|------|
| `src/app/dashboard/layout.tsx` | `requireOwner`, business select, sidebar + mobile nav, push, Stripe banner, trial badge |
| `src/app/dashboard/(gated)/layout.tsx` | Pass-through only |
| `src/app/dashboard/loading.tsx` | Skeleton |
| `src/app/dashboard/select-business-action.ts` | Switch selected stand |

### URL map (owner)

| URL | Area |
|-----|------|
| `/dashboard` | Overview / next move / analytics |
| `/dashboard/products` · `/new` · `/[productId]` | Catalogue |
| `/dashboard/inventory` | **Redirect → products** |
| `/dashboard/orders` | Orders for selected business |
| `/dashboard/collections` | Ready → Collected (pre-orders / subs) |
| `/dashboard/pre-order-pages` · `/new` · `/[pageId]` · `/qr` | Pre-order sheets |
| `/dashboard/subscriptions` · `/new` · `/[offerId]` | Shopper subscription offers |
| `/dashboard/businesses` · `/new` · `/[standId]` · `/qr` | Stands (“My Businesses”) — **not in primary nav** |
| `/dashboard/notifications` | In-app inbox |
| `/dashboard/settings` | Account hub |
| `/dashboard/settings/stripe` | Connect + fee pass-on |
| `/dashboard/settings/paypal` | PayPal Connect (env-gated) |
| `/dashboard/settings/billing` | SaaS Free / Pro |
| `/dashboard/knowledge` · `/[slug]` | Owner guides |
| `/dashboard/gallery/submit` | Gallery photo submit |

**Legacy redirect:** `/dashboard/stands` → `/dashboard/businesses` (`next.config.ts`).

### Public commerce (do not break)

| URL | Purpose |
|-----|---------|
| `/s/[standSlug]` (+ product, cart, pay, pre, sub) | Printed QR storefront |
| `/checkout/success` · `/cancelled` · `/balance/[orderId]` | Payment returns |
| `/pre-orders/[slug]` | Public pre-order (also stand-scoped pre routes) |
| `/unsubscribe/restock` | Compliance |
| `/api/stripe/webhook` · `/api/paypal/webhook` · `/api/cron/*` | Money / ops |

**Host note:** `stallside.app` keeps `/s`, `/checkout`, `/api` on-host for printed  
QR permanence (`middleware.ts` / `next.config.ts` comments).

---

## 2. Current onboarding flow

### Happy path (most users)

```
/signup (name, email, ad attribution)
  → OTP /login/code?callbackUrl=/signup-complete
  → authorizeEmailOtp creates User + Owner (createOwnerWithTrial)
  → /signup-complete → “Go to dashboard”
```

Owner is created at OTP with:

- `businessName` ← signup name  
- `contactEmail` ← email  
- `subscriptionPlan: "free"`  
- optional `adAttribution`

**Implication:** `/onboarding` is a **fallback** for User-without-Owner (or  
soft-deleted owner treated as missing by `requireOwner`). Normal signup never  
asks business type, state, fulfilment, or first product.

### Fallback `/onboarding`

Fields: `businessName`, `contactEmail`, optional `contactPhone` → Owner update/create → `/dashboard`.

### Lifetime invites

`/invite/[token]` → OTP → `createOwnerWithLifetime` (Pro/lifetime semantics).

### In-product setup (already exists — extend, don’t throw away)

| System | Files | Behaviour |
|--------|-------|-----------|
| Nav badges | `dashboard-setup-alerts.ts`, `load-dashboard-setup-alerts.ts` | `needsBusiness`, `needsProducts`, `needsStripe` |
| Next move card | `dashboard-onboarding-path.ts`, `DashboardNextCard` | Paths `stall-first` \| `card-first`; progressive CTA |
| Stripe banner | `load-stripe-setup-banner.ts`, `StripeSetupBanner` | Never-started / restricted |
| Alert prefs UI | `AlertSettingsForm` + `updateAlertSettings` | **Orphaned** — not mounted on Settings |

---

## 3. Current navigation & UI foundation

### Nav definitions — `src/components/dash-nav-links.ts`

**Primary:** Overview, Products, Orders, Collections  
**Secondary:** Pre-order pages, Subscriptions, Notifications, Guides, Settings  
**Mobile tabs:** Home, Products, Orders, Collect, Alerts  

Businesses / QR / Stripe / Billing are reached via Overview, business select,  
Settings, or empty states — not primary nav.

### Components

| Piece | Path |
|-------|------|
| Nav data | `dash-nav-links.ts` |
| Server wrapper | `DashboardNavWithUnread.tsx` |
| Collapse | `DashboardNav.tsx` |
| Desktop sidebar | `DashboardSidebar.tsx` |
| Mobile | `DashboardMobileNav.tsx` |
| Business switcher | `DashboardBusinessSelect.tsx` |
| Icons | `DashNavIcon.tsx` |

**No `AppShell`.** Phase 1 should introduce a coherent shell API wrapping the  
existing layout pieces without ripping Capacitor/`NativeShellBootstrap`.

### Design tokens (`globals.css` + `layout.tsx`)

| Token | Approx | Use |
|-------|--------|-----|
| `--wash` | `#f2f6ef` | Page bg |
| `--panel` | `#fbfdf9` | Surfaces |
| `--field` | `#17361f` | Dark sidebar |
| `--leaf` / `--leaf-dark` | greens | Primary CTA |
| `--marigold` | `#f5a623` | Accent (sparing) |
| Fonts | Bricolage Grotesque, DM Sans, Spline Sans Mono | Display / body / mono |

Retain field-green identity; do not adopt competitor orange/black.

---

## 4. Prisma — what exists and what to reuse

### Core entities

- **User** — Auth.js owner/admin only  
- **Owner** — business account, Stripe/PayPal, SaaS plan, alerts, soft-delete  
- **Stand** — public slug storefront + payment toggles + branding + upsells  
- **Product** — **per-stand** catalogue (+ options, tiers, pre-order flags, cost/SKU)  
- **Order / OrderItem** — multi-rail payments; deposit/balance; customer PII fields  
- **PreOrderPage** (+ junction products)  
- **SubscriptionOffer / ShopperSubscription**  
- **RestockSubscriber**, **CardInterest**, **ChannelInterest**  
- **Notification**, **PushDevice**, **GalleryStand**, **InventoryAdjustment**, **LowStockAlert**

### Key enums (keep compatible)

`PaymentMethod`, `PaymentStatus` (incl. deposit states), `CollectionStatus`,  
`HandoverMode`, `PaymentTiming`, `CartMode`, shopper sub enums.

### Field reuse map (Next brief → today)

| Need | Status | Location |
|------|--------|----------|
| Branding (logo, colours, social) | Exists | `Stand.logoUrl`, `accentColor`, `secondaryColor`, social URLs |
| Stand QR / posters | Exists | `qrSignMessage`, poster toggles; TinyMCE = sign HTML only |
| Fulfilment collect/deliver | Exists on order/product/page | `HandoverMode`, delivery address fields on Order/ShopperSubscription |
| Pickup windows / delivery zones | **Missing** | No `FulfilmentLocation` / `DeliveryZone` |
| Deposit / balance | Exists | `PaymentTiming`, deposit fields, `deposit-order.ts`, `balance-dunning.ts` |
| Channels (stand vs online vs pre) | Partial | Stand slug storefront only; no website CMS; Product tied to one stand |
| Categories | **Missing** | — |
| GST / tax lines | **Missing** | Jurisdiction content only |
| ABN / AU business profile | **Missing on Owner** | PayID alias may look like ABN; Stripe may collect off-app |
| Customer CRM | **Missing** | PII on Order / ShopperSubscription / Restock / ChannelInterest |
| Business mode presets | **Missing** | Inferred `stall-first` / `card-first` only |
| Setup task framework | Partial | Alerts + next-move; no `SetupTaskState` table |
| Website builder | **Missing** | Public = `/s/{slug}`; TinyMCE ≠ site builder |
| Recipes / loyalty / coupons / forms / gift cards / reviews | **Missing** | — |

### Product model caveat (critical)

```text
Product.standId  → required FK
@@unique([standId, slug])
```

Public product URL: `/s/{standSlug}/{productSlug}`.

Next brief wants products attachable to main storefront + stands + pre-order  
pages + subscriptions **without duplicating Product rows**. Options:

1. **Owner-scoped Product** + `ProductChannel` / stand assignment (larger migration)  
2. Keep stand-scoped Product short-term; treat “online storefront” as primary  
   stand or virtual channel until Phase 3  
3. Soft multi-channel: `ownerId` already on Product — add optional  
   `ownerCatalogId` later

**Phase 0 recommendation:** Phase 1–2 do **not** remount Product. Phase 3  
audit should choose (1) vs (2) with a backfill plan. Do not invent a second  
product table casually.

---

## 5. Customer identity / email capture (today)

**No `Customer` model.**

| Path | Storage |
|------|---------|
| Checkout / pre-order | `Order.customerName`, `customerPhone`, `receiptEmail` |
| First-order discount | Stand flags + prior order by normalised `receiptEmail` at stand |
| Restock | `RestockSubscriber` (`standId` + email unique) |
| Channel interest | `ChannelInterest.email` |
| Shopper subs | `ShopperSubscription.customerEmail` (+ name/phone) |
| Card demand | `CardInterest` — **no PII** |

Phase 3+ should introduce `Customer` (owner-scoped) and backfill from emails  
with case-normalisation; never invent identities for anonymous cash buyers.

---

## 6. Fulfilment / pre-order architecture (today)

| Concern | Implementation |
|---------|----------------|
| Pre-order product flags | Product `isPreOrder`, times, timing, deposit %, handover |
| Multi-product sheets | `PreOrderPage` + public `/s/.../pre/[pageSlug]` |
| Collections UI | `/dashboard/collections` — ORDERED → READY → COLLECTED |
| Deposit + balance | `deposit-order.ts`, liability soft-cap, buyer re-auth page |
| Dunning cron | `/api/cron/balance-dunning` — retries 0/2/5 days, max 3 |
| Mix rules | Take-now vs pre-order carts cannot mix (`checkout.ts` / `pre-order.ts`) |
| Subscriptions | Connect Billing → cycle Orders; appear on Collections |

**Gap vs Next brief:** no reusable PickupLocation / time windows / postcode  
delivery zones as first-class settings. Handover is per product/page/order,  
not a Fulfilment settings area.

---

## 7. Storefront / branding architecture (today)

- Merchant “site” = **stand slug storefront** (`/s/[standSlug]`), branded via  
  `public-stand-branding.ts` / `StandStoreHeader`.
- Marketing LPs (`/stall`, `/pre-orders`, cottage-food jurisdictions) are  
  **Vendl SEO**, not merchant CMS.
- TinyMCE: `SignHtmlEditor` for QR poster HTML only.
- No draft/publish website, no custom pages, no theme entity, no custom domains.

Phase 4 storefront should be **new models** related to Owner (or a primary  
Stand), while **keeping `/s/{slug}` forever** for farm-stand QR.

---

## 8. Settings architecture (today)

Owner-level (all stands):

| Route | Configures |
|-------|------------|
| `/dashboard/settings` | Business name, logout, delete, links out |
| `.../stripe` | Connect, pass fee, Connect payment methods |
| `.../paypal` | Marketplace connect |
| `.../billing` | Free vs Pro SaaS |

Stand-level (`/dashboard/businesses/[standId]` tabs):

- details, payments, branding, products, upsells  
- QR studio at `/qr`

Phase 1 shell should surface **Payments / Billing / Website / Fulfilment** as  
nav groups without breaking these paths (aliases OK; no forced renames of  
working URLs in Phase 1).

---

## 9. Exact migration risks

1. **QR / stallside URLs** — `/s/*` on `vendl.app` and `stallside.app` must keep  
   resolving; do not rename for aesthetics.  
2. **Stand / product / pre-order / offer slugs** — renaming breaks printed media.  
3. **Fee economics** — do not change `STALLSIDE_FEE_BPS`, `shouldChargeVendlFee`,  
   pass-on math, PayPal/subscription fee helpers without explicit product order.  
4. **Stripe Connect + Billing** — existing `stripeAccountId` / subscription IDs  
   must remain valid.  
5. **Deposit liability + dunning** — money path; additive only.  
6. **Capacitor** — `com.myfarmstand.owner`; shell loads hosted `/login` →  
   dashboard; mobile nav must stay usable; `/admin` blocked in native.  
7. **Product.standId** — any “owner catalogue” move needs dual-read period +  
   URL compatibility.  
8. **`(gated)` / `(billing)`** — cosmetic regrouping OK; don’t break  
   `/dashboard/settings/billing`.  
9. **Soft-deleted owners** — preserve `deletedAt` behaviour.  
10. **No packages without approval** (repo rule); keep `npm run build` green.

---

## 10. Proposed schema additions (inspect before implementing)

Do **not** create all of these in Phase 1. Prefer additive migrations.

### Phase 1–2 (foundation)

| Model / fields | Purpose |
|----------------|---------|
| `Owner.businessMode` | Enum `FARM_STAND` \| `FOOD_BUSINESS` \| `BOTH` (nullable for legacy → default BOTH or inferred) |
| `Owner.onboardingCompletedAt` | Dismiss/complete guided setup |
| `Owner` AU profile fields | `country`, `stateTerritory`, `suburb`, `postcode`, optional `abn`, `gstRegistered`, `pricesIncludeGst`, `timezone` (or keep timezone primarily on Stand) |
| `Owner.sellCategories` | `String[]` or join table for “what do you sell” multi-select |
| `Owner.fulfilmentIntents` | Flags or string[] from onboarding (stand/pickup/delivery/preorder/sub) |
| `SetupTaskState` | `ownerId`, `taskId`, `skippedAt`, `completedAt` (completion preferably inferred) |
| Optional `BusinessProfile` | Only if Owner becomes too wide — start on Owner |

### Phase 3+

| Model | Purpose |
|-------|---------|
| `Customer` (+ tags, notes, consent) | CRM; backfill from emails |
| `ProductCategory` + membership | Collections |
| Product channel assignments | After catalogue strategy decision |
| `Storefront`, `StorefrontSection`, `Page`, `ThemeSettings` | Website builder |
| `FulfilmentLocation`, `PickupWindow`, `DeliveryZone` | Fulfilment area |
| `Ingredient`, `Recipe`, `RecipeIngredient`, `RecipeProduct` | Costing |
| `Coupon`, `Form*`, `Review`, `Loyalty*`, `GiftCard*` | Growth |
| `ProductUpdate` | What’s New |

Reuse existing Order/Product/Stand/Restock whenever possible.

---

## 11. Proposed route additions (Phase 1–2 first)

Keep existing URLs. Add alongside; alias later if needed.

### Phase 1

```text
/dashboard/getting-started          # formal checklist (same source as home card)
```

Nav regroup in UI only; existing pages stay:

- Farm Stands → keep `/dashboard/businesses` (label “Farm Stands” / “Stands”)  
- Collections stays primary for farm + bakery ops  

### Phase 2

No mandatory new public routes. Extend `/signup` → post-OTP guided setup  
(`/onboarding` or `/dashboard/getting-started` wizard) for:

- business mode  
- profile  
- what you sell  
- fulfilment intents  
- payments (skippable)  
- first product (skippable)  
- theme quick setup (stand branding fields initially)

Legacy owners: infer mode (`stall-first` → `FARM_STAND`, `card-first` →  
`FOOD_BUSINESS` or `BOTH`) and never force a blocking wizard.

### Later phases (from Next brief — do not build yet)

`/dashboard/customers`, `/categories`, `/fulfilment/*`, `/website/*`,  
`/recipes`, `/marketing`, `/coupons`, etc. — see Next brief §40.

---

## 12. Proposed component map (Phase 1)

Standardise on existing tokens; introduce shell primitives gradually:

| Component | Role |
|-----------|------|
| `AppShell` | Wraps dashboard layout regions |
| `SidebarGroup` | Collapsible HOME / SELL / … |
| `TopBar` | Business name, view live, notifications |
| `PageHeader` | Title + primary action |
| `MetricCard` | Dashboard metrics |
| `SetupProgress` / `ChecklistItem` | Getting Started |
| `EmptyState` | Next-action empty states |
| `UpgradeCard` | Fee-economics Pro prompt (not generic spam) |
| `DataTable` / `FilterBar` | Later order/customer lists |
| Keep | `DashboardNextCard`, `DashFormSection`, `FormField`, `DashPrimaryCta` |

Mobile: evolve `DashboardMobileNav` tabs by `businessMode` (Farm Stand vs Food  
Business) without shrinking the desktop sidebar onto phones.

---

## 13. Gap matrix (Next brief vs shipped)

| Next brief area | Status | Phase |
|-----------------|--------|-------|
| Farm stand QR commerce | Shipped | Maintain |
| Free/Pro + 2.5% fee | Shipped | Do not change |
| Pre-orders / deposits / collections | Shipped | UX enhance later |
| Shopper subscriptions | Shipped | UX enhance later |
| Conversion (upsell, tiers, first-order) | Shipped | Keep |
| Dashboard shell redesign | Partial sidebar | **1** |
| Getting Started framework | Partial next-move | **1** |
| Business-mode onboarding | Missing | **2** |
| Unified products / categories / customers | Partial / missing | **3** |
| Website builder | Missing | **4** |
| Fulfilment locations/zones | Missing | **5** |
| Recipes & costs | Missing (`costCents` only) | **6** |
| Coupons / forms / reviews / loyalty / gifts | Missing | **7** |
| Custom domains | Missing | **8** |
| Analytics / What’s New / help polish | Partial | **9** |

---

## 14. Staged implementation plan

### Phase 1 — App shell + Getting Started

**Goals**

1. Introduce collapsible sidebar groups (HOME / SELL / CUSTOMERS / OPERATE /  
   GROW / WEBSITE / ACCOUNT) with **discoverability**: hide unused by preset  
   later, but Phase 1 can show current links + placeholders (“Coming soon” /  
   Explore) without fake features.
2. Build `SetupTask` registry (code) + optional `SetupTaskState` for skips.
3. Infer completion from data (has stand, has product, Stripe charges, QR  
   printed optional, etc.).
4. New `/dashboard/getting-started` + upgrade home card to use same source.
5. Fee/Pro economics card when Free + fees accruing (read-only from orders).
6. Preserve all existing routes and Capacitor mobile tabs.

**Acceptance**

- Existing sellers sign in; stands/QR/orders unchanged.  
- New shell works desktop + phone.  
- Setup progress matches real data.  
- Build green.

**Non-goals:** recipes, website CMS, customers table, schema remount of Product.

### Phase 2 — Business-mode onboarding foundation

**Goals**

1. Enum `businessMode` + progressive wizard after signup (and optional  
   “choose your path” for legacy).  
2. AU defaults: country Australia, state/territory, suburb/postcode, timezone.  
3. What-you-sell multi-select → personalise checklist / empty states only.  
4. Fulfilment intents → checklist priority + nav emphasis.  
5. Payments step skippable → setup task `CONNECT_PAYMENTS`.  
6. First product skippable.  
7. Theme quick setup maps to **Stand branding** (or Owner defaults applied to  
   first stand) — not a full ThemeSettings model yet.  
8. Generate checklist from preset (Farm Stand / Food / Both) per Next brief §5.

**Acceptance**

- Farm Stand path: create stand → product → payments → QR without website busywork.  
- Food Business path: product → payments → (fulfilment placeholder) without  
  requiring a stand.  
- Both: shared product/stand paths as available today.  
- Legacy accounts get non-blocking defaults.

**Non-goals:** full Fulfilment entities, website publish, Customer CRM.

### After Phase 2

Proceed to Next brief Phases 3–9 only after Product channel strategy decision  
documented in a short Phase 3 plan.

---

## 15. First implementation target (when coding starts)

> **New Vendl dashboard shell + Getting Started system + business-mode  
> onboarding foundation**

Order:

1. Ship this audit (done).  
2. Phase 1 PR(s): shell + Getting Started (no Product remount).  
3. Phase 2 PR(s): mode onboarding + Owner profile fields + checklist presets.  
4. Stop and re-plan Phase 3 (catalogue / customers / categories).

---

## 16. Agent rules reminder (from Next brief)

1. Read the repo before implementing.  
2. Code > stale docs.  
3. Do not casually replace payment code.  
4. Do not change fee economics without instruction.  
5. Do not break QR URLs.  
6. No new packages without approval.  
7. Keep `npm run build` green.  
8. Additive migrations; no destructive migrations without approval.  
9. Small commits by feature slice.  
10. Do not clone competitor UI.  
11. Keep Capacitor working.  
12. Farm-stand simplicity remains sacred.

---

## 17. Key file index (for implementers)

```text
prisma/schema.prisma
src/app/dashboard/layout.tsx
src/components/dash-nav-links.ts
src/components/DashboardSidebar.tsx
src/components/DashboardMobileNav.tsx
src/lib/dashboard-setup-alerts.ts
src/lib/dashboard-onboarding-path.ts
src/lib/owner-trial.ts
src/lib/stallside-fee.ts
src/lib/constants.ts
src/lib/auth-otp-user.ts
src/app/signup/
src/app/onboarding/
src/app/s/[standSlug]/
src/lib/checkout.ts
src/lib/pre-order.ts
src/lib/deposit-order.ts
src/lib/public-stand-branding.ts
next.config.ts
capacitor.config.ts
```

---

*Phase 0 complete. Implementation may begin with Phase 1 only after this  
document is accepted as the plan baseline.*
