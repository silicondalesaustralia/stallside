-- Long-form social video (up to 30 min): raise social-posts bucket cap to 4 GB.
-- The Supabase project's global upload limit (Storage settings) must also be >= 4 GB.
UPDATE storage.buckets
SET file_size_limit = 4294967296
WHERE id = 'social-posts';
