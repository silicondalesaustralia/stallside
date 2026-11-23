# Vendl × Stitchstack Analytics — partner SSO (social-kit)

Vendl dashboard nav **Stitchstack Analytics** → ensure-account → **auto-install first-party pixel** → SSO handoff.  
GA4 / GSC are optional enrichment in Stitchstack (see `stitchstack-pixel-first-onboarding.md`).

## Vendl wiring (done on `feature/social-kit`)

| Piece | Path |
|-------|------|
| Nav | `StitchstackAnalyticsNavLink` → `/dashboard/analytics/stitchstack` |
| Handoff route | `GET /dashboard/analytics/stitchstack` |
| Client | `src/lib/stitchstack.ts` → `POST {STITCHSTACK_APP_URL}/api/partners/vendl/ensure-account` |
| Pixel persist | `src/lib/stitchstack-pixel.ts` → `Storefront.stitchstackPixel` |
| Pixel inject | `StorefrontStitchstackPixel` on shop layout (tenant hosts, consent-aware) |

### Env (Vendl / beta)

```bash
STITCHSTACK_APP_URL=https://stitchstack.app
STITCHSTACK_PARTNER_API_KEY=<same value as Stitchstack VENDL_PARTNER_API_KEY>
```

If the key is unset, the route redirects to `https://stitchstack.app` (old behaviour).

### Identity sent

| Field | Value |
|-------|--------|
| `external_account_id` | Vendl `owner.id` |
| `external_user_id` | Vendl `user.id` |
| `email` / `name` | Session user |
| `business_name` | Selected stand name (fallback owner business name) |
| `site_url` | Stand `websiteUrl` or public storefront URL |
| `role` | `owner` |
| Impersonation | Platform admins in login-as **may** SSO (seller workspace). Non-admin impersonation blocked. |

## Stitchstack side

Give the Stitchstack agent: **`docs/partners/stitchstack-pixel-first-onboarding.md`**.

Also their local `docs/partners/vendl-analytics-sso.md` if present. Requires:

1. Deploy partner API + migration `20261120_vendl_partner` (or successor)
2. `ensure-account` returns `pixel.script_src` (idempotent per Vendl account)
3. `VENDL_PARTNER_API_KEY` on Stitchstack matching Vendl’s key
