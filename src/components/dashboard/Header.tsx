import { useEffect, useState } from "react";
import { Bell, Search, Settings, User, LogOut, CircleHelp, CircleX, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  is_read?: boolean;
}

// Import templates data for search functionality
const allTemplates = [
  {
    id: "bonafide-1",
    title: "Bonafide Certificate",
    description: "Student verification certificate",
    category: "Academic",
  },
  {
    id: "character-1",
    title: "Character Certificate",
    description: "Character verification document",
    category: "Academic",
  },
  {
    id: "experience-1",
    title: "Experience Certificate",
    description: "Work experience verification",
    category: "Employment",
  },
  {
    id: "embassy-attestation-1",
    title: "Embassy Attestation",
    description: "Letter for document attestation at embassies",
    category: "Travel",
  },
  {
    id: "completion-certificate-1",
    title: "Completion Certificate",
    description: "Certificate for courses, training programs, internships",
    category: "Educational",
  },
  {
    id: "transfer-certificate-1",
    title: "Transfer Certificate",
    description: "Certificate for students moving between institutions",
    category: "Educational",
  },
  {
    id: "noc-visa-1",
    title: "NOC for Visa Application",
    description: "No Objection Certificate for visa applications",
    category: "Travel",
  },
  {
    id: "income-certificate-1",
    title: "Income Certificate",
    description: "Certificate stating employee income details",
    category: "Employment",
  },
  {
    id: "maternity-leave-1",
    title: "Maternity Leave Application",
    description: "Application for maternity leave benefits",
    category: "Employment",
  },
  {
    id: "bank-verification-1",
    title: "Bank Account Verification",
    description: "Letter confirming account details for banks",
    category: "Financial",
  },
  {
    id: "offer-letter-1",
    title: "Offer Letter",
    description: "Formal job offer letter to candidates",
    category: "Employment",
  },
  {
    id: "address-proof-1",
    title: "Address Proof Certificate",
    description: "Certificate verifying residential address",
    category: "Legal",
  },
  {
    id: "articles-incorporation-1",
    title: "Articles of Incorporation",
    description: "Certificate of Incorporation for new corporations",
    category: "Corporate",
  },
  {
    id: "corporate-bylaws-1",
    title: "Corporate Bylaws",
    description: "Corporate governance and operating procedures",
    category: "Corporate",
  },
  {
    id: "founders-agreement-1",
    title: "Founders' Agreement",
    description: "Agreement between company founders",
    category: "Corporate",
  },
  {
    id: "stock-purchase-agreement-1",
    title: "Stock Purchase Agreement",
    description: "Agreement for purchasing company shares",
    category: "Corporate",
  },
  {
    id: "employment-agreement-1",
    title: "Employment Agreement",
    description: "Comprehensive employment contract",
    category: "Corporate",
  },
  {
    id: "nda-1",
    title: "Non-Disclosure Agreement (NDA)",
    description: "Confidentiality agreement between parties",
    category: "Corporate",
  },
  {
    id: "academic-transcript-1",
    title: "Academic Transcript / Marksheet",
    description: "Official academic record and transcript",
    category: "Academic",
  },
  {
    id: "embassy-attestation-letter-1",
    title: "Embassy Attestation Letter",
    description: "Official letter for embassy document attestation",
    category: "Travel",
  },
];

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState<string[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Helper: get/set read notifications from localStorage
  const READ_KEY = 'certifyr_read_notifications';
  function getReadNotifications() {
    try {
      return JSON.parse(localStorage.getItem(READ_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function setReadNotifications(ids) {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  }

  // Helper: get/set cleared notifications from localStorage
  const CLEARED_KEY = 'certifyr_cleared_notifications';
  function getClearedNotifications() {
    try {
      return JSON.parse(localStorage.getItem(CLEARED_KEY) || '[]');
    } catch {
      return [];
    }
  }
  function setClearedNotifications(ids) {
    localStorage.setItem(CLEARED_KEY, JSON.stringify(ids));
  }

  // Handle keyboard shortcut for opening search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
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
      // 1. Fetch admin's organization
      const { data: orgs, error: orgsError } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      if (orgsError || !orgs?.organization_id) {
        setNotifications([]);
        setUnread([]);
        setLoadingNotifications(false);
        return;
      }
      const orgId = orgs.organization_id;
      // 2. Fetch notifications for this org
      const { data, error } = await supabase
        .from("notifications")
        .select("id, subject, body, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (error) {
        setNotifications([]);
        setUnread([]);
        setLoadingNotifications(false);
        return;
      }
      // Filter out cleared notifications
      const clearedIds = getClearedNotifications();
      const filtered = (data ?? []).filter((n) => !clearedIds.includes(n.id));
      setNotifications(filtered);
      // Only mark as unread if not in localStorage
      const readIds = getReadNotifications();
      setUnread(filtered.filter((n) => !readIds.includes(n.id)).map((n) => n.id));
      setLoadingNotifications(false);
    };
    fetchNotifications();
  }, [user]);

  // Recalculate unread whenever notifications change
  useEffect(() => {
    const readIds = getReadNotifications();
    setUnread(notifications.filter((n) => !readIds.includes(n.id)).map((n) => n.id));
  }, [notifications]);

  // Mark as read (optional, if you have a read-tracking table)
  const markAsRead = async (notificationId: string) => {
    setUnread((prev) => prev.filter((id) => id !== notificationId));
    // Add to localStorage
    const readIds = getReadNotifications();
    if (!readIds.includes(notificationId)) {
      setReadNotifications([...readIds, notificationId]);
    }
    // Optionally, update a read-tracking table here
  };

  // Mark all notifications as read when the bell is clicked
  const markAllAsRead = () => {
    // Mark all current notification IDs as read in localStorage
    const allIds = notifications.map((n) => n.id);
    setReadNotifications(allIds);
    setUnread([]);
    // Optionally, update a read-tracking table here
    console.log('All notifications marked as read');
  };

  // Clear notifications handler
  const handleClearNotifications = () => {
    const allIds = notifications.map((n) => n.id);
    setClearedNotifications([...getClearedNotifications(), ...allIds]);
    setNotifications([]);
    setUnread([]);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleTemplateSelect = (templateId: string) => {
    setOpen(false);
    navigate(`/templates/${templateId}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="hidden md:block w-32"></div>
        <div className="flex items-center flex-1 max-w-2xl">
          <div className="flex items-center space-x-2 w-full">
            <Search className="h-4 w-4 text-muted-foreground" />
            <div
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background cursor-pointer items-center gap-2 text-muted-foreground hover:bg-accent/50 transition-colors"
              onClick={() => setOpen(true)}
            >
              <span>Search documents...</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={markAllAsRead} // Mark all as read when bell or badge is clicked
                style={{ position: 'relative' }}
              >
                <Bell className="h-5 w-5" />
                {unread.length > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-primary-600 text-white text-[0.65rem] font-bold shadow"
                    style={{ minWidth: '1rem', height: '1rem', fontSize: '0.65rem', lineHeight: '1rem' }}
                  >
                    {unread.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[23rem]" style={{ maxHeight: '402px', overflowY: 'auto' }}>
              <div className="flex items-center justify-between">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <span
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600 cursor-pointer px-2 py-1 rounded-full border border-border transition-colors hover:bg-accent"
                  title="Clear Notifications"
                  onClick={handleClearNotifications}
                  style={{ userSelect: 'none' }}
                >
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
                    No notifications yet.
                  </p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <>
                    <DropdownMenuItem
                      key={n.id}
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
                          onClick={e => {
                            e.stopPropagation();
                            // Remove this notification from panel and persist in cleared list
                            setClearedNotifications([...getClearedNotifications(), n.id]);
                            setNotifications(notifications.filter(notif => notif.id !== n.id));
                            setUnread(unread.filter(id => id !== n.id));
                          }}
                          type="button"
                          tabIndex={0}
                        >
                          <Check className="w-[14px] h-[14px]" />
                        </button>
                        <span
                          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg"
                          style={{ minWidth: '70px' }}
                        >
                          Completed
                        </span>
                      </div>
                    </DropdownMenuItem>
                    {i < notifications.length - 1 && (
                      <div className="border-t border-gray-200 my-2 mx-2" />
                    )}
                  </>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Support Center Icon */}
          <div className="relative group flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="ml-1"
              aria-label="Support Center"
              onClick={() =>
                window.open(
                  "https://certifyr.featurebase.app/",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <CircleHelp className="h-5 w-5 text-black group-hover:text-black transition-colors" />
            </Button>
            <span className="absolute left-1/2 -translate-x-1/2 top-10 z-50 px-3 py-1 rounded bg-background border border-border text-xs font-medium text-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
              Feedback & Help Center
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {user?.email ? getInitials(user.email) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm">{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/settings"
                  className="flex items-center cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/settings"
                  className="flex items-center cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documents..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Templates">
            {allTemplates.map((template) => (
              <CommandItem
                key={template.id}
                value={`${template.title} ${template.description} ${template.category}`}
                onSelect={() => handleTemplateSelect(template.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary-500/10 flex items-center justify-center">
                    <Search className="h-4 w-4 text-primary-500" />
                  </div>
                  <div>
                    <div className="font-medium">{template.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.description}
                    </div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                navigate("/templates");
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                  <Search className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium">Browse All Templates</div>
                  <div className="text-sm text-muted-foreground">
                    View the complete template library
                  </div>
                </div>
              </div>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                navigate("/dashboard");
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center">
                  <Search className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <div className="font-medium">Go to Dashboard</div>
                  <div className="text-sm text-muted-foreground">
                    View your documents and activity
                  </div>
                </div>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
