# Vendl Next — Phase 3 Catalogue Architecture

**Status:** PLANNING ONLY — do not implement from this document without approval  
**Date:** 1 September 2026  
**Inputs:** Live repository audit, Phase 0 audit, Phase 1–2 shipped behaviour,  
AU food & farm commerce brief  
**Constraint:** Farm stands, `/s/*`, QR codes, payments, fees, and historic orders  
remain first-class and unbroken.

---

## Executive recommendation

**Move to an owner-owned Product catalogue with channel assignment, while Stand  
remains the permanent public URL and farm-stand channel surface.**

Today Vendl already shares one Product across pre-order pages and subscription  
offers via junction tables — but **Product is still stand-scoped**  
(`standId` required + `@@unique([standId, slug])`). Food Business onboarding  
hides this by auto-creating a primary Stand (“Shop”). That bridge works for  
Phase 2; it will not scale to “one product, many channels” or a real online  
storefront without a catalogue remount.

**Recommended core model:**

```text
Owner
  ├── Product (owner-owned catalogue item)          ← evolve from today
  │     ├── ProductOptionGroup / Choice
  │     ├── ProductCategoryMembership → Category
  │     └── ProductChannel (where it is sold)
  ├── Category (owner catalogue taxonomy)
  ├── Stand (farm stand / location / permanent /s/{slug} surface)
  ├── PreOrderPage (channel + schedule)
  ├── SubscriptionOffer (channel + cadence)
  └── Customer (lightweight CRM; backfilled from emails)
```

**Do not invent a separate `Catalogue` table in v1** — Owner *is* the catalogue  
boundary. Add `Catalogue` later only if multi-brand / multi-business-under-one-login  
becomes a real requirement.

**Inventory (Phase 3 first cut):** keep **one stock pool per Product**  
(today’s `stockQuantity`). Channel assignment controls *visibility*, not  
separate stock. Location-specific stock is a later optional layer.

**Price (Phase 3 first cut):** keep **one base price on Product** (+ options /  
tiers). Channel-specific price overrides are deferred unless a concrete seller  
need forces them.

---

## 1. Current implementation audit

### 1.1 Core relationships (Prisma)

| Entity | Ownership | Key uniqueness | Notes |
|--------|-----------|----------------|-------|
| **Owner** | ← User | `userId` unique | Soft-delete `deletedAt`; `businessMode` preset |
| **Stand** | Owner | **global** `slug` unique | Public identity for `/s/{slug}` + QR |
| **Product** | Owner + **required Stand** | `@@unique([standId, slug])` | `ownerId` already denormalized |
| **ProductOptionGroup/Choice** | Product | — | XOR with `priceTiers` in product rules |
| **PreOrderPage** | Owner + Stand | `@@unique([standId, slug])` | Junction → Product |
| **PreOrderPageProduct** | — | unique(page, product) | Cascade both sides |
| **SubscriptionOffer** | Owner + Stand | `@@unique([standId, slug])` | Junction → Product |
| **SubscriptionOfferProduct** | — | unique(offer, product) | qty + sort |
| **ShopperSubscription** | Offer + Stand + Owner | manageToken, stripe ids | Buyer PII on row |
| **Order** | Owner + Stand | — | Method/status/deposit/balance fields |
| **OrderItem** | Order | — | `productId` **Restrict** (no onDelete); snapshots |
| **InventoryAdjustment** | Product + Stand + Owner | — | Sources include ORDER_* |
| **LowStockAlert** | Product + Stand + Owner | — | Cooldown |
| **RestockSubscriber** | Stand | `@@unique([standId, email])` | Not per-product |
| **ChannelInterest** | Stand | unique(stand, kind, email) | PREORDER / SUBSCRIPTION |
| **CardInterest** | Stand | — | No PII |

**Hidden / sentinel products (same Product table):** Customer Choice product,  
pre-order upsell add-ons — `isHidden: true`, stand-scoped.

### 1.2 Multi-channel reality today

One Product row is already reused for:

- Stand catalogue (direct `Product.standId`)
- Pre-order pages (`PreOrderPageProduct`)
- Subscriptions (`SubscriptionOfferProduct`)

**Gap:** A product cannot live on Stand A and Stand B without duplication.  
Online “shop” for food businesses is literally a Stand row labeled “Shop”.

### 1.3 Public URLs (permanent)

| Route | Role |
|-------|------|
| `/s/{standSlug}` | Catalogue |
| `/s/{standSlug}/{productSlug}` | Product detail |
| `/s/{standSlug}/cart`, `/pay` | Checkout / Customer Choice |
| `/s/{standSlug}/pre`, `/pre/{pageSlug}` | Pre-orders |
| `/s/{standSlug}/sub`, `/sub/{offerSlug}`, `/sub/manage/{token}` | Subscriptions |

QR posters target `/s/{slug}` (or `/pay` for Customer Choice).  
`stallside.app` host compatibility for `/s`, `/checkout`, `/api` must remain.

Reserved product slugs: `cart`, `checkout`, `pre`, `sub`.

### 1.4 Checkout & snapshots

- Cart lines resolve products with `standId = stand.id` (`src/lib/checkout.ts`).
- OrderItems store **`productNameSnapshot`**, **`optionsSnapshot`**, unit/line cents.
- Stock decremented with optimistic `updateMany` + InventoryAdjustment.
- Historic lines must remain meaningful if Product is later renamed, archived,  
  or reassigned — **snapshots stay authoritative for display of past orders**.

### 1.5 Product / stand deletion

- App “delete product” = **archive** (`isArchived`), not hard delete — protects  
  OrderItem Restrict FK.
- Stand delete manually clears order items → orders → products → stand  
  (`stand-delete-actions.ts`). OrderItem Restrict is why order lines go first.

### 1.6 Customer identity (no Customer model)

Scattered across:

- `Order.receiptEmail` / name / phone / delivery
- `ShopperSubscription` buyer fields
- `RestockSubscriber.email` (per stand)
- `ChannelInterest.email` (per stand + kind)

First-order discount keys on normalised email at **stand** scope.  
Anonymous cash buyers must never get invented Customer rows.

### 1.7 Product.standId dependency surface

Approx **80+ files** under `src/` reference `standId`; **~90–110** call sites  
touch stand-scoped product queries/actions.

**Hotspots:**

| Area | Paths (representative) |
|------|-------------------------|
| Schema | `prisma/schema.prisma` |
| Product CRUD | `dashboard/(gated)/products/actions.ts`, lifecycle, options |
| Catalog public | `lib/public-stand-catalog.ts`, `lib/product-visibility.ts`, `s/[standSlug]/**` |
| Checkout | `lib/checkout.ts`, `s/*/actions.ts`, digital/paypal checkout |
| Pre-orders | `pre-order-pages/actions.ts` |
| Subscriptions | `subscriptions/actions-*.ts`, `fulfill-shopper-subscription.ts` |
| Inventory | checkout decrement, product adjust, deposit restore |
| Dashboard | selected business cookie, home metrics, low stock |
| Setup | `ensure-primary-stand.ts`, Phase 2 onboarding |
| Slugs | `lib/slug.ts` `uniqueProductSlug(standId, …)` |

Webhooks do not query Product directly; they fulfill Orders that already  
carry `standId`.

### 1.8 Food Business bridge

`ensurePrimaryStand` creates a Stand named from `businessName` so  
`Product.standId` can be satisfied. Nav/checklist can say “Shop”; internally  
it is still a Stand. Phase 3 must stop requiring sellers to *think* in stands  
unless they use farm stands — without deleting Stand as infrastructure.

---

## 2. Future catalogue model

### 2.1 Recommended entities

| Concept | Recommendation | Rationale |
|---------|----------------|-----------|
| **Owner = catalogue** | Yes | Matches billing, auth, alerts; avoids empty Catalogue table |
| **Product** | Owner-owned; `ownerId` required; `standId` transitional | `ownerId` already exists |
| **Stand** | Keep forever as location + `/s/{slug}` channel | QR permanence |
| **ProductChannel** | New join: product ↔ channel target | Explicit “where sold” |
| **Channel target** | Polymorphic *or* typed FKs | Prefer typed FKs for safety |
| **Category** | Owner-level | Website + dashboard |
| **ProductCategory** | M:N join | Multi-category |
| **InventoryLocation** | **Defer** | One pool first |
| **SalesChannel enum/table** | Lightweight enum + FKs | Avoid over-abstract CMS |

### 2.2 Proposed ProductChannel shape (conceptual)

```text
ProductChannel
  id
  productId
  channelType: STAND | ONLINE | PREORDER_PAGE | SUBSCRIPTION_OFFER | (future EVENT)
  standId?              // when STAND or when ONLINE maps to primary public stand
  preOrderPageId?       // when PREORDER_PAGE
  subscriptionOfferId?  // when SUBSCRIPTION_OFFER
  isEnabled
  sortOrder?
  // deferred: priceOverrideCents, stockOverride
```

**ONLINE:** For Phase 3–4, “main online storefront” may still resolve through  
the owner’s **primary public Stand** slug (`/s/{primary}`) until a dedicated  
storefront host exists. ProductChannel `ONLINE` means “show on primary public  
shop surface,” not a second product copy.

Existing `PreOrderPageProduct` / `SubscriptionOfferProduct` can:

- **Option A (recommended):** Remain as specialised joins; ProductChannel is  
  used for STAND + ONLINE; preorder/sub junctions stay until unified later, **or**
- **Option B:** Migrate junctions into ProductChannel and deprecate old tables.

**Recommendation: Option A for Phase 3** — less risk; preorder/sub already work.  
Add ProductChannel for multi-stand + online visibility first; unify junctions  
in a later slice if duplication hurts.

### 2.3 Availability / inventory / price policy (first cut)

| Concern | Phase 3 policy |
|---------|----------------|
| **Visibility** | Channel assignment (ProductChannel + existing junctions) |
| **Inventory** | Global per Product (`stockQuantity`) |
| **Price** | Global per Product (+ options/tiers) |
| **Stand-only stock** | Out of scope until multi-stand same SKU with divergent stock is proven |

This matches current checkout math and fee paths.

### 2.4 Rejected / deferred

- Separate `Catalogue` entity (unless multi-business login appears)
- Full InventoryLocation ERP (purchasing, transfers)
- Channel-specific pricing in first migration (complexity without demand)
- Destroying Stand to “simplify” food businesses

---

## 3. Product migration strategy (highest risk)

### 3.1 Goals

- Additive only
- Dual-read / dual-write period
- Existing `/s/{stand}/{product}` keeps resolving
- New products can be owner-scoped with channel links
- No fee/payment behaviour changes

### 3.2 Transitional schema (additive)

**Phase 3A — add columns/tables, no behaviour change required:**

1. Ensure every Product has reliable `ownerId` (already present; verify backfill).
2. Add nullable `Product.catalogueSlug` **or** prepare owner-unique slug:  
   `@@unique([ownerId, slug])` **cannot** coexist with `@@unique([standId, slug])`  
   without a transition plan — see decisions.
3. Add `Category`, `ProductCategory`.
4. Add `ProductChannel` (STAND + ONLINE initially).
5. Keep `Product.standId` **NOT NULL** throughout 3A–3C.

**Phase 3B — backfill ProductChannel:**

```text
For each Product:
  insert ProductChannel(STAND, standId = Product.standId, enabled=true)
  if stand is owner's primary/oldest stand:
    insert ProductChannel(ONLINE, standId = that stand) optional rule
```

PreOrderPageProduct / SubscriptionOfferProduct unchanged.

**Phase 3C — compatibility layer (code):**

Introduce `src/lib/catalogue/` helpers:

- `resolveProductForStand(standId, productId|slug)` — reads Product where  
  `standId` match **OR** ProductChannel STAND includes stand (once nullable)
- `listProductsForStandCatalog(stand)` — dual-read
- Create product: still write `standId` = selected/primary stand + ProductChannel rows

**Phase 3D — nullable standId (only after dual-read proven):**

- `Product.standId` → optional
- New products: `standId` = primary channel stand for URL default, or null with  
  at least one ProductChannel STAND/ONLINE
- Slug uniqueness: move to `@@unique([ownerId, slug])` with careful dual unique  
  indexes during transition (PostgreSQL partial uniques)

**Phase 3E — deprecate standId (late / optional):**

- Stop writing standId; keep column for months as denormalised “primary stand”
- Eventually drop column only after zero dual-read paths and analytics sign-off

### 3.3 Backfill strategy

| Step | Action |
|------|--------|
| 1 | Verify `Product.ownerId` matches `Stand.ownerId` for all rows; fix drifts |
| 2 | Backfill ProductChannel STAND for every product |
| 3 | Categories empty initially (no fake categories from sellCategories) |
| 4 | Customer backfill separate slice (3F) |

### 3.4 Deployment order

1. Ship additive migration (expand-only)  
2. Ship dual-read helpers behind existing call sites gradually  
3. Backfill ProductChannel (idempotent job)  
4. New UI for channel assignment  
5. Only then consider nullable `standId`  
6. Never combine nullable standId + slug unique change + UI rewrite in one deploy  

### 3.5 Rollback

- Additive tables/columns: leave in place; feature-flag new UI off  
- Backfill: idempotent; safe to re-run  
- Do **not** drop `standId` in the same release that first nulls it  
- Order/payment codepaths must keep using Order/OrderItem snapshots  

### 3.6 New vs old products during rollout

| | Old code | New code |
|--|----------|----------|
| Create | Sets standId | Sets standId + ProductChannel |
| List stand catalog | `where standId` | `standId OR channel` |
| Checkout | `standId` match | Same via compatibility helper |

---

## 4. Permanent backwards compatibility

### 4.1 URL resolution

`/s/{standSlug}/{productSlug}` must resolve if:

- Product.standId = that stand (legacy), **or**
- ProductChannel links product to that STAND and product is live

Owner-level product still appears on the farm stand URL when assigned to that  
stand channel — **no redirect away from `/s/*`**.

Future website (`business.vendl.app` or custom domain) is an **additional**  
surface (Phase 4+), not a replacement for stand QR URLs.

### 4.2 Historic orders

| Field | Authority |
|-------|-----------|
| OrderItem.productNameSnapshot | Display name forever |
| OrderItem.optionsSnapshot | Options forever |
| unit/line cents | Paid amounts forever |
| productId | Soft reference; may point at archived product |
| Order.standId | Channel/location of sale forever |

Do not recompute past line names from live Product.

### 4.3 QR / stallside

Printed QR → `/s/{slug}` remains valid for the lifetime of the physical sign.  
Slug changes remain a deliberate seller action with breakage risk (unchanged).

---

## 5. Selling channels

### 5.1 Supported channel types

| Type | Today | Phase 3 |
|------|-------|---------|
| Farm stand | Stand + products | Stand + ProductChannel STAND |
| Online storefront | Primary stand as shop | ProductChannel ONLINE → primary stand URL initially |
| Pre-order | PreOrderPageProduct | Keep junction; optional ProductChannel later |
| Subscription | SubscriptionOfferProduct | Keep junction |
| Market/event | — | Future channel type; not in 3A–3G |

### 5.2 Assignment UX

Product editor: checklist of stands + “Show on online shop” + existing  
preorder/subscription pickers (or links to those UIs).

Simple sellers (one stand): auto-assign STAND (+ ONLINE) on create — zero extra  
clicks.

---

## 6. Categories

### 6.1 Model

```text
Category
  ownerId, title, slug, description?, imageUrl?
  sortOrder, isActive
  @@unique([ownerId, slug])

ProductCategory
  productId, categoryId, sortOrder?
  @@unique([productId, categoryId])
```

### 6.2 Rules

- M:N products ↔ categories  
- Not the same as onboarding `Owner.sellCategories` (those stay as tips only)  
- Farm stands: categories optional on public stand page; website uses them heavily  
- SEO fields later  

### 6.3 Migration

Empty categories for existing sellers. No auto-create from sellCategories  
(avoid junk taxonomy).

---

## 7. Customer model (lightweight CRM)

### 7.1 Model

```text
Customer
  ownerId
  email?          // normalised lowercase; nullable for rare cases
  name?
  phone?
  // addresses: JSON or Address child table later
  notes?
  marketingConsent Boolean @default(false)  // never infer from order alone
  marketingConsentAt?
  source?         // first-seen channel hint
  createdAt, updatedAt
  @@unique([ownerId, email]) where email not null  // partial unique

Order.customerId?          // nullable FK SetNull
ShopperSubscription.customerId?
RestockSubscriber.customerId?  // optional link
```

### 7.2 What to store vs calculate

| Stored | Calculated |
|--------|------------|
| name, email, phone, notes, tags, consent | orderCount, lifetimeSpend, first/last order |
| | Prefer SQL aggregates / dashboard queries |

### 7.3 Backfill

1. From Order.receiptEmail (normalised) per owner — create Customer, set  
   Order.customerId where email present  
2. Merge ShopperSubscription emails  
3. Merge RestockSubscriber (stand-scoped → owner Customer)  
4. **Skip** orders with no email (cash anonymity)  

### 7.4 Dedup rules (conservative)

- Match on `ownerId + normalised email` only  
- Do not merge on phone alone  
- Do not create customers for blank email  
- If two emails differ by typo, do not auto-merge  

### 7.5 Deletion

Customer delete → SetNull on Order.customerId; order history remains.  
Never cascade-delete orders.

---

## 8. Dashboard UX (Phase 1 shell)

### 8.1 Target nav (when slices ship)

```text
SELL
  Products          ← owner catalogue (not stand-filtered forever)
  Categories        ← after 3D
  Orders
  Pre-orders
  Subscriptions

CUSTOMERS
  Customers         ← after 3F

OPERATE
  Farm Stands / Shop / Locations  ← mode-aware label (Phase 2)
  Collections
  Notifications
```

No fake nav entries.

### 8.2 Product list

- Default: all owner products  
- Filters: stand/channel, category, archived, pre-order eligible  
- Simple farm-stand sellers: pre-filter to their only stand (feels unchanged)

### 8.3 Product editor sections

1. Basics (name, description, images, price)  
2. Variants / options XOR tiers  
3. Inventory (single pool)  
4. Categories  
5. Selling channels (stands, online, links to preorder/sub membership)  
6. Availability / visibility (active, hidden, archived)  

One editor — no duplicate product forms per channel.

---

## 9. Farm Stand compatibility

Farm stand remains a **core selling mode**, not a legacy module.

After Phase 3 a farm-stand owner can still:

- Create stands  
- Assign products (channels)  
- Print QR → `/s/{slug}`  
- Cash / local bank / card  
- Sale + low-stock alerts  
- Manage stock  
- Orders + mobile / Capacitor  

**Improvement:** Products created once can be assigned to a second stand or  
pre-order without cloning SKUs.

**Guardrail:** Default create flow for `FARM_STAND` mode auto-assigns the  
selected stand — no mandatory multi-channel UI.

---

## 10. Food business compatibility

Food / bakery sellers should see:

- “Shop” / “Online catalogue” language  
- Products as the centre of gravity  
- Stands only if they enable farm-gate / honesty box  

Internally, primary Stand may still back `/s/{slug}` until Phase 4 storefront  
domains. UX must not say “Farm Stand” unless `businessMode` / fulfilment  
intents include it (Phase 2 labeling direction).

---

## 11. Phase 3 implementation slices

| Slice | Scope | Schema | Risk | Tests | Rollback |
|-------|-------|--------|------|-------|----------|
| **3A** Additive schema | Category, ProductCategory, ProductChannel; indexes; no null standId | Additive migration | Low | Migrate deploy on staging; row counts | Leave tables |
| **3B** Backfill channels | Job: Product → ProductChannel STAND | Data only | Med | Idempotent re-run; spot-check owners | Re-run / delete channel rows |
| **3C** Compatibility layer | `lib/catalogue/*`; switch loaders gradually | None | Med–High | Checkout + public PDP + cart | Feature flag / revert imports |
| **3D** Categories UI | CRUD + product membership | Uses 3A | Low | Category CRUD; public optional | Hide nav |
| **3E** Channel assignment UI | Product editor channels; multi-stand | Uses 3A–3C | Med | Assign product to 2 stands; both `/s` PDPs | Disable UI |
| **3F** Customer model | Customer + nullable FKs + backfill | Additive | Med | Backfill counts; order history; no cash invention | Leave table; stop linking |
| **3G** Dashboard catalogue UX | Owner product list; filters; nav | None | Med | Farm + food mode UX | Revert pages |
| **3H** Regression matrix | Full checklist §12 | None | — | CI + manual pilot | — |
| **3I** Nullable standId decision | Only after 3H green | Risky migration | High | Dual-read metrics = 0 legacy-only | Delay drop |

**Explicitly not in Phase 3:** full website builder, custom domains,  
InventoryLocation, channel pricing, PayPal WIP integration.

**Do not touch unrelated PayPal working-tree files.**

---

## 12. Regression matrix

| Area | Must pass |
|------|-----------|
| Existing seller login | Session, soft-delete rules |
| Existing products | List, edit, archive, options, tiers |
| Existing stands | CRUD, branding, payment toggles |
| QR codes | Resolve to correct `/s/{slug}` |
| `/s/*` | Catalog, PDP, cart, pay, pre, sub |
| Checkout | Cash, local bank, Stripe card/wallets |
| PayPal | Whatever is currently enabled/WIP — no regressions from catalogue work; do not merge WIP accidentally |
| Orders | List, detail, snapshots intact |
| Deposits / balance | Dunning + buyer re-auth |
| Pre-orders | Pages, junctions, collections |
| Subscriptions | Offers, enroll, cycle fulfill |
| Inventory | Decrement once; adjustments; low stock |
| Alerts | Sale + stock email/push |
| Fees | Free 2.5% via `platformFeeCents` / stallside helpers; Pro waiver |
| Mobile dashboard | Tabs + More |
| Capacitor | Login shell, push register |
| Soft-delete re-signup | Onboarding reset behaviour |
| Phase 2 modes | Farm / Food / Both labels + short gate |

---

## 13. Decisions Required Before Phase 3 Implementation

### D1 — Online storefront identity vs primary Stand

**Issue:** Food businesses need an “online shop” URL. Today that is a Stand.

**Options:**

1. Keep primary Stand as the only public shop URL through Phase 4  
2. Introduce `/o/{ownerSlug}` or subdomain storefront in Phase 3  
3. Hybrid: ONLINE channel always points at primary Stand until Phase 4  

**Recommend: (3) Hybrid / (1) in practice** — no new public URL scheme in  
Phase 3. Reduces QR/DNS risk; Phase 4 website can add domains later.

### D2 — Unify preorder/subscription junctions into ProductChannel now?

**Issue:** Two junction styles vs one.

**Options:**

1. Keep PreOrderPageProduct / SubscriptionOfferProduct; ProductChannel for STAND/ONLINE only  
2. Migrate all membership into ProductChannel in 3A  

**Recommend: (1)** — preorder/sub already correct; unification is refactor debt,  
not a blocker for multi-stand catalogue.

### D3 — Product slug uniqueness scope

**Issue:** Today `@@unique([standId, slug])`. Owner catalogue wants  
`@@unique([ownerId, slug])`.

**Options:**

1. Keep stand-scoped slugs forever; owner catalogue uses internal id in admin only  
2. Transition to owner-unique slugs with partial indexes + dual uniqueness window  
3. Require slug rename collisions to be resolved manually at backfill  

**Recommend: (2)** with a long dual-unique window and collision report before  
enforcing owner-unique. Public URLs stay `/s/{stand}/{productSlug}`; if the  
same slug is assigned to two stands via channels, PDP resolution is  
stand-scoped (stand + slug) and remains unambiguous.

### D4 — Multi-stand inventory

**Issue:** One product on two stands with one stock pool may be wrong for some  
sellers (two physical locations).

**Options:**

1. Single pool only (Phase 3)  
2. Per-stand stock from day one  
3. Single pool + explicit “separate stock = duplicate product” guidance  

**Recommend: (1) + (3) guidance** — matches current code; per-stand stock is a  
deliberate Phase 3+ follow-on once multi-stand assignment ships.

### D5 — Customer marketing consent default

**Issue:** Orders have emails without consent.

**Options:**

1. Backfill customers with `marketingConsent=false` always  
2. Infer consent from restock opt-in only  
3. Infer from any email capture  

**Recommend: (1) + (2)** — never true from purchase alone; restock/channel  
opt-ins can set consent true with timestamp.

---

## Appendix A — Key files for implementers

```text
prisma/schema.prisma
src/lib/checkout.ts
src/lib/public-stand-catalog.ts
src/lib/product-visibility.ts
src/lib/slug.ts
src/lib/ensure-primary-stand.ts
src/lib/fulfill-paid-order.ts
src/app/s/[standSlug]/**
src/app/dashboard/(gated)/products/**
src/app/dashboard/(gated)/pre-order-pages/**
src/app/dashboard/(gated)/subscriptions/**
src/app/dashboard/(gated)/businesses/stand-delete-actions.ts
src/lib/business-mode.ts
VENDL-NEXT-PHASE-0-AUDIT.md
```

## Appendix B — Non-goals for Phase 3

- Website builder / custom domains  
- Changing fee economics or Stripe Connect behaviour  
- Removing farm stands or `/s/*`  
- Hard-deleting historic products with order lines  
- PayPal WIP completion (separate track)  
- Destructive Product.standId drop in the first migration  

---

*End of Phase 3 planning document. Await approval of §13 decisions before any  
implementation slice.*
