import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Sparkles, Bot } from 'lucide-react';
import { useAIContext } from '@/hooks/useAIContext';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { useChatSessions, ChatMessage } from '@/hooks/useChatSessions';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { ChatLayout } from '@/components/ai-assistant/ChatLayout';
import { CountryContextSelector } from '@/components/ai-assistant/CountryContextSelector';
import { useState, useCallback, useEffect } from 'react';
import { sendChatMessage } from '@/lib/groq-client';

function AIAssistantContent() {
  const { user } = useAuth();
  const { organizationId } = useBranding();
  const { contextCountry, loading: contextLoading, updateContextCountry } = useAIContext();
  const { employeeData, loadData } = useEmployeeData();
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  const {
    sessions,
    currentSession,
    loading: sessionsLoading,
    createSession,
    loadSession,
    deleteSession,
    updateTitle,
    addMessage,
  } = useChatSessions(user?.id, organizationId);

  useEffect(() => {
    if (organizationId) {
      loadData(organizationId);
    }
  }, [organizationId, loadData]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    setIsGenerating(true);
    
    try {
      await addMessage(userMessage);

      const currentMessages = currentSession?.messages || [];
      const allMessages = [...currentMessages, userMessage];

      const response = await sendChatMessage(
        allMessages,
        employeeData as Record<string, unknown>[],
        { model: 'llama-3.1-8b-instant' }
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      await addMessage(assistantMessage);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: Date.now(),
      };
      await addMessage(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [addMessage, currentSession, employeeData, isGenerating]);

  const handleNewChat = useCallback(async () => {
    await createSession();
  }, [createSession]);

  const handleSelectSession = useCallback(async (sessionId: string) => {
    await loadSession(sessionId);
  }, [loadSession]);

  return (
    <div className="space-y-6 animate-fade-in">
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

      {employeeData.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="py-3">
            <p className="text-sm text-purple-700">
              <Bot className="h-4 w-4 inline mr-1" />
              {employeeData.length} employee records loaded. The AI can auto-fill certificate fields with this data.
            </p>
          </CardContent>
        </Card>
      )}

      <ChatLayout
        sessions={sessions.map(s => ({ id: s.id, title: s.title, updated_at: s.updated_at }))}
        currentSession={currentSession ? {
          id: currentSession.id,
          title: currentSession.title,
          messages: currentSession.messages,
        } : null}
        loading={sessionsLoading}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={deleteSession}
        onRenameSession={updateTitle}
        onSendMessage={handleSendMessage}
        employeeData={employeeData}
        contextCountry={contextCountry}
        isGenerating={isGenerating}
      />
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
