# Phase 9 — Cloudflare Domain Infrastructure Runbook

**Separate from application code completeness.**

Statuses to report:

- `CLOUDFLARE INFRASTRUCTURE NOT APPLIED` | `PARTIALLY APPLIED` | `VERIFIED`
- `CLOUDFLARE → VERCEL ROUTING VERIFIED` | `NEEDS WORK`

---

## 1. Enable Cloudflare for SaaS (vendl.app zone)

1. Cloudflare dashboard → zone `vendl.app` → SSL/TLS → Custom Hostnames (SaaS)
2. Enable Cloudflare for SaaS
3. Note included custom hostname quota (verify current pricing/limits before launch)

## 2. Wildcard `*.vendl.app`

Follow [`VENDL-PHASE-4C-SUBDOMAIN-DNS.md`](VENDL-PHASE-4C-SUBDOMAIN-DNS.md):

- Vercel project domain: `*.vendl.app`
- Cloudflare DNS: `*` CNAME → Vercel (DNS only)
- ACME NS delegation for wildcard TLS

## 3. Fallback origin

Configure Cloudflare for SaaS **fallback origin** to the Vercel deployment hostname that serves Vendl production (e.g. `vendl.vercel.app` or the apex origin Cloudflare already proxies).

Document the exact hostname used after the spike.

## 4. Friendly CNAME target `customers.vendl.app`

1. Create DNS record `customers` CNAME → Cloudflare SaaS target / fallback as documented by CF
2. Set env `CLOUDFLARE_SAAS_CNAME_TARGET=customers.vendl.app`

Sellers CNAME `www` (or `shop`) → `customers.vendl.app`.

## 5. Cloudflare → Vercel spike

Prove:

```text
test hostname
  → CF Custom Hostname
  → customers.vendl.app
  → fallback origin
  → Vercel
  → Vendl tenant resolve
```

Confirm: TLS active, Host preserved or trusted CF header, deep paths, shop pages.

If a Worker is required to preserve Host, document minimal Worker here.

## 6. API token

Scoped token (not Global API Key) with Custom Hostnames + SSL permissions for the zone.

Env (server only):

```text
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_SAAS_CNAME_TARGET=customers.vendl.app
CUSTOM_DOMAINS_ENABLED=0
CUSTOM_DOMAINS_ROUTING_ENABLED=0
DOMAINS_INTERNAL_LOOKUP_SECRET=
NEXT_PUBLIC_STOREFRONT_SUBDOMAIN_PRIMARY=0
```

## 7. Feature flags / rollout

1. Deploy app with flags **off**
2. Apply CF SaaS + fallback + customers CNAME
3. Spike test hostname
4. Set `CUSTOM_DOMAINS_ENABLED=1` for Pro connect UI
5. Set `CUSTOM_DOMAINS_ROUTING_ENABLED=1` after spike passes
6. Optionally set `NEXT_PUBLIC_STOREFRONT_SUBDOMAIN_PRIMARY=1`

## 8. Rollback

- Set routing/enabled flags to `0`
- Disconnect custom hostnames via dashboard or CF API
- Path URLs `/shop/{slug}` continue to work
- QR `/s/{stand}` unchanged on apex

## 9. Local development

- `{slug}.localhost:3000` preserved
- Without CF credentials, connect flow can mark ACTIVE in non-production for UX testing only
- Do not require production CF calls for ordinary local studio work

## Spike procedure (ops)

1. Pick a Vendl-owned hostname (e.g. `shop.vendl-test.com` or a spare subdomain you control).
2. In Cloudflare for SaaS on `vendl.app`, create a Custom Hostname for that name; set fallback origin to the production Vercel hostname.
3. Ensure seller CNAME target `customers.vendl.app` resolves as documented by Cloudflare SaaS.
4. Point the test hostname’s DNS CNAME → `customers.vendl.app`.
5. Wait until CF reports hostname + SSL **active**.
6. Temporarily set in the deployment env:
   - `CUSTOM_DOMAINS_ENABLED=1`
   - `CUSTOM_DOMAINS_ROUTING_ENABLED=1`
   - CF API token / zone / account ids
7. Via Domains UI (or DB + CF API), connect the hostname to Green Valley (or a fixture storefront), verify ACTIVE, make primary.
8. Confirm checks in the table below; then write results into RESULT.md and flip statuses.

If the `Host` header arriving at Next.js is the fallback origin instead of the custom hostname, document whether a minimal Worker rewrite is required before enabling routing for sellers.

## 10. Origin Host rewrite (required for Vercel — sellers do NOT add domains in Vercel)

Vercel returns `DEPLOYMENT_NOT_FOUND` if `Host` is an unknown seller hostname. Cloudflare for SaaS forwards the seller `Host` by default. Fix at the edge:

### A. Healthy fallback on Vercel

1. Vercel project → Domains → add **`fallback.vendl.app`** (Production or the env SaaS should hit).
2. Cloudflare DNS for `vendl.app`: **`fallback`** CNAME → Vercel target, **DNS only** (grey). Proxied fallback often causes **525**.

### B. Preserve seller hostname + override origin Host

In Cloudflare → zone `vendl.app` → **Rules**:

1. **Transform Rule** (HTTP Request Header Modification) — runs first  
   - When: Hostname does not equal `vendl.app` / `www.vendl.app` / `fallback.vendl.app` / `staging.vendl.app` / `*.vendl.app` seller patterns you want excluded — simplest match for SaaS:  
     `http.host ne "fallback.vendl.app" and not ends with ".vendl.app"`  
     (custom hostnames are external, e.g. `www.stallside.app`)  
   - Then: Set static header **`X-Vendl-Original-Host`** = use dynamic value from `http.host`  
     (In CF UI: “Set static” vs dynamic — use the field that copies the current Host.)

2. **Origin Rule** — Host header override  
   - Same when filter as above (external custom hostnames only)  
   - Then: **Host Header** → `fallback.vendl.app`

Vendl middleware reads `X-Vendl-Original-Host` (then `X-Forwarded-Host`) when `Host` is an infra host.

### C. Same environment as Domains UI

SaaS traffic hits whatever deployment `fallback.vendl.app` points at. The custom domain row must exist in **that** environment’s DB with routing enabled (`CUSTOM_DOMAINS_ROUTING_ENABLED=1`). Connecting only on staging while fallback → Production will 404 the shop.

## Spike result (fill in)

| Check | Result |
|-------|--------|
| Request reaches Vendl | PENDING |
| Original host resolvable | PENDING |
| SSL active | PENDING |
| Tenant resolve | PENDING |
| Deep paths | PENDING |
| Worker required? | TBD |
