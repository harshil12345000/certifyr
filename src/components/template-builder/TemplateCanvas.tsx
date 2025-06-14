import { useRef, useState, useEffect } from 'react';
import { TemplateElement } from '@/types/template-builder';
import { useDroppable, useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable as useDndDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Section, Column, Field } from '@/types/template-builder';
import { Button } from '@/components/ui/button';

interface TemplateCanvasProps {
  elements: Section[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<TemplateElement>) => void;
  onDeleteElement: (id: string) => void;
  onChange: () => void;
  onAddSection: () => void;
  onAddField: (sectionId: string, columnId: string) => void;
  onAddColumn: (sectionId: string) => void;
  onSelectField: (sectionId: string, columnId: string, fieldId: string) => void;
  onDeleteField: (sectionId: string, columnId: string, fieldId: string) => void;
  onDeleteSection: (sectionId: string) => void;
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onChange,
  onAddSection,
  onAddField,
  onAddColumn,
  onSelectField,
  onDeleteField,
  onDeleteSection
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { isOver, setNodeRef } = useDndDroppable({ id: 'canvas-dropzone' });
  const [propertyPanel, setPropertyPanel] = useState<{ field: Field; sectionId: string; columnId: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ sectionId: string; columnId: string; fieldId: string; type: 'label' | 'placeholder' } | null>(null);
  const [sectionTitleDraft, setSectionTitleDraft] = useState<string>('');
  
  // Effect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;
      
      // Delete with Delete or Backspace key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteElement(selectedElement);
      }
      
      // Arrow keys to move selected element
      const moveDelta = e.shiftKey ? 10 : 1; // Move faster with shift
      const element = elements.find(el => el.id === selectedElement);
      
      if (!element) return;
      
      if (e.key === 'ArrowUp') {
        onUpdateElement(selectedElement, { style: { ...element.style, y: Math.max(0, element.style.y - moveDelta) } });
        onChange();
      }
      if (e.key === 'ArrowDown') {
        onUpdateElement(selectedElement, { style: { ...element.style, y: element.style.y + moveDelta } });
        onChange();
      }
      if (e.key === 'ArrowLeft') {
        onUpdateElement(selectedElement, { style: { ...element.style, x: Math.max(0, element.style.x - moveDelta) } });
        onChange();
      }
      if (e.key === 'ArrowRight') {
        onUpdateElement(selectedElement, { style: { ...element.style, x: element.style.x + moveDelta } });
        onChange();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, elements, onDeleteElement, onUpdateElement, onChange]);
  
  // Handle element dragging
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectElement(id);
    
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    // Ensure element stays within canvas bounds
    const boundedX = Math.max(0, Math.min(newX, canvasRect.width - element.style.width));
    const boundedY = Math.max(0, Math.min(newY, canvasRect.height - element.style.height));
    
    onUpdateElement(selectedElement, {
      style: { ...element.style, x: boundedX, y: boundedY }
    });
  };
  
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onChange();
    }
  };
  
  // Handle canvas click (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };
  
  const handleFieldClick = (field: Field, sectionId: string, columnId: string) => {
    setPropertyPanel({ field, sectionId, columnId });
    onSelectField(sectionId, columnId, field.id);
  };

  const handlePropertyChange = (key: string, value: any) => {
    if (!propertyPanel) return;
    propertyPanel.field[key] = value;
    setPropertyPanel({ ...propertyPanel });
  };
  
  return (
    <div className="min-h-[400px] p-6 rounded-xl transition-all border-2 border-gray-200 bg-white relative">
      <div className="flex justify-end mb-4">
        <Button variant={previewMode ? 'default' : 'outline'} onClick={() => setPreviewMode(false)} className="mr-2">Edit</Button>
        <Button variant={previewMode ? 'outline' : 'default'} onClick={() => setPreviewMode(true)}>Preview</Button>
      </div>
      {previewMode ? (
        <FormPreview elements={elements} />
      ) : (
        <>
          {elements.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              No sections yet. <Button onClick={onAddSection}>Add Section</Button>
            </div>
          ) : (
            <div className="space-y-8">
              {elements.map((section, sIdx) => (
                <div key={section.id} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      {editingSectionId === section.id ? (
                        <input
                          className="text-xl font-bold mb-1 bg-white border-b border-primary-300 focus:outline-none focus:border-primary-500"
                          value={sectionTitleDraft}
                          autoFocus
                          onChange={e => setSectionTitleDraft(e.target.value)}
                          onBlur={() => {
                            elements[sIdx].title = sectionTitleDraft;
                            setEditingSectionId(null);
                            onChange();
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              elements[sIdx].title = sectionTitleDraft;
                              setEditingSectionId(null);
                              onChange();
                            }
                          }}
                        />
                      ) : (
                        <h2
                          className="text-xl font-bold mb-1 cursor-pointer hover:underline"
                          onClick={() => {
                            setEditingSectionId(section.id);
                            setSectionTitleDraft(section.title);
                          }}
                        >
                          {section.title}
                        </h2>
                      )}
                      {section.description && <div className="text-gray-500 text-sm">{section.description}</div>}
                    </div>
                    <Button size="sm" variant="destructive" className="ml-4" onClick={() => onDeleteSection(section.id)}>Delete Section</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {section.columns.map((col, cIdx) => (
                      <ColumnDropzone
                        key={col.id}
                        column={col}
                        sectionId={section.id}
                        onAddField={onAddField}
                        onFieldClick={handleFieldClick}
                        onDeleteField={onDeleteField}
                        editingField={editingField}
                        setEditingField={setEditingField}
                        sectionIdx={sIdx}
                        columnIdx={cIdx}
                        elements={elements}
                        onChange={onChange}
                      />
                    ))}
                    {section.columns.length < 2 && (
                      <Button size="sm" variant="outline" onClick={() => onAddColumn(section.id)}>+ Add Column</Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-center mt-8">
                <Button onClick={onAddSection}>+ Add Section</Button>
              </div>
            </div>
          )}
          {propertyPanel && (
            <div className="fixed top-0 right-0 w-80 h-full bg-white border-l shadow-lg p-6 z-50">
              <h3 className="font-bold text-lg mb-4">Field Properties</h3>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  className="w-full border px-2 py-1 rounded"
                  value={propertyPanel.field.label}
                  onChange={e => handlePropertyChange('label', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Placeholder</label>
                <input
                  className="w-full border px-2 py-1 rounded"
                  value={propertyPanel.field.placeholder || ''}
                  onChange={e => handlePropertyChange('placeholder', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full border px-2 py-1 rounded"
                  value={propertyPanel.field.type}
                  onChange={e => handlePropertyChange('type', e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="date">Date</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="radio">Radio</option>
                  <option value="textarea">Textarea</option>
                </select>
              </div>
              {['dropdown', 'radio'].includes(propertyPanel.field.type) && (
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Options (comma separated)</label>
                  <input
                    className="w-full border px-2 py-1 rounded"
                    value={propertyPanel.field.options?.join(', ') || ''}
                    onChange={e => handlePropertyChange('options', e.target.value.split(',').map(opt => opt.trim()))}
                  />
                </div>
              )}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Required</label>
                <input
                  type="checkbox"
                  checked={!!propertyPanel.field.required}
                  onChange={e => handlePropertyChange('required', e.target.checked)}
                />
          </div>
              <Button className="mt-4 w-full" variant="outline" onClick={() => setPropertyPanel(null)}>Close</Button>
      </div>
          )}
        </>
      )}
    </div>
  );
};

function ColumnDropzone({ column, sectionId, onAddField, onFieldClick, onDeleteField, editingField, setEditingField, sectionIdx, columnIdx, elements, onChange }) {
  const { isOver, setNodeRef } = useDndDroppable({ id: `column-dropzone-${column.id}` });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-4 rounded-lg border-2 transition-all ${isOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}
    >
      {column.fields.length === 0 ? (
        <div className="text-gray-400 text-center">Drag fields here</div>
      ) : (
        <div className="space-y-2">
          {column.fields.map((field, fIdx) => (
            <FieldCard
              key={field.id}
              field={field}
              onClick={() => onFieldClick(field, sectionId, column.id)}
              onDelete={() => onDeleteField(sectionId, column.id, field.id)}
              editingField={editingField}
              setEditingField={setEditingField}
              sectionId={sectionId}
              columnId={column.id}
              fieldIdx={fIdx}
              sectionIdx={sectionIdx}
              columnIdx={columnIdx}
              elements={elements}
              onChange={onChange}
            />
          ))}
        </div>
      )}
      <Button size="sm" className="mt-2" onClick={() => onAddField(sectionId, column.id)}>+ Add Field</Button>
    </div>
  );
}

function FieldCard({ field, onClick, onDelete, editingField, setEditingField, sectionId, columnId, fieldIdx, sectionIdx, columnIdx, elements, onChange }) {
  return (
    <div className="flex flex-col gap-1 p-2 border rounded mb-2 bg-blue-50 cursor-pointer hover:bg-primary-50">
      <div className="flex items-center justify-between">
        {editingField && editingField.sectionId === sectionId && editingField.columnId === columnId && editingField.fieldId === field.id && editingField.type === 'label' ? (
          <input
            className="font-medium text-sm mb-1 bg-white border-b border-primary-300 focus:outline-none focus:border-primary-500"
            value={field.label}
            autoFocus
            onChange={e => {
              elements[sectionIdx].columns[columnIdx].fields[fieldIdx].label = e.target.value;
              onChange();
            }}
            onBlur={() => setEditingField(null)}
            onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
          />
        ) : (
          <label
            className="font-medium text-sm mb-1 cursor-pointer hover:underline"
            onClick={e => { e.stopPropagation(); setEditingField({ sectionId, columnId, fieldId: field.id, type: 'label' }); }}
          >
            {field.label}
          </label>
        )}
        <Button size="xs" variant="destructive" className="ml-4 px-4" onClick={e => { e.stopPropagation(); onDelete(); }}>Delete</Button>
      </div>
      <FieldPreview
        field={field}
        editingField={editingField}
        setEditingField={setEditingField}
        sectionId={sectionId}
        columnId={columnId}
        fieldId={field.id}
        fieldIdx={fieldIdx}
        sectionIdx={sectionIdx}
        columnIdx={columnIdx}
        elements={elements}
        onChange={onChange}
      />
    </div>
  );
}

function FieldPreview({ field, editingField, setEditingField, sectionId, columnId, fieldId, fieldIdx, sectionIdx, columnIdx, elements, onChange }) {
  // For text-like fields, allow inline editing of placeholder
  const isEditingPlaceholder = editingField && editingField.sectionId === sectionId && editingField.columnId === columnId && editingField.fieldId === fieldId && editingField.type === 'placeholder';
  // Always use blank placeholder if not set
  const placeholderValue = typeof field.placeholder === 'string' ? field.placeholder : '';
  switch (field.type) {
    case 'text':
    case 'number':
    case 'email':
    case 'phone':
    case 'date':
    case 'textarea':
      return isEditingPlaceholder ? (
        <input
          className="border px-2 py-1 rounded w-full bg-white border-primary-300 focus:outline-none focus:border-primary-500"
          value={field.placeholder || ''}
          autoFocus
          onChange={e => {
            elements[sectionIdx].columns[columnIdx].fields[fieldIdx].placeholder = e.target.value;
            onChange();
          }}
          onBlur={() => setEditingField(null)}
          onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
        />
      ) : (
        <input
          className="border px-2 py-1 rounded w-full"
          placeholder={placeholderValue}
          disabled
          onClick={e => { e.stopPropagation(); setEditingField({ sectionId, columnId, fieldId, type: 'placeholder' }); }}
        />
      );
    case 'dropdown':
      return (
        <select className="border px-2 py-1 rounded w-full" disabled>
          {(field.options || []).map((opt, i) => <option key={i}>{opt}</option>)}
        </select>
      );
    case 'checkbox':
      return <label className="flex items-center"><input type="checkbox" disabled className="mr-2" />{field.label}</label>;
    case 'radio':
      return (
        <div>
          {(field.options || []).map((opt, i) => (
            <label key={i} className="mr-4"><input type="radio" disabled className="mr-1" />{opt}</label>
          ))}
        </div>
      );
    default:
      return <span>{field.label}</span>;
  }
}

// FormPreview renders the form as a user would see it (no edit/delete, enabled inputs)
function FormPreview({ elements }) {
  return (
    <form className="space-y-8">
      {elements.map(section => (
        <div key={section.id} className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">{section.title}</h2>
            {section.description && <div className="text-gray-500 text-sm">{section.description}</div>}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {section.columns.map(col => (
              <div key={col.id} className="space-y-4">
                {col.fields.map(field => (
                  <div key={field.id} className="flex flex-col gap-1">
                    <label className="font-medium text-sm mb-1">{field.label}</label>
                    <FieldInput field={field} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </form>
  );
}

// FieldInput renders enabled input for preview mode
function FieldInput({ field }) {
  switch (field.type) {
    case 'text':
      return <input className="border px-2 py-1 rounded w-full" placeholder={field.placeholder || field.label} />;
    case 'number':
      return <input className="border px-2 py-1 rounded w-full" type="number" placeholder={field.placeholder || field.label} />;
    case 'email':
      return <input className="border px-2 py-1 rounded w-full" type="email" placeholder={field.placeholder || field.label} />;
    case 'phone':
      return <input className="border px-2 py-1 rounded w-full" type="tel" placeholder={field.placeholder || field.label} />;
    case 'date':
      return <input className="border px-2 py-1 rounded w-full" type="date" placeholder={field.placeholder || field.label} />;
    case 'dropdown':
      return (
        <select className="border px-2 py-1 rounded w-full">
          <option value="">Select...</option>
          {(field.options || []).map((opt, i) => <option key={i}>{opt}</option>)}
        </select>
      );
    case 'checkbox':
      return <label className="flex items-center"><input type="checkbox" className="mr-2" />{field.label}</label>;
    case 'radio':
      return (
        <div>
          {(field.options || []).map((opt, i) => (
            <label key={i} className="mr-4"><input type="radio" name={field.id} className="mr-1" />{opt}</label>
          ))}
        </div>
      );
    case 'textarea':
      return <textarea className="border px-2 py-1 rounded w-full" placeholder={field.placeholder || field.label} />;
    default:
      return <span>{field.label}</span>;
  }
}

