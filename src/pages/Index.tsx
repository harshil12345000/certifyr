import { useState, useEffect, useContext } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { popularTemplates } from "@/data/mockData";
import { TemplateCard } from "@/components/dashboard/TemplateCard";
import { Button } from "@/components/ui/button";
import { BarChart, FileText, FileSignature, FileClock } from "lucide-react";
import { Document } from "@/types/document";
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { useUserActivity } from '@/hooks/useUserActivity';
import { useUserDocuments } from '@/hooks/useUserDocuments';
const Index = () => {
  const { user } = useAuth();
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Periodically refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshIndex((i) => i + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const {
    stats,
    loading: statsLoading,
    error
  } = useUserStats(refreshIndex);
  const {
    activityData,
    loading: activityLoading
  } = useUserActivity(refreshIndex);
  const {
    documents,
    loading: documentsLoading
  } = useUserDocuments(5, refreshIndex);

  console.log('[Dashboard] stats:', stats);

  const statsCards = [
    {
      label: 'Documents Created',
      value: stats.documentsCreated,
      icon: FileText,
      loading: statsLoading,
    },
    {
      label: 'Documents Signed',
      value: stats.documentsSigned,
      icon: FileSignature,
      loading: statsLoading,
    },
    {
      label: 'Pending Documents',
      value: stats.pendingDocuments,
      icon: FileClock,
      loading: statsLoading,
    },
    {
      label: 'Total Verifications',
      value: stats.totalVerifications,
      icon: BarChart,
      loading: statsLoading,
    },
  ];
  return <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your document activity</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <StatsCard 
              key={index} 
              title={stat.label} 
              value={stat.loading ? 'Loading...' : stat.value.toString()} 
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Charts and tables */}
        <div className="grid lg:grid-cols-7 gap-6">
          {/* Activity Chart - 4/7 width */}
          <div className="glass-card p-6 lg:col-span-4">
            <h2 className="text-lg font-medium mb-4">Activity Overview</h2>
            {activityLoading ? <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Loading activity data...</p>
              </div> : <ActivityChart data={activityData} />}
          </div>

          {/* Popular Templates - 3/7 width */}
          <div className="glass-card p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Popular Templates</h2>
              <Button variant="ghost" size="sm" className="text-primary">View All</Button>
            </div>
            <div className="space-y-4">
              {popularTemplates.slice(0, 3).map(template => <div key={template.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="rounded-full w-9 h-9 bg-primary-500/10 text-primary-500 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{template.title}</h3>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">Use</Button>
                </div>)}
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <RecentDocuments documents={documents} loading={documentsLoading} />

        {/* Recent Templates */}
        
      </div>
    </DashboardLayout>;
};
export default Index;