
-- Create documents table to store user documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Created', 'Sent', 'Signed')),
  recipient TEXT,
  template_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_documents_user_id_created_at ON public.documents(user_id, created_at DESC);
