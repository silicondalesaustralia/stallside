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
- Domains: add `beta.vendl.app`, `fallback.vendl.app` and `customers.vendl.app` (custom-domain
  traffic, step 3).
- Settings → Deployment Protection: off (as on `stallside`). Middleware looks up custom domains
  through the deployment URL (`VERCEL_URL`), which Vercel Authentication would block.

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
- DNS: `CNAME fallback → cname.vercel-dns.com`, DNS only (grey cloud).
- DNS: `CNAME * → cname.vercel-dns.com`, proxied (seller subdomains `<shop>.vendl.app`).
- Custom hostnames (SSL/TLS → Custom Hostnames): fallback origin `customers.vendl.app` (the CNAME
  target customers point their `www` at).
- Origin Rules can't rewrite the Host header below Enterprise, so a Worker does it:
  `vendl-saas-fallback` on route `*/*`. For custom domains and `<shop>.vendl.app` it fetches
  `fallback.vendl.app` (`resolveOverride`) and sends the visitor's host in
  `X-Vendl-Original-Host`, which the app reads (`src/lib/tenancy/request-hostname.ts`). Other
  `vendl.app` hosts pass straight through. Its `ORIGIN_HOST` decides which app serves shops:
  `fallback.vendl.app` follows whichever Vercel project owns that domain.
- The Worker must also rewrite `Origin` to `https://fallback.vendl.app` when it equals the visitor's
  host. Vercel sets `x-forwarded-host` to the fallback host, and Next.js aborts every Server Action
  (cart, cash, Stripe, Square, PayPal checkout) whose `Origin` doesn't match it. Cross-site
  requests keep their foreign `Origin` and are still rejected.

## 4. Supabase (Social), optional

- Only needed for Social. Until `SOCIAL_SECTION_LIVE=1` (plus the Supabase vars) is set on the beta
  app, Social opens a coming-soon page and its crons are skipped; Website studio and domains don't
  use Supabase.
- When ready: create the production social project, run `supabase/social/001` … `010` in order,
  set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` to it, add
  `SOCIAL_SECTION_LIVE=1` and redeploy.

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
3. Vercel: move `fallback.vendl.app` and `customers.vendl.app` to the `stallside` project so the
   Worker sends shop traffic to `main`. Customers change nothing in their DNS.
4. Delete `BETA_APP_URL` from `stallside`, redirect `beta.vendl.app` to `www.vendl.app` and
   delete the `vendl-beta` project.
5. Update OAuth redirect URIs from `beta.vendl.app` to `www.vendl.app`.
