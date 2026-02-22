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
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage, parseGenerationResponse, generateChatTitle } from '@/lib/groq-client';
import { toast } from 'sonner';
import { useAIConversation, EmployeeRecord, MatchOption } from '@/hooks/useAIConversation';
import { getTemplatesWithFields } from '@/config/documentConfigs';

function getNameFromRecord(record: Record<string, unknown>): string {
  const nameFields = ['name', 'fullName', 'full_name', 'employeeName', 'studentName', 'Name', 'FullName', 'FULL NAME', 'Full Name', 'full name'];
  for (const field of nameFields) {
    const val = record[field];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  return '';
}

function getIdFromRecord(record: Record<string, unknown>): string {
  const idFields = ['employeeId', 'employee_id', 'id', 'ID', 'studentId', 'student_id', 'Employee ID', 'Student ID', 'emp_id', 'roll_number', 'rollNumber'];
  for (const field of idFields) {
    if (record[field] !== undefined && record[field] !== null) return String(record[field]);
  }
  return '';
}

function getDeptFromRecord(record: Record<string, unknown>): string {
  const deptFields = ['department', 'Department', 'dept', 'course', 'Course', 'DEPARTMENT'];
  for (const field of deptFields) {
    if (typeof record[field] === 'string') return record[field] as string;
  }
  return '';
}

function searchEmployeeByName(employeeData: EmployeeRecord[], searchName: string): EmployeeRecord | null {
  if (!searchName || employeeData.length === 0) return null;

  const search = searchName.toLowerCase().trim();
  if (search.length < 2) return null;

  const matches = employeeData.filter((record) => {
    const name = getNameFromRecord(record).toLowerCase();
    if (!name) return false;
    return name.includes(search) || search.includes(name);
  });

  if (matches.length === 1) {
    return matches[0];
  }
  return null;
}

function AIAssistantContent() {
  const { user } = useAuth();
  const { organizationId, organizationDetails, userProfile } = useBranding();
  const { contextCountry, loading: contextLoading, updateContextCountry } = useAIContext();
  const { employeeData, loadData } = useEmployeeData();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDocumentGeneration, setIsDocumentGeneration] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');
  const [showPersonInfo, setShowPersonInfo] = useState(false);
  const [selectedPersonRecord, setSelectedPersonRecord] = useState<EmployeeRecord | null>(null);

  const conversation = useAIConversation();
  const templates = useMemo(() => getTemplatesWithFields(), []);

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

  const generateDocument = useCallback(async (templateId: string, data: Record<string, string>) => {
    const templateLabel = templateId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const recipientName = data.fullName || data.name || 'Document';
    const queryString = new URLSearchParams(data).toString();
    const docLink = `/documents/${templateId}?${queryString}`;

    // Save a clean "document generated" message
    const generatedMessage: ChatMessage = {
      role: 'assistant',
      content: `GENERATED_LINK:${templateLabel}:${recipientName}:${docLink}`,
      timestamp: Date.now(),
    };
    await addMessage(generatedMessage);
    navigate(docLink);
    toast.success(`Opening ${templateLabel} for ${recipientName}`);
  }, [addMessage, navigate]);

  const handleFieldSubmit = useCallback(async () => {
    const { selectedRecord, templateId, collectedFields } = conversation.state;
    const missingFields = conversation.missingFields;
    if (!selectedRecord || !templateId || missingFields.length > 0) return;

    // Build complete data from employee record + collected fields
    const templateConfig = templates.find(t => t.id === templateId);
    if (!templateConfig) return;

    const docData: Record<string, string> = {};

    // Add all employee record fields
    Object.entries(selectedRecord).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        docData[key] = String(value);
      }
    });

    // Add collected fields (user input)
    Object.entries(collectedFields).forEach(([key, value]) => {
      if (value) {
        docData[key] = value;
      }
    });

    // Add org info defaults
    docData.institutionName = orgInfo.name;
    docData.place = orgInfo.place || '';
    docData.signatoryName = orgInfo.signatoryName || '';
    docData.signatoryDesignation = orgInfo.signatoryDesignation || '';

    // Add today's date
    const today = new Date();
    const issueDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    docData.date = issueDate;

    // Generate the document
    await generateDocument(templateId, docData);

    // Reset conversation state
    conversation.resetConversation();
    setShowPersonInfo(false);
    setSelectedPersonRecord(null);
  }, [conversation, templates, orgInfo, generateDocument]);

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

      // Check if user is responding to field collection
      const { templateId: detectedTemplate, searchName } = conversation.processUserMessage(message);
      
      // If we already have a person selected and are collecting fields, handle that first
      if (selectedPersonRecord && conversation.state.templateId) {
        // User is providing field values - let AI handle it naturally
        // But also check if AI should generate the document
      }

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
        
        // Update conversation state
        conversation.handleDisambiguationNeeded(response.matches);
        return;
      }

      // Handle client-side: if we detected a template and name in user's message, try to match locally
      if (detectedTemplate && searchName && employeeData.length > 0) {
        const matchedRecord = searchEmployeeByName(employeeData as EmployeeRecord[], searchName);
        
        if (matchedRecord) {
          // Found a match - show person info and start field collection
          conversation.handlePersonSelected(matchedRecord, detectedTemplate);
          setSelectedPersonRecord(matchedRecord);
          setShowPersonInfo(true);

          // Add a message indicating we found the person
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: `Found ${getNameFromRecord(matchedRecord)} in records. Please provide additional details below.`,
            timestamp: Date.now(),
          };
          await addMessage(assistantMessage);
          return;
        }
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
  }, [addMessage, currentSession, employeeData, isGenerating, navigate, orgInfo, contextCountry, organizationId, updateTitle, conversation, selectedPersonRecord]);

  const handleSendDisambiguation = useCallback(async (match: { name: string; id: string; department: string }) => {
    // Find the full record from employee data
    const fullRecord = (employeeData as EmployeeRecord[]).find(record => {
      const name = getNameFromRecord(record).toLowerCase();
      const id = getIdFromRecord(record);
      return name.includes(match.name.toLowerCase()) || id === match.id;
    });

    if (fullRecord) {
      // Update conversation state
      conversation.handleDisambiguationSelect(match, employeeData as EmployeeRecord[]);
      setSelectedPersonRecord(fullRecord);
      setShowPersonInfo(true);

      // Add confirmation message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `Selected ${getNameFromRecord(fullRecord)}. Please provide the additional details below.`,
        timestamp: Date.now(),
      };
      await addMessage(assistantMessage);
    } else {
      // Fallback: send message to AI
      const msg = match.id 
        ? `I'm referring to ${match.name} (ID: ${match.id})`
        : `I'm referring to ${match.name}`;
      await handleSendMessage(msg);
    }
  }, [employeeData, conversation, addMessage, handleSendMessage]);

  const handleNewChat = useCallback(async () => {
    await createSession();
    conversation.resetConversation();
    setShowPersonInfo(false);
    setSelectedPersonRecord(null);
  }, [createSession, conversation]);

  const handleSelectSession = useCallback(async (sessionId: string) => {
    await loadSession(sessionId);
    conversation.resetConversation();
    setShowPersonInfo(false);
    setSelectedPersonRecord(null);
  }, [loadSession, conversation]);

  const templateName = useMemo(() => {
    if (!conversation.state.templateId) return undefined;
    const t = templates.find(t => t.id === conversation.state.templateId);
    return t?.name || conversation.state.templateId;
  }, [conversation.state.templateId, templates]);

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
        personInfoRecord={showPersonInfo ? selectedPersonRecord || undefined : undefined}
        personInfoTemplateName={showPersonInfo ? templateName : undefined}
        missingFields={showPersonInfo ? conversation.missingFields : undefined}
        collectedFields={showPersonInfo ? conversation.state.collectedFields : undefined}
        templateName={showPersonInfo ? templateName : undefined}
        onFieldChange={conversation.updateCollectedField}
        onFieldSubmit={handleFieldSubmit}
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
