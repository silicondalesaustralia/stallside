# Vendl AI website assistant — coding plan and decisions

Date: 16 October 2026
Worktree: `.worktrees/social-kit-website` (branch `feature/social-kit-website`)
Deploys to: `origin/feature/social-kit` → `https://stagingv2.vendl.app`

Read in this order:
1. This file. **Where it differs from the handoff, this file wins.**
2. `docs/VENDL-AI-WEBSITE-ASSISTANT-HANDOFF.md`: the full specification.
3. `docs/VENDL-AI-WEBSITE-REPO-CONTEXT.md`: verified repository evidence (file paths, contracts, issues).
4. `docs/WEBSITE-BUILDER-OVERVIEW.md`: how the current builder works.
5. `AGENTS.md` and the relevant guides in `node_modules/next/dist/docs/` (Next.js 16).

---

## 0. Hard rules (non-negotiable)

### 0.1 Do not touch `main` or production
- Never check out, commit to, merge into, rebase or push `main`.
- Never modify the main checkout at `/Users/jonosmmachine/Documents/Cursor/MyFarmStand`. It is on a
  stale local `feature/social-kit` with a large set of uncommitted fee/Square/email changes that
  belong to other work. Do not reset, stash, clean or check out
  anything there.
- Production database is Neon `ep-autumn-brook`. It is also what the main repo `.env` points at.
  **No writes of any kind to it.** Read-only inspection is allowed only for the migration baseline
  plan (§6), using a read-only role/URL supplied by the owner.

### 0.2 Do not break or remove anything that exists on social-kit
- All work happens in `.worktrees/social-kit-website`. Commit there; publish with
  `git push origin feature/social-kit-website:feature/social-kit` (fast-forward only).
  **Never force-push.** If the push is rejected, stop and report.
- Old UI is **hidden, not deleted**: template gallery, old AI tab (Details → Branding → Scaffold →
  Style → Build), template-package apply, demo-kit and look pickers. Their files, routes and server
  actions stay and keep compiling; direct URLs keep working.
- Existing storefronts, drafts, published sites, custom domains, commerce pages, blogs, policies,
  the visual editor, domains, social features and payments must behave exactly as before for every
  owner who does not run the new assistant.
- Schema changes are **additive only**: new tables, new nullable columns, new indexes. No drops,
  renames, type changes or edits to existing migration files.
- Do not install packages without asking the owner.

### 0.3 Database safety guard
- Testing database: Neon **`ep-icy-lake-a7hmh0t2`** (stagingv2), the Preview database scoped to
  branch `feature/social-kit`. Every stagingv2 deploy runs `build:vercel`, which runs
  `prisma migrate deploy` against it.
- Do **not** use `ep-aged-cell` (the default Preview database for other branches).
- Any local script or migration command must first assert the host starts with `ep-icy-lake` and
  abort otherwise. Get the URL with
  `vercel env pull --environment=preview --git-branch=feature/social-kit /tmp/sk.env --yes`,
  never print credentials, and delete the file when finished.
- Do not run `build:vercel` locally. Use `npm run build` (no migrations) for compilation.

### 0.4 Owner coding rules
Files under 150 lines; one component per file named after its default export; no `any`, no
`ts-ignore`; check `response.ok` before `.json()`; try/catch with meaningful handling on every
async path; run `npm run test:website`, type-check (`npx tsc --noEmit`) and `npm run build` after
changes and fix every error.

---

## 1. Decisions (override the handoff)

| Area | Decision |
|---|---|
| Old flow | Hidden from UI for owners who have the assistant; files kept. No template, look, palette, font or demo-kit choice in creation |
| Rollout | Owner allowlist via existing `AI_WEBSITE_BUILDER_OWNER_IDS` / `AI_WEBSITE_BUILDER_ENABLED` / `AI_WEBSITE_BUILDER_PERCENT`. Owners outside the gate see today's UI unchanged |
| Steps | Your business → Branding and photos → Your website → Create and preview |
| AI help | No chat. Up to 3 targeted follow-up questions inside the form |
| Old scaffold data | Prefill the new brief where it maps cleanly (`websiteAiScaffold` V1), then ignore it |
| Existing sites | May re-run the assistant. Strong warning: "This will replace your website draft" listing what is replaced |
| Replace scope | Replaces all page layouts (`websiteStudio` nodes and `pageNodes`), theme and navigation. **Keeps** blog posts, existing policy text, custom-domain settings, products, orders, customers and every operational setting |
| Live site | Never changes until the seller clicks **Publish website** (existing whole-site publish) |
| Edits during build | If the draft changed after the build started (`draftRevision` differs from base), pause: "Your draft changed while we were building. Replace it with the new site?" Keep the candidate until they choose |
| Auto-apply | If the draft is unchanged since the build started, apply automatically and open the preview |
| Undo | Simple restore point: full `draftConfig` snapshot saved before apply. "Restore previous version" writes it back as a new revision. No partial inverse-apply |
| Policies | AI may draft Terms/Privacy/Refunds from real business facts only. Marked **Review required**; publish is blocked until the seller ticks "I've reviewed this". Footer only, never primary nav |
| Design after build | Existing theme/style controls in the editor. No "try another look" |
| URL import | First release: website **and** public social URLs, bounded and SSRF-safe (handoff §10.1) |
| Decorative images | First release: up to 2 per build behind a switch, using the model `decorative-images.ts` is configured for (verify it works first). Neutral placeholders when off/failed |
| Limits | No build quotas during testing. Record usage so quotas can be added before production |
| Model | `gpt-6-astra`, medium reasoning, strict JSON Schema structured outputs |
| Delivery | Whole feature in one go (not phase checkpoints), tested on stagingv2 |

### 1.1 What this removes from the handoff
- Handoff §12 three-way merge, per-page conflict units and inverse-apply undo are **not needed**.
  Apply = (1) confirm job state and fencing token, (2) compare current `draftRevision` with the
  base, ask if changed, (3) save restore point, (4) CAS-write the merged draft, (5) mark candidate
  applied, all in one transaction.
- Handoff §4.4/§8 "preserve unselected pages and manual menus by default on rebuild" is replaced
  by the replace scope above. Blog posts and policy text are still kept.
- Quotas in handoff §16 are deferred; usage recording is still required.

### 1.2 What stays from the handoff
Persistent jobs with leases and fencing; separate planning and page-writing calls; strict V2 plan
schema; full page set (no 4-page limit); real catalogue/menu/offer bindings; brand and hero
preservation; owner preview/edit of disabled pages; semantic placeholder markers; honest fallback;
SSRF-safe import; asset provenance; usage logging; privacy rules; all acceptance tests that still
apply after §1.1.

---

## 2. Deployment facts

- Vercel project `stallside`. `feature/social-kit` Preview env: `NEXT_PUBLIC_APP_URL=https://stagingv2.vendl.app`,
  `VENDL_HOST_ENV=staging`, database `ep-icy-lake`.
- **Vercel crons do not run on Preview.** The job processor must advance from (a) a best-effort
  kick when a build starts, (b) the status endpoint, which claims and runs one bounded step when
  the job is due and unleased, and (c) the cron route triggered manually with `CRON_SECRET`.
  Also add the cron to `vercel.json` (every minute, like `process-week-plan-generation`) for
  production later; it is inert on stagingv2.
- Function duration: check the project's limit before choosing step sizes. Use Responses background
  mode for long model calls so no request waits on the model.

---

## 3. Build order

Work top to bottom. Each item lists the main files; verify exact paths before editing.

### 3.1 Baseline and safety
1. Record `git status`, HEAD and `npm run test:website` result in the worktree.
2. Read-only: compare `_prisma_migrations` and the `Storefront*` tables on `ep-icy-lake` with
   `prisma/migrations/`. Note any drift. Read-only production check for §6.
3. Spike (no commit needed): confirm `zodTextFormat` from `openai/helpers/zod` (SDK 6.49.0) works
   with Zod 4.4.3 for a small strict schema, and that `background: true` is accepted for
   `gpt-6-astra`. Use a mocked client in tests; one authorised live smoke call only.

### 3.2 Data model (one additive migration)
New Prisma models, owner- and storefront-scoped:
- `WebsiteBusinessBrief`: `storefrontId` unique, `ownerId`, `schemaVersion`, `revision`, `data` JSON.
- `WebsiteGenerationJob`: handoff §5.2 fields; status enum `QUEUED | RUNNING | RETRY_WAIT | READY |
  NEEDS_CONFIRMATION | APPLIED | FAILED | CANCELLED`; separate `stage`; lease token/expiry;
  base `draftRevision` and `activePublicationId`; usage and cost fields; idempotency key unique per
  owner. Partial unique index allowing one active job per storefront.
- `WebsiteGenerationStep`: per job/stage/page output, provider response ID, usage, status.
- `WebsiteCandidate`: validated plan, compiled draft patch, validation results, restore snapshot,
  applied revision.
- `WebsiteAsset`: handoff §5.4.
- `WebsiteImportSource`: URL, status, extracted candidate facts, fetched-at, error code.

The migration must apply cleanly on `ep-icy-lake` via `migrate deploy`. Do not reference
`Storefront` with a foreign key if that would fail on any supported target; prefer a plain indexed
`storefrontId` column if the read-only check shows risk, and document the choice.

### 3.3 Brief and context
- `src/lib/website-ai/brief/*`: Zod schema, load/save with revision CAS, prefill from
  `buildWebsiteBusinessContext` and from V1 `websiteAiScaffold`, fact source/confirmation fields,
  public-display flags for address/phone.
- Extend `src/lib/website-ai/business-context.ts`, `assess-context.ts`, `capabilities.ts` with real
  products/categories (`listProductsForOnlineShop`), active Menu/PreOrderPage/SubscriptionOffer,
  `loadOnlineFulfilmentOptions`, `standPaymentBrands` + `withSquarePaymentsReady`, approved real
  reviews. One context builder shared by recommendations and generation.

### 3.4 Wizard UI
- New route under `src/app/dashboard/(gated)/website/` (e.g. `assistant/`) with four step
  components, each its own file, controlled fields, autosave to the brief (not to live settings).
- Follow-up questions: one bounded structured model call returning at most 3 questions.
- Branding step: logo/colours/hero/photos with purpose labels; "Use my existing branding" default;
  decorative-image switch. Uploads keep PNG transparency.
- Your website step: recommended pages with checkboxes (Home fixed), prerequisites text,
  unsupported requests listed, optional policies with Review required note, replace warning for
  existing sites listing exactly what is replaced and kept.
- Progress screen: real stages from the job, polling with backoff, survives refresh.
- Gating: in `src/lib/website/web-studio-nav.ts`, `WebStudioShell.tsx`, `WebStudioAiPanel.tsx`
  and `src/lib/website/readiness.ts`, owners inside the AI gate see **Create my website with AI**
  and the old steps/template links are hidden. Owners outside the gate see no change.

### 3.5 Jobs and processor
- `src/lib/website-ai/jobs/*`: start (idempotent, transactional, snapshots base), claim with
  `FOR UPDATE SKIP LOCKED` or conditional update, lease + fencing token on every write, heartbeat,
  retry with backoff/jitter and `Retry-After`, cancel, stale-lease recovery.
- Routes: start action, `GET` status, cancel action, `POST /api/cron/process-website-generation`
  (CRON_SECRET), status endpoint stepping as described in §2.
- Stages: prepare context → import sources → plan → write pages → images → compile and validate →
  candidate ready → apply.

### 3.6 Provider, plan and compiler
- `config.ts`, `provider.ts`, `openai-planner.ts`: SDK client, strict schemas, timeouts, background
  mode, refusal/incomplete/rate-limit/timeout/validation handled separately, usage and actual
  model recorded, one repair attempt, no silent heuristic relabelled as Astra.
- `WebsiteAIPlanV2` in new files (`plan-v2/*`): page kinds, typed sections, allowlisted entity
  and asset IDs, nav/footer intent, SEO, policy drafts flagged review-required.
- Page-writing calls per page with the shared outline.
- Compiler: replace the 4-page `PAGE_NODE_KEYS` assumption with a page-target allocator; compile
  every supported page; validate with the section registry and business-mode rules; real
  ProductGrid bindings; links via `src/lib/storefront/paths.ts`; slug collisions via
  `site-slugs.ts`. Theme: keep explicit seller colours/logo/hero/fonts (fix
  `apply-blueprint-brand.ts` overwrite). Decorative images only in section props.
- Basic fallback starter: same validators; omit sections it cannot fill (no "Tell customers…").

### 3.7 Apply, restore and publish checks
- Apply per §1.1 in one Prisma transaction; refactor `draft-store.ts` to accept a transaction
  client if needed. Idempotent on retry.
- Restore previous version: write the snapshot back as a new revision; never touches
  `publishedConfig`.
- `load-editor-page.ts`, `load-custom-page.ts`, `StudioPageSelector.tsx`: signed-in owner can
  preview/edit disabled draft pages; `?draft=1` alone never unlocks them.
- `node-visibility.ts`, `publish-checks.ts`: semantic placeholder markers plus legacy detection;
  block unreviewed AI policy drafts; manual edits clear markers.
- Contact form in owner draft preview must not send real enquiries.
- Remove the AI "Publish draft" shortcut from the new flow only.

### 3.8 Import and images
- `src/lib/website-ai/imports/*`: SSRF-safe fetch (protocol/port/credential checks, DNS resolution
  with private/reserved range rejection, connection pinned to the validated IP, redirect
  revalidation, timeouts, streamed byte caps), up to 3 URLs and 5 same-site pages. Check whether
  `undici` is already a direct dependency before using it; ask before adding anything. If secure
  fetching cannot be achieved, disable fetch and keep paste/upload paths.
- Extracted facts are suggestions until the seller confirms them. Imported photos need explicit
  selection.
- `src/lib/website-ai/assets/*` and image wrapper over `decorative-images.ts`: max 2, stable slot
  identity, MIME/dimension checks, provenance, placeholders on failure.

### 3.9 Usage and privacy
Record per call/job/owner: input, output, reasoning-inclusive tokens, images, import fetches,
unknown when missing. Never log keys, imported documents, customer data or private addresses.
Owner-scope every query and route.

---

## 4. Tests

Mocked provider for the normal suite; add new test files to `test:website` in `package.json`.
Required (handoff §18, adjusted by §1.1):
- No template/look/demo-kit selector in the new flow; owners outside the gate see the old UI.
- Prefill does not mutate live settings; explicit brand choices survive; decorative images never
  become `identity.heroImageUrl`.
- Every selected supported page compiles, validates, previews and opens in the editor.
- FAQ uses FAQ section; Contact uses ContactForm; bindings use owned IDs; policy pages footer-only
  and publish-blocked until reviewed.
- Duplicate start returns the same job; two concurrent starts cannot both run; stale lease cannot
  commit; cancellation prevents apply; apply is idempotent after a simulated crash.
- Draft changed during build → NEEDS_CONFIRMATION, candidate preserved, nothing overwritten.
- Restore previous version restores the snapshot; blog posts and policy text survive a replace.
- Publish during a build publishes nothing generated.
- Other owners cannot read brief/job/candidate/asset; anonymous `?draft=1` reveals nothing.
- SSRF tests: loopback, private, link-local, metadata IPs, IPv6, redirects to private, oversized bodies.
- Existing `test:website` suite still passes.

Live check on stagingv2 with synthetic businesses (handoff §18 fixtures 1–7), using an allowlisted
test owner.

---

## 5. Definition of done
- Full journey works on `stagingv2.vendl.app`: wizard → build → private preview → editor →
  explicit **Publish website**.
- Nothing existing on social-kit is broken or removed; `main` and the main checkout untouched.
- `npm run test:website`, `npx tsc --noEmit`, `npm run build` all pass; results reported verbatim.
- Updated `docs/WEBSITE-BUILDER-OVERVIEW.md`, env var names (no values), measured cost/latency for
  the live smoke builds, list of remaining blockers.

## 6. Before anything reaches `main` (out of scope here, plan only)
Production (`ep-autumn-brook`) has no website tables and no `Storefront` create migration exists.
Produce a read-only inventory and a written baseline/migration strategy. Do not apply it.

## 7. Known branch state (for reference, do not act on it)
- `origin/feature/social-kit` == `feature/social-kit-website` at `a050015` (16 Oct 2026).
- Main checkout's local `feature/social-kit` is stale: 139 commits behind. Its only extra commit
  (`c8f879a`) is the identical patch already on stagingv2 as `d6ebf0c`, so nothing is missing.
  Leave the main checkout alone.
- `connectors/calendar-youtube` (YouTube, Pinterest, X connectors, calendar) is fully contained in
  stagingv2. stagingv2 is the most complete social branch; build on it.

## 8. Implementation status (first build)
Code lives in `src/lib/website-ai/assistant/` (server), `src/components/website-assistant/` (wizard UI),
`src/app/dashboard/(gated)/website/assistant/` (page + server actions),
`src/app/api/website-ai/jobs/[id]` (status, advances the job) and
`src/app/api/cron/process-website-generation` (cron/manual trigger, `Bearer CRON_SECRET`).

- **Gate:** `assistantEnabledFor(ownerId)` = website allowlist + `canUseAiWebsiteBuilder`. Allowlisted
  owners see "Create my website with AI" in Web Studio; the template page redirects to the assistant.
  Everyone else sees no change. Old AI panel, templates and actions are untouched.
- **Job stages:** prepare → plan → images → pages (one page per step) → compile → apply. State is saved
  after every step; leases fence writes; retries back off with jitter/Retry-After; after 5 attempts a
  step falls back to starter copy. Model auth/model errors switch the job to starter copy.
- **Apply:** rebuilds the candidate against the latest draft. Unchanged draft → applied in one
  transaction with the previous draft stored as the restore point. Changed draft →
  `NEEDS_CONFIRMATION`.
- **Replace scope:** layouts, theme, page records and navigation (header menu cleared to automatic).
  Kept: commerce layouts, blog posts, existing policy layouts, unselected pages (switched off, layout
  kept), domains, products, settings.
- **Policies:** AI drafts carry `custom.reviewRequired` on every node; `findPublishBlockers` blocks
  publish until the seller ticks "I've reviewed this". Without AI copy, policy pages are left out.
- **Import:** `imports/safe-fetch.ts` pins DNS to a vetted public IP, manual redirects (max 3),
  1.5 MB / 10 s caps, HTML only. Facts are proposals until ticked. Imported photos are listed but not
  yet used (they would need copying to Blob first).
- **Env var names:** `AI_WEBSITE_BUILDER_*` (enable + allowlist), `WEBSITE_AI_MODEL`,
  `WEBSITE_AI_REASONING_EFFORT`, `OPENAI_API_KEY`, `WEBSITE_AI_IMAGE_MODEL`, `WEBSITE_AI_IMAGE_QUALITY`,
  `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`.
- **Google & search profile:** `storefront.businessProfile` (structured data) stays the source of truth
  and is edited only in Web Studio → Details & publish. The assistant reads it (`context/search-profile.ts`)
  into AI facts (hours, location, awards etc. used verbatim) and the brief prefill; step 1 shows what it
  uses or prompts to set it up, and the result screen links to it. The assistant never writes it.
- **Known gaps:** contact forms in the draft preview still send (existing behaviour); imported photos
  unused; no per-owner build quota (usage is recorded on the job).
