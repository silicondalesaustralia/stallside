# Vendl Phase 6 — Recipes, Costing & Production Planning

## Status

Implemented locally (additive schema + dashboard). Not pushed / deployed.

## Architecture

```
Ingredient (purchase cost)
  → Recipe (+ optional nested component recipes)
    → ProductRecipe (yield units per product)
      → OrderItems (paid demand)
        → Production groups (by day / menu)
```

Public storefront never exposes ingredient, recipe, or cost data.

## Schema

Migration: `prisma/migrations/20260901200000_phase6_recipes_costing`

| Model | Role |
|-------|------|
| `Ingredient` | Owner-scoped purchasable material + current buy price |
| `IngredientCostHistory` | Snapshots on purchase price/qty changes |
| `Recipe` | Yield quantity + label (`buns`, `loaves`, …) |
| `RecipeIngredient` | Ingredient line **or** nested component recipe (XOR) |
| `ProductRecipe` | One primary recipe per product + `yieldUnitsPerProduct` |
| `ProductionPlan` | Optional notes/status keyed by `groupKey` |
| `Product.packagingCostCents` | Optional packaging/materials per unit |

Enums: `MeasureUnit` (`MG|G|KG|ML|L|EACH`), `ProductionStatus` (`PLANNED|IN_PROGRESS|COMPLETE`).

No `ProductVariant` table exists in Vendl — option groups remain commerce-only. Recipe linkage is **product-level**. Option-specific multipliers are deferred.

## Unit system

Canonical families:

- Weight: mg ↔ g ↔ kg (base g for aggregation)
- Volume: ml ↔ L (base ml)
- Count: each

Incompatible conversions (g ↔ ml) are rejected. Density is out of scope.

Quantity precision: `Decimal(18,6)` in DB; conversion math uses finite floats with display rounding (≤3 dp). Currency stays integer **cents**; intermediate ingredient costs may be fractional cents and are `Math.round`’d at display/totals.

## Costing methodology

1. Ingredient base cost = `purchasePriceCents / convert(purchaseQty → baseUnit)`
2. Recipe batch cost = sum of line costs (nested component = `componentBatchCost × (lineQty / componentYield)`)
3. Cost per yield unit = batch cost / recipe yield
4. Product ingredient cost ≈ cost per yield unit × `yieldUnitsPerProduct` (+ optional packaging)
5. Production run cost ≈ sum over products of (batch cost × exact batches demanded)
6. Contribution before other costs = revenue − ingredient − packaging

Do **not** call this profit. Labour, fees, rent, wastage, etc. are excluded.

Historic order sale prices are never rewritten. Production estimates use **current** ingredient costs unless a future cost snapshot is added.

## Production source of truth

Quantities come from **OrderItems**, not menu stock caps.

Included `paymentStatus`:

- `PAID`, `CUSTOMER_CONFIRMED`, `DEPOSIT_PAID`, `BALANCE_DUE`, `BALANCE_FAILED`

Same paid-demand set as Collections/sales metrics. Excludes `PENDING`, `FAILED`, `CANCELLED`, `REFUNDED`, `EXPIRED`.

Date window:

- Pre-orders / scheduled: `collectionAt` in range
- Take-now: `isPreOrder=false` and `createdAt` in range (same-day packing)

Grouping: calendar day in stand timezone; optional filter to a Menu’s product set (`menuId`).

Batch display: exact batches + suggested `ceil` whole batches + surplus yield. Does not change orders or inventory.

## Menu & fulfilment integration

- Menu edit/list: “Production” / “View production” for `PREORDER_DROP`
- Fulfilment entities already stamp `OrderFulfilment`; production groups by collection day (window labels available via fulfilment snapshot when present)
- Collections remain the packing UI; Production is the bake/make + ingredients/cost view

## Delete / archive behaviour

- Ingredients: archive (`isActive=false`). Hard delete blocked while referenced (`onDelete: Restrict` on recipe lines).
- Recipes: archive. Product links use `Restrict` — unlink products before hard delete.
- Product delete cascades `ProductRecipe`.

## Compatibility

- Existing sellers need no ingredients/recipes — products keep selling
- Farm stand QR `/s/*` unchanged
- Menus, fulfilment, subscriptions, payments untouched
- PayPal WIP not modified
- `Product.costCents` manual field remains (owner meta); recipe section shows estimated ingredient cost separately

## Dashboard routes

| Path | Purpose |
|------|---------|
| `/dashboard/ingredients` | List / search |
| `/dashboard/ingredients/new` | Create |
| `/dashboard/ingredients/[id]` | Edit + price history |
| `/dashboard/recipes` | List + costs |
| `/dashboard/recipes/new` | Create |
| `/dashboard/recipes/[id]` | Edit / duplicate / archive |
| `/dashboard/production` | Planning + print view |
| Product edit → Production | Link recipe + packaging |

## Tests

```bash
npm run test:production
```

Covers unit conversion, incompatible rejection, purchase→base cost, yield/batches, box-of-6 scaling, contribution.

Owner scoping: server actions use `requireOwnerWrite` and verify ingredient/recipe/product ownership before writes.

## Deferred (not in Phase 6)

- Supplier POs / ingredient stock decrement
- Option-choice recipe multipliers
- Nutritional / allergen / labelling
- Labour costing / accounting sync
- Automatic 301 of `/shop` → subdomain (Phase 4C)

Nested recipe ingredient flattening for production sheets is implemented
(`flattenRecipeIngredients` / `flattenRecipeIngredientsForOwner`) with the same
cycle and max-depth protections as recipe costing.

## Regression checklist (manual)

- [ ] Signup / onboarding FARM_STAND, FOOD_BUSINESS, BOTH
- [ ] Products sell without recipes
- [ ] Menus + menu cart + drops
- [ ] Collections packing still works
- [ ] Fulfilment config pages
- [ ] Pre-orders + subscriptions
- [ ] `/shop/*`, `*.localhost`, `/s/*` QR checkout
- [ ] Stripe / cash / local bank unchanged
- [ ] Dashboard mobile: Production readable
- [ ] Print view hides nav (`print:hidden` shell)
