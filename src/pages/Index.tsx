
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TemplateCard } from '@/components/dashboard/TemplateCard';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { Button } from '@/components/ui/button';
import { Plus, FileText, ChevronRight } from 'lucide-react';
import { statsData, popularTemplates, recentDocuments } from '@/data/mockData';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Welcome to Certifyr</h1>
            <p className="text-muted-foreground">Create, manage and track your institutional documents</p>
          </div>
          <Button className="gradient-blue md:self-start gap-2">
            <Plus className="h-4 w-4" /> New Document
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatsCard 
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Popular Templates and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Popular Templates</h2>
              <Link to="/templates" className="text-sm text-primary-500 flex items-center hover:text-primary-600">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularTemplates.map((template) => (
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
          <div className="lg:col-span-5">
            <ActivityChart />
          </div>
        </div>

        {/* Recent Documents */}
        <div>
          <RecentDocuments documents={recentDocuments} />
        </div>

        {/* CTA Section */}
        <div className="glass-card p-6 bg-gradient-to-br from-certifyr-blue-light/50 to-certifyr-blue/20">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-medium mb-1">Need a custom template?</h2>
              <p className="text-muted-foreground max-w-lg">
                Use our AI assistant to create a custom document template tailored to your exact requirements.
              </p>
            </div>
            <Button className="gradient-blue gap-2">
              <FileText className="h-4 w-4" /> Create Custom Template
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
