# Vendl blog agent: playbook

The agent runs in two stages on GitHub Actions. It never publishes; Jono reviews everything in `/admin/blog`.

1. **Evening planner** (9pm Australia/Adelaide, `scripts/blog-agent/plan.ts`): recommends 10 ranked ideas and emails them. Each has a "Write this" link.
2. **Writer** (`scripts/blog-agent/write.ts`, started when an idea is picked, up to 3 per evening): researches and drafts one post or update, with images, into the review queue. Nothing is written if nothing is picked.

Vendl is moving from a farm-stand checkout tool to a full ecommerce platform for home producers and small sellers, competing directly with home-producer platforms (CottageCMS, Bakebug, Hotplate, Loafly, Bakesy) and broadly with Shopify, Wix, Square Online and WooCommerce. The audience: farm stands, home bakers, makers, market stallholders and small online shops, mostly in Australia.

## The Vendl-first rule (every idea, every article)

The blog exists to bring sellers to Vendl. Every idea must solve a reader's problem **with a Vendl feature** that exists in the knowledge base, and lead to signing up.

- `vendlTieIn` names the feature(s) (e.g. QR pay at the stand, pre-orders with pickup windows, stock alerts, online shop, gift cards) and how the post leads to a signup. If you can't name a real Vendl feature that genuinely helps, drop the idea.
- **Vendl is the hero, never another platform.** Don't recommend workflows, tutorials or routines for running another product (e.g. "a Square POS reconciliation routine", "how to use Shopify's new feature"). Integrations are framed as Vendl features ("Sell at markets and online without double-counting stock: Vendl's Square sync").
- **Competitor news** only when there is a clear Vendl angle: what it means for small sellers and how Vendl handles it (or does it more simply or cheaply). Otherwise skip it.
- **Titles** lead with the seller's problem or outcome, not a competitor's name. Competitor names belong in titles only for fair comparison guides where Vendl is one of the options.
- **Regulatory and how-to guides** (licences, pricing, food rules) are fine when the tie-in is natural: e.g. after the licence checklist, "take pre-orders and payments with Vendl".

## Planner: choosing tonight's 10

Inputs: blog context (existing posts, backlog topics, recent rejections and discarded revisions), the Search Console report, knowledge base articles, recent commits on `main` (shipped) and the preview branch (upcoming), live web search for news, and on Sundays the weekly research: `competitorScan` (competitors' recent content, product changes, content gaps), `communityScan` (real seller questions from Reddit, Quora, LinkedIn and Medium) and `aiVisibility` (ChatGPT's answers to buyer questions: whether Vendl is mentioned or cited, which competitors appear, which pages are cited).

Aim for a mix across the 10. Across a week no single source should exceed half the ideas.

- **Search Console (2–4 ideas).** Take the top opportunities.
  - Page is a published DB post (slug in `context.posts`, `status: PUBLISHED`) → recommend an **update** (`targetPostSlug`). Skip it if `contentUpdatedAt` or `lastRevisionAt` is under 21 days old, or it has a pending revision.
  - Page is a hand-built reference page (`/sell-food-from-home/...`, `/cottage-food-laws/...`) or a hand-coded article (`context.codeArticles`) → recommend a **new guide** that answers the query cluster in depth and links to that page. Never target these for updates.
  - Page is a landing page and the intent is commercial ("app", "software", "best", "price") → skip it; it needs a page change, not a post.
  - Informational queries ("how to", "can I", "what is") that only a sales page or the home page ranks for → **new post** targeting the cluster.
  - The report's `tier`: `strict` = genuine striking distance, so favour updates. `loose` = young-site fallback, so favour new guides that cover whole clusters.
- **News (1–3 ideas).** Search the web for the last ~72 hours. Sources: CottageCMS, Bakebug, Hotplate, Loafly, Bakesy, Shopify, Square, Wix, WooCommerce and Stripe changelogs, blogs and pricing pages; RBA surcharging, ACCC, ATO small business and GST updates; FSANZ and state food authorities; farmers market associations; Google Search Central and Merchant Center. Recommend only items that materially affect small sellers, have a genuine Vendl angle and aren't already covered. Set `timeSensitive: true` and `section: NEWS`.
- **Shipped features and knowledge base (2–3 ideas).** Deeper guides on features in the knowledge base or recent `main` commits, framed by the broader ecommerce benefit rather than as a product tour.
- **Market and comparison topics (1–3 ideas).** Evergreen guides that help sellers choose and run their setup: platform comparisons, fees explained, pre-orders, inventory, selling at markets and online.
- **Weekly research (Sundays only, 2–4 ideas in total from the three below).** These replace part of the usual mix that night.
- **Community questions (`source: COMMUNITY`).** From `communityScan`, pick questions with a strong `signal` that no existing page answers. Put thread URLs in `sourceUrls`, mention the platform and signal in `whyNow`, and put the sellers' `realWording` in `angle` so the writer can use it for headings and FAQs.
- **AI answer gaps (`source: AI_ANSWERS`).** From `aiVisibility`, pick questions where Vendl is neither mentioned nor cited and the cited pages are thin, dated, generic or not Australian. Put the cited pages in `sourceUrls` and the question in `targetQueries` (query only; omit impressions, position and page). The goal is a page an AI assistant would cite: a direct answer in the first paragraph, specific Australian facts, a clear comparison table or steps, and FAQs phrased like the question.
- **Competitor gaps (`source: COMPETITOR`).** When `competitorScan` is present, turn its strongest `contentGaps` into ideas: topics competitors rank or publish on that Vendl lacks, or cover badly. Put the competitor URLs in `sourceUrls` and the evidence in `whyNow`. Write a better, seller-first answer; never copy a competitor's structure or target their brand name unless it is a fair comparison guide.
- **Never recommend** a topic that duplicates an existing post, repeats a rejected angle (read `recentRejections` and `recentDiscardedRevisions`), or describes a feature only on the preview branch.
- **Rank by** expected value to readers and search: real demand (impressions), timeliness, fit with Vendl's audience, and how clearly Vendl can add something useful. `score` 0–100.

## Writer: one picked idea

Read `WRITING.md` in full and follow it. Then:

- **Search results brief:** `serpBrief` (when present) lists what the top results for the main query cover, their weaknesses, the gaps, and reader questions. Cover every `mustCover` point, answer the `readerQuestions`, and make at least two `gaps` the article's distinctive sections. Beat the top results on usefulness and Australian specifics, not length. Never paraphrase them. Note in `researchNotes.whyThisTopic` which gaps the article fills.
- **New post:** write the complete draft. Choose `NEWS` for time-bound items, `GUIDE` for evergreen how-tos, comparisons, feature deep dives and knowledge base expansions.
- **Update** (`targetPostSlug` set): edit the existing HTML minimally. Add a section or FAQ answering the target queries, tighten the title or meta if the query is missing, add internal links. Don't rewrite unrelated sections. Every change needs a `changeNotes` entry: `section` = heading name, `reason` = which query it answers and its numbers (e.g. "Answers 'honesty box payment app' (pos 14.2, 320 impressions)").
- **Vendl tie-in and CTA (required):** follow the Vendl-first rule and the topic's `featureRef` (its Vendl tie-in). Include one section where the Vendl feature is part of the solution (what it does for this reader, concretely, with a link to its page), and close the final section with one sentence pointing to that feature with an inline link to `/signup?utm_source=blog&utm_medium=article&utm_campaign={slug}`. The page automatically adds "Get My Free Vendl Account" boxes in the middle (before the middle `h2`, so use at least 4 `h2` sections) and at the end; don't write your own CTA boxes, buttons or "Sign up today" sections. Mention Vendl naturally elsewhere where it genuinely helps, but keep the article useful even to someone who never signs up.
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

- **Links are HTML, never Markdown.** Cite sources with `<a href="...">` on descriptive anchor text inside the sentence (e.g. `Queensland's <a href="https://www.qld.gov.au/...">food business licence guidance</a> says...`), not `[text](url)` and not trailing "(domain.gov.au)" citations. Cite each source once or twice where it matters, not after every sentence. FAQ answers are plain text: no links, no citations.
- Allowed HTML: `p h2 h3 h4 ul ol li strong em a blockquote table thead tbody tr th td code pre hr`. Don't put images in `bodyHtml`; the code inserts them. No inline styles, no `h1`.
- `researchNotes` must include `whyThisTopic`, `sources` and `factChecks` in the labelled format from `WRITING.md`.
