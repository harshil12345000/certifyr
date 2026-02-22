import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

export function FieldCollectionCard({
  missingFields,
  collectedFields,
  templateName,
  onFieldChange,
  onSubmit,
  className,
}: FieldCollectionCardProps) {
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalValues(collectedFields);
  }, [collectedFields]);

  const handleChange = (field: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
    onFieldChange(field, value);
  };

  const isReady = missingFields.every(field => 
    localValues[field] && localValues[field].trim() !== ''
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
          const currentValue = localValues[field] || '';
          
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
                <Textarea
                  value={currentValue}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={getFieldPlaceholder(field)}
                  className="bg-white min-h-[80px]"
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
