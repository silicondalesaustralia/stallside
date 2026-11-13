-- "Post now" queues the post and publishes it in the background.
-- 'publishing' marks a post that a worker has claimed, so the cron and the
-- background publish never post the same row twice.

ALTER TABLE public.social_posts DROP CONSTRAINT IF EXISTS social_posts_status_check;
ALTER TABLE public.social_posts ADD CONSTRAINT social_posts_status_check
  CHECK (status = ANY (ARRAY['draft', 'scheduled', 'publishing', 'posted', 'failed', 'cancelled']));

ALTER TABLE public.social_posts ADD COLUMN IF NOT EXISTS publishing_started_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_social_posts_publishing
  ON public.social_posts (publishing_started_at)
  WHERE status = 'publishing';
