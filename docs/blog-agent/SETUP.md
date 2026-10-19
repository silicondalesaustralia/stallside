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

- `blog-plan.yml`: 9pm Adelaide daily (two UTC crons cover daylight saving). Builds the Search Console report, reads blog context, knowledge base and recent commits, searches the web for news, and asks GPT-6 Astra for 10 ranked ideas. On Sundays it first runs weekly research (tick "weekly research" on a manual run to force it):
  - **Competitor scan:** CottageCMS, Bakebug, Hotplate, Loafly, Bakesy, Shopify, Square Online and Wix; recent content, product changes and content gaps (`scripts/blog-agent/competitor-scan.ts`).
  - **Community scan:** Reddit, Quora and public LinkedIn posts via web search, plus Medium tag feeds; real seller questions and wording (`scripts/blog-agent/community-scan.ts`).
  - **ChatGPT visibility:** asks ChatGPT (web search, Australian location) 24 fixed buyer questions and stores whether Vendl is mentioned or cited, competitor mentions and cited pages. See the trend at `/admin/blog/ai-visibility`. Questions are in `scripts/blog-agent/ai-questions.ts`; add new ones rather than rewording, so the trend stays comparable. The app stores them as topics and emails them, each with a **Write this** link (signed, 48 hours). Run it manually from the Actions tab to test.
- `blog-write.yml`: started by the app when an idea is picked (email link or **Write now** in the topic backlog). Up to 3 picks per evening; nothing is written if nothing is picked. First reviews the top search results for the main query (what they cover, weaknesses, gaps, reader questions), then researches and drafts with GPT-6 Astra, generates a feature image and 1–3 inline images with `gpt-image-1` (WebP, SEO filenames, alt text, captions), and posts a draft or a revision to the review queue (~10–20 minutes). Failures are emailed and shown on the topic.

Repository settings → Secrets and variables → Actions:

| Kind | Name | Value |
| --- | --- | --- |
| Secret | `OPENAI_API_KEY` | OpenAI key with access to `gpt-6-astra` and `gpt-image-1` |
| Secret | `BLOG_AGENT_TOKEN` | Same value as Vercel |
| Secret | `GSC_SERVICE_ACCOUNT_JSON` | Service account key JSON (or base64 of it) |
| Variable | `BLOG_AGENT_BASE_URL` | `https://stagingv2.vendl.app` now, `https://www.vendl.app` on `main` |
| Variable | `BLOG_AGENT_GIT_REF` | `feature/social-kit` now, `main` later |
| Variable | `GSC_SITE_URL` | `sc-domain:vendl.app` |

Models per task (defaults in `scripts/blog-agent/model-config.ts`; every run logs `[usage]` token counts per call):

| Task | Model | Effort | Web search depth |
| --- | --- | --- | --- |
| `WRITE` (article draft) | `gpt-6-astra` | medium | medium |
| `PLAN` (choose 10 ideas) | `gpt-6-astra` | low | low |
| `RESEARCH` (search results brief, competitor and community scans) | `gpt-5.4-mini` | low | medium |
| `VISIBILITY` (24 weekly ChatGPT questions) | `gpt-5.4-mini` | low | low |

Override with `BLOG_AGENT_MODEL_<TASK>`, `BLOG_AGENT_EFFORT_<TASK>`, `BLOG_AGENT_SEARCH_<TASK>`. Images: feature image `gpt-image-1`, inline `gpt-image-1-mini` (`BLOG_AGENT_IMAGE_MODEL_HERO`, `BLOG_AGENT_IMAGE_MODEL_INLINE`, `BLOG_AGENT_IMAGE_QUALITY`).

## 5. Authors

Jono Farrington (Co-founder, `/authors/jono-farrington`) is seeded by migration as the default author, and is the fallback whenever no default is flagged. Open `/admin/blog/authors` to add his headshot, refine the bio and add social profile links (one per line). Other authors can be added with **New author**.

- Every new draft (agent or manual) is credited to the default author; change it per post in the editor. Publishing requires an author.
- Each public author gets `/authors/{slug}` with ProfilePage + Person schema. Articles link to it in the byline and an "About the author" box, and their BlogPosting `author` uses the same Person `@id`.
- `/editorial-policy` explains how articles are researched, AI-assisted, fact-checked and reviewed; it is linked from author boxes and referenced as the organisation's `publishingPrinciples`.
- Posts with no author (or a hidden one) are credited to the Vendl organisation.

## 6. Daily review

Open `/admin/blog`:

- **Drafts**: edit in the editor, Preview, then Publish now or Schedule. Reject with a reason the agent will read.
- **Updates to review**: highlighted changes (green = added, struck red = removed). Edit the proposed version if needed, then Publish update, or Discard with a reason.
- **Topic backlog**: every evening idea lands here too. **Write now** starts the writer for any idea; add your own ideas or mark topics "Not interested".

Published posts appear at `/guides/{slug}` or `/farms-stand-news/{slug}`, in the section index, and in `sitemap.xml`. Scheduled posts go live within an hour of their time.
