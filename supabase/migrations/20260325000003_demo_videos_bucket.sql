-- Create storage bucket for demo videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('demo-videos', 'demo-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to demo-videos bucket
CREATE POLICY "Authenticated users can upload demo videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'demo-videos');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update demo videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'demo-videos');

-- Allow public read access to demo videos
CREATE POLICY "Public can view demo videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'demo-videos');
