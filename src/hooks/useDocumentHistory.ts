import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationSecurity } from "./useOrganizationSecurity";
import { toast } from "@/hooks/use-toast";

export interface DocumentHistoryItem {
  id: string;
  user_id: string;
  organization_id: string;
  document_name: string;
  form_data: any;
  template_id: string;
  created_at: string;
  updated_at: string;
  is_editable: boolean;
  status: string;
}

export function useDocumentHistory() {
  const { user } = useAuth();
  const { organizationId } = useOrganizationSecurity();
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user || !organizationId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("document_history")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching document history:", error);
      toast({
        title: "Error",
        description: "Failed to load document history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, organizationId]);

  const saveDocument = async (
    documentName: string,
    formData: any,
    templateId: string
  ) => {
    if (!user || !organizationId) {
      toast({
        title: "Error",
        description: "You must be logged in to save documents",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Check if document already exists for this user, org, and template
      const { data: existingDocs } = await supabase
        .from("document_history")
        .select("id")
        .eq("user_id", user.id)
        .eq("organization_id", organizationId)
        .eq("template_id", templateId)
        .limit(1);

      let result;

      if (existingDocs && existingDocs.length > 0) {
        // Update existing document
        result = await supabase
          .from("document_history")
          .update({
            document_name: documentName,
            form_data: formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingDocs[0].id)
          .select()
          .single();

        if (result.error) throw result.error;

        toast({
          title: "Success",
          description: "Document updated in History",
        });
      } else {
        // Insert new document
        result = await supabase
          .from("document_history")
          .insert({
            user_id: user.id,
            organization_id: organizationId,
            document_name: documentName,
            form_data: formData,
            template_id: templateId,
            status: "draft",
          })
          .select()
          .single();

        if (result.error) throw result.error;

        toast({
          title: "Success",
          description: "Document saved to History",
        });
      }

      fetchHistory();
      return result.data;
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateDocument = async (id: string, formData: any) => {
    try {
      const { error } = await supabase
        .from("document_history")
        .update({ form_data: formData, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document updated",
      });

      fetchHistory();
      return true;
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from("document_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted",
      });

      fetchHistory();
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    history,
    loading,
    saveDocument,
    updateDocument,
    deleteDocument,
    refetch: fetchHistory,
  };
}
