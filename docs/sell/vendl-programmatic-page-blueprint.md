# Vendl /sell: complete directory and 120 market-page build specification

Revision 2 — 19 November 2026. Supersedes the first blueprint's smaller feature presentation. Intended audience: the developer, designer and content agent building Vendl's production site.

## Read this first: exact deliverable

Build **121 indexable pages: `/sell` plus the 120 `/sell/{slug}` pages in the launch registry below**. The 120 leaf pages are additional to the directory, not inclusive of it. Use the existing Vendl application, components, brand and design tokens. The new beta homepage becomes vendl.app; production links, canonicals, schema IDs and sitemap URLs must use `https://vendl.app`. This document authorises a build specification, not an assertion that a site has been deployed.

The agreed design direction is the expanded candle mockup and the new maker-directory mockup below. Preserve their warm cream/forest-green character, product photography and restrained presentation. Implement real HTML/CSS/UI rather than using an entire mockup as a page image. Include broader business management and marketing capabilities, not just a storefront and calculator.

**Order of authority:** verified product behaviour and current billing configuration → explicit requirements in this revision → text and data in this specification → approved visual composition → incidental text or numbers inside generated images. Never copy a misleading feature claim or mathematical error merely because it appears in an image. If a required workflow is unsupported, record the gap, use an honest supported demonstration and continue independent work. Do not invent a feature to fill the page.

### Navigation through this specification

- Sections 1–2: strategy and competitor research.
- Sections 3–9: expanded leaf-page design, variants, semantic content, candle example, costing and CTAs.
- Sections 10–15: schema, linking, data model, technical delivery, measurement and launch standards.
- Section 16: approved mockups and how to interpret them.
- Section 17: full `/sell` hub specification, search, category controls and accessibility.
- Section 18: component and content contracts, feature truth table and repeatable authoring process.
- Section 19: hub schema and shared generators.
- Section 20: all 120 canonical markets with individual editorial and calculator briefs.
- Sections 21–24: content production instructions, asset specifications, end-to-end QA and handoff checklist.

Supporting guides and tools are expansion work, not counted in the 121 pages. Do not create hundreds of thin companion articles automatically. Add links only when their targets exist.

## 1. Decision

Launch the planned 120 global English maker pages through a shared design system with six production-workflow variants. Each page should function as a useful product demonstration and a focused commercial landing page. The differentiator is the connection between making, costing, selling and repeat business.

Keep Vendl's existing cream, forest-green and warm photographic styling. Borrow competitor interaction and information patterns, not their branding or copy. The aim is a page that helps a maker evaluate Vendl with less uncertainty. No public inspection can establish which competitor layout converts best; conversion recommendations below are hypotheses to measure.

The required result on each page: a visitor can identify the audience, see a relevant storefront, understand a realistic cost calculation, inspect the order workflow, distinguish Free from Pro, and begin an appropriate setup journey.

This document is a research-backed specification, not a claim that the proposed pages, routes, product features or onboarding flows have been implemented. Proposed internal URLs must be resolved against the real site before publication.

## 2. Research scope and findings

Reviewed public page content from all six requested platforms and inspected their desktop hero designs in a live browser. Also inspected the Vendl beta homepage. Square's Ireland bakery page was used because its US bakery URL was inaccessible through the research tool. WordPress.com managed ecommerce was reviewed; this is not an evaluation of every self-hosted WordPress/WooCommerce installation. This was not a mobile usability audit, conversion experiment or exhaustive audit of competitor schemas.

| Platform and reviewed page | Observed pattern | Vendl application |
| --- | --- | --- |
| [Shopify candles](https://www.shopify.com/sell/candles) | Niche wording, immediate signup, setup steps, FAQs, pricing and related selling pages. Desktop hero is centred, with email capture and a general admin photograph. | Keep intent clarity and pricing access. Improve specificity with candle materials, a real Vendl screen and a relevant cost example. |
| [Wix ecommerce](https://www.wix.com/ecommerce/website) | Large headline and primary CTA, store demonstration, template categories, customer examples and feature sections. | Show an attractive achievable shop early; use only a few relevant examples and verify all proof. |
| [Squarespace ecommerce](https://www.squarespace.com/ecommerce-website) | Product photography combined with storefront UI, template exploration, customer story, store management and marketing. | Pair physical goods with their actual Vendl storefront. Give the maker a believable picture of the outcome. |
| [Square bakery](https://squareup.com/ie/en/solutions/bakery) | Bakery photography and operational explanations, including ordering lead times and cut-offs, with a customer story. | Explain the working day through verified Vendl workflows rather than a generic feature inventory. |
| [WordPress.com store builder](https://wordpress.com/ecommerce-online-store/) | Ownership proposition, store previews, setup guidance, payments and migration questions. | Address own domain, customer information, data export and migration boundaries with precise supported claims. |
| [Webflow ecommerce](https://webflow.com/feature/ecommerce) | Split hero, prominent primary/secondary actions, UI collage, design control and attributed customer quotes. | Use clear visual hierarchy and show the product. Keep motion restrained and screens legible. |

Vendl's beta already brings together a storefront, costing demonstration, pre-orders, subscriptions, marketing, payments and maker proof. Use that foundation. Its current calculator was displayed in AUD while the pricing cards showed USD in the inspected browser; the new global template should coordinate these controls and labels. The observation concerns presentation, not a verified calculation defect.

## 3. Expanded market-page architecture — required baseline

This replaces the original smaller mockup. Keep sections concise, with useful demonstrations instead of a wall of feature text. Default order follows the expanded candle mock. Real relevant proof can be inserted near the hero or before pricing; omit invented proof.

| Order | Component | Required content | CTA or behaviour |
| --- | --- | --- | --- |
| 1 | SiteHeader + Breadcrumbs | Existing wordmark, What you make, platform, community, pricing, login; Home / What you make / niche | `/sell` is reachable from site navigation; all leaf pages link back. |
| 2 | NicheHero | One clear H1, maker-specific value, product photograph and labelled example storefront | Start free; Try the calculator; Free/Pro disclosure. |
| 3 | ValueStrip | Sell your products / Know your costs / Grow your business | Quiet, compact reassurance; no invented proof counts. |
| 4 | StorefrontShowcase | Website/editor preview; custom domain, product options, pages and blog | Pro badge for full website; distinguish free shop link. |
| 5 | CostingDemo | Editable niche inputs, saleable yield, packaging, labour and results | Ungated demo; explain Pro for saved production tools. |
| 6 | OperationsShowcase | Product variants, stock and orders in a readable authentic UI | Brief workflow showing actual supported operations. |
| 7 | SellingModes | Three or four relevant modes: pre-orders, subscriptions, bundles, QR market checkout | Choose emphasis by market; avoid forced irrelevant subscriptions. |
| 8 | MarketingShowcase | Same product becomes a social post, short clip and email; scheduling/restock where relevant | Explain included email and social/video credit allowances. |
| 9 | MigrationStrip | Products and customers from supported import sources | Accurate limits: not a copy of website design, pages or subscriptions. |
| 10 | CommunityStrip | Practical learning, other makers and help | Link only to the verified community destination. |
| 11 | PricingCards | Free and Pro, currency, billing period and plan/fee boundaries | Correct plan journeys and expandable complete features. |
| 12 | NicheFAQ | Six to eight genuinely useful questions as an editorial starting range | Accessible disclosure components; answers in initial HTML. |
| 13 | RelatedResources | A few relevant markets and available guides/tools | Descriptive anchors; no dead or placeholder links. |
| 14 | FinalCTA + Footer | Niche closing line and consistent signup action | Start free; ordinary product/company/footer links. |

The screenshot is a visual direction, not a mandate to make all sections the same height. A category-specific explanation can be two sentences. Keep key claims and plan boundaries visible. Use progressive disclosure for optional feature detail. Put a real case study in a suitable position when available; otherwise use clearly labelled demonstrations. Do not require 120 invented testimonials.

## 4. Design specification

Use the homepage's actual design tokens and fonts from the repository when implementation begins. Do not approximate the font family from a screenshot or replace the brand with generic SaaS gradients.

Recommended starting dimensions, to be tested rather than treated as ranking factors:

- Main content max-width: approximately 1200 px; reading copy approximately 60–72 characters per line.
- Desktop hero: roughly 45% copy and 55% proof/demo. H1 approximately 48–64 px, responsive to phrase length; mobile approximately 34–42 px. Body copy 17–18 px with comfortable line spacing.
- Use cream for the page, white for functional demo surfaces and Vendl green for primary actions. Keep borders quiet and shadows restrained.
- Keep one visually dominant CTA per section. Secondary actions should look secondary.
- Show one meaningful screen at a readable size rather than a collage of six tiny dashboards.
- Use original product photography, customer-approved photographs and actual product captures. Label fictional sample stores “Example store”; do not imply they are paying customers.
- Essential claims belong in HTML, not only inside screenshots. Give informative images descriptive alt text; decorative assets use empty alt text.
- Reserve image dimensions; use responsive image sources. Load the hero image promptly and defer below-fold assets. Use click-to-play videos with captions and a transcript or equivalent written explanation.
- No entrance animation that delays the H1 or CTA. Respect reduced-motion preferences.

Mobile layout: headline, value statement, CTA, plan clarification, then a cropped preview. Turn costing rows into labelled cards or a compact form; avoid a desktop spreadsheet requiring sideways scrolling. Use a collapsed section navigator if needed. A bottom Start free action can appear after the hero leaves view; it must not obscure inputs, consent controls, errors or content. Provide keyboard access, clear focus, accessible labels and suitable contrast. Test at 320, 390, 768 and 1440 px and with enlarged text.

For field performance, target the established good Core Web Vitals thresholds at the 75th percentile: LCP at most 2.5 seconds, INP at most 200 ms and CLS at most 0.1. Lab results are development checks, not a substitute for field measurements. See [Web Vitals](https://web.dev/articles/vitals).

## 5. Six workflow variants

| Variant | Example markets | Primary proof | Calculator focus | Distinct content |
| --- | --- | --- | --- | --- |
| Fresh batches | Cookies, sourdough, pastries | Order window and collection workflow | Recipe, saleable yield, pack size | Cut-offs, collection, weekly menus |
| Shelf-stable batches | Soap, candles, spice blends | Batch-to-product and restock example | Inputs, containers, batch yield | Scent/flavour variants, release timing, repeat purchases |
| Labour-intensive work | Crochet, jewellery, sewn bags | Product variants and maker story | Components plus making time | Pricing labour, limited collections, ready stock versus made to order |
| Machine-assisted production | 3D prints, laser-cut goods | Actual product and order process | Materials, waste, machine overhead allocation, finishing | Capacity and lead-time explanation without claiming automated scheduling |
| Unique pieces | Art, pottery, furniture | Collection and individual item page | Per-piece costs or batch allocation | One-off stock, sizes, shipping/collection and releases |
| Personalised goods | Invitations, signs, tumblers | Verified option and order-details flow | Setup plus unit cost and labour | Exactly what customers can specify; lead times and supported order handling |

The last variant is conditional on verifying Vendl's actual custom-field and approval capabilities. Do not illustrate a proof-approval system, automated quoting, scheduling, lot traceability or file-upload workflow unless it exists. “Can account for machine overhead” does not mean “integrates with your printer”.

## 6. Semantic content framework informed by Koray Gubur

Koray's own material discusses source context, topical maps and contextual bridges. The practical adaptation here is to keep the site's commercial purpose consistent, organise related subjects and connect each page to the next useful decision. These are editorial planning concepts, not a Google-certified scoring system or a promise of topical authority. See [his topical-map discussion](https://www.holisticseo.digital/seo-research-study/topical-map).

| Planning concept | Vendl application |
| --- | --- |
| Source context | Vendl supplies commerce and production tools for businesses making products from ingredients, materials or parts. |
| Central subject | The maker business and its products, costs, orders and customers. |
| Central intent | Start or improve a business that makes and sells products. |
| Commercial core | Market pages, relevant feature explanations, pricing and switching. |
| Supporting coverage | Costing tools, pricing guides, order-management guides and real maker stories. |
| Contextual connection | Link the maker's problem to an explanation, then to a demonstrated Vendl solution. |

Every page receives its own brief:

1. Define the primary audience, their existing selling method and the decision they are making.
2. Map a primary query family, synonyms and secondary questions. Check search intent across target English-speaking markets before finalising scope; the Shopify backlink export is not keyword-volume evidence.
3. Name relevant entities and attributes: for candles, wax, fragrance, wick, jar, label, batch yield, saleable units, price, shipping and repeat orders.
4. Connect attributes into useful explanations. Example: jar size changes material usage and packaging cost; both affect margin. Merely listing these nouns adds little.
5. Put a direct answer immediately beneath a question heading, followed by the example, evidence or relevant limitation.
6. Keep the page's main subject commercial: using Vendl to sell this product. Link substantial legal, production or startup instruction to separately maintained guides.
7. Record sources, feature verification and reviewer responsibility. An author bio must describe real experience; founders' software experience is not evidence of specialist expertise in every craft.

Suggested intent ownership:

| Query family | Primary destination |
| --- | --- |
| Sell candles online; candle website builder; online store for candle makers | `/sell/candles` |
| How to price candles; candle costing calculator | One substantial pricing/tool destination, proposed `/tools/candle-pricing-calculator` |
| How to start a candle business | Proposed `/guides/start-a-candle-business` |
| Move candle store from Shopify | A verified migration guide, with contextual links from `/sell/candles` |

Do not generate extra pages for synonyms or spelling variants. Parent and child markets need distinct scopes. Bread can cover general bakery ordering; sourdough can show recurring bread drops and its production lead-time considerations. If search results and practical content do not support a meaningful distinction, revise the split and use another substantive market to preserve the 100+ launch objective.

## 7. Complete candle-page content outline

Proposed URL: `https://vendl.app/sell/candles`

Title: `Sell Candles Online — A Website for Candle Makers | Vendl`

Meta description: `Sell your candles with Vendl. Create a shop, calculate batch costs and manage orders. Start with a free shop link; add a website and costing tools with Pro.`

H1: `Sell your candles online. Know what each one earns.`

Hero body: `Give your candles a place to sell. Manage your products and orders, then use Vendl Pro to bring wax, fragrance, jars, packaging and your time into one cost calculation.`

Primary CTA: `Start free`

Secondary CTA: `Try the candle cost calculator`

Clarification: `Free shop link and selling tools. Your own website and costing tools with Pro.`

Hero media: an actual Vendl candle storefront plus a compact “cost per candle” overlay based on the same example used below. All imagery and UI must be created or captured before launch; this outline does not imply the demo already exists.

### H2: Give your candle collection its own shop

Show three sample products with scent and size options. Explain the Free shop link and Pro custom-domain website. Label the preview as a demonstration if it is not a real customer store. Link: `Explore the example shop`.

### H2: What does each candle really cost to make?

Direct answer: `Add the materials used in your batch, your making time and allocated overheads. Divide by the number of saleable candles, then add packaging per candle.`

Provide the editable example in the next section. Explain that the calculation is illustrative, not a candle formulation or a claim about typical maker profit.

### H2: Products, stock and orders. Together.

Show scent and size variants, available quantities and incoming orders using verified Vendl screens. Explain creating products, choosing stock sales or pre-orders, taking payment and fulfilling orders. Avoid mixing product stock and order status in one misleading table: use tabs or separate real views. The generated image combines them for illustration only.

### H2: More ways to sell your next batch

Show pre-orders, subscriptions where supported, bundles and QR checkout at markets. Each receives a one-sentence candle-specific example. These are selling options, not claims that Vendl controls curing or production scheduling.

### H2: One candle. A post, a clip and an email.

Use the same example product in three previews: a social post, a short video and an email. Explain creation/scheduling, captioned clips, customer lists and restock alerts. Mark email as Pro and show the applicable social/video credit information from the shared plan configuration. Use real UI captures and labelled mock marketing outputs. Do not imply every social network supports the same format, workflow or availability.

### Community strip: You make the products. Let's build the business.

Briefly describe practical learning and other makers. Place after migration and before pricing in the rendered page; keep it a strip, not a long second sales pitch.

### H2: Starting fresh or moving an existing candle shop?

Explain initial setup and product/customer imports. State that imports do not copy the website design, pages or subscriptions where those limitations apply. Link to verified instructions.

### H2: Choose the tools your candle business needs

Render current Free and Pro data from one pricing source. Clearly label billing period, currency, transaction fees, processing fees and website/production access.

### H2: Questions about selling candles with Vendl

Candidate questions, verified before writing answers:

- Can I start selling without building a full website?
- Can I calculate the cost of each candle size?
- Can I sell different scents and sizes?
- Can I accept pre-orders for a new collection?
- Can I sell at markets as well as online?
- Can I move products from my existing store?
- What does Vendl cost, including transaction fees?
- What should I check before shipping candles to customers?

The shipping answer should separate Vendl's tools from the maker's packaging/carrier decisions. Link location-specific requirements to vetted guides rather than making universal legal claims.

### H2: Build the business behind your candles

Link to candle pricing help, a startup guide and adjacent maker pages such as wax melts, reed diffusers and soap, where they are useful and live.

Final CTA: `Give your next collection a place to sell.` / `Start free`.

## 8. Calculator specification and example

Do not gate calculation results behind an email form. Deliver the useful result first. A save action can invite account creation, but must describe whether saving requires Pro. Until a persistent save flow exists, use `Start free` and a clear Pro explanation, not a fake “Save” promise.

Illustrative candle batch in USD; replace with verified demo inputs and keep them editable:

| Cost line | Batch amount |
| --- | ---: |
| Wax | 20.00 |
| Fragrance | 8.00 |
| Wicks | 2.00 |
| Jars and lids | 18.00 |
| Labour | 15.00 |
| Allocated overhead | 5.00 |
| Total before per-unit packaging | 68.00 |

At 12 saleable candles and USD 0.80 packaging each: unit cost = 68 / 12 + 0.80 = USD 6.4667, displayed USD 6.47. At USD 18 selling price, contribution after these entered costs and before selling fees/tax is USD 11.53, or 64.1% of price. Do not label this guaranteed net profit.

Formula: `unitCost = batchCost / saleableUnits + packagingPerUnit`.

If percentage selling fees and an allocated fixed fee are included, a simplified target-margin model is `price = (unitCost + fixedFeePerUnit) / (1 - percentageFee - targetMargin)`. All percentages are decimal fractions. Explain assumptions: fees may be charged per order, on shipping and/or tax, and may vary by provider. A fixed transaction fee must be allocated over the actual assumed units per order, not silently charged once per item. This is a pricing estimate, not accounting or tax advice.

Validation: block non-positive yield; reject invalid percentage totals; handle decimal units and currency precision; never apply both reduced yield and a waste surcharge to the same loss. Preserve user input when changing display units. Changing currency is not just changing a symbol: either use explicitly labelled local example presets or a stated exchange-rate source/time. Payment-fee settings must follow the selected market/provider or remain user-entered.

For cookies, distinguish cookies produced from packs sold. For pottery, divide batch costs over saleable pieces. For 3D printing, distinguish active labour from unattended machine hours. For crochet, emphasise making time. These differences justify distinct pages.

## 9. CTA and onboarding plan

| Position | Action | Destination and requirement |
| --- | --- | --- |
| Hero | Start free | Existing signup route; pass a validated niche identifier. |
| Hero secondary | Try the candle cost calculator | In-page anchor to a usable calculator. |
| Store preview | Explore the example shop | Read-only demo, labelled as such; no actual checkout transaction. |
| Calculator result | Start free, or a truthful save action | Preserve inputs only if implemented; label Pro access accurately. |
| Migration section | See what you can import | Specific import explanation; don't send to generic signup under a misleading label. |
| Pricing | Start free / Get Pro | Corresponding plan journey with correct terms. |
| Final section | Start free | Same primary destination and promise. |

Keep button language consistent. Do not claim “free website” when Free provides a shop link and the full website requires Pro. Do not use “no credit card required” or “ready in five minutes” unless verified. No fake scarcity or default newsletter consent.

Proposed contextual signup URL: `/signup?business_type=candles&entry=sell-page`. This is a specification, not a confirmed supported route parameter. Validate and allowlist it. Keep the landing page canonical clean, and do not add internal UTMs that overwrite acquisition information.

After signup, retain the business type and offer a relevant first product, units and setup checklist. If a visitor already chose Pro or used a calculator, preserve that intent. A contextual CTA has limited value if everyone lands in an unrelated generic onboarding screen.

## 10. Structured data: model the actual entities

Advanced schema means a coherent, accurate graph with stable identities. It does not mean attaching every schema type to every page. Visible content and JSON-LD should come from the same data.

| Type | Use | Boundary |
| --- | --- | --- |
| Organization | Vendl's verified business identity | Reuse one stable ID; do not invent addresses, awards, credentials or customer counts. |
| WebSite | Vendl's site | Shared identity and publisher. |
| WebPage | Each commercial niche landing page | Unique URL/name; link to site, software and breadcrumb. |
| BreadcrumbList | The visible navigation hierarchy | Every ancestor must exist and match the visible trail. |
| SoftwareApplication / WebApplication | Vendl, the actual software | One shared software ID; not a new app for each of 120 niches. |
| Offer | Actual visible Free/Pro offer | Central pricing source; currency, billing terms and plan limitations must agree with the page. |
| ImageObject | A real relevant page image, when useful | Use only published asset URLs with appropriate rights. |
| VideoObject | A real embedded demonstration | Accurate thumbnail, upload date and playable URL; a minor embedded video does not guarantee video-result eligibility. |
| CollectionPage / ItemList | A real market directory or hub | Describe the visible list; not a keyword list hidden in JSON-LD. |
| Article / BlogPosting | Separate editorial guides | Do not classify every software landing page as a blog post. |

Schema.org recognises WebApplication as a subtype of SoftwareApplication. Google has separate eligibility requirements for its software rich result, including name, an offer price and a genuine review or aggregate rating. If these are unavailable, omit unsupported fields and accept that a semantic graph is not a rich-result-eligible software listing. Do not fabricate ratings to satisfy a validator. [Google software guidance](https://developers.google.com/search/docs/appearance/structured-data/software-app), [WebApplication](https://schema.org/WebApplication).

Google's documentation changelog says FAQ rich results stopped appearing from 7 May 2026 and the FAQ feature documentation was subsequently removed. Keep useful visible FAQs; FAQPage is optional semantic markup with no Google FAQ rich-result expectation. It is not part of the default graph below. [Google changelog](https://developers.google.com/search/updates).

Do not add Product/Offer for fictional candles in a software demo. Vendl sells software on this page; the sample candle is not a purchasable merchant offer here. Do not add LocalBusiness for 120 fictional local makers, Recipe for an illustrative cost sheet, or HowTo purely to pursue a search enhancement. Omit SearchAction unless real site search exists and there is a clear semantic reason to describe it.

### Example base graph

This is a proposed production graph for the candle page, contingent on the page and `/sell` directory going live. It deliberately has no invented reviews, offers, images or dates. This is a semantic base, not a promise of software rich-result eligibility. Include matching information on the rendered page and merge with existing sitewide schema to avoid duplicate entities.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://vendl.app/#organization",
      "name": "Vendl",
      "url": "https://vendl.app/"
    },
    {
      "@type": "WebSite",
      "@id": "https://vendl.app/#website",
      "url": "https://vendl.app/",
      "name": "Vendl",
      "publisher": {"@id": "https://vendl.app/#organization"}
    },
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      "@id": "https://vendl.app/#software",
      "name": "Vendl",
      "url": "https://vendl.app/",
      "applicationCategory": "BusinessApplication",
      "publisher": {"@id": "https://vendl.app/#organization"},
      "description": "Commerce and production tools for businesses making products from ingredients, materials or parts."
    },
    {
      "@type": "WebPage",
      "@id": "https://vendl.app/sell/candles#webpage",
      "url": "https://vendl.app/sell/candles",
      "name": "Sell Candles Online — A Website for Candle Makers | Vendl",
      "description": "Explore Vendl for selling candles, managing orders and calculating production costs with Pro.",
      "inLanguage": "en",
      "isPartOf": {"@id": "https://vendl.app/#website"},
      "publisher": {"@id": "https://vendl.app/#organization"},
      "mainEntity": {"@id": "https://vendl.app/#software"},
      "about": {"@type": "Thing", "name": "Selling handmade candles online"},
      "breadcrumb": {"@id": "https://vendl.app/sell/candles#breadcrumb"}
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://vendl.app/sell/candles#breadcrumb",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://vendl.app/"},
        {"@type": "ListItem", "position": 2, "name": "What you make", "item": "https://vendl.app/sell"},
        {"@type": "ListItem", "position": 3, "name": "Candles", "item": "https://vendl.app/sell/candles"}
      ]
    }
  ]
}
```

Add offers only from verified pricing records. Use stable plan IDs and an appropriate billing-duration price specification when implementing recurring prices; do not present a monthly fee as a one-time purchase. Keep price currency aligned with the rendered version. Do not claim worldwide service eligibility simply because the page targets a global audience.

Validate syntax and vocabulary with Schema Markup Validator and feature eligibility with Google's Rich Results Test. These answer different questions. Inspect published URLs in Search Console. No test guarantees enhanced appearance. [General structured data rules](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [video](https://developers.google.com/search/docs/appearance/structured-data/video).

## 11. Internal linking and global architecture

Create `/sell` as a useful market directory with crawlable links and category groupings. If category hubs are added, give them a real discovery purpose and distinct content. Keep the agreed leaf URLs flat, such as `/sell/candles`; URL nesting is not required to express a useful navigation hierarchy.

Each page should link to its parent directory, relevant feature explanations and a small editorially chosen set of related markets/tools/guides. Three related markets and two or three resources are a sensible starting UI budget, not an SEO limit. Do not repeat all 120 links in every page footer. Use descriptive natural anchors at the point of relevance. Every launch page should have an incoming contextual or directory link. Use actual HTML anchors with href attributes. [Google link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).

For global English, use one canonical URL per niche and `lang="en"`. There is no need to manufacture US/AU/UK copies or hreflang entries when alternates do not exist. Currency preference alone does not require a separate indexable page. Provide a visible selector and stable crawlable core content; avoid forced geographic redirects. If real translations or regional versions are introduced later, implement reciprocal hreflang and appropriate canonicals for genuine alternates. [Google international guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

Use one canonical spelling in URLs; naturally explain aliases such as jewellery/jewelry and leashes/leads. Keep regional payment and compliance information explicit. Global marketing does not mean every payment provider supports merchants in every country. Retain real Australian customer stories with their true location; broaden the example set over time without manufacturing international testimonials.

## 12. Programmatic content model and publishing controls

Keep content in structured records rather than one unreviewed generated HTML blob. Shared plan data and feature claims should update centrally across all pages.

Required record groups:

| Group | Fields |
| --- | --- |
| Identity | slug, niche, aliases, parent, workflow variant, locale |
| Intent | primary query family, secondary questions, scope exclusions, overlapping pages |
| Copy | title, description, H1, hero text, workflow steps, FAQ answers |
| Evidence | feature IDs, source references, last verification date, reviewer, proof permissions |
| Media | real screenshot IDs, photo rights, alt text, demo URL and sample label |
| Calculator | input lines, units, yield, labour model, overhead model, pack size, currency presets, limitations |
| Conversion | primary destination, demo destination, plan disclosures, onboarding context |
| Links | related markets, feature pages, guides and tools with a reason for each relationship |
| Publishing | draft/reviewed/published, canonical, revision, substantive updated date |

Generation process: research brief → approved feature facts → draft content → generate structured page data → editorial review → render → automated checks → publish. Generated text must not invent customer outcomes, feature support, market statistics or regulatory requirements.

Automated publication gates should catch missing canonical/metadata, placeholder text, broken links, duplicate slug/H1, incorrect niche in copy, unverified plan references, missing media, invalid calculator defaults and invalid JSON-LD. Flag highly similar body copy for human review; no arbitrary uniqueness percentage proves quality.

Google's guidance allows useful AI assistance but warns against generating many pages without added value. A shared design is fine; each page must deliver a reason to exist. [Google guidance on generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content).

## 13. Technical implementation and maintenance

- Render essential copy, links, default calculator results and JSON-LD in initial HTML through static generation or server rendering. Load interactivity separately.
- Return genuine 404s for unknown slugs. Do not let arbitrary strings generate indexable generic pages.
- Use self-referencing canonicals on distinct published pages, not a canonical from every niche to `/sell`.
- Put only canonical, published, indexable URLs in the sitemap. Update lastmod for substantive changes rather than every build.
- Keep drafts out of sitemaps and use appropriate draft access/noindex controls. Do not block crawling and expect crawlers to see a noindex on the blocked page.
- Ensure beta and production do not become competing public copies at launch; choose the appropriate access/noindex or redirect strategy based on the beta environment's ongoing role.
- Centralise pricing, fee disclosures and feature availability. Review affected pages when the product changes.
- Run a full crawl over all 120 rendered pages for links, response codes, title/H1/canonical and required modules. Test each workflow variant's interactive behaviour separately.
- Verify mobile layout, accessible controls, currency coherence, calculator math and CTA/onboarding destinations before launch.

## 14. Measurement and experiments

Measure acquisition and business outcomes by niche, workflow variant, country, device and landing-page version. Preserve the first entry page, session entry page and referrer through signup using an appropriate first-party implementation. Treat absent referrers as unknown/direct, not proof that the visitor typed the address. Do not overwrite organic or AI referrals with internal CTA tracking parameters.

Suggested events: `sell_page_view`, `demo_open`, `calculator_interaction`, `calculator_result`, `cta_click`, `signup_completed`, `first_product_created`, `first_costing_saved`, `shop_published`, `first_order_received`, `pro_activated`.

Attach niche, template version and CTA position, not raw private ingredient recipes or customer details. Deduplicate server-confirmed signups/upgrades. A free signup has no actual purchase revenue: report it as a signup, and keep any modelled lead value separate and explicitly labelled. Track real subscription revenue independently from merchant sales processed through Vendl.

Initial experiments:

| Hypothesis | Test | Primary outcome |
| --- | --- | --- |
| Storefront proof helps visitors understand the outcome | Store preview versus product photo in hero | Activated sellers per eligible visitor |
| Costing creates stronger intent | Calculator above versus below workflow | Signup-to-first-product or first-costing activation |
| Clear plan boundaries reduce disappointment | Explicit Free/Pro clarification near CTA | Activation and upgrade quality, not CTA clicks alone |
| Contextual onboarding improves completion | Niche-aware setup versus generic setup | First product and shop publication |

Do not divide low traffic into 120 simultaneous A/B tests. Start with a few meaningful variants across related cohorts; preserve comparable devices and sources. Monitor search impressions, relevant queries and indexed pages, but judge commercial success through activated makers and retained paid users. Do not remove pages solely because they have little traffic in their first weeks.

## 15. Launch standard and build order

The minimum launch remains 100 pages; the planned inventory is 120. Prototype one page for each workflow variant, settle the design and components, then apply them across the full inventory before launch. This is implementation sequencing, not a reduction to a 12-page release.

Proposed internal quality rubric, not an external SEO score:

| Dimension | Points |
| --- | ---: |
| Clear audience, intent and differentiated scope | 15 |
| Accurate niche content and verified feature fit | 20 |
| Useful working demonstration/calculator | 20 |
| Evidence, media and honest claims | 15 |
| CTA, pricing and onboarding coherence | 10 |
| Mobile usability and accessibility | 10 |
| Technical SEO, links and schema accuracy | 10 |

Use 85/100 as an internal review target if useful, but never publish with a critical defect regardless of score. Critical defects include invented proof, incorrect plan pricing, broken primary CTA, misleading feature claims, inaccessible main content or materially wrong calculator results.

Recommended build sequence:

1. Confirm the feature/plan truth table and design tokens.
2. Prototype candles, cookies, crochet, 3D prints, pottery and personalised signs; verify that the last workflow is supported.
3. Build the shared calculator, storefront preview, pricing and schema generators.
4. Write and review the 120 niche records; resolve overlapping scopes before rendering.
5. QA every published page and representative interactions across devices.
6. Launch the full approved set with directory links, sitemap and measurement.
7. Improve pages using observed search intent, product usage and maker feedback.

The proposed advantage is concrete: an attractive niche storefront, a useful production-cost calculation, an honest explanation of the workflow and a clear next step into the same product experience.

## 16. Approved visual references and mockup implementation notes

### Directory mockup: `/sell`

[Open the directory mockup](https://chatgpt.com/library?file_id=libfile_19c4efa78b288191906fc5d32f45a315&account_id=personal).

![Vendl /sell maker directory visual reference](https://chatgpt.com/api/library/files/libfile_19c4efa78b288191906fc5d32f45a315/download)

### Expanded market-page mockup: `/sell/candles`

[Open the expanded candle mockup](https://chatgpt.com/library?file_id=libfile_3316d84978a48191a59d613a6fc8a994&account_id=personal).

![Vendl expanded candle landing page visual reference](https://chatgpt.com/api/library/files/libfile_3316d84978a48191a59d613a6fc8a994/download)

These image references are linked to the saved originals. They may require the owner's ChatGPT session. When handing this document to an agent outside ChatGPT, download the two originals and provide them alongside this Markdown file as `sell-hub-mockup.png` and `sell-candles-expanded-mockup.png`. Do not interpret an inaccessible authenticated link as evidence that no reference image exists.

Use the **expanded** candle mock as the leaf-page reference. The older smaller candle concept is superseded and not a third required design. The hub and leaf page should look like the same product family, but the hub should primarily help visitors find their business.

### Elements to preserve

- Existing Vendl wordmark; use the actual brand asset rather than redrawing a generated approximation.
- Cream ground, dark green type, green primary actions, pale sage accents, fine borders and warm maker photography.
- Short readable headings, clear content order and restrained visual density.
- Hero pairing of physical products and software outcome.
- Compact migration and community strips.
- Functional previews rather than decorative dashboards unrelated to the niche.

### Elements to improve during implementation

- Full-page mockups compress lower sections; real FAQs, legal text, footer and pricing need normal readable sizing.
- Remove accidental “Optional” annotations from generated graphics.
- Use actual controls, not images of controls, for search, currency, costing and FAQ interactions.
- Replace the generic candle imagery on non-candle leaf pages with relevant products.
- Keep generated demo businesses labelled. “Ember & Earth” is illustrative, not verified customer evidence.
- Replace generated dashboards with truthful UI. Product stock and order fulfilment status are different concepts.
- On the hub, show a “Pro” indicator or adjacent plan sentence for website/costing/marketing features where appropriate; the compact mock omits some of these details.
- Do not make all 120 pages inherit the image's seasonal “Spring” example. Use neutral collection names or contextually correct seasonal copy.
- All calculators use code-derived results, never numbers embedded in AI imagery.
- Reuse the current site font files/tokens; the images do not establish exact font families or colours.

## 17. Complete `/sell` hub specification

### Purpose and search scope

The directory connects global makers with the right Vendl use-case page. It is not a consumer marketplace, supplier directory or product catalogue. Users should immediately understand that they are choosing their business type, not shopping for candles or bread.

Canonical URL: `https://vendl.app/sell`.

Suggested title: `Sell What You Make Online — Tools for Makers | Vendl`.

Suggested meta description: `Make products from ingredients, materials or parts? Explore Vendl for 120 maker businesses, with tools for selling, costing, orders and marketing.` Only retain “120” when all 120 markets are published.

H1: `You make it. Vendl helps you sell it.`

Hero body: `From ingredients, materials or parts to products people love. Find the tools for your kind of business.`

Eyebrow: `For people who make things`.

Hero media: bread, a candle, a ceramic mug and a small wooden product as in the mock. Prefer composition with room for HTML text; do not put the heading inside the image.

Search label: `What do you make?` Placeholder: `Try candles, cookies or 3D prints`.

Primary CTA: `Start free`. Secondary: `Browse categories`, anchored to `#categories`.

Disclosure: `Free selling tools. Website and production tools with Pro.`

### Hub module order and behaviour

| Module | Required implementation |
| --- | --- |
| Header/breadcrumb | Existing site header; active What you make item. Home / What you make. |
| Hero/search | Immediately explain audience; search is discovery, not account creation. |
| Category navigation | Eight real anchors to corresponding sections of the full directory. |
| Category preview cards | Eight image-led cards, each with five selected niche links and a View all count. |
| All-business directory | All 120 ordinary links grouped by category in initial HTML; user-accessible without JavaScript. |
| Business essentials | Three compact demonstrations: storefront, costs, repeat-customer marketing; accurate plan disclosure. |
| Maker environments | Kitchen, studio and workshop examples; do not restrict positioning to home businesses. |
| Migration strip | Supported sources and correct import limits. |
| Hub FAQ | Three to five broad questions; no duplicated 120-page FAQ list. |
| Final CTA/footer | Start free; normal site navigation. |

Use these category IDs, labels and totals, derived from the registry rather than hardcoded independently:

| ID / anchor | Category label | Count | Five preview links, using registry URLs |
| --- | --- | ---: | --- |
| baking | Baking | 15 | Cookies, Cakes, Bread, Sourdough, Cupcakes |
| food-drink | Food & drink | 20 | Chocolates, Jam, Hot sauce, Tea, Coffee |
| beauty-fragrance | Beauty & fragrance | 15 | Soap, Candles, Wax melts, Bath bombs, Lip balm |
| jewelry-accessories | Jewellery & accessories | 12 | Earrings, Bracelets, Necklaces, Polymer-clay jewellery, Hair accessories |
| clothing-textiles | Clothing & textiles | 16 | Crochet, Knitwear, Handmade bags, Quilts, T-shirts |
| home-workshop | Homewares & woodwork | 16 | Pottery, Wooden products, Handmade furniture, Resin products, Wreaths |
| art-custom | Art & personalised goods | 14 | Art prints, Greeting cards, Stickers, Laser-cut products, 3D-printed products |
| pets-toys | Pets, toys & more | 12 | Dog treats, Pet bandanas, Soft toys, Slime, Miniatures |

**Resolve the mock's “View all” controls concretely:** each card's View all link goes to `/sell#directory-{categoryId}`. “Browse all 120 businesses A–Z” goes to `/sell#all-businesses`, where an A–Z toggle can change presentation. Do not introduce unplanned category landing pages simply to make these buttons work. Category chip anchors should target the same directory sections. Native `<details>` groups may reduce visual length, but links must be present in initial HTML and reveal on anchor navigation. Default expanded groups on desktop are simplest. No modal-only or search-only access to the full list.

The live page will be slightly longer than the visual concept because it includes the real complete directory. Eight groups of 12–20 links remain manageable. The preview cards are discovery highlights, not the only links in the document.

### Search requirements

1. Search the same published registry used to render pages. Include labels, slugs and curated aliases; never offer draft or nonexistent pages.
2. Normalise case, surrounding whitespace, diacritics and common plural variations. Rank exact label matches first, then aliases, then prefix/partial matches. With 120 records, a small local index is enough.
3. Examples: jewelry/jewellery → handmade-jewelry; biscuits → cookies; doughnuts → donuts; keyrings → keychains; dog leads → dog-leashes; 3d prints → 3d-printed-products; personalised/personalized tumblers → personalized-tumblers.
4. Show a plain results list with the business label and category, each as a normal link. An explicit list below the field is preferable to a complex ARIA combobox unless the team implements that pattern correctly.
5. Announce result count politely to assistive technology. Provide Clear search. Keyboard users can tab to results; Escape clears an optional popup if implemented. Never trap focus.
6. For no results, say: `No exact match yet. Browse the categories below, or explore Vendl for your business.` Keep the ordinary directory available.
7. Treat a small typo suggestion as a suggestion, never an automatic redirect.
8. Do not create indexable `/sell/search/...` or query-generated landing pages. Prefer local state or a fragment for filters. If query parameters are supported for shareability, use the clean canonical and do not expose combinatorial crawl links.
9. No network request containing private user input is necessary for this client-side directory. Analytics can record a matched niche ID and no-result count instead of raw search text.
10. All category and leaf navigation works when JavaScript is disabled. Disable/hide the enhanced search control with a clear browse fallback rather than leave a dead input.

### Hub responsive layout

Desktop: four category cards per row. Tablet: two. Narrow mobile: one card or two only when labels and targets remain readable. Each card has a consistent image aspect ratio, explicit category H3 and readable list. Avoid horizontal card carousels for the main directory. Allow category chips to wrap rather than creating a hidden overflow navigation. Keep search full width on mobile.

### Hub FAQ answers to adapt after feature verification

**Is Vendl only for home businesses?** No. Position it for independent makers and small production businesses working in kitchens, studios or workshops. Do not claim enterprise manufacturing functionality.

**Can I sell products from more than one category?** Explain using products/categories within one business if supported. Distinguish this from multiple independent businesses in one account; the reviewed homepage states each account runs one business.

**Do I need a website to start?** Free provides a shop link. Pro adds a full website and custom-domain connection.

**What if my product is not listed?** Explain the ingredients/materials/parts audience and link to the general platform overview or contact option. Do not auto-generate a new indexable page from a visitor's search.

## 18. Shared build contracts and feature verification

### Repository-first implementation

Before changing code, inspect the actual repository instructions, routing, UI components, content storage, i18n, analytics and existing JSON-LD. Use established conventions. The suggested filenames below are conceptual boundaries, not a demand to replace the site's framework:

- `sell-categories`: eight category definitions and labels.
- `sell-markets`: exactly 120 validated records, one canonical slug each.
- `sell-feature-catalog`: supported features, plan access, region constraints, verification source/date.
- `sell-pricing`: shared current billing data, never a manually copied price per page.
- `SellHub`: directory and search.
- `SellMarketPage`: reusable rendering pipeline driven by each record.
- `CostingDemo`: deterministic shared calculation engine plus niche input configuration.
- `SellStructuredData`: shared entity IDs and page-specific graph generators.
- `SellAnalytics`: attribution-safe event instrumentation.

If the repository uses Next.js App Router, a possible placement is `app/sell/page.tsx` and `app/sell/[slug]/page.tsx` with static params from the allowlisted registry. This is conditional architecture, not confirmation of the repository's stack. Unknown slugs must return a real 404. Avoid per-request AI page generation.

### Feature truth table

The following reflects the beta homepage reviewed for this project, not an independent audit of every application workflow. Verify against live product behaviour and plan configuration before publication. Use one source of truth across UI, copy, pricing, FAQs and schema.

| Capability | Positioning baseline | Verification requirement |
| --- | --- | --- |
| Shop link; products, stock, orders | Free and Pro | Confirm actual product/variant and stock behaviour. |
| Pre-orders | Free and Pro | Confirm order windows, collection, deposits and limits before specific claims. |
| Subscriptions/memberships | Free and Pro | Confirm provider/country/product constraints; do not assume identical to pre-orders. |
| QR checkout | Free and Pro | Demonstrate the real customer flow; do not claim it is a universal card-reader replacement. |
| Customer lists/restock signups | Free and Pro | Distinguish list collection, notification automation and bulk marketing entitlements. |
| Website, pages, blog, custom domain | Pro | Domain purchase is separate; verify editor capability. |
| Materials, recipes, batches, costing | Pro | Verify stock deduction, yield and unit conversion before describing them as automatic. |
| Email marketing | Pro | Verify limits and relevant consent handling. |
| Social creation/scheduling/publishing | Credits and plan-dependent access | Confirm supported networks, formats, account requirements and allowances. |
| Video editing/AI clips | Credits and plan-dependent access | Verify inputs, caption workflow and included monthly credits. |
| Imports | Pro | Verify supported sources/CSV mapping, products/customers and excluded data. |
| PayPal | Pro on reviewed homepage | Verify country/provider eligibility and current entitlement. |
| Maker community | Free and Pro on reviewed homepage | Confirm destination and gated course access before claiming all content is free. |
| Vendl transaction fees | Free includes 2.5% on applicable card/Tap & Go/pay-later sales; Pro removes Vendl fee | Confirm current fee basis, exemptions, processor fees and market rules. |

The mock's USD 14.99/month and monthly social/video allowances are presentation examples from the reviewed homepage. Do not hardcode them across 120 records. Each currency/plan selection must read the same current configuration. Do not imply unlimited AI output. Never copy third-party platform fees from memory into comparison content.

### Minimum market record

Use a validated schema equivalent to this contract. Fields describing proposed UI functionality are build requirements, not evidence that the application already supports them.

```typescript
interface SellMarket {
  slug: string;
  label: string;
  aliases: string[];
  categoryId: string;
  variant: 'fresh' | 'batch' | 'labour' | 'machine' | 'unique' | 'personalized';
  status: 'draft' | 'reviewed' | 'published';
  seo: { title: string; description: string; primaryIntent: string; exclusions: string[] };
  hero: { heading: string; body: string; imageId: string; imageAlt: string };
  example: { productName: string; storeLabel: string; isFictional: boolean };
  calculator: {
    saleUnit: string;
    outputLabel: string;
    currencyPresetId: string;
    inputs: Array<{ id: string; label: string; unit: string; value: number; scope: 'batch' | 'unit' }>;
    saleableYield: number;
    unitsPerPack: number;
    assumptions: string[];
  };
  storefront: { heading: string; body: string; previewId: string };
  operations: { heading: string; body: string; steps: Array<{ title: string; description: string; featureId: string }> };
  sellingModes: Array<{ featureId: string; example: string }>;
  marketing: { productName: string; socialExample: string; videoExample: string; emailExample: string };
  faqs: Array<{ question: string; answer: string; evidenceIds: string[] }>;
  relatedSlugs: string[];
  resourceLinks: Array<{ href: string; label: string; reason: string }>;
  evidence: Array<{ id: string; source: string; checkedAt: string; claim: string }>;
  review: { contentReviewer: string; productReviewer: string; reviewedAt: string; version: number };
}
```

Never expose internal reviewer/checklist metadata in the user interface unless it provides real reader value. Model prices and shared legal copy separately. Use canonical URL construction from the production origin and validated slug, not a mutable per-record arbitrary URL.

### Required distinct content per market

Each market gets: its own audience promise; one realistic product/pack example; relevant cost inputs and unit; a supported order scenario; a marketing example using that same product; at least three market-specific FAQ answers; a scope boundary versus neighbouring markets; a relevant image/preview; and editorially selected related links. Generic plan/payment questions can be shared where appropriate. A product-name substitution does not meet this requirement.

### Sensible content budgets

As drafting guidance, not ranking rules: hero body 25–50 words; showcase explanations 40–90 words each; operational steps 20–45 words each; selling-mode examples 15–30 words; FAQ answers usually 40–100 words. A complete leaf page may land around 900–1,600 useful words, but shorter or longer is acceptable when justified. Do not add filler to hit a count or truncate a necessary answer to satisfy it.

The hub should remain substantially lighter in prose. Its useful content is the directory, category context and clear route into the product, not 120 paragraphs of repetitive summaries.

## 19. Hub schema and generation rules

Use the shared Organization and WebSite IDs from section 10. The hub is a CollectionPage whose main entity is an ItemList of the visible market links. Leaf pages remain WebPage descriptions of the same Vendl software. A list does not guarantee a search carousel.

Generate the hub list from the same complete registry used by the visible directory. The full production list contains 120 entries with positions 1–120; use a stable order matching the default full-directory order. If only reviewed pages are public during a private staging review, counts follow that public subset. The final launch acceptance target is the full 120.

Example generator, not a full framework implementation:

```javascript
function buildSellHubGraph(publishedMarkets) {
  const origin = 'https://vendl.app';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': `${origin}/#organization`,
        name: 'Vendl', url: `${origin}/`
      },
      {
        '@type': 'WebSite', '@id': `${origin}/#website`,
        name: 'Vendl', url: `${origin}/`,
        publisher: { '@id': `${origin}/#organization` }
      },
      {
        '@type': 'CollectionPage', '@id': `${origin}/sell#webpage`,
        url: `${origin}/sell`, name: 'Sell What You Make Online — Tools for Makers | Vendl',
        inLanguage: 'en', isPartOf: { '@id': `${origin}/#website` },
        publisher: { '@id': `${origin}/#organization` },
        mainEntity: { '@id': `${origin}/sell#markets` },
        breadcrumb: { '@id': `${origin}/sell#breadcrumb` }
      },
      {
        '@type': 'ItemList', '@id': `${origin}/sell#markets`,
        name: 'Maker businesses supported by Vendl',
        numberOfItems: publishedMarkets.length,
        itemListElement: publishedMarkets.map((market, index) => ({
          '@type': 'ListItem', position: index + 1,
          item: { '@type': 'WebPage', '@id': `${origin}/sell/${market.slug}#webpage`,
            url: `${origin}/sell/${market.slug}`, name: market.label }
        }))
      },
      {
        '@type': 'BreadcrumbList', '@id': `${origin}/sell#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'What you make', item: `${origin}/sell` }
        ]
      }
    ]
  };
}
```

Use the real implementation's sanitised serialisation when inserting JSON-LD into HTML; escape `<` in serialised JSON to prevent script termination from content fields. Avoid duplicate schema from a theme/plugin plus the custom generator. For image/video nodes, resolve real asset URLs and metadata; omit absent optional values instead of outputting placeholders.

Do not add all market keywords to the Organization's description, knowsAbout or sameAs. Social profile sameAs entries describe actual Vendl profiles, not authority websites about a niche. Actual dates should come from publication/review records; do not refresh dates daily without substantive updates.

## 20. Canonical launch registry: all 120 market pages
Each row is a required individual brief to combine with the shared content contract and section 21 authoring instructions. These are recommendations for product fit, not validated keyword-volume rankings. All leaf paths begin `/sell/`. Keep these canonical slugs stable; spelling alternatives belong in aliases and copy.
Variants: **fresh** = fresh batches; **batch** = repeatable batch production; **labour** = labour-intensive making; **machine** = machine-assisted production; **unique** = individual/limited pieces; **personalized** = supported product customisation. A business may use several modes; the variant selects the demonstration emphasis, not a software restriction.

### Baking — 15 pages
| # | Market and canonical URL | Variant / example | Calculator inputs | Distinct scope and content | Related market slugs |
| --- | --- | --- | --- | --- | --- |
| 1 | **Baked goods** · `/sell/baked-goods` | fresh · Mixed weekend bakery box | Recipe components, mixed yields, box and packing time | Broad bakery menu and weekly order collection; keep product-specific detail on child markets | `cookies`, `bread`, `cakes` |
| 2 | **Cookies** · `/sell/cookies` | fresh · Six-cookie gift bag | Dough batch, cookies per bag, bag and label | Batch-to-pack pricing and limited flavour releases; distinguish from general baking | `brownies`, `cupcakes`, `baked-goods` |
| 3 | **Cakes** · `/sell/cakes` | personalized · Decorated celebration cake | Cake layers, filling, decoration hours, board and box | Standard size/options and deposits where verified; no invented design-approval workflow | `cupcakes`, `cheesecakes`, `cake-pops` |
| 4 | **Cupcakes** · `/sell/cupcakes` | fresh · Box of six cupcakes | Sponge yield, frosting, liners and six-pack box | Box sizes and occasion orders rather than individual cake commissions | `cakes`, `cake-pops`, `cookies` |
| 5 | **Bread** · `/sell/bread` | fresh · Mixed artisan loaf menu | Flour, yeast, energy allocation and bags | General loaf assortment and collection schedule; sourdough owns starter-specific narrative | `sourdough`, `pastries`, `baked-goods` |
| 6 | **Sourdough** · `/sell/sourdough` | fresh · Weekly country-loaf release | Flour, starter allocation, saleable loaves and bag | Recurring bread drops, order deadlines and maker-managed fermentation lead time | `bread`, `cinnamon-rolls`, `crackers` |
| 7 | **Brownies** · `/sell/brownies` | fresh · Six-piece brownie box | Tray cost, saleable cuts, toppings and box | Tray-to-box yield and mixed flavours; separate from cookies | `cookies`, `fudge`, `chocolates` |
| 8 | **Donuts** · `/sell/donuts` | fresh · Mixed donut dozen | Dough yield, frying inputs, glazes and box | Fresh daily releases and dozens; include doughnut alias | `pastries`, `cinnamon-rolls`, `cupcakes` |
| 9 | **Macarons** · `/sell/macarons` | fresh · Twelve-macaron gift box | Shell/filling batches, matched saleable pairs, insert | Fragile gift packaging and paired-unit yield; do not count shells as finished macarons | `cookies`, `chocolates`, `cupcakes` |
| 10 | **Pies** · `/sell/pies` | fresh · Family-sized savoury pie | Pastry, filling, tins, bake overhead and packaging | Whole pies versus individual sizes and collection; regional handling guidance kept separate | `pastries`, `prepared-meals`, `baked-goods` |
| 11 | **Pastries** · `/sell/pastries` | fresh · Weekend pastry assortment | Dough, butter, fillings, labour and mixed box | Assorted pastry menus and fresh release windows; not every bakery product | `bread`, `donuts`, `cinnamon-rolls` |
| 12 | **Cinnamon rolls** · `/sell/cinnamon-rolls` | fresh · Four-roll weekend box | Dough/filling yield, icing and four-pack packaging | Scheduled roll drops and pack quantities | `sourdough`, `donuts`, `pastries` |
| 13 | **Cheesecakes** · `/sell/cheesecakes` | fresh · Whole cheesecake with topping options | Base/filling cost, tins, toppings and chilled packaging | Whole versus portion sales and collection; do not promise unrestricted shipping | `cakes`, `pies`, `cupcakes` |
| 14 | **Muffins** · `/sell/muffins` | fresh · Six-muffin breakfast pack | Batter yield, inclusions, liners and pack | Breakfast packs and recurring local orders | `bread`, `cookies`, `baked-goods` |
| 15 | **Cake pops** · `/sell/cake-pops` | personalized · Twelve themed cake pops | Cake mix, coating, sticks, decoration and box | Per-piece labour and occasion sets; explain actual supported custom choices | `cakes`, `cupcakes`, `chocolates` |

### Food & drink — 20 pages
| # | Market and canonical URL | Variant / example | Calculator inputs | Distinct scope and content | Related market slugs |
| --- | --- | --- | --- | --- | --- |
| 16 | **Chocolates** · `/sell/chocolates` | batch · Assorted chocolate gift box | Chocolate, fillings, saleable pieces, insert and box | Selection boxes and seasonal gifting; production/temperature logistics belong to maker | `candy`, `fudge`, `marshmallows` |
| 17 | **Candy and confectionery** · `/sell/candy` | batch · Bagged fruit sweets | Ingredients, batch yield, bag weight and labels | Broad confectionery and bagged sweets; chocolate/fudge pages own their processes | `chocolates`, `fudge`, `marshmallows` |
| 18 | **Fudge** · `/sell/fudge` | batch · Three-flavour fudge box | Batch ingredients, trimmed yield, cut size and box | Slab-to-piece costing and mixed boxes | `candy`, `chocolates`, `brownies` |
| 19 | **Marshmallows** · `/sell/marshmallows` | batch · Handmade marshmallow gift bag | Ingredients, cutting loss, coating and packaging | Flavour batches, gift bags and seasonal collections | `candy`, `chocolates`, `fudge` |
| 20 | **Jam** · `/sell/jam` | batch · Small-batch strawberry jam | Fruit, sugar, saleable jars, lids and labels | Seasonal batches and jar sizes; food preservation advice needs separate expert review | `chutney`, `pickles`, `nut-butter` |
| 21 | **Chutney** · `/sell/chutney` | batch · Apple chutney gift jars | Produce, spices, cooking yield, jars and labels | Savoury preserves and gift collections; distinguish from sweet jam | `jam`, `pickles`, `spice-blends` |
| 22 | **Pickles** · `/sell/pickles` | batch · Cucumber pickle jars | Produce, brine, drained fill, jars and lids | Jar yield and release timing; avoid automatic shelf-life or safety claims | `chutney`, `jam`, `hot-sauce` |
| 23 | **Hot sauce** · `/sell/hot-sauce` | batch · Three-heat-level sauce set | Peppers, ingredients, saleable volume, bottles | Heat variants, bottle sizes and discovery bundles | `barbecue-sauce`, `spice-blends`, `pickles` |
| 24 | **Barbecue sauce** · `/sell/barbecue-sauce` | batch · Original and smoky sauce bottles | Recipe ingredients, reduced volume, bottle and seal | Recipe variants and BBQ bundles; do not duplicate hot-sauce copy | `hot-sauce`, `spice-blends`, `chutney` |
| 25 | **Spice blends** · `/sell/spice-blends` | batch · Three-blend cooking kit | Ingredient weights, blend yield, jars and labels | Own blended recipes and pack weights rather than commodity spice resale | `tea`, `hot-sauce`, `barbecue-sauce` |
| 26 | **Tea blends** · `/sell/tea` | batch · Loose-leaf tea sampler | Tea/herbs, blend proportions, fill weight and pouch | Blenders packaging their own tea; sampler and refill packs | `coffee`, `spice-blends`, `granola` |
| 27 | **Roasted coffee** · `/sell/coffee` | batch · Two-roast coffee bag subscription | Green beans, roast loss, roast overhead and valve bag | Roasters, grind/size variants and repeat orders; not cafe POS claims | `tea`, `granola`, `chocolates` |
| 28 | **Granola** · `/sell/granola` | batch · Weekly granola pouch | Ingredients, bake yield, pack weight and pouch | Batch-to-bag costing and replenishment orders | `nut-butter`, `dried-fruit`, `tea` |
| 29 | **Nut butter** · `/sell/nut-butter` | batch · Roasted almond butter jar | Nuts, added ingredients, processing yield, jar | Jar sizes and repeat purchases; actual allergen information remains maker's responsibility | `granola`, `jam`, `chocolates` |
| 30 | **Popcorn** · `/sell/popcorn` | batch · Caramel popcorn party bags | Kernel yield, coating, saleable bags and packaging | Party quantities and flavour bundles | `candy`, `crackers`, `dried-fruit` |
| 31 | **Pasta** · `/sell/pasta` | fresh · Fresh pasta weekend packs | Flour, eggs, finished weight, labour and pack | Fresh versus dried packs and collection; describe actual fulfilment limits | `prepared-meals`, `crackers`, `spice-blends` |
| 32 | **Crackers** · `/sell/crackers` | batch · Seeded cracker packs | Dough, baking loss, breakage and pack weight | Saleable pack weight and mixed savoury ranges | `bread`, `spice-blends`, `granola` |
| 33 | **Dried fruit** · `/sell/dried-fruit` | batch · Dried apple snack pouches | Fresh produce, drying yield, energy allocation and pouch | Fresh-to-dried yield and bag sizes | `granola`, `popcorn`, `nut-butter` |
| 34 | **Kombucha** · `/sell/kombucha` | batch · Seasonal bottled kombucha | Tea/sugar inputs, saleable volume, bottles and caps | Batch releases and local repeat sales; no unsupported fermentation or bottle-return automation | `tea`, `prepared-meals`, `spice-blends` |
| 35 | **Prepared meals** · `/sell/prepared-meals` | fresh · Weekly meal-prep menu | Recipe batches, portions, containers and packing labour | Weekly menus, order cut-offs and pickup/delivery; no medical nutrition promises | `pasta`, `pies`, `spice-blends` |

### Beauty & fragrance — 15 pages
| # | Market and canonical URL | Variant / example | Calculator inputs | Distinct scope and content | Related market slugs |
| --- | --- | --- | --- | --- | --- |
| 36 | **Soap** · `/sell/soap` | batch · Goat-milk soap collection | Oils/base, additives, saleable bars, wrap and label | Bar yield, scent variants and restock; curing managed by maker unless verified | `bath-bombs`, `body-scrubs`, `shampoo-bars` |
| 37 | **Candles** · `/sell/candles` | batch · Cedar and fig jar candle | Wax, fragrance, wick, vessel, labour and packaging | Jar sizes, scent releases, restock and repeat customer marketing | `wax-melts`, `reed-diffusers`, `room-sprays` |
| 38 | **Wax melts** · `/sell/wax-melts` | batch · Six-cavity melt clamshell | Wax/fragrance, usable grams, cavities and clamshell | Pack yield and scent samplers without wick/jar assumptions | `candles`, `reed-diffusers`, `room-sprays` |
| 39 | **Bath bombs** · `/sell/bath-bombs` | batch · Three-bomb gift set | Ingredients, failed units, decorations and gift box | Saleable units and gift bundles; no therapeutic claims | `bath-salts`, `soap`, `body-scrubs` |
| 40 | **Bath salts** · `/sell/bath-salts` | batch · Bath-salt refill pouch | Salt blend, additions, pack weight and pouch | Jar versus refill sizes and scent blends | `bath-bombs`, `body-scrubs`, `soap` |
| 41 | **Body butter** · `/sell/body-butter` | batch · Whipped body-butter tub | Butters/oils, filled weight, tub and label | Batch-to-tub costs and sizes; distinguish from lotions and medical treatment | `lotions`, `body-scrubs`, `lip-balm` |
| 42 | **Body scrubs** · `/sell/body-scrubs` | batch · Sugar scrub jar | Sugar/salt, oils, fragrance, filled weight and jar | Scrub variants and replenishment; no unsupported skin-treatment claims | `body-butter`, `bath-salts`, `soap` |
| 43 | **Lip balm** · `/sell/lip-balm` | batch · Three-flavour balm set | Wax/oils, fill weight, tubes and labels | Small-unit batching and multipacks | `lip-gloss`, `body-butter`, `soap` |
| 44 | **Lip gloss** · `/sell/lip-gloss` | batch · Tinted gloss collection | Base, pigment, tube, applicator and filling time | Shade variants and packaging cost; distinguish gloss from balm | `lip-balm`, `press-on-nails`, `perfume` |
| 45 | **Shampoo bars** · `/sell/shampoo-bars` | batch · Solid shampoo bar duo | Ingredients, saleable bars, wrapping and labour | Solid-product ranges and pack sizes; don't promise universal hair outcomes | `soap`, `bath-bombs`, `body-butter` |
| 46 | **Lotions** · `/sell/lotions` | batch · Body-lotion bottle | Formulation inputs, fill quantity, bottle/pump and label | Bottle sizes and recurring orders; manufacturing/safety guidance separately reviewed | `body-butter`, `body-scrubs`, `soap` |
| 47 | **Perfume** · `/sell/perfume` | batch · Discovery scent set | Fragrance materials, carrier, vial/spray and packaging | Discovery sets and full-size variants; actual carrier restrictions require verification | `room-sprays`, `reed-diffusers`, `candles` |
| 48 | **Reed diffusers** · `/sell/reed-diffusers` | batch · Home fragrance diffuser | Base, fragrance, vessel, reeds and box | Refill and complete-set options; distinguish from candles | `room-sprays`, `candles`, `wax-melts` |
| 49 | **Room sprays** · `/sell/room-sprays` | batch · Two-scent room spray set | Base, fragrance, bottle/sprayer, labels | Scent variants and packaging; don't claim disinfectant or therapeutic effects | `reed-diffusers`, `perfume`, `candles` |
| 50 | **Press-on nails** · `/sell/press-on-nails` | personalized · Hand-painted nail set | Tips, finishes, design labour, adhesive pack and box | Set sizing and design choices only through supported inputs; no invented virtual try-on | `lip-gloss`, `earrings`, `hair-accessories` |

### Jewellery & accessories — 12 pages
| # | Market and canonical URL | Variant / example | Calculator inputs | Distinct scope and content | Related market slugs |
| --- | --- | --- | --- | --- | --- |
| 51 | **Handmade jewellery** · `/sell/handmade-jewelry` | labour · Coordinated jewellery collection | Components, metal, making hours and gift packaging | Broad maker storefront; earrings, clay and beads own specific workflows | `earrings`, `polymer-clay-jewelry`, `beaded-jewelry` |
| 52 | **Earrings** · `/sell/earrings` | labour · Pair of statement earrings | Components per pair, findings, labour and display card | Pair-level pricing and design drops; not single-component resale | `necklaces`, `bracelets`, `polymer-clay-jewelry` |
| 53 | **Bracelets** · `/sell/bracelets` | labour · Adjustable bracelet range | Beads/chain, clasp, sizes, labour and pouch | Sizing and multi-item collections | `beaded-jewelry`, `necklaces`, `rings` |
| 54 | **Necklaces** · `/sell/necklaces` | labour · Pendant necklace collection | Chain lengths, pendant, clasp and assembly | Length/material variants and matching collections | `earrings`, `bracelets`, `handmade-jewelry` |
| 55 | **Rings** · `/sell/rings` | labour · Handmade silver ring | Metal, size-related usage, finishing time and box | Ring sizes and per-piece labour; don't invent resizing or custom quoting tools | `necklaces`, `bracelets`, `handmade-jewelry` |
| 56 | **Polymer-clay jewellery** · `/sell/polymer-clay-jewelry` | batch · Clay earring collection | Clay, pigments, findings, batch yield and finish labour | Colour batches and shared components; relate to earrings without duplicating them | `earrings`, `beaded-jewelry`, `handmade-jewelry` |
| 57 | **Beaded jewellery** · `/sell/beaded-jewelry` | labour · Beaded necklace and bracelet set | Bead counts, stringing supplies, clasps and labour | Component quantities and coordinated sets | `bracelets`, `necklaces`, `earrings` |
| 58 | **Hair accessories** · `/sell/hair-accessories` | labour · Handmade clips and headbands | Bases, trims, fabric, assembly and card | Broad clip/headband range; scrunchies page owns sewn elastic products | `scrunchies`, `earrings`, `handmade-hats` |
| 59 | **Scrunchies** · `/sell/scrunchies` | batch · Three-scrunchie bundle | Fabric yield, elastic, sewing minutes and tags | Batch cutting and bundle economics | `hair-accessories`, `handmade-bags`, `handmade-clothing` |
| 60 | **Enamel pins** · `/sell/enamel-pins` | batch · Artist-designed pin collection | Production run cost, setup allocation, rejects and backing cards | Designer-led outsourced production; do not imply hand-enamelling or factory integration | `stickers`, `keychains`, `art-prints` |
| 61 | **Keychains and keyrings** · `/sell/keychains` | personalized · Personalised acrylic keyring | Blank/material, fittings, finishing and packaging | Material and personalisation choices; search aliases keyrings/keychains | `laser-cut-products`, `resin-products`, `enamel-pins` |
| 62 | **Leather belts** · `/sell/leather-belts` | labour · Handmade leather belt | Leather yield, buckle, finishing and making time | Length variants and hardware costs; distinguish belts from raw leather | `leather-wallets`, `handmade-bags`, `handmade-clothing` |

### Clothing & textiles — 16 pages
| # | Market and canonical URL | Variant / example | Calculator inputs | Distinct scope and content | Related market slugs |
| --- | --- | --- | --- | --- | --- |
| 63 | **Handmade clothing** · `/sell/handmade-clothing` | labour · Small-run garment collection | Fabric, trims, cutting waste, sewing time and packaging | Independent production and size ranges; not second-hand resale or generic dropshipping | `baby-clothes`, `aprons`, `costumes` |
| 64 | **Printed T-shirts** · `/sell/t-shirts` | machine · Screen-printed T-shirt release | Blanks, print consumables, setup allocation and labour | In-house decoration and run size; no automatic print-on-demand fulfilment claims | `embroidered-products`, `handmade-clothing`, `tote-bags` |
| 65 | **Embroidered products** · `/sell/embroidered-products` | machine · Embroidered tote collection | Blank item, thread, stabiliser, machine allocation and finish time | Decorated products across bases; clarify machine time versus active labour | `t-shirts`, `tote-bags`, `handmade-hats` |
| 66 | **Handmade bags** · `/sell/handmade-bags` | labour · Lined shoulder bag | Fabric/leather, lining, hardware and assembly hours | Construction and material variants; tote page focuses simpler batch production | `tote-bags`, `leather-wallets`, `handmade-clothing` |
| 67 | **Tote bags** · `/sell/tote-bags` | batch · Printed canvas tote run | Fabric/blanks, handles, print setup and sewing labour | Repeatable tote runs and bundles | `handmade-bags`, `t-shirts`, `embroidered-products` |
| 68 | **Leather wallets** · `/sell/leather-wallets` | labour · Hand-stitched card wallet | Leather yield, thread, hardware and stitching time | Pattern-level material use and hand finishing | `leather-belts`, `handmade-bags`, `keychains` |
| 69 | **Baby clothes** · `/sell/baby-clothes` | labour · Small-batch baby romper | Fabric, fasteners, sizes, sewing and packaging | Maker-made babywear sizes; product safety claims require specialist verification | `handmade-clothing`, `knitwear`, `quilts` |
| 70 | **Aprons** · `/sell/aprons` | labour · Linen workshop apron | Fabric, straps, hardware and sewing time | Size/options and small business orders; no unsupported wholesale portal promise | `handmade-clothing`, `tote-bags`, `embroidered-products` |
| 71 | **Costumes** · `/sell/costumes` | personalized · Made-to-order costume set | Fabric, trims, accessories, fitting/assembly labour | Seasonal orders and lead times; bespoke consultation handled honestly | `handmade-clothing`, `handmade-hats`, `soft-toys` |
| 72 | **Crochet products** · `/sell/crochet` | labour · Crochet accessory collection | Yarn quantity, hooks/overhead allocation, making hours | Finished handmade goods, labour pricing and limited capacity; not pattern downloads | `knitwear`, `soft-toys`, `macrame` |
| 73 | **Knitted products** · `/sell/knitwear` | labour · Hand-knitted winter hat | Yarn by size, making hours, finishing and tags | Garment/accessory sizes and seasonal collections; distinguish from crochet technique | `crochet`, `handmade-hats`, `baby-clothes` |
| 74 | **Quilts** · `/sell/quilts` | unique · Handmade patchwork quilt | Top fabric, backing, batting, quilting hours and shipping box | One-off pieces and labour-heavy pricing | `cushion-covers`, `handmade-clothing`, `knitwear` |
| 75 | **Tufted rugs** · `/sell/tufted-rugs` | unique · Custom-colour tufted rug | Yarn, backing, adhesive, machine overhead and trimming | Size-dependent costs and finishing; no automatic design-proof claims | `macrame`, `cushion-covers`, `resin-products` |
| 76 | **Macramé** · `/sell/macrame` | labour · Macramé plant hanger | Cord length, rings/dowels and knotting hours | Material length and labour; finished hangers and wall pieces | `crochet`, `tufted-rugs`, `ceramic-planters` |
| 77 | **Cushion covers** · `/sell/cushion-covers` | batch · Linen cushion-cover pair | Fabric yield, zip, thread, sewing and pack | Covers versus filled cushions explicitly distinguished | `quilts`, `handmade-bags`, `handmade-clothing` |
| 78 | **Handmade hats** · `/sell/handmade-hats` | labour · Handmade fabric hat | Fabric/yarn, lining, trims, size and making time | Construction and head-size variants; knitwear page owns broader knitted garments | `knitwear`, `handmade-clothing`, `hair-accessories` |

### Homewares & woodwork — 16 pages
| # | Market and canonical URL | Variant / example | Calculator inputs | Distinct scope and content | Related market slugs |
| --- | --- | --- | --- | --- | --- |
| 79 | **Pottery and ceramics** · `/sell/pottery` | unique · Studio ceramic collection | Clay, glaze, firing allocation, rejects and labour | Broad studio releases; mugs and planters own product-specific pack/shipping cases | `handmade-mugs`, `ceramic-planters`, `sculptures` |
| 80 | **Handmade mugs** · `/sell/handmade-mugs` | batch · Small-batch ceramic mug | Clay, glaze, firing, saleable mugs and protective packaging | Volume/glaze variants and mug collection drops | `pottery`, `ceramic-planters`, `coasters` |
| 81 | **Ceramic planters** · `/sell/ceramic-planters` | batch · Three-size planter range | Clay by size, glaze, firing and protective box | Size, drainage/saucer options and bulky packing | `pottery`, `handmade-mugs`, `concrete-homewares` |
| 82 | **Wooden products** · `/sell/wooden-products` | labour · Small wooden homeware collection | Timber yield, fittings, finish and workshop labour | Broad finished woodcraft; raw timber resale excluded | `cutting-boards`, `wooden-toys`, `handmade-furniture` |
| 83 | **Cutting boards** · `/sell/cutting-boards` | labour · End-grain cutting board | Timber, adhesive, finish, sanding and packaging | Dimensions, timber variants and labour; no unverified food-safety certifications | `wooden-products`, `coasters`, `handmade-furniture` |
| 84 | **Handmade furniture** · `/sell/handmade-furniture` | unique · Small-run side table | Timber, hardware, finish, making hours and fulfilment | Standard products and collection/delivery; bespoke quotes only if actual workflow supports them | `wooden-products`, `picture-frames`, `cutting-boards` |
| 85 | **Wooden toys** · `/sell/wooden-toys` | batch · Wooden stacking toy | Timber, components, finish, saleable sets and labour | Set-level costs and small runs; no invented toy safety approval | `soft-toys`, `handmade-dolls`, `wooden-products` |
| 86 | **Picture frames** · `/sell/picture-frames` | labour · Wooden art-frame range | Moulding, glazing, backing, fittings and assembly | Dimensions and breakage-safe packing; distinguish from art prints | `wooden-products`, `art-prints`, `paintings` |
| 87 | **Wooden signs** · `/sell/wooden-signs` | personalized · Personalised workshop sign | Wood blank, lettering/finish, setup and labour | Text/size options using supported fields; avoid proof-approval claims | `laser-cut-products`, `keychains`, `wooden-products` |
| 88 | **Coasters** · `/sell/coasters` | batch · Four-coaster gift set | Base material, finish, backing and set packaging | Finished sets across materials; link to material-specific production pages | `resin-products`, `wooden-products`, `concrete-homewares` |
| 89 | **Resin products** · `/sell/resin-products` | batch · Resin tray and coaster range | Resin/hardener, pigments, failed units, finishing | Material mix and saleable yield; maker manages curing/safety | `coasters`, `keychains`, `jesmonite-products` |
| 90 | **Jesmonite products** · `/sell/jesmonite-products` | batch · Cast decorative tray collection | Casting materials, pigment, sealer, waste and labour | Specific material-based cast goods; do not confuse with all resin/concrete | `concrete-homewares`, `resin-products`, `coasters` |
| 91 | **Concrete homewares** · `/sell/concrete-homewares` | batch · Concrete vessel collection | Mix, mould allocation, sealer, rejects and packing | Heavy cast goods, size/yield and packing | `ceramic-planters`, `jesmonite-products`, `coasters` |
| 92 | **Stained glass** · `/sell/stained-glass` | unique · Stained-glass suncatcher | Glass yield, foil/lead, solder, labour and protection | One-off designs, fragile fulfilment and labour | `sculptures`, `christmas-ornaments`, `paintings` |
| 93 | **Wreaths** · `/sell/wreaths` | labour · Seasonal decorative wreath | Base, foliage/decorations, assembly and large box | Seasonal order windows and maker material choices | `christmas-ornaments`, `wooden-signs`, `macrame` |
| 94 | **Christmas ornaments** · `/sell/christmas-ornaments` | batch · Personalised ornament collection | Blanks/materials, fittings, decoration and set box | Holiday production deadlines and gift sets; evergreen URL with reviewed seasonal copy | `wreaths`, `laser-cut-products`, `keychains` |

### Art & personalised goods — 14 pages
| # | Market and canonical URL | Variant / example | Calculator inputs | Distinct scope and content | Related market slugs |
| --- | --- | --- | --- | --- | --- |
| 95 | **Original paintings** · `/sell/paintings` | unique · Original canvas collection | Canvas, paint allocation, studio hours and packaging | One-off physical originals and studio launches; prints own reproduction economics | `art-prints`, `sculptures`, `picture-frames` |
| 96 | **Art prints** · `/sell/art-prints` | machine · Limited print collection | Paper, printing/run charges, saleable prints and mailers | Physical editions and size variants; not digital downloads or originals | `paintings`, `greeting-cards`, `picture-frames` |
| 97 | **Sculptures** · `/sell/sculptures` | unique · Small sculptural collection | Materials, armature/base, studio labour and crating | Unique pieces, editions where relevant and delivery constraints | `pottery`, `paintings`, `miniatures` |
| 98 | **Greeting cards** · `/sell/greeting-cards` | batch · Six-card stationery pack | Printing, card stock, envelopes and packing | Single cards versus multipacks and occasion ranges | `wedding-invitations`, `art-prints`, `stickers` |
| 99 | **Wedding invitations** · `/sell/wedding-invitations` | personalized · Printed invitation suite | Paper, print setup, envelopes, assembly and design labour | Suite quantities and supported custom details; no invented proof approvals | `greeting-cards`, `rubber-stamps`, `bookmarks` |
| 100 | **Stickers** · `/sell/stickers` | machine · Artist sticker sheet pack | Paper/vinyl, printing, cut yield and packaging | Sheets versus individual stickers and batch waste | `enamel-pins`, `art-prints`, `greeting-cards` |
| 101 | **Notebooks** · `/sell/notebooks` | batch · Hand-bound notebook collection | Paper, covers, binding materials and labour | Physical construction and sizes; planners own dated/structured interiors | `planners`, `bookmarks`, `rubber-stamps` |
| 102 | **Physical planners** · `/sell/planners` | batch · Undated printed planner | Print run, covers, binding, setup allocation and packing | Physical planners and edition launches; exclude printable digital files | `notebooks`, `stickers`, `bookmarks` |
| 103 | **Rubber stamps** · `/sell/rubber-stamps` | personalized · Custom maker-logo stamp | Rubber, mount, design setup and cutting labour | Physical stamp production and supported custom input | `wedding-invitations`, `notebooks`, `laser-cut-products` |
| 104 | **Bookmarks** · `/sell/bookmarks` | batch · Illustrated bookmark set | Paper/material, print, tassels and pack | Low-unit-cost sets, finishing and gift add-ons | `art-prints`, `notebooks`, `greeting-cards` |
| 105 | **Personalised tumblers** · `/sell/personalized-tumblers` | personalized · Name-personalised tumbler | Blank, transfer/vinyl, consumables and decoration time | Text/design variants and supported order details; no automatic engraving integration | `laser-cut-products`, `keychains`, `t-shirts` |
| 106 | **Laser-cut products** · `/sell/laser-cut-products` | machine · Laser-cut desk organiser | Sheet nesting/yield, machine allocation, finish and assembly | Broad fabricated goods; signs/keychains own narrow products | `wooden-signs`, `keychains`, `3d-printed-products` |
| 107 | **3D-printed products** · `/sell/3d-printed-products` | machine · Printed planter collection | Filament/resin, failed prints, machine allocation and finish | Physical printed products, time/capacity and size variants; no STL or printer-farm automation claims | `laser-cut-products`, `miniatures`, `ceramic-planters` |
| 108 | **Craft kits** · `/sell/craft-kits` | batch · Beginner macramé kit | Components, instructions, packing labour and box | Assembly bill of materials and complete kit quantities | `macrame`, `crochet`, `beaded-jewelry` |

### Pets, toys & more — 12 pages
| # | Market and canonical URL | Variant / example | Calculator inputs | Distinct scope and content | Related market slugs |
| --- | --- | --- | --- | --- | --- |
| 109 | **Dog treats** · `/sell/dog-treats` | batch · Baked dog-treat bags | Recipe batch, dried/baked yield, bag weight and labels | Own-produced treats, pack sizes and repeat orders; no veterinary or health promises | `pet-bandanas`, `pet-toys`, `granola` |
| 110 | **Dog collars** · `/sell/dog-collars` | labour · Handmade adjustable collar | Webbing/leather, buckle, hardware and sewing | Size ranges and components; do not infer tested strength or safety | `dog-leashes`, `pet-bandanas`, `pet-beds` |
| 111 | **Dog leashes and leads** · `/sell/dog-leashes` | labour · Handmade rope dog lead | Rope/webbing, clips, stitching/splicing and labour | Length and hardware options; lead/leash synonyms share this URL | `dog-collars`, `pet-bandanas`, `pet-toys` |
| 112 | **Pet bandanas** · `/sell/pet-bandanas` | batch · Three-size pet bandana | Fabric yield, fasteners, sewing and tags | Size-based fabric usage and seasonal drops | `dog-collars`, `dog-leashes`, `pet-beds` |
| 113 | **Pet beds** · `/sell/pet-beds` | labour · Washable pet-bed range | Fabric, fill, zip, sewing and bulky packaging | Sizes, material costs and fulfilment; no unverified durability claims | `pet-bandanas`, `cushion-covers`, `dog-collars` |
| 114 | **Pet toys** · `/sell/pet-toys` | batch · Handmade tug-toy range | Fabric/rope, components, assembly and packaging | Product variants and sets; do not claim indestructibility or universal safety | `dog-treats`, `dog-leashes`, `soft-toys` |
| 115 | **Soft toys** · `/sell/soft-toys` | labour · Handmade plush animal | Fabric, stuffing, components, pattern allocation and labour | Finished plush production and limited collections; safety guidance separately reviewed | `handmade-dolls`, `crochet`, `wooden-toys` |
| 116 | **Handmade dolls** · `/sell/handmade-dolls` | unique · Cloth doll collection | Body materials, clothing, hair, details and hours | Labour-rich dolls and accessories; distinguish from general plush animals | `soft-toys`, `costumes`, `miniatures` |
| 117 | **Slime** · `/sell/slime` | batch · Colour-themed slime tubs | Ingredients, mix-ins, saleable volume, tubs and labels | Texture/colour variants and batch yield; no universal child-safety claims | `playdough`, `craft-kits`, `miniatures` |
| 118 | **Playdough** · `/sell/playdough` | batch · Four-colour playdough set | Ingredients, colour batches, tub weights and packaging | Colour sets and repeat production; don't claim edible or allergy-safe by default | `slime`, `craft-kits`, `wooden-toys` |
| 119 | **Miniatures** · `/sell/miniatures` | unique · Painted model collection | Base materials/prints, paints, assembly and finish hours | Physical scale models and painting labour; verify commercial design rights | `3d-printed-products`, `sculptures`, `handmade-dolls` |
| 120 | **Handmade fishing lures** · `/sell/fishing-lures` | labour · Small-run lure collection | Bodies, hardware, hooks, coatings and finishing | Size/design variants and niche maker releases; no unsupported performance claims | `wooden-products`, `resin-products`, `3d-printed-products` |

## 21. Full instructions for creating each of the 120 market pages

### Step 1 — Create the brief before writing copy

Take the row from section 20. Record the maker, the finished physical product, the production method, the sale unit, the likely order type and the most important business problem. Identify the neighbouring pages and preserve the distinction in the row's scope column. For broad pages such as handmade jewellery or baked goods, explain the multi-product business and link to specific products. For narrower pages, demonstrate that product's economics and ordering pattern.

Research the primary search intent and vocabulary using current results in relevant English-speaking markets. Capture date, query, country and representative ranking page types. Distinguish “buy candles” consumer searches from “sell candles online” maker intent. Do not advertise the page as a demand-validated opportunity merely because Shopify has a similar URL. If results suggest a different intent, adjust headings/content within the approved scope and record the finding.

Required research questions for every record:

- What unit does the maker sell: piece, pair, set, pack, jar, weight or order?
- Which input or production factor is easy to undercount?
- How does the business sell: ready stock, drops, pre-orders, repeat orders or custom variants?
- Which three Vendl capabilities materially support that workflow?
- Which claim requires feature or regional verification before publication?
- What does this page explain that its nearest sibling does not?

Use primary product documentation for feature claims, actual merchant permission for stories and credible domain sources for specialist factual guidance. The marketing page does not need an essay on chemistry, food law or product safety. Where that information matters, explain the boundary and link to maintained regional resources.

### Step 2 — Choose the actual demonstration

Use the row's sample product or a more suitable real maker example. Keep the same product identity across storefront, calculator, operations and marketing previews. Give it a plausible size/pack, material list and fulfilment method. Generated photography can illustrate an example store, but must not impersonate a real customer or manufacture proof of a real outcome.

If using a real merchant, obtain approval for assets, quotations and any business figures. If using a fictional store, mark it “Example store” wherever a visitor could confuse it for customer proof. Never expose customer names, emails, order details or confidential costing data in screenshots.

### Step 3 — Build a defensible cost example

Define each input's quantity, unit, pack purchase quantity/price and scope. Calculate usage cost as `usedQuantity / purchasedQuantity * purchasedPrice` after compatible unit conversion. Materials belonging to one finished unit must not be accidentally added once per batch. Choose positive saleable yield and explain waste once. Add labour, overhead allocation and appropriate per-unit packaging.

Provide one fully worked initial state in rendered HTML, then allow changes through real inputs. Keep precision internally, round only for display and use locale-aware currency formatting. Do not silently change quantities or assumed pack sizes when the user edits one number.

For multi-piece packs:

- Example only: a batch costs 48 currency units and produces 48 cookies.
- Six cookies per bag gives eight saleable bags if all cookies are used.
- Add 0.50 packaging per bag: cost per bag is `48 / 8 + 0.50 = 6.50`.
- If yield is not divisible by pack size, state how remainder units are handled; do not count partially filled packs as fully saleable.

For one-off pieces, set saleable yield to one and use relevant labour/overhead fields. For outsourced manufacturing, allocate setup charges over an explicit planned saleable run, not an invented guaranteed future sales volume. For machine work, use separately labelled active labour and machine overhead assumptions. Do not calculate lifetime net profit from a single product example.

A public demo may offer calculations without login even though persistent production features require Pro; label that distinction. Only offer importing/saving the public calculation into the app when the bridge actually exists and has been tested.

### Step 4 — Write the hero and metadata

Suggested title pattern: `Sell [product] Online — [audience or benefit] | Vendl`. Rewrite awkward plural/singular combinations. Keep one subject; do not stack every query variation into the title. A useful title that may truncate is better than meaningless abbreviations to satisfy a fixed character count.

Hero structure: one promise containing the product; one short explanation connecting selling to the most relevant operational benefit; one primary signup action; one secondary demo action; one plan clarification. Do not repeat the same “Know what each one earns” sentence on all 120 pages if it does not fit the sale unit.

Examples of tailored H1s:

| Market | Candidate H1 |
| --- | --- |
| Cookies | Sell your cookies online. Take orders for your next batch. |
| Sourdough | Give your next bake a place to sell. |
| Soap | Sell your handmade soap. Know your cost per bar. |
| Crochet | Sell your crochet work. Price the time you put into it. |
| Pottery | Give your next pottery collection its own shop. |
| 3D prints | Sell your 3D prints. Bring materials and making costs together. |

If a creative headline does not explicitly name the primary topic, include it clearly in the adjacent eyebrow and opening sentence. Do not sacrifice immediate comprehension for a slogan. The meta description should describe the actual page and accurate plan boundary, without unsupported superlatives or fake urgency.

### Step 5 — Write the expanded feature sections

For each demonstration section, use this sequence: maker's practical situation → supported Vendl action → visible example → expected operational benefit expressed without a numerical guarantee.

Example for candles: “Launching a new scent? Create the product and open a pre-order window so customers can order before the release.” Only describe the actual window behaviour supported by the product.

Example for crochet: “Include your making time in the price. Add the hours used for one piece alongside its yarn and packaging.” Avoid claiming the software makes customers willing to pay a particular wage.

Required section treatment:

1. Storefront: one relevant product/collection with options; clarify free shop link versus Pro website.
2. Costing: the market's worked example with assumptions.
3. Operations: real products, available stock and order handling; clarify made-to-order capacity versus finished stock.
4. Selling modes: select modes that fit the row. If subscriptions add little to one-off paintings, prioritise collection releases, stock sales and in-person selling instead.
5. Marketing: social example, short clip concept and email subject for the same product. Use product launch, making process or restock content; do not invent performance results.
6. Migration: concise shared accurate copy; no unsupported claim of a one-click full-site migration.
7. Community: concise shared support proposition.
8. Pricing: shared current records, not custom prose prices.

### Step 6 — Produce the niche FAQ set

Start with three common product questions and at least three niche questions. Use real questions a maker would ask; do not convert every keyword into a forced FAQ. Each answer begins with a clear direct response, then gives useful detail or a relevant limitation.

| Variant | Niche question prompts |
| --- | --- |
| Fresh | How do I open orders for a collection day? How do I price a box from one batch? How do I stop taking more orders than I can fulfil? |
| Batch | How do different pack sizes affect cost? Can I sell scent/flavour variants? How do I tell customers when a batch is available? |
| Labour | How do I include my making time? Can I sell ready-made and made-to-order products? How do sizes/components affect price? |
| Machine | How do I account for material waste? How do I separate machine overhead from labour? What order details can customers select? |
| Unique | How do I sell an item with only one available? How do I price a one-off piece? Can customers collect instead of having it shipped? |
| Personalized | What choices can customers submit? How do I price setup plus units? How are lead times/deposits handled in the supported workflow? |

These are writing prompts, not pre-approved feature claims. If a requested capability is unavailable, state the actual supported alternative or limitation. Shared FAQs may cover starting free, own domain and imports. Avoid a generic “What is a candle?” FAQ on a software purchase page.

### Step 7 — Apply semantic structure and internal links

Use one H1 and a clear H2/H3 outline. Keep direct answers adjacent to their headings. Explain material → production → unit cost → price relationships where relevant. Use tables for costs/comparisons and short steps for workflows. Do not repeatedly insert every synonym, location or entity into the prose.

Use the three related slugs in section 20 as the initial link recommendations. Verify relevance editorially; if changing them, require a real registry target and document why. Link the breadcrumb and a “Browse all maker businesses” control to `/sell`. Relevant feature links belong beside their explanation; avoid sending every section to signup.

Link to supporting guides/tools only if live. Until a substantial pricing guide exists, the local calculator and written explanation can serve the immediate need. Do not render placeholder cards saying “coming soon” across every market page.

### Step 8 — Render, verify and mark reviewed

Populate the structured record; run schema and content validation; render using the shared template; test the calculator and CTA; review the actual page at desktop/mobile widths. Only mark `reviewed` after both editorial and product checks pass. “All fields populated” is not equivalent to a good page.

Keep a delivery manifest recording each slug, category, variant, content-review status, asset status, calculator status, SEO/schema status and unresolved issue. Do not silently leave half the registry empty while reporting all 120 pages complete.

### Ready-to-use instruction for an implementation agent

> Implement the `/sell` hub and all 120 canonical market pages defined in this specification inside the existing Vendl repository. Read the repository instructions first. Preserve the current homepage brand and reuse existing UI, pricing, authentication and analytics components. The expanded candle mockup and directory mockup define the visual direction; this specification and verified product behaviour override incidental image text. Build a validated market registry, a crawlable complete directory, accessible search, six workflow variants, real costing demos, accurate expanded features, contextual CTAs, honest proof, stable JSON-LD and production canonicals. Every market must use its individual row's product example, cost inputs and differentiated scope. Do not generate 120 noun-swapped copies, invent features/reviews, or create unapproved URL variants. Prototype the six variants, then complete the full 121-page deliverable. Run the acceptance checks, report gaps explicitly and provide a page manifest plus preview routes. Follow the existing release process; do not claim deployment without verifying it.

## 22. Asset production and visual consistency

### Required asset set

| Asset | Scope | Requirements |
| --- | --- | --- |
| Brand wordmark/fonts | Shared | Actual repository assets and licensed font files. |
| Hub hero | One | Bread/candle/ceramic/wood composition; useful crop at mobile. |
| Category photography | Eight | Distinct recognisable product family, consistent warmth and crop. |
| Niche hero/product scene | 120 contextual assignments | Each should visibly match its market; reuse only when subject and framing remain honest. |
| Example storefronts | Reusable UI plus niche data | Readable product names and actual supported options; fictional examples labelled. |
| Operations captures | Per supported variant, with niche data where possible | No private data; truthful product views. |
| Marketing previews | Per niche or generated from shared templates | Same example product across post, clip and email; correct plan labels. |
| Social sharing image | One per page, including hub | Clear title, relevant product and Vendl brand; no false statistics. |

Do not promise all 120 pages need unique commissioned photography. Quality and relevance matter more than unique file hashes. Avoid repeating one candle image on unrelated pages. If AI imagery is used, it is illustrative content, not a customer photo or evidence of real software functionality. Generate individual assets rather than cropping the full-page mock to fake working product screens.

Recommended output handling: store originals separately; generate responsive WebP/AVIF where supported; keep width/height metadata; avoid shipping unnecessarily large originals. Use 1200×630 social cards as a starting format and test actual crop behaviour. Alt text describes visible useful subject, not the keyword list. If the same preview is already explained by adjacent text and purely decorative, use empty alt text as appropriate.

Asset naming convention, adapted to the repository: `sell/{slug}/hero`, `sell/{slug}/store-preview`, `sell/{slug}/marketing-preview`, `sell/categories/{categoryId}`. Central asset records should track rights/permission, source, subject, alt text and example/customer status. Do not include transient scratch or authenticated ChatGPT image URLs in the deployed public site; import the approved source assets into the site's own asset pipeline.

## 23. Acceptance tests and launch QA

### Registry and crawl checks — all 121 pages

- Exactly 120 unique approved market slugs and eight category totals summing to 120; `/sell` is the additional 121st route.
- No slug whitespace, case variation, query string or duplicated spelling page.
- Every published slug returns a successful HTML page with its correct title, H1, canonical and breadcrumb.
- Unknown slug returns a real 404, not a generic “sell anything” template.
- Every leaf is linked in the server-rendered full directory; no JavaScript/search dependency for discovery.
- Every suggested related market exists; no self-links masquerading as related cards.
- Category anchors work; View all controls expose the correct complete group.
- All internal links resolve; no beta production links, localhost, placeholder domains, broken guide paths or dead demo buttons.
- Sitemap includes the canonical hub and leaves, excludes drafts and filter states, and uses meaningful lastmod values.
- Canonical, Open Graph URL and JSON-LD URL/IDs agree with production URL conventions.
- Content is not accidentally marked noindex in production; staging remains appropriately protected.

### Content checks — every market

- Hero names/clearly identifies the intended business and selling purpose.
- Example product, photography, units, calculator and marketing preview refer to the correct niche.
- No accidental candle/cookie boilerplate on unrelated pages.
- Broad and narrow markets have different scopes and useful content.
- At least three niche-specific FAQ answers; all feature assertions verified.
- Prices/fees/credits are current and shared, including country/provider limits where relevant.
- Real proof has permission; sample stores are labelled; no fake reviews or customer counts.
- Consumer safety, legal or certification claims have an appropriate verified basis or are omitted.
- No asserted profitability, ranking or conversion guarantee.
- No unsupported enterprise manufacturing, automatic traceability, machine integration or custom approval system.

### Calculator unit tests

- Candle example: `68 / 12 + 0.80` displays 6.47; at price 18, pre-fee/tax contribution displays 11.53.
- Cookie example: 48 total cost / 8 complete packs + 0.50 displays 6.50.
- Pair/set examples allocate component counts to the finished sale unit.
- Zero/negative yield is rejected accessibly; invalid numbers do not display NaN/Infinity.
- Decimal quantities and compatible unit conversion preserve cost.
- Non-divisible pack yields show an explicit remainder assumption.
- Waste is not applied twice.
- Margin formula rejects `1 - feeRate - targetMargin <= 0`.
- Fixed transaction fee allocation respects units per order assumptions.
- Currency switching uses explicit presets/conversion, not symbol substitution.
- Reset restores documented defaults; fields remain usable with keyboard and screen reader.

### Interaction checks

- Hub search: exact matches, aliases, plural variants, a typo suggestion, blank input and no results.
- Search result list links to correct markets; counts announce without excessive interruption.
- Full directory works with JavaScript disabled.
- CTA destination matches label and preserves approved niche context; login does not unexpectedly discard the journey.
- Free signup is not silently routed into a paid checkout without clear user choice.
- Public demo does not create a real order or charge a card.
- “Save calculation” is omitted or tested end to end with entitlement disclosure.
- FAQ expand/collapse works by keyboard; focus remains visible.
- Currency, billing cadence and plan disclosures remain consistent across UI and schema.
- Mobile sticky CTA does not cover calculator controls, content or consent UI.

### Schema and technical checks

- JSON-LD parses; stable shared entity IDs; no contradictory duplicate nodes.
- Hub ItemList length and positions match the visible initial full directory.
- Breadcrumbs match real navigation and live ancestors.
- No fake Product offers for demo merchandise; no invented reviews.
- Schema Markup Validator checks vocabulary; Rich Results Test checks supported feature eligibility. Do not alter true content just to remove an expected missing-review eligibility warning.
- Inspect representative published URLs for HTML/rendering and crawl access.
- Test each template variant at 320, 390, 768 and 1440 px, enlarged text and keyboard-only navigation.
- Check missing images/fonts, layout shifts, script errors and slow interactions; record lab and eventual field performance separately.

### Analytics QA

Hub events: `sell_hub_view`, `sell_category_click`, `sell_market_click`, `sell_search_result_click`, `sell_search_no_results`. Leaf events follow section 14. Include stable niche/category IDs and placement (`hero`, `directory`, `pricing`, `footer`) without changing traffic-source attribution.

Test a visitor arriving organically, browsing the hub and leaf, then signing up. Confirm landing page, referral information and internal journey survive without being overwritten by internal tracking. Test direct visits separately. Signup has no purchase revenue; record actual Vendl subscription revenue only on the appropriate confirmed event. Merchant sales volume is not Vendl subscription revenue. Consent-dependent analytics should follow the existing implementation and applicable requirements.

### What a completed build report must contain

List total routes, category counts, per-page review completion, feature verification gaps, automated check results, manual device coverage, sample preview URLs and any release blockers. Provide real screenshots of the implemented hub and six variants after implementation; do not recycle the concept mocks as evidence that code matches them.

## 24. Delivery sequence, ownership and definition of done

### Recommended sequence

1. Inspect repository and product truth; resolve branding, existing pricing and supported feature boundaries.
2. Convert the 120-row registry into validated structured content and create the eight categories.
3. Build the hub with the complete directory and basic functional navigation before search enhancement.
4. Build the expanded candle reference and five other workflow examples using actual components.
5. Verify the common calculator, pricing, CTAs, schema and analytics once at component level, plus variant-specific tests.
6. Produce the remaining market content/assets, preserving the individual briefs and reviewing each record.
7. Run the full 121-page crawl, content gates and all acceptance checks; correct defects before release.
8. Apply the existing release process, verify production output and submit/refresh the sitemap through the normal workflow.
9. Monitor page discovery, relevant queries, activation and product fit; improve based on evidence rather than arbitrary word count.

### Ownership

A product owner verifies capabilities and plan boundaries. A content reviewer checks niche fit, factual statements, scope and clarity. A designer checks consistency and usability. An engineer checks routing, performance, accessibility, schema and integration. One person may hold several roles, but the checks must still happen. Do not claim specialist craft expertise for a reviewer without that experience.

### Definition of done

- The `/sell` hub and all 120 approved leaf pages are implemented, reviewed and reachable.
- Both visual directions are recognisable in actual components, with responsive layouts and readable content.
- All eight category counts and complete-directory links derive from the same registry.
- Each niche has the required specific example, calculator, operations and marketing content.
- Expanded website, stock/orders, selling modes, marketing, imports and community coverage is present without burying visitors in repeated feature lists.
- Every public claim, price and plan boundary is verified; unresolved capabilities are not presented as supported.
- Calculators and CTAs work; no image-only functional UI.
- Structured data represents visible entities truthfully and uses stable IDs.
- All 121 routes pass the applicable crawl/quality checks and the shared/variant interactions pass their tests.
- Preview evidence and a page-status manifest are delivered; deployment is reported only if actually performed and verified.

This specification supplies the full launch inventory and build instructions. It does not claim that 120 finished copy drafts, 120 unique photo sets or deployed pages already exist. Those are implementation outputs to produce from these briefs.
