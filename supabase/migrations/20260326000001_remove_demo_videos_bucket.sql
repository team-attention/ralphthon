-- Remove demo-videos storage bucket and policies (video submission is now link-based)

DROP POLICY IF EXISTS "Authenticated users can upload demo videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update demo videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view demo videos" ON storage.objects;

DELETE FROM storage.objects WHERE bucket_id = 'demo-videos';
DELETE FROM storage.buckets WHERE id = 'demo-videos';
