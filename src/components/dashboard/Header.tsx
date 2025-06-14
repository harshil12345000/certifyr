
import { useEffect, useState } from 'react';
import { Bell, Search, Settings, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import dayjs from "dayjs";

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  is_global: boolean;
  created_at: string;
}

export function Header() {
  const { user, signOut } = useAuth();

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unread, setUnread] = useState<string[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="hidden md:block w-64"></div>
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-2 md:w-72 px-0 mx- mx-[-210px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search templates, documents..." className="h-9 md:w-64 bg-transparent focus-visible:bg-white mx-[23px]" />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unread.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-600" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loadingAnnouncements ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : announcements.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                announcements.map(a => (
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
                ))
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
      </div>
    </header>
  );
}
