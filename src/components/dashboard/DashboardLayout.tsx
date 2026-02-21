import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TrialBanner } from "./TrialBanner";
import { AIFloatingWidget } from "@/components/ai-assistant/AIFloatingWidget";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed-state";

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  const showAIWidget = user && !loading && subscription?.active_plan?.toLowerCase() === 'ultra';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={cn(isCollapsed ? "md:pl-20" : "md:pl-64", "flex flex-col min-h-screen transition-[padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]")}>
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <TrialBanner />
          {children}
        </main>
      </div>
      {showAIWidget && <AIFloatingWidget />}
    </div>
  );
}
