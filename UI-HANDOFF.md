# Stallside — UI improvement handoff

> **Rebrand:** Product name is **Stallside** (`stallside.app`). See `rebrand-ui-direction.md` for tokens, fonts, and layout. Flow constraints below still apply.

Give this file to another agent whose job is to **improve UI/UX only**. Backend flows exist; do not redesign product logic unless a UI change requires minor wiring.

---

## 1. Product (context)

**MyFarmStand** is a QR self-checkout + inventory SaaS for unmanned farm stands / honesty stalls.

| Audience | Surface | Job |
|----------|---------|-----|
| **Customer** | Phone browser via printed QR → `/s/{slug}` | Pick items, pay cash or card/Tap & Go |
| **Owner** | Web dashboard + Capacitor iOS/Android shell | Stands, products, stock, orders, QR print, Stripe |
| **Platform admin** | Desktop browser `/admin` only | Owners, stands, orders overview |

**Not in scope for UI pass:** customer App Store directory, PayPal, hardware readers, native redesign of Capacitor chrome.

---

## 2. Stack

- Next.js 16 App Router + TypeScript + Tailwind CSS v4
- Auth.js (magic link); Capacitor owner shell loads hosted web app
- Prisma + PostgreSQL
- Stripe Connect Express + Checkout (Apple Pay / Google Pay via card Checkout)
- Path alias: `@/*` → `src/*`
- Source root: `src/`

**Run locally:** `npm run dev` → usually `http://localhost:3000`

**Owner mobile shell:** Capacitor wraps the same web UI (`capacitor.config.ts` → `/login`). UI must work well on **narrow phone widths** (owner in the field).

---

## 3. Design tokens (keep / evolve carefully)

Defined in `src/app/globals.css`:

| Token | Value | Use |
|-------|-------|-----|
| `--wash` | `#e8efe4` | Page background |
| `--panel` | `#f7faf5` | Surfaces |
| `--ink` | `#1a2e1a` | Primary text |
| `--muted` | `#5a6b57` | Secondary text |
| `--line` | `#c9d6c4` | Borders |
| `--leaf` | `#2f6b3a` | Primary buttons |
| `--leaf-dark` | `#1f4d28` | Brand / hover |

**Fonts** (`src/app/layout.tsx`):

- Display: **Fraunces** → `var(--font-display)` (brand name)
- Body: **DM Sans** → `var(--font-body)`

**Direction:** farm / outdoor, calm green, not generic SaaS purple or cream+terracotta AI cliché. Prefer atmosphere (existing soft gradients) over flat white dashboards. Avoid card-heavy “admin template” look unless needed for interaction.

**Brand rule:** On marketing/landing, **MyFarmStand** should be a hero-level signal, not only nav text.

---

## 4. Routes to polish

### Public / marketing

| Route | File | Notes |
|-------|------|-------|
| `/` | `src/app/page.tsx` | Landing — brand-first hero |
| `/login` | `src/app/login/page.tsx` | Owner magic-link sign-in |
| `/login/check-email` | `src/app/login/check-email/*` | Local: paste magic link helper |
| `/onboarding` | `src/app/onboarding/page.tsx` | Business name setup |
| `/s/[standSlug]` | `src/app/s/[standSlug]/*` | **Customer checkout** — highest UX priority |
| `/checkout/success` | `src/app/checkout/success/page.tsx` | After Stripe |
| `/checkout/cancelled` | `src/app/checkout/cancelled/page.tsx` | Abandoned card |

### Owner dashboard

| Route | File | Notes |
|-------|------|-------|
| `/dashboard` | `…/dashboard/page.tsx` | Today’s sales, low stock, QR shortcuts |
| `/dashboard/stands` | `…/stands/page.tsx` | “My stands” list + QR & print links |
| `/dashboard/stands/new` | `…/stands/new/page.tsx` | Create stand |
| `/dashboard/stands/[standId]` | `…/stands/[standId]/page.tsx` | Edit + QR preview |
| `/dashboard/stands/[standId]/qr` | `…/stands/[standId]/qr/*` | Print / download QR |
| `/dashboard/products` | `…/products/*` | Catalog |
| `/dashboard/inventory` | `…/inventory/*` | Field restock — mobile-critical |
| `/dashboard/orders` | `…/orders/page.tsx` | Sales list |
| `/dashboard/settings` | `…/settings/page.tsx` | Account |
| `/dashboard/settings/stripe` | `…/settings/stripe/page.tsx` | Connect Stripe |

Nav: `src/components/DashboardNav.tsx`

### Admin (desktop)

| Route | File |
|-------|------|
| `/admin` | `src/app/admin/page.tsx` |
| `/admin/owners` | `…/owners/page.tsx` |
| `/admin/stands` | `…/stands/page.tsx` |
| `/admin/orders` | `…/orders/page.tsx` |

Nav: `src/components/AdminNav.tsx` — keep clearly “Admin”, desktop-first.

---

## 5. Customer checkout UX (must preserve)

Flow in `PublicCart.tsx`:

1. Select quantities  
2. **Continue to payment**  
3. Choose **Pay cash** or **Card / Tap & Go (Apple Pay · Google Pay)**  
4. Cash → confirm copy (“place $X in the cash slot” → **I have paid cash**)  
5. Card → redirect Stripe Checkout  

**Stock display:** default is not exact counts — `Available` / `Low stock` / `Sold out` (exact only if owner enables `showExactStock`).

**Do not remove** payment method labels or cash confirmation step without product sign-off.

---

## 6. Owner UX priorities for UI pass

1. **Mobile-first dashboard** — thumb-friendly nav, inventory adjust, big QR actions  
2. **QR always findable** — My stands → “QR & print”; print page already has Print / Download / Copy  
3. **Field inventory** — `/dashboard/inventory` should feel fast at the stall  
4. **Landing** — stronger brand composition, less generic marketing  
5. **Checkout** — clearer hierarchy, larger tap targets, trust for unmanned payment  
6. **Empty states** — stands/products/orders with clear next action  

---

## 7. Code constraints (repo rules)

- Prefer **editing existing files**; don’t rewrite whole trees  
- Keep components focused; aim **&lt; ~150 lines** per file; one component per file  
- No `any` / `@ts-ignore`  
- After UI changes: `npm run build` must pass  
- Don’t install new packages unless asked  
- Don’t change Stripe/auth/checkout business logic unless required for UI  
- CSS variables in `globals.css` — extend rather than scatter one-off hex everywhere  

---

## 8. Product decisions already locked

- SaaS **$9.99/mo**, unlimited stands/products  
- Platform fee **2% on card only** (tracked; no Connect application fee in MVP)  
- Cash = logged only (no refunds UI)  
- Currency **per stand**  
- Owner app first; customer directory app **later**  
- Payments: **QR + Cash + Stripe card/Apple Pay/Google Pay** (no PayPal in MVP; no physical reader required)  
- Admin = **desktop web only** (not in Capacitor)  

---

## 9. Suggested UI work order

1. `/s/[standSlug]` customer checkout  
2. Owner mobile shell: nav + inventory + stands/QR  
3. Landing `/`  
4. Login / onboarding polish  
5. Admin tables (light polish only)  

---

## 10. Out of scope for this UI agent

- Implementing Stripe keys / webhook ops  
- Push notifications  
- Customer-facing App Store directory  
- Hardware / NFC readers  
- Changing fee model or data schema (unless trivial display-only)  

---

## 11. Quick file map

```text
src/app/globals.css          # tokens + background
src/app/layout.tsx           # fonts
src/app/page.tsx             # landing
src/app/s/[standSlug]/      # customer checkout
src/app/dashboard/**         # owner app
src/app/admin/**             # platform admin
src/components/DashboardNav.tsx
src/components/AdminNav.tsx
src/components/DashboardStat.tsx
src/components/FormField.tsx
src/components/NativeShellBootstrap.tsx  # Capacitor only — leave alone unless needed
```

---

**Success criteria for UI pass:** Customer checkout feels trustworthy on a phone at a roadside stand; owner can manage stock and print QR comfortably on iPhone; landing reads as MyFarmStand (not a generic template); build stays green.
