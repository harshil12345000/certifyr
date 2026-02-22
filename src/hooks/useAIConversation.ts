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
    if (!state.selectedRecord) return requiredFields;
    
    const availableFields = new Set<string>();
    
    // Add all keys from selected record as available
    Object.keys(state.selectedRecord).forEach(key => {
      const value = state.selectedRecord[key];
      if (value !== null && value !== undefined && value !== '') {
        availableFields.add(key.toLowerCase());
        // Also add common aliases
        if (key === 'fullName') availableFields.add('fullname');
        if (key === 'parentName') availableFields.add('parentname');
        if (key === 'employeeId') availableFields.add('employeeid');
        if (key === 'studentId') availableFields.add('studentid');
        if (key === 'dateOfBirth') availableFields.add('dateofbirth');
        if (key === 'joiningDate') availableFields.add('joiningdate');
        if (key === 'startDate') availableFields.add('startdate');
      }
    });

    // Map template field names to record field names
    const fieldMappings: Record<string, string[]> = {
      fullName: ['fullname', 'name', 'full_name', 'employeename', 'studentname'],
      parentName: ['parentname', 'parent_name', 'fathername', 'father_name', 'guardianname'],
      employeeId: ['employeeid', 'employee_id', 'studentid', 'student_id', 'id'],
      department: ['department', 'dept'],
      courseOrDesignation: ['course', 'designation', 'jobtitle'],
      designation: ['designation', 'jobtitle'],
      course: ['course'],
      gender: ['gender', 'sex'],
      dateOfBirth: ['dateofbirth', 'dob', 'date_of_birth', 'birthdate'],
      startDate: ['startdate', 'start_date', 'joiningdate', 'dateofjoining', 'doj'],
      joiningDate: ['joiningdate', 'dateofjoining', 'startdate', 'doj'],
    };

    return requiredFields.filter(field => {
      const normalizedField = field.toLowerCase();
      
      // Check if we have this field from the employee record
      if (availableFields.has(normalizedField)) return false;
      
      // Check mapped fields
      const mappedFields = fieldMappings[normalizedField] || [];
      for (const mapped of mappedFields) {
        if (availableFields.has(mapped)) return false;
      }
      
      // Check if already collected from user
      if (state.collectedFields[field]) return false;
      
      // These fields are auto-filled from org data, not user input
      const orgAutoFields = ['institutionname', 'signatoryname', 'signatorydesignation', 'place', 'date'];
      if (orgAutoFields.includes(normalizedField)) return false;
      
      return true;
    });
  }, [requiredFields, state.selectedRecord, state.collectedFields]);

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
