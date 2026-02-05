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
import { useNavigate, Link } from "react-router-dom";

interface EmployeePortalLayoutProps {
  children: ReactNode;
  activeTab?: "templates" | "documents" | "settings" | "pending";
}

export function EmployeePortalLayout({
  children,
  activeTab = "templates",
}: EmployeePortalLayoutProps) {
  const { employee, organization, portalSlug } = useEmployeePortal();
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
    <div className="min-h-screen bg-background flex">
      <aside className="sticky top-0 left-0 h-screen w-64 z-40 flex flex-col glass-card border-r border-border/50">
        <div className="flex items-center gap-3 p-4 h-16 border-b border-border/30">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-muted">
            {organization?.id ? (
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/branding-assets/${organization.id}/logo`}
                alt={organization?.name || "Organization"}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></div>`;
                }}
              />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              {organization?.name || "Organization"}
            </h1>
            <p className="text-xs text-muted-foreground">Employee Portal</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          <Link
            to={`/portal/${portalSlug}`}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === "templates" || selectedTab === "documents" ? "bg-primary-500/10 text-primary-600" : "text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500"}`}
            onClick={() => setSelectedTab("templates")}
          >
            <FileText className="h-5 w-5 mr-2" /> Documents
          </Link>
          <Link
            to={`/portal/${portalSlug}?tab=pending`}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === "pending" ? "bg-primary-500/10 text-primary-600" : "text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500"}`}
            onClick={() => setSelectedTab("pending")}
          >
            <FolderOpen className="h-5 w-5 mr-2" /> My Requests
          </Link>
          <Link
            to={`/portal/${portalSlug}?tab=settings`}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedTab === "settings" ? "bg-primary-500/10 text-primary-600" : "text-muted-foreground hover:bg-primary-500/5 hover:text-primary-500"}`}
            onClick={() => setSelectedTab("settings")}
          >
            <Settings className="h-5 w-5 mr-2" /> Settings
          </Link>
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

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
