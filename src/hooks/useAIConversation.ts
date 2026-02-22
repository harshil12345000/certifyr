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

      // Create a map of all possible aliases for each field (keyed by lowercase field name)
      const fieldToAliases: Record<string, string[]> = {
        fullname: ['fullname', 'full name', 'full_name', 'name', 'employeename', 'employee name', 'employee_name', 'studentname', 'student name', 'student_name', 'full-name'],
        parentname: ['parentname', 'parent name', 'parent_name', 'fathername', 'father name', 'father_name', "father's name", 'guardianname', 'guardian name', 'guardian_name', 'father', 'parent'],
        employeeid: ['employeeid', 'employee id', 'employee_id', 'studentid', 'student id', 'student_id', 'id', 'emp_id', 'emp id', 'empid', 'roll_number', 'roll number', 'rollnumber', 'roll_no'],
        department: ['department', 'dept', 'dept.', 'department_name', 'dept_name', 'division'],
        courseordesignation: ['courseordesignation', 'course', 'course name', 'course_name', 'designation', 'jobtitle', 'job title', 'job_title', 'position', 'role', 'program', 'programme'],
        designation: ['designation', 'jobtitle', 'job title', 'job_title', 'position', 'role', 'title'],
        course: ['course', 'course name', 'course_name', 'program', 'programme'],
        gender: ['gender', 'sex', 'gender_type'],
        type: ['type', 'persontype', 'person type', 'person_type', 'studenttype', 'employeetype'],
        persontype: ['type', 'persontype', 'person type', 'person_type', 'studenttype', 'employeetype'],
        dateofbirth: ['dateofbirth', 'date of birth', 'date_of_birth', 'dob', 'birthdate', 'birth date', 'birth_date', 'birthday'],
        startdate: ['startdate', 'start date', 'start_date', 'joiningdate', 'joining date', 'date_of_joining', 'date of joining', 'doj', 'dateofjoining', 'join_date', 'admission date'],
        joiningdate: ['joiningdate', 'joining date', 'date_of_joining', 'date of joining', 'startdate', 'start date', 'start_date', 'doj', 'dateofjoining', 'join_date'],
        enddate: ['enddate', 'end date', 'end_date', 'leavingdate', 'leaving date', 'date_of_leaving', 'date of leaving', 'relieving_date', 'dateofleaving'],
        address: ['address', 'residentialaddress', 'residential address', 'residential_address', 'permanentaddress', 'permanent address', 'permanent_address', 'city', 'location'],
        email: ['email', 'emailaddress', 'email address', 'email_address', 'e-mail', 'mail'],
        phone: ['phone', 'phonenumber', 'phone number', 'phone_number', 'mobilenumber', 'mobile number', 'mobile', 'contact', 'contactnumber', 'contact number', 'contact_number'],
        salary: ['salary', 'income', 'monthly salary', 'ctc', 'pay'],
        joindate: ['joindate', 'join date', 'join_date', 'joiningdate', 'joining date', 'date of joining', 'startdate', 'start date'],
        relievingdate: ['relievingdate', 'relieving date', 'relieving_date', 'enddate', 'end date', 'last date', 'lastdate'],
        workdescription: ['workdescription', 'work description', 'work_description', 'jobdescription', 'job description', 'responsibilities'],
        fathername: ['fathername', 'father name', 'father_name', "father's name", 'parentname', 'parent name'],
        mothername: ['mothername', 'mother name', 'mother_name', "mother's name"],
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
        // Use lowercase field name as key into fieldToAliases
        const normalizedField = field.toLowerCase();
        const aliases = fieldToAliases[normalizedField] || [normalizedField];
        
        // Check if any record key matches any alias (both normalized to lowercase)
        const existsInRecord = recordKeys.some(key => 
          aliases.includes(key.toLowerCase().trim())
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
