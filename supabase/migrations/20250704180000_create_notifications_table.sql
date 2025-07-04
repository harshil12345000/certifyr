-- Create notifications table for admin notifications from the employee portal
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID REFERENCES public.request_portal_employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
); 