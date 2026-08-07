# Vendl — Conversion features (build spec) v2

**Goal:** Make the claim *"you'll make more sales with Vendl"* provably true. Every feature here raises basket size, recovers a lost sale, or turns a one-time roadside buyer into a returning customer — things a cash tin structurally cannot do. Works for **any** unattended stall (eggs, firewood, flowers, ice, honesty car park), not just farm stalls.

**v2 status:** Self-contained. No dependency on missing docs (`CUSTOMER-CARD-NETWORK.md`, etc.). Open questions from the review are decided below. Tips and card-on-file network are deferred.

---

## 0. THE SCOPE LINE — non-negotiable

Vendl's edge is simplicity. Every feature here must be **near-zero setup for the owner** — the cleverness lives in the cart/poster, invisible to the owner. The test for each: *can the owner turn it on with one field or one toggle?* If configuring it takes more than ~1 minute, it's too complex — cut or simplify. We are NOT becoming a conversion-optimization suite; we're adding a handful of dead-simple levers that sell on the owner's behalf.

**The two lost sales we're recovering** (marketing spine, keep it honest):
1. The customer who'd have bought **two** but wasn't nudged → upsell + bundles
2. The customer who **comes back** because we captured them → first-order email capture + restock loop

---

## HARD REQUIREMENTS (architecture)

### One server-side pricing path
Tier prices, upsell add-ons, and first-order discounts **must** be computed server-side in `loadStandCart` / order-create, **identically** for cash, PayID/local transfer, and card. No client-only totals. No per-method price math. If cash and card can diverge, owners lose trust — treat this as non-negotiable.

### Options XOR tiers (v1)
A product may have **either** existing option groups **or** quantity tiers — **not both**.
- If the product has option groups → tiered pricing UI/fields are disabled.
- If the product has tiers → option groups are disabled (or blocked until tiers cleared).
This avoids “does 2-for-$14 apply to the Dozen choice?” forever.

### Gating
All conversion features in this v2 ship to **all plan tiers** (including Free). Fee revenue scales with sales; do not gate basket levers. Restock *sending* may still follow existing plan rules where already productized; opt-in collection stays available as today.

---

## FEATURE 1 — Cart upsell ("add one more")

The unattended-stall version of the supermarket impulse rack. At the moment of payment, on the customer's phone, offer one relevant add-on.

**Customer experience:**
- After adding items, before payment, show ONE upsell card (e.g. *"Grab a jar of honey too — $6"*).
- One tap adds it to the cart. Never blocks checkout; easy to ignore.
- Max **one** upsell shown at a time.

**Owner setup (trivial):**
- **Stand-level** (not per-product): pick one product as **"Suggest this"** (the upsell SKU).
- Optional `upsellPriceCents` override; if unset, use the product's normal base `priceCents`.
- If nothing set → no upsell. Zero config = no upsell.

**Rules:**
- Only suggest if that product is in stock and not already in the cart.
- When shown as an upsell, use the single upsell/base price — **ignore that product's own tiers** on the upsell card.
- Works on cash, PayID, and card alike (via the shared pricing path).

---

## FEATURE 2 — Bundle / tiered pricing (poster + cart)

Anchoring: show a volume deal; baskets rise. Works for eggs by the dozen, firewood by the bag, flowers by the bunch, etc.

**Owner setup (trivial):**
- On a product **with no option groups**, optional tier rows: e.g. `1 = $5 · 2 = $9 · 3 = $12`.
- Each row: qty + **total** price for that exact quantity. Add a row, set qty + total. That's it.

**Tier semantics (locked):**
- `2 = $9` means **$9 for two** (total), not $9 each.
- Price is special **only at defined tier quantities**.
- **Exact tier qty → that total; otherwise → `priceCents × qty`.**
- No partial-tier splits, no “fill with next-lowest tier” math in v1.

**Where it shows:**
- **Cart:** when qty matches a tier, apply that total; show saving vs base when helpful (*"2 dozen — $9 (save $1)"*).
- **QR poster:** tier lines can print via Feature 7 blocks.

**Rules:**
- Exact tier match wins for that qty.
- Stock still decrements by unit quantity; sold out when `stock < 1` (or insufficient for requested qty). No “must buy minimum tier” sold-out rule.
- Cash/PayID/card all honour tier pricing via the shared path.
- Mutually exclusive with product options (see Hard requirements).

---

## FEATURE 3 — First-order discount + email capture (v1; network deferred)

**v1 goal:** Nudge the fence-sitter and capture a **receipt email** as the seed for a later customer network. **Not** card-on-file / “one card every Vendl stall” yet.

**Customer experience:**
- Poster/sign (optional block): *"First time? Get 10% off — enter your email at checkout."* (or similar; payment-method-agnostic).
- At checkout, first-time shopper at **this stand** gets the discount when they provide email (auto-apply or one-tap claim).
- Discount applies on **any** payment method (cash, PayID, card) — do **not** force card (that steers small baskets onto the fee-heaviest rail).

**Identity (locked):**
- **"First time"** = first completed order at **this stand** (not owner-wide, not network-wide).
- **"Used once"** = keyed primarily on **receipt email** (normalized). Cookie may be a soft secondary UX signal only; email is the record.
- **Leakage is acceptable** at low ticket sizes. Spec: best-effort; do not over-engineer fingerprinting. Say this explicitly in owner UI copy if useful ("Stops most repeat uses; not fraud-proof").

**Owner setup:**
- One toggle: **"First-order discount"** + percentage or amount (default 10%).
- Off by default; owner opts in.
- Discount comes from owner proceeds — make that clear (reuse fee-transparency pattern).
- **v1 default: no stacking** with tier/upsell discounts.

**Success page (merged with Feature 4):**
- **One primary ask only:** email for restock alerts (see Feature 4). That same email is the Feature 3 capture seed.
- **Do not** show a separate “save your card” / account ask until a customer-network feature exists.

**Deferred:** card-on-file, cross-stall identity, Stripe Customer as network passport. Stand-scoped Stripe Customer + email is enough if useful for card checkouts; not required for cash.

---

## FEATURE 4 — Restock loop, reframed as sales (mostly built)

Existing restock subscribe + owner notify plumbing stays. This feature is **copy/framing**, not new identity plumbing.

**Additions:**
- Success page: one email capture framed with scarcity/FOMO where honest, e.g. *"Sold out fast last time — get notified when we're back."* (Avoid fake “today” claims without data.)
- Owner restock email: sales driver — *"{Stand} just restocked — {product} back"* with link to stall (or pre-order if that product is a pre-order).
- Consent/unsubscribe rules already in product still apply. Do not re-gate opt-in collection.

**Merge with Feature 3:** success page = single email field / ask. First-order discount identity and restock opt-in share that email; don't present two competing captures.

---

## FEATURE 5 — Round-up / tip — DEFERRED

Deferred from v2 build. Reasons: Stripe tip/fee shape is fiddly; lowest basket lift vs complexity; cash tips can't be enforced cleanly.

**When resumed (notes only):**
- Card/PayID only; never pre-selected; separate amount; **no platform fee on tip**; owner proceeds.
- Skip tips-on-cash in that v1-of-tips.

---

## FEATURE 6 — Scarcity & freshness signals (cart, near-free)

**In the cart / stall page:**
- Low stock: *"Only 6 left"* (real `stockQuantity` when at/below existing `lowStockThreshold`). **No “today”** — no daily baseline.
- Freshness/provenance: optional **per-product** text field (*"Laid this morning"*, *"Cut today"*). Owner responsibility to keep current; no staleness detection.

**Owner setup:** freshness = one optional text field per product. Scarcity automatic from stock; respect existing show exact stock vs Available/Low/Sold out setting; toggle to show/hide scarcity publicly if needed.

**Rules:** Only show scarcity when genuinely low. Never fake urgency.

---

## FEATURE 7 — Customizable QR poster sections (print builder)

The poster is the storefront. Owner assembles from fixed blocks — not a free design tool.

**Approach:** pick-from-blocks inside the Vendl template. **Layer on `QrSignSheet`**, not a rewrite.

**Relationship to existing editor:**
- Freeform `qrSignMessage` (rich HTML) **remains**.
- It becomes the **"custom note / instructions"** block within the block list (on/off + existing editor).
- Nothing deprecated.

**Available blocks (toggle on/off; edit text within limits):**
- **Big CTA headline** — presets or char-limited custom (*"SCAN TO PAY — CASH OR CARD"*).
- **Bundle prices** — auto from Feature 2 when present.
- **First-order offer** — auto from Feature 3 if enabled (payment-method-agnostic wording).
- **Instructions / custom note** — existing `qrSignMessage`.
- **Stand name + branding** — existing logo/accent.
- **Freshness / provenance** — from Feature 6 (if set).
- **"How it works"** — optional 3-step (Scan · Pick · Pay).

**Owner setup:** block list + toggles + live preview; existing print/download/copy actions.

**Rules:**
- No free positioning; no custom fonts/colours beyond Tier-1 brand accent.
- Sensible defaults: new stand looks good with zero edits (CTA + QR + instructions on).
- Printable/legible at A4 and A5; watch block density — if everything is on, keep typography tight; prefer sensible default offs for secondary blocks.
- Reuse CSS token / per-stand accent override.

---

## Marketing hook (context, not build)

Lead: **"Your honesty box can't upsell. Vendl can."**  
Support: *"Catch the sale you're losing — the customer with no cash, and the one who'd have bought two."*  
Proof = Features 1, 2, 3 (email capture). Don't promise the network until it exists.

---

## Build order (v2)

1. **Bundle/tiered pricing** (Feature 2) — highest basket lift; options XOR tiers; exact-qty totals.
2. **Cart upsell** (Feature 1) — stand-level suggest product + optional `upsellPriceCents`.
3. **Customizable poster blocks** (Feature 7) — layer on `QrSignSheet`; wrap `qrSignMessage`.
4. **First-order discount** (Feature 3 v1) — email identity, any payment method, stand-scoped first order.
5. **Restock reframe** (Feature 4) — copy + merge success ask with Feature 3 email.
6. **Scarcity/freshness** (Feature 6) — real stock only; dumb freshness text field.

**Deferred:** tips (5), owner analytics dashboards, card-on-file / cross-stall customer network.

---

## Constraints

- Every feature ≤1-minute owner setup. One field or one toggle where possible.
- No feature blocks core checkout; all additive.
- Don't break cash/PayID flows or existing checkout copy.
- **One server-side pricing path** for all methods.
- Options XOR tiers.
- Scarcity/freshness truthful.
- First-order: best-effort email identity; leakage acceptable; not card-only.
- Success page: **one** primary email ask.
- Poster = blocks within template; freeform message is one block.
- Reuse: stock model, CSS tokens, restock infra, existing QR poster actions.
- No `any`; `fetch` checks `.ok`; files ~<150 lines. `npm run build` green.

---

## Definition of done

- Owner can in ~1 minute each: set tier totals, pick a stand-level upsell product, toggle first-order discount, assemble poster with CTA + offers.
- Cart applies exact-qty tier totals and shows one upsell; checkout applies first-order discount with email identity on all payment methods.
- Success page has a single email/restock ask (no card-save ask).
- Scarcity shows real stock when low; freshness is optional product text.
- New stands get a good default poster; `qrSignMessage` still works as a block.
- Cash/PayID/card totals never diverge for the same cart.
- Tips and customer-network card-save are out of scope for this milestone.
- Build green.

---

## Decision log (review answers, locked)

| Topic | Decision |
|-------|----------|
| Feature 3 vs network | Decouple; v1 = discount + email capture only |
| Tier price | Total for exact qty (`2 = $9` → $9 for two) |
| Partial tiers | None in v1; else `priceCents × qty` |
| Options + tiers | Mutually exclusive |
| Poster vs HTML | Blocks layer; `qrSignMessage` = custom note block |
| First-order identity | Receipt email; cookie soft only; leakage OK |
| Card-only discount | No — any payment method |
| First time scope | This stand only |
| Upsell trigger | Stand-level single “suggest this” product |
| Upsell price | Optional `upsellPriceCents`; else base; no tier math on upsell card |
| Scarcity copy | “Only N left” — no “today” |
| Freshness | Per-product optional text; owner maintains |
| Tips | Deferred |
| Success asks | One: restock/email (serves Feature 3+4) |
| Plan gating | All Free+ |
| Analytics | Later |
| Missing docs | Spec is self-contained; no external md required to build |
