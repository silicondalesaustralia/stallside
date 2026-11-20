# Vendl × Stitchstack Analytics — partner integration brief

**Audience:** Stitchstack.app agent / engineering  
**From:** Vendl (customer accounts / social-kit dashboard)  
**Date:** 20 November 2026  
**Both products:** Next.js

---

## 1. Goal

Vendl sellers get **Stitchstack Analytics** inside the Vendl dashboard.

- Footer sidebar control (below **Go To Skool**): **Stitchstack Analytics** — highlighted external-style entry, same pattern as Skool
- Click opens Stitchstack and **auto-logs the seller into their Stitchstack account** (SSO / handoff)
- **Every Vendl-linked account** gets **GA4** and **Google Search Console (GSC)** included at no charge
- All other Stitchstack product features stay **paid inside Stitchstack**; Vendl does not sell or gate those upgrades

Vendl owns discovery and entry. Stitchstack owns analytics product, Google connections, entitlements beyond GA4/GSC, and billing for upgrades.

---

## 2. Product rules (non-negotiable)

| Rule | Detail |
|------|--------|
| Free for Vendl users | GA4 + GSC only |
| Gated surface | Partner-provisioned accounts must **only** expose GA4 and GSC until the user upgrades in Stitchstack |
| Paid features | Upgrades happen **inside Stitchstack** (pricing, checkout, entitlements) |
| Vendl billing | Vendl does **not** charge for Stitchstack Analytics or map Stitchstack paid plans onto Vendl Pro |
| Branding | Nav label: **Stitchstack Analytics**. Destination host: `stitchstack.app` |

“Gated GA4 and GSC accounts only” means: same Stitchstack product, partner plan that unlocks only those two modules (and the minimum UI to connect Google and view reports). No SEO suite, attribution upsells, multi-property packs, or other modules until they upgrade on Stitchstack.

---

## 3. User journey

1. Seller is signed into Vendl dashboard.
2. They open **Stitchstack Analytics** (below Go To Skool in the sidebar / More menu on mobile).
3. Vendl calls Stitchstack (server-to-server) to ensure a partner account exists, then receives a **one-time handoff URL** (or equivalent signed session).
4. Browser redirects to Stitchstack already authenticated.
5. Seller lands on a **GA4 / GSC** home (connect Google if needed, then reports).
6. If they want more Stitchstack features, they upgrade **in Stitchstack**. After upgrade, the same account unlocks those modules. Vendl keeps pointing at the same SSO entry.

First click may provision; later clicks reuse the linked account and only mint a new short-lived login.

---

## 4. Identity and account model

### 4.1 Link keys

Stable external IDs from Vendl (do not key only on email):

| Field | Meaning |
|-------|---------|
| `partner` | Constant: `vendl` |
| `external_account_id` | Vendl business / account id (tenant) |
| `external_user_id` | Vendl user id of the person clicking |
| `email` | Current user email (login hint + invites; may change) |
| `business_name` | Display name for the Stitchstack workspace |
| `site_url` (optional) | Primary storefront / custom domain when known |

One Stitchstack **workspace / org** per Vendl `external_account_id`. Multiple Vendl team members map as members of that workspace via `external_user_id`.

### 4.2 Provisioning behaviour

On first successful partner ensure/login:

1. Create (or attach) a Stitchstack org/workspace tagged `partner=vendl`, `external_account_id=…`.
2. Create (or attach) the user by `external_user_id` + email.
3. Apply plan: **`vendl_partner_free`** (or equivalent) → **GA4 + GSC only**.
4. Do **not** create a full Stitchstack trial with every module unlocked.
5. Return a handoff URL that logs that user into that workspace.

Idempotent: same `partner` + `external_account_id` (+ user) must not create duplicates.

### 4.3 Team / roles (recommended)

- Vendl **owner** → Stitchstack org admin (can connect Google, manage GA4/GSC, upgrade).
- Vendl **team member** → member with access to GA4/GSC views; upgrade may be admin-only.

If v1 is owner-only SSO, document that and reject non-owners with a clear error Vendl can show.

---

## 5. API Stitchstack must expose

Build on **Stitchstack.app** (Next.js API routes or equivalent). Auth: shared secret / partner API key in headers (e.g. `Authorization: Bearer …` or `X-Vendl-Partner-Key`). Rotate via env; never embed in the browser.

### 5.1 `POST /api/partners/vendl/ensure-account`

**Purpose:** Create or update the gated partner account; return SSO handoff.

**Request (JSON):**

```json
{
  "external_account_id": "acc_…",
  "external_user_id": "usr_…",
  "email": "seller@example.com",
  "name": "Jane Seller",
  "business_name": "Jane's Farm Stand",
  "site_url": "https://janesfarm.vendl.com",
  "role": "owner"
}
```

**Response (JSON):**

```json
{
  "ok": true,
  "stitchstack_org_id": "org_…",
  "stitchstack_user_id": "user_…",
  "plan": "vendl_partner_free",
  "entitlements": ["ga4", "gsc"],
  "handoff_url": "https://stitchstack.app/auth/partner/handoff?token=…"
}
```

`handoff_url` must be **single-use**, short TTL (e.g. 60–120s), bound to that user/org.

### 5.2 `POST /api/partners/vendl/handoff` (optional split)

If ensure and handoff are separate: ensure returns ids; handoff accepts the same identity payload (or org/user ids) and returns a fresh `handoff_url`.

### 5.3 Handoff consumption

`GET /auth/partner/handoff?token=…` (or POST):

1. Validate token (signature, expiry, single use).
2. Create Stitchstack session cookie / JWT.
3. Redirect to partner landing: e.g. `/app/analytics/ga4` or `/app/partner/vendl/home` that only surfaces GA4 + GSC for `vendl_partner_free`.

### 5.4 Errors Vendl needs

Return structured JSON, e.g.:

| Code | When |
|------|------|
| `unauthorized` | Bad partner key |
| `invalid_payload` | Missing ids / email |
| `user_not_allowed` | Role not permitted for SSO |
| `provisioning_failed` | Internal create failure |

Vendl will show a generic retry message; log detail on Stitchstack.

---

## 6. Entitlements: gated free plan

Define plan **`vendl_partner_free`** (name flexible):

**Included**

- Connect Google account for GA4
- Connect / verify GSC property
- View GA4 and GSC reports / dashboards that Stitchstack already offers for those products
- Basic workspace settings needed for those two products

**Excluded until upgrade in Stitchstack**

- Any other Stitchstack modules (SEO tools, attribution products, extra properties beyond free limits you set, team seats beyond your free cap, etc.)
- Partner accounts must not inherit a default “everything unlocked” trial

**Upgrade path**

- In-product CTA in Stitchstack: upgrade / pricing
- After paid plan activates, entitlements expand on the **same** org
- Vendl SSO continues to work; no second account
- Optional webhook later: `plan_changed` → Vendl can show “Analytics: Free (GA4 + GSC)” vs “Analytics: Stitchstack Pro” if useful; **not required for v1**

Enforce entitlements **server-side** on Stitchstack routes and APIs, not only in the UI.

---

## 7. What Vendl will build (for context)

1. Highlighted footer nav control **Stitchstack Analytics** (below Go To Skool; teal accent vs Skool violet).
2. Server route e.g. `/dashboard/analytics/stitchstack` (or `/api/…/stitchstack-handoff`) that:
   - Requires Vendl session
   - Calls `ensure-account` with account/user ids
   - Redirects to `handoff_url`
3. Partner API key + Stitchstack base URL in Vendl env (server only).
4. No embedding of Stitchstack UI in an iframe for v1 unless both sides agree later — **full redirect SSO** is the default.

Until SSO ships, the sidebar may open `https://stitchstack.app` directly (same external-tab pattern as Skool). Swap the href to the Vendl handoff route when the partner API is live.

**Tags & Pixels (Vendl):** Meta/TikTok/ads/other platform tags stay editable on `/dashboard/website/tags-pixels`. **GA4 and GSC are removed from that page** and stripped from storefront injection so sellers use Stitchstack for those. The page notes base-level pixels vs advanced tracking on Stitchstack.

Existing Vendl use of Stitchstack today is **attribution pixel / lead** (`stitchstack.app/api/attribution/script`, `StitchStackIdentity`). That is separate from this Analytics partner SSO. Do not overload that orgId/script for seller analytics accounts.

---

## 8. Security

- Partner API key only on servers.
- Handoff tokens: signed, short-lived, one-time, scoped to `external_user_id` + org.
- Reject handoff if email/`external_user_id` mismatch vs provisioned user.
- Impersonation: if Vendl support is impersonating a seller, **do not** mint a Stitchstack handoff (or mark it clearly and prefer block). Vendl already skips StitchStack identity when `session.impersonator` is set — mirror that for Analytics SSO.
- CORS not required for browser→Stitchstack handoff if Vendl only redirects.
- Rate-limit ensure/handoff per partner key and per `external_account_id`.

---

## 9. Suggested implementation order (Stitchstack)

1. Partner plan + entitlement flags: `ga4`, `gsc` only for `vendl_partner_free`.
2. Data model: partner link fields on org + user (`partner`, `external_account_id`, `external_user_id`).
3. `ensure-account` + handoff token + consume route.
4. Partner landing UI: GA4 + GSC only; upgrade CTAs for everything else.
5. Smoke test with a fixed Vendl test account id.
6. Share staging base URL + test partner key with Vendl.
7. Production keys and monitoring on ensure/handoff failures.

---

## 10. Acceptance criteria

- [ ] Vendl can ensure an account with only partner key + identity payload.
- [ ] Response includes a working `handoff_url` that logs the user in without a password form.
- [ ] Fresh partner users see **only** GA4 and GSC product surfaces.
- [ ] Re-ensure is idempotent (same org/user).
- [ ] Upgrade inside Stitchstack unlocks more features on the same account; SSO from Vendl still works.
- [ ] Invalid/expired handoff tokens fail closed.
- [ ] Docs for Vendl: endpoint paths, payload, error codes, staging credentials.

---

## 11. Out of scope for v1

- Vendl charging for Stitchstack modules
- Syncing Stitchstack invoices into Vendl
- Deep-linking every Stitchstack report from Vendl
- Replacing Vendl’s own Tags & Pixels / storefront GA4 Measurement Protocol with Stitchstack
- Changing the existing Silicon Dales / Perform attribution script integration

---

## 12. Open points to confirm with Stitchstack

1. Exact free limits (one GA4 property? one GSC property? seat caps?).
2. Whether Google OAuth is already fully implemented for GA4/GSC in Stitchstack (reuse vs build).
3. Preferred handoff mechanism (one-time URL vs form POST vs shared JWT).
4. Staging environment URL for partner API.
5. Whether workspace is 1:1 with Vendl account even if the seller already has a personal Stitchstack login on the same email (recommend: **link by external ids**; offer “merge” only as a later admin flow).

---

## 13. One-line summary for the Stitchstack agent

**Expose a Vendl partner API that provisions a Stitchstack workspace gated to GA4 + GSC only, returns a short-lived SSO handoff URL, and leaves all further monetisation and feature unlocks to Stitchstack’s own upgrade flows.**
