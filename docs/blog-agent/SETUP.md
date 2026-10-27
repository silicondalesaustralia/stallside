# Daily blog agent: setup

## 1. Database

Migration `prisma/migrations/20261019110000_blog_posts` adds `BlogPost`, `BlogPostRevision` and `BlogTopic`. It applies automatically on Vercel deploys (`build:vercel` runs `migrate deploy`).

## 2. App environment (Vercel)

| Variable | Purpose |
| --- | --- |
| `BLOG_AGENT_TOKEN` | Long random secret (`openssl rand -hex 32`). The agent API rejects every request when unset. Also signs email pick links unless `BLOG_PICK_SECRET` is set. |
| `BLOG_DIGEST_EMAIL` | Optional, comma-separated. Defaults to the platform contact inboxes. |
| `GITHUB_DISPATCH_TOKEN` | Fine-grained GitHub token for `silicondalesaustralia/stallside` with **Actions: Read and write** only. Lets a "Write this" click start the writer workflow. |
| `BLOG_AGENT_GIT_REF` | Branch the writer runs from: `feature/social-kit` now, `main` once the blog ships. |
| `BLOB_READ_WRITE_TOKEN` | Already set; generated images are stored under `blog/{post-slug}/`. |

## 3. Search Console service account

1. Google Cloud console → enable **Google Search Console API**.
2. IAM → Service accounts → create one (no roles needed) → Keys → add JSON key.
3. Search Console → `vendl.app` property → Settings → Users and permissions → add the service account email with **Restricted** permission.
4. Test locally:

   ```bash
   GSC_SERVICE_ACCOUNT_JSON="$(cat key.json)" GSC_SITE_URL="sc-domain:vendl.app" npm run gsc:opportunities
   ```

## 4. GitHub Actions (planner and writer)

Two workflows in `.github/workflows/`. GitHub only runs scheduled and dispatched workflows whose files are on the **default branch (`main`)**; they check out `BLOG_AGENT_GIT_REF` to run the code.

- `blog-plan.yml`: 9pm Adelaide daily, started by the app's Vercel cron `/api/cron/blog-plan` (two UTC crons cover daylight saving; it uses `GITHUB_DISPATCH_TOKEN`). GitHub's own schedule isn't used because it ran hours late. Builds the Search Console report, reads a compact blog context (titles, slugs, statuses), the knowledge base index and the last 7 days' commit subjects, searches the web for news, and asks GPT-5.4 for 5 ranked ideas. On Sundays it first runs weekly research (tick "weekly research" on a manual run to force it):
  - **Competitor scan:** CottageCMS, Bakebug, Hotplate, Loafly, Bakesy, Shopify, Square Online and Wix; recent content, product changes and content gaps (`scripts/blog-agent/competitor-scan.ts`).
  - **Community scan:** Reddit, Quora and public LinkedIn posts via web search, plus Medium tag feeds; real seller questions and wording (`scripts/blog-agent/community-scan.ts`).
  - **ChatGPT visibility:** asks ChatGPT (web search, Australian location) 24 fixed buyer questions and stores whether Vendl is mentioned or cited, competitor mentions and cited pages. See the trend at `/admin/blog/ai-visibility`. Questions are in `scripts/blog-agent/ai-questions.ts`; add new ones rather than rewording, so the trend stays comparable. The app stores them as topics and emails them, each with a **Write this** link (signed, 48 hours). Run it manually from the Actions tab to test.
- `blog-write.yml`: started by the app when an idea is picked (email link or **Write now** in the topic backlog). One pick per evening email (**Write now** in the backlog has no limit); nothing is written if nothing is picked. First reviews the top search results for the main query (what they cover, weaknesses, gaps, reader questions) and confirms the article's regulatory and fee facts on official sites (`gov.au`, Stripe, Square; `scripts/blog-agent/official-facts.ts`). The writer then drafts with GPT-6 Astra from that research without searching itself, with only the published pages it may link to and the best-matching knowledge base articles in full, generates a feature image and 1–3 inline images with `gpt-image-1` (WebP, SEO filenames, alt text, captions), and posts a draft or a revision to the review queue (~10–20 minutes). Failures are emailed and shown on the topic.

Repository settings → Secrets and variables → Actions:

| Kind | Name | Value |
| --- | --- | --- |
| Secret | `OPENAI_API_KEY` | OpenAI key with access to `gpt-6-astra` and `gpt-image-1` |
| Secret | `BLOG_AGENT_TOKEN` | Same value as Vercel |
| Secret | `GSC_SERVICE_ACCOUNT_JSON` | Service account key JSON (or base64 of it) |
| Variable | `BLOG_AGENT_BASE_URL` | `https://stagingv2.vendl.app` now, `https://www.vendl.app` on `main` |
| Variable | `BLOG_AGENT_GIT_REF` | Branch whose agent code runs (`main`) |
| Variable | `BLOG_AGENT_CONTEXT_REF` | Optional. Upcoming release the knowledge base, pricing facts and "upcoming" commits are read from. Defaults to `feature/social-kit`; if that branch can't be checked out the agent uses its own checkout |
| Variable | `GSC_SITE_URL` | `sc-domain:vendl.app` |
| Secret | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | Optional. DataForSEO API login and API password (not the dashboard password) |
| Secret | `DATAFORSEO_RELAY_URL`, `DATAFORSEO_RELAY_SECRET` | Optional. A relay on a fixed IP, needed while the DataForSEO account has an IP allowlist (GitHub runners have no fixed IP) |

DataForSEO (Google Australia data) is optional; without it the research falls back to OpenAI web search. With it:

- **Planner:** before planning, a search demand pool of real searches containing 10 seed phrases (`keyword_suggestions`, about $0.14 a night; seeds in `scripts/blog-agent/search-demand.ts`, override with `BLOG_AGENT_DEMAND_SEEDS`). After planning, each idea's `targetQueries` get monthly volume, keyword difficulty and intent (`keyword_overview`, about $0.01), shown in the email.
- **Writer:** the brief uses the live Google top 10 for the highest-volume query (`serp/google/organic/live/advanced`, $0.002), reads the top 5 pages directly, and adds People also ask, related searches, AI Overview cited pages and related keywords with volumes (`related_keywords`, about $0.01).
- The account's IP allowlist must include the IP the requests come from (local testing: your own IP; scheduled runs: the relay's IP).

Models per task (defaults in `scripts/blog-agent/model-config.ts`; every run logs `[usage]` token counts per call):

| Task | Model | Effort | Web search depth |
| --- | --- | --- | --- |
| `WRITE` (article draft) | `gpt-6-astra` | medium | none |
| `PLAN` (choose 5 ideas nightly) | `gpt-5.4` | low | low |
| `RESEARCH` (search results brief, official facts, competitor and community scans) | `gpt-5.4-mini` | low | medium |
| `VISIBILITY` (24 weekly ChatGPT questions) | `gpt-5.4-mini` | low | low |

Override with `BLOG_AGENT_MODEL_<TASK>`, `BLOG_AGENT_EFFORT_<TASK>`, `BLOG_AGENT_SEARCH_<TASK>`. Images: feature image `gpt-image-1`, inline `gpt-image-1-mini` (`BLOG_AGENT_IMAGE_MODEL_HERO`, `BLOG_AGENT_IMAGE_MODEL_INLINE`, `BLOG_AGENT_IMAGE_QUALITY`).

## 5. Authors

Jono Farrington (Co-founder, `/authors/jono-farrington`) is seeded by migration as the default author, and is the fallback whenever no default is flagged. Open `/admin/blog/authors` to add his headshot, refine the bio and add social profile links (one per line). Other authors can be added with **New author**.

- Every new draft (agent or manual) is credited to the default author; change it per post in the editor. Publishing requires an author.
- Each public author gets `/authors/{slug}` with ProfilePage + Person schema. Articles link to it in the byline and an "About the author" box, and their BlogPosting `author` uses the same Person `@id`.
- `/editorial-policy` explains how articles are researched, AI-assisted, fact-checked and reviewed; it is linked from author boxes and referenced as the organisation's `publishingPrinciples`.
- Posts with no author (or a hidden one) are credited to the Vendl organisation.

## 6. Review

Open `/admin/blog`:

- **Drafts**: edit in the editor, Preview, then Publish now or Schedule. Reject with a reason the agent will read.
- **Updates to review**: highlighted changes (green = added, struck red = removed). Edit the proposed version if needed, then Publish update, or Discard with a reason.
- **Topic backlog**: every evening idea lands here too. **Write now** starts the writer for any idea; add your own ideas or mark topics "Not interested".
- **Write a post from a keyword** (top of the backlog): type a keyword or phrase and the writer runs the full process for one post. Any topic without planner research (keyword runs and your own ideas) is briefed first like an evening idea: Google AU demand around the keyword, angle, target queries, Vendl tie-in and duplicate check (`scripts/blog-agent/keyword-brief.ts`), saved on the topic, then researched and drafted as usual.

Published posts appear at `/guides/{slug}` or `/farms-stand-news/{slug}`, in the section index, and in `sitemap.xml`. Scheduled posts go live within an hour of their time.
