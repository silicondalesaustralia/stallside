-- Clip output quality (run in the social Supabase project's SQL editor).

ALTER TABLE social_video_clip_jobs
  ADD COLUMN IF NOT EXISTS quality text NOT NULL DEFAULT 'auto'
  CHECK (quality IN ('auto', '720p', '1080p'));

COMMENT ON COLUMN social_video_clip_jobs.quality IS
  'auto = resolution picked from clip length (size budget); 720p / 1080p = fixed long edge and higher encode quality.';
