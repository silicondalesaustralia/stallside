# Vendl Phase 7 — Growth & Customer Retention

## Status

**Complete locally.** Not committed / pushed / deployed. Phase 8 not started.

Brief: `VENDL-NEXT-PHASE-7-GROWTH-CUSTOMER-RETENTION.md`

---

## Architecture

```
Customer (+ tags, consent)
  → Segments (dynamic JSON rules)
  → Promotion / Campaign
  → Click token (/c/{token}) → Order attribution
  → Loyalty ledger / Reviews / Gift cards (issue)
```

## Schema

Migration: `20260901210000_phase7_growth` (**applied locally** via `prisma migrate deploy`)

Models: `CustomerTag`, `CustomerTagLink`, `CustomerSegment`, `Promotion`, `MarketingSuppression`, `Campaign`, `CampaignRecipient`, `CampaignClick`, `LoyaltyProgram`, `LoyaltyAccount`, `LoyaltyTransaction`, `Review`, `GiftCard`, `GiftCardTransaction`.

Order fields: `promotionId`, `promotionCodeSnapshot`, `campaignId`.

Enums: `PromotionType`, `CampaignStatus`, `CampaignRecipientStatus`, `ReviewStatus`, `LoyaltyTxnType`, `GiftCardTxnType`.

## Consent

- `Customer.marketingConsent` (existing) — not inferred from purchase
- `MarketingSuppression` + signed unsubscribe `/unsubscribe/marketing?t=…`
- Campaigns skip suppressed + require consent
- Restock remains separate transactional opt-in
- Unsub tokens use JSON+HMAC (emails contain `.`)

## Campaigns

- Audience: segment | all_marketing | product | menu
- Queue recipients → status `SENDING` → cron `/api/cron/campaigns` every 5m (batch 40, max ~500/run)
- Click tracking `/c/{token}` sets httpOnly cookie `vendl_campaign`
- Attribution window 14 days; updates Order.campaignId + campaign revenue counters

## Promotions

- Codes at checkout (promo XOR first-order when coupon present)
- Snapshot on Order; usage incremented after paid/confirmed
- Wired on cash/local + Stripe digital checkout; PayPal path only touched if needed for compile/parity (minimal)

## Gift cards

**Issuance + ledger only.** Checkout redemption deferred (payment-sensitive across Stripe/cash/PayPal). Constant: `GIFT_CARD_CHECKOUT_REDEMPTION_DEFERRED`.

## Loyalty

Optional program; points earned once per order (`ORDER_EARN` unique). Redeem creates a one-time `Promotion` FIXED_OFF code.

## Reviews

Verified token `/review/{token}`; moderation PENDING → APPROVED/REJECTED. Public product display: APPROVED only (`ProductApprovedReviews` on storefront product page).

## Free / Pro

No new hard gates. Restock send UI remains Pro-gated as before. Recommendation: keep CRM/coupons/basic campaigns on Free; consider Pro caps later for volume.

## Dashboard

`/dashboard/grow` hub; Segments, Coupons, Campaigns, Loyalty, Gift cards, Reviews. Menu **Tell customers** → campaign composer. Nav Grow section live (Forms still soon).

## Tests

`npm run test:grow` — promotions, segment presets, unsub tokens, gift codes (pure modules; no prisma in unit tests).

## Deferred

- Gift card checkout redemption
- SMS / customer push
- Drag-drop email builder / automation journeys
- Forms builder
- Abandoned cart
- Full customer activity event-sourcing timeline (detail has insights + orders + tags)
- Phase 8 custom domains

---

# Phase 7 completion report (§68)

### 1. Files changed (Phase 7–relevant)

**New**
- `src/lib/grow/*` (segments, promotions, campaigns, consent, loyalty, reviews, gift cards, tests, pure helpers)
- Dashboard: `grow/`, `campaigns/`, `coupons/`, `customers/segments/`, `loyalty/`, `gift-cards/`, `reviews/`, `customers/tag-actions.ts`
- Public: `src/app/c/[token]/`, `src/app/unsubscribe/marketing/`, `src/app/review/[token]/`
- Cron: `src/app/api/cron/campaigns/`
- `src/components/storefront/ProductApprovedReviews.tsx`
- Docs: `VENDL-NEXT-PHASE-7-GROWTH-CUSTOMER-RETENTION.md`, `VENDL-PHASE-7-GROWTH-CUSTOMER-RETENTION.md`
- Migration: `prisma/migrations/20260901210000_phase7_growth/`

**Modified (wiring)**
- `prisma/schema.prisma`, `vercel.json`, `src/components/dash-nav-links.ts`
- Checkout: `src/lib/checkout.ts`, `StandCartCheckout`, `CheckoutPayStep`, cash `actions.ts`, `digital-checkout-actions.ts`, `fulfill-paid-order.ts`
- CRM: `customers/[customerId]/page.tsx`, menus Tell customers link
- Storefront product page: approved reviews

*(Repo also has unrelated WIP: PayPal, Phase 4C/6, etc. — left alone.)*

### 2. Schema changes

Additive models/enums listed above + Order attribution/promo snapshot fields.

### 3. Migration name/status

`20260901210000_phase7_growth` — **deployed locally**. Not committed/pushed.

### 4. Customer CRM changes

Tags (add/remove), marketing consent display, spend/order/AOV/last-order insights, product names bought. Orders list retained.

### 5. Segmentation

Dynamic JSON rules + presets (best/new/repeat/lapsed/subscribers/restock). Dashboard create + list. Resolve at campaign send time.

### 6. Promotions/coupons

Seller codes; percent/fixed/free-delivery types; checkout field; XOR with first-order discount; order snapshots; usage increment on fulfill.

### 7. Campaign functionality

Compose, templates (incl. menu), segment audience, test send, queue + cron batch send, metrics (sent/clicks/orders/revenue).

### 8. Consent/unsubscribe

Existing marketingConsent + MarketingSuppression + signed `/unsubscribe/marketing`. Restock unsubscribe unchanged.

### 9. Campaign attribution

Click cookie → order `campaignId` within 14 days → campaign counters.

### 10. Repeat-order/restock

Grow hub shows restock waiting count + repeat rate. Existing restock email path reused; restock segment preset. No new SMS.

### 11. Loyalty

Program on/off, earn on paid order (idempotent), redeem → one-time coupon.

### 12. Reviews

Invite token, submit, moderate in dashboard, public APPROVED on product page.

### 13. Gift cards

Issue + balance ledger only. Checkout redeem **deferred**.

### 14. Growth dashboard/reporting

`/dashboard/grow` metrics + recent campaigns with attributed revenue.

### 15. Free/Pro gating

No new hard Growth locks. Restock Pro gate unchanged.

### 16. Email delivery architecture

Campaign emails via existing mail stack; seller identity in body; unsubscribe link; cron batching with CRON_SECRET. No new ESP.

### 17. Security/tenancy

All grow models owner-scoped; dashboard actions use `requireOwner`; unsub/review tokens are high-entropy / HMAC; click tokens non-sequential; cron bearer auth in production.

### 18. Tests added/results

`npm run test:grow` — **6/6 pass**

### 19. Regression results

`npm run test:production` — **14/14 pass**  
`npm run test:tenancy` — **14/14 pass**

### 20. Typecheck/build result

`npx tsc --noEmit` — clean  
`npm run build` — success (exit 0)

### 21. Deferred items

See Deferred above + brief §65 list.

### 22. Architecture deviations and why

- Gift card **checkout redemption deferred** — payment integrity across Stripe/cash/PayPal (brief allowed stop).
- Unsub token encoding uses JSON+HMAC instead of dotted email fields — emails contain `.`.
- Pure modules (`promotion-calc`, `unsub-token`, `gift-card-code`, `segment-rules`) split so unit tests don’t need `DATABASE_URL`.
- Lightweight CRM timeline = insights + order history (not full event store).
- PayPal WIP not broadly rewritten; Phase 7 coupon/attribution primary on cash + Stripe paths.

### 23. Git status

Uncommitted local work only. **Do not commit / push / merge / deploy.** Phase 8 not started.
