# Social posting kit → Vendl: handover

This kit lifts the whole TradiesPost social product out of the StitchedUp repo and gets it ready to drop into Vendl (Next.js on Vercel). It covers:

- the composer, with photos, video, TikTok slides and the AI slide maker
- the AI Design Studio and Recreate
- the week planner ("Build my week")
- the library, calendar and posts views
- video branding
- the brand kit
- Facebook, Instagram, Google Business Profile and TikTok connect plus publishing (immediate and scheduled)

Vendl keeps its own dashboard, auth and main database (Neon). The social features run against a **new, separate Supabase project** that serves as their database and file storage. Vendl's server code is the only thing that ever talks to it, using the service role.

The kit typechecks on its own (`cd social-kit && npx tsc -p tsconfig.json` gives zero errors). Its schema migrations have been applied to an empty Postgres and verified.

---

## 1. What's in the kit

| Path | What it is |
|------|------------|
| `files/` | **The code to copy into Vendl**: 543 source files plus fonts and images, laid out at their final repo paths. |
| `install.mjs` | Copies `files/` into the Vendl repo and **never overwrites**; it lists collisions instead. |
| `supabase/migrations/001–004` | Schema for the new Supabase project. Apply them in order. |
| `env.example` | Every env var the kit reads, marking which ones can be copied from StitchedUp. |
| `config-snippets/` | Pieces to merge into Vendl's config: `next.config`, Vercel crons, Tailwind theme and npm dependencies. |
| `FILES.txt` | A flat list of every file in `files/`. |
| `tools/` | How the kit was generated (dependency tracer, schema dump and build). Only needed if it's rebuilt from StitchedUp. |
| `overrides/` | The hand-written replacement files (shims and host layer) the build places into `files/`. They are already inside `files/`; this copy is for reference. |

## 2. How it fits together

```
Vendl session (its own auth)
   │  lib/socialHost/hostSession.ts      ← Vendl implements getHostSession()
   ▼
lib/socialHost/provisionSocialIdentity.ts
   │  upserts a businesses row (external_account_id = Vendl account id)
   │  and a users row (external_user_id = Vendl user id) in the social DB,
   │  cached per request
   ▼
Shims at the original StitchedUp import paths
   lib/supabase/server.ts       createClient().auth.getUser() → the provisioned social user
   lib/utils/impersonation.ts   requireEffectiveBusinessContext() → { user, businessId, db }
   lib/agent/agentSuggestionAuth.ts, lib/billing/*, lib/products/*, lib/renders/consumeRenderCredit.ts …
   ▼
~480 untouched social files (routes, components, libs) → social Supabase (service role)
```

The social code is unchanged. Each StitchedUp module it depended on (auth, impersonation, subscriptions, credits, multi-product routing, admin) has been **replaced by a shim at the same import path**. Each shim delegates to the host layer in `lib/socialHost/`. Every shim begins with a `// KIT SHIM` comment.

Two safety properties:
- The social DB has RLS enabled on every table with **no policies**, so the anon key can read nothing. All access goes through the service role, server-side. The browser never gets a Supabase key.
- Every social route scopes its queries by the `businessId` derived on the server from the Vendl session. No route accepts a business id from the request body.

## 3. Integration steps

### Step 1: Create the social Supabase project (the human owner does this)
1. In the Supabase dashboard, create a new project in region **Sydney (ap-southeast-2)**.
2. Open the SQL editor and run `supabase/migrations/001_social_schema.sql`, `002_host_identity.sql`, `003_social_seed.sql` and `004_storage_buckets.sql` **in that order**.
3. Copy the project URL and the **service_role** key into Vercel as `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (see `env.example`). The anon key isn't needed.

The schema is the final state of StitchedUp's 247 migrations for the tables the social code uses (23 tables). `businesses` keeps all 208 StitchedUp columns, including unused ones. That's intentional: it's safer than guessing which columns the social code touches.

### Step 2: Copy the code
```bash
node social-kit/install.mjs /path/to/vendl            # repo with code at the root
node social-kit/install.mjs /path/to/vendl --src      # repo whose "@/*" alias points at ./src/*
node social-kit/install.mjs /path/to/vendl --dry-run  # preview only
```
The kit imports everything through the `@/` alias, so Vendl needs `"@/*"` pointing at wherever the files land.

**Collisions.** Any file that already exists in Vendl is skipped and listed in `social-kit-collisions.txt`. Likely collisions are generic paths such as `components/ui/{Button,Card,Input,Modal,Tabs,Textarea,Toast}.tsx`, `lib/utils/format.ts`, `lib/auth/permissions.ts`, `lib/supabase/*` and `app/api/me/context`. For each one, either:
- move the kit's version to a namespaced path (for example `components/social-ui/Button.tsx`) and update the kit files that import it (`grep -rl "@/components/ui/Button"`), or
- if Vendl's file has the same exports and props, keep Vendl's.

**Never** let the kit's `lib/supabase/server.ts` replace a Vendl Supabase client, or the reverse. Vendl's version would point at the wrong project and skip the shim.

### Step 3: Implement the four host integration points (all in `lib/socialHost/`)
| File | What to do | Default |
|------|------------|---------|
| `hostSession.ts` → `getHostSession()` | Return `{ userId, email, name, accountId, accountName, role }` from Vendl's auth, or `null`. `role` is `'owner' \| 'admin' \| 'member'`. | Returns `null`, so every route answers 401 until this is done. |
| `hostAccess.ts` → `hostCanUseSocial(accountId)` | Plan gating. Return false to block social for an account; routes then answer 403 with `capability_required`. | Allows everyone. |
| `hostAccess.ts` → `hostCanManageSocial(role)` | Decides who may connect/disconnect accounts and edit the brand kit. | Owner and admin. |
| `hostCredits.ts` | Usage billing. `hostCreditBalance` (`null` means unlimited), `hostConsumeCredits` (throw `HostCreditsExhaustedError` to refuse), `hostRefundCredits`. Kinds: `'render'` (AI images) and `'ai'` (AI text). Use `externalAccountIdFor(socialBusinessId)` to map back to Vendl's account. | Unlimited and free; it only logs. |

`hostConfig.ts` holds the public origin (env `SOCIAL_PUBLIC_ORIGIN` or `NEXT_PUBLIC_APP_URL`), the `/social` base path, the OAuth return allowlist and image quality.

### Step 4: Mount the pages
The pages live in `app/social/`: `create`, `library`, `planner`, `posts`, `calendar`, `connections`, `brand`, plus `layout.tsx` and an index `page.tsx` that redirects old `/social?tab=…` links.
- Move the `app/social` folder inside Vendl's authenticated dashboard route group, so Vendl's sidebar and login gate wrap it. The kit ships no shell or login page.
- Add sidebar entries for Create, Library, Planner, Posts, Calendar, Connections and Brand.
- Every in-app link in the kit is already rewritten to `/social/*`. If a different base path is wanted, change `SOCIAL_BASE_PATH` and search-and-replace `'/social/` in `components/`.
- A few links point at Vendl paths that are assumed to exist: `/login` (on a 401 from the workspace loader) and `/billing` (from the credits badge).

### Step 5: Config
- **npm:** add whatever is missing from `config-snippets/package.dependencies.json` (`sharp`, `@resvg/resvg-js`, `openai`, `@anthropic-ai/sdk`, `googleapis`, `piexifjs`, `axios`, `zod`, `date-fns`, `lucide-react`, `@supabase/supabase-js`).
- **next.config:** merge `config-snippets/next.config.snippet.mjs`. The `serverExternalPackages` and `outputFileTracingIncludes` entries are **required**. Without them, the image, slide and render routes return 500 on Vercel with missing native binaries or fonts.
- **Tailwind:** merge `config-snippets/tailwind.snippet.ts` into `theme.extend`, and make sure `content` includes `./lib/**`.
- **Vercel crons:** merge `config-snippets/vercel.crons.json`. `process-week-plan-generation` runs every minute and the publish crons every 5 minutes, so these need a **Vercel Pro** plan; Hobby only allows daily crons. Set `CRON_SECRET`.
- **Middleware:** these routes must not be redirected to Vendl's login:
  - `/api/cron/*`: Bearer `CRON_SECRET`.
  - `/api/social/tiktok-media/*`: **TikTok's servers fetch post media from here**.
  - `/api/social/orshot-webhook`: Orshot server-to-server.
  - `/api/social/bundled-font/*`.
  - `/api/social/connect/{meta,tiktok,gmb}/config`.

  Everything else under `/api/social/*` authenticates through the host session and returns 401 JSON on its own.
- **CSP** (if Vendl sends one):
  - `connect-src` must allow `https://*.supabase.co`. Uploads go straight from the browser to Supabase through signed URLs, which is what lets 250 MB videos skip Vercel's body limit.
  - Also allow Orshot, Unsplash and Pexels. The snippet's comment lists them all.
- **Env:** everything in `env.example`.

### Step 6: Point the social apps at Vendl (the human owner does this)
The same Meta, Google and TikTok apps are reused; they're being renamed to something generic. For each one, add Vendl alongside the existing StitchedUp/TradiesPost entries, and keep the old entries.

| App | Add |
|-----|-----|
| **Meta** | Valid OAuth Redirect URI `https://www.vendl.app/api/social/connect/meta/callback`; App Domains `vendl.app`. |
| **Google (GBP OAuth client)** | Authorized redirect URI `https://www.vendl.app/api/social/connect/gmb/callback`; add `vendl.app` to the consent screen's authorized domains. Adding a domain to a verified app can trigger re-verification. |
| **TikTok** | Redirect URI `https://www.vendl.app/api/social/connect/tiktok/callback`. For Content Posting, **verify the URL prefix** `https://www.vendl.app/api/social/tiktok-media/` (or the domain): TikTok pulls media from Vendl. Rotate the client secret before go-live. |

The redirect URIs must match the origin **exactly**: `www` versus bare domain, no trailing slash. Whichever form Vendl serves canonically, set `NEXT_PUBLIC_APP_URL` to it and register that same form. If the bare domain redirects to `www` (or the reverse), TikTok's media fetch and the OAuth callbacks will fail.

### Step 7: Video branding worker (optional)
Video branding (headline and logo overlays on uploaded videos) runs in an FFmpeg worker. FFmpeg can't run on Vercel.
- The worker is in `workers/video-processor/`, with a Dockerfile, README and `src/`. The build context is the repo root; it copies `lib/` for the shared `lib/social/videoBranding` code.
- Deploy it as a **Render background worker** with 1 vCPU and 2 GB RAM, setting `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the social project.
- Without the worker, video posts still work; only the optional "brand this video" step stays at "processing".

## 4. Verify (in order)
1. Signed in to Vendl, open `/social/create`. The page loads, and the social DB now has a `businesses` row with your `external_account_id` plus a `users` row.
2. On `/social/brand`, upload a logo and set a colour. Refresh the page: it survives.
3. Generate an AI design. The image appears and the `[socialHost][credits] consume` log shows in Vercel.
4. In `/social/connections`, connect Facebook, Instagram, Google and TikTok. Each OAuth round-trip lands back on `/social/connections`.
5. Post now to each platform. Then schedule a post for 10 minutes ahead and confirm the `publish-due-social-posts` cron publishes it.
6. TikTok: post a photo slide deck and a video. The status cron moves them from pending to posted.
7. Build a week in `/social/planner` and watch the items generate (the every-minute cron).

## 5. Behaviour to know about
- **The product is trades-flavoured.** AI prompts, trade taxonomy (`lib/trades/taxonomy.ts`), copy ("tradie", "jobs", "Buddy") and the TradiesPost colours and images (`public/tradiespost/`, `TradiesPostLogo`) all come along. Rebranding and prompt tuning for Vendl's audience is a separate pass. Component names still say `TradiesPost*`; that's cosmetic.
- **"Jobs" as a content source.** Several features ("post about a recent job", the week planner's job ideas, job-photo picker) read `jobs` / `job_photos` / `customers` in the social DB. They start empty, so those pickers show no jobs; uploads, the library, stock images and idea-based posts work without them. To feed Vendl content in, sync rows into:
  - `jobs`: `id, business_id, title, description, notes, stage, site_suburb, site_state, completed_at`.
  - `job_photos`: `job_id, business_id, url, webp_url`.
- **Credits** are unlimited until `hostCredits.ts` is implemented. Two routes (`hybrid-render`, `inspiration-photo-refine`) also pre-check a `render_credits` row in the social DB; with no row they allow the action, and the real gate is `hostConsumeCredits`.
- **OAuth tokens** for Meta, Google and TikTok are stored on the social `businesses` row (`facebook_access_token`, `gmb_*_token`, `tiktok_*_token`). Treat the social project's service-role key like a production secret.
- **TikTok** is unaudited. Until TikTok approves the app, it can only post to private accounts with "Only me" visibility; a failed post shows a plain-English error saying so. Draft/inbox mode isn't built: posts go direct.
- **Scheduling** granularity equals the publish cron interval (5 minutes in the snippet).
- **Not included** (StitchedUp-only): agent suggestions, admin impersonation, StitchedUp subscriptions and wallet, Airwallex checkout, and the TradiesPost shell, landing pages and onboarding.

## 6. Decisions for the owner to confirm
1. **Business model.** Credits are pluggable but default to unlimited. Decide whether social is included in a plan, sold as credits, or both, then implement `hostCreditBalance` / `hostConsumeCredits`.
2. **Account mapping.** One social "business" per Vendl account (`accountId`). If Vendl has multiple stores or brands per account, `accountId` should be the store id instead.
3. **Role mapping.** Vendl owner maps to social owner; Vendl admin maps to an admin who can connect accounts; member maps to a content creator who can post but not connect or edit the brand.
4. **Base path** `/social` and **image quality** `high` (about 2× the cost of `medium`).

## 7. Rebuilding the kit from StitchedUp
Run these from the StitchedUp repo root:
```bash
node social-kit/tools/build-kit.mjs          # re-trace, copy, rewrite links, write FILES.txt
bash social-kit/tools/dump-schema.sh         # replay migrations into a local Postgres 17 (port 54329)
node social-kit/tools/build-schema.mjs       # regenerate supabase/migrations/001 + 003
cd social-kit && npx tsc -p tsconfig.json    # must be 0 errors
```
`tools/kit-config.json` lists the entry points and exclusions; the replacement files live in `overrides/`.
