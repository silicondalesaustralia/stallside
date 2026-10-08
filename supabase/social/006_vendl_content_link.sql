-- Vendl products / pre-order pages / subscriptions / memberships are mirrored
-- into jobs (+ job_photos) so the existing caption, AI image and planner code
-- can use them as "related content" unchanged.
-- description: read by caption, TikTok slide and infographic routes but missing
-- from the StitchedUp schema.

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS external_ref text;

CREATE UNIQUE INDEX IF NOT EXISTS jobs_business_external_ref_key
  ON public.jobs (business_id, external_ref)
  WHERE external_ref IS NOT NULL;
