# Vendl Phase 9A --- Namecheap Domain Registration

## Replace the blocked GoDaddy registrar path with Namecheap while retaining the existing Cloudflare/Vercel Phase 9 architecture

## Purpose

Implement and validate **Namecheap as Vendl's registrar provider** for
domains purchased through Vendl.

The non-negotiable legal/product requirement is:

> **Vendl is the platform/reseller interface. The Vendl seller/customer
> is the domain registrant and legal licence holder.**

Namecheap is being evaluated because its domain creation API explicitly
accepts per-registration registrant contact fields and its API
documentation explicitly supports `.COM.AU` extended attributes
including ABN, ACN, RBN and trademark identifiers.

Do not delete the existing GoDaddy or OpenSRS spike work yet. Keep those
providers inactive/reference-only until Namecheap passes the hard gates.

------------------------------------------------------------------------

# 1. Existing Phase 9 architecture remains

Do not redesign Phase 9 routing.

``` text
DOMAIN REGISTRATION
Namecheap
    ↓
Registrant = Vendl customer
    ↓
Vendl domain-management layer
    ↓
Cloudflare
    ↓
Vercel origin
    ↓
Vendl Next.js Storefront
```

### Namecheap responsibilities

-   availability checks
-   domain registration
-   registrant/admin/technical/billing contacts
-   TLD-specific extended attributes
-   renewal
-   contact changes
-   registrar lock/domain information
-   transfer/lifecycle functions where supported
-   DNS/nameserver delegation needed to hand the domain to Cloudflare

### Cloudflare responsibilities

-   DNS/edge architecture selected in Phase 9
-   TLS
-   hostname routing
-   Storefront edge behaviour

### Vercel responsibilities

-   existing Next.js application origin

### Vendl responsibilities

-   seller UX
-   search/suggestions
-   retail pricing
-   billing
-   registrant and AU eligibility collection
-   domain ownership records
-   Storefront association
-   primary domain
-   renewals
-   support/admin visibility

Namecheap must not become Vendl's hosting layer.

------------------------------------------------------------------------

# 2. Preserve the registrar abstraction

Retain/refine the provider-neutral interface already started for
GoDaddy.

Conceptually:

``` ts
interface DomainRegistrarProvider {
  searchDomains()
  checkAvailability()
  getRegistrationPrice()
  getRenewalPrice()
  registerDomain()
  getDomain()
  renewDomain()
  getContacts()
  updateContacts()
  getRegistrarLock()
  setRegistrarLock()
  getTransferInfo()
}
```

Provider state may conceptually be:

``` text
GoDaddy     blocked/inactive
OpenSRS     inactive candidate
Namecheap   active candidate
```

Namecheap's XML API must be isolated behind something such as:

``` text
src/lib/domains/registrar/namecheap/
```

Do not leak XML parsing, Namecheap parameter names or authentication
fields throughout the application.

------------------------------------------------------------------------

# 3. Hard gate --- Namecheap spike first

Before building the complete customer-facing purchase UI, prove
Namecheap is viable.

The spike must verify:

-   Sandbox account/API access
-   production API eligibility for the Vendl Namecheap account
-   API authentication
-   IPv4 allowlisting requirements
-   `.com.au` availability
-   `.au` availability
-   `.com` availability
-   customer-specific registrant contacts
-   `.com.au` extended attributes
-   `.au` support and its actual registration requirements
-   `.net.au` support
-   registration pricing
-   renewal pricing
-   domain creation payload
-   contact retrieval/update
-   renewal
-   registrar lock
-   transfer-out lifecycle
-   DNS/nameserver configuration
-   premium-domain handling
-   privacy behaviour
-   production account-balance/payment behaviour
-   API commercial/reseller restrictions

Use Namecheap **Sandbox** wherever possible.

Do not buy a live domain merely to pass the initial spike.

------------------------------------------------------------------------

# 4. Namecheap Sandbox

Namecheap provides a separate Sandbox API environment.

Create/use a Sandbox account and test against the Sandbox endpoint
before production.

The integration must cleanly separate:

``` text
NAMECHEAP_ENVIRONMENT=sandbox
```

from:

``` text
NAMECHEAP_ENVIRONMENT=production
```

Never allow local/staging development to accidentally register live
domains.

Create:

``` text
scripts/spike-namecheap-domains.ts
```

The spike must default to non-destructive Sandbox/read operations.

------------------------------------------------------------------------

# 5. Production API access gate

Namecheap currently imposes requirements before production API access is
enabled.

The implementation team must verify the actual Vendl Namecheap account
satisfies one of Namecheap's current requirements.

Current documented examples include account history/domain-count/balance
thresholds, but **do not hardcode these into Vendl product logic**
because Namecheap can change them.

Document the actual production-access status in the result report.

Do not fund the Namecheap account merely to satisfy an API threshold
without explicit approval if the existing account does not already
qualify.

------------------------------------------------------------------------

# 6. IPv4 allowlisting is an infrastructure gate

Namecheap API calls require a `ClientIp` and production API access
requires whitelisted IPv4 addresses.

This is critical because Vendl runs on Vercel.

Before production, prove a secure, supportable outbound-IP architecture.

The spike/result must answer:

``` text
Can Vendl's production server-side Namecheap API calls originate
from a stable whitelisted IPv4 address?
```

If standard Vercel egress cannot satisfy this reliably, design the
smallest secure egress/proxy/function architecture required.

Do not weaken Namecheap's IP restriction.

Do not hardcode a developer's home/office IP as production
infrastructure.

------------------------------------------------------------------------

# 7. Customer-as-registrant hard gate

This is the requirement that blocked GoDaddy v3.

Namecheap's create-domain API exposes registrant fields including
concepts such as:

``` text
RegistrantFirstName
RegistrantLastName
RegistrantOrganizationName
RegistrantAddress1
RegistrantCity
RegistrantStateProvince
RegistrantPostalCode
RegistrantCountry
RegistrantPhone
RegistrantEmailAddress
```

The spike must prove that Vendl can submit the **seller/customer's**
information for the domain registration.

Required outcome:

``` text
Vendl / Namecheap account
        = registrar/reseller infrastructure

Green Valley Farm & Bakes
        = Registrant

Customer's authorised person
        = Registrant contact

Customer's ABN/ACN/etc.
        = .com.au registrant identifier
```

If Namecheap cannot reliably preserve this relationship, stop Phase 9A.

------------------------------------------------------------------------

# 8. Contact roles

Namecheap's registration API supports separate:

``` text
Registrant
Admin
Technical
AuxBilling
```

Use the seller's correct registrant details.

Where legally/operationally appropriate, Vendl may copy seller details
into the other roles by default.

Do not use Vendl's company identity as Registrant.

Do not invent contact information.

The seller must be able to review the legal registrant information
before purchase.

------------------------------------------------------------------------

# 9. Australian launch TLDs

Hard launch priority:

``` text
.com.au
.au
.com
```

Also verify:

``` text
.net.au
```

Do not assume `.au` direct is supported merely because `.com.au` is
supported.

The Namecheap spike must explicitly test/check `.au` direct through the
current API/TLD list and registration requirements.

If `.au` direct cannot be registered correctly through Namecheap API,
report that clearly rather than faking support.

`.com.au` is mandatory for the Australian Vendl launch.

------------------------------------------------------------------------

# 10. `.com.au` extended attributes

Namecheap currently documents these required `.COM.AU` API attributes:

``` text
COMAURegistrantId
COMAURegistrantIdType
```

Current documented ID types include:

``` text
ABN
ACN
RBN
TM
```

Build these behind a TLD-specific eligibility schema.

Do not spread literal `COMAU...` fields throughout UI/business logic.

Conceptually:

``` ts
AustralianDomainEligibility {
  identifierType
  identifier
  registrantLegalName
  eligibilityBasis
}
```

Then the Namecheap adapter converts Vendl's model to Namecheap's current
API parameters.

------------------------------------------------------------------------

# 11. `.com.au` eligibility is more than an identifier

Do not interpret:

``` text
valid ABN = entitled to any .com.au
```

Vendl must still make clear that the customer is responsible for meeting
current auDA eligibility and allocation rules.

Where Namecheap's API requires only the identifier fields, that does not
remove Vendl's need for an eligibility declaration and appropriate
seller guidance.

Collect/store only the information necessary for registration,
audit/support and legal acknowledgement.

------------------------------------------------------------------------

# 12. `.au` direct must be independently proven

Do not copy `.com.au` rules onto `.au` direct.

The spike must determine:

-   whether Namecheap API currently supports `.au` direct
-   required extended attributes
-   eligible Australian-presence types
-   whether ABN/ACN is optional or mandatory in Namecheap's
    implementation
-   registrant contact requirements
-   registration term
-   renewal
-   transfer

If Namecheap's public API documentation is incomplete for `.au`, use
Sandbox/API support channels to prove it before exposing `.au` in
production.

------------------------------------------------------------------------

# 13. Australian seller UX

Example `.com.au` registration step:

``` text
Register greenvalleyfarm.com.au

Australian registration details

Legal registrant name
[ Green Valley Farm & Bakes Pty Ltd ]

Identifier type
[ ABN ▼ ]

ABN
[ 12 345 678 901 ]

Registrant contact
[ Jane Green ]

Email
[ jane@example.com ]

Phone
[ ... ]

Australian address
[ ... ]

[ ] I confirm these details are accurate and that I am
    eligible to register and hold this domain.

[ Continue ]
```

Actual required fields must come from current Namecheap + registry
requirements.

------------------------------------------------------------------------

# 14. Identifier validation

Normalise identifiers before submission.

Example:

``` text
12 345 678 901
→
12345678901
```

Implement local ABN checksum validation if appropriate.

Treat registrar/registry acceptance as authoritative.

Do not scrape ABR or ASIC.

If authoritative business lookup is added later, make it a separate
provider integration.

------------------------------------------------------------------------

# 15. Domain search

Use Namecheap's availability API as registrar authority.

Target:

``` text
Find your domain

[ green valley farm                         ] [ Search ]

greenvalleyfarm.com.au        A$__/year     Available
greenvalleyfarm.au            A$__/year     Available
greenvalleyfarm.com           A$__/year     Available
```

For AU sellers prioritise:

``` text
.com.au
.au
.com
```

Only show `.au` once its API registration flow is proven.

Re-check availability immediately before purchase.

------------------------------------------------------------------------

# 16. Suggestions

Vendl may generate candidate domains from:

-   business name
-   trading name
-   business name without legal suffix
-   relevant category term
-   location where sensible

Every suggestion must then be checked using Namecheap.

Do not imply `.com.au` eligibility merely because a candidate is
available.

------------------------------------------------------------------------

# 17. Namecheap pricing API

Use:

``` text
namecheap.users.getPricing
```

or the current supported pricing mechanism to obtain account-specific
pricing.

The API supports domain pricing actions including concepts such as:

``` text
REGISTER
RENEW
REACTIVATE
TRANSFER
```

The spike must capture Vendl's actual account prices for at least:

``` text
.com.au register
.com.au renew

.au register     if supported
.au renew        if supported

.com register
.com renew

.net.au register
.net.au renew
```

Do not use Namecheap retail website pricing as the source of truth for
Vendl's registrar cost.

Cache pricing sensibly as Namecheap recommends, while refreshing before
financially sensitive operations when needed.

------------------------------------------------------------------------

# 18. Vendl retail pricing

Retain the agreed philosophy:

``` text
Domains are a convenience/retention feature,
not a primary profit centre.
```

Candidate formula:

``` text
wholesaleCostAUD = current Namecheap account cost converted to AUD

retailCandidate =
  MAX(
    wholesaleCostAUD × 1.25,
    wholesaleCostAUD + A$5
  )

retailPrice = Vendl retail rounding(retailCandidate)
```

Do not lock A\$19 `.com.au` until Namecheap's actual **renewal**
economics are known.

Renewal profitability matters more than a promotional registration
price.

------------------------------------------------------------------------

# 19. Registration versus renewal pricing

Persist separately:

``` text
registration wholesale
registration retail
renewal wholesale
renewal retail
```

Seller must see expected renewal before purchase.

Example:

``` text
greenvalleyfarm.com.au

A$XX for 1 year
Renews at A$YY/year*

*Subject to registrar/registry price changes.
```

Do not hide materially higher renewal prices.

------------------------------------------------------------------------

# 20. Currency / FX / GST

Persist:

-   Namecheap amount
-   Namecheap currency
-   conversion basis
-   Vendl retail amount
-   Vendl retail currency
-   GST/tax amount

Use a configurable FX safety buffer if Namecheap charges Vendl in USD.

Determine/document Australian GST treatment before production.

Do not guess tax treatment in code.

------------------------------------------------------------------------

# 21. Namecheap account payment/balance

Determine how API registrations are charged for the actual Vendl
account.

The spike must document:

-   account balance behaviour
-   supported API payment source
-   insufficient-balance behaviour
-   whether auto-top-up exists/is suitable
-   low-balance alerts
-   registration failure behaviour

Do not charge the Vendl seller if the registrar account cannot fund the
registration unless a safe compensation path exists.

Do not add account funds merely for testing without explicit approval.

------------------------------------------------------------------------

# 22. Production purchase flow

``` text
Search
    ↓
Choose domain
    ↓
Collect registrant + TLD eligibility
    ↓
Re-check availability
    ↓
Get current Namecheap registration/renewal cost
    ↓
Calculate Vendl retail
    ↓
Show purchase + renewal price + terms
    ↓
Seller confirms
    ↓
Collect/authorise Vendl payment
    ↓
Register through Namecheap
    ↓
Confirm registration
    ↓
Configure domain for Cloudflare
    ↓
TLS/routing
    ↓
ACTIVE
```

Do not register before seller confirmation/payment.

------------------------------------------------------------------------

# 23. Namecheap registration API

Use the current:

``` text
namecheap.domains.create
```

flow behind the provider abstraction.

Prefer HTTP POST as Namecheap recommends.

Never expose:

``` text
ApiKey
ApiUser
ClientIp infrastructure details
```

to the browser.

Do not put sensitive registrant data into application logs.

------------------------------------------------------------------------

# 24. Premium domains

Namecheap's create flow supports premium-domain registration parameters.

Premium domains must not pass through standard simple pricing.

Show separately:

``` text
Premium domain

Purchase: A$X,XXX
Renewal: A$YYY/year
```

Require explicit acknowledgement.

If premium pricing/renewal cannot be reliably determined, disable
premium-domain purchases for Phase 9A launch.

Never silently buy a premium domain.

------------------------------------------------------------------------

# 25. Registration race condition

Handle:

``` text
available during search
→ unavailable at registration
```

If seller payment has been authorised/collected:

-   void/refund where appropriate
-   mark registration failed
-   explain clearly
-   return seller to search

Never automatically substitute another domain.

------------------------------------------------------------------------

# 26. Purchase record

Reuse/refine the Phase 9A model.

Conceptually:

``` ts
DomainPurchase {
  id
  ownerId
  storefrontId
  storefrontDomainId

  registrar // NAMECHEAP
  registrarDomainId

  hostname
  tld
  status
  registrationYears

  registrarAmount
  registrarCurrency
  retailAmount
  retailCurrency
  taxAmount

  paymentReference
  registrantReference

  registeredAt
  expiresAt

  autoRenew
  renewalStatus

  createdAt
  updatedAt
}
```

Do not redundantly store full contact payloads if safely represented
elsewhere.

------------------------------------------------------------------------

# 27. Payment sequencing / compensation

Explicitly handle:

``` text
Vendl payment succeeds
Namecheap registration fails
```

Required outcome:

-   safe retry only where registration state is known
-   otherwise void/refund
-   seller not left charged without domain
-   internal support visibility

Also handle:

``` text
Namecheap registration succeeds
Cloudflare configuration fails
```

In that case the seller owns the domain. Do not automatically refund the
domain registration. Retry/fix routing.

------------------------------------------------------------------------

# 28. Idempotency

Namecheap's API integration must be protected by Vendl-side
idempotency/transaction guards.

Protect:

-   payment
-   registration
-   renewal
-   contact changes
-   refunds
-   DNS configuration

A double click/browser refresh/worker retry must not purchase the domain
twice or charge twice.

------------------------------------------------------------------------

# 29. Contact management

Use Namecheap's supported contact APIs to retrieve/update contacts where
appropriate.

Distinguish:

``` text
ordinary contact update
```

from:

``` text
legal registrant/ownership change
```

Research `.AU` ownership-change requirements separately.

Do not assume changing `Registrant...` fields is legally equivalent to a
permitted `.AU` licence transfer/trade.

------------------------------------------------------------------------

# 30. Renewal

Use Namecheap's domain renewal API behind the provider abstraction.

Seller UI:

``` text
greenvalleyfarm.com.au
Active

Renews: 12 September 2027
Expected renewal: A$XX/year

Auto-renew [ ON ]
```

Vendl should control/monitor the seller-facing renewal lifecycle rather
than assuming registrar auto-renew alone is sufficient.

Before renewal:

-   retrieve current renewal cost
-   recalculate Vendl retail
-   notify if materially changed
-   collect seller payment
-   renew
-   verify new expiry

Do not wait until expiry day.

------------------------------------------------------------------------

# 31. Failed renewal

Support:

-   payment retry
-   registrar retry where safe
-   seller notification
-   internal alert
-   expiry state
-   reactivate/restore where supported

Use Namecheap's current reactivation/restore pricing and rules where
applicable.

Do not guarantee recovery after expiry.

------------------------------------------------------------------------

# 32. Registrar lock and transfer out

Namecheap exposes registrar-lock management and domain information APIs.

The customer owns the domain.

Design/document a transfer-out path including:

-   registrar lock
-   auth/EPP code availability/process
-   `.AU` transfer requirements
-   identity verification
-   support-assisted steps if API automation is incomplete

Do not hold seller domains hostage to Vendl.

------------------------------------------------------------------------

# 33. Cancelling Vendl

Separate:

``` text
Vendl subscription
```

from:

``` text
domain ownership
```

Cancelling Vendl/Pro must not silently destroy a paid domain.

Seller should have a path to:

-   retain/renew the domain where supported
-   disable auto-renew
-   transfer out
-   change delegation/DNS where appropriate

------------------------------------------------------------------------

# 34. Cloudflare integration

Do not create a Namecheap-specific Storefront routing architecture.

A Vendl-purchased Namecheap domain must enter the same Phase 9 domain
system used by BYO domains.

``` text
Namecheap registration
    ↓
DNS / nameserver delegation
    ↓
Cloudflare
    ↓
Vendl hostname resolver
    ↓
Storefront
```

Use the existing central hostname/preferred-origin architecture.

------------------------------------------------------------------------

# 35. DNS / nameserver spike

Prove the cleanest automatic method for:

``` text
Namecheap-registered domain
→ Cloudflare-controlled DNS/routing
```

Investigate the current Namecheap API capabilities for:

-   nameserver assignment
-   DNS settings
-   custom DNS
-   domain info

and combine them with the selected Phase 9 Cloudflare architecture.

The seller should not manually configure DNS for a domain purchased
through Vendl.

------------------------------------------------------------------------

# 36. Apex and www

Goal:

``` text
greenvalleyfarm.com.au
www.greenvalleyfarm.com.au
```

with one canonical primary and the other redirected.

Do not promise this until the Namecheap + Cloudflare production routing
method is proven.

------------------------------------------------------------------------

# 37. Seller UI

Target:

``` text
Website → Domains

Vendl address
green-valley.vendl.app
Active

Custom domain
greenvalleyfarm.com.au
Active · Primary
Renews 12 Sep 2027 · A$XX/year

[ Manage ]
```

Manage:

-   primary domain
-   renewal
-   expected renewal price
-   auto-renew
-   registrant/contact information where appropriate
-   connection status
-   transfer information

Do not expose XML/API internals.

------------------------------------------------------------------------

# 38. Admin/support

Admin should see:

-   seller
-   Storefront
-   hostname
-   registrar = Namecheap
-   registrar reference
-   registration status
-   registration/expiry dates
-   registrant legal name
-   masked eligibility identifier
-   renewal status
-   Cloudflare status
-   last registrar error
-   registrar funding/API-access warnings

Mask sensitive information.

------------------------------------------------------------------------

# 39. Security

Namecheap credentials:

-   server-side only
-   environment secrets
-   never logged
-   never returned to client
-   Sandbox and Production separated

Registrant data:

-   minimum necessary persistence
-   no full payload logs
-   access controlled
-   identifiers masked in support views

API requests must only execute for the authenticated seller's
Storefront/domain.

------------------------------------------------------------------------

# 40. Observability

Record structured, non-sensitive events for:

``` text
domain_search
domain_selected
eligibility_started
eligibility_validated
payment_started
payment_succeeded
registration_started
registration_succeeded
registration_failed
dns_configuration_started
dns_configuration_succeeded
tls_active
renewal_started
renewal_succeeded
renewal_failed
contact_updated
transfer_started
refund
```

Alert internally on:

-   production API authentication failure
-   IP allowlist failure
-   repeated registration failure
-   registrar funding problem
-   repeated renewal failure
-   Cloudflare configuration failure

------------------------------------------------------------------------

# 41. Environment variables

Use actual project conventions, conceptually:

``` text
DOMAIN_REGISTRAR_PROVIDER=namecheap

NAMECHEAP_ENVIRONMENT=sandbox
NAMECHEAP_API_USER=
NAMECHEAP_API_KEY=
NAMECHEAP_USERNAME=
NAMECHEAP_CLIENT_IP=
NAMECHEAP_SANDBOX_API_URL=
NAMECHEAP_PRODUCTION_API_URL=

NAMECHEAP_INTEGRATION_ENABLED=
DOMAIN_SEARCH_ENABLED=
DOMAIN_PURCHASE_ENABLED=
AU_DOMAIN_PURCHASE_ENABLED=
DOMAIN_AUTORENEW_ENABLED=

DOMAIN_PRICING_MIN_MARGIN_AUD=5
DOMAIN_PRICING_MARKUP_PERCENT=25
DOMAIN_FX_BUFFER_PERCENT=
```

Do not commit credentials.

------------------------------------------------------------------------

# 42. Feature flags

Stage rollout:

``` text
NAMECHEAP_REGISTRAR_ENABLED
DOMAIN_SEARCH_ENABLED
DOMAIN_PURCHASE_ENABLED
COMAU_PURCHASE_ENABLED
AU_DIRECT_PURCHASE_ENABLED
DOMAIN_AUTORENEW_ENABLED
DOMAIN_TRANSFER_ENABLED
PREMIUM_DOMAIN_PURCHASE_ENABLED
```

Do not leave obsolete rollout flags indefinitely.

------------------------------------------------------------------------

# 43. Spike script output

`scripts/spike-namecheap-domains.ts` should report clearly:

``` text
Namecheap Sandbox account       PASS / FAIL
Sandbox API auth                PASS / FAIL
Production API eligibility      PASS / FAIL / NOT TESTED
IPv4 architecture               PASS / FAIL / NEEDS INFRA
.com.au availability            PASS / FAIL
.au availability                PASS / FAIL
.com availability               PASS / FAIL
.net.au availability            PASS / FAIL
Customer-as-registrant          PASS / FAIL
.com.au extended attributes     PASS / FAIL
.au direct eligibility          PASS / FAIL / UNSUPPORTED
Registration pricing            PASS / FAIL
Renewal pricing                 PASS / FAIL
Contact API                     PASS / FAIL
Renewal API                     PASS / FAIL
Registrar lock                  PASS / FAIL
Transfer-out path               PASS / FAIL
DNS/Cloudflare path             PASS / FAIL / NEEDS INFRA
```

The script must refuse irreversible production actions unless explicitly
enabled.

------------------------------------------------------------------------

# 44. Green Valley QA

Use the fictional:

``` text
Green Valley Farm & Bakes
Adelaide Hills, SA
```

for UI/Sandbox test data.

Search candidates:

``` text
greenvalleyfarmandbakes
greenvalleyfarm
greenvalleybakes
```

Do not register a real Green Valley domain.

------------------------------------------------------------------------

# 45. Automated tests

## Provider/API

-   Sandbox/production endpoint selection
-   auth/global parameters
-   XML serialization
-   XML parsing
-   Namecheap API errors
-   IP-related errors
-   secret redaction

## Search

-   `.com.au`
-   `.au`
-   `.com`
-   `.net.au`
-   unavailable domain
-   API failure

## Registrant

-   seller/customer supplied as registrant
-   Vendl not supplied as registrant
-   all required contact fields
-   invalid contact

## `.com.au`

-   ABN
-   ACN
-   RBN/TM where supported by product UX
-   missing identifier
-   invalid identifier
-   declaration

## `.au`

-   current supported eligibility paths
-   missing required data
-   unsupported state if Namecheap API cannot support direct `.au`

## Pricing

-   register price
-   renewal price
-   account-specific `YourPrice`
-   currency conversion
-   minimum margin
-   25% markup
-   retail rounding
-   FX buffer
-   GST configuration
-   premium domain

## Purchase

-   payment success
-   payment failure
-   registration success
-   registration failure
-   domain-taken race
-   duplicate click
-   worker retry
-   refund/void compensation

## Lifecycle

-   contact retrieval/update
-   renewal
-   renewal failure
-   expired/reactivation
-   registrar lock
-   transfer out
-   Vendl cancellation

## Cloudflare

-   delegation/configuration
-   TLS pending
-   TLS active
-   preferred origin
-   canonical
-   apex/www redirect

## Security

-   cross-tenant access
-   duplicate registrar reference
-   secret leakage
-   PII logging

------------------------------------------------------------------------

# 46. Regression suite

Run all relevant existing:

-   Phase 9 tenancy/domain tests
-   Website Studio
-   Storefront
-   checkout
-   billing
-   SEO
-   Farm Stand QR
-   TypeScript
-   production build

Do not break the GoDaddy/OpenSRS scaffolds while Namecheap is being
evaluated unless cleanup is explicitly approved later.

**PayPal WIP remains untouched.**

------------------------------------------------------------------------

# 47. Result document

Create:

``` text
VENDL-PHASE-9A-NAMECHEAP-DOMAIN-PURCHASE-RESULT.md
```

Report:

1.  Sandbox account/access
2.  production API eligibility
3.  IPv4 allowlisting architecture
4.  API authentication
5.  `.com.au`
6.  `.au`
7.  `.com`
8.  `.net.au`
9.  customer-as-registrant proof
10. contact mapping
11. `.com.au` extended attributes
12. `.au` eligibility findings
13. identifier validation
14. search/availability
15. registration wholesale pricing
16. renewal wholesale pricing
17. Vendl retail recommendation
18. FX
19. GST decision
20. account payment/balance behaviour
21. premium-domain policy
22. registration flow
23. payment compensation
24. domain schema
25. provider abstraction
26. contact updates
27. renewal
28. expiry/reactivation
29. registrar lock
30. transfer-out
31. Cloudflare integration
32. DNS/nameserver strategy
33. apex/www
34. preferred origin
35. cancellation/ownership
36. security/privacy
37. observability
38. Green Valley QA
39. tests
40. TypeScript/build
41. known limitations
42. Git status

------------------------------------------------------------------------

# 48. Hard gates

First:

``` text
NAMECHEAP REGISTRAR SPIKE PASSED
```

or:

``` text
NAMECHEAP REGISTRAR SPIKE NEEDS WORK
```

This gate cannot pass unless:

``` text
CUSTOMER AS REGISTRANT = PASS
```

Then:

``` text
NAMECHEAP AU DOMAIN GATE PASSED
```

or:

``` text
NAMECHEAP AU DOMAIN GATE NEEDS WORK
```

`.com.au` is mandatory.

Report `.au` direct separately if Namecheap API support differs.

Then:

``` text
NAMECHEAP PRODUCTION API INFRASTRUCTURE VERIFIED
```

or:

``` text
NAMECHEAP PRODUCTION API INFRASTRUCTURE NOT VERIFIED
```

The production infrastructure gate includes the IPv4 allowlist solution.

Finally:

``` text
DOMAIN PURCHASE APPLICATION GATE PASSED
```

or:

``` text
DOMAIN PURCHASE APPLICATION NEEDS WORK
```

Do not collapse these into a generic "done".

------------------------------------------------------------------------

# 49. Definition of done

Namecheap Phase 9A is complete when:

-   Sandbox API works
-   production API eligibility is known
-   stable production IPv4/API architecture is proven
-   `.com.au` availability and registration are supported
-   `.au` support is explicitly proven or clearly excluded
-   `.com` works
-   customer/seller is the registrant
-   `.com.au` extended attributes map correctly
-   seller sees appropriate eligibility/declaration UX
-   actual Namecheap account registration and renewal prices are known
-   Vendl retail pricing protects margin
-   seller sees renewal price before purchase
-   payment/registration sequencing is safe
-   registration is idempotent
-   failed registration after payment is compensated
-   successful domains enter the existing Phase 9 Cloudflare
    architecture
-   DNS/TLS setup is automatic for Vendl-purchased domains
-   preferred Storefront origin works
-   renewals work
-   contact updates are supported appropriately
-   transfer-out is documented/supported
-   cancelling Vendl does not destroy seller ownership
-   tenant isolation is proven
-   QR/Storefront/checkout regressions pass

------------------------------------------------------------------------

# 50. Hard constraints

Do not:

-   use Vendl as registrant for customer domains
-   proceed with full purchase UI if customer-as-registrant fails
-   assume `.au` direct works because `.com.au` works
-   assume ABN permits any `.com.au`
-   hardcode Namecheap retail website pricing
-   hardcode promotional first-year pricing
-   register before seller confirmation/payment
-   silently buy premium domains
-   expose API keys
-   weaken IPv4 allowlisting
-   require manual seller DNS for a Vendl-purchased domain if automation
    is possible
-   build a second Storefront routing system
-   break `/s/[standSlug]`
-   alter Vendl Free/Pro economics
-   alter Stripe Connect
-   modify PayPal WIP
-   begin Square work from this brief
-   begin accounting work from this brief
-   commit, push, merge or deploy unless explicitly instructed

**PayPal WIP remains untouched.**

------------------------------------------------------------------------

# 51. Existing registrar work

Do not delete existing work yet:

``` text
GoDaddy brief/scaffold/spike/result
OpenSRS brief or spike work
```

Mark them inactive/blocked while Namecheap is evaluated.

If Namecheap passes all gates and is selected, perform registrar cleanup
only as a separately reviewed task.

------------------------------------------------------------------------

# 52. Authoritative Namecheap references

Re-check these at implementation time because API requirements, TLD
support and pricing can change.

-   API introduction / Sandbox / production access:
    https://www.namecheap.com/support/api/intro/

-   API global parameters / IPv4 ClientIp:
    https://www.namecheap.com/support/api/global-parameters/

-   API methods: https://www.namecheap.com/support/api/methods/

-   Domain registration (`namecheap.domains.create`):
    https://www.namecheap.com/support/api/methods/domains/create/

-   Extended attributes including `.COM.AU`:
    https://www.namecheap.com/support/api/extended-attributes/

-   Account pricing (`namecheap.users.getPricing`):
    https://www.namecheap.com/support/api/methods/users/get-pricing/

-   API FAQ / current production-access requirements:
    https://www.namecheap.com/support/knowledgebase/article.aspx/9739/63/api-faq/

------------------------------------------------------------------------

# 53. Hard stop

Run the Namecheap Sandbox/registrar spike first.

If:

``` text
CUSTOMER AS REGISTRANT = FAIL
```

stop and report.

If:

``` text
CUSTOMER AS REGISTRANT = PASS
.com.au = PASS
PRICING = ACCEPTABLE
```

continue Phase 9A implementation.

Treat `.au` direct as its own explicit gate until proven.

Do not start Square or accounting work automatically.
