# Phase 8D.1C — Website Editor UX Reset — Result

**Date:** 2026-09-02  
**Gate status:** `NEEDS REVIEW`  
**8D.1B PASS:** Rejected (unchanged)  
**Phase 9 / Blog / SEO / wider 8D:** Not started  

---

## 1. Root cause — giant green Outline area

Three compounding issues:

| Source | Mechanism |
|--------|-----------|
| **Vendl CSS mistake** | `.vendl-website-editor` mapped Puck tokens `--puck-color-grey-11/12` (canvas + layout inner background) to `var(--field)` — Vendl dark green `#17361f`. Puck paints `PuckLayout-inner` and `PuckCanvas` with these tokens, so the entire editor surround became green. |
| **Puck default plugins** | Puck always mounts `outlinePlugin()` in the left sidebar. On mount, a `useEffect` auto-selects the first plugin, keeping the left sidebar slot alive (`--puck-side-bar-width: 186px`) even when `leftSideBarVisible: false` was set intermittently. |
| **`_experimentalFullScreenCanvas`** | Changed canvas layout/selection behaviour and combined with iframe auto-zoom (`ZOOM_ON_CHANGE`) to shrink the preview. |

The green was **not** the seller's storefront theme — it was editor chrome CSS incorrectly aliasing Puck greys to Vendl brand green.

---

## 2. Root cause — tiny right-hand website strip

| Source | Mechanism |
|--------|-----------|
| **Left sidebar grid slot** | Puck desktop grid: `sidenav \| left sidebar \| editor \| right sidebar`. Hidden via CSS but grid columns still allocated width when plugin mounted. |
| **Iframe + auto-zoom** | Puck iframe preview at fixed 1280px with scale transform to fit remaining narrow editor column → unreadable thumbnail. |
| **`VendlSidebarSync`** | Opened `rightSideBarVisible` on selection, reserving right column for Puck's built-in fields panel. |
| **Settings in Puck sidebar** | `VendlFieldsOverride` rendered inside Puck's right sidebar slot, further compressing canvas. |

---

## 3. Puck APIs / layout mode changed

| Before (8D.1B) | After (8D.1C) |
|----------------|---------------|
| `_experimentalFullScreenCanvas` | **Removed** |
| iframe preview (1280px + zoom) | `iframe={{ enabled: false }}` — direct DOM render, no scale transform |
| Puck right sidebar for fields | `overrides.fields: () => <></>` + fixed `VendlSettingsOverlay` (352px max) |
| Puck left sidebar / outline | Hidden via CSS grid override + `overrides.outline/drawer: () => <></>` + `VendlSidebarSync` forces sidebars closed |
| No storefront chrome in canvas | `overrides.preview` wraps content in `StorefrontEditorShell` (nav, theme vars, footer) |

---

## 4. Experimental full-screen canvas

**Removed.** Audit concluded it contributed to broken composition without benefit once iframe was disabled and custom shell added.

---

## 5. New editor shell

- **Top bar:** white, neutral — Home label, Desktop/Tablet/Mobile toggles, Preview / Save / Publish. Undo/Redo and Sections list moved to **⋯ overflow menu** (secondary).
- **Canvas area:** `#f5f5f4` neutral surround; website frame centred with light shadow.
- **No permanent instructional banner** inside editor (removed from `PuckSpikeEditor.tsx`).
- **First-use onboarding:** dismissible bottom hint (`VendlEditorOnboarding`), localStorage keyed.

---

## 6. Canvas width behaviour

- Desktop default: 1280px max-width centred frame (`VendlEditorPreview`).
- Tablet: 768px centred frame.
- Mobile: 375px centred frame.
- Editor grid forced to `0 0 1fr 0` — editor column consumes ~100% width below header.
- No hidden panel width allocation.
- Settings overlay is `position: fixed` — does not shrink grid.

**Expected desktop canvas share:** ~85–95% of content area below header (website + neutral margin). Visual confirmation required via screenshot.

---

## 7. Outline / Sections behaviour

- **Outline:** permanently hidden; override returns empty fragment; CSS hides nav + sidebars.
- **Sections list:** optional panel via ⋯ menu only; closed by default.
- Primary workflow: click section → overlay settings; `+ Add section` on selected section.

---

## 8. Section hover / selection UX

- Hover: dashed outline (`.is-hover`).
- Selected: solid outline + floating action bar (move, duplicate, delete).
- `+ Add section` pill below selected section.

---

## 9. Settings drawer behaviour

- Fixed overlay (`VendlSettingsOverlay`), max 22rem (~352px) on desktop.
- Backdrop click or Done closes; canvas remains full width underneath.
- Mobile: bottom sheet (85vh max) via CSS media query.

---

## 10. Add Section behaviour

Unchanged from 8D.1B — modal chooser with placement rules; singleton sections blocked.

---

## 11. Header / Footer rendering

- **Editor canvas:** `StorefrontEditorShell` — real `StorefrontNav`, theme CSS vars, simple footer.
- **Public preview:** existing `StorefrontShell` (unchanged).

---

## 12. WYSIWYG storefront fidelity

**Partial improvement.** Nav/footer/theme now match public storefront in editor. Block components remain Puck spike blocks (simplified Hero/Products/Menus) — not yet swapped to every public server component. Further fidelity work possible without blocking this gate.

---

## 13. Starter data / reset approach

- `buildStarterHome()` — business-mode-aware starter (Hero, optional UpcomingMenus, FeaturedProducts, About, optional farm-stand Text).
- `sanitiseEditorHome()` + `normaliseSingletons()` on load — removes duplicate singleton sections from polluted drafts.
- Dev-only `resetPuckSpikeDraft` server action + link in editor (non-destructive to published config).

---

## 14–17. Screenshots

**Not captured in this session.** Manual verification required at:

- Desktop (1280)
- Laptop (~1440 viewport)
- Tablet (768)
- Mobile (375)

Route: `/dashboard/website/puck-spike`  
Dev reset available if draft data is polluted.

---

## 18. Placement-rule regression

Existing `placement-rules.test.ts` unchanged. New `starter-home.test.ts` covers singleton dedup.

---

## 19. Puck mutation / storage tests

Existing `spike.test.ts` unchanged. Storage merge logic unchanged.

---

## 20. TypeScript

`npx tsc --noEmit` — **pass**

---

## 21. Full build

`npm run build` — **pass**

---

## 22. Remaining limitations

1. Screenshots not attached — gate cannot be PASS until visual review.
2. Puck blocks ≠ 100% public component parity (Hero uses spike block, not `StorefrontHero`).
3. Puck still loads default plugins internally; prevented via CSS/overrides rather than custom `Puck` children composition.
4. `Home ▼` page switcher not implemented (single home page in spike).
5. Manual 16-step flow (spec §36) not executed in this session.

---

## 23. Gate status

**`NEEDS REVIEW`**

Implementation addresses identified root causes. Visual acceptance criteria require human screenshot review and manual flow walkthrough.

---

## 24. Git status

Uncommitted working tree (per instruction: no commit). Puck-related new/modified files include:

- `src/app/dashboard/(gated)/website/puck-spike/*`
- `src/components/puck/editor/*` (StorefrontEditorShell, VendlEditorPreview, VendlSettingsOverlay, VendlEditorOnboarding, header/sidebar updates)
- `src/lib/puck/starter-home.ts`, `starter-home.test.ts`
- `src/app/globals.css` (editor chrome reset)
- `src/lib/puck/types.ts`, `build-metadata.ts`, `spike-defaults.ts`

---

## Acceptance questions (pending visual review)

1. *Would a seller immediately understand they are looking at their website?* — **Expected yes** after fix; needs screenshot confirmation.
2. *Is the website unquestionably dominant on screen?* — **Expected yes**; needs screenshot confirmation.

---

## Next steps for reviewer

1. Open `/dashboard/website/puck-spike` on desktop.
2. If draft looks polluted, click **Reset draft to starter layout (dev only)**.
3. Confirm: no green panels, full-width website, nav visible, readable text.
4. Click Hero → edit headline → Done.
5. Walk spec §36 manual flow.
6. Capture desktop/laptop/tablet/mobile screenshots.
7. Upgrade gate to PASS only if all visual criteria met.
