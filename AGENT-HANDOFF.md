# Stallside — agent handoff (current state)

Give this to another agent continuing the project. Repo folder may still be named `MyFarmStand`; product name is **Stallside**, domain **`stallside.app`**.

**GitHub:** [silicondalesaustralia/stallside](https://github.com/silicondalesaustralia/stallside) — remote is `origin` via SSH (`git@github.com:silicondalesaustralia/stallside.git`). Pilot checklist: `PILOT-GO-LIVE.md`.

---

## 1. What this product is

QR self-checkout + inventory SaaS for **unmanned farm stands / honesty stalls**.

| Audience | Surface | Job |
|----------|---------|-----|
| **Customer** | Phone browser via printed QR → `/s/{slug}` | Pick items, pay cash or card / Apple Pay / Google Pay |
| **Owner** | Web dashboard + Capacitor iOS/Android shell | Stands, products, stock, orders, QR print, Stripe, alerts |
| **Platform admin** | Desktop browser `/admin` only | Owners, stands, orders overview |

**Not in scope yet:** customer App Store directory, PayPal, hardware card readers, Connect application fees, SaaS subscription billing collection.

---

## 2. Locked product decisions

| Decision | Choice |
|----------|--------|
| Name / domain | Stallside / `stallside.app` |
| Tagline | `Scan. Pay. Fresh.` |
| SaaS | $9.99/mo (`MONTHLY_FEE_CENTS = 999`), unlimited stands/products |
| Platform fee | **2% on card only** (`PLATFORM_FEE_BPS = 200`) — tracked in DB; **no** Stripe Connect application fee in MVP |
| Public stock | Exact counts **off** by default → `Available` / `Low stock` / `Sold out` |
| Cash | Customer-confirmed, logged only; no cash refund UI |
| Currency | **Per stand** |
| Auth | Auth.js magic link (console-printed locally without Resend) |
| Payments | QR + Cash + Stripe Checkout (card / Apple Pay / Google Pay) |
| Store apps | **Owner Capacitor shell only**; admin stays desktop web |
| Bundle ID | Keep `com.myfarmstand.owner` unless explicitly signed off to change |
| Low-stock alert cooldown | 6 hours (`LOW_STOCK_ALERT_COOLDOWN_HOURS`) |

---

## 3. Stack

- **Next.js 16** App Router + TypeScript + Tailwind CSS v4
- **Auth.js** (next-auth v5 beta) + Prisma adapter, JWT sessions
- **PostgreSQL** + **Prisma 7** (`@prisma/adapter-pg`)
- **Stripe** Connect Express + Checkout + webhook
- **Capacitor 8** iOS/Android owner shell
- Path alias: `@/*` → `src/*`
- Generated Prisma client: `src/generated/prisma`

**Important:** This Next.js version may differ from training data. Prefer `node_modules/next/dist/docs/` and existing repo patterns over assumptions. See `AGENTS.md`.

---

## 4. Local setup

```bash
cp .env.example .env   # set DATABASE_URL + AUTH_SECRET
npm install
npx prisma migrate deploy   # or migrate dev
npm run dev                 # http://localhost:3000
```

Magic links (no `RESEND_API_KEY`): printed in the terminal as `[Stallside magic link]`. Simulator helper: `/login/check-email` has a paste box.

Promote admin:

```bash
npm run admin:promote -- you@example.com
```

Owner Capacitor (iOS Simulator):

```bash
CAPACITOR_SERVER_URL=http://127.0.0.1:3000 npx cap sync ios
npm run cap:ios
```

Use `127.0.0.1`, not Android’s `10.0.2.2`, for Simulator. ATS allows local networking in `ios/App/App/Info.plist`.

---

## 5. Env vars (see `.env.example`)

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_APP_URL` | Public base URL (QR links, Stripe redirects) |
| `CAPACITOR_SERVER_URL` | Optional override for owner app shell URL |
| `AUTH_SECRET` / `AUTH_URL` | Auth.js |
| `DATABASE_URL` | Postgres |
| `RESEND_API_KEY` / `EMAIL_FROM` | Magic links + sale/low-stock emails (else console) |
| `FCM_SERVER_KEY` | Push send via FCM (else push payloads console-log) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Connect + Checkout |

---

## 6. What is already built

### Public
- Landing `/` — Stallside brand (field green hero, wordmark animation, checkout phone mock)
- Login + check-email paste helper
- Onboarding (business name / contact)
- Customer checkout `/s/[standSlug]` — cart, sticky bar, cash confirm + card → Stripe Checkout
- Checkout success / cancelled pages

### Owner dashboard
- Overview (today’s takings, low stock, QR shortcuts)
- Stands CRUD + QR print/download/copy page (editable sign fields including `qrSignMessage`)
- Products + inventory adjust
- Orders list
- Settings + Stripe Connect onboarding
- Mobile bottom tabs (`DashboardNav`) on &lt;768px
- Brand: `BrandMark`, `BrandLockup`, tokens in `globals.css`

### Admin
- `/admin`, `/admin/owners`, `/admin/stands`, `/admin/orders` — desktop, field top bar

### Payments / inventory
- Cash: create order `CUSTOMER_CONFIRMED`, decrement stock
- Card: pending order → Stripe Checkout → webhook/success fulfill `PAID`, decrement stock, track platform fee cents
- Inventory adjustments logged

### Notifications (email + push)
- On successful cash or card sale: email + push “Sale · {stand}”
- If product hits `lowStockThreshold`: email + push “Low stock · …” with 6h cooldown via `LowStockAlert`
- Device tokens: `PushDevice` + `POST/DELETE /api/push/register`
- Native: `@capacitor/push-notifications`, register from dashboard via `OwnerPushRegister`
- Without Resend/FCM keys: logs to server console

### Native / brand assets
- App display name **Stallside** (iOS/Android/Capacitor)
- App icons updated to Stallside mark (iOS 1024, Android densities)
- Brand assets under `public/brand/`

### Migrations present
- `init`
- `add_qr_sign_message`
- `add_push_devices` — **apply with migrate if DB was created earlier**

---

## 7. Route map

| Route | Notes |
|-------|--------|
| `/` | Landing |
| `/login`, `/login/check-email` | Owner auth |
| `/onboarding` | First-time owner |
| `/s/[standSlug]` | Customer checkout |
| `/checkout/success`, `/checkout/cancelled` | Card return |
| `/dashboard/*` | Owner app |
| `/dashboard/stands/[standId]/qr` | Print poster |
| `/dashboard/settings/stripe` | Connect |
| `/admin/*` | Platform admin |
| `/api/auth/[...nextauth]` | Auth |
| `/api/stripe/webhook` | Stripe |
| `/api/push/register` | Push token upsert/delete |

---

## 8. Key files

```text
src/lib/constants.ts          # APP_NAME, fees, cooldown
src/lib/auth.ts               # magic link
src/lib/checkout.ts           # cart load, stock decrement, card fulfill + notify
src/lib/notify.ts             # sale + low-stock orchestration
src/lib/notify-email.ts / notify-push.ts
src/lib/register-owner-push.ts
src/app/s/[standSlug]/        # PublicCart + actions
src/app/dashboard/**          # owner UI
src/components/DashboardNav.tsx
src/components/LandingHero.tsx
src/components/BrandMark.tsx / BrandLockup.tsx
src/components/NativeShellBootstrap.tsx
src/components/OwnerPushRegister.tsx
capacitor.config.ts
prisma/schema.prisma
UI-HANDOFF.md                 # older UI polish notes (tokens partly superseded)
```

Design direction (rebrand): see user Downloads `rebrand-ui-direction.md` if available — tokens: `--field`, `--leaf`, `--marigold`, `--wash`; fonts Bricolage Grotesque + DM Sans + Spline Sans Mono.

---

## 9. Known gaps / next work

1. **DB migrations** — ensure `qrSignMessage` + `PushDevice` applied on the live Postgres in use.
2. **Push production** — Xcode Push Notifications capability; real device; `FCM_SERVER_KEY` (+ Firebase/APNs for iOS). Simulator push is unreliable.
3. **SaaS billing** — $9.99 plan is copy/constants only; no Stripe Billing subscription collection yet.
4. **Connect application fee** — fee is tracked only, not skimmed.
5. **Store launch polish** — splash screens, deeper a11y/offline, more native polish; UI is TestFlight-OK, not fully “App Store refined.”
6. **npm package name** still `myfarmstand` internally — cosmetic.
7. **Inventory low-stock notify** currently fires from **sale** path after stock decrement; manual inventory adjust may not trigger alerts — check if desired.
8. Do **not** install new packages without asking the user (project rule).

---

## 10. Agent rules (repo + user)

- Prefer minimal focused diffs; no drive-by refactors.
- Keep files roughly under ~150 lines where practical; one component per file.
- No `any` / `@ts-ignore`.
- Every `fetch` must check `response.ok` before `.json()`.
- After code changes: `npm run build` green (and typecheck via build).
- Don’t commit or push unless asked.
- Don’t change Capacitor `appId` / bundle id without explicit sign-off.
- Don’t alter cash checkout copy/flow steps (customer trust path).

---

## 11. Success criteria for a continuing agent

- Product behavior stays: QR → cash or Tap & Go; owner manages stands/stock; admin desktop-only.
- Brand stays Stallside (field green + marigold sparingly).
- Sale and low-stock notifications keep working (email always; push when configured).
- Build stays green; Capacitor still opens hosted owner web at `/login`.

---

*Generated as a snapshot handoff of the Stallside MVP as of the Stallside rebrand + notifications work. Prefer the codebase over this doc if they disagree.*
