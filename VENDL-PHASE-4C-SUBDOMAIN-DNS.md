# Vendl Phase 4C — Wildcard DNS (owner steps)

Application routing for `{slug}.vendl.app` is implemented in the app.
**TLS and live subdomains require DNS + Vercel project domain setup below.**

Verified against Vercel KB: [Wildcard domain without Vercel nameservers](https://vercel.com/kb/guide/wildcard-domain-without-vercel-nameservers).

Do **not** move apex `vendl.app` nameservers away from Cloudflare.

## 1. Vercel project

In the production Vercel project → Domains, add:

```text
*.vendl.app
```

Do not create per-seller domains (`jackos-buns.vendl.app`, etc.). The wildcard covers them.

## 2. Cloudflare DNS (authoritative for vendl.app)

### ACME challenge delegation (required for wildcard TLS)

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| NS | `_acme-challenge` | `ns1.vercel-dns.com` | DNS only |
| NS | `_acme-challenge` | `ns2.vercel-dns.com` | DNS only |

### Wildcard traffic

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| CNAME | `*` | `cname.vercel-dns-0.com` | **DNS only (grey cloud)** |

Orange-cloud proxy interferes with Vercel certificate issuance for wildcards.

## 3. Validate

After DNS propagates:

1. Open `https://{known-storefront-slug}.vendl.app`
2. Confirm valid TLS (no certificate warning)
3. Confirm home / shop / product / menu routes load
4. Confirm cart still works via `/s/{stand}/cart` on the apex host
5. Confirm “Back to shop” returns to the seller subdomain

## 4. Enable seller-facing subdomain URLs

Only after step 3 passes, set on Vercel production:

```text
NEXT_PUBLIC_STOREFRONT_SUBDOMAIN_PRIMARY=1
```

Until then:

- Path URLs `https://vendl.app/shop/{slug}` remain the generated public links
- Domains UI still shows `{slug}.vendl.app` as the included address
- Hostname rewrites work as soon as DNS/TLS is live (for manual testing)

## 5. Rollback

- Remove or disable the `*` CNAME and/or `*.vendl.app` on Vercel
- Keep `NEXT_PUBLIC_STOREFRONT_SUBDOMAIN_PRIMARY` unset / `0`
- `/shop/{slug}` and `/s/*` continue to work unchanged
