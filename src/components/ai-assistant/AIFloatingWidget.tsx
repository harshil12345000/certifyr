import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { ChatInterface } from '@/components/ai-assistant/ChatInterface';
import { Button } from '@/components/ui/button';
import { OrgInfo } from '@/lib/groq-client';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { useAIContext } from '@/hooks/useAIContext';
import { useAIConversation, EmployeeRecord, MatchOption } from '@/hooks/useAIConversation';
import { getTemplatesWithFields } from '@/config/documentConfigs';
import { sendChatMessage, parseGenerationResponse, generateChatTitle } from '@/lib/groq-client';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ChatMessage } from '@/hooks/useChatSessions';

const SESSION_STORAGE_KEY = 'ai_widget_session_id';

// ── helpers ──────────────────────────────────────────────────────────
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

// ── Component ─────────────────────────────────────────────────────────
interface AIFloatingWidgetProps {
  className?: string;
}

function AIFloatingWidgetComponent({ className }: AIFloatingWidgetProps) {
  const { user } = useAuth();
  const { organizationId, organizationDetails, userProfile } = useBranding();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const isUltraPlan = subscription?.active_plan?.toLowerCase() === 'ultra';

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDocumentGeneration, setIsDocumentGeneration] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');
  const [showPersonInfo, setShowPersonInfo] = useState(false);
  const [selectedPersonRecord, setSelectedPersonRecord] = useState<EmployeeRecord | null>(null);

  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const { contextCountry } = useAIContext();
  const { employeeData, loadData } = useEmployeeData();
  const conversation = useAIConversation();
  const templates = useMemo(() => getTemplatesWithFields(), []);
  const stableMissingFields = useRef<string[]>([]);

  // Keep stableMissingFields in sync
  useEffect(() => {
    if (showPersonInfo && conversation.missingFields.length > 0 && stableMissingFields.current.length === 0) {
      stableMissingFields.current = [...conversation.missingFields];
    }
    if (!showPersonInfo) {
      stableMissingFields.current = [];
    }
  }, [showPersonInfo, conversation.missingFields]);

  const orgInfo = useMemo<OrgInfo>(() => ({
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
  }), [organizationDetails, userProfile]);

  const orgInfoRef = useRef(orgInfo);
  orgInfoRef.current = orgInfo;

  useEffect(() => {
    if (organizationId) loadData(organizationId);
  }, [organizationId, loadData]);

  const userId = user?.id;

  // Load or create a persistent widget session
  const loadOrCreateSession = useCallback(async () => {
    if (!organizationId || !userId) return;
    const storedId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedId) {
      const { data, error } = await supabase
        .from('ai_chat_sessions' as never)
        .select('messages')
        .eq('id', storedId)
        .eq('organization_id', organizationId)
        .single() as unknown as { data: { messages: ChatMessage[] } | null; error: unknown };
      if (!error && data?.messages) {
        setSessionId(storedId);
        setMessages(data.messages);
        return;
      }
    }
    const { data, error } = await supabase
      .from('ai_chat_sessions' as never)
      .insert({ organization_id: organizationId, user_id: userId, title: 'Widget Chat', messages: [] })
      .select()
      .single() as unknown as { data: { id: string } | null; error: unknown };
    if (!error && data) {
      setSessionId(data.id);
      sessionStorage.setItem(SESSION_STORAGE_KEY, data.id);
    }
  }, [organizationId, userId]);

  useEffect(() => {
    if (organizationId && userId && !sessionId) loadOrCreateSession();
  }, [organizationId, userId, sessionId, loadOrCreateSession]);

  const saveMessages = useCallback(async (msgs: ChatMessage[]) => {
    if (!sessionId) return;
    await supabase
      .from('ai_chat_sessions' as never)
      .update({ messages: msgs as never, updated_at: new Date().toISOString() })
      .eq('id', sessionId);
  }, [sessionId]);

  // Adds a message to local state + persists
  const addMessage = useCallback(async (msg: ChatMessage): Promise<ChatMessage[]> => {
    const updated = [...messagesRef.current, msg];
    setMessages(updated);
    await saveMessages(updated);
    return updated;
  }, [saveMessages]);

  // Generate document (same logic as AIAssistant page)
  const generateDocument = useCallback(async (templateId: string, data: Record<string, string>) => {
    const templateLabel = templateId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const recipientName = data.fullName || data.name || 'Document';
    const queryString = new URLSearchParams(data).toString();
    const docLink = `/documents/${templateId}?${queryString}`;
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

    const templateConfig = templates.find(t => t.id === templateId);
    if (!templateConfig) return;

    const docData: Record<string, string> = {};

    const aliasToField: Record<string, string> = {
      'fullname': 'fullName', 'full name': 'fullName', 'full_name': 'fullName', 'name': 'fullName',
      'employeename': 'fullName', 'employee name': 'fullName', 'studentname': 'fullName',
      'parentname': 'parentName', 'parent name': 'parentName', 'parent_name': 'parentName',
      'employeeid': 'employeeId', 'employee id': 'employeeId', 'employee_id': 'employeeId',
      'studentid': 'employeeId', 'student id': 'employeeId', 'student_id': 'employeeId',
      'emp_id': 'employeeId', 'roll_number': 'employeeId', 'rollnumber': 'employeeId',
      'department': 'department', 'dept': 'department',
      'designation': 'designation', 'jobtitle': 'designation', 'job title': 'designation', 'position': 'designation', 'role': 'designation',
      'course': 'course', 'program': 'course', 'programme': 'course',
      'gender': 'gender', 'sex': 'gender',
      'type': 'type',
      'dateofbirth': 'dateOfBirth', 'date of birth': 'dateOfBirth', 'dob': 'dateOfBirth',
      'startdate': 'startDate', 'start date': 'startDate', 'start_date': 'startDate',
      'joiningdate': 'joiningDate', 'joining date': 'joiningDate', 'date_of_joining': 'joiningDate', 'doj': 'joiningDate',
      'enddate': 'endDate', 'end date': 'endDate', 'end_date': 'endDate',
      'address': 'address',
      'email': 'email', 'phone': 'phone', 'salary': 'salary',
      'mothername': 'motherName', 'mother name': 'motherName',
    };

    const requiredFieldSet = new Set(templateConfig.requiredFields.map(f => f.toLowerCase()));
    const usesCourseOrDesignation = requiredFieldSet.has('courseordesignation');
    const usesDesignation = requiredFieldSet.has('designation');
    const usesCourse = requiredFieldSet.has('course');
    const usesParentName = requiredFieldSet.has('parentname');
    const usesFatherName = requiredFieldSet.has('fathername');

    Object.entries(selectedRecord).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const normalizedKey = key.toLowerCase().trim();
        let mappedKey = aliasToField[normalizedKey] || key;

        const isFatherKey = ['fathername', 'father name', 'father_name', "father's name", 'guardianname', 'guardian name', 'parentname', 'parent name', 'parent_name'].includes(normalizedKey);
        if (isFatherKey) mappedKey = usesParentName ? 'parentName' : usesFatherName ? 'fatherName' : 'parentName';

        if (['designation', 'jobtitle', 'job title', 'job_title', 'position', 'role'].includes(normalizedKey)) {
          mappedKey = (usesCourseOrDesignation && !usesDesignation) ? 'courseOrDesignation' : 'designation';
        }
        if (['course', 'course name', 'course_name', 'program', 'programme'].includes(normalizedKey)) {
          mappedKey = (usesCourseOrDesignation && !usesCourse) ? 'courseOrDesignation' : 'course';
        }

        if (mappedKey === 'gender') {
          const genderMap: Record<string, string> = { 'male': 'male', 'm': 'male', 'female': 'female', 'f': 'female', 'other': 'other' };
          docData[mappedKey] = genderMap[String(value).toLowerCase().trim()] || String(value).toLowerCase().trim();
          return;
        }
        if (mappedKey === 'type') {
          const typeMap: Record<string, string> = { 'student': 'student', 'employee': 'employee', 'staff': 'employee', 'faculty': 'employee' };
          docData[mappedKey] = typeMap[String(value).toLowerCase().trim()] || String(value).toLowerCase().trim();
          return;
        }

        docData[mappedKey] = String(value);
      }
    });

    Object.entries(collectedFields).forEach(([key, value]) => { if (value) docData[key] = value; });

    const o = orgInfoRef.current;
    docData.institutionName = o.name;
    docData.place = o.place || '';
    docData.signatoryName = o.signatoryName || '';
    docData.signatoryDesignation = o.signatoryDesignation || '';

    const today = new Date();
    docData.date = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    await generateDocument(templateId, docData);
    conversation.resetConversation();
    setShowPersonInfo(false);
    setSelectedPersonRecord(null);
  }, [conversation, templates, generateDocument]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isGenerating) return;

    const userMessage: ChatMessage = { role: 'user', content: message, timestamp: Date.now() };
    const updatedMessages = await addMessage(userMessage);

    setIsGenerating(true);
    setLoadingMessage('Thinking...');

    const today = new Date();
    const issueDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    try {
      setLoadingMessage('Searching records...');

      const { templateId: detectedTemplate, searchName } = conversation.processUserMessage(message);

      if (detectedTemplate && searchName && employeeData.length > 0) {
        const allMatches = (employeeData as EmployeeRecord[]).filter(record => {
          const name = getNameFromRecord(record).toLowerCase();
          if (!name) return false;
          const search = searchName.toLowerCase().trim();
          return name.includes(search) || search.includes(name);
        });

        if (allMatches.length > 1) {
          const matchOptions = allMatches.map(r => ({ name: getNameFromRecord(r), id: getIdFromRecord(r), department: getDeptFromRecord(r) }));
          await addMessage({ role: 'assistant', content: `DISAMBIGUATE:${JSON.stringify(matchOptions)}`, timestamp: Date.now() });
          conversation.handleDisambiguationNeeded(matchOptions, detectedTemplate);
          setIsGenerating(false);
          return;
        }

        if (allMatches.length === 1) {
          const matchedRecord = allMatches[0];
          conversation.handlePersonSelected(matchedRecord, detectedTemplate);
          setSelectedPersonRecord(matchedRecord);
          setShowPersonInfo(true);
          await addMessage({ role: 'assistant', content: `Found ${getNameFromRecord(matchedRecord)} in records. Please provide additional details below.`, timestamp: Date.now() });
          setIsGenerating(false);
          return;
        }
      }

      const response = await sendChatMessage(
        updatedMessages,
        employeeData as Record<string, unknown>[],
        { model: 'sarvam-m' },
        orgInfoRef.current,
        issueDate,
        contextCountry,
        organizationId || undefined,
        updatedMessages.length === 1,
      );

      if (response.type === 'disambiguate' && response.matches) {
        const disambiguateContent = `DISAMBIGUATE:${JSON.stringify(response.matches)}`;
        await addMessage({ role: 'assistant', content: disambiguateContent, timestamp: Date.now() });
        conversation.handleDisambiguationNeeded(response.matches, detectedTemplate);
        setIsGenerating(false);
        return;
      }

      const aiContent = response.message || '';
      if (!aiContent.trim()) throw new Error('Empty response from AI');

      const parsed = parseGenerationResponse(aiContent);
      if (parsed) {
        setIsDocumentGeneration(true);
        setLoadingMessage('Generating document...');
        const { templateId, data } = parsed;
        const recipientName = data.fullName || data.name || 'Document';
        const templateLabel = templateId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const queryString = new URLSearchParams(data).toString();
        const docLink = `/documents/${templateId}?${queryString}`;
        await addMessage({ role: 'assistant', content: `GENERATED_LINK:${templateLabel}:${recipientName}:${docLink}`, timestamp: Date.now() });
        navigate(docLink);
        toast.success(`Opening ${templateLabel} for ${recipientName}`);
      } else {
        await addMessage({ role: 'assistant', content: aiContent, timestamp: Date.now() });
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to get response';
      await addMessage({ role: 'assistant', content: `Error: ${errMsg}`, timestamp: Date.now() });
      toast.error(errMsg);
    } finally {
      setIsGenerating(false);
      setIsDocumentGeneration(false);
      setLoadingMessage('Thinking...');
    }
  }, [addMessage, isGenerating, employeeData, contextCountry, organizationId, navigate, conversation]);

  const handleDisambiguationSelect = useCallback(async (match: MatchOption) => {
    const fullRecord = (employeeData as EmployeeRecord[]).find(record => {
      const name = getNameFromRecord(record).toLowerCase();
      const id = getIdFromRecord(record);
      return name.includes(match.name.toLowerCase()) || id === match.id;
    });

    if (fullRecord) {
      const templateId = conversation.state.pendingTemplateId || conversation.state.templateId;
      conversation.handleDisambiguationSelect(match, employeeData as EmployeeRecord[], templateId);
      setSelectedPersonRecord(fullRecord);
      setShowPersonInfo(true);
      await addMessage({ role: 'assistant', content: `Selected ${getNameFromRecord(fullRecord)}. Please provide the additional details below.`, timestamp: Date.now() });
    } else {
      const msg = match.id ? `I'm referring to ${match.name} (ID: ${match.id})` : `I'm referring to ${match.name}`;
      await handleSendMessage(msg);
    }
  }, [employeeData, conversation, addMessage, handleSendMessage]);

  const templateName = useMemo(() => {
    if (!conversation.state.templateId) return undefined;
    const t = templates.find(t => t.id === conversation.state.templateId);
    return t?.name || conversation.state.templateId;
  }, [conversation.state.templateId, templates]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!user || !organizationId || !isUltraPlan) return null;

  return (
    <div
      className={cn("fixed bottom-6 right-20 z-40 flex flex-col-reverse items-end", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isOpen && (
        <div style={{ width: '380px', height: '520px' }} className="mb-3 mr-0 bg-background rounded-lg shadow-2xl border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
          <div className="flex items-center justify-between px-3 py-2.5 bg-blue-600 text-white shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium text-sm">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onDisambiguationSelect={handleDisambiguationSelect}
            employeeDataCount={employeeData.length}
            contextCountry={contextCountry}
            isGenerating={isGenerating}
            isDocumentGeneration={isDocumentGeneration}
            loadingMessage={loadingMessage}
            minimal
            personInfoRecord={showPersonInfo ? selectedPersonRecord || undefined : undefined}
            personInfoTemplateName={showPersonInfo ? templateName : undefined}
            missingFields={showPersonInfo ? (stableMissingFields.current.length > 0 ? stableMissingFields.current : conversation.missingFields) : undefined}
            collectedFields={showPersonInfo ? conversation.state.collectedFields : undefined}
            templateName={showPersonInfo ? templateName : undefined}
            onFieldChange={conversation.updateCollectedField}
            onFieldSubmit={handleFieldSubmit}
          />
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 w-12 rounded-full shadow-lg transition-all duration-200",
          "bg-blue-600 hover:bg-blue-700 text-white",
          isOpen && "rotate-90",
          isHovered && "scale-110"
        )}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
      </Button>

      {!isOpen && (
        <div className={cn(
          "mr-1 mb-2 px-2 py-1 bg-white rounded-md shadow border text-xs text-muted-foreground whitespace-nowrap transition-all duration-200",
          isHovered
            ? "opacity-100 translate-y-0 translate-x-6"
            : "opacity-0 translate-y-2 translate-x-6 pointer-events-none"
        )}>
          AI Assistant
        </div>
      )}
    </div>
  );
}

export const AIFloatingWidget = React.memo(AIFloatingWidgetComponent);
