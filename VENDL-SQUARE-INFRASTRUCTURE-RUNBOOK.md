# Vendl Square Infrastructure Runbook

## Overview

Square is a first-class commerce integration: OAuth connection, Web Payments,
catalogue mapping, and inventory sync. Credentials never belong in Git.

## Developer Console

1. Create a Square Developer account and application named **Vendl**.
2. Start in **Sandbox**. Production merchant activation is not required for engineering.
3. Note Application ID + Application Secret.
4. Configure OAuth redirect URL:
   - Local: `http://localhost:3000/api/square/oauth/callback`
   - Staging/prod: `https://{host}/api/square/oauth/callback`
5. Configure webhook endpoint:
   - `https://{host}/api/square/webhook`
   - Subscribe (v1): `inventory.count.updated`, payment/refund events as needed,
     `catalog.version.updated` when catalogue sync is on.
6. Copy webhook signature key into env.

### Sandbox OAuth blank page

Sandbox authorize will white-screen until you launch a seller test account:

1. Developer Dashboard → your app → **Sandbox test accounts**
2. Click **Open** on Default Test Account (leave that tab open)
3. Then click **Connect Square** in Vendl (authorize host is
   `https://connect.squareupsandbox.com/...`)

## Required OAuth scopes

See `src/lib/square/scopes.ts`:

- `MERCHANT_PROFILE_READ`
- `PAYMENTS_READ` / `PAYMENTS_WRITE`
- `PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS` (application fees)
- `ORDERS_READ` / `ORDERS_WRITE` (Square-paid flows only)
- `ITEMS_READ` / `ITEMS_WRITE`
- `INVENTORY_READ` / `INVENTORY_WRITE`

## Environment variables

```text
SQUARE_ENVIRONMENT=sandbox
NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=
SQUARE_APPLICATION_SECRET=
SQUARE_WEBHOOK_SIGNATURE_KEY=
SQUARE_OAUTH_REDIRECT_URI=
SQUARE_INTEGRATION_ENABLED=1
SQUARE_CONNECT_ENABLED=1
SQUARE_PAYMENTS_ENABLED=0
SQUARE_APP_FEES_ENABLED=0
SQUARE_CATALOG_ENABLED=0
SQUARE_INVENTORY_ENABLED=0
SQUARE_POS_IMPORT_ENABLED=0
```

Flip staged flags after Sandbox spike gates pass.

## Australian application-fee compliance

Before enabling `SQUARE_APP_FEES_ENABLED=1` in production:

1. Review Square Payments API Application Fee Product Disclosure Statement.
2. Review Financial Services Guide.
3. Complete any Square AU onboarding/approval steps.
4. Confirm Free-plan 2.5% `app_fee_money` model is permitted.
5. Document seller disclosures/terms.
6. Record outcome in Phase 11 result report.

Sandbox engineering is not blocked by this gate.

## Production activation checklist

- [ ] Sandbox OAuth / payments / inventory spike passed
- [ ] AU PAAF compliance verified
- [ ] Production Square application created
- [ ] Production OAuth redirect + webhook registered
- [ ] Secrets in Vercel (not Git)
- [ ] `SQUARE_ENVIRONMENT=production`
- [ ] Feature flags enabled intentionally
- [ ] Cron `/api/cron/square-reconcile` authorized with `CRON_SECRET`

## Fee rules (do not change)

| Origin | Plan | Vendl fee |
|--------|------|-----------|
| Vendl online Square payment | Free | 2.5% `app_fee_money` |
| Vendl online Square payment | Pro | 0% |
| Square POS / observed external | any | **never** |

## Inventory authority

For synced variations: Square is operational stock authority. Vendl mirrors
Square calculated counts and submits Vendl-originated adjustments via Inventory
API (not Orders API) so Stripe-paid Vendl sales do not incur Square’s
non-Square-payment Orders fee.

## Security

- Tokens encrypted at rest (`AUTH_SECRET` AES-GCM).
- Never log tokens or send them to the browser.
- Webhook signature verification required.
- Tenant resolution from Square merchant id → `ExternalCommerceConnection` only.
