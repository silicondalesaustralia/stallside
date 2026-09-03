# Phase 8D.1D — Craft.js Website Editor Spike — Result

**Date:** 2026-09-02  
**Recommendation:** `NEEDS MORE EVIDENCE`  
**Gate:** Spike complete for engineering review; visual/manual acceptance pending  

---

## 1. Package / license

| Item | Value |
|------|-------|
| Package | `@craftjs/core@0.2.12` (+ `@craftjs/utils` transitive) |
| Source | [prevwong/craft.js](https://github.com/prevwong/craft.js) (MIT) |
| Paid SDK | None |

---

## 2. Stack compatibility audit

| Item | Version / status |
|------|----------------|
| Next.js | 16.2.10 — **compatible** (App Router, dynamic `ssr: false` editor) |
| React | 19.2.4 — **compatible** (peer `^19`; ref callback pattern required) |
| TypeScript | ^5 — **pass** |
| Turbopack dev | Used via `next dev` — editor loads client-only |
| Production build | **pass** |

Craft mounts in dashboard at `/dashboard/website/craft-spike`. Puck spike unchanged at `/dashboard/website/puck-spike`.

---

## 3. Architecture

```
Dashboard (server) → CraftSpikeEditor (dynamic client)
  → CraftEditorInner
    → <Editor resolver={Vendl sections}>
        → Vendl top bar (viewport, undo/redo, save/publish)
        → StorefrontEditorShell (nav, theme, footer — not Craft nodes)
        → <Frame data={serialized | starter tree}>
        → Vendl settings overlay (no Craft stock UI)
        → Vendl Add Section modal

Public preview /shop/[slug]/craft-preview?draft=1
  → StorefrontShell (server)
  → CraftPublicRenderer (<Editor enabled={false}><Frame data={nodes} /></Editor>)
```

**Craft stores:** section type + configuration props only.  
**Vendl resolves at render:** products, categories, menus, branding via shared metadata.

**Storage:** additive `craftSpike: { version: 1, engine: "craft", nodes }` in `draftConfig` — Puck data and legacy config preserved.

---

## 4. Craft APIs used

- `<Editor>` / `<Frame>` / `<Element canvas>`
- `useNode`, `useEditor`, `ROOT_NODE`
- `actions.setProp`, `addNodeTree`, `move`, `delete`, `selectNode`
- `query.serialize()`, `parseReactElement()`, history undo/redo
- Component `.craft` rules (canvas whitelist, singleton drag rules)

**Not used:** Craft Layers, stock settings/blocks/outline UI.

---

## 5. Vendl sections

Hero, Product Grid, Next Drop, About — each wraps existing Puck spike blocks with live commerce metadata.

---

## 6. Editor shell

Neutral chrome, website-first canvas, Vendl settings drawer, Vendl Add Section, hover/selection affordances, real nav/footer shell.

---

## 7. Public rendering / SSR

Spike preview uses `<Editor enabled={false}>`. **Production should render validated JSON via Vendl section components on the server (no Craft on public site).** Same architectural note as Puck RSC render path.

---

## 8. Tests / build

- `src/lib/craft/craft.test.ts` — storage, registry, validation
- `tsc` — pass
- `npm run build` — pass

---

## 9. Puck vs Craft (overall)

| | Puck | Craft |
|---|------|-------|
| Stock UI to fight | Low | High |
| Website-first UX | Improved in 8D.1C, still coupled | Natural fit |
| Public RSC render | `<Render>` built-in | Custom SSR path needed |
| **Overall fit (spike)** | 3/5 | 4/5 |

---

## 10. Recommendation: `NEEDS MORE EVIDENCE`

Complete manual flow + screenshots on both spikes before `SWITCH TO CRAFT.JS` or `KEEP PUCK`.

---

## 11. Routes

- `/dashboard/website/craft-spike` — Craft editor
- `/shop/[slug]/craft-preview?draft=1` — preview without editor chrome
- `/dashboard/website/puck-spike` — Puck comparison (unchanged)

**No commit. STOP — await framework decision.**
