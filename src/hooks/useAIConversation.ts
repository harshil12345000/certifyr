import { useState, useCallback, useMemo } from 'react';
import { getTemplatesWithFields, TemplateWithFields } from '@/config/documentConfigs';

export interface EmployeeRecord {
  [key: string]: unknown;
}

export interface MatchOption {
  name: string;
  id: string;
  department: string;
}

export type ConversationStage = 
  | 'idle' 
  | 'awaiting_disambiguation' 
  | 'showing_person_info' 
  | 'collecting_fields';

export interface ConversationState {
  stage: ConversationStage;
  selectedRecord: EmployeeRecord | null;
  templateId: string | null;
  pendingTemplateId: string | null;  // Template detected before disambiguation
  collectedFields: Record<string, string>;
  disambiguationMatches: MatchOption[];
}

export interface UseAIConversationReturn {
  state: ConversationState;
  requiredFields: string[];
  templateConfig: TemplateWithFields | null;
  missingFields: string[];
  detectedTemplate: string | null;
  handleDisambiguationSelect: (match: MatchOption, employeeData: EmployeeRecord[], templateId?: string | null) => void;
  handlePersonSelected: (record: EmployeeRecord, templateId: string | null) => void;
  setTemplateId: (templateId: string | null) => void;
  updateCollectedField: (field: string, value: string) => void;
  submitCollectedFields: () => Record<string, string> | null;
  resetConversation: () => void;
  processUserMessage: (message: string) => { templateId: string | null; searchName: string | null };
  handleDisambiguationNeeded: (matches: MatchOption[], templateId?: string | null) => void;
}

function getNameFromRecord(record: EmployeeRecord): string {
  const nameFields = ['name', 'fullName', 'full_name', 'employeeName', 'studentName', 'Name', 'FullName', 'FULL NAME', 'Full Name', 'full name'];
  for (const field of nameFields) {
    const val = record[field];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  return '';
}

function getIdFromRecord(record: EmployeeRecord): string {
  const idFields = ['employeeId', 'employee_id', 'id', 'ID', 'studentId', 'student_id', 'Employee ID', 'Student ID', 'emp_id', 'roll_number', 'rollNumber'];
  for (const field of idFields) {
    if (record[field] !== undefined && record[field] !== null) return String(record[field]);
  }
  return '';
}

function getDeptFromRecord(record: EmployeeRecord): string {
  const deptFields = ['department', 'Department', 'dept', 'course', 'Course', 'DEPARTMENT'];
  for (const field of deptFields) {
    if (typeof record[field] === 'string') return record[field] as string;
  }
  return '';
}

export function useAIConversation(): UseAIConversationReturn {
  const [state, setState] = useState<ConversationState>({
    stage: 'idle',
    selectedRecord: null,
    templateId: null,
    pendingTemplateId: null,
    collectedFields: {},
    disambiguationMatches: [],
  });

  const templates = useMemo(() => getTemplatesWithFields(), []);

  const templateConfig = useMemo(() => {
    if (!state.templateId) return null;
    return templates.find(t => t.id === state.templateId) || null;
  }, [state.templateId, templates]);

  const requiredFields = useMemo(() => {
    return templateConfig?.requiredFields || [];
  }, [templateConfig]);

  const missingFields = useMemo(() => {
    if (!state.selectedRecord || !templateConfig) return requiredFields;
    
    // Get all non-empty keys from employee record
    const recordKeys = Object.keys(state.selectedRecord).filter(key => {
      const value = state.selectedRecord[key];
      return value !== null && value !== undefined && value !== '';
    });

    // Create a map of all possible aliases for each field
    const fieldToAliases: Record<string, string[]> = {
      fullName: ['fullname', 'name', 'full_name', 'employeename', 'studentname', 'employee_name', 'student_name', 'full-name'],
      parentName: ['parentname', 'parent_name', 'fathername', 'father_name', 'guardianname', 'guardian_name', 'father', 'parent'],
      employeeId: ['employeeid', 'employee_id', 'studentid', 'student_id', 'id', 'emp_id', 'empid', 'empid', 'employeeid', 'student_id', 'roll_number', 'rollnumber', 'roll_no'],
      department: ['department', 'dept', 'department_name', 'dept_name'],
      courseOrDesignation: ['course', 'designation', 'jobtitle', 'job_title', 'course_name'],
      designation: ['designation', 'jobtitle', 'job_title', 'position', 'role'],
      course: ['course', 'course_name', 'program', 'programme'],
      gender: ['gender', 'sex', 'gender_type'],
      type: ['type', 'persontype', 'person_type', 'studenttype', 'employeetype'],
      personType: ['type', 'persontype', 'person_type', 'studenttype', 'employeetype'],
      dateOfBirth: ['dateofbirth', 'date_of_birth', 'dob', 'birthdate', 'birth_date', 'birthday'],
      startDate: ['startdate', 'start_date', 'joiningdate', 'date_of_joining', 'doj', 'dateofjoining', 'join_date'],
      joiningDate: ['joiningdate', 'date_of_joining', 'startdate', 'start_date', 'doj', 'dateofjoining', 'join_date'],
      endDate: ['enddate', 'end_date', 'leavingdate', 'date_of_leaving', 'relieving_date', 'dateofleaving'],
      address: ['address', 'residentialaddress', 'residential_address', 'permanentaddress', 'permanent_address', 'city', 'location'],
      email: ['email', 'emailaddress', 'email_address', 'mail'],
      phone: ['phone', 'phonenumber', 'phone_number', 'mobilenumber', 'mobile', 'contact', 'contactnumber', 'contact_number'],
    };

    // Fields that are auto-filled from org data, not user input
    const orgAutoFields = new Set([
      'institutionname', 'signatoryname', 'signatorydesignation', 'place', 'date'
    ]);

    return requiredFields.filter(field => {
      // Skip org auto-filled fields
      if (orgAutoFields.has(field.toLowerCase())) return false;
      
      // Check if already collected from user
      if (state.collectedFields[field]) return false;

      // Check if field exists in record (case-insensitive check)
      const normalizedField = field.toLowerCase();
      const aliases = fieldToAliases[normalizedField] || [normalizedField];
      
      // Check if any alias exists in record keys
      const existsInRecord = recordKeys.some(key => 
        aliases.includes(key.toLowerCase())
      );
      
      return !existsInRecord;
    });
  }, [requiredFields, state.selectedRecord, state.collectedFields, templateConfig]);

  const detectedTemplate = useMemo(() => {
    return state.templateId;
  }, [state.templateId]);

  const handleDisambiguationSelect = useCallback((match: MatchOption, employeeData: EmployeeRecord[], templateId?: string | null) => {
    // Find the full record from employee data
    const fullRecord = employeeData.find(record => {
      const name = getNameFromRecord(record).toLowerCase();
      const id = getIdFromRecord(record);
      return name.includes(match.name.toLowerCase()) || id === match.id;
    });

    if (fullRecord) {
      setState(prev => ({
        ...prev,
        stage: templateId ? 'collecting_fields' : 'showing_person_info',
        selectedRecord: fullRecord,
        templateId: templateId || prev.templateId,
      }));
    }
  }, []);

  const handlePersonSelected = useCallback((record: EmployeeRecord, templateId: string | null) => {
    setState(prev => ({
      ...prev,
      stage: templateId ? 'collecting_fields' : 'showing_person_info',
      selectedRecord: record,
      templateId: templateId || prev.templateId,
    }));
  }, []);

  const setTemplateId = useCallback((templateId: string | null) => {
    setState(prev => ({
      ...prev,
      templateId,
      stage: templateId ? 'collecting_fields' : 'idle',
    }));
  }, []);

  const updateCollectedField = useCallback((field: string, value: string) => {
    setState(prev => ({
      ...prev,
      collectedFields: {
        ...prev.collectedFields,
        [field]: value,
      },
    }));
  }, []);

  const submitCollectedFields = useCallback(() => {
    if (missingFields.length > 0) return null;
    
    return {
      ...state.collectedFields,
    };
  }, [missingFields, state.collectedFields]);

  const resetConversation = useCallback(() => {
    setState({
      stage: 'idle',
      selectedRecord: null,
      templateId: null,
      pendingTemplateId: null,
      collectedFields: {},
      disambiguationMatches: [],
    });
  }, []);

  const processUserMessage = useCallback((message: string): { templateId: string | null; searchName: string | null } => {
    const lowerMsg = message.toLowerCase();
    
    // Template detection
    const templateKeywords: Record<string, string[]> = {
      'bonafide': ['bonafide', 'bona fide'],
      'character': ['character'],
      'experience': ['experience'],
      'transfer': ['transfer', 'tc'],
      'academic-transcript': ['transcript', 'academic transcript'],
      'completion': ['completion'],
      'income': ['income'],
      'maternity-leave': ['maternity'],
      'offer-letter': ['offer letter', 'offer'],
      'noc-visa': ['noc', 'visa noc'],
      'bank-verification': ['bank verification', 'bank'],
      'address-proof': ['address proof'],
      'nda': ['nda'],
      'employment-agreement': ['employment agreement'],
    };

    let foundTemplate: string | null = null;
    for (const [templateId, keywords] of Object.entries(templateKeywords)) {
      if (keywords.some(kw => lowerMsg.includes(kw))) {
        foundTemplate = templateId;
        break;
      }
    }

    // Name extraction
    const namePatterns = [
      /(?:for|of)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/,
      /(?:certificate|bonafide|letter|document|noc|offer|experience|transfer|transcript)\s+(?:for|of|to)\s+(.+?)(?:\.|,|$)/i,
      /(?:create|generate|make|prepare|issue)\s+(?:\w+\s+){0,3}(?:for|of)\s+(.+?)(?:\.|,|$)/i,
      /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3})$/,
    ];

    let searchName: string | null = null;
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match) {
        searchName = match[1].trim();
        break;
      }
    }

    return { templateId: foundTemplate, searchName };
  }, []);

  const handleDisambiguationNeeded = useCallback((matches: MatchOption[], templateId?: string | null) => {
    setState(prev => ({
      ...prev,
      stage: 'awaiting_disambiguation',
      disambiguationMatches: matches,
      pendingTemplateId: templateId || prev.pendingTemplateId,
    }));
  }, []);

  return {
    state,
    requiredFields,
    templateConfig,
    missingFields,
    detectedTemplate,
    handleDisambiguationSelect,
    handlePersonSelected,
    setTemplateId,
    updateCollectedField,
    submitCollectedFields,
    resetConversation,
    processUserMessage,
    handleDisambiguationNeeded,
  };
}
