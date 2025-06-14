import { useState, useEffect } from 'react';
import { DndContext, closestCorners, useSensor, useSensors, PointerSensor, KeyboardSensor, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Section, Column, Field } from '@/types/template-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { MetadataPanel } from '@/components/template-builder/MetadataPanel';

// FieldPropertyPanel Component
interface FieldPropertyPanelProps {
  sections: Section[];
  selectedField: { sectionId: string; columnId: string; fieldId: string } | null;
  onUpdateField: (sectionId: string, columnId: string, fieldId: string, updates: Partial<Field>) => void;
  onDeleteField: (sectionId: string, columnId: string, fieldId: string) => void;
  onClose: () => void;
}

const FieldPropertyPanel: React.FC<FieldPropertyPanelProps> = ({ sections, selectedField, onUpdateField, onDeleteField, onClose }) => {
  const [localFieldData, setLocalFieldData] = useState<Field | null>(null);
  const [optionsString, setOptionsString] = useState('');

  useEffect(() => {
    if (selectedField && sections) {
      const currentSection = sections.find(s => s.id === selectedField.sectionId);
      const currentColumn = currentSection?.columns.find(c => c.id === selectedField.columnId);
      const currentField = currentColumn?.fields.find(f => f.id === selectedField.fieldId);
      
      if (currentField) {
        setLocalFieldData(currentField);
        if (currentField.options) {
          setOptionsString(currentField.options.join(', '));
        } else {
          setOptionsString('');
        }
      } else {
        setLocalFieldData(null);
        setOptionsString('');
      }
    } else {
      setLocalFieldData(null);
      setOptionsString('');
    }
  }, [selectedField, sections]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!localFieldData || !selectedField) return;
    const { name, value } = e.target;
    const updatedField = { ...localFieldData, [name]: value };
    setLocalFieldData(updatedField);
    // Debounced update or update on blur might be better for performance
    onUpdateField(selectedField.sectionId, selectedField.columnId, selectedField.fieldId, { [name]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (!localFieldData || !selectedField) return;
    const updatedField = { ...localFieldData, required: checked };
    setLocalFieldData(updatedField);
    onUpdateField(selectedField.sectionId, selectedField.columnId, selectedField.fieldId, { required: checked });
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptionsString(e.target.value);
    if (!localFieldData || !selectedField) return;
    const optionsArray = e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
    const updatedField = { ...localFieldData, options: optionsArray };
    setLocalFieldData(updatedField);
    onUpdateField(selectedField.sectionId, selectedField.columnId, selectedField.fieldId, { options: optionsArray });
  };
  
  const handleDelete = () => {
    if (selectedField) {
      onDeleteField(selectedField.sectionId, selectedField.columnId, selectedField.fieldId);
      onClose();
    }
  };

  if (!selectedField || !localFieldData) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a field to see its properties.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Edit Field: {localFieldData.type}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fieldLabel">Label</Label>
        <Input id="fieldLabel" name="label" value={localFieldData.label} onChange={handleInputChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fieldPlaceholder">Placeholder</Label>
        <Input id="fieldPlaceholder" name="placeholder" value={localFieldData.placeholder || ''} onChange={handleInputChange} />
      </div>
      
      {(localFieldData.type === 'dropdown' || localFieldData.type === 'radio') && (
        <div className="space-y-2">
          <Label htmlFor="fieldOptions">Options (comma-separated)</Label>
          <Input id="fieldOptions" name="options" value={optionsString} onChange={handleOptionsChange} />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox id="fieldRequired" checked={localFieldData.required} onCheckedChange={handleCheckboxChange} />
        <Label htmlFor="fieldRequired">Required</Label>
      </div>
      
      {/* Add more specific properties based on field type if needed */}
      {/* For example, min/max for number, pattern for text, etc. */}

      <Button variant="destructive" onClick={handleDelete} className="w-full">
        <Trash2 size={16} className="mr-2" /> Delete Field
      </Button>
    </div>
  );
};

// DraggableFieldItem Component
interface DraggableFieldItemProps {
  field: Field;
  sectionId: string;
  columnId: string;
  onSelect: () => void;
  isSelected: boolean;
  onDelete: () => void;
}

const DraggableFieldItem: React.FC<DraggableFieldItemProps> = ({ field, sectionId, columnId, onSelect, isSelected, onDelete }) => {
  // useSortable hook would be used here for drag-and-drop functionality
  // For now, just a simple non-draggable component
  return (
    <div 
      className={`p-3 mb-2 bg-white border rounded-md cursor-pointer ${isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-sm">{field.label}</p>
          <p className="text-xs text-gray-500">{field.type}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};

// ColumnDropzone Component
interface ColumnDropzoneProps {
  column: Column;
  sectionId: string;
  onAddField: (type: string) => void;
  onDeleteField: (fieldId: string) => void;
  onSelectField: (fieldId: string) => void;
  selectedFieldId: string | null;
}

const ColumnDropzone: React.FC<ColumnDropzoneProps> = ({ 
  column, 
  sectionId, 
  onAddField, 
  onDeleteField, 
  onSelectField, 
  selectedFieldId 
}) => {
  return (
    <div 
      className="flex-1 min-h-[100px] p-3 bg-gray-50 rounded-md border border-dashed border-gray-300"
      id={`column-dropzone-${column.id}`} // Used for identifying drop target
    >
      {column.fields.map((field) => (
        <DraggableFieldItem
          key={field.id}
          field={field}
          sectionId={sectionId}
          columnId={column.id}
          onSelect={() => onSelectField(field.id)}
          isSelected={selectedFieldId === field.id}
          onDelete={() => onDeleteField(field.id)}
        />
      ))}
      {column.fields.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          Drag fields here or click to add
        </div>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full mt-2 border border-dashed border-gray-300"
        onClick={() => onAddField('text')} // Default to text field
      >
        <PlusCircle size={14} className="mr-1" /> Add Field
      </Button>
    </div>
  );
};

// SectionComponent
interface SectionComponentProps {
  section: Section;
  sectionIndex: number;
  onSelect: () => void;
  isSelected: boolean;
  onAddColumn: () => void;
  onDeleteSection: () => void;
  onAddField: (columnId: string, type: string) => void;
  onDeleteField: (columnId: string, fieldId: string) => void;
  onSelectField: (sectionId: string, columnId: string, fieldId: string) => void;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onUpdateField: (columnId: string, fieldId: string, updates: Partial<Field>) => void;
}

const SectionComponent: React.FC<SectionComponentProps> = ({
  section,
  sectionIndex,
  onSelect,
  isSelected,
  onAddColumn,
  onDeleteSection,
  onAddField,
  onDeleteField,
  onSelectField,
  onUpdateSection,
  onUpdateField,
}) => {
  // useSortable hook would be used here for drag-and-drop functionality
  // For now, just a simple non-draggable component
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSection(section.id, { title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateSection(section.id, { description: e.target.value });
  };

  return (
    <div 
      className={`mb-6 p-4 bg-white rounded-lg border ${isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1">
          <Input 
            value={section.title} 
            onChange={handleTitleChange}
            className="font-semibold text-lg border-none p-0 focus:ring-0"
            placeholder="Section Title"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="flex gap-2">
          {section.columns.length < 2 && (
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onAddColumn(); }}>
              Add Column
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDeleteSection(); }}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      
      <Textarea
        value={section.description || ''}
        onChange={handleDescriptionChange}
        placeholder="Section description (optional)"
        className="mb-4 resize-none border-none bg-gray-50 p-2 text-sm focus:ring-0"
        onClick={(e) => e.stopPropagation()}
      />
      
      <div className={`flex gap-4 ${section.columns.length > 1 ? 'flex-row' : 'flex-col'}`}>
        {section.columns.map((column) => (
          <ColumnDropzone
            key={column.id}
            column={column}
            sectionId={section.id}
            onAddField={(type) => onAddField(column.id, type)}
            onDeleteField={(fieldId) => onDeleteField(column.id, fieldId)}
            onSelectField={(fieldId) => {
              setSelectedFieldId(fieldId);
              onSelectField(section.id, column.id, fieldId);
            }}
            selectedFieldId={selectedFieldId}
          />
        ))}
      </div>
    </div>
  );
};

// TemplateCanvas Component
interface TemplateCanvasProps {
  elements: Section[];
  onAddSection: () => void;
  onAddField: (sectionId: string, columnId: string, type: string) => void;
  onAddColumn: (sectionId: string) => void;
  onSelectField?: (sectionId: string, columnId: string, fieldId: string) => void;
  onDeleteField: (sectionId: string, columnId: string, fieldId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onUpdateField: (sectionId: string, columnId: string, fieldId: string, updates: Partial<Field>) => void;
  onChange?: (sections: Section[]) => void;
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  elements: sections,
  onAddSection,
  onAddField,
  onAddColumn,
  onSelectField,
  onDeleteField,
  onDeleteSection,
  onUpdateSection,
  onUpdateField,
  onChange,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedFieldForPanel, setSelectedFieldForPanel] = useState<{ sectionId: string; columnId: string; fieldId: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFieldSelect = (sectionId: string, columnId: string, fieldId: string) => {
    setSelectedFieldForPanel({ sectionId, columnId, fieldId });
    setSelectedSectionId(null);
    onSelectField?.(sectionId, columnId, fieldId);
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedFieldForPanel(null);
  };
  
  const closePropertyPanel = () => {
    setSelectedFieldForPanel(null);
    setSelectedSectionId(null);
  };

  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over?.data.current?.type === 'field-dropzone') {
      console.log("Field drag end, implement reordering logic", active, over);
    }
  };
  
  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && sections.find(s => s.id === active.id) && sections.find(s => s.id === over?.id)) {
        const oldIndex = sections.findIndex(s => s.id === active.id);
        const newIndex = sections.findIndex(s => s.id === over?.id);
        const updatedSections = arrayMove(sections, oldIndex, newIndex);
        console.log("Section drag end, implement reordering", active, over);
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 scrollbar-thin">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
        >
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map((section, sectionIndex) => (
              <SectionComponent
                key={section.id}
                section={section}
                sectionIndex={sectionIndex}
                onSelect={() => handleSectionSelect(section.id)}
                isSelected={selectedSectionId === section.id}
                onAddColumn={() => onAddColumn(section.id)}
                onDeleteSection={() => onDeleteSection(section.id)}
                onAddField={(columnId, type) => onAddField(section.id, columnId, type)}
                onDeleteField={(columnId, fieldId) => onDeleteField(section.id, columnId, fieldId)}
                onSelectField={handleFieldSelect}
                onUpdateSection={(sectionId, updates) => onUpdateSection(sectionId, updates)}
                onUpdateField={(columnId, fieldId, updates) => onUpdateField(section.id, columnId, fieldId, updates)}
              />
            ))}
          </SortableContext>
        </DndContext>
        <Button onClick={onAddSection} variant="outline" className="mt-6 w-full py-3">
          <PlusCircle size={18} className="mr-2" /> Add New Section
        </Button>
      </div>

      {(selectedFieldForPanel || selectedSectionId) && (
        <aside className="w-80 bg-white border-l border-gray-200 shadow-lg overflow-y-auto scrollbar-thin">
          {selectedFieldForPanel && (
            <FieldPropertyPanel
              sections={sections}
              selectedField={selectedFieldForPanel}
              onUpdateField={onUpdateField}
              onDeleteField={onDeleteField}
              onClose={closePropertyPanel}
            />
          )}
          {selectedSectionId && sections.find(s => s.id === selectedSectionId) && (
            <MetadataPanel
              elements={sections}
              selectedElement={selectedSectionId}
              onUpdateElement={(id, updates) => onUpdateSection(id, updates as Partial<Section>)}
              templateName=""
              setTemplateName={() => {}}
            />
          )}
        </aside>
      )}
    </div>
  );
};
