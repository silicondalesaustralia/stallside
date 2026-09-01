# Vendl Next — Phase 5 Fulfilment Architecture (Planning)

**Status:** PLANNING ONLY — do not implement until approved  
**Date:** 1 September 2026  
**Scope:** Design reusable fulfilment architecture for local food & produce businesses  
**Non-goals:** Recipes/costing, loyalty, route optimisation, Stripe Billing redesign, PayPal WIP, nullable `Product.standId`, checkout rewrite

---

## Executive summary

Today, Vendl fulfilment is **field-based, not entity-based**. Schedule and handover rules live on **Product**, **PreOrderPage**, and **SubscriptionOffer**, then **snapshot onto Order** at checkout. There are no `PickupLocation`, `PickupWindow`, or `DeliveryZone` models. Operations run through **Collections** (`/dashboard/collections`), which groups pre-orders heuristically by calendar day and product overlap.

Phase 5 should introduce **reusable fulfilment entities** (locations, windows, delivery zones, options) while:

1. Keeping **`/s/*` QR farm-stand commerce first-class** with zero extra configuration friction.
2. **Not redesigning checkout** — extend context-aware selection and snapshotting.
3. **Not changing payment economics** — same Stripe Connect, fees, deposit/balance logic.
4. Migrating **additively** — legacy fields remain readable until deprecation.

**Recommended minimum architecture:** Owner-scoped **PickupLocation**, **PickupWindow** (one-off or simple weekly recurrence), **DeliveryZone** (postcode/suburb lists), and **FulfilmentOption** (the selectable “how/when/where” bundle). **OrderFulfilment** (1:1 with Order) holds immutable snapshots. Farm stands get an implicit **STAND_IMMEDIATE** option tied to the Stand — no seller setup required.

---

## 1. Current fulfilment implementation (repository audit)

### 1.1 Shared enums

| Enum | Values | Where used |
|------|--------|------------|
| `HandoverMode` | `COLLECT`, `DELIVER` | Product, PreOrderPage, SubscriptionOffer, Order |
| `PaymentTiming` | `PAY_NOW`, `PAY_UPFRONT`, `DEPOSIT_THEN_BALANCE` | Product, PreOrderPage, Order |
| `CollectionStatus` | `ORDERED`, `READY`, `COLLECTED` | Order (pre-order workflow only) |
| `ShopperSubInterval` | `WEEKLY`, `FORTNIGHTLY`, `MONTHLY` | SubscriptionOffer |

**File:** `prisma/schema.prisma`

### 1.2 Stand

**Fulfilment fields:** none directly.

| Field | Role |
|-------|------|
| `timezone` | IANA TZ for order-by / collection wall-clock labels |
| `locationLabel` | Public display hint (often suburb) on stall header / QR |
| `cartMode` | `PRODUCT` vs `CUSTOMER_CHOICE` — affects checkout shape |
| Payment toggles | `acceptCash`, `acceptCard`, etc. — not fulfilment |

**Stand-specific today:** All checkout routes are stand-scoped (`/s/{standSlug}/…`). Orders always have `standId`. Inventory decrement is stand-scoped.

**Heavily used:** `src/app/s/[standSlug]/*`, `src/lib/public-stand-catalog.ts`, QR flows under `dashboard/businesses/[standId]/qr/`

### 1.3 Product

| Field | Purpose |
|-------|---------|
| `isPreOrder` | SKU is a pre-order product |
| `preOrderEligible` | Can be added to PreOrderPage sheets |
| `orderByAt` | Orders close (validated at cart, **not** stored on Order) |
| `collectionAt` | Collection / delivery day snapshot source |
| `collectionNote` | Pickup/delivery instructions |
| `paymentTiming`, `depositPercent` | Pre-order payment model |
| `handoverMode` | COLLECT vs DELIVER |
| `showExactStock` | Pre-order capacity display |

**Product-specific:** Single-SKU pre-order schedule. Take-now products use defaults (`PAY_NOW`, `COLLECT`, no dates).

**Heavily used:** `src/lib/pre-order.ts`, `src/lib/checkout.ts`, `PreOrderFields.tsx`, `public-product.ts`, cart/checkout components.

### 1.4 PreOrderPage + PreOrderPageProduct

**Page-level schedule** (shared across linked products):

- `orderByAt`, `collectionAt`, `collectionNote`, `handoverMode`, `paymentTiming`, `depositPercent`, `showExactStock`
- On save, schedule **synced to all linked products** via `product.updateMany` in `pre-order-pages/actions.ts`

**Junction:** `PreOrderPageProduct` — product links only, no fulfilment fields.

**Public routes:** `/s/{standSlug}/pre`, `/s/{standSlug}/pre/{pageSlug}`

**Collections grouping:** Heuristic match by collection day + product ID overlap (`group-collection-pages.ts`). Unmatched → “Other pre-orders”.

### 1.5 SubscriptionOffer + ShopperSubscription

**Offer:** `handoverMode`, `collectionWeekday` (0–6), `collectionNote`, `interval`, pricing.

**Subscriber:** delivery address fields, `nextCollectionAt`, Stripe lifecycle fields.

**Cycle fulfilment:** `fulfill-shopper-subscription.ts` creates paid `Order` with `isPreOrder: true`, copies handover + delivery from offer/subscriber, computes `collectionAt` via `nextCollectionAt()` in `subscription-offer.ts`.

**No buyer choice** of pickup window after enroll; address fixed at enrollment.

### 1.6 Order + OrderItem

**Order fulfilment snapshot (authoritative for ops):**

| Field | Set when |
|-------|----------|
| `isPreOrder` | Pre-order or subscription cycle |
| `collectionAt`, `collectionNote` | From product/page/offer |
| `collectionStatus` | `ORDERED` on pre-order create; manual advance in Collections |
| `handoverMode`, `paymentTiming` | From product/offer |
| `depositCents`, `balanceCents`, `balanceDueAt` | Deposit pre-orders; balance due ≈ collection day |
| `deliveryAddressLine1`, `deliverySuburb`, `deliveryPostcode`, `deliveryNotes` | When `DELIVER` |
| `customerName`, `customerPhone` | Pre-order card checkout |
| `shopperSubscriptionId` | Subscription cycles |

**Index:** `[standId, collectionAt, collectionStatus]` — Collections queries.

**OrderItem:** line snapshots only — **no per-line fulfilment**. All fulfilment is order-level.

**Take-now orders:** `isPreOrder: false`, defaults, **never appear in Collections**.

### 1.7 Owner (marketing only)

| Field | Purpose |
|-------|---------|
| `fulfilmentIntents` | Onboarding flags: `farm_stand`, `pickup`, `delivery`, `preorders`, `subscriptions` |

**Not enforced at checkout.** Drives setup checklist, storefront section defaults (`src/lib/storefront/config.ts`), getting-started copy.

### 1.8 Storefront (`/shop/*`)

Phase 4B shows pickup/delivery **copy** from `fulfilmentIntents` — no fulfilment selection yet. Checkout still routes to `/s/{standSlug}/cart`.

### 1.9 Checkout & cart behaviour (today)

| Context | Fulfilment choice | Payment |
|---------|-------------------|---------|
| `/s/{slug}` take-now cart | **None** — implied collect-at-stand | Cash, local transfer, card, PayPal |
| `/s/{slug}` pre-order cart | **None** — from product schedule | **Card only** |
| `/s/{slug}/pre/{page}` | **None** — synced from page → products | Card only |
| `/s/{slug}/sub/{offer}` | **None** — from offer | Stripe subscription Checkout |
| `/shop/{slug}` | **None yet** — inherits stand cart | Same as stand |

**Cart mix rules** (`src/lib/checkout.ts`):

- Cannot mix take-now + pre-order
- Pre-order items must share same `collectionAt`, `handoverMode`, `paymentTiming`, `depositPercent`

**Delivery capture:** `PreOrderContactFields.tsx`, `StandCartCheckout.tsx` when all pre-order lines are `DELIVER`.

**Checkout writers:**

- Card: `digital-checkout-actions.ts`
- Cash/local: `actions.ts` (pre-orders blocked)
- PayPal: `paypal-checkout-actions.ts` (pre-orders blocked; WIP separate)
- Subscription: `enroll-actions.ts` + webhooks

### 1.10 Collections dashboard

**Load filter** (`load-collections.ts`): `isPreOrder: true`, paid/deposit states, `collectionAt >= today - 14 days`.

**Grouping:**

1. Subscription orders → by offer title
2. Other pre-orders → match to PreOrderPage (heuristic) or calendar day

**Ops features:** ORDERED → READY → COLLECTED, make lists (SKU totals), suburb counts for delivery, print sheets, bulk customer email (PAID only).

**Gap:** No pickup **location** dimension; no multi-window same-day view; no delivery zone management.

### 1.11 Orders dashboard

Financial/history view — badges for Pre Order / Subscription / Paid At Stand. **No collection day, handover, or fulfilment filters** yet.

### 1.12 Deposits & pay-later

| Flow | Behaviour |
|------|-----------|
| Cash/local take-now | `CUSTOMER_CONFIRMED`, stock decrements, no Collections |
| Pre-order deposit | Stripe charges deposit; `DEPOSIT_PAID`; balance charged on `balanceDueAt` via cron (`balance-dunning.ts`) |
| Balance failure | Retries 0/2/5 days; cancel + restock after max |

Fulfilment gating: collection status buttons disabled until fully paid (except `CUSTOMER_CONFIRMED` path — irrelevant for pre-orders since cash blocked).

### 1.13 Notifications & email

| Trigger | Fulfilment content |
|---------|-------------------|
| Sale notify (owner) | Includes collection info when pre-order |
| Customer order email | Collect/delivery date, address, deposit note |
| Subscription cycle | Same via `fulfill-shopper-subscription.ts` |
| Collection status change | **No automated customer email** |
| Balance dunning | Buyer + owner emails |

**Push:** `notifySale`, low stock — Capacitor/Web Push via `OwnerPushRegister.tsx`, `NativeShellBootstrap.tsx`. No fulfilment-specific push beyond sale alerts.

### 1.14 Inventory

Stock decrement on paid/deposit/customer-confirmed via `decrementStockForOrder` in `fulfill-paid-order.ts` / cash confirm. Pre-order deposit reserves stock at deposit payment.

### 1.15 Mobile / Capacitor

Owner app loads hosted dashboard. Collections is a **mobile tab** (“Collect”). No native fulfilment screens — same web UI.

### 1.16 Where assumptions are encoded

| Layer | Stand-specific | Pre-order-specific | Subscription-specific | Reusable candidate |
|-------|----------------|--------------------|-----------------------|-------------------|
| **Prisma** | Order.standId | Product/PreOrderPage schedule fields | Offer weekday, sub address | HandoverMode enums, Order snapshot pattern |
| **checkout.ts** | standSlug cart key | mix rules, collectionAt equality | — | Cart validation framework |
| **digital-checkout-actions** | stand context | pre-order order create | — | Order create + snapshot |
| **pre-order-pages/actions** | standId on page | schedule sync to products | — | Schedule → FulfilmentOption |
| **fulfill-shopper-subscription** | stand on order | isPreOrder on cycle order | weekday math | Recurring window |
| **collections/** | stand filter implicit via owner | grouping heuristics | subscription group | Make-list aggregation |
| **storefront** | primary stand for checkout | — | — | Fulfilment selection on `/shop` |
| **Owner.fulfilmentIntents** | marketing | marketing | marketing | Onboarding → default options |

### 1.17 What can be safely reused

| Asset | Reuse in Phase 5 |
|-------|------------------|
| `HandoverMode`, `PaymentTiming`, `CollectionStatus` enums | Keep; extend status set optionally |
| Order snapshot fields | Keep during transition; populate OrderFulfilment + dual-write |
| `checkout.ts` cart validation | Extend for fulfilment option compatibility |
| Collections make-list / print | Extend grouping keys to use FulfilmentOption |
| `nextCollectionAt()` | Replace with PickupWindow resolver for subscriptions |
| Deposit/balance pipeline | Unchanged — still keyed on `balanceDueAt` |
| `/s/*` routes | Unchanged URLs; internal context detection only |
| Stripe Billing / Connect | Untouched |

---

## 2. Future fulfilment model (recommended)

### 2.1 Design principles

1. **FulfilmentOption is the unit of seller configuration and buyer selection** — bundles method + schedule + location/zone + commercial rules.
2. **Farm stand = zero-config implicit option** — no PickupLocation setup required.
3. **Products declare eligibility**, not full schedules — inherit defaults; override only when needed.
4. **Orders snapshot everything** — mutable config must not rewrite history.
5. **Channels imply context**, not duplicate checkout — `/s/*` vs `/shop/*` vs pre-order page vs subscription.

### 2.2 Core entities (minimum set)

```
Owner
  ├── PickupLocation[]          (reusable places)
  ├── PickupWindow[]            (reusable time slots)
  ├── DeliveryZone[]            (geography + fees)
  ├── FulfilmentOption[]        (the sellable fulfilment choice)
  └── Stand[]
        └── standFulfilmentOption? (implicit STAND_IMMEDIATE — optional FK)

Product
  └── ProductFulfilmentOption[] (eligibility overrides)

PreOrderPage
  └── fulfilmentOptionId?       (replaces duplicated schedule fields over time)

SubscriptionOffer
  └── fulfilmentOptionId?       (replaces weekday + note over time)

Order
  └── OrderFulfilment (1:1)     (immutable snapshot + FK to source option)
```

**Not recommended for v1:** separate `FulfilmentMethod` table (use enum on FulfilmentOption), `DeliverySchedule` as distinct from PickupWindow (merge into window/option), full calendar recurrence engine, route optimisation.

### 2.3 FulfilmentOption types (enum)

```prisma
enum FulfilmentOptionKind {
  STAND_IMMEDIATE   // QR / honesty box — buy now, collect at stand
  PICKUP            // Scheduled pickup at PickupLocation + PickupWindow
  DELIVERY          // Local delivery via DeliveryZone
  PREORDER_SHEET    // Bound to PreOrderPage channel (legacy bridge)
  SUBSCRIPTION      // Bound to SubscriptionOffer cadence
}
```

One owner may have many options. Example:

| Option | Kind | Location | Window | Used on |
|--------|------|----------|--------|---------|
| “Farm gate QR” | STAND_IMMEDIATE | Stand.locationLabel | — | `/s/{slug}` |
| “Saturday Macclesfield” | PICKUP | PickupLocation | Sat 8–11am | `/shop`, pre-order page |
| “Adelaide Hills Sat” | PICKUP | Hills location | Sat 8–10am | `/shop` |
| “Norwood Sat” | PICKUP | Norwood market | Sat 12–2pm | `/shop` |
| “Local delivery” | DELIVERY | DeliveryZone | Tue PM window | `/shop` |

### 2.4 Entity responsibilities

| Entity | Owns |
|--------|------|
| **PickupLocation** | Name, type, public label, private address, instructions, geo (optional), active/sort |
| **PickupWindow** | Start/end (one-off or weekly), timezone, order open/close, capacity, fees, min order |
| **DeliveryZone** | Suburbs/postcodes, fee, free threshold, min order, delivery window + cutoff |
| **FulfilmentOption** | Kind, links to location/window/zone, channel visibility, commercial rules, active |
| **ProductFulfilmentOption** | Product eligible for option (junction) |
| **OrderFulfilment** | Snapshot of chosen option + resolved labels/times/fees/address policy at purchase |

---

## 3. Location architecture

### 3.1 PickupLocation (proposed)

```prisma
enum PickupLocationType {
  HOME
  FARM_STAND      // links to Stand when type is stand/gate
  FARM_GATE
  MARKET
  SHOP
  OTHER
}

model PickupLocation {
  id                    String   @id @default(cuid())
  ownerId               String
  owner                 Owner    @relation(...)
  standId               String?  // when FARM_STAND / gate — optional link to existing Stand
  type                  PickupLocationType
  name                  String   // "Macclesfield pickup", "Norwood Farmers Market"
  publicLabel           String   // "Macclesfield" — shown pre-purchase
  addressLine1          String?  // private — post-purchase only unless seller opts in
  suburb                String?
  stateTerritory        String?
  postcode              String?
  latitude              Float?
  longitude             Float?
  publicInstructions    String?  // "Look for the green esky"
  privateInstructions   String?  // gate code — post-order email only
  showFullAddressBeforePurchase Boolean @default(false)
  isActive              Boolean  @default(true)
  sortOrder             Int      @default(0)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  windows               PickupWindow[]
  fulfilmentOptions     FulfilmentOption[]

  @@index([ownerId, isActive, sortOrder])
}
```

### 3.2 Public vs post-order disclosure

| Stage | Show |
|-------|------|
| Storefront / shop browse | `publicLabel` + suburb/region only (e.g. “Pickup in Macclesfield”) |
| Checkout (before pay) | Same + window time; full address only if `showFullAddressBeforePurchase` |
| Order confirmation email | Full address (if COLLECT at location with address), `publicInstructions` + `privateInstructions` |
| Collections dashboard | Full operational detail for seller |

**Privacy default:** `showFullAddressBeforePurchase = false` for `HOME` type. Farm stand locations may show `Stand.locationLabel` only.

**Stand bridge:** Existing `Stand.locationLabel` remains for QR header. A `PickupLocation` with `standId` set can mirror stand name/suburb for unified Collections grouping without forcing farm-stand owners through location CRUD.

---

## 4. Pickup windows and scheduling

### 4.1 PickupWindow (proposed)

```prisma
enum PickupWindowRecurrence {
  ONE_OFF
  WEEKLY
}

model PickupWindow {
  id              String   @id @default(cuid())
  ownerId         String
  pickupLocationId String?
  pickupLocation  PickupLocation? @relation(...)
  label           String?  // "Saturday morning"
  timezone        String   // default Owner.defaultTimezone
  recurrence      PickupWindowRecurrence @default(WEEKLY)
  // ONE_OFF: absolute instants
  startsAt        DateTime?
  endsAt          DateTime?
  // WEEKLY: local wall-clock on weekday (0=Sun..6=Sat)
  weekday         Int?
  startTimeMin    Int?     // minutes from midnight, e.g. 480 = 8:00am
  endTimeMin      Int?     // e.g. 660 = 11:00am
  // Ordering window (relative to pickup)
  orderOpensAt    DateTime? // ONE_OFF absolute
  orderClosesAt   DateTime?
  orderOpenWeekday Int?    // WEEKLY: e.g. Mon 9am = weekday 1 + 540
  orderOpenTimeMin Int?
  orderCloseWeekday Int?   // e.g. Thu 6pm
  orderCloseTimeMin Int?
  maxOrders       Int?
  maxItems        Int?      // defer implementation — schema-ready only
  pickupFeeCents  Int      @default(0)
  minOrderCents   Int      @default(0)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  fulfilmentOptions FulfilmentOption[]

  @@index([ownerId, isActive])
}
```

### 4.2 Recurrence recommendation

**Use simple WEEKLY + ONE_OFF only for Phase 5 v1.** Do not ship RRULE/iCal.

- **WEEKLY:** “Every Saturday 8:00–11:00, orders close Thursday 6:00pm” — matches Jackos Buns example and existing subscription weekday model.
- **ONE_OFF:** “Saturday 12 September 9:00–12:00” — market/event pickup.

**Timezone:** Store on window; resolve using owner/stand timezone helpers already in codebase (`Stand.timezone`, `formatCollectionLabel` in `pre-order.ts`).

**Sold-out / full:** Compute from `maxOrders` vs count of non-cancelled orders with matching `OrderFulfilment.pickupWindowSnapshotId` for that window instance. Hide or disable option in checkout when full.

---

## 5. Ordering windows / cutoffs

### 5.1 Ownership of rules

| Rule type | Primary owner | Notes |
|-----------|---------------|-------|
| Orders open/close | **PickupWindow** (or DeliveryZone) | Single source of truth |
| Pickup/delivery instant | **PickupWindow** / **DeliveryZone** | |
| Payment timing (deposit) | **FulfilmentOption** or inherited from **PreOrderPage** legacy | Keep Product.page sync during transition |
| Stock capacity | **Product.stockQuantity** + optional window `maxOrders` | Product limits slots; window limits orders |
| Channel visibility | **FulfilmentOption.channels** | Which surfaces offer this option |

**Avoid duplicating** `orderByAt` / `collectionAt` on every Product once FulfilmentOption is wired. During migration:

- PreOrderPage saves → still sync products **and** update linked FulfilmentOption.
- Cart validation checks **resolved option** compatibility, not raw product timestamps.

### 5.2 Validation at cart time

Extend `loadStandCart` rules:

- Same `fulfilmentOptionId` (or compatible window/location) across lines
- Window still open (`orderClosesAt` not passed)
- Delivery address required when option kind = DELIVERY
- Take-now + scheduled pickup **cannot mix** (preserve today’s rule spirit)

---

## 6. Delivery architecture

### 6.1 DeliveryZone (proposed — v1 simplest)

```prisma
model DeliveryZone {
  id                 String   @id @default(cuid())
  ownerId            String
  name               String   // "Adelaide Metro"
  deliveryFeeCents   Int      @default(0)
  freeDeliveryMinCents Int?   // free delivery over this order subtotal
  minOrderCents      Int      @default(0)
  timezone           String
  // Delivery window — same shape as pickup (WEEKLY or ONE_OFF)
  recurrence         PickupWindowRecurrence @default(WEEKLY)
  weekday            Int?
  startTimeMin       Int?
  endTimeMin         Int?
  orderCloseWeekday  Int?
  orderCloseTimeMin  Int?
  customerInstructions String?
  isActive           Boolean  @default(true)
  sortOrder          Int      @default(0)
  rules              DeliveryZoneRule[]
  fulfilmentOptions  FulfilmentOption[]
  @@index([ownerId, isActive])
}

model DeliveryZoneRule {
  id             String @id @default(cuid())
  deliveryZoneId String
  kind           DeliveryZoneRuleKind // POSTCODE | SUBURB
  value          String   // "5153" or "Macclesfield" — normalised uppercase
  @@unique([deliveryZoneId, kind, value])
}
```

### 6.2 Phase 5 v1 delivery scope

**Ship:** postcode list + suburb list matching (AU-first), flat fee, min order, free threshold, weekly delivery window + order cutoff.

**Defer:** radius, polygons, multi-fee tiers, route optimisation.

**Checkout:** Customer enters suburb + postcode → validate against zone rules → show fee in cart total → capture address lines + delivery notes (existing Order fields).

---

## 7. Product fulfilment eligibility

### 7.1 Default inheritance (recommended)

| Seller type | Default eligibility |
|-------------|---------------------|
| Farm stand only | STAND_IMMEDIATE for all products on that stand |
| Food business + pickup options | All active products eligible for owner’s default PICKUP option(s) on ONLINE channel |
| Mixed | STAND_IMMEDIATE on STAND channel; PICKUP/DELIVERY on ONLINE |

Use **ProductChannel** (Phase 3) to intersect: a product on ONLINE channel inherits owner default fulfilment options unless restricted.

### 7.2 ProductFulfilmentOption (junction)

```prisma
model ProductFulfilmentOption {
  id                 String @id @default(cuid())
  productId          String
  fulfilmentOptionId String
  isEnabled          Boolean @default(true)
  @@unique([productId, fulfilmentOptionId])
}
```

**Override examples:**

- Wedding cake: enable pickup option only (`DELIVERY` disabled via missing junction row)
- Firewood: stand + delivery, no scheduled pickup

**UI default:** “Available for all fulfilment methods” toggle on product editor; advanced panel for exclusions.

---

## 8. Cart and checkout behaviour (context-aware)

### 8.1 Context matrix

| Entry point | Implied fulfilment | Buyer steps |
|-------------|-------------------|-------------|
| `/s/{standSlug}` (take-now) | **STAND_IMMEDIATE** | None — scan, add, pay, take |
| `/s/{standSlug}` (pre-order product) | Option from product/page schedule | Contact (+ address if DELIVER) |
| `/s/{standSlug}/pre/{pageSlug}` | Option linked to PreOrderPage | Same |
| `/s/{standSlug}/sub/{offerSlug}` | Option linked to SubscriptionOffer | Enroll + address if DELIVER |
| `/shop/{slug}` | **Customer chooses** eligible PICKUP/DELIVERY | Select option → then cart/checkout |
| `/shop/{slug}/product/...` | Inherited from shop session selection | Prompt if none selected |

### 8.2 Proposed shop flow (Phase 5D+)

1. Customer browses `/shop/{slug}`
2. If multiple fulfilment options exist, **banner or checkout step**: “How would you like to receive your order?”
3. Selection stored in **session cookie** `vendl_fulfilment_option={id}` (alongside existing `vendl_shop_slug`)
4. Cart validates products against selected option
5. Checkout reuses **`/s/{standSlug}/cart`** with option context — **no duplicate payment logic**

### 8.3 Farm stand preservation

`/s/{standSlug}` **never shows fulfilment picker** when cart is take-now only. Pre-order products on stand catalog continue to use merchant-configured schedule until migrated to options.

---

## 9. Order fulfilment snapshot

### 9.1 OrderFulfilment (proposed 1:1)

```prisma
model OrderFulfilment {
  id                      String   @id @default(cuid())
  orderId                 String   @unique
  order                   Order    @relation(...)
  fulfilmentOptionId      String?  // FK — null for legacy orders
  kind                    FulfilmentOptionKind
  // Snapshot labels
  optionLabel             String   // "Saturday pickup — Macclesfield"
  pickupLocationName      String?
  pickupPublicLabel       String?
  pickupAddressSnapshot   String?  // full address at time of order
  pickupInstructions      String?
  pickupPrivateInstructions String?
  windowLabel             String?  // "Sat 8:00am – 11:00am"
  collectionStartsAt      DateTime?
  collectionEndsAt        DateTime?
  deliveryZoneName        String?
  deliveryFeeCents        Int      @default(0)
  handoverMode            HandoverMode
  // Operational
  fulfilmentStatus        FulfilmentStatus @default(NEW)
  sellerNotes             String?
  createdAt               DateTime @default(now())
}
```

### 9.2 Dual-write transition

During migration, checkout **writes both**:

- Legacy `Order.collectionAt`, `handoverMode`, etc. (existing readers keep working)
- New `OrderFulfilment` row (new readers prefer this)

Collections dashboard migrates to group by `OrderFulfilment.collectionStartsAt` + `pickupLocationName` when present; fallback to legacy Order fields.

**Historic orders:** untouched — no backfill required for display accuracy (legacy fields already snapshot).

---

## 10. Seller order workflow

### 10.1 FulfilmentStatus (proposed — context-aware)

```prisma
enum FulfilmentStatus {
  NEW
  PREPARING
  READY
  COLLECTED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}
```

| Context | Status subset shown |
|---------|---------------------|
| STAND_IMMEDIATE take-now | **None** or simple “Completed” — no Collections noise |
| Scheduled pickup | NEW → PREPARING → READY → COLLECTED |
| Delivery | NEW → PREPARING → OUT_FOR_DELIVERY → DELIVERED |
| Pre-order deposit | Block READY/COLLECTED until paid (preserve today’s gating) |

**Map legacy `CollectionStatus`:** ORDERED≈NEW/PREPARING, READY≈READY, COLLECTED≈COLLECTED. Dual-read during transition.

### 10.2 Dashboard filters (Orders + Collections)

- Fulfilment type (stand / pickup / delivery)
- Pickup location
- Date / window
- Status
- Payment status (existing)

Farm-stand-only owners: Orders list unchanged; Collections stays empty unless they run pre-orders.

---

## 11. Production / fulfilment views

Phase 5 **extends Collections**, not a new recipe system.

### 11.1 Saturday Pickup view (example)

Group key: `{pickupLocationId, windowInstanceDate}`

For each group show:

- Option label + window time
- Order count
- **Production totals** — aggregate `OrderItem` quantities by `productNameSnapshot` (already partially in `dayMakeListMeta` / `build-print-payload.ts`)
- **Customer pickup list** — name, item count, payment status, fulfilment status

### 11.2 Delivery view

Group by `{deliveryZoneId, deliveryDate}` + suburb breakdown (existing suburb aggregation in `group-collections.ts`).

### 11.3 Explicitly out of scope

Recipe scaling, ingredient costing, bake planning — Phase 6+ if ever.

---

## 12. Preorder integration

### 12.1 Current behaviour (preserve)

- URLs: `/s/{standSlug}/pre/{pageSlug}` unchanged
- PreOrderPage schedule syncs to products on save
- Card-only checkout; Collections grouping

### 12.2 Additive migration

1. Add `PreOrderPage.fulfilmentOptionId` (optional)
2. On page create/update: upsert a `FulfilmentOption` kind `PREORDER_SHEET` linked to `PickupWindow` derived from page schedule
3. **Dual-write:** continue syncing Product fields from option for compatibility
4. Cart reads resolved option; legacy product `collectionAt` still valid
5. When `fulfilmentOptionId` set, dashboard pre-order editor shows linked PickupLocation/Window UI (progressive enhancement)

**Rollback:** Clear `fulfilmentOptionId`; legacy fields still drive behaviour.

---

## 13. Subscription integration

### 13.1 Current behaviour (preserve)

- Stripe Connect Billing unchanged
- `fulfill-shopper-subscription.ts` creates cycle orders
- `collectionWeekday` + `nextCollectionAt()` drives dates

### 13.2 Additive migration

1. Add `SubscriptionOffer.fulfilmentOptionId` (optional)
2. Option kind `SUBSCRIPTION` links to recurring **PickupWindow** (weekly) or **DeliveryZone**
3. `nextCollectionAt()` becomes wrapper around window resolver
4. ShopperSubscription keeps delivery address fields; snapshot onto each cycle `OrderFulfilment`

**Do not** change Stripe price IDs, webhook handlers’ billing logic — only the fulfilment date/location source.

---

## 14. Farm Stand compatibility

### 14.1 Zero-friction path (mandatory)

| Step | Today | Phase 5 |
|------|-------|---------|
| Create stand | ✓ | ✓ unchanged |
| Add products | ✓ | ✓ default STAND_IMMEDIATE eligibility |
| Print QR | ✓ | ✓ unchanged |
| Customer scan → pay | ✓ | ✓ no fulfilment picker |
| Inventory decrement | ✓ | ✓ unchanged |
| Owner alert | ✓ | ✓ unchanged |
| View order | Orders dashboard | ✓ unchanged |

**No requirement** to create PickupLocation, DeliveryZone, or FulfilmentOption manually. System auto-provisions:

```text
FulfilmentOption { kind: STAND_IMMEDIATE, standId, channels: [STAND] }
```

### 14.2 When farm stand owners opt in

BOTH-mode owners can add Saturday pickup options for `/shop` without affecting QR immediacy.

---

## 15. Food Business UX & navigation

### 15.1 Language

| Internal | Customer-facing (Food Business) |
|----------|--------------------------------|
| Stand | Shop / Location (existing `primaryLocationLabel`) |
| Fulfilment | Fulfilment |
| PreOrderPage | Pre-orders |
| Collections | Collections / Pickup day |

### 15.2 Recommended nav (minimal change to Phase 1 shell)

Replace `Fulfilment (soon)` under **Operate** with live hub:

```
OPERATE
  Fulfilment          → /dashboard/fulfilment        (overview + links)
  Pickup locations    → /dashboard/fulfilment/locations
  Pickup schedules    → /dashboard/fulfilment/pickup
  Delivery zones      → /dashboard/fulfilment/delivery
  {Locations label}   → /dashboard/businesses        (existing — farm stands)
  Notifications
```

**Keep under Sell:** Pre-orders, Subscriptions, **Collections** (operational view — don’t hide).

Alternative (fewer entries): single **Fulfilment** hub with tabs (Locations | Pickup | Delivery) — **recommended** to avoid nav sprawl.

Farm stand-only owners: Fulfilment hub shows educational empty state (“You sell on-site via QR — add pickup schedules when you’re ready”) with no forced setup.

---

## 16. Suggested schema (proposed — NOT implemented)

### 16.1 New models

See sections 3, 4, 6, 7, 9 for `PickupLocation`, `PickupWindow`, `DeliveryZone`, `DeliveryZoneRule`, `FulfilmentOption`, `ProductFulfilmentOption`, `OrderFulfilment`.

```prisma
model FulfilmentOption {
  id                String   @id @default(cuid())
  ownerId           String
  kind              FulfilmentOptionKind
  label             String
  standId           String?  // STAND_IMMEDIATE
  pickupLocationId  String?
  pickupWindowId    String?
  deliveryZoneId    String?
  preOrderPageId    String?  @unique // PREORDER_SHEET bridge
  subscriptionOfferId String? @unique // SUBSCRIPTION bridge
  handoverMode      HandoverMode @default(COLLECT)
  paymentTiming     PaymentTiming @default(PAY_NOW)
  depositPercent    Int?
  minOrderCents     Int      @default(0)
  feeCents          Int      @default(0)
  channels          ProductChannelType[] // STAND, ONLINE, ...
  isActive          Boolean  @default(true)
  sortOrder         Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  products          ProductFulfilmentOption[]
  orders            OrderFulfilment[]

  @@index([ownerId, isActive, sortOrder])
}
```

### 16.2 Existing models — changed (transitional)

| Model | Change | Deprecation |
|-------|--------|-------------|
| `PreOrderPage` | `+ fulfilmentOptionId String?` | `orderByAt`, `collectionAt`, … remain until 5H complete |
| `SubscriptionOffer` | `+ fulfilmentOptionId String?` | `collectionWeekday` legacy fallback |
| `Product` | keep schedule fields | deprecate after pre-order migration |
| `Order` | keep all fulfilment fields | deprecate in favour of OrderFulfilment long-term |
| `Owner` | `fulfilmentIntents` unchanged | marketing only |

### 16.3 Indexes

- `OrderFulfilment(collectionStartsAt, fulfilmentStatus)`
- `FulfilmentOption(ownerId, kind, isActive)`
- `DeliveryZoneRule(deliveryZoneId, kind, value)`

### 16.4 Delete behaviour

- Owner cascade deletes locations/zones/options
- PickupLocation delete → soft-disable options; **never delete OrderFulfilment snapshots**
- FulfilmentOption delete blocked if referenced by active PreOrderPage; archive pattern preferred

---

## 17. Migration strategy

### 17.1 Principles

- **Additive only** — no rewriting historic orders
- **Dual-read, dual-write** during transition
- **Compatibility layer** in `src/lib/fulfilment/` (new) mirroring Phase 3 catalogue pattern

### 17.2 Backfill sequence

| Step | Action | Risk |
|------|--------|------|
| M1 | Create new tables + enums | Low |
| M2 | For each Stand, create `STAND_IMMEDIATE` FulfilmentOption | Low |
| M3 | For each PreOrderPage, create linked PICKUP option + window from `collectionAt`/`orderByAt` | Medium — verify timezone |
| M4 | For each SubscriptionOffer with weekday, create weekly PickupWindow + option | Medium |
| M5 | Default ProductFulfilmentOption for all products → owner default pickup + stand immediate | Low |
| M6 | Enable dual-write on new checkouts | Medium |
| M7 | Migrate Collections grouping to OrderFulfilment | Medium |
| M8 | Shop checkout selection (ONLINE) | Medium |
| M9 | Deprecate direct Product schedule edits (UI hides legacy fields) | Low |

### 17.3 Legacy data handling

| Data | Convert | Leave untouched |
|------|---------|-----------------|
| Historic Orders | — | ✓ legacy fields |
| Active PreOrderPages | → FulfilmentOption | URLs unchanged |
| Products with isPreOrder | junction rows + keep fields synced | — |
| SubscriptionOffers | → FulfilmentOption | Stripe IDs unchanged |
| Collections grouping | read new, fallback old | — |
| Owner.fulfilmentIntents | — | marketing |

### 17.4 Rollback strategy

- Feature flag `FULFILMENT_OPTIONS_ENABLED` per owner or env
- Rollback = disable flag; checkout uses legacy Product/PreOrderPage fields only
- OrderFulfilment rows harmless if unused

### 17.5 Deprecation timeline (suggested)

1. **Phase 5 ship:** dual-write begins
2. **+30 days:** Collections prefers OrderFulfilment
3. **+60 days:** Product schedule fields read-only in UI for new sellers
4. **+90 days:** evaluate removing Product `collectionAt` writes (not before all pre-order pages migrated)

---

## 18. Phase 5 implementation slices

| Slice | User value | Schema | Key files | Migration risk | Regression risk | Tests |
|-------|------------|--------|-----------|----------------|-----------------|-------|
| **5A — Foundation** | Internal structure | Enums + empty tables + `src/lib/fulfilment/*` loaders | `prisma/schema.prisma`, new lib | Low | None if unread | Unit: option resolver |
| **5B — Pickup locations** | Sellers define places | `PickupLocation` | `/dashboard/fulfilment/locations/*` | Low | None | CRUD, privacy labels |
| **5C — Pickup windows** | Schedules + cutoffs | `PickupWindow` | `/dashboard/fulfilment/pickup/*` | Medium (TZ) | Low | Weekly + one-off resolution |
| **5D — FulfilmentOption CRUD** | Bundle location+window | `FulfilmentOption` | fulfilment hub UI | Medium | Low | Option listing per owner |
| **5E — OrderFulfilment snapshot** | Accurate history | `OrderFulfilment` | `digital-checkout-actions.ts`, `fulfill-paid-order.ts` | Medium | **High** checkout | Order create snapshots |
| **5F — Collections views** | Saturday pickup lists | — | `collections/*` | Low | Medium | Grouping, make-list totals |
| **5G — Delivery zones** | Local delivery | `DeliveryZone`, rules | `/dashboard/fulfilment/delivery/*`, cart validation | Medium | Medium | Postcode/suburb match |
| **5H — Pre-order bridge** | Stop duplicate schedules | `PreOrderPage.fulfilmentOptionId` | `pre-order-pages/actions.ts` | **High** | **High** pre-orders | Page checkout E2E |
| **5I — Subscription bridge** | Recurring pickup/delivery | `SubscriptionOffer.fulfilmentOptionId` | `fulfill-shopper-subscription.ts` | **High** | **High** billing | Cycle order dates |
| **5J — Shop selection** | Food business checkout | — | `/shop/*`, cart cookie | Medium | Medium | Shop → cart → pay |
| **5K — Product eligibility UI** | Per-product control | `ProductFulfilmentOption` | product editor | Low | Low | Eligibility defaults |
| **5L — Regression & cleanup decision** | Confidence | — | docs, flags | Low | — | Full matrix below |

**Recommended sequence:** 5A → 5B → 5C → 5D → 5E → 5F → 5G → 5H → 5I → 5J → 5K → 5L

Do **5E (snapshots)** before changing Collections grouping. Do **5H/5I** before removing legacy schedule UI.

---

## 19. Regression matrix

| Area | Risk | Mitigation |
|------|------|------------|
| `/s/*` QR take-now | **Critical** | STAND_IMMEDIATE implicit; no picker; smoke test every slice |
| Public stand catalog | High | Channel STAND unchanged |
| `/shop/*` storefront | Medium | Shop selection optional until 5J; cookie compat |
| Categories / PDP | Low | No product schema break |
| Cart mix rules | High | Extend, don’t replace, `checkout.ts` tests |
| Stripe card checkout | **Critical** | Dual-write only; no fee logic changes |
| PayPal WIP | — | **Do not touch** |
| Cash / local transfer | High | Still blocked for pre-orders |
| Orders dashboard | Low | Additive filters |
| Order notifications | Medium | Emails must read snapshot labels |
| Inventory decrement | **Critical** | Same triggers |
| Deposits / balance cron | **Critical** | `balanceDueAt` still set from window end |
| Pre-order pages | **Critical** | Dual-write schedule fields |
| Pre-order collection UI | High | Collections fallback grouping |
| Subscriptions enroll | High | Stripe flow untouched |
| Subscription billing cycles | **Critical** | `invoice.paid` handler parity |
| CRM customer linking | Low | Unaffected |
| Storefront shop cookie | Low | Orthogonal to fulfilment cookie |
| Free 2.5% / Pro fee waiver | **Critical** | No `stallside-fee.ts` changes |
| Mobile dashboard | Medium | Collections tab on Capacitor |
| Capacitor push alerts | Low | Sale notify unchanged |
| Farm stand owner | **Critical** | Zero-config path |
| Food business owner | Medium | New fulfilment hub |
| Both owner | Medium | Stand + pickup coexist |
| Migrated seller (storefront) | Low | Shop flow additive |
| Historic orders display | Low | Never migrate old rows |

---

## 20. Decisions required before Phase 5 implementation

### DECISION 1 — Delivery geography v1

**Issue:** How do customers qualify for local delivery?

| Option | Pros | Cons |
|--------|------|------|
| A. Postcode list only | Simple, precise | Sellers must maintain lists |
| B. Suburb list only | Easy for sellers | Ambiguous postcodes |
| C. Postcode + suburb (recommended) | Flexible; match either | Slightly more UI |
| D. Radius from point | Modern UX | Complex, error-prone rural AU |

**Recommendation:** **C — postcode + suburb lists** per DeliveryZone. Matches existing `deliverySuburb` on orders and Collections suburb grouping.

---

### DECISION 2 — Pickup window recurrence

**Issue:** How expressive should recurring pickup be?

| Option | Pros | Cons |
|--------|------|------|
| A. ONE_OFF + WEEKLY weekday/time (recommended) | Covers 95% of sellers; matches subscription weekday | Fortnightly needs second window or ONE_OFF series |
| B. Full RRULE | Maximum flexibility | Over-engineering, harder UI |
| C. Calendar-only manual windows | Simple mental model | Tedious for “every Saturday” |

**Recommendation:** **A** with WEEKLY + ONE_OFF. Fortnightly subscriptions continue interval logic on top of weekday window (existing `FORTNIGHTLY` pattern).

---

### DECISION 3 — When customer chooses fulfilment (shop)

**Issue:** At what point does `/shop` customer pick pickup vs delivery?

| Option | Pros | Cons |
|--------|------|------|
| A. Before browsing (recommended for multi-option) | Filters products early | Extra step |
| B. At checkout only | Faster browse | Cart rebuild if incompatible |
| C. Per product | Maximum flexibility | Complex UX |

**Recommendation:** **A** — lightweight modal/banner on first shop visit when >1 option exists; store in session cookie; filter eligible products. **B** as fallback for single-option shops.

---

### DECISION 4 — Pickup capacity model v1

**Issue:** What does `maxOrders` / capacity mean?

| Option | Pros | Cons |
|--------|------|------|
| A. Order count only (recommended v1) | Simple | Doesn’t cap total loaves |
| B. Item quantity sum | Better for bakers | Needs line-item math |
| C. No capacity v1 | Simplest ship | Risk over-selling busy windows |

**Recommendation:** **A** — `maxOrders` per window instance. Schema includes `maxItems` nullable for Phase 5.1 if needed.

---

### DECISION 5 — Fulfilment status vs CollectionStatus

**Issue:** Replace or extend existing enum?

| Option | Pros | Cons |
|--------|------|------|
| A. New FulfilmentStatus on OrderFulfilment; map CollectionStatus (recommended) | Context-aware; delivery statuses | Dual enum period |
| B. Extend CollectionStatus | Single enum | Awkward for delivery / stand |
| C. Keep CollectionStatus only | No migration | Poor delivery UX |

**Recommendation:** **A** — new status on `OrderFulfilment`; Collections UI maps both during transition.

---

### DECISION 6 — PreOrderPage migration cutover

**Issue:** When do new pre-order pages use FulfilmentOption exclusively?

| Option | Pros | Cons |
|--------|------|------|
| A. New pages dual-write; old pages lazy backfill (recommended) | Safe | Temporary duplication |
| B. Big-bang backfill all pages at deploy | Clean cut | Risky |
| C. Forever dual fields | Safe | Permanent debt |

**Recommendation:** **A** — backfill script + dual-write on save; legacy fields read as fallback until 5L sign-off.

---

### DECISION 7 — Multi-location same-day pickup UI

**Issue:** Jackos Buns vs multi-location Saturday — one Collections view or many?

| Option | Pros | Cons |
|--------|------|------|
| A. Group by location then window (recommended) | Matches operational reality | UI work |
| B. Single combined list | Simpler | Confusing for multi-location |
| C. Separate page per location | Clear | Nav clutter |

**Recommendation:** **A** — extend Collections with location tabs/filters.

---

## Appendix A — Compatibility layer sketch

```text
src/lib/fulfilment/
  types.ts
  resolve-option.ts      // from product, page, stand context
  resolve-window.ts      // next open window instance
  validate-cart.ts       // extend checkout rules
  snapshot-order.ts      // build OrderFulfilment from selection
  legacy-read.ts         // Order → display DTO from old or new fields
  defaults.ts            // auto-provision STAND_IMMEDIATE
```

---

## Appendix B — Files expected to change (implementation reference)

| Area | Files |
|------|-------|
| Schema | `prisma/schema.prisma` |
| Checkout | `digital-checkout-actions.ts`, `actions.ts`, `checkout.ts`, `StandCartCheckout.tsx` |
| Pre-orders | `pre-order-pages/actions.ts`, `pre-order.ts` |
| Subscriptions | `fulfill-shopper-subscription.ts`, `subscription-offer.ts`, `enroll-actions.ts` |
| Collections | `load-collections.ts`, `group-collection-pages.ts`, `CollectionDaySection.tsx` |
| Shop | `src/app/shop/*`, `shop-origin.ts` (extend) |
| Dashboard | new `/dashboard/fulfilment/*`, nav in `dash-nav-links.ts` |
| Notifications | `notify-order-customer.ts` (read snapshot) |

---

**End of planning document.**  
**Path:** `VENDL-NEXT-PHASE-5-FULFILMENT-ARCHITECTURE.md`  
**Do not implement Phase 5 until architecture is approved.**
