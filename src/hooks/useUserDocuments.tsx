import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Document } from "@/types/document";

export function useUserDocuments(limit = 10, refreshIndex?: number) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {
          setError("Failed to fetch documents");
          setDocuments([]);
          return;
        }

        // Transform the data to match our Document interface
        const transformedData: Document[] = (data || []).map((doc) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          status: doc.status as "Created" | "Sent" | "Signed",
          date: new Date(doc.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          recipient: doc.recipient,
        }));

        setDocuments(transformedData);
      } catch (err) {
        setError("Failed to fetch documents");
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

    // Set up real-time subscription for live updates only if user exists
    if (!user?.id) return;

    const channel = supabase
      .channel(`documents-changes-${user.id}`, {
        config: {
          broadcast: { self: false },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "documents",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchDocuments();
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          // Silently handle subscription errors
          channel.unsubscribe();
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, limit, refreshIndex]);

  return { documents, loading, error };
}
