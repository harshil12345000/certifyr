import { read, utils } from 'xlsx';

export interface ParsedSpreadsheet {
  headers: string[];
  rows: Record<string, unknown>[];
  fileName: string;
  rowCount: number;
}

export interface FieldMapping {
  spreadsheetColumn: string;
  targetField: string;
}

const COMMON_FIELD_MAPPINGS: Record<string, string[]> = {
  fullName: ['full name', 'name', 'fullname', 'employee name', 'employee_name', 'student name', 'student_name', 'candidate name'],
  firstName: ['first name', 'fname', 'firstname', 'first_name'],
  lastName: ['last name', 'lname', 'lastname', 'last_name'],
  email: ['email', 'email address', 'email_address', 'e-mail', 'mail'],
  employeeId: ['employee id', 'employee_id', 'emp id', 'empid', 'emp_id', 'staff id', 'staff_id', 'id', 'student id', 'student_id', 'registration number', 'reg no'],
  department: ['department', 'dept', 'dept.', 'division', 'unit'],
  designation: ['designation', 'title', 'position', 'role', 'job title'],
  course: ['course', 'course name', 'course_name', 'program', 'programme', 'program name'],
  gender: ['gender', 'sex'],
  parentName: ['parent name', 'father name', "father's name", 'mother name', "mother's name", 'guardian name'],
  address: ['address', 'location', 'residential address', 'permanent address'],
  phone: ['phone', 'phone number', 'phone_no', 'mobile', 'contact', 'contact number', 'mobile number'],
  dateOfBirth: ['date of birth', 'dob', 'birth date', 'birthday', 'dob'],
  joiningDate: ['joining date', 'date of joining', 'doj', 'start date', 'start_date', 'admission date'],
  salary: ['salary', 'income', 'monthly salary', 'ctc', 'pay'],
};

const FIELD_ORDER: string[] = [
  'fullName',
  'firstName',
  'lastName',
  'email',
  'phone',
  'gender',
  'parentName',
  'designation',
  'department',
  'course',
  'salary',
  'address',
  'dateOfBirth',
  'joiningDate',
];

function convertToDateFormat(value: unknown): string | unknown {
  if (value === null || value === undefined || value === '') {
    return value;
  }

  if (value instanceof Date) {
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    return `${day}/${month}/${year}`;
  }

  if (typeof value === 'string') {
    const datePatterns = [
      { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, format: 'DD/MM/YYYY' },
      { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, format: 'DD-MM-YYYY' },
      { regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, format: 'YYYY/MM/DD' },
      { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, format: 'YYYY-MM-DD' },
      { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, format: 'DD/MM/YY' },
    ];

    for (const pattern of datePatterns) {
      const match = value.match(pattern.regex);
      if (match) {
        let day: string, month: string, year: string;

        if (pattern.format === 'DD/MM/YYYY' || pattern.format === 'DD-MM-YYYY') {
          day = match[1].padStart(2, '0');
          month = match[2].padStart(2, '0');
          year = match[3];
          if (year.length === 2) {
            year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
          }
        } else if (pattern.format === 'YYYY/MM/DD' || pattern.format === 'YYYY-MM-DD') {
          year = match[1];
          month = match[2].padStart(2, '0');
          day = match[3].padStart(2, '0');
        } else {
          day = match[1].padStart(2, '0');
          month = match[2].padStart(2, '0');
          year = match[3];
          year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }

        return `${day}/${month}/${year}`;
      }
    }

    const parsed = Date.parse(value);
    if (!isNaN(parsed)) {
      const date = new Date(parsed);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  return value;
}

export async function parseSpreadsheet(file: File): Promise<ParsedSpreadsheet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = utils.sheet_to_json(worksheet, { defval: '' });
        
        if (jsonData.length === 0) {
          reject(new Error('No data found in spreadsheet'));
          return;
        }
        
        const headers = Object.keys(jsonData[0] as Record<string, unknown>);
        const rows = jsonData as Record<string, unknown>[];
        
        resolve({
          headers,
          rows,
          fileName: file.name,
          rowCount: rows.length,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

export function autoDetectFieldMappings(headers: string[]): FieldMapping[] {
  const mappings: FieldMapping[] = [];
  
  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim();
    
    for (const [targetField, variations] of Object.entries(COMMON_FIELD_MAPPINGS)) {
      if (variations.some(v => normalizedHeader === v || normalizedHeader.includes(v))) {
        mappings.push({
          spreadsheetColumn: header,
          targetField,
        });
        break;
      }
    }
  }
  
  return mappings;
}

export function applyFieldMappings(
  rows: Record<string, unknown>[],
  mappings: FieldMapping[]
): Record<string, unknown>[] {
  const dateFields = ['dateOfBirth', 'joiningDate'];
  
  return rows.map(row => {
    const mappedRow: Record<string, unknown> = {};
    const orderedRow: Record<string, unknown> = {};
    
    for (const mapping of mappings) {
      const value = row[mapping.spreadsheetColumn];
      if (value !== undefined && value !== '') {
        const processedValue = dateFields.includes(mapping.targetField)
          ? convertToDateFormat(value)
          : value;
        mappedRow[mapping.targetField] = processedValue;
      }
    }
    
    for (const field of FIELD_ORDER) {
      if (field in mappedRow) {
        orderedRow[field] = mappedRow[field];
      }
    }
    
    for (const key of Object.keys(mappedRow)) {
      if (!FIELD_ORDER.includes(key)) {
        orderedRow[key] = mappedRow[key];
      }
    }
    
    return orderedRow;
  });
}

export function parseCSV(file: File): Promise<ParsedSpreadsheet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          reject(new Error('No data found in CSV'));
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows: Record<string, unknown>[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row: Record<string, unknown> = {};
          
          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              row[header] = values[index].trim().replace(/^"|"$/g, '');
            }
          });
          
          if (Object.keys(row).length > 0) {
            rows.push(row);
          }
        }
        
        resolve({
          headers,
          rows,
          fileName: file.name,
          rowCount: rows.length,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}
