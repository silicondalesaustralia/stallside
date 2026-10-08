-- Vendl business profile mirrored onto the social business at provisioning
-- (stand vertical / owner business mode → plain-English type for AI prompts).

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS business_type text;

ALTER TABLE public.businesses ALTER COLUMN social_default_cta SET DEFAULT 'Order online';
UPDATE public.businesses SET social_default_cta = 'Order online'
  WHERE social_default_cta = 'Call us for a free quote';
