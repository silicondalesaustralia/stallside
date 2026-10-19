# Vendl blog agent: research and writing standard

Read this before every draft or revision. `PLAYBOOK.md` decides **what** to write; this file decides **how**.

The goal is useful, natural, publishable content that a home producer or small seller would bookmark. Rankings follow usefulness, not the other way round.

## 1. Audience and voice

- Home bakers, farm stands, makers, market stallholders and small online shops, mostly in Australia.
- Australian English (organise, colour, licence as a noun), AUD, GST-inclusive prices unless stated.
- Plain, warm, practical. Contractions are fine. Vendl is the publisher, not the hero of every paragraph.

## 2. Establish search intent before drafting

Turn the topic or query cluster into the reader's actual question and their likely next decision.

- "selling food from home qld": can I legally do it, what do I need to register, what can't I sell, what does it cost.
- "honesty box payment app": how do customers pay without me there, what does it cost per sale, what happens with theft.
- "shopify vs square for small business": which fits a seller of my size, total monthly cost, what I give up with each.

Answer the main question in the opening paragraph. No generic scene-setting before the answer.

## 3. Check existing coverage first

Before drafting, look at `context.posts`, `context.codeArticles`, the hand-built reference pages (`/sell-food-from-home/...`, `/cottage-food-laws/...`) and relevant landing pages (`/stall`, `/pre-orders`).

- If a page already answers the question, revise it (if it is a DB post) or pick a narrower angle that links to it.
- Never publish a second article answering the same question as an existing page.
- Note which existing URLs genuinely support the new piece; those are your internal links.

## 4. Research method

### Sources, in order of preference

1. Government departments and regulators (state food authorities, ATO, ACCC, RBA, FSANZ, local councils).
2. Platforms' own pricing, help and changelog pages for competitor facts.
3. Original studies and industry bodies for market figures.
4. Named specialists' published explanations for interpretation.
5. Competitor and publisher articles: only to find questions and gaps, never as a template to paraphrase.

Search snippets are discovery aids. Open the page before relying on a claim. If a page cannot be accessed, use another source; never imply you read something you did not.

### Evidence record (goes in `researchNotes`, never in the body)

List every source in `researchNotes.sources` (`{ title, url }`). Record each consequential claim in `researchNotes.factChecks` as one string: `[label] claim (source URL or repo file; date checked; jurisdiction)`. Labels:

- `fact`: directly supported by the source.
- `self-statement`: an organisation describing its own product or operations.
- `interpretation`: an expert's or your own reading of the facts.
- `recommendation`: your practical advice.

Format: `[fact] <claim as written in the article> (<regulator URL>; checked 2026-10-19; QLD)`. Every Vendl claim cites the file it was checked against on `origin/main`.

### Regional and time-sensitive claims

- **Food rules are state- and council-specific.** A NSW rule does not establish the Queensland or South Australian one. Name the state in every rule you state, and link the regulator.
- Avoid universal thresholds ("you can earn up to $X before registering") unless the source states it for that jurisdiction.
- Date-stamp competitor prices and fees ("as of October 2026"). Prices change; say so.
- Distinguish announced, proposed and in-effect changes (for example, RBA surcharging decisions).

### Scope honesty

Do not claim search volume, Google Trends, People Also Ask extraction, competitor audits or ranking checks unless you actually did them. GSC numbers from `gsc-opportunities` are real and may be cited in `changeNotes` and `researchNotes`. When `serpBrief.google` is present, the brief comes from live Google Australia results (DataForSEO) and the volumes in `targetQueries` and `serpBrief.google.keywordVariations` are real monthly Google Australia searches; describe them as such. Without `serpBrief.google`, the brief comes from a web search (an approximation of Google's results); describe it as "top search results reviewed" and claim no volumes.

## 5. Human writing and genuine authority

Use:

- Plain language and varied sentence length. Short paragraphs that make one point.
- Concrete examples with a clear purpose (a honey stall selling 20 jars a week, a baker taking Christmas pre-orders). Label hypothetical examples as examples.
- Direct answers, then the necessary qualifications.
- Fair comparisons: say when Shopify, Square, Wix or WooCommerce is the better fit.

Avoid:

- Em dashes. Use commas, colons, full stops or brackets.
- "Delve", "ever-evolving landscape", "in today's fast-paced world", "it's important to note", "game-changer", "seamless".
- Repeating the same summary in the intro, a table, the conclusion and the FAQs.
- Artificial keyword repetition and headings added only to fit a keyword variant.
- Unsupported superlatives, guarantees ("boost sales by 40%") and invented statistics.

### Never invent

Interviews, customer stories, testimonials, quotes, site visits, measurements, expert reviews, credentials, or "we spoke to stallholders". If there is no genuine source material, use a truthful alternative: "what the Queensland Government's guidance says", "questions to ask your council", "what sellers report publicly" (with a linked, identifiable source). Attribute quotes to their actual source, keep them short and exact.

## 6. Article architecture

Use the structure the topic needs. A useful default:

1. Title (the page H1; never put an `h1` in `bodyHtml`).
2. Direct answer in the first paragraph.
3. The main complication or distinction, briefly.
4. `h2` sections for the reader's key questions; `h3` only for genuine subsections.
5. A table or numbered steps where it genuinely clarifies (keep tables to 2–4 columns for mobile).
6. A practical decision aid or worked example.
7. Where Vendl fits, stated plainly, with one clear call to action.
8. FAQs in the `faqs` field (3–6), each adding something the body does not already say.

Length follows the question. Guides often land at 900–1,800 words and news at 400–800, but stop when the question is fully answered. Extra length needs extra usefulness.

## 7. Internal links and Vendl mentions

- Use the few links that genuinely help the reader (typically 2–5), placed inside relevant sentences, never as a promotional block.
- Every article ties back to Vendl: one section where a named Vendl feature is part of the solution, and a closing sentence with an inline link to `/signup?utm_source=blog&utm_medium=article&utm_campaign={slug}`. The page adds "Get My Free Vendl Account" boxes mid-article and at the end, so never write CTA boxes or sign-up sections yourself. Another platform is never the hero; integrations are presented as Vendl features.
- Relative paths only, and only to pages that exist now: `/guides/...`, `/farms-stand-news/...`, `/sell-food-from-home/...`, `/cottage-food-laws/...`, `/stall`, `/pre-orders`, `/signup`. Never link to a planned or unpublished URL; put suggested future links in `researchNotes`.
- Do not claim Vendl does something its code on `origin/main` does not do. Do not overstate: Vendl is not a food-safety authority, accountant or lawyer; say "check with your council" where it applies.

## 8. Topic-specific safeguards

- **Food rules:** name the state, link the regulator, separate "allowed foods" from "registration requirements", and recommend confirming with the local council.
- **Fees and pricing:** Vendl figures from `src/lib/plan-copy.ts`, `src/lib/pricing-model.ts`, `src/lib/constants.ts`; competitor figures from their pricing page with a date. Compare like with like (card fees vs subscription vs transaction fees), and show the arithmetic for any worked cost example.
- **Payments and surcharging:** distinguish RBA decisions, card-scheme rules and state law; say when a change takes effect.
- **Platform comparisons:** compare on the reader's real criteria (cost at their volume, setup effort, in-person vs online, ownership of customer data), not feature-count tables.
- **Tax:** general information only (GST registration threshold, record keeping), linked to the ATO; never individual advice.

## 9. SEO fields

- **`seoTitle` and `title` (H1) must be different wordings of the same promise.** Together they cover more of the query cluster in `serpBrief` and `targetQueries`.
  - With search data (`serpBrief.google`): the `seoTitle` uses the highest-volume query that matches the article's intent (often `serpBrief.primaryQuery`); the H1 uses a strong variation from `keywordVariations` or `relatedSearches`. Use `peopleAlsoAsk` questions as FAQ questions where the article answers them, and write the opening so it could be quoted by an AI Overview (pages already cited are in `aiOverview.citedPages`; link to the official ones as sources).
  - `seoTitle` (the search result headline): front-loads the **primary query** almost as people type it; around 50–60 characters (70 max). Don't add "· Vendl"; the site appends the brand.
  - `title` (the on-page H1): written for the reader who has already clicked. Use a **secondary or semantic variation** (synonyms, the long-tail phrasing, the outcome or the format, e.g. "checklist", "step by step", "what changes in 2026"). Keep the core entity (place, product, task) so the page still clearly matches the query. Don't just reorder the same words or add a suffix.
  - Example: `seoTitle` "Selling Food From Home QLD: Product Licence Checklist"; `title` "Do you need a food licence in Queensland? Check each product before you sell".
  - The excerpt and first paragraph can use a third variation; keywords list the variations you targeted.
- `seoDescription`: around 140–160 characters describing the benefit of reading; no keyword lists or guarantees.
- `slug`: short, lowercase, hyphenated; no year for evergreen topics.
- `excerpt`: 1–2 sentences for listing cards.
- Structured data (Article, FAQ, breadcrumbs) is generated by the site from these fields. Do not put JSON-LD or scripts in `bodyHtml`.
- The author is assigned automatically and shown with a byline and author box. Never add a byline, author bio, "written by" line or first-person claims of the author's experience to `bodyHtml`.

## 10. Final check before POSTing

- The opening answers the actual question.
- Every regulatory, pricing and time-sensitive claim has a dated source in `researchNotes`; every Vendl claim cites a file.
- State and jurisdiction are named wherever rules are discussed.
- Announced vs in-effect changes are distinguished.
- Nothing is invented: no interviews, stories, statistics, credentials or experience.
- Hypothetical examples are labelled and their arithmetic is correct.
- Internal links point to pages that exist, inside relevant sentences.
- Vendl's capabilities are not overstated; competitors are treated fairly.
- A named Vendl feature is part of the solution, and the final section ends with an inline `/signup` link (no CTA boxes; the page adds them).
- FAQs add new answers and agree with the body.
- No em dashes, placeholders, editorial notes or instructions in the public copy.
- SEO fields accurately describe the content.
