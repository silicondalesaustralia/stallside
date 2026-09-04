# Vendl Phase 9 — Namecheap infrastructure runbook

## Purpose

Document Namecheap Sandbox + production API setup for Phase 9A.

## Accounts

- Sandbox account: _(fill)_
- Production account: _(fill)_
- Production API eligibility status: _(pass/fail + Namecheap requirement met)_

## Credentials (env only — never commit)

``` text
NAMECHEAP_ENVIRONMENT=sandbox|production
NAMECHEAP_API_USER=
NAMECHEAP_API_KEY=
NAMECHEAP_USERNAME=
NAMECHEAP_CLIENT_IP=
NAMECHEAP_SANDBOX_API_URL=https://api.sandbox.namecheap.com/xml.response
NAMECHEAP_PRODUCTION_API_URL=https://api.namecheap.com/xml.response
```

## IPv4 allowlisting

Namecheap requires `ClientIp` and whitelisted IPv4.

**Egress:** Fixie HTTP proxy (`FIXIE_URL`) — Vercel functions call Namecheap through Fixie static outbound IPs.

- Fixie outbound IPs (whitelist **both** in Namecheap API Access):
  - `52.87.82.133`
  - `52.5.155.132`
- `NAMECHEAP_CLIENT_IP` = one of the above (e.g. `52.87.82.133`)
- `FIXIE_URL` = Fixie proxy URL (Preview for staging; Production when live)

Do not use a developer home IP or raw Vercel pool IPs as production infrastructure.

## Funding

Account balance / funding notes: _(fill — do not fund only for API thresholds without approval)_

## Production enable checklist

1. Sandbox spike PASSED (incl. seller-as-registrant)
2. `.com.au` / `.com` / `.net.au` verified (`.au` out of scope)
3. Fixie outbound IPs whitelisted + `FIXIE_URL` + `NAMECHEAP_CLIENT_IP` set
4. Production API access enabled on account
5. Purchase flags reviewed before `DOMAIN_PURCHASE_ENABLED=1`