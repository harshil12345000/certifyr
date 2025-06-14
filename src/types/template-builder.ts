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

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'dropdown'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'file'
  | 'image'
  | 'signature'
  | 'table'
  | 'qr'
  | 'barcode'
  | 'richtext'
  | 'institution'
  | 'userprofile'
  | 'calculated'
  | 'dynamiclist';

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string; // Added placeholder here as it's commonly used
  required?: boolean;
  options?: string[];
  [key: string]: any;
}

export interface Column {
  id: string;
  fields: Field[];
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  columns: Column[]; // Usually 2 columns
}

// TemplateElement is currently used as Section in TemplateDocument.
// Components like MetadataPanel were trying to use it as a generic visual element.
// For now, we strictly adhere to TemplateElement = Section.
export type TemplateElement = Section;

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
