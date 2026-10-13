-- Pinterest connector + publishing (run in the social Supabase project's SQL editor).

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS pinterest_user_id           text,
  ADD COLUMN IF NOT EXISTS pinterest_username          text,
  ADD COLUMN IF NOT EXISTS pinterest_profile_image_url text,
  ADD COLUMN IF NOT EXISTS pinterest_access_token      text,
  ADD COLUMN IF NOT EXISTS pinterest_refresh_token     text,
  ADD COLUMN IF NOT EXISTS pinterest_token_expires_at  timestamptz,
  ADD COLUMN IF NOT EXISTS pinterest_scopes            text;

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS pinterest_post_id   text,
  ADD COLUMN IF NOT EXISTS pinterest_error     text,
  ADD COLUMN IF NOT EXISTS pinterest_settings  jsonb;

COMMENT ON COLUMN businesses.pinterest_access_token IS
  'Pinterest OAuth access token (~30 days). Refreshed via pinterest_refresh_token.';
COMMENT ON COLUMN social_posts.pinterest_post_id IS 'Pin id returned by POST /v5/pins.';
COMMENT ON COLUMN social_posts.pinterest_settings IS 'User-chosen Pin settings: { boardId, boardName, title, link }';
