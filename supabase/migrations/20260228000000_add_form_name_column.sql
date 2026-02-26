-- Add form_name column to library_documents if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_documents' AND column_name = 'form_name') THEN
    ALTER TABLE library_documents ADD COLUMN form_name TEXT;
  END IF;
END $$;
