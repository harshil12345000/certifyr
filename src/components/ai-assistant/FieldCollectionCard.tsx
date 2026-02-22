import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldCollectionCardProps {
  missingFields: string[];
  collectedFields: Record<string, string>;
  templateName: string;
  onFieldChange: (field: string, value: string) => void;
  onSubmit: () => void;
  className?: string;
}

function formatFieldName(name: string): string {
  const fieldMap: Record<string, string> = {
    'fullName': 'Full Name',
    'name': 'Name',
    'gender': 'Gender',
    'type': 'Person Type',
    'personType': 'Person Type',
    'parentName': "Parent's Name",
    'parentname': "Parent's Name",
    'fatherName': "Father's Name",
    'motherName': "Mother's Name",
    'dateOfBirth': 'Date of Birth',
    'startDate': 'Start Date',
    'dateOfJoining': 'Date of Joining',
    'joiningDate': 'Joining Date',
    'endDate': 'End Date',
    'course': 'Course',
    'courseOrDesignation': 'Course/Designation',
    'department': 'Department',
    'designation': 'Designation',
    'purpose': 'Purpose',
    'employeeId': 'Employee ID',
    'studentId': 'Student ID',
    'institutionName': 'Institution Name',
    'place': 'Place',
    'date': 'Date',
  };
  
  const lower = name.toLowerCase();
  return fieldMap[lower] || fieldMap[name] || name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function getFieldType(fieldName: string): 'text' | 'textarea' | 'select' | 'date' {
  const textFields = ['purpose', 'reason', 'conduct', 'workDescription', 'benefits', 'jobResponsibilities'];
  const selectFields = ['gender', 'type', 'personType'];
  const dateFields = ['date', 'startDate', 'endDate', 'dateOfBirth', 'joiningDate', 'startDate', 'joiningDate'];
  
  const lower = fieldName.toLowerCase();
  if (selectFields.some(f => lower.includes(f))) return 'select';
  if (dateFields.some(f => lower.includes(f))) return 'date';
  if (textFields.some(f => lower.includes(f))) return 'textarea';
  return 'text';
}

function getFieldPlaceholder(fieldName: string): string {
  const placeholders: Record<string, string> = {
    'purpose': 'e.g., passport application, bank account, visa processing',
    'reason': 'e.g., higher studies, job change, transfer',
    'conduct': 'Describe the character and conduct',
    'workDescription': 'Describe job responsibilities and achievements',
    'designation': 'e.g., Software Engineer, Manager, Teacher',
    'course': 'e.g., B.Sc Computer Science, MBA',
    'institutionName': 'School/College/Company name',
    'place': 'City, Country',
  };
  
  const lower = fieldName.toLowerCase();
  for (const [key, placeholder] of Object.entries(placeholders)) {
    if (lower.includes(key)) return placeholder;
  }
  return `Enter ${formatFieldName(fieldName).toLowerCase()}`;
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      className={cn(
        'flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden',
        className
      )}
      style={{ minHeight: '36px', maxHeight: '120px' }}
    />
  );
}

export function FieldCollectionCard({
  missingFields,
  collectedFields,
  templateName,
  onFieldChange,
  onSubmit,
  className,
}: FieldCollectionCardProps) {
  const handleChange = (field: string, value: string) => {
    onFieldChange(field, value);
  };

  const isReady = missingFields.every(field => 
    collectedFields[field] && collectedFields[field].trim() !== ''
  );

  if (missingFields.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "rounded-lg border border-amber-200 bg-amber-50/50 overflow-hidden",
      className
    )}>
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 flex items-center gap-2">
        <AlertCircle className="h-3 w-3" />
        Additional Information Needed
        <span className="font-normal">- {templateName}</span>
      </div>
      
      <div className="p-3 space-y-3">
        <p className="text-xs text-muted-foreground mb-3">
          Please provide the following information to generate the certificate:
        </p>
        
        {missingFields.map((field) => {
          const fieldType = getFieldType(field);
            const currentValue = collectedFields[field] || '';
          
          return (
            <div key={field} className="space-y-1">
              <label className="text-xs font-medium text-amber-800">
                {formatFieldName(field)}
                <span className="text-red-500 ml-1">*</span>
              </label>
              
              {fieldType === 'select' ? (
                <Select value={currentValue} onValueChange={(value) => handleChange(field, value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={`Select ${formatFieldName(field)}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.toLowerCase() === 'gender' && (
                      <>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </>
                    )}
                    {field.toLowerCase() === 'type' || field.toLowerCase() === 'persontype' ? (
                      <>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </>
                    ) : null}
                  </SelectContent>
                </Select>
                ) : fieldType === 'textarea' ? (
                  <AutoResizeTextarea
                    value={currentValue}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={getFieldPlaceholder(field)}
                  />
              ) : (
                <Input
                  type={fieldType === 'date' ? 'date' : 'text'}
                  value={currentValue}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={getFieldPlaceholder(field)}
                  className="bg-white"
                />
              )}
            </div>
          );
        })}
        
        <Button
          onClick={onSubmit}
          disabled={!isReady}
          className="w-full mt-4"
          size="sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate {templateName}
        </Button>
        
        {!isReady && (
          <p className="text-xs text-muted-foreground text-center">
            Please fill in all required fields
          </p>
        )}
      </div>
    </div>
  );
}
