# Vendl × Stitchstack — pixel-first Analytics onboarding

**Audience:** Stitchstack.app agent / engineering  
**From:** Vendl (`feature/social-kit`)  
**Date:** 23 November 2026  
**Supersedes (product order):** Google-connect-first. GA4/GSC stay available as **optional enrichment**.

---

## 1. Goal

When a Vendl seller opens **Stitchstack Analytics**:

1. Vendl calls `POST /api/partners/vendl/ensure-account` (existing SSO).
2. Stitchstack provisions/attaches the partner workspace **and** a first-party analytics **site + pixel**.
3. Response includes pixel install details (`script_src` + ids).
4. Vendl **auto-installs** that pixel on the seller storefront (subdomain **and** custom domain — same published site).
5. Simple analytics start flowing in Stitchstack **without** connecting GA4 or GSC.
6. In Stitchstack, the seller may optionally connect **GA4** and/or **GSC** to enrich the same workspace.

Vendl onboarding to Stitchstack **starts with the pixel**, not with Google OAuth.

---

## 2. Product rules

| Rule | Detail |
|------|--------|
| Pixel | Created on first successful `ensure-account` for that Vendl account; idempotent thereafter |
| Free partner plan | First-party pixel analytics + optional GA4 + GSC connect |
| GA4 / GSC | Optional enrichment inside Stitchstack; never required for basic dash |
| Other Stitchstack modules | Paid upgrades inside Stitchstack |
| Vendl Tags & Pixels | Meta/TikTok/ads/etc. stay on Vendl; GA4/GSC stay **off** that page |
| Marketing pixel | Do **not** reuse Vendl’s Silicon Dales / Perform `orgId`/`siteId`. Every seller gets their **own** site |

---

## 3. End-to-end flow

```
Seller clicks Stitchstack Analytics (Vendl sidebar)
        │
        ▼
Vendl GET /dashboard/analytics/stitchstack
        │
        ▼
POST /api/partners/vendl/ensure-account
  (external_account_id, external_user_id, email, business_name, site_url, …)
        │
        ▼
Stitchstack: ensure org + user + plan
             ensure analytics Site for this partner account
             mint handoff_url
             return pixel { org_id, site_id, script_src, … }
        │
        ▼
Vendl: persist pixel on Storefront (live field)
       inject on next tenant-host page load
        │
        ▼
Redirect browser → handoff_url (Stitchstack session)
        │
        ▼
Stitchstack UI: “Collecting data” / simple analytics
               Soft CTA: Connect GA4 / GSC (optional)
```

---

## 4. API contract change — `ensure-account`

### 4.1 Request (unchanged fields)

Same as today (`partner` implied by path / API key):

| Field | Meaning |
|-------|---------|
| `external_account_id` | Vendl owner id |
| `external_user_id` | Vendl user id |
| `email`, `name` | Seller identity |
| `business_name` | Workspace label |
| `site_url` | Preferred property URL (custom domain or subdomain) |
| `role` | `owner` \| `member` |

### 4.2 Response — add `pixel`

```json
{
  "ok": true,
  "stitchstack_org_id": "org_…",
  "stitchstack_user_id": "user_…",
  "plan": "vendl_partner_free",
  "entitlements": ["pixel_analytics", "ga4", "gsc"],
  "handoff_url": "https://stitchstack.app/auth/partner/handoff?token=…",
  "pixel": {
    "org_id": "…",
    "site_id": "…",
    "view_id": "…",
    "script_src": "https://stitchstack.app/api/attribution/script?orgId=…&siteId=…&viewId=…"
  }
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `pixel.org_id` | yes | Stitchstack org for this Vendl account |
| `pixel.site_id` | yes | Analytics site scoped to this seller |
| `pixel.view_id` | no | If your script URL needs it |
| `pixel.script_src` | yes | Full HTTPS URL Vendl will inject. Host must be your app host |

**Idempotent:** Same `external_account_id` returns the same org/site/pixel; do not mint a new site every click.

**site_url:** On first create, set the Site’s primary URL from `site_url` when present. On later ensures, update primary URL if Vendl sends a new non-empty `site_url` (custom domain added later).

### 4.3 Errors

Keep existing codes. If org can be created but pixel/site fails, prefer failing the whole ensure with `provisioning_failed` so Vendl does not SSO into an empty workspace without a collect path — **or** return `ok` without `pixel` only if you document a retry endpoint. Vendl will skip install when `pixel` is missing and still redirect (backward compatible), then retry install on the next click once you ship pixel.

---

## 5. First-party analytics (Stitchstack)

Without GA4/GSC connected, Stitchstack must still show a **simple** dash from the pixel, for example:

- Sessions / pageviews (today / 7d / 30d)
- Top pages
- Referrers (if collected)
- “Waiting for first hit” empty state after install

GA4/GSC reports stay behind connect flows and enrich the same workspace.

Entitlement suggestion:

- `pixel_analytics` — always on for `vendl_partner_free`
- `ga4`, `gsc` — connectable on free; advanced modules still paid

---

## 6. What Vendl will do with `pixel` (this repo)

1. Validate `script_src` is `https:` and host matches `STITCHSTACK_APP_URL`.
2. Save on `Storefront.stitchstackPixel` (live JSON, not draft Tags & Pixels).
3. Inject via a dedicated storefront component on **tenant hosts only** (seller subdomain + custom domain), respecting the same consent cookie as Tags & Pixels.
4. Not gated on Vendl Pro (Analytics is for all sellers). Tags & Pixels Pro gate unchanged.
5. Never use the Vendl marketing Perform pixel ids for sellers.

---

## 7. Security

- Partner API key server-to-server only.
- Handoff tokens stay short-lived, single-use.
- Pixel script URL is public (browser-loaded); do not put secrets in query string beyond org/site ids.
- Allowlist script host on Vendl so a compromised response cannot inject arbitrary third-party JS.

---

## 8. Acceptance criteria (Stitchstack)

- [ ] `ensure-account` returns `pixel.script_src` for new and existing Vendl partner orgs.
- [ ] Same Vendl `external_account_id` always maps to the same site/pixel.
- [ ] Hitting the script URL records page traffic for that site without Google connected.
- [ ] Partner UI shows a basic analytics view from pixel data.
- [ ] Soft CTA to connect GA4 and GSC; neither is required to see basic data.
- [ ] Staging key + sample response shared with Vendl.

---

## 9. Implementation order (Stitchstack)

1. Site + pixel provision inside `ensure-account` (idempotent).
2. Extend JSON response with `pixel`.
3. Partner landing: pixel empty state → simple dash.
4. Keep GA4/GSC connect as optional enrichment.
5. (Later) `GET /api/partners/vendl/analytics-summary` if Vendl embeds a lite dash in-app.

---

## 10. One-line summary

**On ensure-account, create a per-seller first-party pixel, return `script_src` for Vendl to auto-install, and treat GA4/GSC as optional enrichment — not the start of onboarding.**
