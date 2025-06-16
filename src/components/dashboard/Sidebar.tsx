import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarLogo } from './SidebarLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
  { name: "Templates", path: "/templates", icon: <FileText className="h-5 w-5" /> },
  { name: "Admin", path: "/admin", icon: <Users className="h-5 w-5" /> },
  { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> }
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { logoUrl, organizationDetails } = useBranding();
  
  // Get name and avatar from user metadata if available
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';
  const email = user?.email || '';
  const userAvatarUrl = user?.user_metadata?.avatar_url || '';
  
  // Use organization logo as profile picture, fallback to user avatar
  const profileImageUrl = logoUrl || userAvatarUrl || '';
  
  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (email ? email.slice(0, 2).toUpperCase() : 'U');

  // Use organization name if available, otherwise use user name
  const displayName = organizationDetails?.name || name;

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col glass-card border-r border-border/50",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-all duration-300 ease-in-out"
        )}
      >
        <div className="flex items-center justify-between p-4 h-16">
          <SidebarLogo collapsed={isCollapsed} />
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronRight className={cn("h-5 w-5 transition-all", isCollapsed ? "rotate-180" : "")} />
          </Button>
        </div>
        
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                  location.pathname === item.path 
                    ? "bg-primary-500/10 text-primary-600" 
                    : "text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className={cn(
          "flex items-center p-4 border-t border-border/30",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <Avatar className="h-8 w-8">
            {logoUrl ? (
              <AvatarImage 
                src={logoUrl} 
                alt={displayName}
                onError={(e) => {
                  // If logo fails, fallback to user avatar or hide
                  const target = e.target as HTMLImageElement;
                  if (userAvatarUrl && !target.src.endsWith(userAvatarUrl)) {
                    target.src = userAvatarUrl;
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            ) : userAvatarUrl ? (
              <AvatarImage 
                src={userAvatarUrl} 
                alt={displayName}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          )}
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
