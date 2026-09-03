# Vendl Phase 8 — Advanced Operations

## Status

**Complete locally.** Not committed / pushed / deployed. Phase 9 not started.

Brief: `VENDL-NEXT-PHASE-8-ADVANCED-OPERATIONS.md`

---

## Architecture

```
Paid Order (+ OrderFulfilment)
  → Ops board (/dashboard/fulfilment/orders)
  → Pack (OrderItem.packedAt) → Ready → Hand over / Deliver
  → Print packing sheets + Avery labels (+ QR → /dashboard/ops/lookup/[token])
  → Custom forms (/f/[formId] → request → cash convert)
  → SellerEvent quick sale → Order (createCashSaleOrder, single stock decrement)
```

Production (Phase 6) stays make-totals; board answers per-customer packing. Linked via Production → Pack orders.

## Operational status

Source of truth: `OrderFulfilment.fulfilmentStatus`.

Dual-write to legacy `Order.collectionStatus` (Collections + board stay in sync):

| Seller label | FulfilmentStatus | CollectionStatus |
|--------------|------------------|------------------|
| To prepare | NEW | ORDERED |
| Preparing | PREPARING | ORDERED |
| Ready | READY | READY |
| Collected | COLLECTED | COLLECTED |
| Out for delivery | OUT_FOR_DELIVERY | READY |
| Delivered | DELIVERED | COLLECTED |
| Cancelled | CANCELLED | — |

Payment status unchanged. Cancelled/refunded/failed/expired excluded from board.

## Packing

- Item checkoff: `OrderItem.packedAt` (qty untouched)
- Progress: N/M items; board shows packed-order counts
- Sheets: `/dashboard/fulfilment/orders/print/packing`
- Labels: Avery + privacy (no email/phone; address only on delivery)
- QR: opaque `opsLookupToken` → authenticated seller lookup

## Pickup / delivery

- Collect: Ready → Collected
- Deliver: Ready → Out for delivery → Delivered
- Delivery run sheet: `/dashboard/fulfilment/orders/print/delivery`
- Ready email: optional on order detail (`OpsNotifyReadyButton`); Collections bulk email still available

## Custom orders

- Forms + fields; public `/f/[formId]` (published only, honeypot)
- Request review → accept/decline → cash convert via `createCashSaleOrder`
- No quote/card/deposit redesign

## Markets / events

- SellerEvent + soft `allocatedQty` (not stock reservation)
- LIVE quick sale → cash Order + `sellerEventId` + soldQty++
- Close-out summary on event detail
- Inventory: one decrement via existing checkout stock helper

## Schema / migration

Migration: `20260901220000_phase8_operations` (**applied locally**)

- `OrderItem.packedAt`
- `Order.opsLookupToken`, `sellerEventId`, `customOrderRequestId`
- CustomOrderForm / Field / Request
- SellerEvent / SellerEventProduct

## Free / Pro

No new hard gates. Recommend later: Free board/pack/pickup; Pro advanced labels/forms/events.

## Deferred

Route optimisation, couriers, card-present POS, full offline, staff rostering, accounting, Phase 9 domains, custom-order card/deposits, owner-slug public form URLs, PayPal WIP, gift-card checkout redeem.

## Tests

`npm run test:ops` — status transitions / dual-write / handover helpers.

---

# Phase 8 completion report (§78)

### 1. Files changed (Phase 8–relevant)

**Libs:** `src/lib/ops/{status,enums,board,cash-sale,ops.test}.ts`

**Board:** `src/app/dashboard/(gated)/fulfilment/orders/**`

**Operate / forms / events / lookup:** `operate/`, `forms/`, `events/`, `ops/lookup/`, public `src/app/f/[formId]/`

**Wiring:** `collections/actions.ts` dual-write; `production/page.tsx` Pack orders link; `dash-nav-links.ts`; `package.json` `test:ops`

**Docs:** `VENDL-NEXT-PHASE-8-ADVANCED-OPERATIONS.md`, `VENDL-PHASE-8-ADVANCED-OPERATIONS.md`

**Migration:** `prisma/migrations/20260901220000_phase8_operations/`

### 2–3. Schema / migration

See above. Applied locally; not committed/pushed.

### 4. Fulfilment board

`/dashboard/fulfilment/orders` — today/tomorrow/upcoming/ready/completed/all, search, bulk status, print links.

### 5. Operational status architecture

`setOrdersOpsStatus` + `canTransitionOps`; Collections advances dual-write fulfilmentStatus.

### 6–8. Packing / sheets / labels

Item checkoffs, packing sheets, Avery labels + optional QR, privacy rules.

### 9–11. Pickup / ready notify / delivery

Handover transitions; optional ready email; delivery run sheet.

### 12–14. Custom orders / convert / deposits

Forms + convert to cash Order. Card/deposit quote path **not** built (payment redesign stop).

### 15–17. Markets / quick sale / inventory

Events + cash quick sale; single stock decrement; soft allocation only.

### 18–19. Mobile / Capacitor

Dashboard HTML/CSS; no new native plugins. Print/CSS uses existing print patterns.

### 20. Security / tenancy

Owner-scoped queries/actions; bulk rejects foreign IDs; opaque lookup tokens; published-only public forms.

### 21–24. Tests / regression / tsc / build

| Check | Result |
|--------|--------|
| `test:ops` | 5/5 pass |
| `test:grow` | 6/6 pass |
| `test:production` | 14/14 pass |
| `test:tenancy` | 14/14 pass |
| `tsc --noEmit` | clean |
| `npm run build` | success |

### 25. Deferred

See Deferred + brief §67 list.

### 26. Deviations

- Custom convert = cash sale only (no payment redesign).
- Public form URL `/f/[formId]` not pretty owner slug.
- Ready notify is opt-in button (not auto-spam on every READY).
- Client-safe `enums.ts` avoids Prisma in browser bundles.
- Collections still valuable for pre-order day grouping; board is the general ops lane.

### 27. Git status

Uncommitted local work only. **Do not commit / push / merge / deploy.** Phase 9 not started.
