export interface EmployeeRecord {
  [key: string]: unknown;
}

export interface SearchResult {
  record: EmployeeRecord;
  matchType: 'exact-id' | 'exact-name' | 'partial';
  score: number;
}

export function searchEmployees(query: string, data: EmployeeRecord[]): SearchResult[] {
  if (!query.trim() || data.length === 0) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const record of data) {
    const id = String(record.employeeId || record.id || record.employee_id || record['Employee ID'] || record['Emp ID'] || '').toLowerCase();
    const name = String(record.fullName || record.name || record.full_name || record['Full Name'] || record['Name'] || record.employeeName || record['Employee Name'] || '').toLowerCase();
    const firstName = String(record.firstName || record.first_name || record['First Name'] || '').toLowerCase();
    const lastName = String(record.lastName || record.last_name || record['Last Name'] || '').toLowerCase();

    let matchType: SearchResult['matchType'] = 'partial';
    let score = 0;

    if (id && id === normalizedQuery) {
      matchType = 'exact-id';
      score = 100;
    } else if (name && name === normalizedQuery) {
      matchType = 'exact-name';
      score = 90;
    } else if (id && id.includes(normalizedQuery)) {
      matchType = 'partial';
      score = 70;
    } else if (name && name.includes(normalizedQuery)) {
      matchType = 'partial';
      score = 60;
    } else if (name) {
      const nameParts = normalizedQuery.split(' ');
      const allPartsMatch = nameParts.every(part => name.includes(part));
      if (allPartsMatch && nameParts.length > 0) {
        matchType = 'partial';
        score = 50;
      }
    } else if (firstName && lastName) {
      const fullName = `${firstName} ${lastName}`;
      if (fullName.includes(normalizedQuery)) {
        matchType = 'partial';
        score = 40;
      }
    }

    if (score > 0) {
      results.push({ record, matchType, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function getEmployeeDisplayName(record: EmployeeRecord): string {
  return String(
    record.fullName || 
    record.name || 
    record['Full Name'] || 
    record['Name'] || 
    record.employeeName ||
    record['Employee Name'] ||
    `${record.firstName || ''} ${record.lastName || ''}`.trim() ||
    'Unknown'
  );
}

export function getEmployeeId(record: EmployeeRecord): string | null {
  return String(
    record.employeeId || 
    record.id || 
    record.employee_id || 
    record['Employee ID'] || 
    record['Emp ID'] || 
    record['ID'] || 
    ''
  ) || null;
}

export function extractEmployeeFromMessage(
  message: string,
  data: EmployeeRecord[]
): { record: EmployeeRecord; field: string } | null {
  const results = searchEmployees(message, data);
  
  if (results.length === 0) return null;
  if (results.length === 1) {
    return { record: results[0].record, field: 'name' };
  }

  const queryLower = message.toLowerCase();
  for (const result of results) {
    const name = getEmployeeDisplayName(result.record).toLowerCase();
    if (queryLower.includes(name)) {
      return { record: result.record, field: 'name' };
    }
  }

  return { record: results[0].record, field: 'name' };
}
