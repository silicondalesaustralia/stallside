-- Pinterest video Pins (run in the social Supabase project's SQL editor).

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS pinterest_media_id text;

COMMENT ON COLUMN social_posts.pinterest_media_id IS
  'Pinterest media id for a video Pin; set while Pinterest processes the upload, then the cron creates the Pin.';
