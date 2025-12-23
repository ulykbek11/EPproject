-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_files', 'project_files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload project files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project_files' AND auth.uid() = owner);

-- Policy to allow authenticated users to update their files
CREATE POLICY "Authenticated users can update project files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project_files' AND auth.uid() = owner);

-- Policy to allow everyone to view project files (or just auth users)
CREATE POLICY "Anyone can view project files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project_files');

-- Policy to allow users to delete their files
CREATE POLICY "Authenticated users can delete project files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project_files' AND auth.uid() = owner);

-- Add file_url and ai_analysis columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis TEXT,
ADD COLUMN IF NOT EXISTS ai_rating INTEGER; -- 0-100 score for the project
