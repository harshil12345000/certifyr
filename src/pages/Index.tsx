import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { popularTemplates } from "@/data/mockData";
import { TemplateCard } from "@/components/dashboard/TemplateCard";
import { Button } from "@/components/ui/button";
import { BarChart, FileText, Users, FolderOpen, AlertTriangle } from "lucide-react";
import { Document } from "@/types/document";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { useUserActivity } from "@/hooks/useUserActivity";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useSubscription } from "@/hooks/useSubscription";
import { uniqueDocuments, uniqueTemplates } from "./Documents";
import { getDocumentConfig } from "@/config/documentConfigs";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { BookmarkCheck } from "lucide-react";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { supabase } from "@/integrations/supabase/client";
const Index = () => {
  const {
    user
  } = useAuth();
  const { subscription } = useSubscription();

  // Document usage for Basic plan
  const [documentUsage, setDocumentUsage] = useState<{ used: number; limit: number; remaining: number; reset_date: string | null } | null>(null);
  const isBasicPlan = subscription?.active_plan === 'basic';
  const isBasicFree = isBasicPlan && (
    subscription?.subscription_status === 'active' || 
    subscription?.subscription_status === null || 
    subscription?.subscription_status === ''
  );

  // Fetch document usage for Basic users
  useEffect(() => {
    const fetchDocumentUsage = async () => {
      if (!isBasicPlan || !user) return;
      try {
        const { data, error } = await supabase.rpc('check_document_limit', { p_user_id: user.id });
        if (!error && data) {
          const d = data as any;
          setDocumentUsage({ 
            used: d.used || 0, 
            limit: d.limit || 25, 
            remaining: d.remaining || 0,
            reset_date: d.reset_date || null
          });
        }
      } catch (err) {
        console.error('Error fetching document usage:', err);
      }
    };
    fetchDocumentUsage();
  }, [isBasicPlan, user]);

  // Determine progress bar color based on usage
  const getProgressColor = () => {
    if (!documentUsage) return 'bg-blue-500';
    if (documentUsage.used >= 25) return 'bg-red-500';
    if (documentUsage.used >= 20) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getProgressBgColor = () => {
    if (!documentUsage) return 'bg-gray-200';
    if (documentUsage.used >= 25) return 'bg-red-100';
    if (documentUsage.used >= 20) return 'bg-orange-100';
    return 'bg-blue-100';
  };

  const getBannerColor = () => {
    if (!documentUsage) return 'bg-blue-50 border-blue-200';
    if (documentUsage.used >= 25) return 'bg-red-50 border-red-200';
    if (documentUsage.used >= 20) return 'bg-orange-50 border-orange-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getTextColor = () => {
    if (!documentUsage) return 'text-blue-800';
    if (documentUsage.used >= 25) return 'text-red-800';
    if (documentUsage.used >= 20) return 'text-orange-800';
    return 'text-blue-800';
  };

  const getSubTextColor = () => {
    if (!documentUsage) return 'text-blue-600';
    if (documentUsage.used >= 25) return 'text-red-600';
    if (documentUsage.used >= 20) return 'text-orange-600';
    return 'text-blue-600';
  };

  const formatResetDate = (dateStr: string | null) => {
    if (!dateStr) return 'next month';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return 'next month';
    }
  };

  // Persist last loaded values to avoid flicker
  const [lastStats, setLastStats] = useState<any>(null);
  const [lastActivityData, setLastActivityData] = useState<any>(null);
  const [lastDocuments, setLastDocuments] = useState<any>(null);

  // Real-time updates are now handled by the hooks themselves
  const {
    stats,
    loading: statsLoading,
    error
  } = useUserStats();
  const {
    activityData,
    loading: activityLoading
  } = useUserActivity();
  const {
    documents,
    loading: documentsLoading
  } = useUserDocuments(5);
  const isLoading = statsLoading || activityLoading || documentsLoading;

  // Update last loaded values when not loading
  useEffect(() => {
    if (!statsLoading && stats) setLastStats(stats);
  }, [stats, statsLoading]);
  useEffect(() => {
    if (!activityLoading && activityData) setLastActivityData(activityData);
  }, [activityData, activityLoading]);
  useEffect(() => {
    if (!documentsLoading && documents) setLastDocuments(documents);
  }, [documents, documentsLoading]);

  // Always show last loaded value, or fallback to default (0/[])
  const statsCards = [{
    label: "Documents Created",
    value: lastStats ? lastStats.documentsCreated : 0,
    icon: FileText
  }, {
    label: "Portal Members",
    value: lastStats ? lastStats.portalMembers : 0,
    icon: Users
  }, {
    label: "Requested Documents",
    value: lastStats ? lastStats.requestedDocuments : 0,
    icon: FolderOpen
  }, {
    label: "Total Verifications",
    value: lastStats ? lastStats.totalVerifications : 0,
    icon: BarChart
  }];
  if (isLoading && !lastStats) {
    return <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your document activity
            </p>
          </div>
        </div>

        {/* Document Usage Banner for Basic Users */}
        {isBasicFree && documentUsage && (
          <div className={`p-4 rounded-lg border ${getBannerColor()}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${getSubTextColor()}`} />
                <div>
                  <p className={`font-medium ${getTextColor()}`}>
                    {documentUsage.used >= 25 ? 'Limit Reached' : 'Basic Plan - Document Limit'}
                  </p>
                  <p className={`text-sm ${getSubTextColor()}`}>
                    {documentUsage.used >= 25 
                      ? `You've used all ${documentUsage.limit} document generations this month`
                      : `You've used ${documentUsage.used} of ${documentUsage.limit} document generations this month`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getSubTextColor()}`}>
                    {documentUsage.used >= 25 ? '0' : documentUsage.remaining}
                  </p>
                  <p className={`text-xs ${getSubTextColor()}`}>
                    {documentUsage.used >= 25 ? 'Limit reached' : 'remaining'}
                  </p>
                </div>
                <Link to="/checkout?plan=pro">
                  <Button size="sm" className="bg-[#1b80ff] hover:bg-[#1566d4]">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
            <div className={`mt-3 w-full rounded-full h-2 ${getProgressBgColor()}`}>
              <div 
                className={`h-2 rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min((documentUsage.used / documentUsage.limit) * 100, 100)}%` }}
              />
            </div>
            <p className={`text-xs ${getSubTextColor()} mt-2`}>
              Your document limit resets on {formatResetDate(documentUsage.reset_date)}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => <StatsCard key={index} title={stat.label} value={stat.value.toString()} icon={stat.icon} />)}
        </div>

        {/* Charts and tables */}
        <div className="grid lg:grid-cols-7 gap-6">
          {/* Activity Chart - 4/7 width */}
          <div className="glass-card p-6 lg:col-span-4">
            <h2 className="text-lg font-medium mb-4">Activity Overview</h2>
            <ActivityChart data={lastActivityData || []} />
          </div>

          {/* Popular Templates - 3/7 width */}
          <div className="glass-card p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Popular Documents</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {popularTemplates.slice(0, 2).map(template => <div key={template.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="rounded-full w-9 h-9 bg-primary-500/10 text-primary-500 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{template.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary" asChild>
                    <Link to={`/templates/${template.id}`}>Use</Link>
                  </Button>
                </div>)}
            </div>
          </div>
        </div>

        {/* Recent Templates */}
      </div>
    </DashboardLayout>;
};
export function BookmarksPage() {
  const {
    bookmarks,
    removeBookmark
  } = useBookmarks();
  // Build lookup: first from uniqueDocuments, then fill gaps via documentConfigs
  const bookmarkedDocuments = bookmarks.map(id => {
    const existing = uniqueDocuments.find(t => t.id === id);
    if (existing) return existing;
    const config = getDocumentConfig(id);
    if (config) {
      const cat = config.category.charAt(0).toUpperCase() + config.category.slice(1);
      return { id, title: config.name, description: config.description || config.name, category: cat };
    }
  }).filter((t): t is { id: string; title: string; description: string; category: string } => t !== null);
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<{
    id: string;
    title: string;
  } | null>(null);
  return <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2">
          <span>Bookmarks</span>
        </h1>
        {bookmarkedDocuments.length === 0 ? <div className="py-12 text-center text-muted-foreground">No bookmarks yet. Click the bookmark icon on any document to add it here.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {bookmarkedDocuments.map(template => <div key={template.id} className="relative group">
                <TemplateCard {...template} isAdmin={true} forceBookmarked={true} onBookmarkClick={e => {
            e.preventDefault();
            setPendingRemove({
              id: template.id,
              title: template.title
            });
            setDialogOpen(template.id);
          }} />
                {/* Modal for confirming removal */}
                <AlertDialog open={dialogOpen === template.id} onOpenChange={open => {
            if (!open) setDialogOpen(null);
          }}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Confirm to Remove {template.title} from Bookmarks
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this template from your
                        bookmarks?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDialogOpen(null)}>
                        No
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                  if (pendingRemove) removeBookmark(pendingRemove.id);
                  setDialogOpen(null);
                  setPendingRemove(null);
                }}>
                        Yes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>)}
          </div>}
      </div>
    </DashboardLayout>;
}
export default Index;
declare global {
  interface Window {
    Featurebase: (...args: any[]) => void;
  }
}
window.Featurebase("boot", {
  appId: "684fd05695489274401afcbc"
});