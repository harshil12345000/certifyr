-- Add form_name column to library_documents
ALTER TABLE library_documents ADD COLUMN IF NOT EXISTS form_name TEXT;
