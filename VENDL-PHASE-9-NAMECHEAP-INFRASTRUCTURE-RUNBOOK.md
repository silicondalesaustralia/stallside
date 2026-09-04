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

- Sandbox whitelist IPs: _(list)_
- Production whitelist IPs: _(list)_
- Vercel egress strategy: _(document after spike — fixed egress / proxy if needed)_

Do not use a developer home IP as production infrastructure.

## Funding

Account balance / funding notes: _(fill — do not fund only for API thresholds without approval)_

## Production enable checklist

1. Sandbox spike PASSED (incl. seller-as-registrant)
2. `.com.au` / `.au` / `.com` verified
3. Stable production egress IP whitelisted
4. Production API access enabled on account
5. `NAMECHEAP_INTEGRATION_ENABLED=1` only after review
