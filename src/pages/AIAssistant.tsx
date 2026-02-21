import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useAIContext } from '@/hooks/useAIContext';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { useChatSessions, ChatMessage } from '@/hooks/useChatSessions';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { ChatLayout } from '@/components/ai-assistant/ChatLayout';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage, parseGenerationResponse, generateChatTitle } from '@/lib/groq-client';
import { toast } from 'sonner';

function AIAssistantContent() {
  const { user } = useAuth();
  const { organizationId, organizationDetails, userProfile } = useBranding();
  const { contextCountry, loading: contextLoading, updateContextCountry } = useAIContext();
  const { employeeData, loadData } = useEmployeeData();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDocumentGeneration, setIsDocumentGeneration] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');

  const orgInfo = {
    name: organizationDetails?.name || 'Unknown Organization',
    address: organizationDetails?.address || '',
    place: organizationDetails?.address?.split(',').pop()?.trim() || userProfile?.organizationLocation || '',
    email: organizationDetails?.email || '',
    phone: organizationDetails?.phone || '',
    signatoryName: userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}`.trim() 
      : '',
    signatoryDesignation: userProfile?.designation || '',
    organizationType: userProfile?.organizationType || '',
    organizationLocation: userProfile?.organizationLocation || '',
  };
  
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

  // Only auto-load first session if one exists (no auto-create)
  useEffect(() => {
    if (!sessionsLoading && sessions.length > 0 && !currentSession) {
      loadSession(sessions[0].id);
    }
  }, [sessions, sessionsLoading, currentSession, loadSession]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    // Add user message FIRST so it appears immediately and is persisted
    const updatedMessages = await addMessage(userMessage);

    setIsGenerating(true);
    setLoadingMessage('Thinking...');
    
    const today = new Date();
    const issueDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    try {
      setLoadingMessage('Searching records...');
      
      // Check if this is the first message in the session
      const isFirstMessage = !currentSession?.messages || currentSession.messages.length === 0;
      
      // Use the returned updatedMessages which includes the user message
      const response = await sendChatMessage(
        updatedMessages,
        employeeData as Record<string, unknown>[],
        { model: 'sarvam-m' },
        orgInfo,
        issueDate,
        contextCountry,
        organizationId || undefined,
        isFirstMessage,
      );

      // Handle disambiguation response
      if (response.type === 'disambiguate' && response.matches) {
        const disambiguateContent = `DISAMBIGUATE:${JSON.stringify(response.matches)}`;
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: disambiguateContent,
          timestamp: Date.now(),
        };
        await addMessage(assistantMessage);
        return;
      }

      const aiContent = response.message || '';

      if (!aiContent || aiContent.trim() === '') {
        throw new Error('Empty response from AI');
      }

      // Check if AI wants to generate a document
      const parsed = parseGenerationResponse(aiContent);
      
      if (parsed) {
        setIsDocumentGeneration(true);
        setLoadingMessage('Generating document...');
        const { templateId, data } = parsed;
        const recipientName = data.fullName || data.name || 'Document';
        const templateLabel = templateId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const queryString = new URLSearchParams(data).toString();
        const docLink = `/documents/${templateId}?${queryString}`;

        // Save a clean "document generated" message instead of the raw AI output
        const generatedMessage: ChatMessage = {
          role: 'assistant',
          content: `GENERATED_LINK:${templateLabel}:${recipientName}:${docLink}`,
          timestamp: Date.now(),
        };
        await addMessage(generatedMessage);
        navigate(docLink);
        toast.success(`Opening ${templateLabel} for ${recipientName}`);
      } else {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: aiContent,
          timestamp: Date.now(),
        };
        await addMessage(assistantMessage);
      }

      // Generate AI title for new chats
      if (currentSession?.title === 'New Chat') {
        generateChatTitle(message).then((title) => {
          if (title && title !== 'New Chat' && currentSession) {
            updateTitle(currentSession.id, title);
          }
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: Date.now(),
      };
      await addMessage(errorMessage);
      toast.error(error instanceof Error ? error.message : 'Failed to get response');
    } finally {
      setIsGenerating(false);
      setIsDocumentGeneration(false);
      setLoadingMessage('Thinking...');
    }
  }, [addMessage, currentSession, employeeData, isGenerating, navigate, orgInfo, contextCountry, organizationId, updateTitle]);

  const handleSendDisambiguation = useCallback(async (match: { name: string; id: string }) => {
    const msg = match.id 
      ? `I'm referring to ${match.name} (ID: ${match.id})`
      : `I'm referring to ${match.name}`;
    await handleSendMessage(msg);
  }, [handleSendMessage]);

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
            <Badge className="bg-blue-600 text-white">Ultra</Badge>
          </div>
          <p className="text-muted-foreground">
            Your intelligent document generation partner
          </p>
        </div>
      </div>

      {employeeData.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <p className="text-sm text-blue-700">
              <Sparkles className="h-4 w-4 inline mr-1" />
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
        onDisambiguationSelect={handleSendDisambiguation}
        employeeData={employeeData}
        contextCountry={contextCountry}
        isGenerating={isGenerating}
        isDocumentGeneration={isDocumentGeneration}
        loadingMessage={loadingMessage}
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
