-- Maps the host app's (Vendl's) accounts and users onto the social DB rows.
-- The social code keys everything on businesses.id / users.id (uuid). Vendl
-- keeps its own ids; lib/socialHost/provisionSocialIdentity.ts upserts these
-- rows on authenticated requests (idempotent, cached per request).
SET search_path = public;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS external_account_id text;
CREATE UNIQUE INDEX IF NOT EXISTS businesses_external_account_id_key
  ON public.businesses (external_account_id);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS external_user_id text;
CREATE UNIQUE INDEX IF NOT EXISTS users_external_user_id_key
  ON public.users (external_user_id);

ALTER TABLE public.users
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Social accounts are always "active" in the social DB; Vendl gates access
-- in lib/socialHost/hostAccess.ts instead of via StitchedUp subscriptions.
ALTER TABLE public.businesses
  ALTER COLUMN subscription_status SET DEFAULT 'active';
