-- YouTube connector + publishing (run in the social Supabase project's SQL editor).

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS youtube_channel_id            text,
  ADD COLUMN IF NOT EXISTS youtube_channel_title         text,
  ADD COLUMN IF NOT EXISTS youtube_channel_thumbnail_url text,
  ADD COLUMN IF NOT EXISTS youtube_access_token          text,
  ADD COLUMN IF NOT EXISTS youtube_refresh_token         text,
  ADD COLUMN IF NOT EXISTS youtube_token_expires_at      timestamptz,
  ADD COLUMN IF NOT EXISTS youtube_scopes                text;

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS youtube_post_id   text,
  ADD COLUMN IF NOT EXISTS youtube_error     text,
  ADD COLUMN IF NOT EXISTS youtube_settings  jsonb;

COMMENT ON COLUMN businesses.youtube_access_token IS
  'Google OAuth access token (~1h) for the YouTube Data API. Refreshed via youtube_refresh_token (does not rotate).';
COMMENT ON COLUMN social_posts.youtube_post_id IS 'YouTube video id returned by videos.insert.';
COMMENT ON COLUMN social_posts.youtube_settings IS 'User-chosen YouTube upload settings: { title, privacy }';
