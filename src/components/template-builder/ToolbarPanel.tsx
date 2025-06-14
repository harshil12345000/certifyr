import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateElement, ElementType } from '@/types/template-builder';
import { v4 as uuidv4 } from 'uuid';
import { 
  Type as Text, 
  Heading1, 
  Type as FormInput, 
  Image, 
  FileSignature, 
  Table, 
  QrCode, 
  Minus as SeparatorHorizontal
} from 'lucide-react';

interface ToolbarPanelProps {
  onAddElement: (element: TemplateElement) => void;
  draggable: boolean;
  onDragStartSidebar: (type: ElementType) => void;
}

const FIELD_CATEGORIES = [
  {
    name: 'Basic',
    fields: [
      { type: 'text', label: 'Text' },
      { type: 'number', label: 'Number' },
      { type: 'email', label: 'Email' },
      { type: 'phone', label: 'Phone' },
      { type: 'date', label: 'Date' },
      { type: 'dropdown', label: 'Dropdown' },
      { type: 'checkbox', label: 'Checkbox' },
      { type: 'radio', label: 'Radio' },
      { type: 'textarea', label: 'Textarea' },
    ],
  },
  {
    name: 'Advanced',
    fields: [
      { type: 'file', label: 'File Upload' },
      { type: 'image', label: 'Image' },
      { type: 'signature', label: 'Signature Pad' },
      { type: 'table', label: 'Table' },
      { type: 'qr', label: 'QR Code' },
      { type: 'barcode', label: 'Barcode' },
      { type: 'richtext', label: 'Rich Text' },
    ],
  },
  {
    name: 'Special',
    fields: [
      { type: 'institution', label: 'Institution Name' },
      { type: 'userprofile', label: 'User Profile Field' },
      { type: 'calculated', label: 'Calculated Field' },
      { type: 'dynamiclist', label: 'Dynamic List' },
    ],
  },
];

const PRESETS = [
  { name: 'Employee Details', fields: ['text', 'email', 'phone', 'date'] },
  { name: 'Signatory Block', fields: ['signature', 'text'] },
];

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({ onAddElement, draggable, onDragStartSidebar }) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'presets'>('elements');
  const [search, setSearch] = useState('');
  
  const createBaseElement = (type: ElementType, content: string): TemplateElement => {
    return {
      id: uuidv4(),
      type,
      content,
      style: {
        x: 50,
        y: 50,
        width: 200,
        height: type === 'divider' ? 2 : 50,
        fontSize: type === 'heading' ? 18 : 12,
        fontFamily: 'Arial',
        color: '#000000',
        alignment: 'left',
      }
    };
  };
  
  const elementTypes = [
    { id: 'text', name: 'Text Block', icon: <Text size={16} />, type: 'text' as ElementType, content: 'Enter your text here' },
    { id: 'heading', name: 'Heading', icon: <Heading1 size={16} />, type: 'heading' as ElementType, content: 'Heading Text' },
    { id: 'placeholder', name: 'Placeholder Field', icon: <FormInput size={16} />, type: 'placeholder' as ElementType, content: 'Field' },
    { id: 'image', name: 'Image', icon: <Image size={16} />, type: 'image' as ElementType, content: '' },
    { id: 'signature', name: 'Signature', icon: <FileSignature size={16} />, type: 'signature' as ElementType, content: 'Signature' },
    { id: 'table', name: 'Table', icon: <Table size={16} />, type: 'table' as ElementType, content: 'Table' },
    { id: 'qr', name: 'QR Code', icon: <QrCode size={16} />, type: 'qr' as ElementType, content: 'QR' },
    { id: 'divider', name: 'Divider', icon: <SeparatorHorizontal size={16} />, type: 'divider' as ElementType, content: '' },
  ];
  
  const handleAddElement = (elementData: { type: ElementType, content: string }) => {
    onAddElement(createBaseElement(elementData.type, elementData.content));
  };
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={activeTab === 'elements' ? 'default' : 'outline'} onClick={() => setActiveTab('elements')}>Elements</Button>
        <Button size="sm" variant={activeTab === 'presets' ? 'default' : 'outline'} onClick={() => setActiveTab('presets')}>Presets</Button>
      </div>
      {activeTab === 'elements' ? (
        <>
          <input
            className="w-full mb-3 px-2 py-1 border rounded"
            placeholder="Search elements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {FIELD_CATEGORIES.map(cat => (
            <div key={cat.name} className="mb-4">
              <div className="font-semibold text-sm mb-2 text-gray-700">{cat.name}</div>
              <div className="flex flex-col gap-2">
                {cat.fields.filter(f => f.label.toLowerCase().includes(search.toLowerCase())).map(f => (
                  <DraggableField key={f.type} field={f} draggable={draggable} onDragStartSidebar={onDragStartSidebar} onAddElement={onAddElement} />
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div>
          {PRESETS.map(preset => (
            <div key={preset.name} className="mb-3 p-2 border rounded bg-gray-50 cursor-pointer hover:bg-primary-50" onClick={() => onAddElement({ id: Date.now().toString(), type: 'preset', label: preset.name, fields: preset.fields })}>
              {preset.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function DraggableField({ field, draggable, onDragStartSidebar, onAddElement }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: field.type,
    data: { fromSidebar: true },
    disabled: !draggable,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 px-2 py-2 rounded border cursor-pointer bg-white hover:bg-primary-50 transition ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => !draggable && onAddElement({ id: Date.now().toString(), type: field.type, label: field.label })}
      onMouseDown={() => draggable && onDragStartSidebar && onDragStartSidebar(field.type)}
    >
      <span className="font-bold text-primary-500">{field.label[0]}</span>
      <span>{field.label}</span>
    </div>
  );
}
