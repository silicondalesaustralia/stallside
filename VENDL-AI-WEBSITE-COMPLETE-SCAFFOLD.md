# Vendl AI Website Builder — Complete Scaffold from Scratch

**Status:** Product / architecture proposal — revision 2  
**Date:** 10 September 2026  
**Depends on:** Phase 8D AI-first website builder (AI plans within Vendl; Craft + SSR remain)

---

## Revision notes

Revision 2 closes the gaps found in review of revision 1.

| Gap in revision 1 | Resolution | Section |
|---|---|---|
| Placeholders could reach the live site | Placeholder registry covering copy, images, logo, samples, setup stubs and policy variables; server-enforced publish check | 6, 8 |
| Seller-facing stubs had no public rendering | Every capability section has separate editor and visitor rendering; setup CTAs are editor-only | 5.5 |
| Policy templates could invent terms | AI never writes policy text; unresolved variables stay visibly unfilled and the page stays unpublished | 5.6 |
| Schema validation can't catch invented claims in prose | Claims validation on all AI-written text, including patches, with a no-escalation rule | 5.7 |
| Sample products approach undecided | Non-commerce, editor-only presentation mode; no catalogue entries | 5.8 |
| Capability sync only handled additions | Sync covers enable, disable, emptied data and cleared settings | 9 |
| `missingInformation` depended on the model | Computed deterministically; Astra only adds suggestions | 5.9 |
| Inconsistent question caps, no capability defaults, unclear fast path, permanent-feeling AI logo | Single question table, defaults column, site-shape behaviour per readiness, typographic placeholder logo | 4.3, 4.5, 5.1, 5.4 |
| Acceptance only tested the happy path | Guardrail and sync tests added | 13 |

---

## 1. Goal

A new or sparse seller should be able to get a **complete-feeling draft website** even when they have:

- no products
- no About copy
- no brand colours chosen
- no hero / logo photos
- no menus, subscriptions, or forms configured yet

The draft should show **structure, usefulness, and visual direction**, then let them refine with prompts and replace placeholders with real Vendl data over time.

Core principles:

> **Vendl already knows your business when it can. When it can't, scaffold honestly — never invent commerce facts.**
>
> **Nothing a visitor sees is invented, and nothing meant for the seller reaches a visitor.**

---

## 2. What "complete" means

### In scope for generation

- Homepage composition (5–10 sections)
- Chosen AI-composable content pages (About, Contact, FAQ)
- Navigation reflecting those pages, with capability-bound items
- Design system selection (Artisan / Farmhouse / Market) from "feel"
- Placeholder copy that is either clearly generic or clearly addressed to the seller (5.4)
- Optional **decorative** AI images (hero mood, story atmosphere) and a typographic placeholder logo
- Capability sections bound to Vendl data, with editor-only setup stubs and defined visitor rendering (5.5)
- Policy pages from Vendl-owned templates, filled only from Vendl settings (5.6)
- Optional editor-only sample product cards (5.8)

### Out of scope

- Sellable fake products, or catalogue entries of any kind for samples
- Fabricated opening hours, delivery areas, certifications, reviews, awards, heritage
- Auto-creating live Stripe subscription offers, menus, or custom order forms without seller setup
- AI-written or AI-edited legal / policy text
- Seller-facing setup prompts visible to site visitors
- Any placeholder reaching the live site without passing the publish check
- Arbitrary CSS / React / new unsupported components

Commerce capabilities checked in intake become **site structure + bindings + empty states**, then light up when configured in Vendl.

---

## 3. End-to-end flow

```text
CREATE MY WEBSITE
        │
        ▼
1. SHOW WHAT VENDL KNOWS
   (may be almost empty for new accounts)
        │
        ▼
2. WHAT SHOULD WE FOCUS ON?
   [ Let Vendl decide ]
        │
        ▼
3. HOW SHOULD IT FEEL?
   [ Let Vendl decide ]
        │
        ▼
4. WHAT SHOULD THIS SITE INCLUDE?
   Pages + selling capabilities, pre-filled by readiness
   (expanded for SPARSE, collapsed or skipped otherwise — see 4.3)
        │
        ▼
5. OPTIONAL PLACEHOLDERS
   Decorative images; sample cards only when relevant (4.6)
        │
        ▼
6. ANYTHING ELSE? (optional free text)
        │
        ▼
7. CONTEXT CHECK
   0–2 questions from a fixed bank, capped by readiness (5.1)
        │
        ▼
8. ASTRA BUILDS DRAFT
   WebsiteAISpecV1 → structural validation → claims validation
   → compile to websiteStudio nodes + pageNodes
   → reconcile placeholder registry → compute missing info
   → draft saved
        │
        ▼
9. PREVIEW
   Visitor view (default) / Editor view
        │
        ▼
10. PUBLISH CHECK
    Must fix · Review · Not live yet   (server-enforced)
        │
        ▼
11. PUBLISH
        │
        ▼
12. ASK VENDL AI
    Conversational patches on the draft
    (same validation, registry reconciliation and publish check)
```

Fast paths:

```text
READY:          Let Vendl decide → Build my website
NEEDS_CONTEXT:  Let Vendl decide (focus) → Let Vendl decide (feel) → Build my website
SPARSE:         Let Vendl decide (focus) → Let Vendl decide (feel)
                → pre-filled site shape → Build my website
```

"Build my website" is available from step 4 onward. Skipping the remaining steps uses their defaults; the context check still runs if its trigger conditions are met (5.1), and every question has a Skip option.

---

## 4. Intake UI

### 4.1 Known context panel

Always show what Vendl already has:

```text
We'll build using:
✓ Your products          (if any)
✓ Farm stand             (if mode supports)
… or …
We don't have much yet — pick what to include below.
```

Link corrections to authoritative settings (Details, Products, Fulfilment). The builder never duplicates commerce setup.

### 4.2 Focus + feel

- Focus: Let Vendl decide / Farm stand / Preorders / Shop / Story… (context-aware)
- Feel: Warm & local / Premium & handcrafted / Clean & modern / Bold & energetic  
  → mapped internally to Farmhouse / Artisan / Market

"Let Vendl decide" applies to focus and feel only. It never skips site shape for SPARSE sellers; it pre-fills it.

### 4.3 Site shape behaviour by readiness

Readiness bands are as defined in Phase 8D.

| Readiness | Site shape step | Defaults come from |
|---|---|---|
| READY | Skipped; "Customise pages" link on the build screen | Live Vendl configuration |
| NEEDS_CONTEXT | Collapsed summary (e.g. "Home, About, Shop, Contact, FAQ + policies") with Edit | Live configuration, sparse defaults for gaps |
| SPARSE | Expanded, pre-filled checkboxes; "Build my website" on this step | Sparse defaults (4.4, 4.5) |

Seller can add, remove or unpublish pages and sections later.

### 4.4 Site shape — website pages

"Paid capability" = SHOP, MENUS_PREORDERS, SUBSCRIPTIONS or CUSTOM_ORDER_FORMS.

| Page | Default (SPARSE) | Written by | Visitor view when empty or unresolved |
|---|---|---|---|
| Home | Always on | Astra | — |
| About | On | Astra | Published; instructional placeholder copy must be fixed before publish (8) |
| Contact | On | Astra + Vendl contact data | Hidden until a contact method exists in Details; never invents address, phone or hours |
| FAQ | On | Astra | Answers grounded in Vendl data or seller text; otherwise placeholder answers |
| Shop | On if SHOP checked | System | Not in nav until ≥1 live product; route shows neutral page, noindex |
| Farm stand | On if mode is FARM_STAND / BOTH | System | Uses real stand data; hidden if none |
| Reviews | Selectable only with ≥1 real review ("Available once you have reviews") | System | Suppressed if reviews drop to zero; no "coming soon" option |
| Blog | Off | System index | Not in nav until first post; no AI auto-posts |
| Privacy policy | On | Policy template (5.6) | Unpublished until variables resolve |
| Terms | On if any paid capability checked | Policy template | Unpublished until variables resolve |
| Refund policy | On if any paid capability checked | Policy template | Unpublished until variables resolve |
| Delivery policy | On only if DELIVERY checked | Policy template | Unpublished until variables resolve |

### 4.5 Site shape — selling capabilities

Checkboxes for **capabilities Vendl offers**, not "create live entities now". Checking a capability never creates pickup windows, fees, prices, forms or subscription plans.

| Capability | Default (SPARSE) | Default (READY / NEEDS_CONTEXT) | Draft behaviour |
|---|---|---|---|
| SHOP | On | On if products exist or shop enabled | Product grid bound to `FEATURED_PRODUCTS`; Shop nav item |
| MENUS_PREORDERS | On if focus = Preorders | On if menus configured | Next Drop section bound to `NEXT_DROP` |
| SUBSCRIPTIONS | Off | On if subscriptions configured | Subscriptions section bound to `SUBSCRIPTION_PLANS` |
| CUSTOM_ORDER_FORMS | Off | On if forms configured | Form section bound to `ORDER_FORM` |
| PICKUP | On if mode is FARM_STAND / BOTH | On if pickup options exist | Pickup section bound to `PICKUP_OPTIONS` |
| DELIVERY | Off | On if delivery configured | Delivery section bound to `DELIVERY_ZONES` |
| EVENTS | Off | On if upcoming events exist | Events section bound to `UPCOMING_EVENTS` |
| NEWSLETTER | On | On | Signup section bound to `SIGNUP_DESTINATION` |

Editor and visitor rendering for each capability state is defined in 5.5. Data source names other than `FEATURED_PRODUCTS` and `NEXT_DROP` are proposed (10).

### 4.6 Placeholder options

```text
[ ] Use AI decorative images as placeholders
    Mood images for the hero and story sections, plus a simple
    text logo made from your business name. Replace or keep anytime.

[ ] Show sample product cards while you add products
    Editor only — samples can't be sold and are never shown to visitors.
```

Rules:

- **Decorative images:** offered to everyone, default off. For SPARSE sellers with no brand photos, show a nudge ("Your draft will look emptier without images") but leave the box unticked.
- **Sample product cards:** shown only when SHOP is checked and the catalogue is empty. Default off.

### 4.7 Optional free text

```text
Anything you'd like us to know?
```

Direction only — still bound by page, component and factual guardrails. Free text and context answers are the seller-text sources that claims validation accepts (5.7).

---

## 5. Generation behaviour

### 5.1 Path selection and question caps

| Readiness | Intake | Site shape | Context questions (max) |
|---|---|---|---|
| READY | Focus + feel (single "Let Vendl decide") | Skipped, derived | 0 |
| NEEDS_CONTEXT | Focus + feel + optional free text; soft photo skip | Collapsed summary | 1 |
| SPARSE | Focus + feel + site shape + placeholders + free text | Expanded | 2 |

The context check can only ask questions from this bank, in priority order:

| ID | Question | Asked when |
|---|---|---|
| STORY | "In a sentence or two, what do you make or grow?" | No About, no products, no free text |
| AREA | "Which suburb or region do most of your customers come from?" | PICKUP, DELIVERY or farm stand selected, and no address in Details |

Answers are stored as `contextAnswers` and count as seller text for claims validation. AREA answers are used in copy only; they never create delivery zones or imply that delivery is offered.

### 5.2 Astra (GPT-6 Astra) responsibilities

Given `WebsiteBusinessContext` + `WebsiteGenerationIntent`:

1. Choose design system from feel + mode
2. Compose HOME within complexity budgets
3. Compose checked AI-composable pages (About, Contact, FAQ) — never policy pages
4. Wire nav to valid routes only; capability page nav items carry their capability binding
5. Bind capability sections to data sources instead of writing volatile facts into copy
6. Mark every placeholder copy field as `INSTRUCTIONAL` or `GENERIC`
7. Annotate claim-bearing sentences with source references (used as a hint only; 5.7)
8. Return optional `suggestions` (5.9) — never `missingInformation`
9. Return structured `WebsiteAISpecV1` only

### 5.3 Validation and compile pipeline

```text
WebsiteAISpecV1 (from Astra)
   │
   ├─ 1. Structural validation
   │     schema, allowed components, valid routes, complexity budgets,
   │     selected pages/capabilities respected, no policy page content
   │
   ├─ 2. Claims validation (5.7)
   │     unsupported claim → one targeted regeneration → placeholder fallback
   │
   ├─ 3. Compile
   │     websiteStudio Craft nodes + pageNodes, capability bindings,
   │     node visibility, placeholder markers
   │
   ├─ 4. Reconcile placeholder registry (6)
   │
   └─ 5. Compute missing information (5.9) → save draft
```

If structural validation still fails after one retry, the builder falls back to a template composition for the chosen design system with the same selections. The seller never sees a failed generation.

### 5.4 Placeholder content rules

**Copy**

| Kind | Example | Allowed | Publish check |
|---|---|---|---|
| `INSTRUCTIONAL` | "Tell customers what you grow or bake…" | Yes; addressed to the seller and visually marked in the editor | Must fix |
| `GENERIC` | "Welcome to {businessName}." / "Questions? Get in touch." | Yes; must pass claims validation | Review |
| Paraphrase of seller text | "Sourdough and seasonal bakes from {businessName}" (from "we bake sourdough and seasonal stuff") | Yes; no escalation (5.7) | Not a placeholder |
| Invented facts | Heritage, certifications, awards, reviews, hours | Never | — |

Every placeholder sentence must either read correctly to a visitor (`GENERIC`) or be clearly addressed to the seller (`INSTRUCTIONAL`). Nothing in between that could pass as a real business fact.

**Images**

| Asset | AI placeholders ON | OFF |
|---|---|---|
| Hero | Decorative generated image (`IMAGE_DECORATIVE`) | Design-system template treatment |
| Story | Decorative mood image (`IMAGE_DECORATIVE`) | Section renders without an image |
| Logo | Typographic wordmark from business name (`LOGO_MARK`) | Plain text logo from business name (not a placeholder) |
| Product photos | Only on sample cards, which are editor-only (5.8) | Empty product card treatment |

Decorative image rules:

- Prompt built only from design system, business category and seller text; never names products the seller hasn't mentioned
- Prefer environmental and textural subjects (light, surfaces, fields, kitchen textures) over specific products
- No people, legible text, logos or identifiable real places
- Alt text is neutral and descriptive ("Morning light across a wooden bench"), never possessive ("Our farm")

Placeholder logo rules:

- Typographic only (business name set in design-system type) — no symbols, which avoids resemblance to existing marks
- Site-scoped placeholder; never written to business Details, emails, invoices or payment descriptors
- Editor shows a **Placeholder logo** badge with two actions: **Upload logo** or **Keep as my logo** (clears placeholder status and, with explicit consent, saves to Details)

### 5.5 Capability sections: editor vs visitor rendering

Every capability-bound section has an editor rendering and a visitor rendering. Setup CTAs are `EDITOR_ONLY` nodes, and the SSR renderer drops them for visitors regardless of what the draft contains.

Capability states (computed from Vendl data at render time):

- `UNCONFIGURED` — checked in site shape but not set up in Vendl
- `CONFIGURED_EMPTY` — set up, but no current data (no products, no upcoming drop, no events)
- `LIVE` — data exists and renders

When a section isn't `LIVE`, visitors see either `HIDE` (default) or `COMING_SOON` (seller opt-in per section, where allowed).

| Capability | Editor stub (UNCONFIGURED) | Visitor view when not LIVE | COMING_SOON allowed | Nav item |
|---|---|---|---|---|
| SHOP | "Add your first product" | Grid hidden; `/shop` unlinked neutral page, noindex | Yes — "Products coming soon" | Hidden until LIVE |
| MENUS_PREORDERS | "Set up weekly menus" | Hidden | Yes — "Preorders opening soon" | Hidden until LIVE |
| SUBSCRIPTIONS | "Set up subscriptions" | Hidden | Yes — "Subscriptions coming soon" | Hidden until LIVE |
| CUSTOM_ORDER_FORMS | "Create an order form" | Hidden | No | Hidden until LIVE |
| PICKUP | "Add pickup options" | Hidden | No | — |
| DELIVERY | "Enable delivery" | Hidden | No — never imply delivery | — |
| EVENTS | "Add an event" | Hidden | Yes — "Events coming soon" | Hidden until LIVE |
| NEWSLETTER | "Choose where signups go" | Hidden | No | — |

Coming-soon text is fixed system copy per capability. It is not AI-written and contains no dates, prices or promises.

Preview opens in **Visitor view**. **Editor view** additionally shows stubs, sample cards and unresolved policy tokens.

### 5.6 Legal and policy pages

Rules:

1. **Astra never writes, edits or paraphrases policy text.** Policy pages are Vendl-owned system templates, with wording reviewed by counsel for each launch market. Conversational requests to change them are declined with a link to the setting that controls them.
2. **Variables resolve only from Vendl settings.** No defaults, no inferred values, no "typical" terms.
3. **Unresolved variables stay visibly unfilled** in the editor as highlighted tokens, e.g. `[Refund window — set in Fulfilment → Refunds]`.
4. **A page with any unresolved variable is `NEEDS_SETUP`:** it isn't published, its footer link is hidden, and it appears under "Not live yet" in the publish check.
5. **Checkout-required policies:** if the site being published would let a visitor pay (any paid capability is `LIVE`), Privacy policy, Terms and Refund policy must be resolved, plus Delivery policy if DELIVERY is `LIVE`. Otherwise publish is blocked. Confirm this required set with counsel for each launch market.

| Page | Included when | Variables (authoritative setting) |
|---|---|---|
| Privacy policy | Always | Business name, contact email (Details); account country (Account) |
| Terms | Any paid capability checked | Business name, contact email (Details); account country (Account) |
| Refund policy | Any paid capability checked | Refund window, perishable goods handling, refund contact method (Fulfilment → Refunds) |
| Delivery policy | DELIVERY checked | Delivery areas, fees, timeframes (Fulfilment → Delivery) |

If Fulfilment doesn't yet have refund settings, add them there (the authoritative place) rather than in the builder.

### 5.7 Claims validation

Applies to **all AI-written text**: generated pages, generic placeholder copy, image alt text, SEO titles and descriptions, and every conversational patch. It doesn't apply to text the seller types manually in Craft.

**Claim categories**

| Category | Examples |
|---|---|
| Heritage & history | "since 1982", "third-generation", "family-run", "established" |
| Certifications, dietary & safety | organic, certified, spray-free, free-range, grass-fed, halal, kosher, gluten-free |
| Process & provenance | handmade, small-batch, artisan, local, locally sourced, wood-fired |
| Awards & rankings | award-winning, "best in", #1, voted, "as featured in" |
| Social proof | testimonials, quotes attributed to customers, star ratings, "customers love", customer counts |
| Commerce facts | prices, discounts, stock, hours, pickup times, delivery areas, fees, "free delivery", lead times |
| Quantities | any number or statistic not taken from Vendl data |

**Pipeline**

1. **Hint:** Astra annotates claim-bearing sentences with `claimSources`. These are never trusted on their own.
2. **Extraction**, independent of Astra's annotations:
   - a deterministic lexicon and pattern pass (years, numbers, currency, time ranges, category terms)
   - a separate classifier model call that lists every factual claim in the text as typed items
3. **Matching:** each extracted claim must be supported by one of:
   - `VENDL_DATA` — a field in `WebsiteBusinessContext` that contains the claim (a product named "Organic Apple Butter" supports "organic apple butter", not "organic produce")
   - `SELLER_TEXT` — `sellerNotes`, `sellerAbout` or `contextAnswers` stating the same claim
   - `SELLER_ASSERTED` — the seller stating the claim in a conversational prompt
4. **No escalation:** a claim may restate or narrow what the source says, never broaden or strengthen it.
5. **Resolution:** an unsupported claim triggers one targeted regeneration of that field, listing the violations. If it still fails, the field is replaced with `INSTRUCTIONAL` placeholder copy and the violation is logged for prompt tuning.

**No-escalation examples**

| Seller wrote | Acceptable | Rejected |
|---|---|---|
| "we bake sourdough" | "Sourdough, baked by {businessName}" | "Award-winning artisan sourdough" |
| "my grandparents planted the orchard" | "An orchard first planted by our grandparents" | "Three generations of growers since 1950" |
| "we mostly don't spray" | "We mostly don't spray" | "Organic", "spray-free", "chemical-free" |
| "people seem to love our jam" | "People seem to love our jam" (seller's own voice) | "★★★★★ 'Best jam in town' — Sarah" |
| Prompt: "Say we're certified organic" | Added where requested, recorded as `SELLER_ASSERTED` | Astra adding the claim anywhere else unprompted |

Seller-asserted claims are recorded with a reference to the prompt, so the seller can review them. Vendl doesn't verify them, but Astra never originates them.

### 5.8 Sample products

**Decision:** non-commerce presentation mode only. No catalogue entries are ever created for samples.

- Product grid sections support `productPresentation: "LIVE" | "SAMPLE"`.
- Sample cards live in section props only: a generic "Your product" name, a placeholder image watermarked **Sample**, no price field, no product ID, no add-to-cart.
- `SAMPLE` presentation is editor-only. Visitors see the section's normal not-LIVE rendering (5.5), so samples can never reach checkout, search, sitemap, structured data, feeds, analytics or SEO metadata.
- Editor label: **Sample — replace with your products**.
- When the first real product exists, the editor prompts: "You've added products — show them in this section?" Accepting applies a patch that sets `productPresentation: "LIVE"` and removes the sample props.
- The publish check lists sample sections under **Review**, so the seller knows visitors won't see them.

### 5.9 Missing information and suggestions

`missingInformation` is computed by the application, not the model:

```ts
computeMissingInformation(
  context: WebsiteBusinessContext,
  intent: WebsiteGenerationIntent,
  draft: WebsiteDraft
): MissingInfoItem[]
```

It derives items from:

- business context gaps (no products, no About, no brand photos, no contact method)
- capabilities checked but `UNCONFIGURED`
- unresolved policy variables
- open placeholders in the registry

It is recomputed on every draft save and whenever relevant Vendl settings change.

Astra returns `suggestions` only: content or design ideas such as "Add a seasonal highlights section". The validator drops any suggestion that asserts something is present or missing, and any suggestion that duplicates a missing-information item.

The post-generation summary shows missing-information items first (ordered by severity, max 4), then at most 2 suggestions.

---

## 6. Placeholder registry

The node tree is the source of truth; the registry is an index over it.

- Every compiled node that contains placeholder content carries `custom.placeholderRefs`.
- On every draft save, patch and publish request, the server reconciles the registry against the node tree:
  - placeholder prop value changed → `REPLACED`
  - node deleted → usage removed; no usages left → `REMOVED`
  - seller clicks **Keep** (REVIEW kinds only) → `ACCEPTED`
- Replace actions, in the editor or in chat ("use this photo as my hero"), resolve by placeholder ID, so nobody has to hunt for URLs or nodes.

| Kind | Created by | Publish severity | Resolved by |
|---|---|---|---|
| `COPY_INSTRUCTIONAL` | Astra; claims fallback | MUST_FIX | Edit or remove |
| `COPY_GENERIC` | Astra | REVIEW | Edit, remove or keep |
| `IMAGE_DECORATIVE` | Image generation | REVIEW | Replace, remove or keep |
| `LOGO_MARK` | Wordmark generation | REVIEW | Upload logo or keep as my logo |
| `SAMPLE_PRODUCTS` | Sample option | REVIEW | Add products and switch to LIVE, or remove samples |
| `SETUP_STUB` | Compiler (capability or contact method) | NOT_LIVE | Set up in Vendl, or remove section |
| `POLICY_VARIABLE` | Policy template | NOT_LIVE; MUST_FIX when checkout-required (5.6) | Set in Vendl settings |

Severity for `POLICY_VARIABLE` is computed at check time, because it depends on whether any paid capability is `LIVE`.

---

## 7. After generation

```text
✓ Your draft website is ready.

I created a warm, local draft with Home, About, Shop, Contact
and FAQ, plus a Subscriptions section that stays hidden from
visitors until you set it up.

[ Preview website ]  [ Review & publish ]

Before you can publish:
• Write your story on the About page and in the Home story section
  (they currently contain instructions for you)

To make it stronger:
• Add real product photos
• Set your refund window — the Refund policy page is hidden until then
• Add your first product — Shop appears to visitors once you do

Anything you'd like changed?
[________________________________]

Try:
"Add a farm stand section"
"Remove subscriptions for now"
"Make it more premium"
"Shorter homepage"
```

Edits are **patch operations** on the current draft:

```ts
type WebsitePatchOp =
  | { op: "ADD_PAGE"; page: WebsitePageType }
  | { op: "REMOVE_PAGE"; page: WebsitePageType }
  | { op: "ADD_SECTION"; pageId: string; section: SectionSpec; position: number }
  | { op: "REMOVE_SECTION"; pageId: string; nodeId: string }
  | { op: "MOVE_SECTION"; pageId: string; nodeId: string; position: number }
  | { op: "UPDATE_COPY"; nodeId: string; propPath: string; value: string }
  | { op: "REPLACE_PLACEHOLDER"; placeholderId: string; value: string }
  | { op: "SET_FEEL"; feel: WebsiteFeel }
  | { op: "SET_VISITOR_RENDERING"; nodeId: string; rendering: "HIDE" | "COMING_SOON" }
  | { op: "SET_PRODUCT_PRESENTATION"; nodeId: string; presentation: "LIVE" | "SAMPLE" };
```

Every patch goes through structural validation → claims validation → apply to draft → reconcile registry → recompute missing information. Patches targeting policy page text are rejected (5.6).

Full regeneration happens only when the seller explicitly asks. It keeps seller-provided content (replaced placeholders, uploaded images, manual edits) unless the seller chooses to discard it.

Craft.js remains **Edit manually** on the same draft.

---

## 8. Preview and publish check

### 8.1 Preview

- **Visitor view** (default): exactly what the live site would render.
- **Editor view**: adds setup stubs, sample cards, placeholder badges and unresolved policy tokens.

### 8.2 Publish check

```text
PUBLISH CHECK

Must fix before publishing (2)
✕ Instruction text on About — "Tell customers what you grow or bake…"
  [ Edit ]  [ Remove section ]
✕ Instruction text in Home story section
  [ Edit ]  [ Remove section ]

Review (5)
! AI decorative image — Home hero            [ Replace ]  [ Keep ]
! AI decorative image — Home story           [ Replace ]  [ Keep ]
! Placeholder logo                           [ Upload logo ]  [ Keep as my logo ]
! Sample product cards — Home (editor only; visitors won't see them)
                                             [ Remove samples ]
! Generic copy — FAQ (3 answers)             [ Review ]  [ Keep ]

Not live yet (4) — hidden from visitors until set up
◌ Shop — add your first product              [ Go to Products ]
◌ Subscriptions section                      [ Set up subscriptions ]
◌ Newsletter signup section                  [ Choose where signups go ]
◌ Refund policy — needs refund window        [ Fulfilment → Refunds ]

[ Publish ]   disabled while "Must fix" has items
```

Rules:

- **Must fix:** publish is disabled until the list is empty.
- **Review:** publish is allowed after a single confirmation ("Publish with 5 items to review"). Items marked Keep become `ACCEPTED` and stop appearing.
- **Not live yet:** informational. These pages and sections are omitted from the live site and light up automatically when their data exists (9).

### 8.3 Enforcement

Defence in depth, so no single bypass exposes placeholder or seller-facing content:

1. **Publish API** recomputes the check server-side from the draft node tree and returns `409` with the Must-fix list if anything remains. Client state is never trusted.
2. **SSR renderer** independently drops `EDITOR_ONLY` nodes, `SAMPLE` presentations and `NEEDS_SETUP` pages, even in a published version.
3. **Publish snapshot** stores the registry state alongside the published version for audit.

---

## 9. Capability and data sync

> **Rendering always follows Vendl's current commerce data. Structure — sections, pages, nav — only changes through draft → publish.**

| Event | Live site (immediate, render-time) | Structure (seller decides) |
|---|---|---|
| Capability enabled, bound section already on site | Section and nav item render LIVE data | — |
| Capability enabled, no bound section on site | No change | Prompt: "You've set up subscriptions — add them to your website?" → draft patch |
| Capability disabled | Bound sections and nav items suppressed; direct routes show neutral page, noindex | Prompt: "Subscriptions is off — remove the section and nav item?" → draft patch |
| Data emptied (last product archived, last event passed) | Section falls back to its HIDE / COMING_SOON rendering | No prompt; listed in site health |
| Data restored | LIVE rendering resumes | — |
| Policy variable cleared | Policy page and footer link suppressed; urgent notice to seller | Link to the setting. Checkout itself is owned by Vendl commerce settings, not the builder |
| Contact method removed | Contact page and nav item suppressed | Notice with link to Details |

Prompts are deduplicated: a dismissed prompt isn't shown again for the same event, and stays listed in site health.

---

## 10. Data model (conceptual)

### 10.1 Intent

```ts
type WebsiteReadiness = "READY" | "NEEDS_CONTEXT" | "SPARSE";

type WebsiteCapabilityId =
  | "SHOP"
  | "MENUS_PREORDERS"
  | "SUBSCRIPTIONS"
  | "CUSTOM_ORDER_FORMS"
  | "PICKUP"
  | "DELIVERY"
  | "EVENTS"
  | "NEWSLETTER";

const PAID_CAPABILITIES: WebsiteCapabilityId[] =
  ["SHOP", "MENUS_PREORDERS", "SUBSCRIPTIONS", "CUSTOM_ORDER_FORMS"];

type WebsitePageType =
  | "HOME" | "ABOUT" | "CONTACT" | "FAQ" | "SHOP" | "FARM_STAND"
  | "REVIEWS" | "BLOG"
  | "PRIVACY" | "TERMS" | "REFUNDS" | "DELIVERY_POLICY";

interface ContextAnswer {
  questionId: "STORY" | "AREA";
  answer: string;
}

interface WebsiteGenerationIntent {
  primaryGoal?: WebsiteGoal | "AUTO";
  stylePreference?: WebsiteFeel | "AUTO";   // feel
  sellerNotes?: string;
  sellerAbout?: string;
  contextAnswers: ContextAnswer[];
  selectedPages: WebsitePageType[];
  selectedCapabilities: WebsiteCapabilityId[];
  useAiDecorativePlaceholders: boolean;
  includeSampleProducts: boolean;           // honoured only if SHOP selected and catalogue empty
  storyImageUrl?: string;
}
```

### 10.2 Bindings and node data

```ts
type WebsiteDataSource =
  | "FEATURED_PRODUCTS"
  | "NEXT_DROP"
  | "SUBSCRIPTION_PLANS"   // proposed
  | "ORDER_FORM"           // proposed
  | "PICKUP_OPTIONS"       // proposed
  | "DELIVERY_ZONES"       // proposed
  | "UPCOMING_EVENTS"      // proposed
  | "SIGNUP_DESTINATION";  // proposed

type CapabilityState = "UNCONFIGURED" | "CONFIGURED_EMPTY" | "LIVE";

interface CapabilityBinding {
  capability: WebsiteCapabilityId;
  dataSource: WebsiteDataSource;
  visitorRenderingWhenNotLive: "HIDE" | "COMING_SOON"; // COMING_SOON only where 5.5 allows
}

interface WebsiteNodeCustom {
  visibility: "ALL" | "EDITOR_ONLY";
  capabilityBinding?: CapabilityBinding;
  productPresentation?: "LIVE" | "SAMPLE";
  placeholderRefs?: { placeholderId: string; propPath: string }[];
  claimSources?: ClaimSource[];
}
```

### 10.3 Placeholders and publish check

```ts
type PlaceholderKind =
  | "COPY_INSTRUCTIONAL"
  | "COPY_GENERIC"
  | "IMAGE_DECORATIVE"
  | "LOGO_MARK"
  | "SAMPLE_PRODUCTS"
  | "SETUP_STUB"
  | "POLICY_VARIABLE";

type PublishSeverity = "MUST_FIX" | "REVIEW" | "NOT_LIVE";

interface PlaceholderRecord {
  id: string;
  siteId: string;
  kind: PlaceholderKind;
  status: "OPEN" | "REPLACED" | "ACCEPTED" | "REMOVED";   // ACCEPTED only for REVIEW kinds
  source: "AI" | "TEMPLATE" | "SYSTEM";
  usages: { pageId: string; nodeId: string; propPath: string }[];
  assetId?: string;                                    // IMAGE_DECORATIVE, LOGO_MARK
  requires?: WebsiteCapabilityId | "CONTACT_METHOD";   // SETUP_STUB
  policyVariable?: PolicyVariableKey;                  // POLICY_VARIABLE
  createdAt: string;
  resolvedAt?: string;
}

interface PublishCheckItem {
  placeholderId?: string;
  severity: PublishSeverity;   // computed at check time
  label: string;
  pageId?: string;
  nodeId?: string;
  actions: PublishCheckAction[];
}

interface PublishCheckResult {
  mustFix: PublishCheckItem[];
  review: PublishCheckItem[];
  notLive: PublishCheckItem[];
  canPublish: boolean;         // mustFix.length === 0
}
```

### 10.4 Policies

```ts
type PolicyVariableKey =
  | "BUSINESS_NAME"
  | "CONTACT_EMAIL"
  | "ACCOUNT_COUNTRY"
  | "REFUND_WINDOW"
  | "PERISHABLES_POLICY"
  | "REFUND_CONTACT_METHOD"
  | "DELIVERY_AREAS"
  | "DELIVERY_FEES"
  | "DELIVERY_TIMEFRAMES";

type PolicyPageState = "RESOLVED" | "NEEDS_SETUP";
```

### 10.5 Claims, missing information, suggestions

```ts
type ClaimCategory =
  | "HERITAGE" | "CERTIFICATION_DIETARY_SAFETY" | "PROCESS_PROVENANCE"
  | "AWARDS_RANKINGS" | "SOCIAL_PROOF" | "COMMERCE_FACT" | "QUANTITY";

interface ClaimSource {
  type: "VENDL_DATA" | "SELLER_TEXT" | "SELLER_ASSERTED";
  ref: string;   // e.g. "products[prod_123].name", "intent.sellerNotes", "patch[p_456].prompt"
}

interface ClaimViolation {
  nodeId: string;
  propPath: string;
  category: ClaimCategory;
  text: string;
  resolution: "REGENERATED" | "REPLACED_WITH_PLACEHOLDER";
}

interface MissingInfoItem {
  id: string;   // stable, e.g. "NO_PRODUCTS", "CAPABILITY_UNCONFIGURED:SUBSCRIPTIONS"
  severity: "MUST_FIX" | "NOT_LIVE" | "IMPROVES_SITE";
  label: string;
  settingsLink?: string;
  relatedPlaceholderIds: string[];
}

interface AISuggestion {
  label: string;           // content or design idea only
  examplePrompt?: string;  // e.g. "Add a seasonal highlights section"
}
```

---

## 11. Guardrails (hard)

- No arbitrary React / CSS / JS
- No inventing prices, stock, hours, delivery claims, reviews, heritage, certifications or awards — enforced by claims validation on all AI-written text, including patches, alt text and SEO metadata
- AI never writes or edits policy text; unresolved policy variables are never defaulted
- Setup CTAs and sample products are `EDITOR_ONLY` and never rendered to visitors
- No catalogue entries for samples; samples never reach checkout, search, feeds, sitemap, structured data or analytics
- No AI imagery presented as real products; decorative images contain no people, legible text, logos or identifiable places
- Placeholder logo is typographic only and never saved to business Details without explicit consent
- AI always writes draft; publishing only through the server-enforced publish check
- Live structure never changes without seller action; render-time behaviour follows Vendl data
- Tenant isolation; server-side Astra only
- PayPal WIP / Square / domains / economics unchanged by this work

---

## 12. Implementation sequence

Safety infrastructure ships before any feature that can create placeholders.

1. **Schemas** — intent, capability bindings, node visibility, placeholder records, patch ops
2. **SSR visibility enforcement** — drop `EDITOR_ONLY`, `SAMPLE` and `NEEDS_SETUP`; Visitor / Editor preview toggle
3. **Placeholder registry** — node markers, reconciliation on save / patch / publish
4. **Deterministic missing information**
5. **Publish check** — UI plus server enforcement (`409`) and publish snapshots
6. **Intake UI** — site shape by readiness, page and capability defaults, placeholder options, question bank and caps
7. **Planner prompt + structural validation** — respect selections, complexity budgets, template fallback
8. **Claims validation pipeline** — lexicon pass, classifier pass, source matching, regeneration and fallback
9. **Multi-page compile** — HOME + About / Contact / FAQ `pageNodes` with bindings
10. **Capability sections** — editor stubs, visitor rendering, fixed coming-soon copy
11. **Policy templates** — counsel-reviewed wording, variable resolution, `NEEDS_SETUP`, checkout-required rule (depends on Fulfilment → Refunds settings)
12. **Decorative images + placeholder logo** — opt-in, generation rules, Replace / Keep
13. **Sample product presentation mode**
14. **Capability and data sync** — render-time suppression, deduplicated prompts, site health
15. **Conversational patches** — routed through steps 7, 8, 3 and 4
16. **Acceptance suite** — section 13, run in CI against seeded SPARSE, NEEDS_CONTEXT and READY accounts

---

## 13. Acceptance

### 13.1 Happy path — sparse seller

**Given:** business name, contact email and account country only; zero products; no About; no photos; no fulfilment, refund, subscription or signup settings.

**When:** Focus = Let Vendl decide; Feel = Warm & local; site shape keeps About, Contact, FAQ, Shop and adds Subscriptions; enables AI decorative placeholders and sample product cards; skips the STORY question.

**Then — Editor view:**

- Farmhouse-leaning draft exists
- Nav: Home, Shop, About, Contact, FAQ
- Home: hero with decorative image, story section with instructional copy and decorative image, product grid with sample cards, "Set up subscriptions" stub, "Choose where signups go" stub
- Placeholder logo shows its badge
- Privacy policy and Terms resolved; Refund policy is `NEEDS_SETUP` with a highlighted refund window token
- Preview looks like a real small-business site

**Then — Visitor view:**

- Nav: Home, About, Contact, FAQ (Shop appears once a product exists)
- Product grid, subscriptions and signup sections hidden
- Footer links: Privacy policy, Terms (no Refund policy)
- SSR HTML contains no setup CTA text, sample card markup or policy tokens
- No prices, reviews or unsupported claims anywhere

**Then — Publish check:**

- Must fix: instructional copy (About, Home story)
- Review: two decorative images, placeholder logo, sample cards, generic copy
- Not live yet: Shop, Subscriptions section, signup section, Refund policy
- Publish succeeds once Must fix is empty (no paid capability is LIVE, so Refund policy doesn't block)

**Then — Patches:**

- "Remove subscriptions" → `REMOVE_SECTION`; its `SETUP_STUB` placeholder becomes `REMOVED`
- "Add farm stand" → validated `ADD_SECTION` with a farm stand binding and editor stub

### 13.2 Guardrail tests

| ID | Scenario | Expected |
|---|---|---|
| N1 | Publish a draft containing sample cards | Publish allowed if Must fix is empty; live SSR HTML, sitemap, structured data, search index, feeds and analytics contain no sample entries |
| N2 | Force `EDITOR_ONLY` nodes and `SAMPLE` presentation into a published version via API | Renderer omits them |
| N3 | Draft has `COPY_INSTRUCTIONAL`; publish via UI and via API | UI publish disabled; API returns `409` listing the item |
| N4 | SHOP and DELIVERY checked; no refund or delivery settings | Refund and Delivery policy pages contain no refund window, fees, areas or timeframes; pages not published; no footer links |
| N5 | As N4, plus one live product | Publish blocked until Privacy policy, Terms and Refund policy are resolved (Delivery policy too, if DELIVERY is LIVE) |
| N6 | SUBSCRIPTIONS checked and unconfigured; visitor view | No setup CTA text in SSR HTML; section absent, or fixed coming-soon copy if seller chose COMING_SOON |
| N7 | Seller note: "we bake sourdough" | No heritage, certification, provenance, award, social-proof or quantity claims in any AI text, including alt text and SEO metadata |
| N8 | Test fixture injects "award-winning since 1982" into Astra output | Claims validation catches it; field regenerated or replaced with instructional placeholder; violation logged |
| N9 | DELIVERY unchecked | No Delivery policy page; no delivery wording in AI text |
| N10 | Zero reviews | Reviews page not selectable; no reviews section, testimonials or star ratings |
| N11 | Patch: "Say we're certified organic" on About | Claim appears on About only, recorded as `SELLER_ASSERTED`; no other page gains it |
| N12 | Patch: "Change the refund policy to 30 days" | Rejected with a link to Fulfilment → Refunds; policy text unchanged |
| N13 | Placeholder logo never kept | Business Details logo unchanged; not used in emails, invoices or payment descriptors |
| N14 | Astra suggestion says "You have no photos" | Suggestion dropped; missing information comes only from `computeMissingInformation` |
| N15 | AREA answer: "Brunswick and Coburg"; DELIVERY not configured | Area may appear in copy; no delivery zones created; no wording that implies delivery |

### 13.3 Sync and registry tests

| ID | Scenario | Expected |
|---|---|---|
| S1 | Published site with Subscriptions section; seller disables subscriptions | Live section and nav item suppressed immediately; draft prompt created; published structure unchanged until seller accepts |
| S2 | Published sparse site; seller adds first product | Live Shop nav item and product grid render the real product; no AI rewrite |
| S3 | Seller clears refund window after publishing | Refund policy page and footer link suppressed; urgent notice shown |
| S4 | Seller uploads a photo over the decorative hero | Placeholder becomes `REPLACED`; no longer in publish check |
| S5 | Seller deletes the section containing instructional copy | Placeholder becomes `REMOVED`; Must fix list empties |
| S6 | Seller dismisses "add subscriptions" prompt | Not re-shown for the same event; listed in site health |
| S7 | Seller enables events; no Events section on site | Prompt to add an Events section; no live change |
| S8 | Seller adds products while sample cards are still in the draft | Prompt to switch the section to LIVE; accepting removes sample props and the `SAMPLE_PRODUCTS` placeholder |

---

## 14. Product principle

> **Give them a complete website shell they can feel and edit — then grow it into their real Vendl business.**
>
> **Nothing a visitor sees is invented, and nothing meant for the seller reaches a visitor.**

Astra is the designer.  
Vendl remains the architecture, commerce authority, and publishing engine.
