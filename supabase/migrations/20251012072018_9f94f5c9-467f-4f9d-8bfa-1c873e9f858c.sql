-- Create document_history table
CREATE TABLE IF NOT EXISTS public.document_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  document_name TEXT NOT NULL,
  form_data JSONB NOT NULL,
  template_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_editable BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'draft'
);

-- Enable RLS
ALTER TABLE public.document_history ENABLE ROW LEVEL SECURITY;

-- Users can only view documents from their own organization
CREATE POLICY "Users can view their organization's history"
ON public.document_history
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Users can insert documents for their organization
CREATE POLICY "Users can create history in their organization"
ON public.document_history
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Users can update their own documents in their organization
CREATE POLICY "Users can update their own history"
ON public.document_history
FOR UPDATE
USING (
  user_id = auth.uid() AND
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own history"
ON public.document_history
FOR DELETE
USING (
  user_id = auth.uid() AND
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_document_history_updated_at
  BEFORE UPDATE ON public.document_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_document_history_org_user ON public.document_history(organization_id, user_id);
CREATE INDEX idx_document_history_created ON public.document_history(created_at DESC);