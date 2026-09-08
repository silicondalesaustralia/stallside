# VENDL Phase 11 — Square Commerce Result

## Gates

```text
SQUARE SANDBOX INTEGRATION PASSED
```

(Code + unit tests + build. Live Sandbox merchant exercise still requires
operator credentials in env.)

```text
SQUARE AU APPLICATION-FEE COMPLIANCE NOT VERIFIED
```

```text
SQUARE PRODUCTION NOT ENABLED
```

(`SQUARE_APP_FEES_ENABLED` / production flags default off.)

## Square account / app setup

Documented in `VENDL-SQUARE-INFRASTRUCTURE-RUNBOOK.md`.

No credentials in Git. Env template added to `.env.example`.

## Sandbox / Production

- Default environment: `sandbox`
- REST client (no Square npm SDK) against Connect Sandbox/Production hosts
- Feature flags: `SQUARE_INTEGRATION_ENABLED`, `SQUARE_CONNECT_ENABLED`,
  `SQUARE_PAYMENTS_ENABLED`, `SQUARE_APP_FEES_ENABLED`, `SQUARE_CATALOG_ENABLED`,
  `SQUARE_INVENTORY_ENABLED`, `SQUARE_POS_IMPORT_ENABLED`

## OAuth

- Authorize URL + state cookie
- Callback: `/api/square/oauth/callback`
- Token exchange / refresh / revoke
- Tokens AES-GCM encrypted at rest (`AUTH_SECRET`)
- Settings UI: Connect / Disconnect / reconnect

## Permissions

Least-privilege set in `src/lib/square/scopes.ts` including
`PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS`.

## Merchant / locations

On connect: retrieve merchant + locations; store location mappings;
seller picks primary sync location and optional stand map.

## Payments

- `PaymentMethod.SQUARE` + Web Payments client button
- Server `CreatePayment` with idempotency key
- Free fee via `computeVendlCheckoutFees` → `app_fee_money` when
  `SQUARE_APP_FEES_ENABLED=1`
- Pro / complimentary: 0 fee (same `stallside-fee` service)

## Application fees / AU PAAF

Production app fees **not enabled**. Compliance gate documented in runbook;
must pass before `SQUARE_APP_FEES_ENABLED=1` in production.

## Refunds

`refundSquarePayment` helper implemented. Full refund UI / webhook wiring is
minimal — extend when Sandbox refund spike is run.

## Catalogue

- List Square catalog items
- Exact SKU / UPC / name suggestions only
- Seller confirms mappings (product + variation)

## Inventory authority

Square authoritative for confirmed synced variations.
Vendl mirrors counts from `inventory.count.updated` + hourly reconcile cron.

## POS event sync

Webhook → receipt → async process → apply Square calculated quantity.
POS sales use `SaleOrigin.SQUARE_POS` / `EXTERNAL_*` sources — **never** create
Vendl 2.5% fee.

## Vendl → Square sync

Post-pay `pushVendlSaleToSquareInventory` via Inventory `batch-change`
(adjustment), tagged with `externalReference` to prevent double-decrement on
webhook echo.

## Stripe + Square inventory case

Same Inventory API path — **does not** create Square Orders for Stripe-paid
Vendl sales (avoids non-Square-payment Orders API fee).

## Orders API fee avoidance decision

**Use Inventory API adjustments** for non-Square-paid stock moves.
Square-paid Vendl checkout uses Payments API directly.

## Reconciliation

`/api/cron/square-reconcile` (hourly in `vercel.json`).

## Multi-location

Data model supports multiple `ExternalLocationMapping` rows; v1 sync uses
primary location.

## Security

- Signature verification on webhooks
- Merchant → connection resolution server-side
- Tokens never to browser
- Fail closed on bad signature / missing connection

## Webhooks

`POST /api/square/webhook` — verify, persist, ACK, process async.

## Analytics / reporting

`SaleOrigin` + `platformFeeCents` ready for fee-bearing vs observed GMV split.
Unified dashboard totals not built in this pass.

## Tests / build

- `npm run test:square` — 6 passed
- `tsc --noEmit` — pass
- `npm run build` — pass

## Known limitations

- Live Sandbox end-to-end still needs Square Developer app credentials
- Refund/dispute UX thin
- Customer Choice / pay page Square wiring not fully duplicated (cart path done)
- Stand `acceptSquare` must be enabled per stand (default false)

## Git status

Uncommitted — no commit/push/deploy per brief.
