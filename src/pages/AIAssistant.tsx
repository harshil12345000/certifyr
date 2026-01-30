import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Globe, Sparkles, FileText, Scale, MessageSquare, Zap } from 'lucide-react';
import { CountryContextSelector } from '@/components/ai-assistant/CountryContextSelector';
import { useAIContext } from '@/hooks/useAIContext';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import { Skeleton } from '@/components/ui/skeleton';

const upcomingFeatures = [
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: 'Natural Language Document Generation',
    description: 'Describe what you need and let AI create the document for you.',
  },
  {
    icon: <Scale className="h-5 w-5" />,
    title: 'Country-Specific Legal Compliance',
    description: 'AI follows the laws and standards of your selected country.',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Smart Template Suggestions',
    description: 'Get intelligent recommendations based on your needs.',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Custom Document Requests',
    description: 'Request any document type and AI will help create it.',
  },
];

function AIAssistantContent() {
  const { contextCountry, loading: contextLoading, updateContextCountry } = useAIContext();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold">AI Assistant</h1>
            <Badge className="bg-purple-600 text-white">Ultra</Badge>
          </div>
          <p className="text-muted-foreground">
            Your intelligent document generation partner
          </p>
        </div>
      </div>

      {/* Country Context Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Document Context</CardTitle>
          </div>
          <CardDescription>
            Select the country whose laws and document standards the AI should follow.
            This helps generate documents that comply with regional requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contextLoading ? (
            <Skeleton className="h-10 w-[280px]" />
          ) : (
            <CountryContextSelector
              selectedCountry={contextCountry}
              onCountryChange={updateContextCountry}
            />
          )}
          <p className="text-sm text-muted-foreground mt-3">
            {contextCountry === 'global' 
              ? 'AI will use general international document standards.'
              : `AI will follow ${contextCountry} legal requirements and document formats.`}
          </p>
        </CardContent>
      </Card>

      {/* Chat Placeholder */}
      <Card className="min-h-[300px] flex flex-col items-center justify-center text-center">
        <CardContent className="pt-6">
          <div className="mx-auto mb-4 p-4 rounded-full bg-purple-100">
            <Bot className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">AI Assistant Coming Soon</h3>
          <p className="text-muted-foreground max-w-md">
            We're building an intelligent AI assistant that will help you generate documents
            through natural conversation. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">What's Coming</CardTitle>
          </div>
          <CardDescription>
            Exciting AI-powered features we're working on for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingFeatures.map((feature, index) => (
              <div 
                key={index}
                className="flex gap-3 p-4 rounded-lg border bg-muted/30"
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-purple-100 text-purple-600 h-fit">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-medium mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AIAssistant() {
  const { hasFeature, loading } = usePlanFeatures();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Check if user has access to AI Assistant (Ultra only)
  if (!hasFeature('aiAssistant')) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <UpgradePrompt
            requiredPlan="ultra"
            feature="aiAssistant"
            title="Unlock AI Assistant"
            description="The AI Assistant is an Ultra-exclusive feature that helps you generate documents through natural conversation."
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AIAssistantContent />
    </DashboardLayout>
  );
}
