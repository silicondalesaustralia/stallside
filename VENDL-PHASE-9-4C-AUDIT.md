# Phase 9 — Phase 4C Tenancy Audit

**Date:** 2026-09-02  
**Brief:** `VENDL-NEXT-PHASE-9-CUSTOM-DOMAINS.md`

## Existing

| Piece | Location |
|-------|----------|
| Hostname classifier | `src/lib/tenancy/hostname.ts` (`APP`, `VENDL_SUBDOMAIN`, `CUSTOM_DOMAIN`, `LOCAL*`, `VERCEL_PREVIEW`) |
| Middleware subdomain rewrite | `src/middleware.ts` |
| Reserved labels | `src/lib/tenancy/reserved-subdomains.ts` |
| Public URL helpers | `src/lib/tenancy/public-url.ts` |
| Domains UI (save-only) | `src/app/dashboard/(gated)/website/domains/` |
| `Storefront.customDomain` | Prisma — unused for routing |
| Tenancy tests | `src/lib/tenancy/hostname.test.ts` |
| Wildcard DNS runbook | `VENDL-PHASE-4C-SUBDOMAIN-DNS.md` |

## Reusable

- Host classification and reserved-label registry (extend, do not fork)
- Middleware rewrite/apex-redirect pattern for seller hosts
- `storefrontPublicUrl` / basePath concepts (evolve into preferred-origin)
- Domains dashboard route + entitlement patterns from billing

## Needs extension

- Middleware must resolve **ACTIVE** custom hostnames via DB → slug
- `isSellerStorefrontHost` must include verified custom hosts
- Preferred-origin API driving SEO/canonicals/emails
- Domains UI: connect / DNS instructions / verify / primary / disconnect
- Plan gating (Pro / lifetime) for custom domains
- Cookie / shop-origin awareness for custom hosts

## Needs replacement

- Save-only `customDomain` string as the domain system → `StorefrontDomain` entity
- UI copy that says “not connected yet / later release”
- Comment “Future Phase 4D” in hostname.ts → Phase 9 custom-host resolution

## Not in Phase 4C (new)

- Cloudflare for SaaS Custom Hostname API
- `customers.vendl.app` CNAME target + fallback origin
- Domain lifecycle statuses + CF SSL readiness gate
- Feature flags for CF infrastructure vs application code
