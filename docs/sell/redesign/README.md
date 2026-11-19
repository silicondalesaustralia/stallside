# Vendl /sell — HTML design handoff

Open sell-hub.html and sell-candles.html from this folder. Keep assets/, sell.css and sell.js alongside the files. No npm build is required. The pages use local photos; the CSS requests DM Sans and DM Serif Display from Google Fonts with system fallbacks when offline.

## Included

- sell-hub.html: /sell with all 120 market links rendered in HTML, eight category cards, working search, category navigation and FAQs.
- sell-candles.html: complete candle landing-page example for /sell/[slug].
- sell.css: shared responsive styling, breakpoints, focus states and reduced-motion handling.
- sell.js: directory search, candle calculator and illustrative dashboard tabs.
- markets.json: 120-market registry used to render the directory.
- assets/: local illustrative stock photographs and source URLs.
- mocks/: the two approved design references.

These replace the supplied static scaffold. They are not edits to your React repository or a deployed site. The existing TSX files were named in the handoff but their actual source code was not provided.

## Design direction

Warm cream surfaces, forest green type, green CTAs, editorial serif section headings, rounded image cards, full-width photographic heroes, restrained borders and compact application concepts. The approved mocks guide the composition. Stock imagery is substituted rather than claiming a pixel-identical recreation of the generated mock photographs.

Every shop/dashboard/social/email illustration is a labelled design concept. Ember & Earth is the fictional demonstration brand from the supplied scaffold, not a customer, working store or real Vendl screenshot. Product image repetition is intentional placeholder photography; replace with approved scent-specific imagery in production. Video art is a cover concept, not a broken playable video.

## What works

- Search filters the HTML registry; aliases include 3D prints, jewellery and candle making.
- View-all links open the full directory and jump to its category.
- Category chips scroll to cards.
- FAQs use native details/summary.
- Dashboard example tabs change their table and support arrow, Home and End keys.
- Calculator responds to all nine inputs, rejects invalid yield/cost/price values and supports reset.
- Negative contribution is displayed rather than hidden.

Navigation between the two included pages uses local filenames. Other market links and signup/platform/pricing links go to vendl.app. This package does not create 119 additional standalone market pages or verify that their production routes are already live.

## Pricing and plan boundaries

Free is a shop link and selling tools. Website, domain and saved production costing are Pro. Email is Pro; social and video use credits. The calculator demo is free to try.

No unverified Pro amount is hardcoded: the supplied scaffold said 'From pricing source'. The Pro CTA links to current pricing. In React, replace this with your existing canonical pricing component and locale-aware currency data, not a second hardcoded price source. Verify current transaction fee copy and feature entitlements against the application before launch.

The calculator uses unrounded intermediate numbers:

- Materials = wax 20 + fragrance 8 + wicks 2 + jars/lids 18 = USD 48.
- Batch = materials 48 + labour 15 + overheads 5 = USD 68.
- Per unit = 68 / 12 + 0.80 = 6.4666…; display USD 6.47.
- Contribution at USD 18 = 11.5333…; display USD 11.53.
- Contribution / price = 64.074…%; display 64.1%.

Contribution is before payment/platform fees and tax, not guaranteed net profit. The examples use USD explicitly; changing the displayed currency symbol is not currency conversion.

## Porting to the existing React build

1. Keep existing route loaders, published-market registry, analytics and signup behavior.
2. Translate the header, hero, category cards and sections into the named components: SellHub.tsx, SellMarketPage.tsx and sections/*.
3. Move the CSS tokens/layouts into sell-styles.ts or a dedicated stylesheet. Scope global body/heading rules to the sell layout if other site pages share styles.
4. Replace file links: sell-hub.html → /sell; sell-candles.html → /sell/candles. Replace absolute vendl URLs with the application's existing route helpers where appropriate.
5. Keep all market links server-rendered. Render the directory from getPublishedMarkets(), preserving 120 published entries and category totals. Do not render missing/draft pages just to satisfy a count.
6. Replace imperative DOM listeners in sell.js with React state/event handlers. Do not install those listeners alongside duplicate React handlers. Preserve keyboard tab handling and native details behavior.
7. Use shared calculator logic across variants. Candle-specific labels and defaults must not leak into food/textile pages.
8. Use your approved asset pipeline/Next Image if applicable. Supply dimensions, optimise images and preload only the actual hero asset; lazy-load lower-page photos.
9. Replace labelled UI concepts with accurate product screenshots when ready; keep examples clearly identifiable. Do not replace a concept with invented customer proof.
10. Render JSON-LD from the same data as the visible content. Stable site IDs are included; avoid duplicate global Organization/WebSite nodes if the app already emits them.
11. Preserve entry=sell-page and business_type context on market signup CTAs. Apply your existing central CTA implementation to final/footer CTAs too.
12. Keep pricing, credits and plan entitlements centrally configured.

## SEO / structured data

Both pages have title, description, canonical and JSON-LD. The hub has a CollectionPage and ItemList for the 120 visible directory entries. The candle page is a WebPage; no fictional candle Product/Offer, customer ratings or review markup is emitted. BreadcrumbList is included for each route. The fictional store preview must never become a merchant product listing in schema.

The preview uses production canonical URLs intentionally. If hosted on staging, set noindex at the staging deployment level; do not copy staging noindex onto the production routes. Verify the application's canonical slash conventions before integrating.

## Validation performed

- JavaScript syntax check.
- Calculator default, invalid zero-yield and negative-contribution checks executed in Node with a minimal DOM harness.
- HTML parsing, local asset paths, unique element IDs, JSON-LD parsing and 120 unique directory entries checked.
- Photography inspected as a contact sheet.

Browser-rendered QA could not complete: Chromium launch is blocked by the execution environment's socket restrictions. No desktop/mobile screenshot validation is claimed. Check both files in Chrome/Safari at 390px, 768px, 1024px and 1440px before production. In particular verify hero crops, font loading, mobile calculator layout and search/anchor scrolling.

No backend, checkout, account or current production links were exercised. This is a design implementation handoff, not a deployed release.
