
// Element Types
export type ElementType = 
  | 'text' 
  | 'heading' 
  | 'placeholder'
  | 'image'
  | 'signature'
  | 'table'
  | 'qr'
  | 'divider';

// Element Style Properties
export interface ElementStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  padding?: number;
  alignment?: 'left' | 'center' | 'right';
  opacity?: number;
}

// Field Validation Rules
export interface ValidationRule {
  type: 'required' | 'regex' | 'minLength' | 'maxLength' | 'min' | 'max';
  value?: string | number;
  message: string;
}

// Template Element
export interface TemplateElement {
  id: string;
  type: ElementType;
  content: string;
  style: ElementStyle;
  metadata?: {
    fieldName?: string;
    fieldType?: 'text' | 'number' | 'date' | 'select' | 'file' | 'checkbox';
    placeholder?: string;
    options?: string[];
    validation?: ValidationRule[];
    description?: string;
    isRequired?: boolean;
  };
}

// Template Document
export interface TemplateDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  elements: TemplateElement[];
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'draft' | 'review' | 'published';
  isPublic: boolean;
  accessRoles: string[];
  regions: string[];
  orientation: 'portrait' | 'landscape';
  size: 'A4' | 'Letter' | 'Legal';
}
