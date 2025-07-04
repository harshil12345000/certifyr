import { useEffect, useState } from 'react';
import { Bell, Search, Settings, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import dayjs from "dayjs";
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  is_global: boolean;
  created_at: string;
}

// Import templates data for search functionality
const allTemplates = [
  { id: "bonafide-1", title: "Bonafide Certificate", description: "Student verification certificate", category: "Academic" },
  { id: "character-1", title: "Character Certificate", description: "Character verification document", category: "Academic" },
  { id: "experience-1", title: "Experience Certificate", description: "Work experience verification", category: "Employment" },
  { id: "embassy-attestation-1", title: "Embassy Attestation", description: "Letter for document attestation at embassies", category: "Travel" },
  { id: "completion-certificate-1", title: "Completion Certificate", description: "Certificate for courses, training programs, internships", category: "Educational" },
  { id: "transfer-certificate-1", title: "Transfer Certificate", description: "Certificate for students moving between institutions", category: "Educational" },
  { id: "noc-visa-1", title: "NOC for Visa Application", description: "No Objection Certificate for visa applications", category: "Travel" },
  { id: "income-certificate-1", title: "Income Certificate", description: "Certificate stating employee income details", category: "Employment" },
  { id: "maternity-leave-1", title: "Maternity Leave Application", description: "Application for maternity leave benefits", category: "Employment" },
  { id: "bank-verification-1", title: "Bank Account Verification", description: "Letter confirming account details for banks", category: "Financial" },
  { id: "offer-letter-1", title: "Offer Letter", description: "Formal job offer letter to candidates", category: "Employment" },
  { id: "address-proof-1", title: "Address Proof Certificate", description: "Certificate verifying residential address", category: "Legal" },
  { id: "articles-incorporation-1", title: "Articles of Incorporation", description: "Certificate of Incorporation for new corporations", category: "Corporate" },
  { id: "corporate-bylaws-1", title: "Corporate Bylaws", description: "Corporate governance and operating procedures", category: "Corporate" },
  { id: "founders-agreement-1", title: "Founders' Agreement", description: "Agreement between company founders", category: "Corporate" },
  { id: "stock-purchase-agreement-1", title: "Stock Purchase Agreement", description: "Agreement for purchasing company shares", category: "Corporate" },
  { id: "employment-agreement-1", title: "Employment Agreement", description: "Comprehensive employment contract", category: "Corporate" },
  { id: "nda-1", title: "Non-Disclosure Agreement (NDA)", description: "Confidentiality agreement between parties", category: "Corporate" },
  { id: "academic-transcript-1", title: "Academic Transcript / Marksheet", description: "Official academic record and transcript", category: "Academic" },
  { id: "embassy-attestation-letter-1", title: "Embassy Attestation Letter", description: "Official letter for embassy document attestation", category: "Travel" }
];

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unread, setUnread] = useState<string[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<string[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

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

  // Fetch active announcements + which are unread
  useEffect(() => {
    if (!user) return;
    setLoadingAnnouncements(true);
    const fetchAnnouncements = async () => {
      // Get all relevant, active announcements for the user's organization
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, is_active, is_global, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        setAnnouncements([]);
        setUnread([]);
        setLoadingAnnouncements(false);
        return;
      }
      setAnnouncements(data ?? []);

      // Now, get which are read by user
      if (data && data.length > 0) {
        const ids = data.map(a => a.id);
        const { data: reads } = await supabase
          .from("user_announcement_reads")
          .select("announcement_id")
          .in("announcement_id", ids)
          .eq("user_id", user.id);
        const readIds = (reads ?? []).map(r => r.announcement_id);
        setUnread(data.filter(a => !readIds.includes(a.id)).map(a => a.id));
      } else {
        setUnread([]);
      }
      setLoadingAnnouncements(false);
    };
    fetchAnnouncements();
  }, [user]);

  // Fetch notifications for org admin
  useEffect(() => {
    if (!user || !user.organization_id) return;
    setLoadingNotifications(true);
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('org_id', user.organization_id)
        .order('created_at', { ascending: false });
      if (error) {
        setNotifications([]);
        setUnreadNotifications([]);
        setLoadingNotifications(false);
        return;
      }
      setNotifications(data ?? []);
      // Unread: not in read_by
      setUnreadNotifications((data ?? []).filter(n => !(n.read_by || []).includes(user.id)).map(n => n.id));
      setLoadingNotifications(false);
    };
    fetchNotifications();
  }, [user]);

  // Mark as read
  const markAsRead = async (announcementId: string) => {
    if (!user || !announcementId) return;
    // Optimistically remove from unread
    setUnread(prev => prev.filter(id => id !== announcementId));
    await supabase.from("user_announcement_reads").upsert({
      user_id: user.id,
      announcement_id: announcementId,
      read_at: new Date().toISOString(),
    });
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user || !notificationId) return;
    setUnreadNotifications(prev => prev.filter(id => id !== notificationId));
    // Add user.id to read_by array
    await supabase.rpc('mark_notification_read', { notification_id: notificationId, user_id: user.id });
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {(unread.length > 0 || unreadNotifications.length > 0) && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-600" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loadingAnnouncements || loadingNotifications ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : (
                <>
                  {notifications.length === 0 && announcements.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                    </div>
                  ) : (
                    <>
                      {notifications.map(n => (
                        <DropdownMenuItem
                          key={n.id}
                          className="cursor-pointer p-3 relative"
                          onClick={() => markNotificationAsRead(n.id)}
                        >
                          <div>
                            <p className="font-medium flex items-center">
                              {n.subject}
                              {unreadNotifications.includes(n.id) && (
                                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-600" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{n.body}</p>
                            <p className="text-xs text-muted-foreground mt-1">{dayjs(n.created_at).format("MMM D, YYYY HH:mm")}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {announcements.map(a => (
                        <DropdownMenuItem
                          key={a.id}
                          className="cursor-pointer p-3 relative"
                          onClick={() => markAsRead(a.id)}
                        >
                          <div>
                            <p className="font-medium flex items-center">
                              {a.title}
                              {unread.includes(a.id) && (
                                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-600" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{a.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">{dayjs(a.created_at).format("MMM D, YYYY HH:mm")}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm">{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center cursor-pointer">
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
                    <div className="text-sm text-muted-foreground">{template.description}</div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { setOpen(false); navigate('/templates'); }} className="cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                  <Search className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium">Browse All Templates</div>
                  <div className="text-sm text-muted-foreground">View the complete template library</div>
                </div>
              </div>
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); navigate('/dashboard'); }} className="cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center">
                  <Search className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <div className="font-medium">Go to Dashboard</div>
                  <div className="text-sm text-muted-foreground">View your documents and activity</div>
                </div>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

