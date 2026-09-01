# Phase 3 regression checklist

Manual pilot before nullable `Product.standId` (slice 3I).  
See `VENDL-NEXT-PHASE-3-CATALOGUE-ARCHITECTURE.md` §12.

## Auth & onboarding

- [ ] New signup → 2-step gate (mode + profile) → dashboard
- [ ] Getting Started tasks progressive (sell, fulfilment, branding, payments, product)
- [ ] Soft-deleted owner re-signup resets onboarding

## Catalogue (Phase 3)

- [ ] Products list: Selected vs All locations
- [ ] Products list: category filter
- [ ] Product editor: channel assignment (multi-stand)
- [ ] Product editor: category membership
- [ ] Categories CRUD
- [ ] Customers list + detail + notes
- [ ] Assign product to second stand → appears on both `/s/{slug}` catalogs
- [ ] Public stand category chips filter catalog

## Commerce (must not regress)

- [ ] `/s/{slug}` catalog, PDP, cart, pay, pre, sub
- [ ] QR resolves to correct stand
- [ ] Cash / local bank checkout
- [ ] Stripe card / deposit / balance dunning
- [ ] Pre-order pages + collections
- [ ] Subscriptions enroll + cycle
- [ ] Inventory decrement once; low-stock alerts
- [ ] Order snapshots intact on archived products
- [ ] Free 2.5% fee / Pro waiver unchanged

## CRM linking

- [ ] Card checkout links Customer
- [ ] Cash checkout links Customer when email present
- [ ] PayPal checkout links Customer
- [ ] Subscription enroll links Customer
- [ ] Restock opt-in links Customer + marketing consent

## Mobile & apps

- [ ] Dashboard mobile tabs + More menu
- [ ] Capacitor login shell

## Deferred (not in this checklist)

- [ ] 3I nullable `Product.standId` / owner-unique slugs
- [ ] PayPal WIP merge (separate track)
