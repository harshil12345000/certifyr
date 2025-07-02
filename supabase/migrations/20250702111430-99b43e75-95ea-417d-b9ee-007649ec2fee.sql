-- Create request portal settings table
CREATE TABLE public.request_portal_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  password_hash TEXT NOT NULL,
  portal_url TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Create request portal employees table
CREATE TYPE public.employee_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.request_portal_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  employee_id TEXT NOT NULL,
  email TEXT NOT NULL,
  manager_name TEXT,
  status public.employee_status NOT NULL DEFAULT 'pending',
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, employee_id),
  UNIQUE(organization_id, email)
);

-- Create document requests table
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.document_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.request_portal_employees(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  template_data JSONB NOT NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.request_portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_portal_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for request_portal_settings
CREATE POLICY "Organization admins can manage portal settings"
ON public.request_portal_settings
FOR ALL
USING (organization_id IN (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
));

-- RLS policies for request_portal_employees
CREATE POLICY "Organization admins can manage employees"
ON public.request_portal_employees
FOR ALL
USING (organization_id IN (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
));

CREATE POLICY "Public can register as employees"
ON public.request_portal_employees
FOR INSERT
WITH CHECK (true);

-- RLS policies for document_requests
CREATE POLICY "Organization admins can manage requests"
ON public.document_requests
FOR ALL
USING (organization_id IN (
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
));

CREATE POLICY "Public can create requests"
ON public.document_requests
FOR INSERT
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_request_portal_settings_updated_at
BEFORE UPDATE ON public.request_portal_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_request_portal_employees_updated_at
BEFORE UPDATE ON public.request_portal_employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_requests_updated_at
BEFORE UPDATE ON public.document_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();