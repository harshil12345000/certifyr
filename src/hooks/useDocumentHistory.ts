import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationSecurity } from "./useOrganizationSecurity";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "./useSubscription";

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
  const { subscription } = useSubscription();
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradePaywall, setShowUpgradePaywall] = useState(false);

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Resolve organization id via hook or RPC fallback
      let orgId = organizationId as string | null | undefined;
      if (!orgId) {
        const { data: fetchedOrgId, error: orgErr } = await supabase.rpc(
          "get_user_organization_id",
          { user_id: user.id }
        );
        if (orgErr) {
          console.error("Error fetching organization id via RPC:", orgErr);
        }
        orgId = (fetchedOrgId as string | null) || null;
      }

      if (!orgId) {
        setHistory([]);
        return;
      }

      const { data, error } = await supabase
        .from("document_history")
        .select("*")
        .eq("organization_id", orgId)
        .order("updated_at", { ascending: false });

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
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save documents",
        variant: "destructive",
      });
      return null;
    }

    // Check document limit for Basic (free) users
    const isBasicFree = subscription?.active_plan === 'basic' && subscription?.subscription_status === 'active';
    if (isBasicFree) {
      const { data: limitData } = await supabase.rpc('check_document_limit', { p_user_id: user.id });
      if (limitData && (limitData as any).allowed === false) {
        setShowUpgradePaywall(true);
        toast({
          title: "Document Limit Reached",
          description: "You've reached your 25 document limit. Upgrade to Pro for unlimited documents.",
          variant: "destructive",
        });
        return null;
      }
    }

    // Ensure we have an organization ID; fetch via RPC if missing
    let orgId = organizationId as string | null | undefined;
    if (!orgId) {
      const { data: fetchedOrgId, error: orgErr } = await supabase.rpc(
        "get_user_organization_id",
        { user_id: user.id }
      );
      if (orgErr) {
        console.error("Error fetching organization id via RPC:", orgErr);
      }
      orgId = (fetchedOrgId as string | null) || null;
    }
    if (!orgId) {
      toast({
        title: "Error",
        description: "No active organization found for your account.",
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
        .eq("organization_id", orgId)
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
            status: "Draft",
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
            organization_id: orgId,
            document_name: documentName,
            form_data: formData,
            template_id: templateId,
            status: "Draft",
          })
          .select()
          .single();

        if (result.error) throw result.error;

        toast({
          title: "Success",
          description: "Document saved to History",
        });
      }

      // Also sync to document_drafts for quick access
      try {
        const { data: existingDrafts } = await supabase
          .from("document_drafts")
          .select("id")
          .eq("user_id", user.id)
          .eq("template_id", templateId)
          .limit(1);

        if (existingDrafts && existingDrafts.length > 0) {
          await supabase
            .from("document_drafts")
            .update({
              form_data: formData,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingDrafts[0].id)
            .eq("user_id", user.id);
        } else {
          await supabase
            .from("document_drafts")
            .insert({
              user_id: user.id,
              name: documentName,
              template_id: templateId,
              form_data: formData,
            });
        }
      } catch (e) {
        console.error("Error syncing document_drafts:", e);
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
    showUpgradePaywall,
    setShowUpgradePaywall,
  };
}
