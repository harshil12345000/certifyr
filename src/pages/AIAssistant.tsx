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
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
    const stableMissingFields = useRef<string[]>([]);

      // Capture missing fields when they first appear (don't update while user is filling them)
      useEffect(() => {
        if (showPersonInfo && conversation.missingFields.length > 0 && stableMissingFields.current.length === 0) {
          stableMissingFields.current = [...conversation.missingFields];
        }
        if (!showPersonInfo) {
          stableMissingFields.current = [];
        }
      }, [showPersonInfo, conversation.missingFields]);

      // Auto-generate when person is selected, template is set, and there are no missing fields
      const autoGenerateRef = useRef(false);
      const handleFieldSubmitRef = useRef<() => Promise<void>>(async () => {});
      useEffect(() => {
        if (
          showPersonInfo &&
          conversation.state.selectedRecord &&
          conversation.state.templateId &&
          conversation.missingFields.length === 0 &&
          !autoGenerateRef.current &&
          !isGenerating
        ) {
          autoGenerateRef.current = true;
          handleFieldSubmitRef.current();
        }
        if (!showPersonInfo) {
          autoGenerateRef.current = false;
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [showPersonInfo, conversation.state.selectedRecord, conversation.state.templateId, conversation.missingFields.length, isGenerating]);

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
    // Hard block: never generate if any required field is still missing
    if (!selectedRecord || !templateId || missingFields.length > 0) {
      console.warn('[handleFieldSubmit] Blocked: missing fields', missingFields);
      return;
    }

    // Build complete data from employee record + collected fields
    const templateConfig = templates.find(t => t.id === templateId);
    if (!templateConfig) return;

    const docData: Record<string, string> = {};

    // Map from lowercase alias -> canonical template field name
    const aliasToField: Record<string, string> = {
      // fullName
      'fullname': 'fullName', 'full name': 'fullName', 'full_name': 'fullName',
      'name': 'fullName', 'employeename': 'fullName', 'employee name': 'fullName',
      'employee_name': 'fullName', 'studentname': 'fullName', 'student name': 'fullName',
      'student_name': 'fullName',
      // parentName / fatherName aliases — handled contextually below based on template fields
      // (kept here as fallback only; overridden by isFatherKey logic)
      'parentname': 'parentName', 'parent name': 'parentName', 'parent_name': 'parentName',
      // employeeId
      'employeeid': 'employeeId', 'employee id': 'employeeId', 'employee_id': 'employeeId',
      'studentid': 'employeeId', 'student id': 'employeeId', 'student_id': 'employeeId',
      'emp_id': 'employeeId', 'emp id': 'employeeId', 'empid': 'employeeId',
      'roll_number': 'employeeId', 'roll number': 'employeeId', 'rollnumber': 'employeeId',
      'roll_no': 'employeeId',
      // department
      'department': 'department', 'dept': 'department', 'dept.': 'department',
      'division': 'department',
      // courseOrDesignation — only map if the template actually uses this field; we handle below
      // designation (for templates that use it directly)
      'designation': 'designation', 'jobtitle': 'designation', 'job title': 'designation',
      'job_title': 'designation', 'position': 'designation', 'role': 'designation', 'title': 'designation',
      // course
      'course': 'course', 'course name': 'course', 'course_name': 'course',
      'program': 'course', 'programme': 'course',
      // gender
      'gender': 'gender', 'sex': 'gender',
      // type
      'type': 'type',
      // dateOfBirth
      'dateofbirth': 'dateOfBirth', 'date of birth': 'dateOfBirth', 'date_of_birth': 'dateOfBirth',
      'dob': 'dateOfBirth', 'birthdate': 'dateOfBirth', 'birth date': 'dateOfBirth', 'birth_date': 'dateOfBirth',
      // startDate / joiningDate
      'startdate': 'startDate', 'start date': 'startDate', 'start_date': 'startDate',
      'joiningdate': 'joiningDate', 'joining date': 'joiningDate', 'date_of_joining': 'joiningDate',
      'date of joining': 'joiningDate', 'doj': 'joiningDate', 'dateofjoining': 'joiningDate',
      'join_date': 'joiningDate', 'joindate': 'joinDate', 'join date': 'joinDate',
      'admission date': 'startDate',
      // endDate / relievingDate
      'enddate': 'endDate', 'end date': 'endDate', 'end_date': 'endDate',
      'leavingdate': 'endDate', 'leaving date': 'endDate', 'date_of_leaving': 'endDate',
      'date of leaving': 'endDate', 'relieving_date': 'relievingDate', 'dateofleaving': 'endDate',
      'relievingdate': 'relievingDate', 'relieving date': 'relievingDate',
      // address
      'address': 'address', 'residentialaddress': 'address', 'residential address': 'address',
      'residential_address': 'address', 'permanentaddress': 'address', 'permanent address': 'address',
      'permanent_address': 'address',
      // email / phone / salary
      'email': 'email', 'emailaddress': 'email', 'email address': 'email',
      'email_address': 'email', 'e-mail': 'email', 'mail': 'email',
      'phone': 'phone', 'phonenumber': 'phone', 'phone number': 'phone',
      'phone_number': 'phone', 'mobilenumber': 'phone', 'mobile number': 'phone',
      'mobile': 'phone', 'contact': 'phone', 'contactnumber': 'phone',
      'contact number': 'phone', 'contact_number': 'phone',
      'salary': 'salary', 'income': 'salary', 'monthly salary': 'salary', 'ctc': 'salary', 'pay': 'salary',
      // motherName (fatherName is handled contextually below)
      'mothername': 'motherName', 'mother name': 'motherName', 'mother_name': 'motherName',
      "mother's name": 'motherName',
    };

    // Determine which template fields are required so we can map aliases correctly
    const requiredFieldSet = new Set(templateConfig.requiredFields.map(f => f.toLowerCase()));
    const usesCourseOrDesignation = requiredFieldSet.has('courseordesignation');
    const usesDesignation = requiredFieldSet.has('designation');
    const usesCourse = requiredFieldSet.has('course');
    const usesParentName = requiredFieldSet.has('parentname');
    const usesFatherName = requiredFieldSet.has('fathername');

    // Add employee record fields, remapping keys to canonical template field names
    Object.entries(selectedRecord).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const normalizedKey = key.toLowerCase().trim();
        let mappedKey = aliasToField[normalizedKey] || key;

        // Special handling for fatherName vs parentName (template-dependent)
        const isFatherKey = ['fathername', 'father name', 'father_name', "father's name", 'guardianname', 'guardian name', 'guardian_name', 'father', 'parent', 'parentname', 'parent name', 'parent_name'].includes(normalizedKey);
        if (isFatherKey) {
          mappedKey = usesParentName ? 'parentName' : usesFatherName ? 'fatherName' : 'parentName';
        }

        // Special handling for courseOrDesignation vs designation vs course
        if (['designation', 'jobtitle', 'job title', 'job_title', 'position', 'role', 'title'].includes(normalizedKey)) {
          mappedKey = (usesCourseOrDesignation && !usesDesignation) ? 'courseOrDesignation' : 'designation';
        }
        if (['course', 'course name', 'course_name', 'program', 'programme'].includes(normalizedKey)) {
          mappedKey = (usesCourseOrDesignation && !usesCourse) ? 'courseOrDesignation' : 'course';
        }

        // Normalize gender values
        if (mappedKey === 'gender') {
          const genderMap: Record<string, string> = {
            'male': 'male', 'm': 'male', 'man': 'male', 'boy': 'male',
            'female': 'female', 'f': 'female', 'woman': 'female', 'girl': 'female',
            'other': 'other', 'o': 'other', 'others': 'other',
          };
          const v = String(value).toLowerCase().trim();
          docData[mappedKey] = genderMap[v] || v;
          return;
        }

        // Normalize type values
        if (mappedKey === 'type') {
          const typeMap: Record<string, string> = {
            'student': 'student', 's': 'student', 'studying': 'student',
            'employee': 'employee', 'e': 'employee', 'staff': 'employee', 'faculty': 'employee',
          };
          const v = String(value).toLowerCase().trim();
          docData[mappedKey] = typeMap[v] || v;
          return;
        }

        docData[mappedKey] = String(value);
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

    // Keep ref in sync so the auto-generate effect can call the latest version
    handleFieldSubmitRef.current = handleFieldSubmit;

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    // Add user message FIRST so it appears immediately and is persisted
    const updatedMessages = await addMessage(userMessage);

    // Generate title when this is the very first message (only 1 message = the one we just added)
    const isFirstMessage = updatedMessages.length === 1;
    if (isFirstMessage) {
      // Fire-and-forget: generate a descriptive title from the first message
      generateChatTitle(message).then((title) => {
        if (title && title !== 'New Chat') {
          // currentSessionRef is always up-to-date in useChatSessions; use updateTitle with the session id
          // We get the current session id from currentSession (already set by addMessage before this runs)
          // Use a small delay to ensure the session is persisted
          setTimeout(() => {
            const sessionId = currentSession?.id;
            if (sessionId) updateTitle(sessionId, title);
          }, 200);
        }
      });
    }

    setIsGenerating(true);
    setLoadingMessage('Thinking...');
    
    const today = new Date();
    const issueDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    try {
      setLoadingMessage('Searching records...');
      
      // Detect template and name from user's message
      const { templateId: detectedTemplate, searchName } = conversation.processUserMessage(message);
      
      // FIRST: Try to handle client-side if we have employee data, template, and name
      if (detectedTemplate && searchName && employeeData.length > 0) {
        // Check for multiple matches (disambiguation needed)
        const allMatches = (employeeData as EmployeeRecord[]).filter((record) => {
          const name = getNameFromRecord(record).toLowerCase();
          if (!name) return false;
          const search = searchName.toLowerCase().trim();
          return name.includes(search) || search.includes(name);
        });

        if (allMatches.length > 1) {
          // Multiple matches — show disambiguation card client-side (no AI call needed)
          const matchOptions = allMatches.map(r => ({
            name: getNameFromRecord(r),
            id: getIdFromRecord(r),
            department: getDeptFromRecord(r),
          }));
          const disambiguateContent = `DISAMBIGUATE:${JSON.stringify(matchOptions)}`;
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: disambiguateContent,
            timestamp: Date.now(),
          };
          await addMessage(assistantMessage);
          conversation.handleDisambiguationNeeded(matchOptions, detectedTemplate);
          setIsGenerating(false);
          return;
        }

        const matchedRecord = allMatches.length === 1 ? allMatches[0] : null;
        
        if (matchedRecord) {
          // Single match found - show person info and field collection
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
          setIsGenerating(false);
          return;
        }
      }

       // If we get here, we need to call AI (no local match or no template detected)
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
         
         // Update conversation state with detected template
         conversation.handleDisambiguationNeeded(response.matches, detectedTemplate);
         setIsGenerating(false);
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

         // If the AI returned a matched employee record AND the response contains Known/Missing info,
         // activate the interactive field collection flow so the user doesn't get stuck.
         const hasKnownInfoSection = /###?\s*Known Information/i.test(aiContent);
         const hasMissingInfoSection = /###?\s*Missing Information/i.test(aiContent);
         
         if (response.matchedRecord && hasKnownInfoSection && detectedTemplate) {
           // AI found the employee and showed known info — now activate field collection UI
           conversation.handlePersonSelected(response.matchedRecord as EmployeeRecord, detectedTemplate);
           setSelectedPersonRecord(response.matchedRecord as EmployeeRecord);
           setShowPersonInfo(true);
         } else if (response.matchedRecord && hasKnownInfoSection && !detectedTemplate) {
           // AI found employee but we need to detect template from conversation context
           // Try to extract template from the original message
           const { templateId: msgTemplate } = conversation.processUserMessage(message);
           if (msgTemplate) {
             conversation.handlePersonSelected(response.matchedRecord as EmployeeRecord, msgTemplate);
             setSelectedPersonRecord(response.matchedRecord as EmployeeRecord);
             setShowPersonInfo(true);
           } else if (hasMissingInfoSection) {
             // Still show the person info even without template - user can provide template selection
             conversation.handlePersonSelected(response.matchedRecord as EmployeeRecord, null);
             setSelectedPersonRecord(response.matchedRecord as EmployeeRecord);
             setShowPersonInfo(true);
           }
         }
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
    // Find the full record from employee data — match by name first (exact), then by ID only if non-empty
    const matchNameLower = match.name.toLowerCase().trim();
    const fullRecord = (employeeData as EmployeeRecord[]).find(record => {
      const name = getNameFromRecord(record).toLowerCase().trim();
      const id = getIdFromRecord(record);
      // Prefer exact name match
      if (name === matchNameLower) return true;
      // Fall back to ID match only when ID is non-empty
      if (match.id && id && id === match.id) return true;
      return false;
    });

    if (fullRecord) {
      // Use pendingTemplateId if set, otherwise templateId
      const templateId = conversation.state.pendingTemplateId || conversation.state.templateId;
      
      // Update conversation state with the template
      conversation.handleDisambiguationSelect(match, employeeData as EmployeeRecord[], templateId);
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
          missingFields={showPersonInfo ? (stableMissingFields.current.length > 0 ? stableMissingFields.current : conversation.missingFields) : undefined}
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
