import { Bot, User, CheckCircle, Circle } from 'lucide-react';
import { ChatMessage } from '@/hooks/useChatSessions';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

interface FieldInfo {
  name: string;
  value: string;
  isMissing: boolean;
}

interface ParsedFields {
  known: FieldInfo[];
  missing: FieldInfo[];
}

function formatFieldName(name: string): string {
  const fieldMap: Record<string, string> = {
    'fullName': 'Full Name',
    'name': 'Name',
    'gender': 'Gender',
    'type': 'Person Type',
    'person type': 'Person Type',
    'parentName': 'Parent Name',
    'parent name': 'Parent Name',
    'fatherName': 'Father Name',
    'motherName': 'Mother Name',
    'dateOfBirth': 'Date of Birth',
    'date of birth': 'Date of Birth',
    'dob': 'Date of Birth',
    'startDate': 'Start Date',
    'start date': 'Start Date',
    'dateOfJoining': 'Date of Joining',
    'date of joining': 'Date of Joining',
    'joiningDate': 'Joining Date',
    'endDate': 'End Date',
    'end date': 'End Date',
    'course': 'Course',
    'department': 'Department',
    'designation': 'Designation',
    'email': 'Email',
    'phone': 'Phone',
    'institutionName': 'Institution Name',
    'institution address': 'Institution Address',
    'purpose': 'Purpose',
    'date': 'Date',
  };
  
  const lower = name.toLowerCase();
  return fieldMap[lower] || name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function cleanValue(value: string): string {
  return value.replace(/\*\*/g, '').trim();
}

function parseFieldLists(content: string): ParsedFields | null {
  const known: FieldInfo[] = [];
  const missing: FieldInfo[] = [];
  
  const knownMatch = content.match(/###?\s*Known Information([\s\S]*?)(?=###?\s*Missing|###?\s*I need|$)/i);
  const missingMatch = content.match(/###?\s*Missing Information([\s\S]*?)$/i);
  
  if (!knownMatch && !missingMatch) {
    const lines = content.split('\n');
    let inMissingSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.includes('missing') || trimmed.includes('need')) {
        inMissingSection = true;
        continue;
      }
      if (trimmed === '' || trimmed.startsWith('#')) continue;
      
      const fieldMatch = line.match(/^[-*]\s*\*?([^:]+)\*?:\s*(.+)$/);
      if (fieldMatch) {
        const [, fieldName, fieldValue] = fieldMatch;
        if (inMissingSection || trimmed.includes('?')) {
          missing.push({ name: fieldName.trim(), value: cleanValue(fieldValue), isMissing: true });
        } else {
          known.push({ name: fieldName.trim(), value: cleanValue(fieldValue), isMissing: false });
        }
      }
    }
    
    if (known.length > 0 || missing.length > 0) {
      return { known, missing };
    }
    return null;
  }
  
  if (knownMatch) {
    const knownLines = knownMatch[1].split('\n');
    for (const line of knownLines) {
      const match = line.match(/^[-*]\s*\*?([^:]+)\*?:\s*(.+)$/);
      if (match) {
        known.push({ name: match[1].trim(), value: cleanValue(match[2]), isMissing: false });
      }
    }
  }
  
  if (missingMatch) {
    const missingLines = missingMatch[1].split('\n');
    for (const line of missingLines) {
      const match = line.match(/^[-*]\s*\*?([^:]+)\*?:\s*(.+)$/);
      if (match) {
        missing.push({ name: match[1].trim(), value: cleanValue(match[2]), isMissing: true });
      }
    }
  }
  
  if (known.length > 0 || missing.length > 0) {
    return { known, missing };
  }
  
  return null;
}

function formatText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>');
}

function formatMessage(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    
    if (trimmed === '') {
      elements.push(<br key={`br-${lineIndex}`} />);
      return;
    }

    // Handle unordered list items
    if (trimmed.match(/^[-*]\s/)) {
      const item = trimmed.replace(/^[-*]\s/, '');
      elements.push(
        <div key={`li-${lineIndex}`} className="flex gap-2 ml-2">
          <span className="text-blue-600">•</span>
          <span dangerouslySetInnerHTML={{ __html: formatText(item) }} />
        </div>
      );
      return;
    }

    // Handle ordered list items
    const orderedMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
    if (orderedMatch) {
      elements.push(
        <div key={`li-${lineIndex}`} className="flex gap-2 ml-2">
          <span className="text-muted-foreground">{orderedMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: formatText(orderedMatch[2]) }} />
        </div>
      );
      return;
    }

    // Handle GENERATE_DOCUMENT line - hide it from user view
    if (trimmed.includes('GENERATE_DOCUMENT:')) {
      return; // Don't show internal command to user
    }

    // Regular line with formatting
    elements.push(
      <span key={`span-${lineIndex}`} dangerouslySetInnerHTML={{ __html: formatText(trimmed) }} />
    );
    if (lineIndex < lines.length - 1) {
      elements.push(<br key={`br2-${lineIndex}`} />);
    }
  });

  return elements;
}

function FieldCard({ fields, title, type }: { fields: FieldInfo[]; title: string; type: 'known' | 'missing' }) {
  if (fields.length === 0) return null;
  
  return (
    <div className={cn("rounded-lg border overflow-hidden", type === 'known' ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50")}>
      <div className={cn("px-3 py-2 text-xs font-semibold uppercase tracking-wide", 
        type === 'known' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
        {title}
      </div>
      <div className="p-3 space-y-2">
        {fields.map((field, idx) => (
          <div key={idx} className="flex items-start gap-2">
            {type === 'known' ? (
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground">{formatFieldName(field.name)}:</span>
              <span className={cn("ml-1 text-sm", type === 'known' ? "text-green-800" : "text-amber-800 font-medium")}>
                {field.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const parsedFields = !isUser ? parseFieldLists(message.content) : null;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary/10' : 'bg-blue-100'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-blue-600" />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted rounded-tl-none'
        }`}
      >
        {parsedFields ? (
          <div className="space-y-2 text-sm">
            {parsedFields.known.length > 0 && (
              <FieldCard fields={parsedFields.known} title="Known Information" type="known" />
            )}
            {parsedFields.missing.length > 0 && (
              <FieldCard fields={parsedFields.missing} title="Missing Information" type="missing" />
            )}
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {formatMessage(message.content)}
          </div>
        )}
      </div>
    </div>
  );
}
