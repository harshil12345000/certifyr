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
  return rows.map(row => {
    const mappedRow: Record<string, unknown> = {};
    
    for (const mapping of mappings) {
      const value = row[mapping.spreadsheetColumn];
      if (value !== undefined && value !== '') {
        mappedRow[mapping.targetField] = value;
      }
    }
    
    return mappedRow;
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
