-- create teams storage bucket for logos
-- This script must be run once to ensure the storage bucket exists

-- Create the bucket if it doesn't exist
-- Note: In Supabase integrations, sometimes we need to do this via SQL if not auto-created
insert into storage.buckets (id, name, public)
select 'teams', 'teams', true
where not exists (
    select 1 from storage.buckets where id = 'teams'
);

-- Set up access policies for the 'teams' bucket
-- 1. Allow public access to read files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'teams' );

-- 2. Allow authenticated users to upload files
create policy "Authenticated users can upload logos"
on storage.objects for insert
with check (
    bucket_id = 'teams' AND
    auth.role() = 'authenticated'
);

-- 3. Allow users to update their own logos
create policy "Users can update their own logos"
on storage.objects for update
using (
    bucket_id = 'teams' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Allow users to delete their own logos
create policy "Users can delete their own logos"
on storage.objects for delete
using (
    bucket_id = 'teams' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
