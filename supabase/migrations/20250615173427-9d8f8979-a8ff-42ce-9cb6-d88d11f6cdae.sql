-- Create table for logging QR code verification attempts
CREATE TABLE public.qr_verification_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_hash character varying NOT NULL,
  scanned_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  verification_result character varying NOT NULL CHECK (verification_result IN ('verified', 'not_found', 'expired')),
  document_id uuid,
  template_type character varying,
  organization_id uuid,
  user_id uuid
);

-- Add Row Level Security
ALTER TABLE public.qr_verification_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (needed for verification)
CREATE POLICY "Allow public verification logging" 
  ON public.qr_verification_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for organization members to view logs
CREATE POLICY "Organization members can view verification logs" 
  ON public.qr_verification_logs 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Add index for performance
CREATE INDEX idx_qr_verification_logs_hash ON public.qr_verification_logs(verification_hash);
CREATE INDEX idx_qr_verification_logs_scanned_at ON public.qr_verification_logs(scanned_at);
