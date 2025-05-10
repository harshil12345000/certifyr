
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
  status: string;
  date: string;
  recipient: string | null;
}
