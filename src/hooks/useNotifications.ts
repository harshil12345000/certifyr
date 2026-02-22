
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizationIdForUser } from "./useUserStats";

export interface Notification {
  id: string;
  subject: string;
  body: string;
  type: string;
  data?: any;
  read_by: string[];
  created_at: string;
  org_id: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's organization
        const orgId = await getOrganizationIdForUser(user.id);
        
        if (!orgId) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching notifications:", error);
          setError("Failed to fetch notifications");
          return;
        }

        setNotifications((data || []) as unknown as Notification[]);
      } catch (err) {
        console.error("Unexpected error fetching notifications:", err);
        setError("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      // Add user ID to read_by array
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      const updatedReadBy = [...(notification.read_by || []), user.id];

      const { error } = await supabase
        .from("notifications")
        .update({ read_by: updatedReadBy })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_by: updatedReadBy }
            : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadNotifications = notifications.filter(
    n => !n.read_by?.includes(user?.id || "")
  );

  return {
    notifications,
    unreadNotifications,
    loading,
    error,
    markAsRead,
  };
}
