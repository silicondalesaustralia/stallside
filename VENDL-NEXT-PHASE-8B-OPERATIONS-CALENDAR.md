# Vendl Next --- Phase 8B: Operations Calendar

## Status

Phase 8B implementation brief.

Phase 8 is complete locally and verified. Phase 9 has **not** started.

This phase inserts a unified visual Operations Calendar before Phase 9.

**Do NOT commit, push, merge, deploy, or release this work. Do not begin
Phase 9. PayPal WIP remains untouched.**

## 1. Objective

Build a unified **Operations Calendar** that gives sellers one visual
schedule for the commerce and operational events Vendl already knows
about:

-   Menus / Drops
-   order-open dates
-   order-close deadlines
-   fulfilment dates
-   pickup windows
-   delivery windows
-   production requirements
-   packing/preparation
-   subscription fulfilments
-   custom-order due dates
-   markets/events

The intended experience is similar in purpose to the operational
calendar used by food-business platforms such as Cottage CMS, but it
must use Vendl's own architecture and design system.

The calendar should answer: What is happening today? What closes this
week? What needs producing? When are pickups and deliveries? What custom
orders and markets are coming up?

## 2. Core architectural rule

**Do not create a second scheduling system.**

Calendar is primarily a **projection of existing Vendl data**:

Menus/Drops + Fulfilment + Production + Subscriptions + Custom Orders +
Markets/Events → Operations Calendar.

Existing domain objects remain source of truth. Editing a Menu deadline,
Pickup Window or Event date must automatically change Calendar.

Prefer **no CalendarEvent database table**.

## 3. Audit first

Before implementation inspect the actual Phase 3--8 repository.

Audit:

-   Menu scheduling, open/close dates, publication, Orders, Production
    and Fulfilment relationships
-   OrderFulfilment, FulfilmentOption, PickupLocation, PickupWindow,
    DeliveryZone, `collectionAt`, delivery dates/windows and statuses
-   ProductionPlan, grouping, dates, status, Menu links and Pack Orders
    links
-   subscription recurrence/generated Orders/upcoming fulfilment
    semantics
-   Phase 8 custom forms/requests, due dates and converted Orders
-   Phase 8 Market/Event model, start/end/location/status
-   Order dates/status/payment/operational state
-   seller timezone/business location
-   dashboard/AppShell/nav/date utilities/mobile behaviour

Use actual model names and repository conventions.

## 4. Timezone

All calendar boundaries and displayed times must use the seller's
configured business timezone, not server timezone.

Handle day/week/month boundaries and DST correctly. Reuse existing
date/time libraries.

## 5. Route and navigation

Create the canonical route that best fits the current app, preferably:

`/dashboard/calendar`

Add **Calendar** under OPERATE.

Do not duplicate it in multiple nav groups.

## 6. Views

Implement:

### Week

Default for FOOD_BUSINESS and BOTH unless existing preference
architecture suggests otherwise.

Prefer a **seven-day operational planner** over a complex 24-hour Google
Calendar clone.

Each day can contain ordered cards such as:

-   7:00 Farmers Market
-   8:00 Hahndorf Pickup
-   10:00 Mount Barker Pickup
-   Production --- Saturday Bake
-   Delivery --- 5 orders

### Month

For longer-range planning. Keep cells compact and use `+N more` when
crowded.

### Agenda

Chronological operational list grouped by Today, Tomorrow, date, etc.
This should be the strongest mobile view.

Support Today, previous/next period and lightweight date jump.

Where practical preserve view/date in URL,
e.g. `?view=week&date=2026-09-12`.

## 7. Calendar projection abstraction

Create a central server-side projection layer, likely under
`src/lib/calendar/`.

Potential presentation type:

-   id
-   type
-   title
-   startsAt
-   endsAt
-   allDay
-   status
-   sourceType
-   sourceId
-   href
-   location
-   summary/counts
-   metadata

Potential projection functions:

-   `loadCalendarEvents(ownerId, range)`
-   `projectMenuEvents`
-   `projectFulfilmentEvents`
-   `projectProductionEvents`
-   `projectSubscriptionEvents`
-   `projectCustomOrderEvents`
-   `projectMarketEvents`

Do not put large domain queries directly in React components.

## 8. Event types

Support presentation types equivalent to:

-   Orders open
-   Orders close
-   Production
-   Pack orders
-   Pickup
-   Delivery
-   Subscription
-   Custom order
-   Market/Event

Internal enums may use technical names. Seller-facing language must stay
simple.

Use icons/labels/badges as well as visual styling. Do not rely on colour
alone.

## 9. Menus / Drops

Project actual configured Menu dates.

Examples:

**Orders open --- Saturday Bake**

**Orders close --- Saturday Bake**\
Thursday 6pm\
34 orders · \$786

Where useful include real qualifying order counts/revenue using existing
order/payment semantics.

Click through to the relevant Menu detail/orders/edit context.

Do not invent missing dates.

## 10. Production

Project Phase 6 production work.

Example:

**Production --- Saturday Bake**\
68 items to make\
26 Sourdough · 42 Cinnamon Buns

Click through to the correct Production context.

If there is no explicit production date, do not invent "one day before".
Use an existing production date or relevant fulfilment context. If a
genuinely necessary seller-defined production date is missing, propose
the smallest additive field and document why.

## 11. Packing

Surface Phase 8 packing workload where a date can be derived safely.

Example:

**Pack orders --- Saturday Bake**\
18 / 27 packed

Click to Phase 8 packing.

Do not create a fake packing date if none exists.

## 12. Pickup

Project PickupLocation/PickupWindow/OrderFulfilment.

Example:

**Hahndorf Pickup**\
8--10am\
18 orders · 12 ready

Multiple pickup windows on one day remain separate.

Click to the relevant pickup/handover screen.

## 13. Delivery

Project actual delivery fulfilment.

Example:

**Adelaide Hills Delivery**\
5 orders · 3 ready

Click to delivery run.

No route optimisation.

## 14. Subscriptions

Surface upcoming subscription fulfilments only when the architecture can
determine them reliably.

Prefer actual generated upcoming Orders where safer.

If future recurrence is projected, distinguish it from generated Orders
and prevent duplication. Never create phantom Orders merely for
Calendar.

## 15. Custom orders

Show meaningful Phase 8 custom-order due dates.

Example:

**Birthday Cake --- Sarah**\
Due Saturday

Once a request converts into a real Order, avoid duplicate request +
Order calendar entries. Define explicit deduplication semantics.

## 16. Markets / Events

Project Phase 8 Markets/Events.

Example:

**Adelaide Hills Farmers Market**\
Saturday 7am--1pm\
Mount Barker Showgrounds

Click to Event detail/quick sale where appropriate.

## 17. Example operational week

The calendar should be capable of making this immediately
understandable:

### Monday

**Orders open --- Saturday Bake**

### Thursday

**6pm --- Saturday Bake orders close**\
34 orders · \$786

### Friday

**Production --- Saturday Bake**\
68 items to make

### Saturday

**7am--1pm --- Farmers Market**

**8--10am --- Hahndorf pickup**\
18 orders · 12 ready

**10am--12pm --- Mount Barker pickup**\
11 orders

**Delivery --- Adelaide Hills**\
5 orders

## 18. Event interaction

Every event must lead somewhere useful.

-   Menu → Menu detail/orders
-   Production → Production
-   Packing → Pack Orders
-   Pickup → handover
-   Delivery → delivery run
-   Custom order → request/order
-   Market → Event

Desktop may use a lightweight event popover before navigation. Mobile
may use direct navigation or a bottom sheet.

Do not create dead informational cards.

## 19. Filters

Add simple filters for:

-   Menus/Drops
-   Production
-   Pickup
-   Delivery
-   Subscriptions
-   Custom Orders
-   Markets

Do not build a generic rules/filter engine.

## 20. Business-mode defaults

Use `businessMode` for sensible defaults, not hard restrictions.

FOOD_BUSINESS: emphasise Menus, Production, Packing, Pickup, Delivery,
Custom Orders.

FARM_STAND: emphasise preorders, Pickup, Subscriptions, Markets/Events.

BOTH: show all relevant types.

## 21. Deduplication

This is critical.

One commercial workflow may touch Menu → Orders → OrderFulfilment →
ProductionPlan.

Show separate cards only for genuinely different operational moments,
e.g.:

-   Orders close Thursday
-   Production Friday
-   Pickup Saturday

Do not show multiple Saturday cards merely because several database
records describe the same pickup.

Explicitly define and test deduplication.

## 22. Counts and status

Where useful show real operational counts:

-   Pickup: 18 orders
-   Production: 68 items
-   Delivery: 5 orders/stops
-   Menu closes: 34 orders
-   Packing: 18/27 packed
-   Custom: 2 due

Map domain-specific statuses into simple presentation labels. Do not
invent a universal persisted status system.

## 23. Calendar editing

Initial Calendar is a control centre, not a second editor.

**Do not implement drag-and-drop rescheduling.**

Provide `Edit schedule` links back to source editors:

-   Menu date → Menu edit
-   Pickup Window → Fulfilment
-   Market date → Event edit

This prevents accidental domain changes from moving cards.

## 24. Manual calendar events

Do not build general manual appointments.

Vendl Calendar is for operational commerce. Sellers can use their normal
personal calendar for unrelated appointments.

## 25. Range querying and performance

Query only the visible date range.

Avoid:

-   loading all historical Orders
-   query-per-day
-   query-per-card
-   N+1 OrderItem queries

Use consolidated range queries/aggregates.

Audit/add indexes only where justified, such as owner + relevant
schedule/date fields.

## 26. Mobile

Do not squeeze seven tiny columns onto a phone.

Recommended mobile default: **Agenda**.

Week can use a week strip + selected-day cards or horizontally swipable
days.

Month can remain available.

Critical event cards/actions must have large tap targets.

## 27. Tablet

Make Week view particularly good on tablets. Sellers may use Vendl in
kitchens, sheds, packing areas and markets.

## 28. Operations home integration

Phase 8 created `/dashboard/operate`.

Where useful add a small reusable **Coming up** projection:

Today --- 2 pickups\
Tomorrow --- Saturday Bake closes 6pm\
Saturday --- Farmers Market + 3 fulfilment windows

\[Open calendar\]

Reuse the central Calendar service. Do not implement duplicate queries.

A similar small main-dashboard card is optional.

## 29. Source-system integration

Keep existing direct actions.

Menus can retain View Production / Pack Orders and optionally gain View
in Calendar.

Production can gain View in Calendar.

Fulfilment editors remain the place to change windows.

Phase 8 board remains the place to operate individual Orders.

Calendar is the cross-system navigation and planning layer.

## 30. Empty state

Example:

**Nothing scheduled yet**

Your Menus, pickups, deliveries, subscriptions, custom orders and
markets will appear here automatically.

Offer relevant actions based on business mode, such as Create Menu, Set
up fulfilment or Create Event.

Do not make Calendar an onboarding requirement.

## 31. Security and privacy

Calendar is seller-private.

Every query must be scoped to authenticated Owner.

Never trust event/source IDs for ownership.

Do not expose another seller's:

-   Orders
-   customer names
-   delivery addresses
-   custom requests
-   production information

Calendar overview should generally use aggregate counts rather than
customer PII.

## 32. Accessibility

Use:

-   keyboard-accessible controls where practical
-   visible focus
-   semantic links/buttons
-   readable contrast
-   event type labels/icons in addition to colour
-   useful screen-reader date/event labels

## 33. External calendar sync

Do **not** build Google/Apple/Outlook two-way sync in Phase 8B.

Design the projection layer so future ICS/calendar feeds remain
possible.

A private read-only ICS export is optional only if trivial after the
core phase. Do not delay Phase 8B for it.

## 34. Schema

Strong preference: **no CalendarEvent database model**.

If a missing operational date or index requires schema work:

-   additive only
-   explain why
-   do not duplicate source-of-truth dates
-   safe/idempotent migration

## 35. Tests --- date/time

Add deterministic tests for:

-   seller timezone
-   week boundaries
-   month boundaries
-   DST where relevant
-   timed events
-   all-day events
-   visible range filtering

## 36. Tests --- projections

Test projection for:

-   Menu open
-   Menu close
-   Production
-   Packing where applicable
-   Pickup
-   Delivery
-   Subscription/generated Order
-   Custom Order
-   Market/Event

Verify correct source href/context.

## 37. Tests --- deduplication

Explicitly test:

-   Menu + Fulfilment does not create confusing duplicate fulfilment
    cards
-   converted custom request does not appear twice
-   projected subscription does not duplicate generated Order
-   multiple genuine pickup windows remain distinct

## 38. Tests --- tenancy

Test Owner A cannot see Owner B:

-   Menu events
-   fulfilment
-   production
-   custom orders
-   events

Crafted query/source IDs must not leak data.

## 39. Tests --- views

Test core Week, Month and Agenda data/render behaviour plus
Today/date/filter navigation.

Avoid fragile pixel-perfect snapshots.

## 40. Regression

Run all current relevant suites, including:

-   Phase 8 operations tests
-   `test:grow`
-   `test:production`
-   `test:tenancy`
-   Menu/Fulfilment tests
-   `npx tsc --noEmit`
-   full `npm run build`

Also verify core flows:

-   signup/onboarding
-   FARM_STAND / FOOD_BUSINESS / BOTH
-   Menus
-   Orders
-   Fulfilment
-   Production
-   Packing
-   Custom Orders
-   Markets/Events
-   Subscriptions
-   storefront
-   `*.localhost`
-   `/s/*`
-   QR
-   Stripe
-   cash/local
-   Free/Pro fee behaviour
-   Capacitor navigation

PayPal WIP remains untouched.

## 41. Explicitly deferred

Do not build:

-   general personal calendar
-   manual appointments
-   staff shifts/rostering
-   drag/drop rescheduling
-   Google Calendar two-way sync
-   Outlook/Apple sync
-   route optimisation
-   delivery tracking
-   new reminder engine
-   AI scheduling
-   automatic production-date assumptions
-   offline calendar
-   custom domains
-   Phase 9 infrastructure
-   Product.standId cleanup

## 42. UI quality bar

Calendar should feel like a major Vendl feature, not a third-party
calendar dropped into the dashboard.

Use Vendl typography, cards, spacing, buttons, badges and responsive
conventions.

The seller should be able to glance at the week and immediately
understand what is coming.

## 43. Implementation approach

Phase 8B is authorised for implementation.

**FIRST audit the repository and provide a concise plan based on the
actual models/routes.**

Proceed additively.

STOP before any work requiring:

-   replacement of Menu scheduling
-   replacement of Fulfilment scheduling
-   replacement of Production
-   subscription recurrence rewrite
-   destructive migration
-   significant new external infrastructure
-   a second scheduling source of truth

Do not rewrite stable architecture for Calendar.

## 44. Completion criteria

Phase 8B is complete when a seller can:

1.  Open Calendar.
2.  See the current operational week.
3.  See Menu/Drop open and close dates.
4.  See production work.
5.  See pickup windows and order counts.
6.  See delivery work.
7.  See relevant subscription fulfilment.
8.  See custom orders due.
9.  See Markets/Events.
10. Switch Week / Month / Agenda.
11. Filter event types.
12. Navigate from every event to the correct operational screen.
13. Use Calendar effectively on mobile.
14. Use Calendar effectively on desktop/tablet.
15. See correct seller-local dates/times.
16. Never see another seller's data.

Most importantly, Calendar must be generated from existing Vendl
operational systems rather than requiring sellers to maintain another
calendar manually.

## 45. Completion report

When complete report:

1.  Files changed
2.  Schema changes, if any
3.  Calendar route
4.  Navigation changes
5.  Projection architecture
6.  Event types
7.  Menu/Drop integration
8.  Production integration
9.  Packing integration
10. Pickup integration
11. Delivery integration
12. Subscription integration
13. Custom Order integration
14. Market/Event integration
15. Week view
16. Month view
17. Agenda view
18. Mobile/tablet behaviour
19. Timezone handling
20. Deduplication rules
21. Security/tenancy
22. Tests/results
23. Regression results
24. `tsc`
25. full build
26. Deferred items
27. Architecture deviations
28. Git status

**Do NOT commit. Do NOT push. Do NOT merge. Do NOT deploy. Do NOT begin
Phase 9.**

Stop after the Phase 8B completion report.
