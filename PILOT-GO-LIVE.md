# Stallside - Pilot go-live checklist (own stall)

**Goal:** Stallside running live on Vercel + Postgres, owner app on our iPhone, real QR on our own stall, real cash + real card sales end to end.

**Not the goal:** App Store approval, SaaS billing collection, other owners. Ignore all of that.

Supersedes nothing in the handoff doc - this is the *sequenced task list* to reach a working pilot. Repo rules in §10 of the handoff still apply.

---

## 0. Decisions to make before starting

| Item | Decision | Why it matters |
|---|---|---|
| **Domain** | Point **`stallside.app`** at Vercel. Do NOT pilot on `*.vercel.app`. | Stripe live-mode Connect wants a real business URL. QR posters printed with a `vercel.app` URL look untrustworthy at a roadside stall - the whole product is *trust for unmanned payment*. |
| **Stripe mode** | Test mode first (steps 1-7), then flip to live (step 8). | Prove the flow without moving real money. |
| **iOS install** | Xcode direct-to-device or TestFlight **internal** testing. | **No App Store review needed.** Xcode free provisioning certs expire after 7 days; TestFlight internal lasts 90 days and needs no review - prefer TestFlight. |
| **Push on iOS** | Requires paid Apple Developer account ($99/yr) + APNs key + Firebase. | If not ready, pilot with **email alerts only** and add push after. Do not let push block the stall going live. |

---

## 1. Deploy to Vercel + Postgres

- [ ] Create Vercel project from repo; framework preset Next.js.
- [ ] Provision Postgres (Vercel Postgres or Neon/Supabase). Copy connection string.
- [ ] Add custom domain `stallside.app` in Vercel; update DNS; wait for SSL to go green.
- [ ] Set env vars in Vercel (Production):
  - `DATABASE_URL` - pooled connection string
  - `NEXT_PUBLIC_APP_URL=https://stallside.app`
  - `AUTH_SECRET` - generate fresh (`openssl rand -base64 32`), **not** the local one
  - `AUTH_URL=https://stallside.app`
  - `STRIPE_SECRET_KEY` - **test key** (`sk_test_…`) for now
  - `STRIPE_WEBHOOK_SECRET` - filled in at step 4
  - `RESEND_API_KEY` + `EMAIL_FROM` - **required**; magic-link login won't work in prod with console logging
- [ ] **Run migrations against the prod DB.** Handoff §9.1 flags this: `qrSignMessage` and `PushDevice` may not be applied. Run `npx prisma migrate deploy` with prod `DATABASE_URL`, then verify all three migrations (`init`, `add_qr_sign_message`, `add_push_devices`) are in `_prisma_migrations`.
- [ ] Confirm Prisma client generates on Vercel build (`prisma generate` in build step / `postinstall`).
- [ ] Deploy. Hit `https://stallside.app` - landing page renders.

**Gate:** landing page live on the real domain over HTTPS.

---

## 2. Email must work (blocks everything)

Magic-link auth is the only way in, and in production it can't print to a console.

- [ ] Resend account; verify sending domain for `stallside.app` (SPF/DKIM records).
- [ ] Set `EMAIL_FROM` to a verified address (e.g. `hello@stallside.app`).
- [ ] Test: request a magic link at `/login`, confirm the email arrives on the iPhone.
- [ ] Check spam folder. If it lands in spam, fix DNS before printing any QR codes.

**Gate:** magic link arrives in the inbox within 30s and logs us in.

---

## 3. Wrap the owner app onto the iPhone

- [ ] Set `CAPACITOR_SERVER_URL=https://stallside.app` (or remove the override so it uses the built-in prod URL - confirm which `capacitor.config.ts` expects).
- [ ] `npx cap sync ios`
- [ ] Open in Xcode, set signing team, build to the physical iPhone.
- [ ] **Preferred:** archive → upload to TestFlight → install via TestFlight (internal testers need no review; 90-day builds).
- [ ] Verify: app opens to `/login`, magic link email opens the app or Safari and completes sign-in, session persists after force-quit.

**Gate:** we can sign in as an owner from the app icon on the home screen.

---

## 4. Stripe wiring (test mode)

- [ ] Stripe Dashboard → **Connect** enabled (Express).
- [ ] Webhook endpoint: `https://stallside.app/api/stripe/webhook`. Events at minimum: `checkout.session.completed`. Add `checkout.session.async_payment_succeeded` / `.failed` if the code handles them.
- [ ] Copy the signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel → redeploy.
- [ ] In the app: Settings → Stripe → complete **Connect Express onboarding** for our own stall (test mode lets you skip real verification).
- [ ] Confirm the connected account ID is stored against the owner and `charges_enabled` is true.

**Apple Pay note:** we use hosted **Stripe Checkout**, so Apple Pay / Google Pay work with **no domain registration and no extra config**. Domain registration is only required for Elements integrations. Don't waste time on `.well-known` files.

**Gate:** Stripe dashboard shows a connected account; webhook shows a successful test delivery (send one from the Stripe dashboard).

---

## 5. Set up the real stall in the app

Do all of this on the iPhone, in the field, as a real owner would. Note anything that's awkward - this is our first real UX signal.

- [ ] Onboarding: business name, contact.
- [ ] Create stand: name, currency (AUD), `qrSignMessage`.
- [ ] Add real products: eggs - real price, real stock count, sensible `lowStockThreshold` (set it 1-2 above current stock so we can *deliberately* trip the low-stock alert during testing).
- [ ] Confirm exact-stock display is OFF (default) → customer sees `Available` / `Low stock` / `Sold out`.
- [ ] Generate + download the QR poster from `/dashboard/stands/[standId]/qr`.
- [ ] **Check the printed QR resolves to `https://stallside.app/s/{slug}`** - not localhost, not vercel.app. Scan it with a phone camera before printing.
- [ ] Print, laminate (it will rain), fix to the stall.

**Gate:** a stranger with a phone can scan the sign and reach our stall page.

---

## 6. End-to-end test - CASH (test mode)

Do this standing at the stall, on mobile data, not wifi.

- [ ] Scan QR → stall page loads → products, prices, stock states correct.
- [ ] Add 2 items → sticky bar total correct.
- [ ] Continue to payment → **Pay cash**.
- [ ] Cash confirm copy shows the right amount ("place $X in the cash slot").
- [ ] Tap **I have paid cash**.
- [ ] Verify:
  - [ ] Order appears in `/dashboard/orders` as `CUSTOMER_CONFIRMED`
  - [ ] Stock decremented by the right amount
  - [ ] **Sale email** arrives ("Sale · {stand}")
  - [ ] **Push** arrives (if configured)

---

## 7. End-to-end test - CARD (test mode)

- [ ] Scan QR → add items → Continue to payment → **Card / Tap & Go**.
- [ ] Redirects to Stripe Checkout on the phone.
- [ ] Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC.
- [ ] Redirects back to `/checkout/success`.
- [ ] Verify:
  - [ ] Order is `PAID`
  - [ ] Stock decremented **once** (not twice - webhook *and* success page both fulfil; confirm idempotency)
  - [ ] `platformFeeCents` recorded at 2%
  - [ ] Sale email + push
  - [ ] Stripe dashboard shows the payment against the **connected account**

### Low-stock alert
- [ ] Buy enough to push a product to/below `lowStockThreshold`.
- [ ] Low-stock email + push arrives.
- [ ] Buy again within 6h → **no second alert** (cooldown works).
- [ ] Buy the last unit → product shows **Sold out** and can't be added to cart.

**Gate:** both payment paths complete, stock is right, alerts fire, orders dashboard is accurate.

---

## 8. Flip to LIVE Stripe (real money)

Only after 6 and 7 pass cleanly.

- [ ] Complete **real** Connect Express onboarding: ABN, bank account, ID.
- [ ] Swap Vercel env to live keys: `sk_live_…`.
- [ ] Create a **new webhook endpoint in live mode** (test-mode secrets don't carry over) → update `STRIPE_WEBHOOK_SECRET` → redeploy.
- [ ] Do one **real card sale on our own stall for a real, small amount** (buy our own eggs with a real card). Confirm the money lands in the bank account.
- [ ] Do one **real Apple Pay / Tap & Go sale** from an iPhone wallet - this is the actual feature customers will use, and it's the one thing test cards can't validate.

**Gate:** real dollars in the real bank account.

---

## 9. Fix-before-real-customers list (from handoff §9)

- [ ] **Manual inventory adjust doesn't trigger low-stock alerts** (§9.7) - restocking is the main field action; decide whether it should. Likely yes.
- [ ] Offline behaviour: what happens when a customer scans with one bar of signal? Test it. A blank page at the gate = a lost sale and a dead stall.
- [ ] What happens if stock hits 0 mid-checkout for another customer? Race condition on decrement.
- [ ] Error state if Stripe Checkout fails / customer bails → `/checkout/cancelled` restores the cart.

---

## 10. What we're actually learning from the pilot

Write these down as we go - they're worth more than the code:

1. **How long does the whole customer flow take, standing at a gate on 3G?** If it's over ~30 seconds, card adoption dies.
2. **Do people actually use it, or ignore the sign and put cash in the tin?** This is the single most important number in the business.
3. **What's the real weekly takings figure?** (Still unvalidated. Pricing depends on it.)
4. **Does the sale notification feel good?** ("Someone just paid $12 at your gate" arriving while feeding the chooks is the moment that sells this to other farmers.)
5. **What broke in the paddock that never broke on the desk?**

---

## Definition of done for this stage

Our own stall is live on `stallside.app`, with a laminated QR on the gate, taking **real** cash confirmations and **real** card/Apple Pay payments, with the owner app on the iPhone firing sale and low-stock alerts - and we've bought our own eggs with a real card to prove it.
