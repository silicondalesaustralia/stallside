# Vendl Next — Phase 7: Growth & Customer Retention

## Status

Phase 7 implementation brief.

Phase 6 has established the production foundation:

Ingredients → Recipes → Product links → order-derived Production planning.

Proceed with Phase 7 only after confirming the current repository state and preserving all Phase 2–6 work.

**Do NOT commit, push, merge, deploy, or release this work.**

Do not begin Phase 8.

PayPal WIP remains out of scope and must not be modified, staged, reverted, or cleaned up unless compilation absolutely requires a change. If so, stop and report first.

---

# 1. Objective

Build Vendl's customer growth and retention foundation.

Phase 7 should turn the customer/order data Vendl already owns into practical tools that help independent sellers:

- understand their customers
- encourage repeat purchases
- recover demand
- reward loyal customers
- create promotions
- communicate with customers
- collect reviews
- sell gift cards
- measure whether retention activity produces orders

The intended system is:

Customer
→ Purchase history
→ Segments
→ Promotion / Campaign
→ Return visit
→ Order
→ Loyalty / Review / Repeat purchase

This phase should make Vendl more than a transaction system.

It should help sellers create repeat business.

---

# 2. Product principle

Do not build a generic enterprise marketing platform.

Vendl serves small independent sellers such as:

- bakeries
- home food businesses
- farm stands
- roadside stalls
- produce sellers
- flower growers
- makers
- subscription sellers
- preorder/drop businesses

The experience must be simple enough that a seller can use it without knowing CRM or marketing terminology.

Prefer:

"Customers who haven't ordered in 60 days"

over:

"Create a dynamic behavioural segment using last_order_at."

Prefer:

"Send a message"

over:

"Create omnichannel automation workflow."

---

# 3. Audit the repository first

Before implementing, inspect the actual current repository.

Audit at minimum:

- Customer
- Order
- OrderItem
- OrderFulfilment
- Product
- Category
- Menu / Drop
- subscriptions
- restock notifications
- existing discounts/coupons
- existing email notifications
- Resend integration
- push notifications
- SMS code/integrations if any
- seller notification preferences
- shopper/customer consent fields
- marketing consent
- unsubscribe behaviour
- storefront checkout
- payment flows
- Stripe
- PayPal WIP without modifying it
- current Free/Pro plan architecture
- existing analytics/events
- current dashboard navigation
- current background/scheduled-job architecture
- existing cron endpoints
- customer merge/linking logic from Phase 3
- country/currency/businessMode configuration
- privacy/legal pages or communication preferences

Do not create duplicate systems where usable functionality already exists.

Produce a concise implementation plan based on the repository before making significant changes.

---

# 4. Scope priority

Phase 7 should be implemented in this order:

1. Customer insights and segmentation
2. Coupons / promotions
3. Campaign messaging foundation
4. Repeat-order and restock tools
5. Loyalty
6. Reviews
7. Gift cards
8. Retention reporting

This order matters.

Build the shared customer/promotion/communication foundations before adding isolated features.

---

# 5. Customer profile improvements

Extend the existing Phase 3 CRM rather than replacing it.

A Customer detail page should make useful commercial information immediately visible.

Potential summary:

- customer name
- email
- phone where available
- first order
- last order
- total orders
- total spend
- average order value
- products purchased
- menus/drops purchased from
- subscriptions
- fulfilment preferences where useful
- marketing consent
- loyalty status/points if enabled
- notes
- tags
- recent activity

Use existing order data as source of truth.

Do not duplicate order totals into mutable fields unless there is a strong performance reason.

---

# 6. Customer tags

Add simple owner-scoped customer tags if they do not already exist.

Examples:

- VIP
- Wholesale
- Local
- Saturday pickup
- Cake customer
- Farm box
- Friend & family

Allow:

- add tag
- remove tag
- filter by tag
- use tags in segments

Tags should be seller-defined.

Do not create a complicated taxonomy system.

---

# 7. Customer segmentation

Build practical dynamic customer segments.

Likely route:

`/dashboard/customers/segments`

Support useful conditions such as:

- ordered at least once
- order count
- total spend
- average order value
- last order date
- first order date
- has not ordered in X days
- purchased product
- purchased category
- purchased from Menu/Drop
- subscription status
- customer tag
- marketing consent
- location/postcode where safely available

Segments should be owner-scoped.

---

# 8. Segment presets

Provide useful presets so a small seller does not need to build every segment manually.

Examples:

## Best customers

Customers with multiple orders and high spend.

## New customers

First purchase recently.

## Repeat customers

2+ completed/qualifying orders.

## Haven't ordered recently

Previously purchased but no order in a configurable period.

## Menu customers

Bought from a particular Menu/Drop.

## Product customers

Bought a particular Product.

## Subscribers

Active subscription customers.

## Restock interest

Customers waiting for a product/restock where current data supports this.

Make thresholds editable where appropriate.

---

# 9. Segment architecture

Prefer dynamic/query-based segments over copying customers into static lists.

However, support manual/static membership only if genuinely useful.

Potential model concepts:

- CustomerSegment
- CustomerSegmentRule
- optional CustomerSegmentMember for static/manual segments

Do not over-engineer a generic rules engine.

Support the conditions Vendl actually needs.

Make it extensible enough for later growth.

---

# 10. Customer consent and communication safety

This is critical.

Before campaign implementation, audit what consent Vendl currently records.

Differentiate operational communications from marketing communications.

Examples of operational messages:

- order confirmation
- pickup reminder
- payment receipt
- fulfilment update
- subscription order notification

Examples of marketing:

- new Saturday menu
- product promotion
- "we miss you"
- discount campaign
- new product announcement

Do not treat an email address obtained through an order as automatic unlimited marketing consent if applicable law/consent architecture does not support that.

Preserve evidence of consent where available.

At minimum design for:

- marketingEmailConsent
- marketingSmsConsent if SMS exists
- consent timestamp/source where practical
- unsubscribe
- suppression

Do not send marketing to unsubscribed/suppressed recipients.

---

# 11. Global unsubscribe

Implement a robust seller/customer unsubscribe mechanism for marketing email if not already present.

Requirements:

- secure unsubscribe token
- no login required for customer
- seller-scoped or appropriately global preference semantics
- immediate suppression
- unsubscribe page
- campaign send logic honours suppression
- operational order messages remain separate where legally/technically appropriate

Do not expose sequential customer IDs in unsubscribe URLs.

---

# 12. Promotions / coupons

Audit the existing discount architecture first.

Extend rather than duplicate it.

Seller should be able to create promotions such as:

- 10% off
- $5 off
- free delivery
- product-specific discount
- category-specific discount
- Menu/Drop-specific discount
- minimum order value
- first-order discount
- repeat-customer discount

Potential code:

`WELCOME10`

Support:

- code
- start date
- end date
- usage limit
- per-customer limit
- minimum spend
- eligible products/categories/menu
- active/inactive

Do not create a Shopify-scale promotions engine.

---

# 13. Automatic promotions

If safe within the current cart architecture, support limited automatic discounts.

Examples:

- first order 10% off
- spend $50, get $5 off

If automatic discounts create excessive checkout complexity, implement coupon-code promotions first and document automatic discounts as Phase 7B.

Never risk breaking existing cart/payment totals.

---

# 14. Promotion accounting

Discounts must be snapshotted on Orders using existing order total conventions.

Historic orders must not change when a Promotion is later edited.

Clearly record where practical:

- promotion/coupon used
- discount amount
- code
- rule snapshot/reference

Do not recompute historical discounts from current promotion settings.

---

# 15. Campaign messaging foundation

Build a seller-facing communication area.

Likely:

`/dashboard/grow`

with modules such as:

- Campaigns
- Loyalty
- Reviews
- Gift Cards

Or fit into the existing dashboard structure after auditing it.

Do not overload the main navigation.

---

# 16. Email campaigns

Use the existing Resend infrastructure if appropriate.

Seller should be able to:

1. choose audience
2. compose message
3. preview
4. send/test
5. send campaign
6. see basic results

Audience can be:

- all eligible marketing customers
- a saved segment
- purchasers of a product
- customers from a Menu/Drop
- manually selected customers if appropriate

Keep the composer intentionally simple.

---

# 17. Campaign composer

Support a polished but constrained email format.

Potential fields:

- campaign name
- subject
- preview text
- heading
- message
- optional image
- CTA label
- CTA URL
- optional promotion/coupon
- seller identity/footer

Do not build a drag-and-drop email page builder in Phase 7.

Use seller branding from the storefront where appropriate.

---

# 18. Campaign templates

Provide lightweight templates.

Examples:

- New menu/drop
- Back in stock
- New product
- Weekend pickup
- Special offer
- Thank you
- We haven't seen you lately

Templates should prefill structure, not create complex automation.

---

# 19. Test sends

Allow seller to send a test email to themselves before sending a campaign.

Verify the destination belongs to/authenticated seller context where appropriate.

Test sends must be clearly marked and must not affect campaign customer metrics.

---

# 20. Campaign send architecture

Do not synchronously send hundreds/thousands of emails inside one dashboard request.

Audit the project's existing scheduled/background execution architecture.

Use a safe queue/batch/cron approach compatible with the current deployment.

Requirements:

- idempotent sends
- recipient snapshot or deterministic audience semantics
- no duplicate sends
- retry-safe
- unsubscribe checked
- suppression checked
- send status
- failure status
- provider message ID where available

If robust background delivery requires infrastructure not currently available, implement a safe bounded approach and document the limitation rather than creating fragile infrastructure.

---

# 21. Campaign models

Potential concepts:

- Campaign
- CampaignRecipient
- CampaignEvent

Possible campaign statuses:

DRAFT
SCHEDULED
SENDING
SENT
FAILED
CANCELLED

Do not implement scheduled sending unless the current job architecture can support it safely.

Immediate send is sufficient for Phase 7 if scheduling adds significant infrastructure.

---

# 22. Campaign metrics

At minimum provide:

- recipients
- delivered where provider data exists
- failed/bounced where provider data exists
- clicks if Vendl can reliably track them
- orders attributed
- revenue attributed

Do not obsess over email open rates.

Modern email privacy makes opens unreliable.

If opens are available, label them appropriately and do not make them the primary success metric.

---

# 23. Campaign order attribution

This is important.

When a customer clicks a Vendl campaign link, attach a safe campaign attribution token/context.

If that visit later creates an Order within a reasonable attribution window, associate the Order with the Campaign.

This allows:

Campaign:
Saturday Bake

Sent:
312

Orders:
27

Revenue:
$846

Promotion used:
12

Use first-party Vendl attribution.

Do not introduce invasive cross-site tracking.

---

# 24. Repeat-order tools

Build convenient repeat purchase actions.

On customer-facing order history / relevant customer experience where authentication architecture supports it:

- Buy again

For sellers:

- identify customers likely to reorder
- quickly target previous buyers of a product
- create campaign from product purchasers

A "Buy again" action should reconstruct a cart only with currently available/eligible products.

Do not blindly reproduce:

- unavailable products
- invalid fulfilment
- expired menu context
- discontinued variants

Explain skipped items.

---

# 25. Restock notifications

Audit existing restock notification functionality.

Integrate it into Customer CRM and Growth rather than building a second system.

Seller should be able to see:

- products with waiting customers
- number waiting
- eligible customers
- send restock notification

Where current architecture already automatically sends restock messages, expose/report it instead.

Respect consent semantics based on whether the restock request itself constitutes consent for that specific transactional notification.

Do not automatically convert restock consent into general marketing consent.

---

# 26. Menu / Drop campaigns

Menus should integrate directly with Growth.

From a Menu/Drop:

`Tell customers`

or equivalent.

Seller can target:

- all marketing customers
- previous buyers of this Menu
- previous buyers of products included in this Menu
- saved segment

Prefill:

- menu name
- ordering deadline
- fulfilment/pickup information
- storefront/menu URL

This should be one of the highest-value food seller workflows.

---

# 27. Loyalty foundation

Build a simple optional seller loyalty program.

Do not build airline points.

Seller should be able to enable:

"Earn points on purchases"

Potential configuration:

- points per currency amount spent
- reward threshold
- reward value
- program name
- active/inactive

Example:

Earn 1 point per $1.

100 points = $10 reward.

Use the seller's currency.

---

# 28. Loyalty ledger

Never store only a mutable `pointsBalance` without an audit trail.

Use a ledger concept.

Potential:

LoyaltyAccount
LoyaltyTransaction

Transaction types might include:

- ORDER_EARN
- REWARD_REDEEM
- MANUAL_ADJUSTMENT
- REFUND_REVERSAL
- EXPIRY later if implemented

Balance can be calculated or safely cached.

Transactions should reference Orders/Rewards where relevant.

---

# 29. Loyalty order behaviour

Define exactly when points are earned.

Use the repository's actual successful-order semantics.

Do not award points merely because checkout started.

Handle:

- refunds
- cancelled orders
- partial refunds if existing order architecture supports them
- cash orders according to existing completion/payment semantics
- subscription orders

Make operations idempotent.

An Order must not award points twice.

---

# 30. Loyalty rewards

Initial reward implementation should preferably integrate with the Promotion/discount architecture.

Example:

Customer reaches 100 points.

They can redeem:

$10 reward.

Create/apply a customer-specific reward/discount in a controlled way.

Avoid building an entirely separate checkout discount engine.

---

# 31. Loyalty storefront/customer UX

Where customer identity is known, allow them to understand:

- points balance
- progress toward reward
- available reward

Do not require a complex consumer account system if Vendl does not currently have one.

If customer authentication is not ready, Phase 7 may surface loyalty primarily through:

- checkout recognition
- email
- order confirmation
- secure customer links

Document the approach.

---

# 32. Gift cards

Build seller-specific gift cards, not a Vendl-wide stored-value currency.

Seller can create/sell gift card Products or dedicated gift cards.

Potential values:

- $25
- $50
- $100
- custom value if safe

Gift card should generate a secure redemption code.

---

# 33. Gift card ledger

Gift card balance must be transaction-based/auditable.

Potential:

GiftCard
GiftCardTransaction

Track:

- initial issue
- redemption
- partial redemption
- refund/restoration if supported
- manual adjustment if allowed
- expiry only where explicitly configured/legal

Never rely solely on client-provided balance.

Gift card codes must be high entropy.

Do not expose internal IDs.

---

# 34. Gift card checkout

Gift cards should reduce the amount due before payment provider collection.

Example:

Order total:
$62

Gift card:
$50

Remaining:
$12

Then charge $12 through existing payment flow.

This is payment-sensitive.

Audit all checkout methods before implementation.

Do not break:

- Stripe
- cash/local
- subscriptions
- deposits
- QR checkout
- Menu cart
- storefront cart
- PayPal WIP

If safe partial-tender gift cards require substantial payment architecture changes, STOP and report before implementing checkout redemption.

It is acceptable to implement gift-card foundation/issuance and defer redemption rather than destabilise payments.

---

# 35. Reviews

Build verified-purchase seller/product reviews.

A review should be tied to a genuine eligible Order/OrderItem where possible.

Potential:

Review

- ownerId
- customerId
- orderId
- orderItemId optional
- productId optional
- rating
- title optional
- body
- status
- createdAt

Statuses:

PENDING
APPROVED
REJECTED

Do not allow arbitrary unauthenticated review spam.

---

# 36. Review requests

After a completed/fulfilled order, Vendl should be able to ask:

"How was your order?"

Use a secure review token/link.

The seller can enable/disable review requests.

Do not send a marketing campaign merely to request a review if consent/legal semantics differ; classify and implement carefully.

Avoid excessive messaging.

---

# 37. Review moderation

Seller can:

- approve
- reject/hide

Seller should not be able to alter the customer's review text while presenting it as the original review.

If seller responses are implemented, store them separately.

Do not build advanced moderation tooling.

---

# 38. Public reviews

Allow approved reviews to appear where appropriate:

- Product page
- potentially storefront testimonials/reviews section

Use structured data only if it is valid for the actual page/entity and current implementation.

Do not create fake aggregate ratings.

Do not show unapproved reviews publicly.

---

# 39. Customer activity timeline

If feasible, create a lightweight activity timeline on Customer detail.

Examples:

- Order placed
- Subscription started
- Campaign sent
- Campaign clicked
- Coupon redeemed
- Loyalty reward earned
- Review submitted
- Restock request
- Seller note

Do not create a huge event-sourcing project.

Use existing records and a small activity abstraction if useful.

---

# 40. Growth dashboard

Create a useful high-level Growth page if consistent with current navigation.

Potential:

`/dashboard/grow`

Show practical metrics:

- customers
- repeat customer rate
- returning customer revenue
- customers due for re-engagement
- active loyalty members
- outstanding restock demand
- recent campaign revenue
- reviews awaiting approval

Keep it actionable.

Avoid vanity charts.

---

# 41. Repeat customer metrics

Define repeat customers consistently.

Example:

A repeat customer has at least two qualifying Orders.

Use the same qualifying order semantics as CRM/reporting.

Potential metrics:

- new customers
- repeat customers
- repeat order rate
- returning customer revenue
- average orders/customer
- days since last order

Document definitions.

---

# 42. Attribution and privacy

Campaign tracking should use first-party Vendl identifiers/tokens.

Do not expose:

- customer email
- customer ID
- seller internal IDs

in public tracking URLs where avoidable.

Use signed/random tokens.

Do not introduce third-party behavioural advertising trackers as part of Phase 7.

---

# 43. SMS

Audit existing SMS capability.

Do not introduce a paid SMS provider casually.

If Vendl does not already have robust SMS infrastructure, design the communication architecture so SMS can be added later, but make Phase 7 production implementation email-first.

Potential future channels:

EMAIL
SMS
PUSH

Do not let future-channel abstraction make current email implementation unnecessarily complicated.

---

# 44. Push notifications

Existing seller/customer push infrastructure may be useful for operational notifications.

Audit it.

Do not treat push permission as marketing consent automatically.

If customer push is not already robust, do not make it a Phase 7 dependency.

---

# 45. Free vs Pro

Do not change current Vendl economics unless explicitly instructed.

Current production economics must remain intact.

Audit existing plan entitlements.

Recommend sensible feature gating, but do not arbitrarily lock the entire Growth system behind Pro.

A possible direction:

Free:
- CRM
- basic segments
- coupons
- basic reviews

Pro:
- larger campaigns
- advanced segments
- loyalty
- gift cards
- advanced retention reporting

But inspect current entitlement architecture and document the recommendation before enforcing new gates.

Do not alter Free transaction fee or Pro subscription pricing.

---

# 46. Farm Stand compatibility

Farm Stand remains first-class.

Growth features should work for sellers who use QR/self-serve selling.

Examples:

- regular egg buyer
- repeat flower customer
- firewood customer
- farm gate produce buyer

Do not make Growth screens speak only in bakery language.

Menus/Drops can receive specialised shortcuts, but the underlying CRM remains general.

---

# 47. Food business integration

FOOD_BUSINESS and BOTH sellers should get strong integration with:

- Menu/Drop announcements
- repeat customers
- preorder buyers
- loyalty
- review requests
- product purchaser segments

This should make workflows such as the following easy:

1. Publish Saturday Bake menu.
2. Click Tell customers.
3. Select previous bakery customers.
4. Send.
5. Customers order.
6. Vendl attributes resulting orders.
7. Production planning updates from those orders.

That is an important end-to-end Phase 7 workflow.

---

# 48. Existing customer data

Do not require sellers to rebuild their customer database.

Use Phase 3's linked Customer records and existing Orders.

Where customer records are incomplete, degrade gracefully.

Do not fabricate marketing consent during migration/backfill.

If historical consent cannot be established, mark it appropriately rather than assuming opt-in.

---

# 49. Security / tenancy

Every new object must be correctly owner-scoped.

Verify ownership for:

- CustomerTag
- CustomerSegment
- Promotion
- Campaign
- CampaignRecipient
- Loyalty configuration/accounts
- GiftCard
- Review
- related mutations

Never trust IDs received from the client.

Explicitly test cross-tenant access.

---

# 50. Rate limiting / abuse prevention

Marketing tools can create platform abuse risk.

Implement appropriate safeguards for campaign sending.

Consider:

- seller authentication
- recipient limits
- batch limits
- rate limits
- suppression
- provider errors
- repeated-send protection
- account-level abuse controls

Do not create an open bulk-email relay.

---

# 51. Email sender identity

Audit current Resend sender architecture.

Campaign email must have clear seller identity while remaining deliverable.

Do not dynamically spoof arbitrary From addresses.

Use a safe Vendl-controlled sending domain and seller display name if that matches current infrastructure.

Provide appropriate Reply-To behaviour where safe.

Include required footer/unsubscribe information.

---

# 52. Data retention

Do not hard-delete records required for financial/audit integrity.

Examples:

- Campaign recipient history
- loyalty transactions
- gift card transactions
- promotion snapshots on orders

Customer deletion/privacy workflows should be considered against existing architecture.

Document how Phase 7 records behave when a Customer is deleted/anonymised.

---

# 53. Mobile UX

Sellers will use Growth from phones.

Critical mobile flows:

- customer lookup
- customer detail
- create coupon
- select campaign audience
- compose campaign
- test/send
- review moderation
- loyalty lookup

Avoid wide desktop-only tables for essential workflows.

---

# 54. Empty states

Use helpful business-oriented empty states.

Examples:

## No repeat customers yet

"Once a customer places their second order, they'll appear here."

## No campaign yet

"Tell your customers when your next menu, product or pickup is ready."

## No reviews yet

"After fulfilled orders, you can invite customers to leave a review."

Do not overwhelm new sellers with configuration.

---

# 55. Analytics events

Add useful internal product analytics where an existing event system exists.

Examples:

- segment_created
- promotion_created
- campaign_created
- campaign_sent
- campaign_order_attributed
- loyalty_enabled
- loyalty_reward_redeemed
- review_requested
- review_submitted
- gift_card_issued

Do not introduce a new analytics vendor solely for Phase 7.

---

# 56. Tests — segmentation

Add tests for:

- order count segment
- total spend segment
- last order date
- product purchaser
- category purchaser
- Menu purchaser
- tag segment
- marketing consent
- cross-tenant exclusion

---

# 57. Tests — promotions

Test:

- percentage discount
- fixed discount
- minimum order
- start/end dates
- usage limit
- per-customer limit
- product eligibility
- invalid/expired coupon
- historical order discount snapshot
- idempotency where applicable

---

# 58. Tests — campaigns

Test:

- audience resolution
- unsubscribed exclusion
- suppression exclusion
- cross-tenant exclusion
- recipient deduplication
- idempotent sending
- attribution token validation
- campaign → order attribution
- invalid token handling

Do not send real emails during automated tests.

---

# 59. Tests — loyalty

If implemented:

- points earned once
- repeat webhook/order processing does not duplicate points
- reward redemption
- refund reversal
- cross-tenant safety
- manual adjustment audit
- balance correctness

---

# 60. Tests — gift cards

If checkout redemption is implemented:

- secure code lookup
- partial redemption
- full redemption
- insufficient balance
- concurrent redemption protection
- order snapshot
- refund restoration if supported
- cross-seller rejection
- payment remainder calculation

Gift card value is money.

Use transactions/locking appropriate to prevent double-spend.

---

# 61. Tests — reviews

Test:

- verified review token
- token cannot review unrelated Order
- one-review semantics where intended
- moderation
- public approved-only filtering
- cross-tenant protection

---

# 62. Regression testing

Explicitly test existing functionality:

- signup
- onboarding
- FARM_STAND
- FOOD_BUSINESS
- BOTH
- Products
- Categories
- Menus/Drops
- menu cart
- Fulfilment
- Pickup
- Delivery
- Preorders
- Subscriptions
- Customers
- Orders
- Ingredients
- Recipes
- Production
- `/shop/*`
- `*.localhost`
- `/s/*`
- QR checkout
- Stripe
- cash/local payment
- transaction fees
- Pro fee behaviour
- inventory
- restock alerts
- seller alerts
- dashboard mobile
- Capacitor

PayPal WIP remains untouched.

---

# 63. Database migration

All migrations must be additive and safe.

Do not remove or destructively reinterpret existing:

- Customer
- Order
- Product
- Menu
- Fulfilment
- Ingredient/Recipe/Production
- Storefront
- Stand
- payment
- subscription

data.

Backfills must be idempotent where applicable.

Never backfill historical customers as marketing opted-in without reliable evidence.

---

# 64. Build requirements

Before Phase 7 is considered complete, run:

`npx prisma generate`

`npx tsc --noEmit`

`npm run build`

Run existing relevant test suites including:

`npm run test:production`

`npm run test:tenancy`

and all new Phase 7 tests.

The previously known empty `DATABASE_URL` override in `.env.production.local` should be corrected locally so one complete build can run successfully.

Do not hide environment failures.

Report them precisely.

---

# 65. Explicitly deferred

Unless required for safe implementation, do NOT build:

- supplier purchasing
- ingredient inventory
- nutrition
- allergen compliance
- accounting integrations
- staff accounts/rostering
- complex marketing automation journeys
- abandoned-cart automation
- AI campaign generation
- drag-and-drop email builder
- full SMS platform
- WhatsApp marketing
- advertising audiences
- Meta/Google Ads sync
- cross-seller marketplace loyalty
- consumer discovery app
- custom domain implementation
- Product.standId cleanup
- Phase 8 advanced operations

Do not expand scope simply because a related feature is attractive.

---

# 66. Phase 7 completion criteria

Phase 7 should not be considered complete merely because database models exist.

At minimum, the seller should be able to complete this end-to-end workflow:

1. Open Customers.
2. Identify a useful customer group.
3. Create/select a Segment.
4. Create a promotion if desired.
5. Create a campaign.
6. Select the Segment.
7. Preview/test.
8. Send safely to eligible recipients.
9. Customer follows the campaign link.
10. Customer orders through the existing Vendl storefront/Menu.
11. Vendl attributes that Order to the Campaign.
12. Seller can see resulting orders/revenue.

And where implemented:

13. Customer earns loyalty credit.
14. Seller can request/receive a verified review.
15. Gift card can be safely issued/redeemed without destabilising payments.

This end-to-end commercial loop is the purpose of Phase 7.

---

# 67. Implementation approach

Phase 7 is authorised for implementation.

However:

**FIRST audit the repository.**

Then provide a concise implementation plan based on what actually exists.

Proceed if the work can be implemented additively and safely.

STOP and report before proceeding with any portion that requires:

- payment architecture redesign
- destructive migration
- replacing Customer architecture
- breaking existing checkout
- changing transaction fees
- changing subscription billing
- significant new external infrastructure
- unsafe bulk-email architecture
- gift-card implementation that risks payment integrity

Do not use a speculative rewrite as a shortcut.

---

# 68. Completion report

When complete, report:

1. Files changed
2. Schema changes
3. Migration name/status
4. Customer CRM changes
5. Segmentation
6. Promotions/coupons
7. Campaign functionality
8. Consent/unsubscribe implementation
9. Campaign attribution
10. Repeat-order/restock functionality
11. Loyalty functionality
12. Reviews
13. Gift cards
14. Growth dashboard/reporting
15. Free/Pro gating, if any
16. Email delivery architecture
17. Security/tenancy safeguards
18. Tests added/results
19. Regression results
20. Typecheck/build result
21. Deferred items
22. Architecture deviations and why
23. Git status

**Do NOT commit.**

**Do NOT push.**

**Do NOT merge.**

**Do NOT deploy.**

**Do NOT begin Phase 8.**

Stop after the Phase 7 completion report.
