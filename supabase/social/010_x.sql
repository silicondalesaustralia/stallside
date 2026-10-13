-- X (Twitter) connector + publishing (run in the social Supabase project's SQL editor).

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS x_user_id           text,
  ADD COLUMN IF NOT EXISTS x_username          text,
  ADD COLUMN IF NOT EXISTS x_profile_image_url text,
  ADD COLUMN IF NOT EXISTS x_access_token      text,
  ADD COLUMN IF NOT EXISTS x_refresh_token     text,
  ADD COLUMN IF NOT EXISTS x_token_expires_at  timestamptz,
  ADD COLUMN IF NOT EXISTS x_scopes            text;

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS x_post_id text,
  ADD COLUMN IF NOT EXISTS x_error   text;

COMMENT ON COLUMN businesses.x_access_token IS
  'X OAuth 2.0 user access token (~2 hours). Refreshed via x_refresh_token, which rotates on every refresh.';
COMMENT ON COLUMN social_posts.x_post_id IS 'Post (tweet) id returned by POST /2/tweets.';
