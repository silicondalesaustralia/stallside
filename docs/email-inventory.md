# Vendl email inventory

Every email the app sends, as of branch `feature/social-kit` (5 Nov 2026). Subjects are quoted from code; `Vendl` is `APP_NAME`.

All email goes through `sendOwnerEmail()` in `src/lib/notify-email.ts` (Resend). Default sender is `Vendl <hello@vendl.app>`; every send is logged to `EmailSendLog` with a `kind`. Except login codes, nothing is sent to an address belonging to a closed (soft-deleted) owner.

---

## 1. Timeline after sign-up

### Free sign-up

| When | Email | Condition |
|---|---|---|
| Immediately | **Welcome** (1.1) | New owner, not a lifetime invite |
| Day 3+ | **Note from Jono** (1.2) | Everyone |
| Day 3+ | **Optional: card payments** (1.3) | Has a business and a product, no Stripe and no active Square |
| 24h after starting Stripe | **Finish Stripe setup** (1.4) | Stripe connected but charges not enabled |
| 10th paid order | **10 orders milestone** (1.5) | Everyone |

### Pro (paid via Stripe) and lifetime

| When | Email | Condition |
|---|---|---|
| On first upgrade | **You're on Pro** (2.1) | Stripe subscription live; or lifetime invite at sign-up (replaces the Free welcome) |
| Same as Free | 1.2–1.5 | Same conditions as Free |

### Pro cancels

| When | Email | Condition |
|---|---|---|
| Cancel scheduled or cancelled | **Thanks for trying Pro** (2.2) | Not lifetime; once ever |
| Period ends | **Cash enabled** (3.11) | Only if a business was left with no payment method |
| 23 days after lapse | **Still on Free?** (2.3) | Still on Free |
| 45 days after lapse | **Remove the Vendl fee** (2.4) | Still on Free |

There is currently **no** trial sequence, Free→Pro upgrade drip, or win-back after day 45.

### How the timed emails run

One cron, `/api/cron/lifecycle`, daily at `0 9 * * *` (09:00 UTC, about 7:30pm Adelaide). It sends 1.2, 1.3, 1.4 (backup), 2.3 and 2.4. Each email has a `*SentAt` field on `Owner` so it is only sent once.

### Unsubscribe (lifecycle emails only)

Sections 1 and 2 carry a footer with an **Unsubscribe** link and one-click `List-Unsubscribe` headers. Unsubscribing sets `Owner.lifecycleEmailsOptOutAt` (page `/unsubscribe/emails`, endpoint `POST /api/lifecycle/unsubscribe`). Opted-out owners are skipped, but the `*SentAt` field is still set. Alert and transactional emails (sections 3–5) are not affected.

---

## 2. Owner lifecycle emails (Free path)

### 1.1 Welcome
- **Subject:** `Welcome to Vendl: a quick note from me`
- **From:** Jono from Vendl, reply-to hello@vendl.app
- **Trigger:** first sign-in that creates the owner (`src/lib/auth-otp-user.ts`)
- **Guard:** `trialWelcomeSentAt`
- **Content:** founder story; connect Square (recommended for AU) or Stripe, cash works too; three paths (stall checkout, pre-orders, subscriptions); Skool community invite; Open your dashboard.
- **Code:** `src/lib/lifecycle-emails/trial.ts`

### 1.2 Note from Jono (day 3)
- **Subject:** `A quick note from Jono at Vendl`
- **From:** Jono from Vendl, reply-to hello@vendl.app
- **Trigger:** lifecycle cron, account 3+ days old. All plans.
- **Guard:** `creatorDay3SentAt`
- **Content:** why Vendl was built, invites feature requests by reply, Skool line. Adds a payments paragraph if they have a business and product but no Stripe or Square.
- **Code:** `src/lib/lifecycle-emails/creator-intro.ts`, `run-creator-day3-cron.ts`

### 1.3 Optional: card payments
- **Subject:** `Optional: take card payments with Vendl`
- **Trigger:** lifecycle cron, account 3+ days old, has a business and a non-archived product, no Stripe, no active Square. All plans.
- **Guard:** `stripeNeverStartedNudgeSentAt`
- **Content:** cash and bank already work; Connect Square / Connect Stripe buttons; card is needed for pre-orders and subscription boxes.
- **Code:** `src/lib/lifecycle-emails/stripe-never-started.ts`, `run-stripe-nudges-cron.ts`

### 1.4 Finish Stripe setup
- **Subject:** `Finish Stripe setup on Vendl`
- **Trigger:** Stripe `account.updated` webhook, with the daily cron as backup. Stripe connected, charges not enabled, and onboarding complete or started 24h+ ago. All plans.
- **Guard:** `stripeRestrictedNudgeSentAt`
- **Content:** card payments and payouts paused; live list of what Stripe still needs; Continue Stripe setup.
- **Code:** `src/lib/lifecycle-emails/stripe-restricted.ts`, `send-stripe-nudges.ts`

### 1.5 10 orders milestone
- **Subject:** `Congrats on 10 orders with Vendl`
- **From:** Jono from Vendl
- **Trigger:** after a sale, when paid orders reach 10. All plans.
- **Guard:** `firstTenOrdersEmailSentAt`
- **Content:** congratulations; asks for a setup photo for the user gallery.
- **Code:** `src/lib/lifecycle-emails/milestone.ts`

### Manual broadcasts (scripts, no guard)
- **Feature announcement:** `New: Customer Choice cart, QR editor, and SMS coming soon` (`scripts/send-feature-announce.ts`; preview by default, `--all` or `--lifetime`).
- **Retrospective welcome:** re-sends 1.1 to every owner (`scripts/send-retrospective-welcome.ts`).

---

## 3. Owner lifecycle emails (Pro path)

### 2.1 You're on Pro
- **Subject:** `You're on Vendl Pro`
- **Trigger:** Stripe subscription sync when Pro is live (webhook or admin action), or lifetime invite at sign-up.
- **Guard:** `cardWelcomeSentAt` (never reset, so not re-sent on re-subscribe)
- **Content:** every feature plus no Vendl fee; four payment set-up steps; Open payment settings; guide links.
- **Note:** not sent for Pro billed via Square or PayPal.
- **Code:** `src/lib/lifecycle-emails/plans.ts`, `src/lib/stripe-billing-effects.ts`

### 2.2 Thanks for trying Pro
- **Subject:** `Thanks for trying Vendl Pro`
- **Trigger:** cancellation scheduled or subscription cancelled (not lifetime).
- **Guard:** `cancelFeedbackSentAt` (once ever)
- **Content:** stays on Free, nothing deleted; 2.5% Vendl fee applies; Pro tools pause (website, discount codes, production costing, app); Send feedback / Upgrade anytime.
- **Code:** `src/lib/lifecycle-emails/cancellation.ts`

### 2.3 Lapse day 23
- **Subject:** `Still on Vendl Free? Pro is ready when you are`
- **Trigger:** lifecycle cron, 23+ days after `proLapsedAt` (set when a Stripe subscription ends), still on Free, not lifetime.
- **Guard:** `proLapseDay23SentAt`
- **Content:** what Free still includes; Pro removes the Vendl fee; See Vendl Pro.
- **Code:** `src/lib/lifecycle-emails/lapse.ts`, `run-pro-lapse-cron.ts`

### 2.4 Lapse day 45
- **Subject:** `Remove the Vendl fee with Vendl Pro`
- **Trigger:** as 2.3, 45+ days after lapse.
- **Guard:** `proLapseDay45SentAt`
- **Content:** "{N} customers wanted card. {N} are on your restock list." (falls back to Free-includes text); See Vendl Pro.

Upgrading again clears `proLapsedAt` and the lapse flags.

---

## 4. Owner alert and transactional emails

No unsubscribe footer. "Alerts toggle" means `Owner.emailAlertsEnabled` (Settings → Alerts); recipients are the contact email plus any extra alert emails.

| Email | Subject | Trigger | Opt-out / guard |
|---|---|---|---|
| 3.1 Login code | `{code} is your Vendl code` | Sign-in or sign-up request (web and app) | Rate-limited; 10-minute expiry |
| 3.2 Sale / pre-order | `[Vendl] Sale · {business}` or `[Vendl] Pre-order · {business}` | Every paid order (card, cash, pay at pickup, subscription and membership orders) | Alerts toggle |
| 3.3 Low stock | `[Vendl] Low stock · {business}` | Stock falls to threshold after a sale | Alerts toggle; cooldown |
| 3.4 Sold out | `[Vendl] Sold out · {business}` | Stock hits 0 | Alerts toggle; cooldown |
| 3.5 Balance failed | `[Vendl] Balance failed · {order}` | Deposit balance charge fails (cron every 6h) | Each failure |
| 3.6 Shopper sub cancelled | `Subscription cancelled after failed payments · {customer}` | Square subscription retries exhausted | Once |
| 3.7 New review | `New {n}-star review about {product or business}` | Shopper submits a review | None |
| 3.8 Customer wants pre-orders/subscriptions | `[Vendl] Customer wants {pre-orders/subscriptions} · {business}` | Shopper taps interest on the storefront | **Ignores** alerts toggle |
| 3.9 Customer wants Tap & Go/PayPal | `[Vendl] Customer wants Tap & Go or PayPal · {business}` | Shopper asks after paying | Alerts toggle |
| 3.10 Supplier stock change | `[Vendl] Stock · {business}` | Supplier adds or adjusts stock | Alerts toggle |
| 3.11 Cash fallback | `Vendl: Cash enabled so checkout still works` | Pro ends and a business had no payment method left | Only when changed |
| 3.12 Supplier invite (to supplier) | `[Vendl] Add your products to {business}` | Owner invites a supplier | Each invite |
| 3.13 Website enquiry | `New enquiry from {name} - {shop}` | Contact form on a Web Studio site | Bot check; rate-limited |

Not built: payout or Stripe-connected confirmation, SaaS receipts or failed SaaS payment (Stripe's own emails only), account deletion, export ready, social credits, referral/affiliate commission.

---

## 5. Customer (shopper) emails

| Email | Subject | Trigger | Opt-out / guard |
|---|---|---|---|
| 4.1 Order confirmation | `[Vendl] Order confirmed · {business}` or `[Vendl] Pre-order confirmed · {business}` | Paid order with a receipt email (not stall cash) | — |
| 4.2 Shipped | `[Vendl] Your order has shipped · {business}` | Owner marks shipped | — |
| 4.3 Delivered | `[Vendl] Your order was delivered · {business}` | Owner marks delivered | — |
| 4.4 Complete payment | `[Vendl] Complete payment for {business}` | Deposit balance charge fails (up to 3 tries) | — |
| 4.5 Subscription welcome | `{offer} · manage your Vendl subscription` | Subscription or membership becomes active | — |
| 4.6 Payment failed | `Payment failed · {offer}` | First failed Square renewal | Once |
| 4.7 Subscription cancelled | `Subscription cancelled · {offer}` | Retries exhausted | Once |
| 4.8 Restock alert | `{business} just restocked - shop now` | **Never sent** — the sender exists but nothing calls it | Per-subscriber unsubscribe |
| 4.9 Owner message to order customer | Owner-written | Orders / Collections "Email customer" (single or bulk, max 200) | — |
| 4.10 Email campaign | Owner-written | Communications (now Pro only); batches via cron `15 * * * *` | Marketing unsubscribe; List-Unsubscribe |
| 4.11 Reply to reviewer | Owner-written | Reviews (Pro) | — |
| 4.12 Tap & Go waitlist | `Thanks for joining the Tap & Go waitlist for Vendl` | Waitlist form | — |

Not built: pre-order reminders, "ready to collect", review requests.

---

## 6. Admin emails (to Vendl)

| Email | Subject | Trigger |
|---|---|---|
| New sign-up | `[Vendl] - New User Sign Up` | Owner created |
| Billing event | `[Vendl] - {Paid Pro subscribe / Cancel scheduled / Cancel reversed / Subscription cancelled / Downgraded to Free}` | Stripe subscription change |
| Every sale | `[Vendl] {Sale/Pre-order} · {seller}` | Every paid order |
| Contact form | `[Vendl contact] {subject}` | /contact |
| Waitlist join | `[Vendl waitlist] {name}` | New waitlist join |
| Blog recommendations | `Tomorrow's blog: pick {n} of {m} ideas` | Blog agent |
| Blog digest | Set by the agent | Blog agent |

---

## 7. Issues to review

1. **Restock alerts are never sent.** Shoppers can opt in after checkout, but nothing calls `sendRestockNotifications` (`src/lib/notify-restock.ts`). The owner can only reach them via a Communications broadcast, which is now Pro.
2. **Copy now out of date with email marketing moving to Pro:**
   - 2.2 Thanks for trying Pro lists the tools that pause; email campaigns should be added.
   - 2.4 Lapse day 45 mentions the restock list; on Free they can no longer email it.
3. **Welcome (1.1) Skool section** promises "30% off Vendl Pro for life when we launch" to beta testers. Confirm this offer still stands.
4. **No Free→Pro upgrade sequence.** Free owners get no email about Pro after the welcome unless they had Pro and lapsed.
5. **Pro welcome only fires for Stripe billing**, not Square or PayPal-billed Pro.
6. **3.8 Customer wants pre-orders/subscriptions** ignores the owner's email alerts setting.
7. **Unused schema fields:** `trialDay7/14/23/28/45SentAt`, `trialReminderSentAt`, `proLapseDay0SentAt`, `cashWelcomeSentAt`, `cashUpgradeDay2/7/14SentAt` have no sender.
8. **`docs/onboarding-email-sequence.md`** (main checkout only, untracked) is out of date: most subjects, the senders, the Square wording and the unsubscribe footer have all changed. This file supersedes it.
