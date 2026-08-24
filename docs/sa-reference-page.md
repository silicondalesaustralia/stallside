# Reference implementation, South Australia

This is the pattern every jurisdiction page follows. Read it alongside the spec; where the two disagree, the spec wins.

`[VERIFY: source]` markers are deliberate. They mark facts that are almost certainly correct but have not yet been confirmed against a Tier 1 source. **Every marker must be cleared or the sentence cut before publish.** They are shown here so the agent copies the discipline, not just the prose.

---

## Part A, data record

```jsonc
{
  "code": "sa",
  "country": "AU",
  "name": "South Australia",
  "slug": "south-australia",
  "demonym": "South Australian",

  "meta": {
    "last_verified": "2026-08-24",
    "verified_by": null,
    "regulator_page_last_updated": "2026-07-20",
    "next_review_due": "2027-02-24",
    "status": "draft_blocked_pending_verifier"
  },

  "law": {
    "statute": "Food Act 2001 (SA)",
    "statute_url": "[VERIFY: legislation.sa.gov.au]",
    "key_section": "s 86",
    "code_applies": true
  },

  "gate": {
    "type": "notification",
    "regulator_primary": "Local council",
    "regulator_fallback": "SA Health",
    "regulator_determined_by": "geography",
    "mechanism": "Food Business Notification (FBN) form",
    "form_url": "[VERIFY: varies by council, link council directory]",
    "fee": 0,
    "fee_currency": "AUD",
    "timing": "before the business opens",
    "per_site": true,
    "transferable": "not_published",
    "change_of_details_rule": "Ownership, contact, location or nature of business must be notified before the change takes effect",
    "penalty_max_individual": 25000,
    "penalty_max_body_corporate": 120000,
    "penalty_expiation_individual": 300,
    "penalty_expiation_body_corporate": 1500
  },

  "scope": {
    "sales_cap": "not_applicable",
    "sales_cap_basis": "not_applicable",
    "approved_food_list": "not_applicable",
    "prohibited_foods": "not_applicable",
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
    "farm_gate": true,
    "farmers_markets": "not_published",
    "roadside_stall": "not_published",
    "unattended_honesty_stall": "not_published",
    "online_orders_local_pickup": "not_published",
    "shipping": "not_published",
    "wholesale_to_retail": "not_published",
    "render_as": "prose",
    "render_reason": "6 of 8 not_published, table suppressed per spec 7.12"
  },

  "labelling": {
    "basis": "Australia New Zealand Food Standards Code, Standard 1.2.1",
    "required_elements": [
      "Name of the food",
      "Lot identification",
      "Supplier name and street address in Australia or New Zealand",
      "Ingredient list",
      "Best-before or use-by date",
      "Directions for use and storage",
      "Nutrition information panel",
      "Country of origin",
      "Warning and advisory statements, and allergen declaration"
    ],
    "mandated_disclaimer_text": "not_applicable",
    "point_of_sale_exemption": "[VERIFY: foodstandards.gov.au, reduced requirements for food made and packaged at point of sale]",
    "unpackaged_food_rule": "[VERIFY: foodstandards.gov.au]",
    "supplier_address_required": true,
    "address_can_be_non_residential": "not_published",
    "escalation": "Phone SA Health / council re: PO box or non-residential address on label"
  },

  "training": {
    "food_handler_skills_required": true,
    "food_safety_supervisor_required": "conditional",
    "fss_trigger": "Food is ready-to-eat AND potentially hazardous AND not sold in the supplier's original packaging",
    "free_training_accepted": true,
    "free_training_name": "DoFoodSafely",
    "free_training_url": "[VERIFY]"
  },

  "premises": {
    "home_kitchen_allowed": true,
    "inspection_required": true,
    "inspection_frequency_basis": "SA Food Business Risk Classification",
    "inspection_fee": "not_published, council sets",
    "construction_standard": "Standard 3.2.3",
    "exemptions_available": "not_published"
  },

  "food_safety_management": {
    "standard_322a_applies": "conditional",
    "standard_322a_trigger_by_food": "Processing potentially hazardous food into ready-to-eat food and serving it. Process includes chopping, cooking, drying, fermenting, heating, thawing, washing",
    "standard_322a_trigger_by_business_type": "Cafés, restaurants, supermarkets, mobile food vans, takeaways"
  },

  "money": {
    "gst_threshold": 75000,
    "gst_threshold_source": "[VERIFY: ato.gov.au]",
    "abn_required": "[VERIFY: abr.gov.au]",
    "hobby_vs_business_test_url": "[VERIFY: business.gov.au]",
    "insurance_typical_market_requirement": "not_published"
  },

  "contact": {
    "phone": "[ESCALATION: confirm SA Health food safety line]",
    "council_directory_url": "[VERIFY: lga.sa.gov.au]",
    "council_count": 68
  },

  "neighbours": ["nsw","vic","qld","wa","nt"],

  "information_gain_logged": [
    "Definition of sale captures donations, resolves honesty-box question",
    "Primary production carve-out does not cover direct-to-public; farm gate named explicitly",
    "SA publishes maximum and expiation penalties; NSW publishes none",
    "Notification is free and per-site, so the cost of the trap is zero and the cost of missing it is A$25,000",
    "Two independent 3.2.2A tests (food characteristics vs business type) both exclude a produce stand"
  ]
}
```

---

## Part B, page copy

**Title:** Selling food from home in South Australia: rules, notification and costs
**H1:** Selling food from home in South Australia
**URL:** `/sell-food-from-home/south-australia/`

---

In South Australia you must notify your local council before you start selling food you make at home. There is no fee, no licence and no cap on what you can sell, but the notification is compulsory, and the maximum penalty for skipping it is A$25,000.

**At a glance**

| | |
|---|---|
| Gate | Notification |
| Who you notify | Your local council |
| Cost | Nil |
| When | Before you open |
| Licence required | No |
| Sales cap | None: no cap exists in SA |
| Approved food list | None: the full Food Standards Code applies |
| Per site | Yes: notify separately for each location |

---

### Who regulates you

Your local council. Unlike New South Wales, where the regulator depends on who you sell to, South Australia decides it by geography: the council for your area is the enforcement agency under the Food Act 2001 (SA), and you lodge a Food Business Notification form with them.

SA Health only steps in where you are outside a council boundary, or where your council does not provide a form. That is unusual, for almost everyone, council is the whole answer.

Home-based food businesses must notify council and are subject to food safety inspections. Inspection frequency follows the SA Food Business Risk Classification, and each council sets its own inspection fees.

---

### What counts as a food business

This is where most people get caught, so it is worth being precise. Section 86 of the Food Act 2001 (SA) requires notification before you start, and the definitions behind it are broader than they look.

**Selling includes accepting donations.** The definition of sale covers disposing of food in any way that is valuable to the business, taking money, supplying food as part of a paid service, or accepting donations. An honesty box or a "pay what you feel" stand is a sale.

**It applies to one-off sales.** The definition catches activity whether it happens regularly or once. A single stall at a school fete is in scope.

**It applies to charitable and community activity.** Not-for-profit does not mean not-a-food-business.

**Growing your own produce does not exempt you.** Primary food production, growing, raising, cultivating, picking, harvesting, collecting, catching, sits outside the food business definition. But direct-to-public sales are carved out of that exemption and captured by the Food Act, and SA Health names farm-gate sales explicitly as an activity requiring council notification.

So: sell your tomatoes to a wholesaler and you are a primary producer. Put the same tomatoes on a table at the end of your driveway and you are a food business.

**Some products have a separate regulator.** Dairy, meat, eggs, sprouts, seafood, leafy greens, melons and berries fall under commodity-specific legislation administered by PIRSA, which sits alongside, not instead of, council notification. Eggs matter most here, because they are the commonest farm-stand product in the state. If you sell eggs, check the PIRSA scheme as well as notifying council.

---

### What probably does not apply to you

Regulators write for restaurants. Most of the obligations that make starting sound daunting are triggered by food characteristics you almost certainly do not have.

**Food Safety Supervisor.** Required only where your food is all three of: ready-to-eat, potentially hazardous, and not sold in the supplier's original packaging. Whole eggs in the shell are not ready-to-eat. Jam, honey, chutney and bread are not potentially hazardous. Whole fruit and vegetables are neither. A typical farm stand clears none of the three.

**Standard 3.2.2A food safety management tools.** Triggered where you process potentially hazardous food into ready-to-eat food and serve it, processing meaning chopping, cooking, drying, fermenting, heating, thawing or washing. SA Health frames the same standard by business type: cafés, restaurants, supermarkets, mobile food vans and takeaways. Both tests point the same way for a produce stand.

**Where the line actually sits.** Cut fruit, salads, sandwiches, cooked meat, dairy, cheesecakes and anything needing refrigeration to stay safe *are* potentially hazardous ready-to-eat food. Move from selling whole apples to selling apple slices and you cross into a different regime.

What still applies regardless: notification, food handler skills and knowledge, labelling, and the general safety requirements of the Food Standards Code. SA accepts the free DoFoodSafely online course for training.

---

### How to notify

1. **Contact your council's environmental health team before you build anything.** Describe what you will make, where you will make it and how you will sell it. They will tell you whether your kitchen needs changes and whether any of your products raise a flag.
2. **Complete the Food Business Notification form.** Your council provides it. If you are outside a council boundary or your council has no form, use SA Health's.
3. **Lodge it before you open.** Not after your first market, not once you have customers. Before.
4. **Notify separately for each site.** A home kitchen and a second location are two notifications.
5. **Keep it current.** Changes to ownership, contact details, location or the nature of the business must be notified *before* they take effect.

It costs nothing and takes minutes. Inspection fees, where they apply, are set by your council and are separate.

**If you do not notify.** South Australia publishes its penalties, which most states do not: a maximum of A$25,000 for an individual and A$120,000 for a body corporate, with on-the-spot expiation fees of A$300 and A$1,500.

---

### Labelling

Labelling is national, not South Australian. It comes from the Australia New Zealand Food Standards Code, and for packaged food sold to the public the required elements are:

- Name of the food
- Lot identification
- Supplier name and street address in Australia or New Zealand
- Ingredient list
- Best-before or use-by date
- Directions for use and storage
- Nutrition information panel
- Country of origin
- Warning and advisory statements, and an allergen declaration

`[VERIFY: foodstandards.gov.au]` Food made and packaged at the point of sale attracts reduced requirements, and unpackaged food sold loose is treated differently again, confirm which applies before you print packaging.

**The home address problem.** The Code requires a supplier street address in Australia or New Zealand, and for a home business that is your house. SA Health does not publish whether a PO box or a non-residential address satisfies it. If you would rather your home address were not on every jar, raise it with your council's environmental health officer before you commit to a label design, this is a common question and the answer is worth getting in writing.

---

### Where you can sell

Direct-to-consumer sales and farm-gate sales are clearly in scope: both require notification, and farm gate is named explicitly.

Beyond that, South Australian guidance is thin. Whether a roadside stall, a farmers market pitch, an online order with local pickup, or shipping interstate changes your obligations is not addressed in the material SA Health publishes for new food businesses. That silence is not permission, it means you need to ask your council, and it means a written answer from your environmental health officer is worth more than anything you will read online.

**Unattended stalls and honesty boxes.** No South Australian guidance addresses them. But the reasoning is available: because accepting donations counts as a sale, an unattended box does not take you outside the Food Act. Notification, labelling and food safety obligations apply exactly as they would if you were standing there. The practical questions an unattended stand raises, temperature control with nobody watching, how long product sits out, cash security, are yours to solve, and none of them are answered by the fact that nobody is minding the table.

**Planning is a separate question.** Whether you can put a stall at your property boundary is a development and planning matter, handled by a different part of your council than food safety. Notifying as a food business does not give you planning approval, and planning approval does not satisfy notification. Ask both.

---

### Getting paid

Food-law notification is not tax registration, and neither is the other.

`[VERIFY: ato.gov.au]` The GST registration threshold is A$75,000 in annual turnover. Below it, registration is optional. Most basic food is GST-free, but not all of it, confirm your specific products with the ATO rather than assuming.

`[VERIFY: business.gov.au]` Whether your stand is a business or a hobby determines whether you need an ABN and whether the income is assessable. The ATO publishes a test. It turns on things like repetition, scale, intent to profit and how businesslike your record-keeping is, not on how much you make.

Public liability cover is not required by the Food Act, but most markets require it as a condition of a pitch, typically at A$10-20 million. `[not_published, confirm with individual markets]`

On payment itself: an unattended stand and a pre-order run need different things from a till. If you take deposits ahead of a pickup date, or leave a stand out with no one behind it, [see how Vendl handles stall checkout and pre-orders](/stall).

---

### The South Australian catch

The trap here is not a hard rule, it is a definition, and it catches the people least likely to think it applies to them.

South Australia carves primary production out of the food business definition, which sounds like good news if you grow what you sell. Read further and the carve-out has a hole in it precisely where small producers operate: direct-to-public sales are pulled back under the Food Act, and farm-gate sales are named as an example. The grower selling to a wholesaler is exempt. The same grower selling the same produce off a table at the front gate is a food business and must notify.

Layer the definition of sale on top and the trap closes further. Donations count. Charitable and community activity counts. A single event counts. So the person who assumes they are fine because "it's my own veg", "it's only weekends", "it's just an honesty box" or "it's for the school" is wrong on all four counts, and is likely to be wrong for years without anyone telling them.

What makes it worth fixing immediately is the asymmetry. Notification is free, takes minutes and imposes almost nothing on a stand selling eggs and jam, no Food Safety Supervisor, no 3.2.2A, no licence. The downside of not doing it is a published maximum of A$25,000. There are very few compliance decisions in Australian food law with a cost-benefit ratio this lopsided, and it is the one most often missed.

---

### Nearby jurisdictions

Rules change at the border, and South Australia shares one with every other mainland jurisdiction. If you sell across a state line, or you are comparing before you commit, the equivalents are [New South Wales](/sell-food-from-home/new-south-wales/), [Victoria](/sell-food-from-home/victoria/), [Queensland](/sell-food-from-home/queensland/), [Western Australia](/sell-food-from-home/western-australia/) and the [Northern Territory](/sell-food-from-home/northern-territory/). Victoria in particular works nothing like South Australia, it runs a four-class registration system rather than a single notification.

Looking for your own council? See the [South Australian council directory](/sell-food-from-home/south-australia/councils/), 68 councils, with forms, fees and contacts.

---

### Sources and verification

Rules change. Confirm with your council or SA Health before you start. This page is a practical reference, not legal advice, and does not replace the Food Act 2001 (SA) or your council's directions.

**Last verified:** 24 August 2026 · **Reviewed by:** *[pending]* · **Next review:** 24 February 2027

| Field group | Source | Regulator page updated | Retrieved |
|---|---|---|---|
| Gate, penalties, scope, definitions, primary production, training, inspection | SA Health, Starting a food business | 20 Jul 2026 | 24 Aug 2026 |
| Labelling, Food Safety Supervisor and 3.2.2A triggers | Australia New Zealand Food Standards Code | `[VERIFY]` | 24 Aug 2026 |
| Commodity schemes | PIRSA | `[VERIFY]` | - |
| GST, ABN | ATO, business.gov.au | `[VERIFY]` | - |

**Open escalations:** whether a non-residential address satisfies the supplier address requirement · SA Health food safety contact number · point-of-sale labelling exemption scope.
