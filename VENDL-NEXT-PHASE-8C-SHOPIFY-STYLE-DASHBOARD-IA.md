# Vendl Next --- Phase 8C: Dashboard IA & Shopify-Style UX Consolidation

## Status

Phase 8C implementation brief.

Phase 8 is complete locally. Phase 8B Operations Calendar is the
immediately preceding planned/implemented phase depending on current
repository state. Phase 9 has not started.

This phase is a **dashboard information architecture and UX
consolidation**, not a visual clone of Shopify and not a rewrite of
Vendl.

**Do NOT commit, push, merge, deploy, or release this work.**

**Do NOT begin Phase 9.**

PayPal WIP remains out of scope and must remain untouched.

------------------------------------------------------------------------

# 1. Objective

Vendl has grown from a relatively focused farm-stand application into a
broader commerce and operations platform with:

-   Products
-   Orders
-   Customers / CRM
-   Menus / Drops
-   Fulfilment
-   Production
-   Recipes
-   Ingredients
-   Growth / campaigns
-   Loyalty / reviews / gift cards
-   Custom Orders
-   Markets / Events
-   Website / storefront
-   Calendar
-   Farm Stand / QR workflows

The dashboard now needs a clearer product-wide information architecture.

The goal of Phase 8C is to make Vendl feel like **one coherent
application rather than a collection of feature pages**.

Borrow useful interaction and information-architecture principles from
Shopify:

-   small number of major sidebar destinations
-   object-first navigation
-   list → object → contextual workflow
-   secondary navigation inside major areas
-   consistent page headers
-   consistent statuses
-   contextual primary actions
-   cards for secondary information
-   progressive disclosure
-   fewer top-level navigation items

Do **not** copy Shopify branding, visual styling, icons, source code,
exact layouts or proprietary UI.

Use Vendl's own design system and product identity.

------------------------------------------------------------------------

# 2. Core principle

The sidebar should represent **major jobs and major business objects**,
not every feature Vendl supports.

Secondary functionality should live inside the relevant major area.

Example:

Do not require six separate top-level destinations for:

-   Fulfilment
-   Production
-   Packing
-   Pickup
-   Delivery
-   Collections

when these are primarily ways of operating on Orders.

Similarly, Recipes and Ingredients are supporting catalogue/production
functionality and do not necessarily deserve equal sidebar weight to
Products.

The desired mental model is:

**Major object → object detail → contextual workflow**

------------------------------------------------------------------------

# 3. Audit the repository first

Before changing navigation or layouts, inspect the actual current
repository after Phases 1--8B.

Audit:

-   AppShell
-   desktop sidebar
-   mobile bottom navigation
-   mobile More sheet
-   TopBar
-   breadcrumbs
-   dashboard page headers
-   tabs/subnavigation components
-   cards
-   badges/status components
-   action menus
-   dialogs/sheets
-   empty states
-   list/table components
-   responsive patterns
-   all `/dashboard/*` routes
-   all nav links
-   redirects
-   deep links from email/notifications
-   links from Calendar
-   links from Menus
-   links from Production
-   links from Growth
-   links from Operations
-   Capacitor navigation
-   setup/getting-started links
-   seller businessMode logic
-   Free/Pro entitlement UI

Produce a route inventory before restructuring.

Do not delete routes simply because they disappear from the primary
sidebar.

------------------------------------------------------------------------

# 4. Preserve route compatibility

This phase is primarily navigation/layout consolidation.

Existing deep links must continue to work.

Examples include current routes for:

-   fulfilment
-   production
-   recipes
-   ingredients
-   forms/custom orders
-   events
-   growth
-   website
-   calendar
-   orders
-   customers

A page can move in the navigation hierarchy without changing its URL.

Prefer keeping stable URLs unless there is a compelling architectural
reason to change one.

If a route does change:

-   add a safe redirect
-   preserve query parameters where appropriate
-   update internal links
-   test old bookmarks/deep links

Do not create unnecessary migration risk.

------------------------------------------------------------------------

# 5. Proposed primary navigation

After auditing the current app, move toward a primary navigation
approximately like:

-   Home
-   Orders
-   Products
-   Customers
-   Menus
-   Calendar
-   Marketing
-   Website
-   Settings

This is a **direction**, not a rigid instruction.

The repository audit may justify slight changes.

The important principle is that the sidebar should be materially simpler
than a flat list of every feature.

------------------------------------------------------------------------

# 6. Farm Stand

Farm Stand remains first-class.

Do not accidentally bury Vendl's original self-serve selling workflow.

Determine the cleanest placement based on current product architecture
and `businessMode`.

Possible approaches:

### FARM_STAND sellers

Show **Farm Stand** as a major primary destination.

### FOOD_BUSINESS sellers

Farm Stand can be less prominent unless they use it.

### BOTH sellers

Show Farm Stand prominently.

Do not remove `/s/*`, QR management, stand management or existing Farm
Stand functionality.

Business mode should influence navigation emphasis, not destroy access.

------------------------------------------------------------------------

# 7. Home

Home should remain a business overview, not become a dumping ground.

Potential content:

-   sales/order summary
-   today's operational work
-   coming up from Calendar
-   setup/getting-started where incomplete
-   recent Orders
-   useful alerts
-   contextual next action

Do not reproduce every dashboard feature on Home.

------------------------------------------------------------------------

# 8. Orders as an operational hub

Orders should become the primary place for order operations.

Potential secondary navigation:

**All \| Prepare \| Pack \| Pickup \| Delivery**

Exact labels should follow the implemented Phase 5/8 architecture.

Possible mappings:

-   All → existing Orders
-   Prepare → operational fulfilment board / to prepare
-   Pack → packing workflow
-   Pickup → pickup/handover
-   Delivery → delivery run

Production is related but may remain a distinct operational context
because it aggregates products/recipes rather than individual Orders.

Do not force Production into Orders if that makes the mental model
worse.

------------------------------------------------------------------------

# 9. Orders list

Standardise the Orders list.

The page should make common information immediately scannable:

-   order number
-   customer
-   date
-   amount
-   payment status
-   fulfilment method
-   operational status
-   Menu/source where useful

Support existing search/filter behaviour.

Primary action should be appropriate and minimal.

Avoid filling every row with many action buttons.

Use row click/object navigation and contextual menus.

------------------------------------------------------------------------

# 10. Order detail pattern

Standardise Order detail as a flagship object page.

Recommended structure:

## Header

-   Order number
-   status
-   contextual primary action
-   secondary actions / More

## Main content

-   ordered items
-   fulfilment
-   packing/preparation
-   customer/order notes
-   timeline/activity where useful

## Secondary information

Cards/sections for:

-   Customer
-   Payment
-   Fulfilment
-   Menu/source
-   campaign attribution
-   tags/metadata where relevant

Potential primary actions:

-   Mark preparing
-   Mark packed
-   Mark ready
-   Print

Actions should change based on current state.

Do not display irrelevant actions.

------------------------------------------------------------------------

# 11. Products as catalogue hub

Products should become the major catalogue destination.

Potential secondary navigation:

**Products \| Recipes \| Ingredients**

If Categories have a substantial management UI, consider:

**Products \| Categories \| Recipes \| Ingredients**

Do not create excessive tabs if Categories are better handled as a
Product filter/secondary screen.

Existing URLs may remain unchanged.

------------------------------------------------------------------------

# 12. Product detail pattern

Standardise Product detail.

Potential structure:

## Header

-   Product name
-   active/status
-   Preview/View
-   Save or contextual actions
-   More

## Main

-   title/description
-   images
-   pricing
-   inventory
-   options/variants
-   sales channels
-   fulfilment eligibility

## Supporting sections

-   category
-   recipe / production
-   packaging cost
-   availability
-   SEO/storefront
-   related Menu usage

Do not turn one page into an overwhelming endless form.

Use sections/cards/tabs progressively.

------------------------------------------------------------------------

# 13. Recipes and Ingredients

Recipes and Ingredients remain fully functional.

They become contextual catalogue/production tools rather than competing
visually with Products in the primary sidebar.

From a Product:

**Production / Recipe**

should link naturally to Recipe.

From Recipe:

ingredients and linked Products should be easy to navigate.

From Production:

Recipe/Ingredient details should be accessible when needed.

------------------------------------------------------------------------

# 14. Customers as CRM hub

Customers should be a major destination.

Potential secondary navigation:

**Customers \| Segments**

Additional Growth features should not make the Customer area confusing.

Customer detail should include:

-   identity/contact
-   order history
-   total spend
-   order count
-   last order
-   tags
-   notes
-   loyalty
-   reviews
-   campaign activity
-   subscriptions
-   relevant restock interest

Use Phase 7 data.

------------------------------------------------------------------------

# 15. Customer detail pattern

Use the same object-detail language as Order/Product/Menu.

## Header

Customer name

Potential actions:

-   Add note
-   Send message / campaign action where appropriate
-   More

## Main

-   order history
-   activity
-   relevant customer commerce information

## Secondary cards

-   contact
-   marketing consent
-   tags
-   loyalty
-   metrics

Avoid creating a CRM dashboard inside every Customer page.

------------------------------------------------------------------------

# 16. Menus as a major destination

Menus / Drops deserve a major destination because they are central to
the food-business workflow.

Potential secondary navigation:

**Menus \| Upcoming \| Past**

Only add tabs that correspond to real useful states.

A Menu object should act as the control centre for that selling cycle.

------------------------------------------------------------------------

# 17. Menu detail as operational control centre

A Menu detail page should bring related workflows together.

Potential header:

**Saturday Bake**

Status: Open

Actions:

-   View storefront
-   Close orders / Publish depending state
-   More

Contextual sections/actions:

-   Products
-   Orders
-   Schedule
-   Fulfilment
-   Production
-   Pack orders
-   Tell customers
-   View in Calendar

This is an important Shopify-like principle:

Do not force the seller to mentally jump between unrelated sidebar
modules to operate one Menu.

The Menu should link directly into its related workflows.

------------------------------------------------------------------------

# 18. Calendar

Calendar remains a major cross-system destination.

It should provide the visual schedule across:

-   Menus
-   Production
-   Packing
-   Pickup
-   Delivery
-   Subscriptions
-   Custom Orders
-   Markets/Events

Clicking Calendar events should land in the corresponding
object/context.

Do not duplicate source editing inside Calendar.

------------------------------------------------------------------------

# 19. Marketing

Rename/position the Phase 7 Growth area using seller-friendly
terminology.

Strong candidate:

**Marketing**

Potential secondary navigation:

-   Campaigns
-   Discounts
-   Loyalty
-   Reviews
-   Gift Cards

Customer Segments may live under Customers rather than Marketing.

Restock/customer re-engagement can be surfaced contextually.

Avoid both **Growth** and **Marketing** as separate major sidebar
destinations unless there is a compelling reason.

------------------------------------------------------------------------

# 20. Marketing overview

Marketing home should be action-oriented.

Potential:

-   recent campaign performance
-   customers to re-engage
-   current promotions
-   reviews awaiting approval
-   loyalty summary
-   restock demand

Primary actions:

-   Create campaign
-   Create discount

Do not build vanity analytics.

------------------------------------------------------------------------

# 21. Website

Website remains a major destination.

It should encompass:

-   storefront editor
-   pages
-   theme
-   settings
-   domains

Potential secondary navigation:

**Editor \| Pages \| Domains**

or use the existing Phase 4B editor tabs if already strong.

Do not create duplicate navigation layers.

The storefront editor should remain the central Website experience.

------------------------------------------------------------------------

# 22. Settings

Consolidate account/business configuration.

Potential Settings sections:

-   Business
-   Payments
-   Fulfilment configuration
-   Notifications
-   Plan / Billing
-   Account
-   Domains only if Website does not own them

Do not move operational fulfilment workflows into Settings.

Distinguish:

**Configure fulfilment** → Settings/fulfilment configuration

from:

**Fulfil today's orders** → Orders/operations

------------------------------------------------------------------------

# 23. Markets & Events

Do not automatically keep Markets & Events as a primary sidebar item.

Assess actual usage.

Potential homes:

-   Calendar
-   Orders/Operate contextual entry
-   secondary link from Menus
-   a `More`/secondary business tool area
-   primary nav only for sellers actively using it

The feature remains fully accessible.

The goal is to reduce permanent sidebar noise.

------------------------------------------------------------------------

# 24. Custom Orders

Likewise, Custom Orders need not automatically remain a permanent
top-level sidebar item.

Potential integration:

-   Orders secondary navigation: **Custom**
-   or a contextual entry in Orders
-   or a dedicated filtered list accessible from Home/Calendar

Public forms remain manageable.

Do not hide pending custom requests from the seller.

Use badges/alerts where appropriate.

------------------------------------------------------------------------

# 25. Production

Production is important enough to receive careful treatment.

Potential options:

### Option A

Orders secondary navigation:

All \| Prepare \| Production \| Pack \| Pickup \| Delivery

### Option B

Products/Catalogue contextual link plus Calendar and Menu links.

### Option C

A secondary Operate destination.

Choose based on actual workflows.

Do not force a theoretically tidy hierarchy that makes Production harder
to reach.

For FOOD_BUSINESS sellers, Production should remain reachable in one or
two clicks.

------------------------------------------------------------------------

# 26. Shopify-like object page system

Create/reuse a consistent page structure for major objects.

Potential reusable primitives:

-   `ObjectPageHeader`
-   `StatusBadge`
-   `PrimaryAction`
-   `MoreActionsMenu`
-   `DetailCard`
-   `ObjectSubnav`
-   `ObjectMetaCard`
-   `ActivityTimeline`

Use actual repository component conventions.

Do not create abstraction for abstraction's sake.

The goal is visual and interaction consistency.

------------------------------------------------------------------------

# 27. Page header standard

Major pages should have predictable headers.

Typical list page:

**Orders**

\[Search/filter\] \[Primary action if needed\]

Typical object page:

← Orders

**Order #1048** \[Paid\] \[Ready\]

\[Primary action\] \[More\]

Avoid pages where buttons/statuses appear in random locations.

------------------------------------------------------------------------

# 28. Primary actions

Each page should have one obvious primary action where possible.

Examples:

Products: **Add product**

Menus: **Create menu**

Customers: possibly no primary creation action if Customers are
commerce-derived

Marketing: **Create campaign**

Website: **Edit website** / Save depending context

Order detail: state-dependent operational action

Avoid three equally prominent buttons.

Put secondary/destructive actions under **More** where appropriate.

------------------------------------------------------------------------

# 29. Status language

Audit all status labels across:

-   Orders
-   Payments
-   Fulfilment
-   Production
-   Menus
-   Campaigns
-   Events
-   Custom Orders

Use consistent seller-facing language.

Internal enums may remain unchanged.

Examples:

PAID → Paid\
IN_PROGRESS → In progress\
READY → Ready\
COLLECTED → Collected

Avoid exposing database enum formatting.

------------------------------------------------------------------------

# 30. Badges

Standardise badge visual treatment.

Badges should communicate:

-   status
-   channel
-   payment
-   fulfilment

Do not use many unrelated badge styles.

Do not rely solely on colour.

------------------------------------------------------------------------

# 31. Cards

Use cards for secondary/contextual information, not every paragraph.

Good card candidates:

-   Customer
-   Payment
-   Fulfilment
-   Loyalty
-   Menu schedule
-   Production summary

Avoid excessive card nesting.

------------------------------------------------------------------------

# 32. Tabs / secondary navigation

Use secondary navigation when multiple pages represent one major job.

Examples:

Orders: All \| Prepare \| Pack \| Pickup \| Delivery

Products: Products \| Recipes \| Ingredients

Customers: Customers \| Segments

Marketing: Campaigns \| Discounts \| Loyalty \| Reviews \| Gift Cards

Do not use tabs merely to hide arbitrary content.

Tabs/subnav should map to stable concepts.

------------------------------------------------------------------------

# 33. Breadcrumbs / back navigation

Object pages need predictable navigation back to their list/context.

Examples:

Orders / #1048

Menus / Saturday Bake

Customers / Jane Smith

Do not require browser Back as the only way out.

On mobile, use a clear back affordance.

------------------------------------------------------------------------

# 34. Search

Search should live primarily in relevant list contexts.

Orders search: - order - customer

Products search: - product

Customers search: - customer/contact

Do not build a global command palette in Phase 8C unless one already
exists.

A future global search can be added later.

------------------------------------------------------------------------

# 35. Filters

Standardise filter UX across lists.

Use reusable patterns for:

-   status
-   date
-   channel
-   fulfilment
-   tags

Avoid every list inventing a different filter interaction.

Preserve query-string state where practical.

------------------------------------------------------------------------

# 36. Saved views

Do not build a Shopify-scale saved-view system in this phase unless an
existing foundation makes it trivial.

Stable default views such as:

-   All
-   Open
-   Ready
-   Upcoming

are sufficient.

------------------------------------------------------------------------

# 37. Contextual links

Use cross-object links aggressively where they reduce navigation.

Examples:

Order → Customer\
Order → Menu\
Menu → Production\
Menu → Campaign\
Menu → Calendar\
Product → Recipe\
Customer → Orders\
Calendar → source object\
Production → Pack Orders

This is central to making Vendl feel interconnected.

------------------------------------------------------------------------

# 38. Remove redundant dashboard pages from primary navigation

A route being removed from the sidebar does **not** mean the feature is
removed.

Examples may include:

-   Recipes
-   Ingredients
-   Packing
-   Pickup
-   Delivery
-   Custom Orders
-   Events

They should remain reachable through secondary navigation/context.

Do not delete working functionality.

------------------------------------------------------------------------

# 39. Business-mode-aware navigation

Use `businessMode` to reduce irrelevant clutter.

## FARM_STAND

Likely emphasis:

-   Home
-   Orders
-   Products
-   Customers
-   Farm Stand
-   Calendar
-   Marketing
-   Website
-   Settings

## FOOD_BUSINESS

Likely emphasis:

-   Home
-   Orders
-   Products
-   Customers
-   Menus
-   Calendar
-   Marketing
-   Website
-   Settings

## BOTH

Show both Menus and Farm Stand where useful.

This is illustrative.

Audit actual seller-mode implementation before finalising.

Do not permanently make features inaccessible because of businessMode.

------------------------------------------------------------------------

# 40. Mobile primary navigation

Audit the existing mobile bottom tabs.

Do not try to mirror the full desktop sidebar.

Mobile should expose the most frequent jobs.

Potential:

-   Home
-   Orders
-   Products
-   Calendar
-   More

For FOOD_BUSINESS, Menus may deserve one of those positions depending on
actual usage.

`More` should provide access to:

-   Customers
-   Marketing
-   Website
-   Settings
-   secondary operational tools

Use actual usage/workflow reasoning.

------------------------------------------------------------------------

# 41. Mobile object pages

On mobile:

-   page title/status remain clear
-   primary action remains accessible
-   secondary actions use overflow/sheet
-   cards stack
-   wide tables become cards/compact lists
-   sticky actions may be used where helpful

Do not merely shrink desktop.

------------------------------------------------------------------------

# 42. Tablet

Tablet is important for:

-   kitchens
-   packing benches
-   market stalls
-   business administration

Ensure object detail two-column layouts collapse gracefully and
operational actions remain obvious.

------------------------------------------------------------------------

# 43. Desktop width

Avoid unnecessarily narrow content columns for data-heavy pages.

Use wider layouts for:

-   Orders
-   Products
-   Calendar
-   Production
-   fulfilment

Use narrower readable widths for:

-   settings forms
-   content editing

Do not apply one max-width globally to every dashboard page.

------------------------------------------------------------------------

# 44. Empty states

Standardise empty states.

Each should answer:

1.  What is this?
2.  Why would I use it?
3.  What should I do next?

Examples:

No Menus: **Sell by preorder or scheduled Drop**

\[Create menu\]

No Customers: **Customers will appear after they order.**

No Campaigns: **Tell customers when your next Menu or product is
ready.**

Avoid generic "No data" screens.

------------------------------------------------------------------------

# 45. Loading and errors

Standardise:

-   loading states
-   skeletons where appropriate
-   inline validation
-   empty state
-   recoverable error state

Do not allow every module to present failures differently.

------------------------------------------------------------------------

# 46. Destructive actions

Standardise destructive actions under contextual menus/dialogs.

Examples:

-   Archive Product
-   Unpublish Menu
-   Delete draft campaign
-   Disconnect domain later

Require confirmation where appropriate.

Do not put destructive actions beside primary actions with equal visual
weight.

------------------------------------------------------------------------

# 47. Save behaviour

Audit form save patterns.

Avoid inconsistent experiences where some pages:

-   autosave
-   use Save
-   use Save changes
-   use Publish as Save

without a reason.

Define patterns:

### Configuration/editor

Save draft / Publish where publication state matters.

### Standard object edit

Save.

### Immediate operational action

Apply immediately with clear feedback.

Do not force one pattern onto incompatible workflows.

------------------------------------------------------------------------

# 48. Notifications/toasts

Standardise success/error feedback.

Examples:

**Product saved**

**Order marked ready**

**Campaign sent**

Avoid redundant toast + banner + modal confirmations.

------------------------------------------------------------------------

# 49. Shopify inspiration boundaries

Borrow:

-   information hierarchy
-   predictable navigation
-   object-centric workflow
-   contextual actions
-   restrained sidebar
-   consistent detail layouts
-   progressive disclosure

Do NOT copy:

-   Shopify logo/branding
-   exact colour system
-   exact Polaris components
-   proprietary icons
-   exact wording where Vendl concepts differ
-   source code
-   screenshots/layout pixel-for-pixel

Vendl should remain recognisably Vendl.

------------------------------------------------------------------------

# 50. Vendl-specific advantage

Do not let Shopify inspiration make Vendl generic.

Vendl has workflows Shopify does not naturally centre:

-   Menus / Drops
-   pickup windows
-   production planning
-   recipes
-   packing
-   Farm Stand QR
-   local delivery
-   custom food orders
-   markets/events
-   operational Calendar

These should feel more integrated than they would in a generic ecommerce
platform.

That is Vendl's advantage.

------------------------------------------------------------------------

# 51. Menu workflow example

A seller should be able to:

1.  Click **Menus**.
2.  Open **Saturday Bake**.
3.  See status and order deadline.
4.  See Products.
5.  See Orders.
6.  Click Production.
7.  Click Pack orders.
8.  Click Tell customers.
9.  View the Menu in Calendar.
10. View the public Menu.

without hunting through unrelated sidebar sections.

------------------------------------------------------------------------

# 52. Order workflow example

Seller should be able to:

1.  Click Orders.
2.  Choose Prepare.
3.  Open an Order.
4.  See items/customer/payment/fulfilment.
5.  Mark Preparing.
6.  Pack.
7.  Print label.
8.  Mark Ready.
9.  Later mark Collected.

The hierarchy should reinforce the operational workflow.

------------------------------------------------------------------------

# 53. Product workflow example

Seller should be able to:

1.  Click Products.
2.  Open Sourdough.
3.  Edit selling information.
4.  See inventory.
5.  See Online/Farm Stand channels.
6.  Open linked Recipe.
7.  See estimated production cost.
8.  See where the Product is used in Menus.

without treating Recipe management as a disconnected application.

------------------------------------------------------------------------

# 54. Customer workflow example

Seller should be able to:

1.  Click Customers.
2.  Search Jane.
3.  Open Jane.
4.  See Orders.
5.  See spend/repeat history.
6.  See tags/notes.
7.  See loyalty/reviews.
8.  Use relevant marketing action.

Do not scatter Jane's information across multiple modules.

------------------------------------------------------------------------

# 55. Route mapping document

Before implementation, create a route/IA map showing:

## Existing

Current sidebar item → route

## Proposed

Primary destination → secondary destination → existing route

Example:

Orders - All → `/dashboard/orders` - Prepare →
`/dashboard/fulfilment/orders?...` - Pack → existing packing route -
Pickup → existing pickup route - Delivery → existing delivery route

Products - Products → existing - Recipes → `/dashboard/recipes` -
Ingredients → `/dashboard/ingredients`

This is essential to avoid accidentally orphaning routes.

------------------------------------------------------------------------

# 56. Implementation strategy

Do not rewrite every dashboard page simultaneously.

Recommended sequence:

### 8C.1

Audit + route map + new navigation structure.

### 8C.2

Shared page header/subnav/action primitives.

### 8C.3

Orders hub + Order detail consistency.

### 8C.4

Products hub + Recipe/Ingredient integration.

### 8C.5

Customers + Marketing hierarchy.

### 8C.6

Menus control-centre improvements.

### 8C.7

Website/Settings consolidation.

### 8C.8

Mobile/tablet navigation.

### 8C.9

Cross-link audit + regression.

Keep changes reviewable even though nothing is being committed yet.

------------------------------------------------------------------------

# 57. No data-model rewrite

Strong preference: Phase 8C requires **no major schema changes**.

This is IA/UI consolidation.

Do not alter domain models merely to simplify a component.

Small preference/UI-state additions may be acceptable if clearly
justified.

Do not touch Product.standId cleanup.

------------------------------------------------------------------------

# 58. Performance

Do not make object pages slower by eagerly loading every related system.

Example:

Customer page does not need full Campaign history payload if only a
summary is visible.

Use:

-   efficient server queries
-   lazy/secondary loading where appropriate
-   aggregates
-   pagination

Avoid N+1 relationships.

------------------------------------------------------------------------

# 59. Accessibility

Ensure:

-   semantic navigation
-   current-page indication
-   keyboard-accessible menus/tabs
-   focus management for sheets/dialogs
-   statuses not colour-only
-   mobile actions accessible
-   headings have logical hierarchy

------------------------------------------------------------------------

# 60. Tenancy/security

Navigation consolidation must not weaken ownership checks.

Every underlying route/action continues to verify authenticated Owner.

Do not assume that because a link was reached from an owned Order that
the linked Customer/Product/Menu is automatically safe.

Keep server-side ownership checks.

------------------------------------------------------------------------

# 61. Capacitor

Audit the owner mobile apps after navigation changes.

Test:

-   bottom navigation
-   More
-   deep links
-   Orders
-   Products
-   Calendar
-   Menus
-   operational workflows

Do not build a separate native IA.

------------------------------------------------------------------------

# 62. Tests

Add/update focused tests for:

-   navigation by businessMode
-   primary nav active state
-   secondary nav active state
-   stable existing routes
-   redirects if any
-   contextual object links
-   mobile More destinations
-   no orphaned key dashboard routes

Do not over-test presentational implementation details.

------------------------------------------------------------------------

# 63. Regression

Run all current relevant suites including:

-   Phase 8 operations
-   Phase 8B Calendar tests if implemented
-   `test:grow`
-   `test:production`
-   `test:tenancy`
-   Menu/Fulfilment tests
-   `npx tsc --noEmit`
-   full `npm run build`

Manually verify:

-   signup/onboarding
-   FARM_STAND
-   FOOD_BUSINESS
-   BOTH
-   Orders
-   Products
-   Customers
-   Menus
-   Calendar
-   Marketing
-   Website
-   Settings
-   Farm Stand
-   Production
-   Packing
-   Pickup
-   Delivery
-   Custom Orders
-   Markets/Events
-   storefront
-   `*.localhost`
-   `/s/*`
-   Stripe
-   cash/local
-   Free/Pro fee behaviour
-   Capacitor navigation

PayPal WIP remains untouched.

------------------------------------------------------------------------

# 64. Explicitly deferred

Do NOT use Phase 8C to build:

-   Phase 9 custom domains
-   global command palette unless already substantially present
-   enterprise saved views
-   staff permissions redesign
-   accounting
-   new payment architecture
-   offline POS
-   new analytics platform
-   major database redesign
-   Product.standId cleanup
-   visual Shopify clone
-   full design-system rewrite

Stay focused on IA and interaction consistency.

------------------------------------------------------------------------

# 65. Completion criteria

Phase 8C is complete when:

1.  Sidebar has a materially simpler major-object hierarchy.
2.  Secondary features are accessible contextually or through subnav.
3.  Existing routes/deep links still work.
4.  Orders operates as a coherent operational hub.
5.  Products connects naturally to Recipes/Ingredients.
6.  Customers connects naturally to Segments/retention data.
7.  Menus operate as a control centre for Drops.
8.  Calendar remains a cross-system operations view.
9.  Marketing consolidates Phase 7 functionality.
10. Website remains a coherent storefront-management area.
11. Settings contains configuration rather than day-to-day operations.
12. Farm Stand remains first-class where relevant.
13. Object pages use consistent headers/status/actions.
14. Mobile navigation is simpler and usable.
15. No key feature becomes orphaned.
16. Existing commerce/payment behaviour remains unchanged.
17. Full regression/typecheck/build remain green.

The success criterion is simple:

**A seller should understand where to go without needing to understand
Vendl's internal feature architecture.**

------------------------------------------------------------------------

# 66. Completion report

When complete, report:

1.  Existing IA audit
2.  Final primary navigation
3.  Business-mode navigation differences
4.  Secondary navigation structure
5.  Route mapping
6.  Routes changed, if any
7.  Redirects added, if any
8.  Shared UX components added/changed
9.  Orders changes
10. Products changes
11. Customers changes
12. Menus changes
13. Calendar integration
14. Marketing changes
15. Website changes
16. Settings changes
17. Farm Stand treatment
18. Production/Recipes/Ingredients treatment
19. Custom Orders/Events treatment
20. Mobile navigation
21. Tablet/desktop layout
22. Deep-link/cross-link audit
23. Accessibility
24. Tests/results
25. Regression results
26. `tsc` result
27. full build result
28. Architecture deviations and why
29. Deferred items
30. Git status

**Do NOT commit.**

**Do NOT push.**

**Do NOT merge.**

**Do NOT deploy.**

**Do NOT begin Phase 9.**

Stop after the Phase 8C completion report.
