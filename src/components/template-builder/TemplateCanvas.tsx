import { useRef, useState, useEffect } from 'react';
import { Section, Column, Field } from '@/types/template-builder';
import { useDroppable } from '@dnd-kit/core'; // Changed from useDndDroppable and removed SortableContext, verticalListSortingStrategy as they are not used for sections here
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface TemplateCanvasProps {
  elements: Section[];
  onChange: () => void;
  onAddSection: () => void;
  onAddField: (sectionId: string, columnId: string, fieldType?: string) => void;
  onAddColumn: (sectionId: string) => void;
  onSelectField: (sectionId: string, columnId: string, fieldId: string) => void;
  onDeleteField: (sectionId: string, columnId: string, fieldId: string) => void;
  onDeleteSection: (sectionId: string) => void;
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  elements,
  onChange,
  onAddSection,
  onAddField,
  onAddColumn,
  onSelectField,
  onDeleteField,
  onDeleteSection
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { setNodeRef: setCanvasNodeRef } = useDroppable({ id: 'canvas-dropzone' }); // canvas-dropzone for dropping new fields from toolbar
  const [propertyPanel, setPropertyPanel] = useState<{ field: Field; sectionId: string; columnId: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ sectionId: string; columnId: string; fieldId: string; type: 'label' | 'placeholder' } | null>(null);
  const [sectionTitleDraft, setSectionTitleDraft] = useState<string>('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [elements, onChange]);
  

  const handleCanvasClick = (e: React.MouseEvent) => {
  };
  
  const handleFieldClick = (field: Field, sectionId: string, columnId: string) => {
    setPropertyPanel({ field, sectionId, columnId });
    onSelectField(sectionId, columnId, field.id);
  };

  const handlePropertyChange = (key: string, value: any) => {
    if (!propertyPanel) return;
    const updatedField = { ...propertyPanel.field, [key]: value };
    
    const sectionIndex = elements.findIndex(s => s.id === propertyPanel.sectionId);
    if (sectionIndex === -1) return;
    const columnIndex = elements[sectionIndex].columns.findIndex(c => c.id === propertyPanel.columnId);
    if (columnIndex === -1) return;
    const fieldIndex = elements[sectionIndex].columns[columnIndex].fields.findIndex(f => f.id === propertyPanel.field.id);
    if (fieldIndex === -1) return;

    elements[sectionIndex].columns[columnIndex].fields[fieldIndex] = updatedField;
    
    setPropertyPanel({ ...propertyPanel, field: updatedField });
    onChange(); // Signal that changes have been made
  };
  
  return (
    <div 
      ref={canvasRef} 
      className="min-h-[400px] p-6 rounded-xl transition-all border-2 border-gray-200 bg-white relative"
      onClick={handleCanvasClick}
    >
      <div className="flex justify-end mb-4">
        <Button variant={!previewMode ? "default" : "outline"} onClick={() => setPreviewMode(false)} className="mr-2">Edit</Button>
        <Button variant={previewMode ? "default" : "outline"} onClick={() => setPreviewMode(true)}>Preview</Button>
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
            <div ref={setCanvasNodeRef} className="space-y-8">
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
                            const newElements = [...elements];
                            newElements[sIdx].title = sectionTitleDraft;
                            onChange();
                            setEditingSectionId(null);
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const newElements = [...elements];
                              newElements[sIdx].title = sectionTitleDraft;
                              onChange();
                              setEditingSectionId(null);
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="flex items-center justify-center min-h-[120px] border-2 border-dashed border-gray-300 rounded-lg">
                        <Button size="sm" variant="outline" onClick={() => onAddColumn(section.id)}>+ Add Column</Button>
                      </div>
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
            <div className="fixed top-0 right-0 w-80 h-full bg-white border-l shadow-lg p-6 z-50 overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Field Properties</h3>
              <button onClick={() => setPropertyPanel(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
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
                  <option value="file">File</option>
                  <option value="image">Image</option>
                  <option value="signature">Signature</option>
                  <option value="table">Table</option>
                  <option value="qr">QR Code</option>
                  <option value="barcode">Barcode</option>
                  <option value="richtext">Rich Text</option>
                  <option value="institution">Institution</option>
                  <option value="userprofile">User Profile</option>
                  <option value="calculated">Calculated</option>
                  <option value="dynamiclist">Dynamic List</option>
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
              <div className="flex items-center mt-2 mb-2">
                <input
                  id="fieldRequired"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  checked={!!propertyPanel.field.required}
                  onChange={e => handlePropertyChange('required', e.target.checked)}
                />
                <label htmlFor="fieldRequired" className="ml-2 block text-sm font-medium">Required</label>
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
  const { isOver, setNodeRef } = useDroppable({ id: `column-dropzone-${column.id}` });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-4 rounded-lg border-2 transition-all ${isOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}
    >
      {column.fields.length === 0 ? (
        <div className="text-gray-400 text-center">Drag fields here or <Button size="sm" variant="link" className="p-0 h-auto" onClick={() => onAddField(sectionId, column.id)}>add field</Button></div>
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
      <Button size="sm" className="mt-2 w-full" onClick={() => onAddField(sectionId, column.id)}>+ Add Field</Button>
    </div>
  );
}

function FieldCard({ field, onClick, onDelete, editingField, setEditingField, sectionId, columnId, fieldIdx, sectionIdx, columnIdx, elements, onChange }) {
  return (
    <div className="flex flex-col gap-1 p-3 border rounded shadow-sm mb-2 bg-white cursor-pointer hover:bg-blue-50 transition-colors" onClick={onClick}>
      <div className="flex items-center justify-between mb-1">
        {editingField && editingField.sectionId === sectionId && editingField.columnId === columnId && editingField.fieldId === field.id && editingField.type === 'label' ? (
          <input
            className="font-medium text-sm bg-white border-b border-primary-300 focus:outline-none focus:border-primary-500 flex-grow"
            value={field.label}
            autoFocus
            onClick={e => e.stopPropagation()}
            onChange={e => {
              const newElements = [...elements];
              newElements[sectionIdx].columns[columnIdx].fields[fieldIdx].label = e.target.value;
              onChange();
            }}
            onBlur={() => setEditingField(null)}
            onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
          />
        ) : (
          <label
            className="font-medium text-sm cursor-pointer hover:underline flex-grow"
            onClick={e => { e.stopPropagation(); setEditingField({ sectionId, columnId, fieldId: field.id, type: 'label' }); }}
          >
            {field.label || 'Untitled Field'}
          </label>
        )}
        <Button size="sm" variant="ghost" className="ml-2 px-1 py-0 h-auto text-red-500 hover:text-red-700" onClick={e => { e.stopPropagation(); onDelete(); }}>
          <Trash size={14}/>
        </Button>
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
      <div className="text-xs text-gray-400 mt-1">Type: {field.type} {field.required && <span className="text-red-500 font-semibold">*Required</span>}</div>
    </div>
  );
}

function FieldPreview({ field, editingField, setEditingField, sectionId, columnId, fieldId, fieldIdx, sectionIdx, columnIdx, elements, onChange }) {
  const isEditingPlaceholder = editingField && editingField.sectionId === sectionId && editingField.columnId === columnId && editingField.fieldId === fieldId && editingField.type === 'placeholder';
  const placeholderValue = typeof field.placeholder === 'string' ? field.placeholder : '';
  
  const commonInputClasses = "border px-2 py-1 rounded w-full text-sm";
  const disabledInputClasses = `${commonInputClasses} bg-gray-100 text-gray-500 cursor-not-allowed`;
  const editablePlaceholderInputClasses = `${commonInputClasses} bg-white border-primary-300 focus:outline-none focus:border-primary-500`;

  const handlePlaceholderEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingField({ sectionId, columnId, fieldId, type: 'placeholder' });
  };

  switch (field.type) {
    case 'text':
    case 'number':
    case 'email':
    case 'phone':
    case 'date':
    case 'textarea':
      return isEditingPlaceholder ? (
        <input
          className={editablePlaceholderInputClasses}
          value={field.placeholder || ''}
          autoFocus
          onClick={e => e.stopPropagation()}
          onChange={e => {
            const newElements = [...elements];
            newElements[sectionIdx].columns[columnIdx].fields[fieldIdx].placeholder = e.target.value;
            onChange();
          }}
          onBlur={() => setEditingField(null)}
          onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
        />
      ) : (
        <input
          className={disabledInputClasses}
          placeholder={placeholderValue || `Click to edit placeholder for ${field.label}`}
          disabled
          onClick={handlePlaceholderEditStart}
        />
      );
    case 'dropdown':
      return (
        <select className={disabledInputClasses} disabled onClick={handlePlaceholderEditStart}>
          <option value="">{placeholderValue || 'Select an option (preview)'}</option>
          {(field.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      );
    case 'checkbox':
      return (
        <label className="flex items-center text-sm text-gray-700 cursor-pointer" onClick={handlePlaceholderEditStart}>
            <input type="checkbox" disabled className="mr-2" />
            {isEditingPlaceholder ? (
                 <input
                    className="text-sm bg-white border-b border-primary-300 focus:outline-none focus:border-primary-500"
                    value={field.placeholder || ''}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                        const newElements = [...elements];
                        newElements[sectionIdx].columns[columnIdx].fields[fieldIdx].placeholder = e.target.value;
                        onChange();
                    }}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
                />
            ) : (
                <span>{placeholderValue || field.label}</span>
            )}
        </label>
      );
    case 'radio':
      return (
        <div className="text-sm text-gray-700" onClick={handlePlaceholderEditStart}>
          {(field.options || []).map((opt, i) => (
            <label key={i} className="mr-4"><input type="radio" name={`${field.id}-preview-edit`} disabled className="mr-1" />{opt}</label>
          ))}
          {(!field.options || field.options.length === 0) && (isEditingPlaceholder ? (
            <input
                className="text-sm bg-white border-b border-primary-300 focus:outline-none focus:border-primary-500"
                value={field.placeholder || 'Radio options text'}
                autoFocus
                onClick={e => e.stopPropagation()}
                onChange={e => {
                    const newElements = [...elements];
                    newElements[sectionIdx].columns[columnIdx].fields[fieldIdx].placeholder = e.target.value;
                    onChange();
                }}
                onBlur={() => setEditingField(null)}
                onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
            />
          ) : (
            <span>{placeholderValue || 'Radio options (Click to edit placeholder)'}</span>
          )
        )}
        </div>
      );
    default:
      return (
        <span className="text-sm text-gray-500 p-2 border rounded w-full block bg-gray-100 cursor-pointer" onClick={handlePlaceholderEditStart}>
             {isEditingPlaceholder ? (
                <input
                    className="text-sm bg-white border-b border-primary-300 focus:outline-none focus:border-primary-500 w-full"
                    value={field.placeholder || field.label}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                        const newElements = [...elements];
                        newElements[sectionIdx].columns[columnIdx].fields[fieldIdx].placeholder = e.target.value;
                        onChange();
                    }}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
                />
             ) : (
                placeholderValue || field.label
             )} ({field.type})
        </span>
      );
  }
}


function FormPreview({ elements }: { elements: Section[] }) {
  return (
    <form className="space-y-8 p-4 bg-gray-100 rounded-lg">
      {elements.map(section => (
        <div key={section.id} className="bg-white rounded-lg p-6 shadow">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">{section.title}</h2>
            {section.description && <p className="text-gray-600 text-sm">{section.description}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {section.columns.map(col => (
              <div key={col.id} className="space-y-6">
                {col.fields.map(field => (
                  <div key={field.id} className="flex flex-col gap-1">
                    <label htmlFor={field.id} className="font-medium text-sm text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <FieldInput field={field} />
                  </div>
                ))}
              </div>
            ))}
            {section.columns.length === 0 && section.fields?.length > 0 && (
                <div className="space-y-6">
                 {(section.fields as Field[]).map(field => (
                    <div key={field.id} className="flex flex-col gap-1">
                        <label htmlFor={field.id} className="font-medium text-sm text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <FieldInput field={field} />
                    </div>
                 ))}
                </div>
            )}
          </div>
        </div>
      ))}
      {elements.length === 0 && (
        <p className="text-center text-gray-500">This form is empty.</p>
      )}
    </form>
  );
}

function FieldInput({ field }: { field: Field }) {
  const inputClasses = "border border-gray-300 px-3 py-2 rounded w-full text-sm focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-colors focus:ring-2 focus:ring-opacity-50";
  const placeholderText = field.placeholder || `Enter ${field.label.toLowerCase()}`;
  
  switch (field.type) {
    case 'text':
      return <input id={field.id} className={inputClasses} placeholder={placeholderText} required={field.required} />;
    case 'number':
      return <input id={field.id} className={inputClasses} type="number" placeholder={placeholderText} required={field.required} />;
    case 'email':
      return <input id={field.id} className={inputClasses} type="email" placeholder={placeholderText} required={field.required} />;
    case 'phone':
      return <input id={field.id} className={inputClasses} type="tel" placeholder={placeholderText} required={field.required} />;
    case 'date':
      return <input id={field.id} className={inputClasses} type="date" placeholder={placeholderText} required={field.required} />;
    case 'dropdown':
      return (
        <select id={field.id} className={inputClasses} required={field.required} defaultValue="">
          <option value="" disabled>{placeholderText || 'Select...'}</option>
          {(field.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      );
    case 'checkbox':
      return (
        <label className="flex items-center text-sm py-2">
          <input id={field.id} type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" required={field.required} />
          {field.placeholder || field.label}
        </label>
      );
    case 'radio':
      return (
        <div className="space-y-2 py-1">
          {(field.options || []).map((opt, i) => (
            <label key={i} className="flex items-center text-sm">
              <input type="radio" id={`${field.id}-${i}`} name={field.id} value={opt} className="mr-2 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500" required={field.required && i === 0} />
              {opt}
            </label>
          ))}
           {(!field.options || field.options.length === 0) && <span className="text-xs text-gray-500">{placeholderText}</span>}
        </div>
      );
    case 'textarea':
      return <textarea id={field.id} className={`${inputClasses} min-h-[100px]`} placeholder={placeholderText} required={field.required} />;
    default:
      return <div className="text-sm py-2 px-3 bg-gray-100 border border-gray-300 rounded">{field.label} (Preview for '{field.type}' not fully implemented)</div>;
  }
}
