# Vendl Phase 8C — Dashboard IA & UX Consolidation

## Status

**Complete locally.** Not committed / pushed / deployed. Phase 9 not started.

Brief: `VENDL-NEXT-PHASE-8C-SHOPIFY-STYLE-DASHBOARD-IA.md`

**No schema changes.**

## Objective

Consolidate ~30 sidebar links into a Shopify-*inspired* (not cloned) information architecture: fewer primary destinations, hub subnavs inside major areas, object-first URLs, and a simplified mobile shell. All existing deep routes remain reachable.

## Primary sidebar (~9 items)

| Item | Route | Notes |
|------|-------|-------|
| Home | `/dashboard` | |
| Orders | `/dashboard/orders` | Hub subnav |
| Products | `/dashboard/products` | Hub subnav |
| Customers | `/dashboard/customers` | Hub subnav |
| Menus | `/dashboard/menus` | Hidden for `FARM_STAND` |
| Calendar | `/dashboard/calendar` | |
| Marketing | `/dashboard/marketing` | Replaces Grow hub |
| Website | `/dashboard/website` | Hub subnav |
| Farm Stand / Shop / Locations | `/dashboard/businesses` | Label varies by mode; hidden for `FOOD_BUSINESS` |
| Settings | `/dashboard/settings` | Hub subnav |

## More tools (secondary)

Getting started · Notifications · Production · Collections · Pre-orders · Subscriptions · Fulfilment setup · Custom orders · Markets & events · Categories · Operate overview · Help · Payments · Billing

Collapsible in desktop sidebar; full list in mobile **More** sheet.

## Hub subnavs

Rendered via `DashHubSubnav` in `AppShell` when `hubNavForPath(pathname)` matches:

- **Orders:** All · Prepare & pack · Production · Pickup · Delivery · Custom
- **Products:** Products · Categories · Recipes · Ingredients
- **Customers:** Customers · Segments
- **Marketing:** Overview · Campaigns · Discounts · Loyalty · Reviews · Gift cards
- **Website:** Editor · Domains
- **Settings:** General · Payments · Plan & billing · Fulfilment · Notifications

Logic: `src/components/dash-nav-links.ts` (`hubNavForPath`, `hubNavItemActive`).

## Route aliases & redirects

| New / canonical | Behaviour |
|-----------------|-----------|
| `/dashboard/marketing` | Marketing overview (was Grow) |
| `/dashboard/grow` | Redirect → `/dashboard/marketing` |
| `/dashboard/orders/[orderId]` | Redirect → `/dashboard/fulfilment/orders/[orderId]` |

Order list rows link to `/dashboard/orders/[orderId]`. Ops order detail back link → **← Orders**.

## Shared UI primitives

`src/components/dash-object/DashObjectUi.tsx`:

- `ObjectPageHeader` — back link, title, badges, actions
- `ObjectSubnav` — hub tabs
- `StatusBadge`, `DetailCard`

## Mobile

- Bottom tabs: mode-aware (4 tabs farm stand; 5 tabs food business with Menus)
- **More** sheet: primary + secondary nav with badges

## Menu control centre

Menu detail (`/dashboard/menus/[menuId]`) adds workflow chips: Prepare & pack · View in calendar · Tell customers · Production (pre-order drops).

## Key files

| File | Change |
|------|--------|
| `src/components/dash-nav-links.ts` | Primary/secondary nav, hubs, mobile tabs |
| `src/components/DashboardSidebar.tsx` | Flat primary + More tools |
| `src/components/DashboardMobileNav.tsx` | Tabs + More sheet |
| `src/components/DashHubSubnav.tsx` | Client hub subnav |
| `src/components/AppShell.tsx` | Wires hub subnav |
| `src/components/DashNavIcon.tsx` | Icons for calendar, marketing, menus, etc. |
| `src/app/dashboard/(gated)/marketing/page.tsx` | New hub |
| `src/app/dashboard/(gated)/grow/page.tsx` | Redirect |
| `src/app/dashboard/(gated)/orders/[orderId]/page.tsx` | Alias redirect |

## Tests

```bash
npm run test:ia        # 6 tests — nav/hub resolution
npm run test:calendar
npm run test:ops
npm run test:grow
npm run test:production
npm run test:tenancy
npx tsc --noEmit
npm run build
```

## Out of scope (per brief)

- Visual Shopify clone
- Deleting legacy routes
- Schema / PayPal WIP
- Phase 9

## Manual smoke checklist

- [ ] Sidebar shows ~9 primary items; More tools expands
- [ ] Orders hub subnav on `/dashboard/orders`, pack board, production, collections
- [ ] Marketing hub on campaigns/coupons; `/dashboard/grow` redirects
- [ ] Click order in list → detail; back says Orders
- [ ] Mobile tabs + More sheet
- [ ] Menu detail workflow links work
- [ ] FARM_STAND hides Menus; FOOD_BUSINESS hides Farm Stand primary item
