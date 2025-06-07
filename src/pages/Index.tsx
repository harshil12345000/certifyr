
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { popularTemplates } from "@/data/mockData";
import { TemplateCard } from "@/components/dashboard/TemplateCard";
import { SavedDrafts } from "@/components/dashboard/SavedDrafts";
import { Button } from "@/components/ui/button";
import { BarChart, FileText, FileSignature, FileClock } from "lucide-react";
import { Document } from "@/types/document";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockDocuments = [{
  id: "doc-1",
  name: "Bonafide Certificate - John Smith",
  type: "Certificate",
  status: "Signed" as const,
  date: "2023-06-01",
  recipient: "John Smith"
}, {
  id: "doc-2",
  name: "Leave Application - HR Department",
  type: "Application",
  status: "Sent" as const,
  date: "2023-05-28",
  recipient: "HR Manager"
}, {
  id: "doc-3",
  name: "Income Certificate - David Miller",
  type: "Certificate",
  status: "Created" as const,
  date: "2023-05-25",
  recipient: null
}] as Document[];

const Index = () => {
  const { profile } = useUserProfile();
  const { branding } = useOrganizationBranding();
  const [stats] = useState([{
    title: "Documents Created",
    value: "128",
    change: "+12.3%",
    trend: "up",
    icon: FileText
  }, {
    title: "Documents Signed",
    value: "89",
    change: "+18.7%",
    trend: "up",
    icon: FileSignature
  }, {
    title: "Pending Documents",
    value: "12",
    change: "-4.3%",
    trend: "down",
    icon: FileClock
  }, {
    title: "Total Templates",
    value: "23",
    change: "+3.2%",
    trend: "up",
    icon: BarChart
  }]);

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return 'User';
  };

  const getAvatarInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with User Profile */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              {profile?.profile_picture && (
                <AvatarImage src={profile.profile_picture} alt={getUserDisplayName()} />
              )}
              <AvatarFallback className="text-lg">
                {getAvatarInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                Welcome back, {getUserDisplayName()}!
              </h1>
              <p className="text-muted-foreground">
                {branding?.organization_name || 'Your Organization'} • {profile?.job_title || 'Administrator'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatsCard 
              key={index} 
              title={stat.title} 
              value={stat.value} 
              trend={{
                value: stat.change,
                positive: stat.trend === 'up'
              }} 
              icon={stat.icon} 
            />
          ))}
        </div>

        {/* Saved Drafts */}
        <SavedDrafts />

        {/* Charts and tables */}
        <div className="grid lg:grid-cols-7 gap-6">
          {/* Activity Chart - 4/7 width */}
          <div className="glass-card p-6 lg:col-span-4">
            <h2 className="text-lg font-medium mb-4">Activity Overview</h2>
            <ActivityChart />
          </div>

          {/* Popular Templates - 3/7 width */}
          <div className="glass-card p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Popular Templates</h2>
              <Button variant="ghost" size="sm" className="text-primary">View All</Button>
            </div>
            <div className="space-y-4">
              {popularTemplates.slice(0, 3).map(template => (
                <div key={template.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="rounded-full w-9 h-9 bg-primary-500/10 text-primary-500 flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{template.title}</h3>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">Use</Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <RecentDocuments documents={mockDocuments} />

        {/* Recent Templates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recently Added Templates</h2>
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {popularTemplates.slice(0, 4).map(template => (
              <TemplateCard 
                key={template.id} 
                id={template.id} 
                title={template.title} 
                description={template.description} 
                category={template.category} 
                usageCount={template.usageCount} 
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
