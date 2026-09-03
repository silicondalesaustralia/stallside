# Vendl Staging (`staging.vendl.app`)

Same Vercel project (`stallside`), dedicated Git branch + domain.  
**Do not** point staging at the production database.

## Architecture

```text
staging branch  →  Vercel Preview (or Custom Env)
                 →  staging.vendl.app
                 →  staging Postgres (Neon branch / separate DB)

main            →  Production
                 →  vendl.app / *.vendl.app / stallside.app
                 →  production Postgres
```

`staging` is already a **reserved** subdomain label in app code — it will not be treated as a seller shop.

## Critical warning (current prod config)

As of setup day, Vercel has `DATABASE_URL` (and Neon vars) on **Production + Preview**.  
If you deploy a `staging` branch without fixing that, **Preview/staging will hit production data**.

Before first staging deploy that runs migrations or seeds:

1. Create a **separate** Neon database / branch for staging
2. Move or duplicate DB-related env so **Production** keeps prod URLs
3. Set **Preview** (or Custom Environment `staging`) to the staging DB only

## Manual checklist

### A. Cloudflare DNS (you) — required next

Vercel project domain is already added: `staging.vendl.app` → Git branch `staging`.

Vercel currently recommends:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `staging` | `76.76.21.21` | **DNS only** (grey cloud) |

Alternate (also fine on Cloudflare): CNAME `staging` → `cname.vercel-dns.com`, DNS only.  
This overrides the `*` wildcard so traffic does not hit Production.

### C. Staging database (you — Neon)

1. Neon console → project linked to Vendl → create branch `staging` (or new DB)
2. Copy pooled + direct connection strings
3. In Vercel → Environment Variables:
   - Ensure Production `DATABASE_URL*` stay on **Production only**
   - Set Preview (or Staging custom env) `DATABASE_URL` / `DATABASE_URL_UNPOOLED` / related Neon vars to the **staging** DB
4. After first staging deploy: open deployment → run migrate (or rely on `build:vercel` migrate) + optional `seed:green-valley-demo`

### D. Staging URL env (Preview / Staging)

Set for Preview (or Custom Environment assigned to `staging` branch):

```text
NEXT_PUBLIC_APP_URL=https://staging.vendl.app
AUTH_URL=https://staging.vendl.app
```

Prefer a **separate** `AUTH_SECRET` for staging if you can rotate without breaking local.

Also set:

```text
VENDL_HOST_ENV=staging
```

so Domains UI and QR links use `{slug}.staging.vendl.app` instead of production `{slug}.vendl.app`.

### Seller staging hosts (`*.staging.vendl.app`)

After apex staging works, add a Vercel domain for the wildcard (or per-shop) on the **staging** branch:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| CNAME | `*.staging` | `cname.vercel-dns.com` (or Vercel’s value) | DNS only |

App classifies `{slug}.staging.vendl.app` as a seller storefront host (same path map as prod).

Until the wildcard is live, use path style: `https://staging.vendl.app/shop/{slug}`.

Use Stripe/PayPal **test/sandbox** on Preview where possible. Do not register production webhooks against staging until intentional.

Phase 9 flags (only after CF SaaS spike path is ready on staging):

```text
CUSTOM_DOMAINS_ENABLED=1
CUSTOM_DOMAINS_ROUTING_ENABLED=0   # flip to 1 after spike
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ZONE_ID=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_SAAS_CNAME_TARGET=customers.vendl.app
DOMAINS_INTERNAL_LOOKUP_SECRET=...
```

### E. Git workflow

```text
main     = production
staging  = what staging.vendl.app serves
```

1. Commit work you want to test
2. Push to `origin/staging`
3. Vercel builds → `https://staging.vendl.app`
4. After QA, merge `staging` → `main` (or PR)

### F. Smoke test

- [ ] `https://staging.vendl.app` loads
- [ ] Login / magic link works (check email links use staging host)
- [ ] `/shop/{slug}` works (seller `*.vendl.app` still = **prod**)
- [ ] Confirm DB is staging (create a throwaway product; prod unchanged)
- [ ] Dashboard Domains UI (when flags on)

## Rollback

- Remove or unassign `staging.vendl.app`
- Or point Cloudflare `staging` CNAME away / delete record
- Production unaffected via `vendl.app` + `*`

## What staging does not cover

- `{slug}.vendl.app` seller hosts still resolve to **Production** (wildcard)
- Crons in `vercel.json` run on Production only (good for safety)
- Custom-domain spike still needs Cloudflare for SaaS (`customers.vendl.app`) from the Phase 9 runbook
