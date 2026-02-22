import { CheckCircle, User, Building, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonInfoCardProps {
  record: Record<string, unknown>;
  templateName?: string;
  className?: string;
}

function getFieldValue(record: Record<string, unknown>, ...fieldNames: string[]): string {
  for (const field of fieldNames) {
    const value = record[field];
    if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }
  return '';
}

function getDisplayFields(record: Record<string, unknown>): { label: string; value: string; icon: React.ElementType }[] {
  const fields: { label: string; value: string; icon: React.ElementType }[] = [];

  // Name
  const name = getFieldValue(
    record,
    'fullName', 'full_name', 'name', 'employeeName', 'studentName',
    'Full Name', 'FullName', 'Name', 'Employee Name', 'Student Name'
  );
  if (name) {
    fields.push({ label: 'Name', value: name, icon: User });
  }

  // ID
  const id = getFieldValue(
    record,
    'employeeId', 'employee_id', 'studentId', 'student_id',
    'id', 'ID', 'Employee ID', 'Student ID', 'emp_id', 'roll_number', 'rollNumber'
  );
  if (id) {
    fields.push({ label: 'ID', value: id, icon: Building });
  }

  // Department or Course
  const dept = getFieldValue(
    record,
    'department', 'Department', 'dept', 'course', 'Course', 'designation', 'Designation'
  );
  if (dept) {
    const isCourse = record.course || record['Course'];
    fields.push({ 
      label: isCourse ? 'Course' : 'Department', 
      value: dept, 
      icon: isCourse ? GraduationCap : Building 
    });
  }

  return fields;
}

export function PersonInfoCard({ record, templateName, className }: PersonInfoCardProps) {
  const displayFields = getDisplayFields(record);

  return (
    <div className={cn(
      "rounded-lg border border-green-200 bg-green-50/50 overflow-hidden",
      className
    )}>
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide bg-green-100 text-green-700 flex items-center gap-2">
        <CheckCircle className="h-3 w-3" />
        Selected Person
        {templateName && <span className="font-normal">- {templateName}</span>}
      </div>
      <div className="p-3 space-y-2">
        {displayFields.map((field, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <field.icon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground">{field.label}:</span>
              <span className="ml-1 text-sm text-green-800 font-medium">
                {field.value}
              </span>
            </div>
          </div>
        ))}
        {displayFields.length === 0 && (
          <p className="text-sm text-muted-foreground">No person data available</p>
        )}
      </div>
    </div>
  );
}
