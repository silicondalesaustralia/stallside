# Vendl blog agent: playbook

The agent runs in two stages on GitHub Actions. It never publishes; Jono reviews everything in `/admin/blog`.

1. **Evening planner** (9pm Australia/Adelaide, `scripts/blog-agent/plan.ts`): recommends 10 ranked ideas and emails them. Each has a "Write this" link.
2. **Writer** (`scripts/blog-agent/write.ts`, started when an idea is picked, up to 3 per evening): researches and drafts one post or update, with images, into the review queue. Nothing is written if nothing is picked.

Vendl is moving from a farm-stand checkout tool to a full ecommerce platform for home producers and small sellers, competing with Shopify, Wix, Square Online, WooCommerce and Bakesy. The audience: farm stands, home bakers, makers, market stallholders and small online shops, mostly in Australia.

## Planner: choosing tonight's 10

Inputs: blog context (existing posts, backlog topics, recent rejections and discarded revisions), the Search Console report, knowledge base articles, recent commits on `main` (shipped) and the preview branch (upcoming), and live web search for news.

Aim for a mix across the 10. Across a week no single source should exceed half the ideas.

- **Search Console (2–4 ideas).** Take the top opportunities.
  - Page is a published DB post (slug in `context.posts`, `status: PUBLISHED`) → recommend an **update** (`targetPostSlug`). Skip it if `contentUpdatedAt` or `lastRevisionAt` is under 21 days old, or it has a pending revision.
  - Page is a hand-built reference page (`/sell-food-from-home/...`, `/cottage-food-laws/...`) or a hand-coded article (`context.codeArticles`) → recommend a **new guide** that answers the query cluster in depth and links to that page. Never target these for updates.
  - Page is a landing page and the intent is commercial ("app", "software", "best", "price") → skip it; it needs a page change, not a post.
  - Informational queries ("how to", "can I", "what is") that only a sales page or the home page ranks for → **new post** targeting the cluster.
  - The report's `tier`: `strict` = genuine striking distance, so favour updates. `loose` = young-site fallback, so favour new guides that cover whole clusters.
- **News (1–3 ideas).** Search the web for the last ~72 hours. Sources: Shopify, Square, Wix, WooCommerce, Stripe and Bakesy changelogs, blogs and pricing pages; RBA surcharging, ACCC, ATO small business and GST updates; FSANZ and state food authorities; farmers market associations; Google Search Central and Merchant Center. Recommend only items that materially affect small sellers, have a genuine Vendl angle and aren't already covered. Set `timeSensitive: true` and `section: NEWS`.
- **Shipped features and knowledge base (2–3 ideas).** Deeper guides on features in the knowledge base or recent `main` commits, framed by the broader ecommerce benefit rather than as a product tour.
- **Market and comparison topics (1–3 ideas).** Evergreen guides that help sellers choose and run their setup: platform comparisons, fees explained, pre-orders, inventory, selling at markets and online.
- **Never recommend** a topic that duplicates an existing post, repeats a rejected angle (read `recentRejections` and `recentDiscardedRevisions`), or describes a feature only on the preview branch.
- **Rank by** expected value to readers and search: real demand (impressions), timeliness, fit with Vendl's audience, and how clearly Vendl can add something useful. `score` 0–100.

## Writer: one picked idea

Read `WRITING.md` in full and follow it. Then:

- **New post:** write the complete draft. Choose `NEWS` for time-bound items, `GUIDE` for evergreen how-tos, comparisons, feature deep dives and knowledge base expansions.
- **Update** (`targetPostSlug` set): edit the existing HTML minimally. Add a section or FAQ answering the target queries, tighten the title or meta if the query is missing, add internal links. Don't rewrite unrelated sections. Every change needs a `changeNotes` entry: `section` = heading name, `reason` = which query it answers and its numbers (e.g. "Answers 'honesty box payment app' (pos 14.2, 320 impressions)").
- **Vendl facts** come only from the supplied pricing and knowledge base source files, never memory. **Never describe a feature that is not in them.**
- **Competitor claims** need a cited source (their pricing, feature or changelog page) in `researchNotes.sources`, dated ("as of October 2026").
- Australian context by default (AUD, GST, state food rules, card surcharging rules) and Australian spelling.

## Images

Each new post gets one feature image and 1–3 inline images; updates get 0–2 inline images for new sections only.

- **Purpose:** each image must illustrate something specific in its section (a stall layout, a pre-order pickup table, a QR sign on a stand), not decorate.
- **Prompt:** describe a realistic editorial photograph: subject, setting (regional Australian where relevant), composition, natural light. The code adds style and safety rules.
- **Never:** text, numbers, signage wording, logos, brand names, real or identifiable people presented as customers, competitor products, phone or app screens (they come out wrong), or anything implying a real place or event.
- **Alt text:** describe what is in the image in plain words for someone who can't see it (under 125 characters), not keywords.
- **Filename:** 3–7 lowercase hyphenated words describing the image (e.g. `eggs-on-roadside-honesty-stall`), unique within the post.
- **Caption:** optional; one short sentence that adds context.
- **Placement:** `afterHeading` = the exact text of the `h2` the image belongs under.

## Output rules

- Allowed HTML: `p h2 h3 h4 ul ol li strong em a blockquote table thead tbody tr th td code pre hr`. Don't put images in `bodyHtml`; the code inserts them. No inline styles, no `h1`.
- `researchNotes` must include `whyThisTopic`, `sources` and `factChecks` in the labelled format from `WRITING.md`.
