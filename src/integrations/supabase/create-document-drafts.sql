
-- Create document_drafts table
CREATE TABLE IF NOT EXISTS public.document_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id TEXT NOT NULL,
  form_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on document_drafts
ALTER TABLE public.document_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for document_drafts
CREATE POLICY "Users can view their own drafts" ON public.document_drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drafts" ON public.document_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts" ON public.document_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts" ON public.document_drafts
  FOR DELETE USING (auth.uid() = user_id);
