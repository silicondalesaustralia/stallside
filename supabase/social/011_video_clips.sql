-- Videos: long source uploads -> AI clip jobs -> clips saved to social_media_assets (Library),
-- plus caption/editor re-render jobs. Run in the social Supabase project's SQL editor.
-- Source files live in Cloudflare R2 (storage_path = R2 object key), deleted by an R2
-- lifecycle rule after 7 days. Combines StitchedUp 280, 282, 283 and 292.
-- RLS is on with no policies: only Vendl's server (service role) reads these tables.

CREATE TABLE IF NOT EXISTS social_video_sources (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  job_id            uuid NULL REFERENCES jobs(id) ON DELETE SET NULL,
  status            text NOT NULL DEFAULT 'uploading'
    CHECK (status IN ('uploading', 'ready', 'failed')),
  title             text NULL,
  about_text        text NULL,
  storage_path      text NOT NULL,
  mime_type         text NOT NULL,
  file_size_bytes   bigint NULL,
  duration_seconds  numeric NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_video_sources_business
  ON social_video_sources (business_id, created_at DESC);

ALTER TABLE social_video_sources ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS social_video_clip_jobs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id         uuid NOT NULL REFERENCES social_video_sources(id) ON DELETE CASCADE,
  business_id       uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  status            text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  clip_count        integer NOT NULL DEFAULT 4 CHECK (clip_count BETWEEN 1 AND 8),
  clip_length       text NOT NULL DEFAULT 'short',
  aspect            text NOT NULL DEFAULT 'vertical' CHECK (aspect IN ('vertical', 'original')),
  caption_style     text NOT NULL DEFAULT 'bold',
  caption_position  text NOT NULL DEFAULT 'bottom',
  clips_created     integer NOT NULL DEFAULT 0,
  progress_stage    text NULL,
  error_code        text NULL,
  error_message     text NULL,
  claimed_at        timestamptz NULL,
  worker_id         text NULL,
  completed_at      timestamptz NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE social_video_clip_jobs
  DROP CONSTRAINT IF EXISTS social_video_clip_jobs_clip_length_check,
  DROP CONSTRAINT IF EXISTS social_video_clip_jobs_caption_style_check,
  DROP CONSTRAINT IF EXISTS social_video_clip_jobs_caption_position_check;

ALTER TABLE social_video_clip_jobs
  ADD CONSTRAINT social_video_clip_jobs_clip_length_check
    CHECK (clip_length IN ('short', 'medium', 'full')),
  ADD CONSTRAINT social_video_clip_jobs_caption_style_check
    CHECK (caption_style IN ('bold', 'boxed', 'minimal', 'none')),
  ADD CONSTRAINT social_video_clip_jobs_caption_position_check
    CHECK (caption_position IN ('bottom', 'middle'));

CREATE INDEX IF NOT EXISTS idx_social_video_clip_jobs_pending
  ON social_video_clip_jobs (created_at ASC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_social_video_clip_jobs_source
  ON social_video_clip_jobs (source_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_video_one_active_clip_job_per_source
  ON social_video_clip_jobs (source_id)
  WHERE status IN ('pending', 'processing');

ALTER TABLE social_video_clip_jobs ENABLE ROW LEVEL SECURITY;

-- Clip provenance and editor state on Library assets (all nullable - existing rows unaffected).
ALTER TABLE social_media_assets
  ADD COLUMN IF NOT EXISTS source_video_id uuid NULL
    REFERENCES social_video_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS clip_job_id uuid NULL
    REFERENCES social_video_clip_jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS clip_start_seconds numeric NULL,
  ADD COLUMN IF NOT EXISTS clip_end_seconds numeric NULL,
  ADD COLUMN IF NOT EXISTS clip_title text NULL,
  ADD COLUMN IF NOT EXISTS clip_score integer NULL,
  ADD COLUMN IF NOT EXISTS captions jsonb NULL;

CREATE INDEX IF NOT EXISTS idx_social_media_assets_source_video
  ON social_media_assets (source_video_id)
  WHERE source_video_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS social_video_caption_jobs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id       uuid NOT NULL REFERENCES social_media_assets(id) ON DELETE CASCADE,
  business_id    uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  status         text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message  text NULL,
  claimed_at     timestamptz NULL,
  worker_id      text NULL,
  completed_at   timestamptz NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_video_caption_jobs_pending
  ON social_video_caption_jobs (created_at ASC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_social_video_caption_jobs_asset
  ON social_video_caption_jobs (asset_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_video_one_active_caption_job_per_asset
  ON social_video_caption_jobs (asset_id)
  WHERE status IN ('pending', 'processing');

ALTER TABLE social_video_caption_jobs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON social_video_sources, social_video_clip_jobs, social_video_caption_jobs
  TO service_role;

COMMENT ON TABLE social_video_sources IS
  'Long source videos uploaded in Social > Videos. Not shown in Library; clips are.';
COMMENT ON TABLE social_video_clip_jobs IS
  'Async AI clip jobs. The video worker claims pending rows via service role.';
COMMENT ON TABLE social_video_caption_jobs IS
  'Editor re-render jobs for clip assets. Worker reads social_media_assets.captions.';
COMMENT ON COLUMN social_media_assets.captions IS
  'Clip editor state: words, cues, settings, cleanPath, segments, overlays, speed, audioMutes.';

NOTIFY pgrst, 'reload schema';
