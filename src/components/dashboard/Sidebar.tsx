import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Building2,
  Settings,
  Menu,
  X,
  PanelLeft,
  PanelRight,
  DoorOpen,
  Bookmark,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarLogo } from "./SidebarLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import React from "react";

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  requiredFeature?: 'requestPortal' | 'aiAssistant';
  planBadge?: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
  {
    name: "Documents",
    path: "/documents",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    name: "History",
    path: "/history",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    name: "Request Portal",
    path: "/request-portal",
    icon: <DoorOpen className="h-5 w-5" />,
    requiredFeature: 'requestPortal',
    planBadge: 'Pro',
  },
  {
    name: "AI Assistant",
    path: "/ai-assistant",
    icon: <Sparkles className="h-5 w-5" />,
    requiredFeature: 'aiAssistant',
    planBadge: 'Ultra',
  },
  { name: "Organization", path: "/organization", icon: <Building2 className="h-5 w-5" /> },
  {
    name: "Account Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

// Memoized SidebarProfile component
const SidebarProfile = React.memo(function SidebarProfile({
  logoUrl,
  userAvatarUrl,
  displayName,
  email,
  initials,
  isCollapsed,
  toast,
}: {
  logoUrl: string | null;
  userAvatarUrl: string | null;
  displayName: string;
  email: string;
  initials: string;
  isCollapsed: boolean;
  toast: any;
}) {
  return (
    <div
      className={cn(
        "flex items-center p-4 border-t border-border/30",
        isCollapsed ? "justify-center" : "justify-start",
      )}
    >
      <Avatar className="h-8 w-8">
        {logoUrl ? (
          <AvatarImage
            src={logoUrl}
            alt={displayName}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error(
                "[Sidebar] Logo image failed to load:",
                logoUrl,
              );
              toast({
                title: "Logo failed to load",
                description:
                  "Your organization logo could not be loaded. Please check your network or storage settings.",
                variant: "destructive",
              });
              if (userAvatarUrl && !target.src.endsWith(userAvatarUrl)) {
                target.src = userAvatarUrl;
              } else {
                target.style.display = "none";
              }
            }}
          />
        ) : userAvatarUrl ? (
          <AvatarImage
            src={userAvatarUrl}
            alt={displayName}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              console.error(
                "[Sidebar] User avatar image failed to load:",
                userAvatarUrl,
              );
              toast({
                title: "Avatar failed to load",
                description: "Your user avatar could not be loaded.",
                variant: "destructive",
              });
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
  );
});

export function Sidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (v: boolean) => void }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { logoUrl, organizationDetails } = useBranding();
  const { features, loading: planLoading } = usePlanFeatures();

  // Aggressive stability: persist feature visibility in sessionStorage so
  // remounts (route changes) never start from a blank/hidden state.
  const FEATURE_CACHE_KEY = 'sidebar-feature-visibility';

  const [featureVisibility, setFeatureVisibility] = useState<{
    requestPortal: boolean;
    aiAssistant: boolean;
  }>(() => {
    try {
      const cached = sessionStorage.getItem(FEATURE_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
    return { requestPortal: false, aiAssistant: false };
  });

  // Only update when plan data actually resolves with real values
  React.useEffect(() => {
    if (!planLoading && features) {
      const next = {
        requestPortal: features.requestPortal ?? false,
        aiAssistant: features.aiAssistant ?? false,
      };
      // Only update if values actually changed to avoid unnecessary re-renders
      setFeatureVisibility(prev => {
        if (prev.requestPortal === next.requestPortal && prev.aiAssistant === next.aiAssistant) {
          return prev;
        }
        sessionStorage.setItem(FEATURE_CACHE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [planLoading, features]);

  // Get name and avatar from user metadata if available
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "User";
  const email = user?.email || "";
  const userAvatarUrl = user?.user_metadata?.avatar_url || "";

  // Use organization logo as profile picture, fallback to user avatar
  const profileImageUrl = logoUrl || userAvatarUrl || "";

  const initials = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email
      ? email.slice(0, 2).toUpperCase()
      : "U";

  // Use organization name if available, otherwise use user name
  const displayName = organizationDetails?.name || name;

  // TODO: Replace with real admin check
  const isAdmin = true;

  // Check if nav item should be shown based on plan features
  // For basic users, completely hide gated features (no locked badge)
  const shouldShowNavItem = (item: NavItem): boolean => {
    if (!item.requiredFeature) return true;
    return featureVisibility[item.requiredFeature];
  };

  // Filter navItems to only show accessible items
  const filteredNavItems = navItems.filter(item => shouldShowNavItem(item));

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col glass-card border-r border-border/50",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        )}
      >
        {/* Toggle button - above logo when collapsed */}
        {isCollapsed && (
          <div className="flex justify-center pt-4 pb-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className={cn(
          "flex items-center p-4 h-16",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <SidebarLogo collapsed={isCollapsed} />
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className={cn("flex-1 overflow-y-auto", isCollapsed ? "py-3" : "py-6")}>
          <nav className="px-2 space-y-1">
            {filteredNavItems.map((item) => (
              <div key={item.path} className="contents">
                <Link
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
                  {!isCollapsed && (
                    <span className="ml-3 flex-1">{item.name}</span>
                  )}
                </Link>
                {/* Insert Bookmarks tab right after Documents */}
                {isAdmin && item.name === "Documents" && (
                  <Link
                    to="/bookmarks"
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                      location.pathname === "/bookmarks"
                        ? "bg-primary-500/10 text-primary-600"
                        : "text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500",
                      isCollapsed ? "justify-center" : "justify-start",
                    )}
                  >
                    <span className="flex-shrink-0">
                      <Bookmark className="h-5 w-5" />
                    </span>
                    {!isCollapsed && <span className="ml-3">Bookmarks</span>}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Profile Section */}
        <SidebarProfile
          logoUrl={logoUrl}
          userAvatarUrl={userAvatarUrl}
          displayName={displayName}
          email={email}
          initials={initials}
          isCollapsed={isCollapsed}
          toast={toast}
        />
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
