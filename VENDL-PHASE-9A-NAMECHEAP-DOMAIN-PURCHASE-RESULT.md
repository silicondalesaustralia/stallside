# Vendl Phase 9A — Namecheap Domain Purchase Result

**Branch:** `staging`  
**Date:** 2026-09-04  
**Brief:** [`VENDL-PHASE-9A-NAMECHEAP-DOMAIN-PURCHASE.md`](VENDL-PHASE-9A-NAMECHEAP-DOMAIN-PURCHASE.md)

## Gates (current)

| Gate | Status |
|------|--------|
| **NAMECHEAP REGISTRAR SPIKE** | **PASS** (read path) |
| **CUSTOMER AS REGISTRANT** | **PASS** |
| **`.au` direct** | **OUT OF SCOPE** |
| **DOMAIN PURCHASE APPLICATION GATE** | **PARTIAL** — search + checkout + fulfill wired; flags off until staging migrate |
| **DOMAIN PURCHASE INFRASTRUCTURE** | **NEEDS** migrate + `DOMAIN_*` flags + stable prod ClientIp |

## Built this pass

- `DomainPurchase` model + migration `20260904153000_phase9a_domain_purchase`
- Retail pricing (USD → AUD + buffer + markup)
- Stripe Checkout (`purpose=domain_purchase`) → webhook → Namecheap register → www CNAME → Cloudflare connect
- Refund if registration fails after payment
- UI: search → `/dashboard/website/domains/buy` registrant + AU eligibility → Pay

## Enable on staging (when ready)

```bash
CUSTOM_DOMAINS_ENABLED=1
DOMAIN_SEARCH_ENABLED=1
DOMAIN_PURCHASE_ENABLED=1
# AU_DOMAIN_PURCHASE_ENABLED unused (.au out of scope)
DOMAIN_FX_USD_AUD=1.55
DOMAIN_FX_BUFFER_PERCENT=5
DOMAIN_PRICING_MARKUP_PERCENT=25
DOMAIN_PRICING_MIN_MARGIN_AUD=5
# + Namecheap Sandbox/prod secrets + Stripe platform keys
```

Run migration before enabling purchase.

## Next

1. Apply migration on staging Neon  
2. End-to-end Sandbox purchase test (small `.com`)  
3. Stable Vercel egress IP for production Namecheap  
4. GST treatment decision (taxAmount currently 0)

No commit/push unless instructed.
