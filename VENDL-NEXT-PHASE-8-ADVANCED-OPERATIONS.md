# Vendl Next --- Phase 8: Advanced Operations

## Status

Phase 8 implementation brief.

Phase 7 is complete locally. The latest validation state is clean:

-   `test:grow` --- 6/6
-   production tests --- passed
-   tenancy tests --- passed
-   `npx tsc --noEmit` --- passed
-   full build --- passed

Proceed with Phase 8 only after auditing the current repository and
preserving all Phase 2--7 work.

**Do NOT commit, push, merge, deploy, or release this work.**

Do not begin Phase 9.

PayPal WIP remains out of scope. Do not modify, stage, revert, clean up,
or incorporate unrelated PayPal work unless a compile blocker makes that
unavoidable. If so, stop and report first.

------------------------------------------------------------------------

# 1. Phase 8 objective

Build the operational layer that helps Vendl sellers turn orders into
prepared, packed and fulfilled orders efficiently.

Phase 8 should connect the commerce foundation already built:

Products\
→ Menus / Drops\
→ Orders\
→ Fulfilment\
→ Production\
→ Packing\
→ Handover / Collection / Delivery

The primary questions Phase 8 should answer are:

-   What orders do I need to prepare?
-   What needs to be packed?
-   Which customer gets which items?
-   Which orders are ready?
-   Which orders have been collected or delivered?
-   What labels do I need?
-   What special instructions apply?
-   What do I need to take to a market/event?
-   Can I accept a custom order without handling it through DMs and
    spreadsheets?

This phase is **advanced operations**, not another storefront rebuild.

------------------------------------------------------------------------

# 2. Core product principle

Do not build warehouse-management software.

Vendl serves small independent sellers.

Typical operational environments include:

-   home bakery kitchen
-   commercial kitchen
-   farm shed
-   packing bench
-   roadside stall
-   farmers market
-   flower shed
-   home-based maker
-   small pickup location

The UI should be understandable by someone preparing Saturday's orders
on a phone, tablet or printed sheet.

Prefer:

**12 orders to pack**

over:

**12 fulfilment entities pending operational transition**

Prefer:

**Ready for pickup**

over:

**FULFILMENT_STAGE_READY**

Internal enums may use technical names. Seller-facing language should
remain simple.

------------------------------------------------------------------------

# 3. Audit the repository first

Before implementation, inspect the actual current repository.

Audit at minimum:

## Orders

-   Order
-   OrderItem
-   order statuses
-   payment statuses
-   fulfilment statuses
-   cancellation/refund semantics
-   seller order actions
-   customer notes
-   product/variant snapshots

## Fulfilment

-   OrderFulfilment
-   FulfilmentOption
-   PickupLocation
-   PickupWindow
-   DeliveryZone
-   `collectionAt`
-   take-now behaviour
-   Phase 5 compatibility/legacy bridges

## Production

-   ProductionPlan
-   production aggregation
-   production statuses
-   print view
-   recipe/product requirements
-   Menu/Drop production links

## Menus / Drops

-   Menu
-   MenuItem
-   scheduling
-   availability
-   order association
-   menu-level production views

## Products

-   Product
-   options/variants architecture
-   inventory
-   bundles
-   custom fields/options if any
-   product notes
-   current image/storage architecture

## Customers

-   Customer
-   CRM
-   customer notes/tags
-   Phase 7 activity/growth models

## Existing operational functionality

Search for:

-   packing
-   labels
-   print
-   collection
-   pickup
-   delivery
-   ready
-   fulfilled
-   handover
-   QR order lookup
-   barcode
-   market
-   event
-   custom order
-   forms
-   order notes
-   special requests

Reuse existing architecture where possible.

Do not build duplicate operational systems.

------------------------------------------------------------------------

# 4. Scope priority

Implement Phase 8 in this order unless the repository audit identifies a
safer sequence:

1.  Order preparation / fulfilment board
2.  Packing workflow
3.  Packing sheets
4.  Labels
5.  Customer pickup / handover workflow
6.  Delivery run preparation
7.  Custom orders / order forms
8.  Market & event selling mode
9.  Operational reporting / close-out

The central workflow is:

**Orders → Prepare → Pack → Ready → Hand over**

Everything else should reinforce that.

------------------------------------------------------------------------

# 5. Fulfilment board

Build a seller operational board based on real Orders and
OrderFulfilment records.

Likely route:

`/dashboard/orders/fulfilment`

or:

`/dashboard/fulfilment/orders`

Choose the route that best fits the existing navigation.

Do not create a disconnected order database.

The board must operate on existing orders.

------------------------------------------------------------------------

# 6. Fulfilment board views

Support practical views such as:

-   Today
-   Tomorrow
-   Upcoming
-   Ready
-   Completed

Allow grouping/filtering by:

-   fulfilment date
-   pickup location
-   pickup window
-   delivery
-   Menu / Drop
-   order status
-   preparation status

A seller preparing a Saturday bakery drop should be able to open one
screen and see all relevant orders.

------------------------------------------------------------------------

# 7. Operational order status

Audit current order and fulfilment statuses before adding anything.

Do not overload payment status.

If a separate operational preparation state is required, use a small
explicit state machine.

Potential seller-facing states:

-   To prepare
-   Preparing
-   Packed
-   Ready
-   Collected
-   Delivered

Internal representation may differ.

Do not add redundant states where current OrderFulfilment already
represents them.

Define allowed transitions.

Avoid impossible state combinations.

------------------------------------------------------------------------

# 8. Bulk actions

The operational board should support safe bulk actions.

Examples:

-   Mark selected as preparing
-   Mark selected as packed
-   Mark selected as ready
-   Mark selected as collected
-   Mark selected as delivered
-   Print selected orders
-   Print selected labels

Bulk actions must verify seller ownership for every selected record.

Do not permit cross-tenant IDs to be submitted in bulk.

------------------------------------------------------------------------

# 9. Order preparation detail

An operational order card/detail should show what the seller actually
needs while packing:

-   customer name
-   order number
-   products
-   quantities
-   options/variants
-   fulfilment method
-   pickup location/window
-   delivery details where relevant
-   customer order notes
-   seller notes
-   payment state
-   special instructions
-   current operational status

Avoid showing unnecessary accounting/admin fields in the packing view.

------------------------------------------------------------------------

# 10. Product totals vs customer orders

Phase 6 answers:

**How many of each product do I need to make?**

Phase 8 should answer:

**Which products go into each customer's order?**

Both views should link to one another.

Example:

Production:

-   42 cinnamon buns
-   26 sourdough loaves

Packing:

Jane: - 6 cinnamon buns - 1 sourdough

Tom: - 12 cinnamon buns

Sarah: - 2 sourdough

Do not duplicate production calculations.

------------------------------------------------------------------------

# 11. Packing workflow

Create a practical packing workflow.

A seller should be able to:

1.  Open today's fulfilment.
2.  Select an order.
3.  See its items.
4.  Check items off while packing.
5.  Mark the order packed.
6.  Mark it ready.
7.  Later mark collected/delivered.

Determine whether item-level packing state needs persistence.

If persistent item checks are useful, create the smallest safe model.

Do not modify OrderItem quantities merely because an item was checked as
packed.

------------------------------------------------------------------------

# 12. Packing progress

Where useful display:

`3 / 5 items packed`

and overall batch progress:

`18 / 27 orders packed`

Progress must reflect operational packing state, not payment state.

Do not count cancelled orders.

------------------------------------------------------------------------

# 13. Packing sheets

Build print-friendly packing sheets.

Support at least two useful modes.

## By customer

Example:

### Jane Smith --- Order #1048

-   2 × Sourdough
-   1 × Cinnamon Box of 6
-   1 × Focaccia

Pickup: Saturday 9:00--10:00

Notes: "No sesame"

## Batch order list

  Order   Customer   Items   Pickup   Status
  ------- ---------- ------- -------- --------

Use actual current data.

------------------------------------------------------------------------

# 14. Packing sheet grouping

Allow packing sheets to be generated for a useful context:

-   Menu / Drop
-   fulfilment date
-   pickup window
-   pickup location
-   delivery zone
-   selected orders

This should build on Phase 5 fulfilment and Phase 6 production contexts.

Do not create another scheduling system.

------------------------------------------------------------------------

# 15. Print UX

Print views should:

-   hide dashboard navigation
-   hide controls/buttons
-   use readable typography
-   fit A4 sensibly
-   avoid splitting an order unnecessarily across pages
-   include business/storefront name
-   include date
-   include fulfilment context
-   include order/customer identifiers
-   include notes where relevant

Use print-optimised HTML unless PDF generation provides a clear benefit.

Do not add complex PDF infrastructure merely to say Vendl supports PDF.

------------------------------------------------------------------------

# 16. Labels

Add practical printable labels.

Initial label use cases:

-   customer/order bag label
-   product label
-   pickup label

A customer/order label might contain:

Jane Smith\
Order #1048\
Saturday 9--10am

2 × Sourdough\
1 × Cinnamon Box

Optionally include a QR/order lookup token if useful and safe.

------------------------------------------------------------------------

# 17. Label formats

Do not attempt to support every commercial label printer.

Provide a small useful initial set.

For example:

-   A4 sheet labels
-   A4 cut labels
-   thermal-friendly 4×6 / equivalent
-   simple browser-print format

If the existing app has print size utilities, reuse them.

Make label dimensions configurable only where it provides real value.

------------------------------------------------------------------------

# 18. Label privacy

Labels may physically leave the seller's premises.

Do not print unnecessary personal information.

Avoid including:

-   email
-   phone
-   full home address

unless required for the specific delivery label.

Pickup labels generally need only:

-   customer name
-   order number
-   items
-   pickup context

Delivery labels may legitimately require delivery address.

------------------------------------------------------------------------

# 19. QR order lookup

Assess whether a label/order QR can improve handover.

Potential workflow:

1.  Seller scans QR on order label.
2.  Vendl opens authenticated seller order.
3.  Seller marks collected.

If implemented:

-   use opaque/signed token
-   do not encode sequential database IDs alone
-   seller authentication remains required for seller actions
-   cross-tenant access must remain impossible

Do not interfere with existing customer-facing stand QR functionality.

------------------------------------------------------------------------

# 20. Pickup handover mode

Build a fast pickup workflow suitable for a seller standing at a
collection table.

Potential route:

`/dashboard/fulfilment/pickup`

Features:

-   today's pickup groups
-   search customer/order
-   large tap targets
-   Ready / Collected actions
-   customer name
-   order summary
-   pickup window
-   payment state

The seller should not need to open full order administration for every
handover.

------------------------------------------------------------------------

# 21. Search at pickup

Support fast search by:

-   customer name
-   order number
-   email/phone only where appropriate

Prefer name/order number.

Search should be responsive and mobile friendly.

Do not expose another seller's customers through search.

------------------------------------------------------------------------

# 22. Pickup confirmation

When marking collected:

-   record timestamp
-   record authenticated seller action where architecture supports it
-   preserve existing financial/order data
-   do not accidentally mark unpaid orders paid unless that is an
    explicit separate action

Operational fulfilment and payment must remain distinct.

------------------------------------------------------------------------

# 23. Customer ready notification

Audit existing notification infrastructure.

When an order becomes Ready, seller may optionally send:

"Your order is ready for pickup."

Use existing email/push infrastructure where appropriate.

Do not automatically send marketing messages.

This is operational communication.

Prevent duplicate ready notifications from repeated status actions.

------------------------------------------------------------------------

# 24. Pickup reminder

If safe with the existing scheduled-job infrastructure, allow a pickup
reminder.

Example:

"Your order is ready for pickup tomorrow between 9am and 11am."

Do not build a new job platform solely for reminders.

If scheduling infrastructure is insufficient, document as deferred
rather than implementing fragile cron behaviour.

------------------------------------------------------------------------

# 25. Delivery preparation

For delivery orders, provide a delivery preparation view.

Group by:

-   delivery date
-   delivery zone
-   postcode/suburb
-   seller-defined sequence if implemented

Display:

-   customer
-   address
-   order
-   delivery notes
-   payment state
-   delivery status

------------------------------------------------------------------------

# 26. Delivery run sheet

Create a printable delivery run sheet.

At minimum:

-   customer
-   address
-   order number
-   items/summary
-   delivery notes
-   status checkbox

Do not build route optimisation in Phase 8.

A seller can choose their route manually.

Future route optimisation can be added later.

------------------------------------------------------------------------

# 27. Address privacy

Delivery addresses are sensitive operational data.

Ensure:

-   owner-scoped access
-   authenticated seller access
-   no public indexing
-   no leakage into campaign URLs
-   no exposure on pickup labels
-   no cross-tenant access

Use existing security conventions.

------------------------------------------------------------------------

# 28. Custom orders

Build a lightweight custom-order system for sellers who currently take
special requests through DMs, email or paper.

Examples:

-   birthday cake
-   custom cupcake box
-   flower arrangement
-   bulk egg order
-   grazing box
-   catering request
-   custom handmade item

This should not become a full quoting/CRM platform.

------------------------------------------------------------------------

# 29. Custom order request form

Allow seller to create a public request form.

Potential public route:

`/shop/{slug}/request`

and compatible subdomain route:

`https://{slug}.vendl.app/request`

when production subdomains are eventually enabled.

Use the existing tenant/storefront routing architecture.

------------------------------------------------------------------------

# 30. Custom form fields

Provide practical field types:

-   short text
-   long text
-   number
-   date
-   single select
-   multi-select
-   checkbox
-   file/image upload only if existing secure upload architecture
    supports it

Seller should be able to configure questions such as:

-   Required date
-   Serves how many?
-   Flavour
-   Colour/theme
-   Message on cake
-   Dietary notes
-   Budget
-   Pickup or delivery

Do not create a general Typeform competitor.

------------------------------------------------------------------------

# 31. Custom order request model

Potential concepts:

-   OrderRequestForm
-   OrderRequestField
-   OrderRequest
-   OrderRequestAnswer

Use actual repository conventions.

Each request should be owner-scoped and tied to the storefront.

Potential statuses:

NEW\
REVIEWING\
QUOTED\
ACCEPTED\
DECLINED\
CONVERTED

Keep the state machine small.

------------------------------------------------------------------------

# 32. Request → Order conversion

The important workflow is not just collecting forms.

Seller should be able to turn an accepted request into an actual Vendl
Order or payment request using existing commerce/payment architecture.

Potential workflow:

1.  Customer submits cake request.
2.  Seller reviews.
3.  Seller sets agreed items/price/date.
4.  Seller sends secure checkout/payment link.
5.  Customer pays.
6.  A real Order exists.
7.  Order enters fulfilment/production workflow.

Do not create a parallel fake order system.

------------------------------------------------------------------------

# 33. Quotes

If a quote object is necessary, keep it lightweight.

Potential:

-   line description
-   quantity
-   price
-   expiry
-   notes
-   deposit requirement where existing payment architecture supports it

Do not build accounting-grade quotations/invoices.

If deposit/payment-link support would require payment redesign, stop and
report before that portion.

------------------------------------------------------------------------

# 34. Custom order deposits

Audit existing preorder/deposit support.

Reuse it where safe.

Do not create a second deposit engine.

A custom cake may require:

Total: \$120

Deposit: \$40

Balance: \$80

Only implement this if the existing payment architecture safely supports
the same semantics.

Do not destabilise Stripe, subscriptions, QR checkout or PayPal WIP.

------------------------------------------------------------------------

# 35. Custom order production

Once a request becomes a real Order, it should naturally appear in:

-   production planning
-   fulfilment board
-   packing
-   customer CRM

If custom line items do not map to Products/Recipes, production should
still display them as manual/custom items.

Do not require every custom cake to become a permanent catalogue
Product.

------------------------------------------------------------------------

# 36. Dietary/allergen requests

Custom forms may allow customers to provide dietary/allergen notes.

Treat these as customer-provided notes.

Do NOT claim Vendl verifies:

-   allergen safety
-   gluten-free status
-   contamination controls
-   regulatory compliance

Phase 8 is not an allergen compliance engine.

Use careful UI language.

------------------------------------------------------------------------

# 37. Market & event selling mode

Build a practical event/market operational mode.

Examples:

-   farmers market
-   school market
-   local fair
-   pop-up
-   roadside event
-   horse show stall
-   weekend market

The goal is to let an existing Vendl seller create a temporary selling
context without rebuilding their catalogue.

------------------------------------------------------------------------

# 38. Event model

Potential model:

MarketEvent

Fields may include:

-   ownerId
-   name
-   date/start/end
-   location
-   products
-   allocated quantities
-   status
-   notes

Possible statuses:

DRAFT\
UPCOMING\
OPEN\
CLOSED

Do not confuse this with Menu/Drop.

Audit whether Menu or Stand already provides enough context before
adding a new model.

------------------------------------------------------------------------

# 39. Menu vs Event vs Stand

Preserve clear concepts.

## Product

What the seller sells.

## Menu / Drop

A curated/scheduled online sale.

## Stand

Self-serve physical selling point / QR context.

## Event

A temporary physical selling occasion.

Do not duplicate all Product data into Event.

An Event should select from the owner's catalogue.

------------------------------------------------------------------------

# 40. Event stock allocation

Allow a seller to plan what they are taking.

Example:

Saturday Farmers Market

-   Sourdough: 30
-   Cinnamon boxes: 20
-   Eggs: 15 dozen
-   Flowers: 12 bouquets

This is an allocation/planning quantity.

Do not automatically destroy global Product inventory merely because the
seller planned to take 30 units.

Define when inventory actually changes.

------------------------------------------------------------------------

# 41. Event selling

Audit existing QR/cart/payment architecture.

The ideal event workflow should reuse existing Vendl checkout rather
than build a second POS.

Potentially:

-   event-specific QR
-   seller-assisted quick sale
-   customer scan/pay
-   cash/local payment
-   existing supported online payments

Do not build card-present terminal integration in Phase 8.

Do not build Square POS.

------------------------------------------------------------------------

# 42. Quick sale mode

If safe, create a seller-facing quick-sale interface for markets.

Example:

Large product tiles:

Sourdough \$12\
Eggs \$7\
Flowers \$15

Seller taps quantities → selects payment method → records sale.

This can support cash/manual payment while keeping Orders and inventory
consistent.

Do not bypass the existing Order model.

Every completed quick sale should create a real Vendl Order.

------------------------------------------------------------------------

# 43. Anonymous/walk-up customers

Market sales may not have customer details.

Support anonymous/walk-up Orders where current Order architecture
permits.

Do not force the seller to create fake Customer records.

If customer gives email/phone voluntarily, link/create Customer using
existing CRM logic.

Do not assume marketing consent from a market purchase.

------------------------------------------------------------------------

# 44. Event close-out

After an Event, show a useful summary:

-   units sold
-   revenue
-   cash/manual sales
-   online payment sales
-   unsold allocated quantity where calculable
-   top products

Do not turn this into full accounting reconciliation.

------------------------------------------------------------------------

# 45. Inventory integration

Audit existing inventory semantics carefully.

Phase 8 operational actions should not double-decrement inventory.

Define inventory changes for:

-   online order
-   preorder
-   market quick sale
-   cancelled order
-   refunded order
-   event allocation

Reuse existing inventory services.

Do not implement raw ingredient inventory here.

------------------------------------------------------------------------

# 46. Product options / variants

Packing, labels, quick sale and custom orders must preserve existing
product option/variant snapshots.

Example:

Cupcakes\
Box of 6\
Chocolate\
Pink icing

The packing view must show those choices.

Do not collapse operational totals in a way that loses required variant
information.

------------------------------------------------------------------------

# 47. Order notes

Clarify different note types where useful:

-   customer checkout note
-   custom order request answers
-   seller internal note
-   production note
-   fulfilment note

Do not expose seller-private notes publicly or in customer emails.

Avoid creating five separate note systems unless existing architecture
justifies it.

------------------------------------------------------------------------

# 48. Seller operational notes

Allow lightweight internal notes on orders/fulfilment where useful.

Example:

"Keep in fridge."

"Customer's mum collecting."

"Add birthday topper."

Internal notes must be clearly marked private.

------------------------------------------------------------------------

# 49. Operational dashboard

Consider a compact Operations home.

Potential route:

`/dashboard/operate`

or integrate into existing dashboard.

Useful cards:

-   Orders to prepare today
-   Orders packed
-   Ready for pickup
-   Deliveries today
-   Upcoming market
-   New custom requests

Do not add a page simply to duplicate existing dashboard metrics.

Only implement if it improves navigation.

------------------------------------------------------------------------

# 50. Navigation

Audit the current sidebar after Phases 5--7.

Do not keep adding top-level items indefinitely.

A possible structure:

## Sell

Products\
Menus\
Orders

## Customers

Customers\
Growth

## Operate

Fulfilment\
Production\
Custom Orders\
Markets & Events

Recipes and Ingredients may remain nested/linked from Production if the
navigation has become crowded.

Make a recommendation based on actual current nav.

Do not blindly follow this example.

------------------------------------------------------------------------

# 51. Mobile operational mode

Phase 8 must be strongly mobile-first.

A seller may use it:

-   with flour on their hands
-   at a pickup table
-   in a farm shed
-   at a market stall
-   while making deliveries

Requirements:

-   large tap targets
-   minimal typing
-   clear status
-   fast search
-   sticky primary actions where appropriate
-   no critical wide tables
-   readable order/item lists
-   responsive print actions

Test common phone widths.

------------------------------------------------------------------------

# 52. Tablet UX

Packing and market workflows may be especially useful on tablets.

Ensure operational screens work well around tablet widths.

Do not optimise exclusively for desktop and phone.

------------------------------------------------------------------------

# 53. Offline behaviour

Do NOT attempt a full offline-first architecture in Phase 8 unless the
current app already supports it safely.

Markets can have poor connectivity, but offline order/payment syncing is
a substantial architectural problem.

Document offline market mode as a future enhancement if necessary.

Do not fake offline reliability.

------------------------------------------------------------------------

# 54. Capacitor

Audit existing Capacitor owner apps.

New operational routes should not break mobile app navigation.

Test:

-   fulfilment board
-   pickup mode
-   custom orders
-   market mode

within the current Capacitor shell where feasible.

Do not build separate native implementations.

------------------------------------------------------------------------

# 55. Notifications

Operational notifications may include:

Seller:

-   new custom request
-   new order
-   order requiring preparation
-   pickup/delivery due

Customer:

-   order ready
-   pickup reminder
-   custom quote/payment request

Reuse existing notification infrastructure.

Avoid duplicate notification systems.

------------------------------------------------------------------------

# 56. Customer communication boundaries

Phase 8 communications are primarily operational.

Do not accidentally route them through Phase 7 marketing consent rules
if they are legitimate order/service communications.

At the same time, do not disguise promotional content as operational
communication.

Keep the distinction explicit in code and documentation.

------------------------------------------------------------------------

# 57. Custom request spam protection

Public custom-order forms need abuse protection.

Use existing rate-limiting/bot-protection patterns.

Consider:

-   rate limits
-   hidden honeypot
-   existing CAPTCHA only if already available/necessary
-   upload restrictions
-   input limits

Do not expose an unrestricted public file upload endpoint.

------------------------------------------------------------------------

# 58. Upload security

If custom request forms support image uploads:

-   use existing secure blob/storage system
-   restrict file type
-   restrict size
-   generate safe filenames/keys
-   owner-scope access where appropriate
-   do not execute uploaded content
-   avoid public directory traversal/path assumptions

If this cannot be done cleanly with current infrastructure, defer file
uploads.

------------------------------------------------------------------------

# 59. Tenancy

Every Phase 8 entity/action must be owner-scoped.

Explicitly verify:

-   fulfilment board queries
-   packing state
-   labels
-   custom forms
-   custom requests
-   quotes
-   events
-   quick sales
-   bulk actions

Never trust client-supplied IDs.

Add cross-tenant tests.

------------------------------------------------------------------------

# 60. Idempotency

Operational actions can be repeated by impatient users or flaky mobile
networks.

Ensure important actions are idempotent where appropriate.

Examples:

-   mark ready
-   mark collected
-   send ready notification
-   convert request to order
-   record quick sale
-   decrement inventory

Repeated requests must not create duplicate Orders or double inventory
deductions.

------------------------------------------------------------------------

# 61. Audit trail

Do not build enterprise audit logging, but preserve useful timestamps.

Examples:

-   packedAt
-   readyAt
-   collectedAt
-   deliveredAt
-   request convertedAt
-   event openedAt/closedAt

If an existing activity/event model exists, reuse it.

------------------------------------------------------------------------

# 62. Performance

Operational screens may load many Orders and OrderItems.

Avoid N+1 queries.

Use appropriate indexes for:

-   owner
-   fulfilment date
-   operational status
-   event
-   request status

Do not introduce caching infrastructure unless needed.

------------------------------------------------------------------------

# 63. Existing seller compatibility

Existing sellers must continue working without configuring Phase 8.

After Phase 8:

-   existing QR codes work
-   `/s/*` works
-   storefront works
-   Menus work
-   orders work
-   production works
-   fulfilment works
-   Stripe works
-   cash/local works
-   subscriptions work
-   existing inventory works

Advanced Operations is additive.

------------------------------------------------------------------------

# 64. Farm Stand compatibility

Farm Stand remains first-class.

A self-serve seller should not be forced into packing workflows.

However Phase 8 can help where relevant:

-   preordered eggs for collection
-   produce boxes
-   reserved firewood
-   event selling
-   pickup handover

Keep pure QR take-now selling simple.

------------------------------------------------------------------------

# 65. Food business compatibility

FOOD_BUSINESS and BOTH should gain the most from:

-   fulfilment board
-   packing
-   labels
-   pickup mode
-   custom orders
-   market selling

Example end-to-end bakery workflow:

1.  Publish Saturday Menu.
2.  Customers order.
3.  Phase 6 calculates production.
4.  Baker makes products.
5.  Phase 8 shows customer packing list.
6.  Baker packs each order.
7.  Labels are printed.
8.  Orders marked Ready.
9.  Customers collect.
10. Seller taps Collected.
11. Phase 7 CRM/retention now has the completed customer/order history.

That is the operational loop Phase 8 should complete.

------------------------------------------------------------------------

# 66. Free vs Pro

Do not change Vendl's existing pricing/economics.

Audit current entitlement architecture before gating features.

Recommend sensible gating but do not arbitrarily lock core order
fulfilment behind Pro.

A possible future direction:

Free: - basic fulfilment board - basic packing - basic pickup workflow

Pro: - advanced labels - custom request forms - market/event tools -
advanced operational reports

But this is only a recommendation.

Do not alter production pricing or transaction fees.

------------------------------------------------------------------------

# 67. Explicitly deferred

Do NOT build in Phase 8 unless required for safe integration:

-   route optimisation
-   live driver tracking
-   courier integrations
-   shipping carrier labels
-   Australia Post integration
-   Sendle integration
-   card-present terminals
-   Square POS
-   full offline POS
-   kitchen display hardware
-   staff rostering
-   employee permissions overhaul
-   time tracking
-   supplier purchasing
-   raw ingredient inventory
-   accounting
-   Xero
-   MYOB
-   nutrition
-   allergen compliance engine
-   marketplace/discovery app
-   AI production planning
-   custom domains
-   Product.standId cleanup

Keep Phase 8 focused.

------------------------------------------------------------------------

# 68. Tests --- fulfilment operations

Add tests for:

-   qualifying orders appear
-   cancelled orders excluded
-   correct fulfilment grouping
-   allowed status transitions
-   invalid transitions rejected
-   bulk actions
-   packed progress
-   ready timestamp
-   collected timestamp
-   delivered timestamp
-   cross-tenant rejection
-   repeated/idempotent actions

------------------------------------------------------------------------

# 69. Tests --- labels

Test:

-   correct order/customer
-   correct items/options
-   pickup vs delivery privacy
-   seller ownership
-   safe QR token if implemented
-   print route authentication

Do not require visual pixel-perfect automated tests unless the project
already supports them.

------------------------------------------------------------------------

# 70. Tests --- custom orders

Test:

-   public form submission
-   required fields
-   invalid input
-   spam/rate controls where testable
-   owner routing
-   request status
-   cross-tenant access
-   conversion to Order
-   duplicate conversion prevention
-   payment link/deposit behaviour if implemented

------------------------------------------------------------------------

# 71. Tests --- markets/events

If implemented, test:

-   event creation
-   catalogue selection
-   allocation
-   quick sale
-   anonymous customer
-   linked customer
-   inventory behaviour
-   event close-out
-   cross-tenant access
-   duplicate sale prevention

------------------------------------------------------------------------

# 72. Regression testing

Explicitly test:

-   signup
-   onboarding
-   FARM_STAND
-   FOOD_BUSINESS
-   BOTH
-   Products
-   Categories
-   Menus/Drops
-   Menu cart
-   Orders
-   Customers
-   Growth
-   Campaigns
-   Coupons
-   Loyalty if implemented
-   Reviews
-   Gift cards if implemented
-   Fulfilment
-   Pickup
-   Delivery
-   Preorders
-   Subscriptions
-   Ingredients
-   Recipes
-   Production
-   Storefront editor
-   `/shop/*`
-   `*.localhost`
-   `/s/*`
-   QR checkout
-   Stripe
-   cash/local payment
-   Free transaction fees
-   Pro fee behaviour
-   inventory
-   notifications
-   mobile dashboard
-   Capacitor

PayPal WIP remains untouched.

------------------------------------------------------------------------

# 73. Database migration

All schema changes must be additive.

Do not destructively alter existing:

-   Orders
-   OrderItems
-   Customers
-   Products
-   Menus
-   Fulfilment
-   Production
-   Growth
-   Storefront
-   Stand
-   payment
-   subscription

models/data.

Backfills must be idempotent where applicable.

Do not change historical order/payment totals.

------------------------------------------------------------------------

# 74. Build requirements

Before Phase 8 is considered complete run:

`npx prisma generate`

`npx tsc --noEmit`

`npm run build`

Run existing relevant suites, including current:

`npm run test:production`

`npm run test:tenancy`

`npm run test:grow`

and all new Phase 8 tests.

The full build was green at the completion of Phase 7. A Phase 8 failure
should therefore be investigated as a Phase 8 regression unless clearly
caused by an unrelated local environment change.

Do not hide failures.

------------------------------------------------------------------------

# 75. Documentation

Create/update:

`VENDL-PHASE-8-ADVANCED-OPERATIONS.md`

Document:

-   architecture implemented
-   operational status model
-   packing architecture
-   label architecture
-   pickup/handover workflow
-   delivery workflow
-   custom order architecture
-   request → order conversion
-   market/event architecture
-   inventory implications
-   notification behaviour
-   tenancy/security
-   migrations
-   compatibility
-   deferred functionality

------------------------------------------------------------------------

# 76. Phase 8 completion criteria

Phase 8 should not be considered complete merely because new
models/routes exist.

At minimum the core operational workflow should work end-to-end:

1.  Customer places a real Vendl Order.
2.  Order appears in the correct fulfilment context.
3.  Seller sees what must be prepared.
4.  Phase 6 production totals remain available.
5.  Seller opens customer packing view.
6.  Seller packs the Order.
7.  Seller can print an appropriate label/packing sheet.
8.  Seller marks Order Ready.
9.  Customer can receive an appropriate ready notification where
    enabled.
10. Seller finds customer quickly at pickup.
11. Seller marks Order Collected.

For delivery:

12. Seller can view/print the day's delivery run.
13. Seller marks delivered.

For custom orders, if implemented:

14. Customer submits a request.
15. Seller reviews it.
16. Seller converts accepted request into a real Vendl commerce/order
    flow.
17. It then participates in normal production/fulfilment.

For markets/events, if implemented:

18. Seller creates an Event.
19. Selects catalogue/products.
20. Records real sales through existing Order architecture.
21. Inventory/order reporting remains consistent.
22. Event can be closed with a useful summary.

------------------------------------------------------------------------

# 77. Implementation approach

Phase 8 is authorised for implementation.

However:

**FIRST audit the current repository.**

Then provide a concise implementation plan based on what actually
exists.

Proceed additively if safe.

STOP and report before implementing any portion requiring:

-   payment architecture redesign
-   destructive migration
-   duplicate Order architecture
-   inventory rewrite
-   breaking Phase 5 fulfilment
-   breaking Phase 6 production
-   breaking Phase 7 growth/CRM
-   card-present payment infrastructure
-   full offline sync
-   significant new external infrastructure

Do not rewrite stable foundations simply because a cleaner theoretical
model is possible.

------------------------------------------------------------------------

# 78. Completion report

When Phase 8 is complete, report:

1.  Files changed
2.  Schema changes
3.  Migration name/status
4.  Fulfilment board
5.  Operational status architecture
6.  Packing workflow
7.  Packing sheets
8.  Labels
9.  Pickup/handover mode
10. Ready/reminder notifications
11. Delivery workflow/run sheets
12. Custom order forms
13. Request → Order conversion
14. Deposit/payment behaviour, if implemented
15. Market/Event functionality
16. Quick-sale functionality
17. Inventory behaviour
18. Mobile/tablet behaviour
19. Capacitor compatibility
20. Security/tenancy safeguards
21. Tests added/results
22. Regression results
23. `tsc` result
24. full build result
25. Deferred functionality
26. Architecture deviations and why
27. Git status

**Do NOT commit.**

**Do NOT push.**

**Do NOT merge.**

**Do NOT deploy.**

**Do NOT begin Phase 9.**

Stop after the Phase 8 completion report.
