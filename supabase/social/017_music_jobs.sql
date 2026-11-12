-- Background music: the music library bucket + async "add music to this video" jobs from Create a post.
-- Run in the social Supabase project's SQL editor.
-- The web app inserts jobs; the video worker claims pending rows, mixes the track in with ffmpeg
-- and saves the result as a new Library video (the source video is left untouched).
-- RLS is on with no policies: only Vendl's server (service role) reads this table.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('social-music', 'social-music', true, 10485760, ARRAY['audio/mpeg'])
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS social_music_jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  source_url       text NOT NULL,
  source_asset_id  uuid NULL REFERENCES social_media_assets(id) ON DELETE SET NULL,
  music            jsonb NOT NULL,
  status           text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  asset_id         uuid NULL REFERENCES social_media_assets(id) ON DELETE SET NULL,
  error_message    text NULL,
  claimed_at       timestamptz NULL,
  worker_id        text NULL,
  completed_at     timestamptz NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_music_jobs_pending
  ON social_music_jobs (created_at ASC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_social_music_jobs_business
  ON social_music_jobs (business_id, created_at DESC);

ALTER TABLE social_music_jobs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON social_music_jobs TO service_role;

COMMENT ON TABLE social_music_jobs IS
  'Create a post > Add music. The video worker mixes a library track into a video and saves a new Library asset.';

NOTIFY pgrst, 'reload schema';
