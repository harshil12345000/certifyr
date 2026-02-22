import { useEffect, useState } from "react";
import { Bell, Search, Settings, Building2, LogOut, CircleHelp, CircleX, Check, FileText, Send, HelpCircle, CircleUserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { NotificationSkeleton } from "@/components/ui/notification-skeleton";
interface Notification {
  id: string;
  subject: string;
  body: string;
  created_at: string;
  read_by?: string[];
  is_read?: boolean;
}

// Import documents data for search functionality
const allDocuments = [{
  id: "bonafide-1",
  title: "Bonafide Certificate",
  description: "Student verification certificate",
  category: "Academic"
}, {
  id: "character-1",
  title: "Character Certificate",
  description: "Character verification document",
  category: "Academic"
}, {
  id: "experience-1",
  title: "Experience Certificate",
  description: "Work experience verification",
  category: "Employment"
}, {
  id: "embassy-attestation-1",
  title: "Embassy Attestation",
  description: "Letter for document attestation at embassies",
  category: "Travel"
}, {
  id: "completion-certificate-1",
  title: "Completion Certificate",
  description: "Certificate for courses, training programs, internships",
  category: "Educational"
}, {
  id: "transfer-certificate-1",
  title: "Transfer Certificate",
  description: "Certificate for students moving between institutions",
  category: "Educational"
}, {
  id: "noc-visa-1",
  title: "NOC for Visa Application",
  description: "No Objection Certificate for visa applications",
  category: "Travel"
}, {
  id: "income-certificate-1",
  title: "Income Certificate",
  description: "Certificate stating employee income details",
  category: "Employment"
}, {
  id: "maternity-leave-1",
  title: "Maternity Leave Application",
  description: "Application for maternity leave benefits",
  category: "Employment"
}, {
  id: "bank-verification-1",
  title: "Bank Account Verification",
  description: "Letter confirming account details for banks",
  category: "Financial"
}, {
  id: "offer-letter-1",
  title: "Offer Letter",
  description: "Formal job offer letter to candidates",
  category: "Employment"
}, {
  id: "address-proof-1",
  title: "Address Proof Certificate",
  description: "Certificate verifying residential address",
  category: "Legal"
}, {
  id: "articles-incorporation-1",
  title: "Articles of Incorporation",
  description: "Certificate of Incorporation for new corporations",
  category: "Corporate"
}, {
  id: "corporate-bylaws-1",
  title: "Corporate Bylaws",
  description: "Corporate governance and operating procedures",
  category: "Corporate"
}, {
  id: "founders-agreement-1",
  title: "Founders' Agreement",
  description: "Agreement between company founders",
  category: "Corporate"
}, {
  id: "stock-purchase-agreement-1",
  title: "Stock Purchase Agreement",
  description: "Agreement for purchasing company shares",
  category: "Corporate"
}, {
  id: "employment-agreement-1",
  title: "Employment Agreement",
  description: "Comprehensive employment contract",
  category: "Corporate"
}, {
  id: "nda-1",
  title: "Non-Disclosure Agreement (NDA)",
  description: "Confidentiality agreement between parties",
  category: "Corporate"
}, {
  id: "academic-transcript-1",
  title: "Academic Transcript / Marksheet",
  description: "Official academic record and transcript",
  category: "Academic"
}, {
  id: "embassy-attestation-letter-1",
  title: "Embassy Attestation Letter",
  description: "Official letter for embassy document attestation",
  category: "Travel"
}];
export function Header() {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Active menu state
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState<string[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Helper: get/set cleared notifications from localStorage (for UI state only)
  const CLEARED_KEY = 'certifyr_cleared_notifications';
  function getClearedNotifications() {
    try {
      return JSON.parse(localStorage.getItem(CLEARED_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function setClearedNotifications(ids: string[]) {
    localStorage.setItem(CLEARED_KEY, JSON.stringify(ids));
  }

  // Handle keyboard shortcut for opening search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    setLoadingNotifications(true);
    const fetchNotifications = async () => {
      // 1. Fetch user's organization (any role, not just admin)
      const {
        data: orgs,
        error: orgsError
      } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle();
      if (orgsError || !orgs?.organization_id) {
        setNotifications([]);
        setUnread([]);
        setLoadingNotifications(false);
        return;
      }
      const orgId = orgs.organization_id;

      // 2. Fetch notifications for this org
      const {
        data,
        error
      } = await supabase.from("notifications").select("id, subject, body, created_at, read_by").eq("org_id", orgId).order("created_at", {
        ascending: false
      });
      if (error) {
        setNotifications([]);
        setUnread([]);
        setLoadingNotifications(false);
        return;
      }

      // 3. Filter out cleared notifications and mark read status
      const clearedIds = getClearedNotifications();
      const filtered = (data ?? []).filter(n => !clearedIds.includes(n.id));

      // 4. Mark notifications as read/unread based on read_by array
      const processedNotifications = filtered.map(n => ({
        ...n,
        is_read: Array.isArray(n.read_by) && n.read_by.includes(user.id)
      }));
      setNotifications(processedNotifications);

      // 5. Set unread notifications
      const unreadNotifications = processedNotifications.filter(n => !n.is_read).map(n => n.id);
      setUnread(unreadNotifications);
      setLoadingNotifications(false);
    };
    fetchNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel("header-notifications")
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

  // Mark as read in database
  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      // Update the notification's read_by array in the database
      const {
        data: currentNotification
      } = await supabase.from("notifications").select("read_by").eq("id", notificationId).single();
      const currentReadBy = Array.isArray(currentNotification?.read_by) ? currentNotification.read_by : [];
      const updatedReadBy = currentReadBy.includes(user.id) ? currentReadBy : [...currentReadBy, user.id];
      await supabase.from("notifications").update({
        read_by: updatedReadBy
      }).eq("id", notificationId);

      // Update local state
      setUnread(prev => prev.filter(id => id !== notificationId));
      setNotifications(prev => prev.map(n => n.id === notificationId ? {
        ...n,
        is_read: true
      } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      // Update all notifications' read_by arrays
      const updatePromises = notifications.map(async notification => {
        const currentReadBy = notification.read_by || [];
        const updatedReadBy = currentReadBy.includes(user.id) ? currentReadBy : [...currentReadBy, user.id];
        return supabase.from("notifications").update({
          read_by: updatedReadBy
        }).eq("id", notification.id);
      });
      await Promise.all(updatePromises);

      // Update local state
      setUnread([]);
      setNotifications(prev => prev.map(n => ({
        ...n,
        is_read: true
      })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Clear notifications handler
  const handleClearNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setClearedNotifications([...getClearedNotifications(), ...allIds]);
    setNotifications([]);
    setUnread([]);
  };

  // Mark notification as completed (cleared)
  const markAsCompleted = async (notificationId: string) => {
    if (!user) return;
    try {
      // Add to cleared notifications in localStorage
      setClearedNotifications([...getClearedNotifications(), notificationId]);

      // Also mark as read in database
      const {
        data: currentNotification
      } = await supabase.from("notifications").select("read_by").eq("id", notificationId).single();
      const currentReadBy = currentNotification?.read_by || [];
      const updatedReadBy = currentReadBy.includes(user.id) ? currentReadBy : [...currentReadBy, user.id];
      await supabase.from("notifications").update({
        read_by: updatedReadBy
      }).eq("id", notificationId);

      // Update local state
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      setUnread(unread.filter(id => id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as completed:", error);
    }
  };
  const handleSignOut = async () => {
    await signOut();
  };
  const handleDocumentSelect = (documentId: string) => {
    setOpen(false);
    navigate(`/documents/${documentId}`);
  };
  return <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="hidden md:block w-32"></div>
        <div className="flex items-center flex-1 max-w-2xl">
          <div className="flex items-center space-x-2 w-full">
            <Search className="h-4 w-4 text-muted-foreground" />
            <div className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background cursor-pointer items-center gap-2 text-muted-foreground hover:bg-accent/50 transition-colors" onClick={() => setOpen(true)}>
              <span>Search documents...</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu onOpenChange={(open) => setActiveMenu(open ? 'notifications' : null)}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "relative group rounded-full border-2 transition-colors",
                  activeMenu === 'notifications' 
                    ? "border-primary bg-primary/20" 
                    : "border-border/50 hover:border-border"
                )}
                onClick={markAllAsRead}
              >
                <Bell className="h-5 w-5" />
                {unread.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-primary-600 text-white text-[0.65rem] font-bold shadow z-10" style={{
                minWidth: '1rem',
                height: '1rem',
                fontSize: '0.65rem',
                lineHeight: '1rem'
              }}>
                    {unread.length}
                  </span>}
                <span className="absolute left-1/2 -translate-x-1/2 top-10 z-50 px-3 py-1 rounded bg-background border border-border text-xs font-medium text-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                  Notifications
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[23rem]" style={{
            maxHeight: '402px',
            overflowY: 'auto'
          }}>
              <div className="flex items-center justify-between">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <span className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600 cursor-pointer px-2 py-1 rounded-full border border-border transition-colors hover:bg-accent" title="Clear Notifications" onClick={handleClearNotifications} style={{
                userSelect: 'none'
              }}>
                  <CircleX className="w-4 h-4" />
                  Clear Notifications
                </span>
              </div>
              <DropdownMenuSeparator />
              {loadingNotifications ? (
                <NotificationSkeleton />
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No notifications.
                  </p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={n.id}>
                    <DropdownMenuItem
                      className="cursor-pointer p-3 relative flex items-start"
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium flex items-center">
                          {n.subject}
                          {unread.includes(n.id) && (
                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-600" />
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {n.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dayjs(n.created_at).format("MMM D, YYYY HH:mm")}
                        </p>
                      </div>

                      <div className="relative ml-3 flex-shrink-0">
                        <button
                          className="w-6 h-6 flex items-center justify-center rounded-full border border-border bg-background hover:bg-green-50 hover:text-green-600 transition-colors"
                          title="Completed"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsCompleted(n.id);
                          }}
                          type="button"
                        >
                          <Check className="w-[14px] h-[14px]" />
                        </button>

                        <span
                          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg"
                          style={{ minWidth: "70px" }}
                        >
                          Completed
                        </span>
                      </div>
                    </DropdownMenuItem>

                    {i < notifications.length - 1 && (
                      <div className="border-t border-gray-200 my-2 mx-2" />
                    )}
                  </div>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Feedback Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative group rounded-full border-2 transition-colors",
              activeMenu === 'feedback' 
                ? "border-primary bg-primary/20" 
                : "border-border/50 hover:border-border"
            )}
            onClick={() => {
              setActiveMenu('feedback');
              window.open("https://certifyr.featurebase.app/", "_blank", "noopener,noreferrer");
              // Reset after a short delay
              setTimeout(() => setActiveMenu(null), 300);
            }}
          >
            <Send className="h-5 w-5" />
            <span className="absolute left-1/2 -translate-x-1/2 top-10 z-50 px-3 py-1 rounded bg-background border border-border text-xs font-medium text-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
              Feedback
            </span>
          </Button>

          {/* Help Center Icon */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative group rounded-full border-2 transition-colors",
              activeMenu === 'help' 
                ? "border-primary bg-primary/20" 
                : "border-border/50 hover:border-border"
            )}
            onClick={() => {
              setActiveMenu('help');
              window.open("https://certifyr.featurebase.app/help", "_blank", "noopener,noreferrer");
              // Reset after a short delay
              setTimeout(() => setActiveMenu(null), 300);
            }}
            title="Help Center"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="absolute left-1/2 -translate-x-1/2 top-10 z-50 px-3 py-1 rounded bg-background border border-border text-xs font-medium text-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
              Help
            </span>
          </Button>

          {/* Person Icon for Quick Access */}
          <DropdownMenu onOpenChange={(open) => setActiveMenu(open ? 'quickaccess' : null)}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "relative group rounded-full border-2 transition-colors",
                  activeMenu === 'quickaccess' 
                    ? "border-primary bg-primary/20" 
                    : "border-border/50 hover:border-border"
                )}
              >
                <CircleUserRound className="h-5 w-5" />
                <span className="absolute left-1/2 -translate-x-1/2 top-10 z-50 px-3 py-1 rounded bg-background border border-border text-xs font-medium text-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                  Account
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.email || "User"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/organization" className="flex items-center cursor-pointer">
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Organization</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documents..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Documents">
            {allDocuments.map(document => <CommandItem key={document.id} value={document.title} onSelect={() => handleDocumentSelect(document.id)} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>{document.title}</span>
              </CommandItem>)}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>;
}