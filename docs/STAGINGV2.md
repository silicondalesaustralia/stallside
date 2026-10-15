# stagingv2 setup

`stagingv2.vendl.app` runs the `feature/social-kit` branch on the same Vercel project (`stallside`),
with its own database copy and no website gating, so domain search, purchase and connection can be
tested end to end without touching production.

The code reads `VENDL_STAGING_HOST`; when set, that host is the app and `<shop>.stagingv2.vendl.app`
are seller shops. Checkout and login redirects stay on the stagingv2 host.

## 1. Database (Neon)

- Create a Neon **branch** from the staging/preview database (`ep-aged-cell`). Not `ep-autumn-brook`:
  that is production (and the database in the main repo `.env`). Do not start from an empty
  database: the website tables (`Storefront`, `StorefrontDomain`, `DomainPurchase`, `QrCode`) only
  exist in staging's migration history.
- Run `npx prisma migrate deploy` against the new branch.

## 2. Vercel domains (project `stallside` → Settings → Domains)

- Add `stagingv2.vendl.app`, Git branch `feature/social-kit`.
- Optional: `*.stagingv2.vendl.app` for seller subdomains. Wildcards two levels deep need Vercel
  nameservers or a manual certificate; without it, shops use `stagingv2.vendl.app/shop/<slug>`.

## 3. Cloudflare DNS (vendl.app zone)

- `CNAME stagingv2 → cname.vercel-dns.com`, **DNS only** (grey cloud).

## 4. Vercel env vars: Preview, scoped to branch `feature/social-kit`

| Variable | Value |
| --- | --- |
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Neon stagingv2 branch |
| `NEXT_PUBLIC_APP_URL`, `AUTH_URL` | `https://stagingv2.vendl.app` |
| `VENDL_HOST_ENV` | `staging` |
| `VENDL_STAGING_HOST` | `stagingv2.vendl.app` |
| `CUSTOM_DOMAINS_ENABLED`, `CUSTOM_DOMAINS_ROUTING_ENABLED` | `1` |
| `DOMAIN_SEARCH_ENABLED`, `DOMAIN_PURCHASE_ENABLED` | `1` |
| `NAMECHEAP_ENVIRONMENT` | `sandbox` (switch to `production` only for a real purchase test) |
| `NAMECHEAP_*`, `FIXIE_URL` | Namecheap API user/key; Fixie IP must be whitelisted in Namecheap |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_ACCOUNT_ID` | Cloudflare for SaaS zone |
| `CLOUDFLARE_SAAS_CNAME_TARGET` | Separate target, e.g. `customers-v2.vendl.app` (not prod's `customers.vendl.app`) |
| `STRIPE_*_TEST`, `STRIPE_WEBHOOK_SECRET_TEST` | Stripe test mode |

Website gating (`WEBSITE_SECTION_OWNER_IDS`) only applies when `VERCEL_ENV=production`, so every
account on stagingv2 sees the website section.

## 5. Custom domains (Cloudflare for SaaS)

- Create the fallback origin for the stagingv2 SaaS target, pointing at the Vercel deployment.
- Point a test domain's `www` CNAME at the target, then press "Check again" in the dashboard.

## 6. Webhooks and OAuth

- Stripe (test mode): webhook `https://stagingv2.vendl.app/api/stripe/webhook`.
- Add `https://stagingv2.vendl.app/...` redirect URIs to Google, Meta, TikTok and Square sandbox apps
  (`GOOGLE_GMB_REDIRECT_URI`, `SQUARE_OAUTH_REDIRECT_URI` must match).

## Caveats

- Vercel crons only run on Production; trigger `/api/cron/*` manually with `CRON_SECRET` if needed.
- Deploys happen on every push to `feature/social-kit`.
