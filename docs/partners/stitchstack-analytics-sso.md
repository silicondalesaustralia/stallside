# Vendl × Stitchstack Analytics — partner SSO (social-kit)

Vendl dashboard nav **Stitchstack Analytics** → server handoff → Stitchstack GA4/GSC (gated free).

## Vendl wiring (done on `feature/social-kit`)

| Piece | Path |
|-------|------|
| Nav | `StitchstackAnalyticsNavLink` → `/dashboard/analytics/stitchstack` |
| Handoff route | `GET /dashboard/analytics/stitchstack` |
| Client | `src/lib/stitchstack.ts` → `POST {STITCHSTACK_APP_URL}/api/partners/vendl/ensure-account` |

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

See Stitchstack repo `docs/partners/vendl-analytics-sso.md`. Requires:

1. Deploy partner API + migration `20261120_vendl_partner`
2. `VENDL_PARTNER_API_KEY` on Stitchstack matching Vendl’s key
