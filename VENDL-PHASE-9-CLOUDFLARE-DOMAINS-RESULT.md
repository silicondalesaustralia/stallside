# Phase 9 — Cloudflare Custom Domains RESULT

**Date:** 2026-09-02  
**Brief:** [`VENDL-NEXT-PHASE-9-CUSTOM-DOMAINS.md`](VENDL-NEXT-PHASE-9-CUSTOM-DOMAINS.md)  
**4C audit:** [`VENDL-PHASE-9-4C-AUDIT.md`](VENDL-PHASE-9-4C-AUDIT.md)  
**Runbook:** [`VENDL-PHASE-9-CLOUDFLARE-DOMAIN-INFRASTRUCTURE-RUNBOOK.md`](VENDL-PHASE-9-CLOUDFLARE-DOMAIN-INFRASTRUCTURE-RUNBOOK.md)

## Status summary (report separately)

| Lane | Status |
|------|--------|
| **APPLICATION** | Implemented (flags default off) |
| **CLOUDFLARE INFRASTRUCTURE** | **NOT APPLIED** — SaaS / fallback / `customers.vendl.app` not configured in this pass |
| **CLOUDFLARE → VERCEL ROUTING** | **NEEDS WORK** — spike not executed against live CF/Vercel |

Do **not** treat APPLICATION green as production-ready for custom domains until the two infrastructure lanes are verified.

## APPLICATION checklist

- [x] Phase 4C reuse audit
- [x] Additive `StorefrontDomain` schema + migration
- [x] Vendl subdomain backfill script (`scripts/backfill-storefront-domains.ts`)
- [x] Domain service boundary (`src/lib/domains/*`, CF provider isolated)
- [x] Feature flags: `CUSTOM_DOMAINS_ENABLED`, `CUSTOM_DOMAINS_ROUTING_ENABLED`
- [x] Middleware ACTIVE custom-host resolve via `/api/tenancy/host-lookup` (no Prisma on Edge)
- [x] Domains dashboard: Pro gate, connect / CNAME / check / primary / disconnect
- [x] Preferred-origin helpers + shop layout redirect (gated by routing flag)
- [x] SEO: canonicals, sitemap, schema, breadcrumbs use primary custom host when set
- [x] Env examples documented in `.env.example`
- [x] Tests: `npm run test:tenancy` (hostname + domains)
- [x] `tsc` + full `npm run build`

## Spike (hard gate — still open)

Prove one Vendl-owned test hostname:

`custom-test → CF Custom Hostname → customers.vendl.app → fallback → Vercel → Vendl`

| Check | Result |
|-------|--------|
| Request reaches app | PENDING (infra not applied) |
| Original host resolvable | PENDING |
| SSL active | PENDING |
| Tenant resolve | PENDING |
| Deep paths | PENDING |

Fill details in the runbook after ops completes the spike.

## Rollout order

1. Deploy app with both custom-domain flags **off**
2. Apply Cloudflare for SaaS + fallback + `customers.vendl.app` (runbook)
3. Complete spike; set routing + enable flags
4. Green Valley QA on `green-valley.vendl.app` + Vendl-owned test custom host

## STOP FOR REVIEW

Phase 9 application work is ready for review. **No Phase 10.** No claim of production custom-domain readiness until CLOUDFLARE INFRASTRUCTURE and CF→VERCEL ROUTING are verified.
