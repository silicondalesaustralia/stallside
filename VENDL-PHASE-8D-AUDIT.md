# Phase 8D.0 — Storefront audit & Puck migration map

Status: audit complete (pre-spike).

## Current data model

`Storefront` (`prisma/schema.prisma`):

| Field | Role |
|-------|------|
| `slug` | Public path `/shop/{slug}` + subdomain label |
| `isPublished` | Gates public access |
| `headline`, `subheadline`, `about`, `heroImageUrl` | Scalar copy/media |
| `themePreset` | `farmhouse` \| `market` \| `minimal` \| `modern` |
| `draftConfig` | Working JSON layout |
| `publishedConfig` | Snapshot at publish |
| `publishedAt` | Last publish time |
| `contactEmail`, `showPhone` | Public contact |
| `customDomain` | Saved only (Phase 9) |

Branding (logo, accent colours, social) resolves from `Owner` + primary `Stand` via `resolveStorefrontBranding()`.

## Current config shape (Phase 4B)

```typescript
type StorefrontConfig = {
  sections: Array<{ id: SectionId; enabled: boolean; order: number; props?: Record<string, unknown> }>;
  pages: { home, shop, about, contact: { enabled: boolean; body?: string } };
  featuredProductIds?: string[];
  galleryImages?: string[];
  themeOverrides?: { accentColor?, secondaryColor?, buttonStyle? };
};
```

`section.props` is typed but **never read** by the renderer. Layout is a fixed registry + switch in `StorefrontHomeContent.tsx`.

## Draft / publish flow

| Action | Behaviour |
|--------|-----------|
| Save draft | Updates scalars + `draftConfig`; live site unchanged |
| Publish | `publishedConfig ← draftConfig`, `isPublished = true` |
| Unpublish | `isPublished = false` (snapshot kept) |
| Public read | Requires published; uses `publishedConfig` else `draftConfig` |
| Draft preview | `?draft=1` + owner session → `draftConfig` |

Core: `src/lib/catalogue/storefront.ts`, actions in `src/app/dashboard/(gated)/website/actions.ts`.

## Editor (Phase 4B)

`src/app/dashboard/(gated)/website/StorefrontEditor.tsx` — tabbed form (Content / Theme / Pages / Settings), iframe preview at `{base}/shop/{slug}?draft=1`.

Not in editor: logo upload, gallery upload, testimonials (renderer returns null).

## Public routes

| Route | File |
|-------|------|
| `/shop/[slug]` | Home (section switch) |
| `/shop/[slug]/shop` | Product grid |
| `/shop/[slug]/about`, `/contact` | Static pages |
| `/shop/[slug]/product/[productSlug]` | PDP |
| `/shop/[slug]/menu/*` | Menus |

Commerce checkout stays on `/s/{standSlug}/cart`. Cookies: `vendl_shop_slug`, `vendl_fulfilment_option`.

Subdomain: `middleware.ts` rewrites `{slug}.vendl.app` → `/shop/{slug}`.

## Renderer stack

- `StorefrontShell` — theme CSS vars, nav, fulfilment picker
- `StorefrontHomeContent` — section switch
- `src/lib/storefront/seo.ts` — metadata + canonical via `storefrontPublicUrl()`

## Puck migration map

### Preserve unchanged

- `loadStorefrontContext` publish/draft gate
- `resolveStorefrontBranding()` separate from layout JSON
- Tenancy URLs (`storefrontPublicUrl`, `currentStorefrontBasePath`)
- `/s/*` cart, cookies, fulfilment picker
- Product/category/menu data loaders (live queries, not duplicated in JSON)
- SEO helper (extend for new page types)

### Phase 4B → Puck block mapping

| Phase 4B | Puck block |
|----------|------------|
| `hero` section + scalars | `Hero` |
| `featured_products` + `featuredProductIds` | `FeaturedProducts` |
| `categories` | `CategoryGrid` (later) |
| `about` + scalar `about` | `About` |
| `how_ordering` | `HowOrdering` (later) |
| `pickup_delivery` | `PickupDelivery` (later) |
| `farm_stand` | `FarmStand` (later) |
| `gallery` + `galleryImages` | `Gallery` (later) |
| `contact` | `Contact` (later) |
| `social` | `SocialLinks` (later) |
| `pages.*` toggles | Page model + nav config |
| `themePreset` + `themeOverrides` | Global theme / brand panel |

### Config versioning (8D.2 direction)

```json
{
  "sections": [ "...legacy kept during migration..." ],
  "pages": { "...": "..." },
  "puckSpike": {
    "version": 1,
    "engine": "puck",
    "home": { "content": [], "root": { "props": {} } }
  }
}
```

Additive `puckSpike` key — `parseStorefrontConfig()` ignores unknown fields; public renderer selects engine via `editorVersion` / `engine` field.

### Reversibility

- Do not destructively overwrite `publishedConfig`
- Adapter: `legacyConfigToPuckHome()` for one-time migration
- Public renderer: if `engine === "puck"` use Puck `<Render>`, else Phase 4B switch

### Spike scope (8D.1)

Prove Puck with: Hero, Text, FeaturedProducts, UpcomingMenus, About.

Routes:

- Editor: `/dashboard/website/puck-spike`
- Public preview: `/shop/[slug]/puck-preview?draft=1`
