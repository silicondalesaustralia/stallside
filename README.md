# Vendl

QR self-checkout and inventory for unmanned farm stands. Domain: **[vendl.app](https://vendl.app)**

Repo: [silicondalesaustralia/vendl](https://github.com/silicondalesaustralia/vendl)

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Auth.js magic-link sign-in
- PostgreSQL + Prisma
- Stripe Connect + Checkout (Apple Pay / Google Pay)
- Capacitor owner app (iOS / Android)

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` + `AUTH_SECRET`.
2. `npm install`
3. `npx prisma migrate deploy` (or `migrate dev`)
4. `npm run dev`
5. Open http://localhost:3000 - without `RESEND_API_KEY`, magic links print in the server console.

## Pilot / Vercel

See `PILOT-GO-LIVE.md` for the sequenced checklist.

Import this repo into Vercel (Next.js). Production env must include at least:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL=https://vendl.app`
- `AUTH_SECRET` / `AUTH_URL=https://vendl.app`
- `RESEND_API_KEY` + `EMAIL_FROM` (required in prod)
- Stripe test keys first, then live

Build runs `prisma migrate deploy` then `next build`.

Point DNS for `vendl.app` at Vercel. Do not pilot QR posters on `*.vercel.app`.

## Product decisions (MVP)

- Plans: **$6.99/mo** Cash (live) · **$19.99/mo** Card (coming soon, waitlist)
- **No transaction fees** on either plan
- Exact public stock off by default
- Cash sales: customer-confirmed, logged only
- Currency: per stand

## Owner mobile shell

```bash
CAPACITOR_SERVER_URL=https://vendl.app npx cap sync ios
npm run cap:ios
```

Local Simulator: `CAPACITOR_SERVER_URL=http://127.0.0.1:3000`

## Stripe

1. Add `STRIPE_SECRET_KEY` + webhook secret
2. Owner: **Settings → Manage Stripe connection**
3. Prod webhook: `https://vendl.app/api/stripe/webhook` (`checkout.session.completed`)

## Platform admin

```bash
npm run admin:promote -- you@example.com
```

Then open `/admin`.
