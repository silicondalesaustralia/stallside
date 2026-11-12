-- Slideshow videos: rendered slide JPEGs -> 9:16 MP4 saved to social_media_assets (Library).
-- Run in the social Supabase project's SQL editor.
-- The web app renders the slide images; the video worker claims pending rows and runs ffmpeg.
-- RLS is on with no policies: only Vendl's server (service role) reads this table.

CREATE TABLE IF NOT EXISTS social_slideshow_jobs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id        uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  job_id             uuid NULL REFERENCES jobs(id) ON DELETE SET NULL,
  status             text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  slide_paths        text[] NOT NULL CHECK (cardinality(slide_paths) BETWEEN 1 AND 10),
  seconds_per_slide  numeric NOT NULL DEFAULT 3 CHECK (seconds_per_slide BETWEEN 1 AND 10),
  transition         text NOT NULL DEFAULT 'fade' CHECK (transition IN ('fade', 'slide', 'none')),
  about_text         text NULL,
  asset_id           uuid NULL REFERENCES social_media_assets(id) ON DELETE SET NULL,
  error_message      text NULL,
  claimed_at         timestamptz NULL,
  worker_id          text NULL,
  completed_at       timestamptz NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_slideshow_jobs_pending
  ON social_slideshow_jobs (created_at ASC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_social_slideshow_jobs_business
  ON social_slideshow_jobs (business_id, created_at DESC);

ALTER TABLE social_slideshow_jobs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON social_slideshow_jobs TO service_role;

COMMENT ON TABLE social_slideshow_jobs IS
  'Async slideshow video jobs from Create a post > Slideshow. The video worker claims pending rows via service role.';

NOTIFY pgrst, 'reload schema';
