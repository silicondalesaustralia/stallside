# Green Valley Demo Store — Result

**Status:** Built (images pending)  
**Date:** 2026-09-02  
**Commit:** none (per brief)

---

## 1. Demo architecture

One fictional seller (**Green Valley Farm & Bakes**) with one catalogue. Public template demos at `/demo/artisan|farmhouse|market` override Craft home nodes + `templateId` **in memory only** (and via `vendl_demo_template` cookie for `/shop/...` chrome). Published storefront stays on Artisan starter; seller publish state is not mutated by the switcher.

## 2. Tenant / store identity

| Field | Value |
|-------|--------|
| Owner email | `green-valley-demo@vendl.app` |
| Stand slug | `green-valley-farm-bakes` |
| Storefront slug | `green-valley-farm-bakes` |
| Env overrides | `DEMO_WEBSITE_STAND_SLUG`, `DEMO_WEBSITE_STOREFRONT_SLUG` |

## 3. Seed command

```bash
npm run seed:green-valley-demo
```

Idempotent: upserts owner/user/stand/products/menus/fulfilment/subscription + republishes storefront JSON.

## 4. Rolling-date strategy

`src/lib/demo/green-valley/dates.ts` — next Saturday pickup (Adelaide), order-by Thursday 18:00. Reseed refreshes menu dates.

## 5–22. Content

- Business: BOTH mode, Adelaide Hills (fictional), brand greens/clay in theme tokens via Farmhouse/Artisan/Market templates  
- 12 products, 5 categories (brief copy; **image URLs empty until assets provided**)  
- Menus: `saturday-farm-bake`, `farm-stand-favourites`  
- Farm stand location + pickup + Adelaide Hills delivery zone ($8)  
- Weekly egg subscription offer (no Stripe Connect on demo — browse only for cards)  
- Fixture reviews via `loadStorefrontReviews` when owner email matches demo  
- Custom pages: About, Our Farm, Pickup & Delivery, FAQ, Contact, policies  
- Journal: 4 published blog posts  
- SEO home fixture + product SEO titles/descriptions  
- Footer disclosure on demo storefront only  

## 23–26. Public URLs & switcher

- Hub: `/demo` — tabs **Website demo** | **Farmstand checkout**  
- Templates: `/demo/artisan`, `/demo/farmhouse`, `/demo/market` (`noindex`)  
- Toolbar on demo template pages; cookie preserves template chrome on `/shop/green-valley-farm-bakes/...`  
- CTAs: “Try Demo” → **Demo**

## 27–28. Safety

- Dedicated demo owner; not the stall/preorder Green Valley Eggs stands  
- Card/PayPal disabled on demo stand; cash only for stand channel  
- Reviews are fixtures (not order-linked)  
- Demo routes `robots: noindex`  
- PayPal WIP untouched  

## 29. Indexing

Demo template routes: noindex. Published `/shop/green-valley-farm-bakes` uses normal storefront robots (demo disclosure in footer). Prefer linking marketing traffic to `/demo/*`.

## 30–32. Templates

Home section order matches brief (Artisan / Farmhouse / Market) via `buildGreenValleyHomeNodes`.

## 33–36. Visual QA / screenshots

**Pending** — user providing images; then visual gate.

## 37–39. Tests / tsc / build

- `npx tsx --test src/lib/demo/green-valley/green-valley.test.ts`  
- Full `tsc` + `npm run build` required after this change set  

## 40. Known limitations

- Product/category/hero images not yet attached (placeholders empty)  
- Contact form may not deliver for demo email  
- “This Week” nav page exists but does not auto-redirect to menu URL yet  
- Subscription lacks Connect — offer is catalogue-only  
- Deep shop pages keep template **tokens/nav** via cookie; home section swap is strongest on `/demo/*` and shop home  

## 41. Git status

Uncommitted (do not commit/push per brief).
