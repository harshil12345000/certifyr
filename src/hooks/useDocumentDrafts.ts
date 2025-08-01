
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DocumentDraft {
  id: string;
  name: string;
  template_id: string;
  form_data: any;
  created_at: string;
  updated_at: string;
}

export function useDocumentDrafts() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<DocumentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDrafts([]);
      setLoading(false);
      return;
    }

    const fetchDrafts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("document_drafts")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Error fetching document drafts:", error);
          setError("Failed to fetch drafts");
          return;
        }

        setDrafts(data || []);
      } catch (err) {
        console.error("Unexpected error fetching drafts:", err);
        setError("Failed to fetch drafts");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [user]);

  const saveDraft = async (name: string, templateId: string, formData: any) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("document_drafts")
        .insert({
          user_id: user.id,
          name,
          template_id: templateId,
          form_data: formData,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving draft:", error);
        throw error;
      }

      setDrafts(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    }
  };

  const updateDraft = async (id: string, formData: any) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("document_drafts")
        .update({
          form_data: formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating draft:", error);
        throw error;
      }

      setDrafts(prev => prev.map(draft => draft.id === id ? data : draft));
      return data;
    } catch (error) {
      console.error("Error updating draft:", error);
      throw error;
    }
  };

  const deleteDraft = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("document_drafts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting draft:", error);
        throw error;
      }

      setDrafts(prev => prev.filter(draft => draft.id !== id));
    } catch (error) {
      console.error("Error deleting draft:", error);
      throw error;
    }
  };

  return {
    drafts,
    loading,
    error,
    saveDraft,
    updateDraft,
    deleteDraft,
  };
}
