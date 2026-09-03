# Phase 8D.2 — Website Studio (Craft.js + Templates)

**Status:** NEEDS REVIEW (visual QA + screenshots pending)  
**Date:** 2026-09-02  
**Commit:** none (per spec)

---

## Summary

Phase 8D.2 implements the production **Website Studio** on Craft.js with three templates (Artisan, Farmhouse, Market), a three-column editor (section palette | canvas | settings), server-side public rendering without Craft on the storefront, and versioned `websiteStudio` v2 storage alongside untouched Puck/craft-spike data.

---

## 1. Architecture

| Layer | Implementation |
|-------|----------------|
| Editor mechanics | `@craftjs/core@0.2.12` (client-only, dynamic import) |
| Product UI | Vendl-built palette, toolbar, settings panel — no Craft/Puck chrome |
| Commerce data | Resolved at render via `buildStudioMetadata()` — not stored in Craft JSON |
| Public site | `StudioPublicSections` in `src/lib/studio/public-render.tsx` — no Craft bundle |
| Storage | `draftConfig.websiteStudio: { version: 2, engine: "craft", templateId, nodes }` |
| Legacy | `craftSpike` v1 read-only fallback via `extractStudioFromDraft()` |
| Puck | Unchanged — spike routes/data preserved |

---

## 2. Section registry

**Implemented (8D.2C core):** Hero, Products, Categories, Next Drop, Text, Image, Image + Text, About

**Deferred:** Reviews, Pickup/Delivery, Subscriber Signup, Gallery, Farm Stand (8D.2E / later)

Registry: `src/lib/studio/section-registry.ts` — categories (Sell / Content / Trust), singleton/required rules, business-mode gating for Next Drop.

---

## 3. Composition schema

- `STUDIO_VERSION = 2`
- Validated by `validateStudioNodes()` against `STUDIO_RESOLVER_NAMES`
- Template-specific starters: `buildStudioStarterTree()` in `starter-composition.tsx`

---

## 4. Public renderer

- `src/lib/studio/public-render.tsx` walks serialized nodes server-side
- Maps section props → shared block components (`PuckHeroBlock`, `StudioTextBlock`, etc.)
- Preview route: `/shop/[slug]/studio-preview?draft=1`
- **Proof:** preview page imports only `StudioPublicSections` — no `@craftjs/core` on public route

---

## 5. Editor shell (8D.2B)

| Feature | Status |
|---------|--------|
| Top toolbar (viewport, undo/redo, save, publish, preview) | ✅ |
| Left section palette (~240px, collapsible) | ✅ |
| Drag-from-palette (`connectors.create`) | ✅ |
| Click-to-add fallback | ✅ |
| Canvas with real `StorefrontEditorShell` | ✅ |
| Right settings panel (when selected) | ✅ |
| Section reorder / duplicate / delete chrome | ✅ (via `CraftSectionChrome` + studio registry) |
| Add-section modal (gap/footer) | ✅ |

**Routes:**
- Editor: `/dashboard/website/studio`
- Templates: `/dashboard/website/studio/templates`
- Reference spike (unchanged): `/dashboard/website/craft-spike`

---

## 6. Templates (8D.2D)

| Template | Default audience | Theme preset | Starter homepage order |
|----------|------------------|--------------|------------------------|
| Artisan | FOOD_BUSINESS | modern | Hero → Next Drop → Products → About |
| Farmhouse | FARM_STAND / BOTH | farmhouse | Hero → Products → Categories → About |
| Market | Commerce-first | market | Hero → Products → Categories → Next Drop → About |

Definitions + CSS tokens: `src/lib/studio/templates.ts`  
Template switching preserves composition; updates `templateId` in storage.

**Template differentiation gate:** CSS custom properties + class hooks (`studio-template-*`) applied to canvas and public preview. **Visual review required** — automated tests cannot confirm differentiation beyond tokens.

---

## 7. Draft / publish

- `saveWebsiteStudioDraft` / `publishWebsiteStudioDraft` in `studio/actions.ts`
- Publish copies full `draftConfig` (including `websiteStudio`) via existing `publishStorefront()`

---

## 8. Tests

```
npx tsx --test src/lib/studio/studio.test.ts src/lib/craft/craft.test.ts
```

Covers: storage extract/merge, legacy fallback, singleton rules, business-mode gating, validation.

---

## 9. Build / TypeScript

```
npx tsc --noEmit   ✅
npm run build      ✅
```

---

## 10. Screenshots (required — not captured in this session)

| Item | Path / action |
|------|----------------|
| Artisan desktop homepage | `/shop/{slug}/studio-preview?draft=1` after save with artisan template |
| Artisan mobile | same, mobile viewport |
| Farmhouse desktop/mobile | switch template, save, preview |
| Market desktop/mobile | switch template, save, preview |
| Editor with palette | `/dashboard/website/studio` |
| Section selected + settings | click section in editor |
| Template chooser | `/dashboard/website/studio/templates` |
| Draft preview | Preview button in toolbar |

---

## 11. Visual acceptance (manual gate)

Per spec §75–77 — **cannot self-declare pass** without screenshots:

- [ ] Professional default homepage per template
- [ ] Templates visibly differ beyond colour
- [ ] Palette instantly understandable
- [ ] Product cards production quality
- [ ] No Craft/Puck visual identity in editor

---

## 12. Intentionally deferred

- 8D.2E dynamic commerce templates (Shop, Product, Category, Menu pages)
- Reviews, Pickup/Delivery, Signup, Gallery, Farm Stand sections
- Blog, Custom Pages, SEO dashboard
- Replacing legacy `/dashboard/website` JSON editor as default
- Removing Puck spike
- Phase 9

---

## 13. Git status

Uncommitted working tree. **No commit, push, merge, or deploy** (per spec).

PayPal WIP untouched.

---

## Recommendation

**NEEDS REVIEW** — Core architecture, editor shell, core sections, templates, public renderer, and build are in place. Proceed to visual QA with real seller fixtures and capture required screenshots before accepting 8D.2 or starting 8D.2E.
