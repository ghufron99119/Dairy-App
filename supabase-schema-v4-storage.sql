-- =============================================
-- Nexus Personal Website - Schema V4: Storage & Policies
-- Run this AFTER supabase-schema-v3-cron.sql
-- =============================================

-- 1. Create Storage Bucket for Avatars
-- Note: 'avatars' bucket for public profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
-- Allow public read access to everyone
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar
-- Folder structure: avatars/{user_id}/filename
CREATE POLICY "User Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow users to update their own avatar
CREATE POLICY "User Update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Allow users to delete their own avatar
CREATE POLICY "User Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
);
