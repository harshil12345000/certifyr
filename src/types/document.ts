import { BonafideData } from "./templates";
import { Json } from "@/integrations/supabase/types";

export interface DocumentDraft {
  id: string;
  name: string;
  template_id: string;
  data: BonafideData;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface SharedLink {
  id: string;
  document_id: string;
  user_id: string;
  created_at: string;
  expires_at: string | null;
}

// Type for documents shown in the dashboard
export interface Document {
  id: string;
  name: string;
  type: string;
  status: "Signed" | "Sent" | "Created";
  date: string;
  recipient: string | null;
}

// Type for document requests that matches Supabase response
export interface DocumentRequest {
  id: string;
  template_id: string;
  template_data: Json;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  processed_at?: string | null;
  employee_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  processed_by?: string | null;
}
