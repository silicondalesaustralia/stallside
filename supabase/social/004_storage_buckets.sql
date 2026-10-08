-- Storage buckets the social code reads/writes (same config as StitchedUp).
-- All access is server-side with the service role (signed upload URLs for
-- browser uploads), so no storage.objects policies are needed.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('social-posts', 'social-posts', true, 262144000,
    ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm']),
  ('inspiration-temp', 'inspiration-temp', false, 4194304,
    ARRAY['image/jpeg','image/png','image/webp']),
  ('business-assets', 'business-assets', false, NULL, NULL),
  ('job-photos', 'job-photos', false, 10485760, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
