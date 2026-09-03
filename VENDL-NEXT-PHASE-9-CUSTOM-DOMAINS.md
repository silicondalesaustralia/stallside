# Vendl Next --- Phase 9 Build Brief

# Cloudflare Multi-Tenant Domains + Production Tenant Infrastructure

## Purpose

Phase 9 takes Vendl's existing Website Studio and storefront tenancy
architecture into a **production-ready multi-tenant domain system**,
using **Cloudflare as the domain, edge and TLS layer** while retaining
**Vercel as the existing Next.js application origin**.

The target architecture is:

``` text
Customer browser
        ↓
Cloudflare
        │
        ├── *.vendl.app
        │     ├── green-valley.vendl.app
        │     ├── alexas-eggs.vendl.app
        │     └── ...
        │
        └── Seller custom hostnames
              ├── www.examplefarm.com.au
              ├── shop.examplebakery.com
              └── ...
        ↓
Cloudflare for SaaS
        ↓
Vendl fallback/origin routing
        ↓
Existing Vercel deployment
        ↓
Vendl Next.js tenant resolver
```

**Cloudflare owns DNS/custom-hostname onboarding/TLS. Vercel remains the
application host.**

Do not migrate Vendl away from Vercel in this phase.

Do not provision every seller domain individually in Vercel.

------------------------------------------------------------------------

# 1. Core Phase 9 decision

Use:

-   Cloudflare DNS for `vendl.app`
-   wildcard `*.vendl.app` for Vendl-hosted seller addresses
-   Cloudflare for SaaS / Custom Hostnames for seller-owned domains
-   Cloudflare API for custom-hostname lifecycle
-   Cloudflare-managed certificate issuance/renewal
-   Vercel as the existing Next.js origin
-   Vendl database as the authoritative mapping of hostname → Storefront

Do **not** use Vercel custom-domain provisioning as the seller-domain
system.

Vercel is an origin, not the tenant-domain control plane.

------------------------------------------------------------------------

# 2. Why this architecture

For Vendl subdomains such as:

``` text
green-valley.vendl.app
alexas-eggs.vendl.app
```

there should be no per-seller DNS setup.

A wildcard handles them:

``` text
*.vendl.app
      ↓
Cloudflare
      ↓
Vendl origin
```

Vendl simply stores which Storefront owns each valid subdomain.

For seller-owned domains, Vendl should automate Cloudflare Custom
Hostnames through the API.

The seller experience becomes:

``` text
Enter domain
    ↓
Vendl creates Cloudflare Custom Hostname
    ↓
Vendl shows required DNS record
    ↓
Seller adds record at their DNS provider
    ↓
Vendl checks Cloudflare status
    ↓
Hostname + SSL active
    ↓
Store goes live
```

There should be **no manual Cloudflare dashboard work per seller during
normal operation**.

------------------------------------------------------------------------

# 3. Cloudflare pricing assumption

As of the Phase 9 planning date, Cloudflare for SaaS documentation
states:

-   available on Free, Pro and Business Cloudflare plans
-   first 100 custom hostnames included
-   up to 50,000 custom hostnames on standard plans
-   additional custom hostnames priced at US\$0.10/month each

Do not hard-code these prices into Vendl product logic.

They are infrastructure economics only and may change.

Before production launch, re-check current Cloudflare pricing and
limits.

------------------------------------------------------------------------

# 4. Important apex-domain limitation

Do **not** assume universal root/apex custom-domain support is free.

Examples:

``` text
examplefarm.com.au
examplebakery.com
```

Cloudflare's standard SaaS flow is designed around the customer CNAMEing
a hostname to Vendl's SaaS target.

Example:

``` text
www.examplefarm.com.au
    CNAME
customers.vendl.app
```

Cloudflare documents **Apex Proxying as a paid add-on** on standard
plans.

Therefore Phase 9 v1 should make the simplest universally supportable
path:

``` text
www.customer-domain.com
shop.customer-domain.com
store.customer-domain.com
```

using CNAME.

For an apex/root domain:

``` text
customer-domain.com
```

the implementation must detect what is actually supported.

Possible cases:

1.  the customer's DNS provider supports apex
    CNAME/ALIAS/ANAME/flattening compatible with the Cloudflare SaaS
    target
2.  the seller redirects apex → `www`
3.  Vendl later purchases/enables Cloudflare Apex Proxying
4.  another explicitly tested architecture is adopted

**Do not promise universal apex-domain support in the UI until it is
actually supported and tested.**

For Phase 9, a perfectly acceptable production UX is:

``` text
Primary Vendl custom domain:
www.greenvalleyfarm.com.au

Recommended:
Redirect greenvalleyfarm.com.au → www.greenvalleyfarm.com.au
```

------------------------------------------------------------------------

# 5. Existing baseline

Phase 4C already introduced application-side seller-subdomain
foundations.

Existing work reportedly includes:

-   hostname resolver
-   reserved labels
-   middleware tenant rewrites
-   cookie Domain/basePath handling
-   public URL helpers
-   Domains UI
-   local `*.localhost` support
-   `/shop/[slug]`
-   `NEXT_PUBLIC_STOREFRONT_SUBDOMAIN_PRIMARY`
-   tenancy tests

Audit and reuse this work first.

Do not create a second hostname-routing system.

Create a short architecture audit showing:

``` text
Existing
Reusable
Needs extension
Needs replacement
```

------------------------------------------------------------------------

# 6. Public URL model

A Storefront can have:

## Compatibility/path URL

``` text
https://vendl.app/shop/green-valley
```

## Vendl seller subdomain

``` text
https://green-valley.vendl.app
```

## Seller custom hostname

Phase 9 primary supported form:

``` text
https://www.greenvalleyfarm.com.au
```

or:

``` text
https://shop.greenvalleyfarm.com.au
```

Root/apex support is conditional as described above.

------------------------------------------------------------------------

# 7. Preferred public origin

Every published Storefront needs one central:

``` text
preferred public origin
```

Example:

``` text
https://green-valley.vendl.app
```

or:

``` text
https://www.greenvalleyfarm.com.au
```

This must drive:

-   canonical URLs
-   sitemap
-   Product URLs
-   Category URLs
-   Menu URLs
-   Blog URLs
-   custom-page URLs
-   Open Graph
-   JSON-LD
-   transactional email links
-   marketing links where appropriate

Do not duplicate host-selection logic.

------------------------------------------------------------------------

# 8. Domain data model

Audit the existing Storefront/domain schema first.

If needed, introduce a dedicated entity conceptually equivalent to:

``` ts
StorefrontDomain {
  id
  storefrontId

  hostname

  type
  // VENDL_SUBDOMAIN
  // CUSTOM

  status
  // PENDING
  // VERIFYING
  // ACTIVE
  // ERROR
  // DISCONNECTED

  isPrimary

  cloudflareCustomHostnameId

  hostnameStatus
  sslStatus

  verificationMethod
  verificationName
  verificationValue

  cnameTarget

  lastCheckedAt
  verifiedAt
  activatedAt

  errorCode
  errorMessage

  createdAt
  updatedAt
}
```

Do not blindly use these names if equivalent schema already exists.

Do not store unnecessary Cloudflare response payloads.

------------------------------------------------------------------------

# 9. Domain lifecycle

Conceptually:

``` text
PENDING
   ↓
VERIFYING
   ↓
ACTIVE
```

Recovery:

``` text
PENDING → ERROR
VERIFYING → ERROR
ERROR → VERIFYING
ACTIVE → ERROR
ACTIVE → DISCONNECTED
```

Cloudflare remains the source of truth for actual custom-hostname and
certificate activation state.

Vendl remains the source of truth for which Storefront owns the hostname
and whether it is primary.

------------------------------------------------------------------------

# 10. Hostname normalization

Create one central hostname normalizer.

Handle:

-   lowercase
-   whitespace
-   trailing dot
-   pasted protocol
-   pasted URL path
-   local development port
-   invalid labels
-   leading/trailing hyphens
-   reserved names
-   non-ASCII/IDN according to Cloudflare-supported behaviour

Store canonical hostname only.

------------------------------------------------------------------------

# 11. Reserved Vendl subdomains

Preserve/extend the central reserved registry.

Protect names such as:

``` text
www
app
api
admin
dashboard
help
support
status
docs
mail
email
cdn
assets
static
images
blog
shop
store
checkout
account
auth
login
signup
register
demo
preview
staging
dev
test
internal
security
billing
payments
stripe
paypal
webhook
webhooks
customers
origin
proxy
fallback
```

`customers`, `origin`, `proxy` and `fallback` are especially important
if used for Cloudflare SaaS infrastructure.

------------------------------------------------------------------------

# 12. Vendl wildcard seller subdomains

Target:

``` text
*.vendl.app
```

One wildcard DNS/routing configuration should serve all valid Vendl
seller subdomains.

Do not create one Cloudflare DNS record per seller.

Vendl application logic determines:

``` text
green-valley.vendl.app → Storefront A
alexas-eggs.vendl.app → Storefront B
```

Requirements:

-   unique slug
-   reserved-name protection
-   collision handling
-   published-state enforcement
-   unknown-subdomain 404
-   tenant isolation

------------------------------------------------------------------------

# 13. Cloudflare SaaS fallback origin

Configure Cloudflare for SaaS with a dedicated fallback origin that
ultimately reaches the existing Vercel-hosted Vendl application.

Use a dedicated infrastructure hostname rather than overloading a
seller-facing hostname.

Conceptually:

``` text
origin.vendl.app
```

or:

``` text
proxy-fallback.vendl.app
```

The exact record must be determined from the tested Cloudflare → Vercel
configuration.

Cloudflare requires the fallback-origin DNS record to be proxied and the
fallback origin to become Active.

Do not guess the final record.

Test it.

------------------------------------------------------------------------

# 14. Friendly SaaS CNAME target

Create a stable seller-facing CNAME target.

Recommended concept:

``` text
customers.vendl.app
```

Seller instructions then become:

``` text
www.examplefarm.com.au
CNAME
customers.vendl.app
```

Cloudflare recommends this style of friendly CNAME target because it
decouples customer DNS instructions from the underlying fallback origin.

The target should itself route through Cloudflare to the configured
fallback origin.

------------------------------------------------------------------------

# 15. Critical Cloudflare → Vercel origin test

This must be proven before broad implementation.

Cloudflare for SaaS normally forwards the customer's original Host
header.

Vercel/origin behaviour must be tested to confirm that requests for:

``` text
www.customer-domain.com
```

can reach the existing Vendl deployment correctly through the chosen
fallback-origin configuration.

Do not assume this works merely because DNS resolves.

If Vercel rejects an unknown Host header, implement the minimum
Cloudflare edge/origin-host strategy required to preserve:

1.  the original seller hostname for tenant resolution
2.  a Vercel-compatible origin request

Possible solutions may include Cloudflare routing/origin rules or a
lightweight Worker, but do not introduce a Worker unless actually
required.

Document the final tested request flow.

------------------------------------------------------------------------

# 16. Preserve original tenant hostname

Vendl must still know that the visitor requested:

``` text
www.greenvalleyfarm.com.au
```

even if Cloudflare needs to adjust origin SNI/Host behaviour to satisfy
Vercel.

If a Worker or header transformation becomes necessary, use a trusted
Cloudflare-added header for the original public hostname and validate it
appropriately.

Do not accept a spoofable arbitrary client header as tenant identity.

------------------------------------------------------------------------

# 17. Cloudflare API integration

Use Cloudflare's API for seller custom hostnames.

Required operations:

-   Create Custom Hostname
-   Get Custom Hostname Details
-   list/search where needed
-   refresh/retry validation where appropriate
-   Delete Custom Hostname
-   fallback-origin inspection/setup tooling where appropriate

Use scoped API Tokens.

Do not use the Cloudflare Global API Key.

Credentials stay server-side.

------------------------------------------------------------------------

# 18. Cloudflare service boundary

Keep Cloudflare-specific code isolated.

Conceptually:

``` text
src/lib/domains/provider/cloudflare.ts
```

Public application code should work through operations such as:

``` ts
connectCustomDomain()
getCustomDomainStatus()
verifyCustomDomain()
disconnectCustomDomain()
```

Do not scatter raw Cloudflare API calls across components.

------------------------------------------------------------------------

# 19. Custom-domain seller flow

Target:

``` text
Dashboard
→ Website
→ Domains
→ Connect domain
→ Enter hostname
→ Vendl creates Cloudflare Custom Hostname
→ Vendl retrieves validation/configuration
→ Show DNS instruction
→ Seller changes DNS
→ Check again
→ Cloudflare hostname active
→ Cloudflare SSL active
→ Vendl marks Active
→ Make primary
```

No manual Vendl staff action should normally be required.

------------------------------------------------------------------------

# 20. Seller UX --- keep it simple

The seller should see only a few states:

``` text
Waiting for DNS
Connecting
Active
Needs attention
```

Do not expose internal Cloudflare terminology unless useful.

Example:

``` text
Connect your domain

[ www.greenvalleyfarm.com.au ]

[ Continue ]
```

Then:

``` text
Add this DNS record where your domain is managed:

TYPE
CNAME

NAME
www

VALUE
customers.vendl.app

[ Copy ]

Status: Waiting for DNS

[ Check again ]
```

------------------------------------------------------------------------

# 21. Cloudflare readiness criteria

Do not mark a custom hostname production-ready until Cloudflare reports
both:

``` text
result.status = active
```

and:

``` text
result.ssl.status = active
```

and the seller's DNS points to the expected Vendl SaaS target.

A successful TLS handshake alone is not enough to infer the Cloudflare
custom-hostname certificate lifecycle is complete.

------------------------------------------------------------------------

# 22. Validation records

Cloudflare may return hostname/certificate validation requirements.

Persist/display only what is needed.

Cloudflare documentation notes that validation details may require a
subsequent GET after creating a custom hostname.

Implementation must account for this.

Do not assume every required validation field is present in the initial
POST response.

------------------------------------------------------------------------

# 23. DNS propagation UX

Use:

> DNS changes can take some time to appear. You can leave this page and
> come back later.

Show:

``` text
Last checked: ...
```

and:

``` text
Check again
```

Do not call Cloudflare on every Storefront request.

------------------------------------------------------------------------

# 24. Custom-domain conflicts

One custom hostname may belong to only one Vendl Storefront.

Enforce database uniqueness.

If another seller tries to connect it:

> This domain is already connected to another Vendl store.

Do not identify the other seller.

------------------------------------------------------------------------

# 25. Plan gating

Custom domains remain a paid Vendl capability.

Use existing billing entitlements.

Current economics remain unchanged:

``` text
Free
$0/month
2.5% Vendl platform fee

Pro
AUD 19.99/month
USD 14.99/month
GBP 11.99/month
EUR 14.99/month
No Vendl transaction fee
```

Do not change pricing.

------------------------------------------------------------------------

# 26. Free-plan UX

Show:

``` text
Use your own domain

Connect your existing domain and publish your Vendl website at your own web address.

Included with Vendl Pro.

[ Upgrade to Pro ]
```

Use existing billing upgrade architecture.

------------------------------------------------------------------------

# 27. Primary domain

A Storefront has one primary public origin.

Example:

``` text
PRIMARY
www.greenvalleyfarm.com.au

ALSO AVAILABLE
green-valley.vendl.app
```

Enforce one primary transactionally/database-wise.

------------------------------------------------------------------------

# 28. Preferred-origin helpers

Create one obvious public URL API.

Conceptually:

``` ts
getStorefrontOrigin(storefront)
getStorefrontUrl(storefront, path)
getCanonicalStorefrontUrl(storefront, path)
```

Audit hardcoded:

``` text
SITE_URL
NEXT_PUBLIC_SITE_URL
vendl.app/shop
/shop/${slug}
```

Replace public Storefront URL construction only.

------------------------------------------------------------------------

# 29. Canonical redirects

When custom hostname is primary:

``` text
green-valley.vendl.app/product/country-sourdough
```

should redirect directly to:

``` text
www.greenvalleyfarm.com.au/product/country-sourdough
```

where safe.

Legacy path URLs must not remain independently indexable duplicates.

Preserve deep paths and useful query parameters.

Avoid redirect chains.

------------------------------------------------------------------------

# 30. SEO

Preferred origin drives:

-   canonical
-   metadataBase
-   Open Graph URL
-   absolute social URLs
-   sitemap
-   BreadcrumbList URLs
-   Product/Offer URLs
-   Article/BlogPosting URLs
-   Organization/WebSite URLs

Do not produce three indexed copies of the same Storefront.

------------------------------------------------------------------------

# 31. Robots and previews

Differentiate:

-   published Storefront
-   unpublished Storefront
-   Studio draft preview
-   Green Valley demo
-   dashboard
-   unknown tenant

Draft preview must remain non-indexable and protected.

------------------------------------------------------------------------

# 32. Tenant-aware 404

Examples:

``` text
green-valley.vendl.app/product/not-real
```

→ Green Valley/template-aware 404.

``` text
unknown.vendl.app
```

→ generic Vendl Storefront not found.

Unknown path on custom hostname:

→ seller-themed 404.

Return real 404 status.

------------------------------------------------------------------------

# 33. Host/path mismatch

Example:

``` text
green-valley.vendl.app/shop/another-seller
```

must never expose another tenant.

Recognized tenant hostname wins.

Choose and test a safe redirect/404 behaviour centrally.

------------------------------------------------------------------------

# 34. Checkout compatibility

Test complete commerce flow on:

-   Vendl seller subdomain
-   seller custom hostname
-   compatibility/path Storefront

Audit:

-   cart cookies
-   `vendl_shop_slug`
-   Menu context
-   fulfilment
-   Stripe checkout
-   return/confirmation URLs

**PayPal WIP remains untouched.**

------------------------------------------------------------------------

# 35. Cookie strategy

Do not assume cookies can be shared between:

``` text
green-valley.vendl.app
```

and:

``` text
www.greenvalleyfarm.com.au
```

Centralise cookie behaviour.

Do not attempt `.vendl.app` cookies from customer-owned domains.

------------------------------------------------------------------------

# 36. Authentication boundary

Dashboard/auth remains on Vendl-controlled application origins.

Do not move Auth.js seller sessions to custom seller domains.

Audit:

-   auth cookies
-   CSRF
-   callback URLs
-   login redirects

Public custom hostnames are Storefront surfaces.

------------------------------------------------------------------------

# 37. Host-header security

Treat Host as untrusted.

Protect against:

-   Host-header injection
-   arbitrary URL generation
-   callback poisoning
-   cache poisoning
-   cross-tenant resolution
-   unknown-host fallback

If Cloudflare forwards original hostname through a custom trusted
header, ensure direct-origin requests cannot spoof tenant identity.

------------------------------------------------------------------------

# 38. Origin protection

Where practical, prevent attackers bypassing Cloudflare and hitting the
Vercel origin with arbitrary tenant-host headers.

At minimum:

-   distinguish trusted Cloudflare traffic where required
-   do not trust custom forwarded-host headers from arbitrary clients
-   keep security-sensitive absolute URLs based on configured origins
-   document direct-origin behaviour

Do not make the application inaccessible to legitimate Vercel
preview/development workflows.

------------------------------------------------------------------------

# 39. Cache isolation

Critical gate.

Tenant-specific output must not be cached solely by pathname.

Two sellers may both have:

``` text
/product/country-sourdough
```

and must never cross-render.

Audit Next.js + Vercel + Cloudflare caching.

Cache identity/revalidation must account for tenant.

Add explicit tests.

------------------------------------------------------------------------

# 40. Cloudflare caching

Do not globally cache dynamic Storefront HTML at Cloudflare until
tenant-safe cache keys and invalidation are proven.

Static assets/images can retain appropriate caching.

If HTML caching is enabled later, hostname must be part of the effective
cache identity.

Correctness first.

------------------------------------------------------------------------

# 41. Emails

Transactional links should use the verified preferred Storefront origin
where appropriate.

Fallback to Vendl subdomain.

Never use a pending/unverified custom hostname in transactional email.

------------------------------------------------------------------------

# 42. Marketing links

Campaign links should use verified preferred origin.

Preserve useful UTM parameters through canonical host redirects.

------------------------------------------------------------------------

# 43. Farm Stand QR stability

Existing printed QR codes must remain valid.

Preserve `/s/[standSlug]`.

Prefer durable Vendl-controlled QR URLs rather than tying printed QR
assets permanently to a seller's current custom domain.

Regression:

1.  QR works
2.  custom domain connected
3.  custom domain made primary
4.  old QR works
5.  custom domain disconnected
6.  old QR still works

------------------------------------------------------------------------

# 44. Domain downgrade

If a seller loses Pro entitlement:

-   use existing billing/grace rules
-   Vendl subdomain remains available
-   custom hostname ceases to be primary according to entitlement rules
-   seller receives reactivation path
-   avoid redirect loops
-   do not instantly destroy Cloudflare configuration unless product
    rules require it

Do not invent a separate billing system.

------------------------------------------------------------------------

# 45. Disconnect

Seller can disconnect a custom hostname.

Example:

``` text
Disconnect www.greenvalleyfarm.com.au?

Your green-valley.vendl.app address will continue to work.

[ Cancel ] [ Disconnect ]
```

Then:

-   remove Cloudflare Custom Hostname
-   update DB
-   change primary if required
-   invalidate caches
-   update canonical/public-origin behaviour

If Cloudflare deletion fails, do not falsely report success.

------------------------------------------------------------------------

# 46. Storefront unpublish/delete

Unpublished Storefronts must not expose draft content through either
host type.

Deleting a Storefront/account must eventually clean up:

-   custom hostname in Cloudflare
-   domain mapping
-   caches

Do not leave abandoned Cloudflare custom hostnames indefinitely.

------------------------------------------------------------------------

# 47. Analytics

Ensure custom-hostname traffic maps to the correct Storefront.

A seller should not need a separate Vendl analytics setup because they
connected a domain.

Keep demo/test traffic isolated where supported.

------------------------------------------------------------------------

# 48. Forms and APIs

Audit:

-   Contact
-   signup/newsletter
-   reviews
-   custom forms `/f/[formId]`

for origin/CORS/CSRF assumptions.

Do not solve custom domains with permissive global CORS.

------------------------------------------------------------------------

# 49. Assets

Verify on custom hostnames:

-   Product images
-   category images
-   Hero
-   logo
-   Vercel Blob
-   OG images

Do not construct asset URLs from arbitrary request Host unless
appropriate.

------------------------------------------------------------------------

# 50. Observability

Log:

``` text
domain_requested
cloudflare_hostname_created
domain_waiting_dns
domain_hostname_active
domain_ssl_active
domain_primary_changed
domain_error
domain_disconnected
```

Include internal IDs and safe status information.

Never log API tokens.

------------------------------------------------------------------------

# 51. Rate limiting/idempotency

Protect:

-   connect
-   status refresh
-   retry
-   make primary
-   disconnect

Handle repeated clicks safely.

Use existing rate-limiting infrastructure where available.

------------------------------------------------------------------------

# 52. Cloudflare API credentials

Use a scoped Cloudflare API Token with the minimum permissions required
for:

-   Custom Hostnames
-   relevant SSL/certificate operations
-   fallback-origin management only if application tooling genuinely
    requires it

Do not use Global API Key.

Do not expose token to browser.

Do not store token in repo.

------------------------------------------------------------------------

# 53. Rollout

Recommended:

## Stage 1

Application changes deployed/available with new behaviour disabled.

## Stage 2

Enable/configure Cloudflare for SaaS for `vendl.app`.

## Stage 3

Configure and verify fallback origin.

## Stage 4

Configure `customers.vendl.app` CNAME target.

## Stage 5

Verify Cloudflare → Vercel request behaviour.

## Stage 6

Enable/test `green-valley.vendl.app`.

## Stage 7

Test a Vendl-owned external/custom hostname.

## Stage 8

Enable selected seller.

## Stage 9

Enable broadly.

Do not enable everything at once.

------------------------------------------------------------------------

# 54. Green Valley test

Use Green Valley Farm & Bakes.

Test:

``` text
green-valley.vendl.app
```

plus a Vendl-owned test custom hostname.

Verify:

-   Home
-   Shop
-   Category
-   Product
-   Menu
-   About
-   Blog
-   Contact
-   images
-   cart
-   fulfilment
-   canonical
-   sitemap
-   schema
-   404
-   redirects
-   mobile

Do not use an unrelated third-party domain.

------------------------------------------------------------------------

# 55. Local development

Preserve:

``` text
green-valley.localhost:3000
```

or existing equivalent.

Document local custom-hostname simulation.

Do not require production Cloudflare calls for ordinary local
development.

------------------------------------------------------------------------

# 56. Vercel preview deployments

Cloudflare tenant routing must not swallow Vercel preview hosts.

Explicitly distinguish:

-   production Vendl
-   Vercel preview
-   localhost
-   Cloudflare custom hostname

Test each.

------------------------------------------------------------------------

# 57. Existing seller backfill

Existing published Storefronts should receive safe Vendl subdomain
mappings.

Backfill:

-   preserve slug
-   detect reserved labels
-   detect collisions
-   do not unpublish
-   do not alter canonical behaviour until rollout is enabled
-   report conflicts

No per-seller Cloudflare DNS record should be created for ordinary
`*.vendl.app` seller subdomains.

------------------------------------------------------------------------

# 58. Migration safety

Any DB migration should be additive first.

Do not combine with:

-   Product ownership migration
-   nullable/removal of `Product.standId`
-   Phase 10
-   unrelated schema cleanup

------------------------------------------------------------------------

# 59. Infrastructure runbook

Create:

`VENDL-PHASE-9-CLOUDFLARE-DOMAIN-INFRASTRUCTURE-RUNBOOK.md`

Include exact tested steps for:

1.  enabling Cloudflare for SaaS
2.  wildcard `*.vendl.app`
3.  fallback origin
4.  `customers.vendl.app`
5.  Cloudflare → Vercel origin routing
6.  any required Worker/Origin Rule, only if proven necessary
7.  API token permissions
8.  environment variables
9.  TLS verification
10. test custom hostname
11. feature flags
12. rollout
13. rollback

Clearly separate:

``` text
CODE COMPLETE
```

from:

``` text
CLOUDFLARE INFRASTRUCTURE APPLIED
```

and:

``` text
PRODUCTION ROUTING VERIFIED
```

------------------------------------------------------------------------

# 60. Required spike before committing architecture

Before building all seller-domain UI, perform a focused infrastructure
spike proving:

``` text
custom-test-domain
        ↓
Cloudflare Custom Hostname
        ↓
customers.vendl.app
        ↓
Cloudflare fallback origin
        ↓
Vercel
        ↓
Vendl
```

Confirm:

-   request reaches Vendl
-   original public hostname can be safely resolved
-   Vercel accepts the origin request
-   SSL becomes active
-   tenant can be resolved
-   deep paths work

If this requires a Cloudflare Worker or origin transformation, document
why and keep it minimal.

**Do not build the entire domain UX on an unproven Cloudflare → Vercel
assumption.**

------------------------------------------------------------------------

# 61. Automated test matrix

## Host classification

-   main Vendl
-   valid seller subdomain
-   reserved subdomain
-   custom hostname
-   localhost
-   Vercel preview
-   unknown host

## Tenant isolation

-   valid seller
-   unpublished seller
-   unknown seller
-   host/path mismatch
-   custom-domain collision
-   cross-tenant request
-   cross-tenant mutation

## Cloudflare domain lifecycle

-   create
-   pending
-   validation details
-   hostname active
-   SSL active
-   API error
-   retry
-   disconnect
-   duplicate
-   entitlement failure

## Redirects

-   legacy path → preferred
-   Vendl subdomain → custom preferred
-   Product deep link
-   Category deep link
-   Menu deep link
-   query preservation
-   preview exceptions

## SEO

-   canonical
-   metadata base
-   sitemap
-   robots
-   schema URLs
-   no duplicate origins

## Security

-   hostile Host
-   spoofed forwarded-host header
-   direct-origin request
-   cross-tenant mutation
-   cache isolation
-   preview protection

## Commerce

-   cart on Vendl subdomain
-   cart on custom hostname
-   fulfilment
-   Stripe checkout
-   return flow
-   QR stability

------------------------------------------------------------------------

# 62. Regression suite

Run all relevant existing suites:

-   Website Studio
-   tenancy
-   menus
-   fulfilment
-   growth
-   production
-   checkout
-   QR/Farm Stand
-   TypeScript
-   full production build

PayPal WIP must remain untouched.

------------------------------------------------------------------------

# 63. Completion report

Create:

`VENDL-PHASE-9-CLOUDFLARE-DOMAINS-RESULT.md`

Include:

1.  Phase 4C audit
2.  final architecture
3.  Cloudflare for SaaS configuration
4.  Cloudflare pricing/limit assumptions verified
5.  apex-domain limitation/decision
6.  fallback origin
7.  friendly CNAME target
8.  Cloudflare → Vercel spike result
9.  original-host preservation
10. schema
11. hostname normalization
12. reserved labels
13. Vendl wildcard subdomains
14. Cloudflare API service
15. custom hostname creation
16. validation
17. hostname status
18. SSL status
19. seller Domains UI
20. plan gating
21. primary-domain logic
22. preferred-origin helper
23. redirects
24. canonical
25. sitemap
26. robots
27. schema URLs
28. tenant resolution
29. host/path mismatch
30. unknown hosts
31. cookies
32. checkout
33. QR stability
34. email links
35. marketing links
36. authentication boundary
37. Host-header security
38. trusted forwarded-host strategy if used
39. cache isolation
40. preview security
41. forms
42. downgrade
43. disconnect/delete
44. existing seller backfill
45. analytics
46. observability
47. rate limiting
48. local development
49. Vercel preview behaviour
50. environment config
51. infrastructure runbook
52. rollback
53. Green Valley QA
54. automated tests
55. regressions
56. TypeScript
57. production build
58. infrastructure status
59. known limitations
60. Git status

------------------------------------------------------------------------

# 64. Completion statuses

Report separately:

## Application

``` text
APPLICATION GATE PASSED
```

or:

``` text
APPLICATION NEEDS WORK
```

## Cloudflare infrastructure

``` text
CLOUDFLARE INFRASTRUCTURE NOT APPLIED
```

or:

``` text
CLOUDFLARE INFRASTRUCTURE PARTIALLY APPLIED
```

or:

``` text
CLOUDFLARE INFRASTRUCTURE VERIFIED
```

## End-to-end routing

``` text
CLOUDFLARE → VERCEL ROUTING VERIFIED
```

or:

``` text
CLOUDFLARE → VERCEL ROUTING NEEDS WORK
```

Do not claim Phase 9 production-ready merely because application tests
pass.

------------------------------------------------------------------------

# 65. Definition of done

Phase 9 is complete when:

-   `*.vendl.app` serves published seller Storefronts without per-seller
    DNS setup
-   unknown Vendl subdomains cannot expose arbitrary tenants
-   Pro sellers can connect supported custom hostnames
-   Vendl automatically creates/manages Cloudflare Custom Hostnames
-   seller receives simple CNAME instructions
-   Cloudflare validates hostname ownership/routing
-   Cloudflare certificate status becomes active
-   Cloudflare routes custom-hostname traffic successfully to the
    existing Vercel application
-   Vendl securely resolves the original public hostname to the correct
    tenant
-   preferred-origin logic controls public URLs
-   alternate Storefront URLs redirect safely
-   SEO does not create duplicate Storefront copies
-   cart/checkout works
-   QR codes remain stable
-   draft previews remain protected
-   tenant/cache isolation is proven
-   Green Valley passes Vendl-subdomain and custom-hostname QA
-   infrastructure and rollback are documented
-   universal apex support is not falsely promised

------------------------------------------------------------------------

# 66. Hard stop

After Phase 9:

**STOP FOR REVIEW.**

Do not begin Phase 10.

Do not start:

-   `Product.standId` consolidation
-   Product ownership migration
-   unrelated schema cleanup
-   hosting migration away from Vercel
-   new payment-provider work
-   PayPal changes

Do not:

-   commit
-   push
-   merge
-   deploy

unless explicitly instructed separately.

**PayPal WIP remains untouched.**
