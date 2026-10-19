# Daily blog agent: setup

## 1. Database

Migration `prisma/migrations/20261019110000_blog_posts` adds `BlogPost`, `BlogPostRevision` and `BlogTopic`. It applies automatically on Vercel deploys (`build:vercel` runs `migrate deploy`).

## 2. App environment (Vercel)

| Variable | Purpose |
| --- | --- |
| `BLOG_AGENT_TOKEN` | Long random secret (`openssl rand -hex 32`). The agent API rejects every request when unset. |
| `BLOG_DIGEST_EMAIL` | Optional, comma-separated. Defaults to the platform contact inboxes. |

## 3. Search Console service account

1. Google Cloud console → enable **Google Search Console API**.
2. IAM → Service accounts → create one (no roles needed) → Keys → add JSON key.
3. Search Console → `vendl.app` property → Settings → Users and permissions → add the service account email with **Restricted** permission.
4. Test locally:

   ```bash
   GSC_SERVICE_ACCOUNT_JSON="$(cat key.json)" GSC_SITE_URL="sc-domain:vendl.app" npm run gsc:opportunities
   ```

## 4. Cursor Automation (daily cloud agent)

Create an Automation on this repository, schedule `0 7 * * *` in Australia/Adelaide, branch `feature/social-kit` (switch to `main` once the blog ships to production), with these secrets:

- `BLOG_AGENT_BASE_URL` = `https://stagingv2.vendl.app` (switch to `https://www.vendl.app` once on `main`)
- `BLOG_AGENT_TOKEN` = same value as Vercel
- `GSC_SERVICE_ACCOUNT_JSON` = the key JSON (or base64 of it)
- `GSC_SITE_URL` = `sc-domain:vendl.app`

Prompt:

```text
You are Vendl's daily blog agent. Read docs/blog-agent/PLAYBOOK.md in full and follow it exactly.
Run `git fetch origin main feature/social-kit` first. Do not commit, push, or open pull requests:
all output goes through the blog-agent API. Produce at most two drafts or revisions, refill the topic
backlog, then send the digest. If an API call fails twice, stop and send a digest describing the failure.
```

## 5. Authors

Open `/admin/blog/authors` → **New author**. Fill in name, job title, short bio (shown under every article), full bio (profile page: real experience, not marketing), expertise, a square headshot, and social profile links (one per line). Tick **Public** and **Default author for new drafts**.

- Every new draft (agent or manual) is credited to the default author; change it per post in the editor. Publishing requires an author.
- Each public author gets `/authors/{slug}` with ProfilePage + Person schema. Articles link to it in the byline and an "About the author" box, and their BlogPosting `author` uses the same Person `@id`.
- `/editorial-policy` explains how articles are researched, AI-assisted, fact-checked and reviewed; it is linked from author boxes and referenced as the organisation's `publishingPrinciples`.
- Posts with no author (or a hidden one) are credited to the Vendl organisation.

## 6. Daily review

Open `/admin/blog`:

- **Drafts**: edit in the editor, Preview, then Publish now or Schedule. Reject with a reason the agent will read.
- **Updates to review**: highlighted changes (green = added, struck red = removed). Edit the proposed version if needed, then Publish update, or Discard with a reason.
- **Topic backlog**: add your own ideas (score 80, picked up first) or mark topics "Not interested".

Published posts appear at `/guides/{slug}` or `/farms-stand-news/{slug}`, in the section index, and in `sitemap.xml`. Scheduled posts go live within an hour of their time.
