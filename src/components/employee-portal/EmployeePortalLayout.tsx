import { ReactNode, useState, useEffect } from "react";
import { useEmployeePortal } from "@/contexts/EmployeePortalContext";
import {
  FileText,
  Settings,
  User,
  Building2,
  Clock,
  FolderOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeePortalLayoutProps {
  children: ReactNode;
  activeTab?: "templates" | "settings" | "pending";
}

export function EmployeePortalLayout({
  children,
  activeTab = "templates",
}: EmployeePortalLayoutProps) {
  const { employee, organization } = useEmployeePortal();
  const [selectedTab, setSelectedTab] = useState(activeTab);
  const navigate = useNavigate();

  useEffect(() => {
    if (employee && employee.status !== "approved") {
      // Clear session/localStorage and redirect
      localStorage.removeItem(`employee_portal_${organization?.id}`);
      navigate("/no-access", { replace: true });
    }
  }, [employee, organization, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <aside className="sticky top-0 left-0 h-screen w-64 z-40 flex flex-col glass-card border-r border-border/50">
        <div className="flex items-center gap-3 p-4 h-16 border-b border-border/30">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              {organization?.name || "Organization"}
            </h1>
            <p className="text-xs text-muted-foreground">Employee Portal</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          <a
            href={`/${organization?.id}/request-portal`}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === "templates" ? "bg-primary-500/10 text-primary-600" : "text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500"}`}
            onClick={() => setSelectedTab("templates")}
          >
            <FileText className="h-5 w-5 mr-2" /> Templates
          </a>
          <a
            href={`/${organization?.id}/request-portal?tab=pending`}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === "pending" ? "bg-primary-500/10 text-primary-600" : "text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500"}`}
            onClick={() => setSelectedTab("pending")}
          >
            <FolderOpen className="h-5 w-5 mr-2" /> My Requests
          </a>
          <a
            href={`/${organization?.id}/request-portal?tab=settings`}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === "settings" ? "bg-primary-500/10 text-primary-600" : "text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500"}`}
            onClick={() => setSelectedTab("settings")}
          >
            <Settings className="h-5 w-5 mr-2" /> Settings
          </a>
        </nav>
        <div className="sticky bottom-0 left-0 w-full bg-background p-4 border-t border-border/30 flex items-center gap-3 z-10">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {employee?.full_name || "Employee"}
            </p>
            <p className="text-xs text-muted-foreground">{employee?.email}</p>
          </div>
        </div>
      </aside>
      <div className="pl-64 flex flex-col min-h-screen">
        <main className="flex-1 px-2">{children}</main>
      </div>
    </div>
  );
}
