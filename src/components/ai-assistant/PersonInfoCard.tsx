import { CheckCircle, User, Building, GraduationCap, Mail, Phone, Calendar, MapPin, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonInfoCardProps {
  record: Record<string, unknown>;
  templateName?: string;
  className?: string;
}

const FIELD_ICONS: Record<string, React.ElementType> = {
  name: User,
  fullname: User,
  full_name: User,
  employeename: User,
  studentname: User,
  employeeid: CreditCard,
  employee_id: CreditCard,
  studentid: CreditCard,
  student_id: CreditCard,
  id: CreditCard,
  roll_number: CreditCard,
  department: Building,
  dept: Building,
  course: GraduationCap,
  designation: Building,
  email: Mail,
  phone: Phone,
  mobile: Phone,
  dateofbirth: Calendar,
  date_of_birth: Calendar,
  dob: Calendar,
  joiningdate: Calendar,
  date_of_joining: Calendar,
  startdate: Calendar,
  start_date: Calendar,
  address: MapPin,
  location: MapPin,
};

function formatFieldName(key: string): string {
  const fieldMap: Record<string, string> = {
    'fullName': 'Full Name',
    'full_name': 'Full Name',
    'employeeName': 'Employee Name',
    'studentName': 'Student Name',
    'employeeId': 'Employee ID',
    'employee_id': 'Employee ID',
    'studentId': 'Student ID',
    'student_id': 'Student ID',
    'roll_number': 'Roll Number',
    'dateOfBirth': 'Date of Birth',
    'date_of_birth': 'Date of Birth',
    'joiningDate': 'Joining Date',
    'date_of_joining': 'Joining Date',
    'startDate': 'Start Date',
    'start_date': 'Start Date',
    'parentName': "Parent's Name",
    'parent_name': "Parent's Name",
    'fatherName': "Father's Name",
    'father_name': "Father's Name",
    'motherName': "Mother's Name",
  };
  
  if (fieldMap[key]) return fieldMap[key];
  
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
}

function getIconForField(key: string): React.ElementType {
  const lowerKey = key.toLowerCase();
  return FIELD_ICONS[lowerKey] || User;
}

const EXCLUDED_FIELDS = new Set([
  'organization name',
  'institution name',
  'company name',
  'organization_name',
  'institution_name',
  'company_name',
]);

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

function getFieldPriority(key: string): number {
  const lowerKey = key.toLowerCase().replace(/[_\s]/g, '');
  
  for (let i = 0; i < FIELD_ORDER.length; i++) {
    const orderField = FIELD_ORDER[i].toLowerCase();
    if (lowerKey === orderField || lowerKey.includes(orderField)) {
      return i;
    }
  }
  return FIELD_ORDER.length;
}

export function PersonInfoCard({ record, templateName, className }: PersonInfoCardProps) {
  // Get all non-empty fields from the record
  const displayFields = Object.entries(record)
    .filter(([key, value]) => {
      // Exclude empty values
      if (value === null || value === undefined || value === '') return false;
      // Exclude organization-level fields
      if (EXCLUDED_FIELDS.has(key.toLowerCase())) return false;
      return true;
    })
    .sort(([keyA], [keyB]) => getFieldPriority(keyA) - getFieldPriority(keyB))
    .map(([key, value]) => ({
      label: formatFieldName(key),
      value: String(value),
      icon: getIconForField(key),
    }));

  return (
    <div className={cn(
      "rounded-lg border border-green-200 bg-green-50/50 overflow-hidden",
      className
    )}>
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide bg-green-100 text-green-700 flex items-center gap-2">
        <CheckCircle className="h-3 w-3" />
        Known Information
        {templateName && <span className="font-normal">- {templateName}</span>}
      </div>
      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
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
