import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TrialBanner } from "./TrialBanner";
import { SetupGuideWidget } from "./SetupGuideWidget";

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={cn(isCollapsed ? "md:pl-20" : "md:pl-64", "flex flex-col min-h-screen transition-[padding] duration-300")}>
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <TrialBanner />
          {children}
        </main>
        <SetupGuideWidget />
      </div>
    </div>
  );
}
