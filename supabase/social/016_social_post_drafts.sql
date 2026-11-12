-- Saved drafts from Create a post ("Save draft"). Kept apart from social_posts so drafts never
-- reach the publish cron, the Posts history or the post/schedule validation.
-- Run in the social Supabase project's SQL editor.
-- RLS is on with no policies: only Vendl's server (service role) reads this table.

CREATE TABLE IF NOT EXISTS social_post_drafts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  data         jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_post_drafts_business
  ON social_post_drafts (business_id, updated_at DESC);

ALTER TABLE social_post_drafts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON social_post_drafts TO service_role;

COMMENT ON TABLE social_post_drafts IS
  'Composer snapshots saved with "Save draft" (platforms, caption, media, slideshow work). Deleted once posted or scheduled.';

NOTIFY pgrst, 'reload schema';
