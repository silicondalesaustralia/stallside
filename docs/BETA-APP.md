# Beta app (beta.vendl.app)

Beta owners use everything on `feature/social-kit` (Website studio, custom domains, Social and
the other new features) with their real production account. Everyone else keeps using
`www.vendl.app`, which runs `main`, unchanged.

How it works:

- A second Vercel project deploys `feature/social-kit` to `beta.vendl.app` on the **production
  database**. The 20 social-kit migrations only add tables/columns; `main` keeps working on top
  of them (tested: `main`'s `migrate deploy` reports no pending migrations afterwards).
- `VENDL_BETA_APP=1` turns on the gate in `requireOwner()`: only owners with beta access (admin
  toggle on `/admin/owners/[ownerId]`), platform admins and admin "log in as" sessions get in.
  Everyone else is sent to `www.vendl.app/dashboard`. `/signup` and `/onboarding` also go to main.
- On the beta app, middleware skips `main`'s crons (lifecycle, dunning, memberships, campaigns,
  Square, checkout sweep, order fees, blog); `main` keeps running them. The beta app only runs
  the new ones (`src/lib/beta-app.ts`).
- Stripe and Square webhooks stay on `main`; order completion code is identical on both branches.

## 1. Vercel: new project

- New project from the same repo, e.g. `vendl-beta`. Settings → Git → Production branch:
  `feature/social-kit`. (Crons only run on Production deployments.)
- Domains: add `beta.vendl.app` and `fallback.vendl.app` (custom-domain traffic, step 3).

## 2. Vercel env vars (Production, `vendl-beta` project)

Start by copying **all** Production env vars from the `stallside` project (database, `AUTH_SECRET`,
Stripe, Square, email, Blob, `CRON_SECRET`, ...). Then set or override:

| Variable | Value |
| --- | --- |
| `VENDL_BETA_APP` | `1` |
| `VENDL_APP_HOST` | `beta.vendl.app` |
| `VENDL_MAIN_APP_URL` | `https://www.vendl.app` |
| `NEXT_PUBLIC_APP_URL`, `AUTH_URL` | `https://beta.vendl.app` |
| `VENDL_HOST_ENV` | `production` |
| `CUSTOM_DOMAINS_ENABLED`, `CUSTOM_DOMAINS_ROUTING_ENABLED` | `1` |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_ACCOUNT_ID` | vendl.app SaaS zone |
| `CLOUDFLARE_SAAS_CNAME_TARGET` | `customers.vendl.app` |
| `DOMAINS_INTERNAL_LOOKUP_SECRET` | any long random string |
| `AI_WEBSITE_BUILDER_ENABLED` | `1` (optional: AI website builder) |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | AI website builder + Social |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | production social project (step 4) |
| `SOCIAL_PUBLIC_ORIGIN` | `https://beta.vendl.app` |

Optional, copy from the staging (Preview) values when you want them: `ORSHOT_API_KEY`,
`PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY`, and per network `*_CONNECT_ENABLED` plus its keys
(Meta, Pinterest, TikTok, X, YouTube, `GOOGLE_GMB_*`, `GOOGLE_CALENDAR_CONNECT_ENABLED` +
`GOOGLE_OAUTH_*`).

Do **not** set: `VENDL_STAGING_HOST`, `DOMAIN_SEARCH_ENABLED`, `DOMAIN_PURCHASE_ENABLED`,
`AU_DOMAIN_PURCHASE_ENABLED`, `PREMIUM_DOMAIN_PURCHASE_ENABLED`, `NAMECHEAP_*`, `FIXIE_URL`,
`SOCIAL_DEMO_MODE`. `WEBSITE_SECTION_*` and `SOCIAL_SECTION_LIVE` are not needed on the beta app.

Nothing changes in the `stallside` (main) project's env.

## 3. Cloudflare (vendl.app zone)

- DNS: `CNAME beta → cname.vercel-dns.com`, DNS only (grey cloud).
- Custom hostnames (SSL/TLS → Custom Hostnames):
  - Fallback origin: `fallback.vendl.app` (proxied record pointing at `cname.vercel-dns.com`).
  - Origin rule for custom hostnames: Host header override → `fallback.vendl.app`, so Vercel
    accepts the request.
  - Transform rule: set request header `x-vendl-original-host` = the original host, so the app
    knows which shop was asked for (`src/lib/tenancy/request-hostname.ts`).
  - Mirror whatever already works for stagingv2's `customers-v2` target.
- `customers.vendl.app` must resolve (the CNAME target customers point their `www` at).
- Seller subdomains (`<shop>.vendl.app`) are optional during beta: a wildcard needs a Vercel
  certificate. Without them, shops are at the custom domain or `beta.vendl.app/shop/<slug>`.

## 4. Supabase (Social), optional

- Only needed for Social. Without `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` the
  beta app hides Social and skips the Social crons; Website studio and domains don't use it.
- When ready: create the production social project, run `supabase/social/001` … `010` in order,
  add the three Supabase env vars and redeploy.

## 5. OAuth apps

- Add `https://beta.vendl.app/api/social/connect/<platform>/callback` for each network you enable,
  and `https://beta.vendl.app/api/calendar/connect/google/callback` for Google Calendar.
- Square allows one redirect URL per app, so it stays on `www.vendl.app`: beta owners connect
  Square there. Do **not** add a beta Stripe webhook (events would be processed twice).

## 6. Add testers

- Sign in at `beta.vendl.app` as a platform admin → `/admin/owners/[ownerId]` → **Give beta
  access**. The owner then signs in at `beta.vendl.app` with their usual email.
- Check: a non-beta account signing in at `beta.vendl.app` lands on `www.vendl.app/dashboard`.

## Hand-off from www (on `main`)

- With `BETA_APP_URL=https://beta.vendl.app` on the `stallside` project, beta owners who open the
  www dashboard are signed in to the beta app (single-use 60s token) and land on the same page.
- Admin "log in as" and `/dashboard/settings/square` stay on www (Square's OAuth URL is www).
- Off switch: delete `BETA_APP_URL` from `stallside` and redeploy.

## Launch (everyone gets it)

1. Merge `feature/social-kit` into `main` (the beta gate is inert without `VENDL_BETA_APP`).
2. Copy the new env vars from step 2 into the `stallside` project, except `VENDL_BETA_APP`,
   `VENDL_APP_HOST`, `VENDL_MAIN_APP_URL`, and keep `NEXT_PUBLIC_APP_URL`/`AUTH_URL` as www.
3. Cloudflare: move `fallback.vendl.app` to the `stallside` project (Vercel domains) so custom
   domains are served by `main`. Customers change nothing in their DNS.
4. Delete `BETA_APP_URL` from `stallside`, redirect `beta.vendl.app` to `www.vendl.app` and
   delete the `vendl-beta` project.
5. Update OAuth redirect URIs from `beta.vendl.app` to `www.vendl.app`.
