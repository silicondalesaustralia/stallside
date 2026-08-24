# Vendl — Jurisdiction Page Build Spec

Programmatic pages on home-food-business and cottage food law for Australia and the United States.

**Version:** 1.0
**Owner:** Vendl (vendl.app)
**Audience:** build agent + human verifier

---

## 1. What this is and is not

**Is:** a reference layer that answers "can I legally sell what I make, and how do I start" for a specific jurisdiction, ending in "and here's how you take payment at the stand."

**Is not:** a legal publication, a blog, or a rewrite of the regulator's page. If a page can be replaced by a link to the government site with no loss, it should not exist.

**Commercial purpose:** these are outer-section pages in a topical map whose core section is Vendl's stall checkout, pre-orders and subscriptions. Every page must contain at least one honest bridge into selling mechanics. Bridges are earned by relevance, never bolted on.

---

## 2. Non-negotiable rules

These override every other instruction in this document.

1. **Never infer a legal fact.** If the regulator does not publish it, the field value is `not_published`. This is distinct from `not_required`, which means the regulator affirmatively states no obligation exists. Conflating them produces confidently false pages.
2. **Every legal claim carries a source.** Field-level `source_url` plus `verified_date`. No source, no publish.
3. **No page auto-publishes.** Human verification gate before any URL goes live. See §12.
4. **Quote regulator wording only where wording is load-bearing** — required label disclaimers, statutory definitions. Keep quotes short and attributed. Paraphrase everything else.
5. **Never state a fee, penalty, or processing time from memory.** These change annually and are the highest-risk fields on the page.
6. **Australia has no cottage food law.** Do not use the term, the framing, or the US schema on AU pages. See §4.
7. Where the regulator is silent and the answer matters, the correct output is a documented gap ("SA publishes maximum penalties; NSW does not"), not a guess.
8. **Hedging is not compliance.** Rule 1 forbids inventing facts. It does not license publishing an unresearched record behind a wall of "confirm with your council". A page where the reader learns nothing they did not already know is a failure, not a cautious success. If a field group is empty, the fix is research (§16), not a disclaimer.
9. **National-level facts are not jurisdiction gaps.** Labelling, allergen rules, Food Safety Supervisor triggers and Standard 3.2.2A come from the FSANZ Food Standards Code and apply identically in all eight AU jurisdictions. They must be populated on every AU page. Deferring them to "check with FSANZ" is a rule 8 violation.

---

## 3. Scope — phase 1

### Australia (8 jurisdictions, all in phase 1)

| Code | Jurisdiction | Statute (verify) | Regulator | Councils |
|---|---|---|---|---|
| nsw | New South Wales | Food Act 2003 | NSW Food Authority + council | 128 |
| vic | Victoria | Food Act 1984 | Council (class 1–4 system) | 79 |
| qld | Queensland | Food Act 2006 | Council (licensing, not notification) | 77 |
| sa | South Australia | Food Act 2001 s86 | Council + SA Health | 68 |
| wa | Western Australia | Food Act 2008 | Council | 137 |
| tas | Tasmania | Food Act 2003 | Council + Dept of Health | 29 |
| act | Australian Capital Territory | Food Act 2001 | ACT Health | 1 |
| nt | Northern Territory | Food Act 2004 | NT Health | 17 |

NSW and SA have verified reference records in §6. VIC, QLD, WA, TAS, ACT and NT require completed §16 research logs before drafting. No drafting begins until that jurisdiction's research log is complete.

### United States (6 pilot states)

Volume-led Phase 1b set from Ahrefs parent-topic demand (cottage food law queries). Do not expand to 51 until phase 1 ships and is measured.

| Code | State | Why in the pilot |
|---|---|---|
| fl | Florida | Highest US cottage-food query volume in the pilot set; sales-capped FDACS regime |
| mi | Michigan | High-volume MDARD cottage food |
| oh | Ohio | High-volume home bakery / cottage food |
| sc | South Carolina | Rising volume; confirm agency (health vs agriculture) |
| mo | Missouri | Mid-volume agriculture-led cottage food |
| ca | California | Two regimes (cottage food + MEHKO), county opt-in layer |

**Out of scope for phase 1:** individual council pages, individual US county pages, sub-topic pages (labelling, tax, markets). These are phase 2 and gated on Ahrefs Parent Topic analysis. See §11.

---

## 4. URL architecture

Two roots, because the central entities genuinely differ. Do not merge them for tidiness.

```
US    /cottage-food-laws/{state-slug}/
AU    /sell-food-from-home/{jurisdiction-slug}/

Directory pages (phase 1, one per AU jurisdiction):
      /sell-food-from-home/{jurisdiction-slug}/councils/

Phase 2 only, gated on Parent Topic:
      /cottage-food-laws/{state-slug}/{subtopic}/
      /sell-food-from-home/{jurisdiction-slug}/{council-slug}/
```

Rules:
- Slugs are full names, not abbreviations: `new-south-wales`, not `nsw`. Abbreviations go in the data record as `code`.
- Trailing slash, lowercase, hyphenated.
- No date in URL. No year in URL.
- Both roots need an index page listing all children.

---

## 5. Data schema

One record per jurisdiction. JSON. This is the source of truth — the page is a render of it.

Every field takes either a value, `not_published`, `not_required`, or `not_applicable`.

```jsonc
{
  "code": "sa",
  "country": "AU",
  "name": "South Australia",
  "slug": "south-australia",
  "demonym": "South Australian",

  "meta": {
    "last_verified": "2026-08-24",
    "verified_by": "",              // internal verification owner; does not need to be rendered publicly
    "regulator_page_last_updated": "2026-07-20",
    "next_review_due": "2027-02-24"
  },

  "law": {
    "statute": "Food Act 2001 (SA)",
    "statute_url": "",
    "key_section": "s 86",
    "regulations": [],
    "code_applies": true            // FSANZ Food Standards Code (AU only)
  },

  "gate": {
    "type": "notification",          // notification | registration | licence | permit | none
    "regulator_primary": "Local council",
    "regulator_fallback": "SA Health",
    "regulator_determined_by": "geography", // geography | sales_channel | food_risk | business_class
    "mechanism": "Food Business Notification (FBN) form",
    "form_url": "",
    "fee": 0,
    "fee_currency": "AUD",
    "timing": "before the business opens",
    "per_site": true,
    "transferable": false,
    "change_of_details_rule": "",
    "penalty_max_individual": 25000,
    "penalty_max_body_corporate": 120000,
    "penalty_expiation_individual": 300,
    "penalty_expiation_body_corporate": 1500
  },

  "scope": {
    "sales_cap": null,
    "sales_cap_basis": "not_applicable",   // gross | net | not_applicable
    "approved_food_list": false,
    "prohibited_foods": [],
    "definition_of_sale_includes_donations": true,
    "applies_to_one_off_sales": true,
    "applies_to_charitable": true,
    "primary_production_carve_out": true,
    "farm_gate_requires_notification": true,
    "commodity_schemes": ["dairy","meat","eggs","sprouts","seafood","leafy greens","melons","berries"],
    "commodity_scheme_regulator": "PIRSA"
  },

  "channels": {
    "direct_to_consumer": true,
    "farmers_markets": null,
    "farm_gate": true,
    "roadside_stall": null,
    "unattended_honesty_stall": null,
    "online_orders_local_pickup": null,
    "shipping": null,
    "wholesale_to_retail": null,
    "notes": ""
  },

  "labelling": {
    "required_elements": [],
    "mandated_disclaimer_text": "not_applicable",
    "allergen_rule": "",
    "nutrition_panel_required": null,
    "country_of_origin_required": null,
    "supplier_address_required": null,
    "address_can_be_non_residential": "not_published"
  },

  "training": {
    "food_handler_skills_required": true,
    "food_safety_supervisor_required": "conditional",
    "fss_trigger": "",
    "free_training_accepted": true,
    "free_training_name": "DoFoodSafely",
    "free_training_url": ""
  },

  "premises": {
    "home_kitchen_allowed": true,
    "inspection_required": true,
    "inspection_frequency_basis": "",
    "inspection_fee": "not_published",
    "construction_standard": "Standard 3.2.3",
    "exemptions_available": null,
    "exemptions_never_granted_for": []
  },

  "food_safety_management": {
    "standard_322a_applies": "conditional",
    "standard_322a_trigger": "",
    "records_required": null
  },

  "money": {
    "sales_tax_applies": null,
    "gst_threshold": 75000,
    "abn_required": null,
    "hobby_vs_business_test_url": "",
    "insurance_typical_market_requirement": "not_published"
  },

  "contact": {
    "phone": "",
    "email": "",
    "url": "",
    "council_directory_url": "",
    "council_count": 68
  },

  "unique": {
    "quirk_paragraph": "",        // 150–250 words, human-written, mandatory
    "common_mistake": "",
    "what_does_not_apply": ""     // reassurance block, see §7 s.4
  },

  "sources": []                    // [{field, url, retrieved}]
}
```

### Notes on schema

- `regulator_determined_by` is the highest-value field in the record. NSW is `sales_channel`, SA is `geography`. It drives the routing component in §7 s.2.
- `channels.unattended_honesty_stall` will be `not_published` in most jurisdictions. That gap is the content opportunity — see §8.
- US records reuse the same shape. `code_applies`, `commodity_schemes` and `standard_322a_*` become `not_applicable`; `sales_cap`, `approved_food_list` and `mandated_disclaimer_text` become load-bearing.

---

## 6. Reference records — verified

Only fields confirmed from the regulator's own page. Everything absent is unresearched, not absent-in-law.

### New South Wales
Source: https://www.foodauthority.nsw.gov.au/retail/home-based-mixed-businesses

- Gate: notification, no fee published
- `regulator_determined_by`: **sales_channel**
  - Direct to final customer → local council. Notification is satisfied via the council permit/approval application.
  - Not direct (wholesale to a cafe to on-sell) → NSW Food Authority. Licence may also be required for high-risk manufacture, case by case.
- Transferable: **no** — a new owner must re-notify
- FSS required only where food is ready-to-eat **and** potentially hazardous **and** not in the supplier's original packaging
- Standard 3.2.2A applies only where potentially hazardous food is processed into ready-to-eat food and served. "Process" = chopping, cooking, drying, fermenting, heating, thawing, washing
- Label elements: name of food; lot; supplier name and street address in AU/NZ; ingredients; best-before or use-by; directions for use and storage; nutrition information panel; country of origin; warning/advisory statements and allergen declaration
- Inspection: routine for sandwiches, salads, non-preservative sauces. Not routine for jams, chutneys, biscuits, chocolates
- Premises exemptions possible for domestic premises, but never for kitchen/storeroom flooring or personal hygiene areas
- NSW Food Authority will **not** inspect on request to satisfy market access conditions some councils impose
- Contact: 1300 552 406
- Councils: 128

### South Australia
Source: SA Health, "Starting a food business" — last updated 20 Jul 2026

- Statute: Food Act 2001 (SA) s 86. Notification required before opening
- `regulator_determined_by`: **geography** — local council; SA Health only where outside a council boundary or the council has no form
- Fee: **nil**
- Penalties: max $120,000 body corporate / $25,000 individual; expiation $1,500 / $300
- Separate notification per site
- Changes to ownership, contact, location or nature must be notified **before** they take effect
- Home-based businesses must notify council and are subject to inspection
- **Definition of sale includes accepting donations.** Applies to commercial, charitable and community activity, whether regular or one-off
- **Primary production carve-out, with a direct-to-public exception.** Growing/raising/harvesting is not a food business — but direct-to-public sales are carved out of that definition and captured by the Food Act. Farm-gate sales are named explicitly as requiring council notification
- Commodity schemes via PIRSA: dairy, meat, eggs, sprouts, seafood, leafy greens, melons, berries
- 3.2.2A framed by business type: cafés, restaurants, supermarkets, mobile food vans, takeaways
- DoFoodSafely accepted as training
- Inspection frequency per SA Food Business Risk Classification; council sets fees
- Councils: 68

---

## 7. Page template

Order is fixed. Sections render only when the data supports them.

### 1. Answer block
First sentence answers the query definitively, in the declarative, with the central entity present and no preamble.

> In South Australia you must notify your local council before you start selling food you make at home. There is no fee and no licence.

Immediately below: at-a-glance card rendered from data — gate type, regulator, fee, timing, sales cap, permit yes/no.

Never open with "If you're thinking about starting…", a definition, or a restatement of the question.

### 2. Who regulates you
Renders as a routing component when `regulator_determined_by` is `sales_channel` or `business_class`. Renders as a single statement when `geography`.

For NSW this is a two-branch decision: direct to the person eating it → council; selling to a business to on-sell → Food Authority.

### 3. What counts as a food business
Only where the definition is non-obvious. In SA this is a major section — donations, one-off sales, charitable activity, the primary production carve-out. In jurisdictions that publish no definition, omit entirely rather than padding.

### 4. What does *not* apply to you
**Mandatory on every AU page.** Most Vendl users sell eggs, honey, jam, bread, veg, flowers, firewood — not unpackaged potentially-hazardous ready-to-eat food. So no Food Safety Supervisor, no Standard 3.2.2A, no routine inspection.

Regulators frame everything as obligation. Leading with what is out of scope is accurate, useful, and structurally different content. Drive it from `training.fss_trigger` and `food_safety_management.standard_322a_trigger`.

### 5. How to notify / apply
Numbered. Real form, real link, real fee, real timing. Include penalties for not doing it where published.

### 6. Labelling
Required elements as a list. Where a disclaimer wording is mandated (most US states), render it verbatim in a copy-paste block with the state's exact wording — this is one of the few places verbatim reproduction is correct.

### 7. Where you're allowed to sell
The bridge. Farm gate, roadside stand, market, online-order pickup, **unattended stall**. Where `channels.unattended_honesty_stall` is `not_published`, say so plainly and explain what the ambiguity means in practice.

### 8. Getting paid
Sales tax / GST, ABN, hobby-vs-business, deposits on pre-orders, card at an unattended stand. Links to `/stall` and `/pre-orders`. One CTA maximum, and only here.

### 9. The quirk
`unique.quirk_paragraph`. 150–250 words, human-written, never generated. This is the section that makes the page read as written by someone who understands the jurisdiction.

### 10. Sources and verification
Every source URL, `last_verified`, and the line: *Rules change. Confirm with your council or the regulator before you start.* The verification owner must be recorded internally; a public verifier name is optional.

### 11. Nearby jurisdictions
Internal links. See §11.

### 12. Gap rendering rule

**A table where more than half the values are `not_published` is suppressed.** Replace it with one honest prose paragraph in the nearest surviving section, stating what the regulator does address, what it does not, and what the silence means in practice.

Nine rows of "confirm with your council" is a null rendered as content. It costs the reader scroll and gives them nothing. One paragraph that says "SA guidance addresses direct sale and farm gate and nothing else — that silence is not permission" is shorter, more honest and more useful.

Set `channels.render_as: "prose"` with a `render_reason` in the record when this triggers.

### 13. CTA rule

**One link to a core-section page per page. It lives in §7 s.8 and nowhere else.** Not in the channels section, not before the sources block, not as a trailing "also related" line. A reference page carrying four product links reads as an advertisement wearing a reference page's clothes, and it will be treated as one.

Vendl product voice does not appear outside §7 s.8. No "a till you stand behind."

---

## 8. Information gain requirements

Every page must contain **at least four** propositions that do not appear on the regulator's page or on the top five ranking competitors. Sourced from:

1. **Unattended and honesty-box sales.** Not addressed by any regulator. Where the definition of sale captures donations (SA does), state the consequence directly.
2. **Farm gate and roadside stalls.** Whether notification is triggered by selling your own produce direct.
3. **Cross-jurisdiction gaps.** "SA publishes maximum penalties; NSW does not." True, useful, and only obtainable by doing all eight.
4. **Verified regulator contact** — phone, email, direct form URL, with the date confirmed.
5. **Cost and time to comply**, in real numbers.
6. **Vendl first-party data**, once volume allows. Aggregate, anonymised, never per-business. Strongest EEAT asset available and no competitor can replicate it.
7. **The home address problem.** AU labelling requires a supplier street address. That is a real objection for home sellers and nobody writes about it.
8. **The market-access catch-22** (NSW): markets demand inspection, the Food Authority refuses to inspect on request.

A page that hits fewer than four does not ship. Log which four in the record.

---

## 9. Writing rules

- **Second person.** "You must notify your council," not "operators are required to."
- **Sentence case headings.** Question-form headings only where they match real query phrasing.
- **No filler openers.** No "In today's world," no "Whether you're a seasoned baker or just starting out."
- **Neutral register.** Not "unfortunately, Queensland is restrictive." State the rule.
- **One idea per paragraph**, 2–4 sentences.
- **Numbers as numerals.** Currency with symbol and code on first use: A$120,000.
- **Define an acronym once**, then use it: Food Safety Supervisor (FSS).
- **No hedging on verified facts.** "You must notify" — not "you may need to notify" — when the statute says must.
- **Hedge honestly on gaps.** "The regulator does not publish whether X. Contact your council." Never split the difference.
- Target 1,400–2,200 words. Length is an output of coverage, not a target. Do not pad to hit it.

### Semantic structure
- Central entity appears in title, H1, first sentence, and URL.
- AU central entity: *home-based food business*. US: *cottage food operation*.
- Each H2 opens with a declarative answer to its own implied question before elaborating.
- Entity names in the form the Knowledge Graph recognises: "NSW Food Authority", "Food Standards Australia New Zealand", "Food Act 2001 (SA)".

---

## 10. Validation gates

### Google Cloud Natural Language API
Run on every draft plus the top five ranking competitors.

- `analyzeEntities` — the intended central entity must have the highest salience. If "Vendl", "council" or "farmers market" outranks it, rebalance. Check `metadata.wikipedia_url` to confirm entities resolve to Knowledge Graph nodes.
- `classifyText` — the cluster should return a consistent category. Log drift.
- `analyzeSentiment` — document score within ±0.15 of neutral.
- **Entity gap diff** — entities present on ≥3 competitors and absent from the draft are coverage holes. Resolve or justify each.

### Automated pre-publish checks
- No field rendered where value is `not_published` without the explicit gap treatment
- Every legal claim has a `source_url`
- `last_verified` within 180 days
- ≥4 information gain items logged
- Cross-page similarity below 60% against every other page in the cluster (shingle comparison)
- No US terminology on AU pages: reject "cottage food", "cottage food law", "cottage food operation" in any AU output
- All external links return 200

---

## 11. Internal linking

- Every jurisdiction page links to its council directory page.
- Every jurisdiction page links to 3–5 geographic neighbours, in body text, with descriptive anchors. Never a link farm block.
- Every page links to at least one core-section page (`/stall`, `/pre-orders`, `/#pricing`) from §7 s.8 only.
- Index pages link to all children. Children link back to index.
- Anchor text varies — never the same anchor to the same target twice on one page.

### Phase 2 promotion rule
A subtopic or council earns its own URL only when **all four** hold:
1. Ahrefs **Parent Topic resolves to itself**, not to the jurisdiction head term
2. Something material differs from the jurisdiction default
3. ≥5 verified data points unique to it
4. Agricultural or farm-gate relevance

If Parent Topic rolls up, it is an H2 on the hub. This is a mechanical test, not a judgement call.

---

## 12. Structured data

- `WebPage` with `dateModified` = `meta.last_verified`
- `BreadcrumbList`
- `about` → the jurisdiction, `mentions` → regulator, statute
- `FAQPage` only where the questions match real queries
- Public author/reviewer attribution is optional. Use a named `Person` only where a genuine author or qualified reviewer exists and has agreed to be identified. Otherwise use Vendl as the publishing `Organization`. Never invent a reviewer or imply legal credentials.

Do not use `HowTo` for rich results — deprecated by Google in 2023. Harmless but pointless.

---

## 13. Build order

**Phase 0 — schema lock.** Research VIC and QLD per §16 to sit alongside NSW and SA. Four divergent jurisdictions is enough to finalise the field list. Do not write template code before this.

**Phase 1a — AU.** SA and NSW first (data exists). Then VIC, QLD, WA, TAS, ACT, NT. Plus 8 council directory pages.

**Phase 1b — US.** Six pilot states (FL, MI, OH, SC, MO, CA).

**Measure — 6 to 8 weeks.** Indexing rate, position, engaged time, scroll depth, click-through to `/stall` and `/signup`.

**Phase 2 — gated on results.** Remaining 46 US states, CA MEHKO counties, roadside-stall council pages, subtopic pages that pass the Parent Topic test.

Ship nothing in phase 2 until phase 1 pages are indexed and holding position.

---

## 14. Definition of done

Per page:

- [ ] Data record complete, every field a value or an explicit `not_*`
- [ ] Every legal claim sourced with `source_url` and `verified_date`
- [ ] Verification owner recorded internally, date recorded. Public named reviewer optional.
- [ ] First sentence answers the query in the declarative
- [ ] §7 s.4 "what does not apply" present (AU)
- [ ] ≥4 information gain items logged
- [ ] `unique.quirk_paragraph` human-written
- [ ] NLP gates passed, results logged
- [ ] Similarity <60% against every sibling
- [ ] Bridge to core section present, one CTA, in §7 s.8 only
- [ ] Neighbours linked in body text
- [ ] Structured data validates
- [ ] Disclaimer present
- [ ] `next_review_due` set

---

## 15. Open items — needs human decision

1. Whether to use a public named author/reviewer on any page. This is optional; it is not a publication requirement. If no genuine named person is used, publish under Vendl as the `Organization` and keep the verification owner internal.
2. Legal sign-off on disclaimer wording
3. Re-verification cadence and who owns it — this is the binding constraint on how many pages can exist
4. Whether aggregate Vendl transaction data can be published, and at what granularity
5. Ahrefs exports: Matching terms with Parent Topic and Traffic Potential (US and AU separately), plus Top Pages for Forrager, Castiron, Institute for Justice, Nolo
6. Whether the agent has live web access for primary research, or works from human-supplied source documents. **This is a hard gate.** With web access, the agent runs §16 itself. Without it, §16 becomes a human checklist and the agent may only populate fields from documents placed in front of it — it must never search its own training data to fill a gap
7. Where records live — repo JSON, CMS, or database
8. Whether the postcode-to-council lookup is in scope for phase 1

---

## 16. Source discovery and research protocol

Run this in full for every jurisdiction before any drafting. Output is a research log (§16.8), not prose.

### 16.1 Source tiers

| Tier | What | May it populate a field? |
|---|---|---|
| 1 | The regulator's own pages; the statute on the official legislation site; FSANZ Food Standards Code | **Yes** — the only tier that may |
| 2 | Other government: council sites, state agriculture departments, ATO, ABN Lookup, business.gov.au | Yes, for council, commodity and tax fields only |
| 3 | Law firms, industry bodies, competitors, news | **No.** May only be used to *discover that a fact exists*, which then triggers a Tier 1 hunt |
| — | Forums, Reddit, Facebook groups, AI summaries, undated blogs | Never. Useful for finding what people ask, never for answers |

A field populated from Tier 3 is a defect, even if correct.

### 16.2 Discovery procedure

Per jurisdiction, in order:

1. **Start at the regulator domain** in §16.3. Do not start with an open web search — start with `site:` queries against the known authority.
2. **Run the query patterns** in §16.4 against that domain.
3. **Harvest the regulator's internal links.** This is the highest-yield step and the one most likely to be skipped. The NSW page carried the gate and inspection fields, but linked out to separate pages for Food Safety Supervisor, Standard 3.2.2A, labelling and Standard 3.2.3 — which is where the rest of the record lives. Follow regulator-internal links to depth 2.
4. **Pull the statute.** Confirm the Act name, the section number, and in particular the statutory definitions of *sell* and *food business*. SA's donations-count-as-sale finding came from the definition, not the guidance.
5. **Check the agriculture department separately.** Commodity schemes (eggs, dairy, meat, seafood, leafy greens) usually sit with a different agency than food safety. Eggs matter most — it is the archetypal farm-stand product.
6. **Pull the council list** from the state local government association.

### 16.3 Seed domains

Verify each before relying on it; agency web estates get restructured.

**Australia — food safety regulator / legislation / council list**

| | Regulator | Legislation | Councils |
|---|---|---|---|
| nsw | foodauthority.nsw.gov.au | legislation.nsw.gov.au | olg.nsw.gov.au |
| vic | health.vic.gov.au (also check the Streatrader registration portal) | legislation.vic.gov.au | localgovernment.vic.gov.au |
| qld | health.qld.gov.au, business.qld.gov.au | legislation.qld.gov.au | lgaq.asn.au |
| sa | sahealth.sa.gov.au | legislation.sa.gov.au | lga.sa.gov.au |
| wa | health.wa.gov.au | legislation.wa.gov.au | walga.asn.au |
| tas | health.tas.gov.au | legislation.tas.gov.au | lgat.tas.gov.au |
| act | health.act.gov.au | legislation.act.gov.au | n/a — single jurisdiction |
| nt | health.nt.gov.au | legislation.nt.gov.au | lgant.asn.au |

**Australia — national:** foodstandards.gov.au (Food Standards Code, Safe Food Australia), business.gov.au, ato.gov.au, abr.gov.au

**Australia — commodity:** pir.sa.gov.au (SA), agriculture.vic.gov.au, dpi.nsw.gov.au, daf.qld.gov.au, agric.wa.gov.au

**United States — pilot states**

| | Likely agency | Legislature |
|---|---|---|
| fl | fdacs.gov (Division of Food Safety) | laws.flsenate.gov / leg.state.fl.us |
| mi | michigan.gov/mdard | legislature.mi.gov |
| oh | agri.ohio.gov | codes.ohio.gov |
| sc | scdhec.gov and/or agriculture.sc.gov (confirm) | scstatehouse.gov |
| mo | agriculture.mo.gov | revisor.mo.gov |
| ca | cdph.ca.gov + individual county environmental health (MEHKO) | leginfo.legislature.ca.gov |

Note the US agency split is inconsistent — some states run cottage food through agriculture, others through health, others through county health departments. Confirm per state; do not assume.

### 16.4 Query patterns

Against the regulator domain:

```
site:{domain} home based food business
site:{domain} food business notification
site:{domain} food business registration
site:{domain} starting a food business
site:{domain} farm gate sales
site:{domain} roadside stall
site:{domain} temporary food stall
site:{domain} market stall food
site:{domain} food safety supervisor
site:{domain} labelling requirements
site:{domain} egg stamping
site:{domain} charitable community food
```

US additions:

```
site:{domain} cottage food
"{state}" cottage food law site:.gov
"{state}" cottage food approved foods list
"{state}" home processor exemption
```

Against the legislation site:

```
site:{legislation_domain} food act definitions sell
site:{legislation_domain} food act "food business"
```

### 16.5 Field-level retrieval

Populate field *groups* from their own sources, not from whichever page looked most authoritative. One page rarely carries the whole record. If `labelling.required_elements` and `gate.fee` came from the same URL, check whether the labelling detail actually lives on a dedicated page with more detail.

### 16.6 When the regulator is silent

In order, before writing `not_published`:

1. Re-search the regulator domain with two alternate phrasings
2. Check the statute and regulations directly
3. Check the state agriculture department
4. Check the national regulator (FSANZ) for whether it is a Code-level rather than state-level matter

Only then set `not_published`, and record every search attempted in the log. Then raise an escalation for human phone or email verification — that call becomes an information gain asset (§8.4).

Never resolve silence by copying another jurisdiction, by reasoning from the general pattern, or from training data.

### 16.7 Freshness

- Capture the regulator page's own published "last updated" date into `meta.regulator_page_last_updated`
- Older than 24 months → flag for phone confirmation before publishing anything time-sensitive from it (fees, penalties, thresholds)
- Re-run the full protocol when `meta.next_review_due` falls due

### 16.8 Research log

One per jurisdiction, written before drafting, kept alongside the data record.

```jsonc
{
  "jurisdiction": "vic",
  "started": "",
  "completed": "",
  "researcher": "",
  "queries_run": [],
  "pages_fetched": [
    { "url": "", "tier": 1, "fetched_at": "", "regulator_last_updated": "" }
  ],
  "fields_populated": 0,
  "fields_not_published": [
    { "field": "channels.unattended_honesty_stall", "searches_attempted": [] }
  ],
  "escalations": [
    { "field": "", "reason": "", "contact_method": "", "status": "open" }
  ],
  "information_gain_candidates": []
}
```

Drafting is blocked until `completed` is set.

### 16.9 Prohibitions

- Never populate a field from memory or training data
- Never populate a field from a competitor page
- Never populate one jurisdiction from another. Victoria's four-class registration system and Queensland's licensing model exist precisely to punish this assumption
- Never infer a fee, penalty, threshold or processing time
- Never treat an empty search result as permission to guess. An empty result is a finding, and it gets logged

### 16.10 Minimum viable record — drafting gate

Drafting is **blocked** unless every load-bearing field group below is either populated from a Tier 1 source or explicitly marked `not_applicable`:

| Group | Blocking fields |
|---|---|
| `gate` | type, regulator_primary, regulator_determined_by, mechanism, fee, timing |
| `labelling` | basis, required_elements |
| `training` | food_handler_skills_required, fss_trigger |
| `premises` | home_kitchen_allowed, inspection_required |
| `scope` | definition_of_sale_includes_donations, primary_production_carve_out, sales_cap |
| `food_safety_management` | standard_322a_trigger |

`not_published` on a blocking field raises an escalation. **It does not unblock drafting.** Either the escalation resolves, or the field resolves to `not_applicable`, or a human signs off on shipping with the gap explicitly rendered per §7 s.12.

`not_applicable` and `not_published` are not interchangeable and the distinction is load-bearing:

- **`not_applicable`** — the concept does not exist in this jurisdiction. SA has no sales cap because SA has no sales-cap mechanism. Render as a positive fact: *"No cap — no cap exists in SA."*
- **`not_published`** — the concept exists and the regulator has not stated the answer. Render as a documented gap with an escalation attached.

Writing "None published" for a `not_applicable` field turns good news into a hedge and is a defect.

### 16.11 Verification markers

**Public attribution rule:** a named public author or reviewer is optional. The build must still record who performed the verification internally, but the page may publish under Vendl as the `Organization` without rendering that person or adding `Person` schema.


Facts the agent is confident of but has not confirmed against Tier 1 are written inline as `[VERIFY: expected source]` and mirrored in the record. This is permitted **in drafts only**.

Publish is blocked while any marker remains. Each is either confirmed and the marker removed, or the sentence is cut. A marker is never shipped and never silently deleted without confirmation.

---

## 17. Rejection criteria

A draft is returned, not edited, if any of these hold. These are the failure modes observed in the first SA draft.

1. Fewer than 4 logged information gain items (§8)
2. Under 1,200 words — treat as a coverage symptom, investigate the record before adding words
3. Any blocking field in §16.10 unresolved
4. `unique.quirk_paragraph` absent or machine-written
5. Labelling section defers to FSANZ instead of listing the Code elements (§2.9)
6. A table rendered where §7 s.12 requires prose
7. More than one core-section link, or any product link outside §7 s.8
8. `not_published` used where `not_applicable` is correct
9. Fewer than 3 neighbour links
10. A reassurance section that reverses itself into "confirm with your council" — state the test, then state where the line sits
11. Sources block repeating one URL across multiple field rows without distinct per-field sources
12. Any weasel construction on a published figure: "commonly discussed at", "generally around", "typically about". Verify it or cut it
13. Any `[VERIFY]` marker remaining at publish

## 18. Reference implementation

`sa-reference-page.md` is the pattern. It contains a complete data record and the finished page copy, including deliberate `[VERIFY]` markers showing correct draft-stage handling.

When the spec and the reference disagree, the spec wins. When the agent is unsure how a section should read, copy the reference's structure — particularly:

- the answer block, which states the gate and the penalty in two sentences with no preamble
- "What counts as a food business", which reasons from statutory definitions to a concrete consequence ("sell to a wholesaler and you are a primary producer; put the same tomatoes at the end of your driveway and you are a food business")
- "What probably does not apply", which states the three-part test, applies it to real products, then names where the line sits — rather than hedging
- the channels section, rendered as prose because 6 of 8 values were `not_published`
- the quirk paragraph, which is argumentative rather than descriptive and closes on the asymmetry between a free notification and a A$25,000 penalty
