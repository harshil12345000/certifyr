import { useState } from 'react';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import { TemplateCanvas } from '@/components/template-builder/TemplateCanvas';
import { ToolbarPanel } from '@/components/template-builder/ToolbarPanel';
import { MetadataPanel } from '@/components/template-builder/MetadataPanel';
import { PreviewPanel } from '@/components/template-builder/PreviewPanel';
import { Section, Column, Field } from '@/types/template-builder';
import { Button } from '@/components/ui/button';
import { Save, Eye, Upload, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

function createEmptySection() {
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    title: 'New Section',
    description: '',
    columns: [
      { id: Date.now().toString() + '-col1', fields: [] },
      { id: Date.now().toString() + '-col2', fields: [] },
    ],
  };
}

function createEmptyField(type = 'text') {
  let label = 'New Field';
  let placeholder = '';
  switch (type) {
    case 'text':
      label = 'Full Name';
      break;
    case 'number':
      label = 'Number';
      break;
    case 'email':
      label = 'Email';
      break;
    case 'phone':
      label = 'Phone Number';
      break;
    case 'date':
      label = 'Date';
      break;
    case 'dropdown':
      label = 'Dropdown';
      break;
    case 'checkbox':
      label = 'Checkbox';
      break;
    case 'radio':
      label = 'Radio';
      break;
    case 'textarea':
      label = 'Description';
      break;
    default:
      label = 'New Field';
  }
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    type,
    label,
    placeholder: '',
    required: false,
    options: type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
  };
}

const TemplateBuilder = () => {
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [hasChanges, setHasChanges] = useState(false);
  const [templateName, setTemplateName] = useState('Untitled Template');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Template state: array of sections
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedField, setSelectedField] = useState<{ sectionId: string; columnId: string; fieldId: string } | null>(null);
  const [draggedSidebarType, setDraggedSidebarType] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);

  // dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor));

  // Section/Column/Field handlers
  const handleAddSection = () => {
    setSections(prev => [...prev, createEmptySection()]);
    setHasChanges(true);
  };
  const handleDeleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setHasChanges(true);
  };
  const handleAddColumn = (sectionId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, columns: [...s.columns, { id: Date.now().toString() + '-col', fields: [] }] } : s));
    setHasChanges(true);
  };
  const handleAddField = (sectionId: string, columnId: string, type = 'text') => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, columns: s.columns.map(c => c.id === columnId ? { ...c, fields: [...c.fields, createEmptyField(type)] } : c) }
        : s
    ));
    setHasChanges(true);
  };
  const handleDeleteField = (sectionId: string, columnId: string, fieldId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, columns: s.columns.map(c => c.id === columnId ? { ...c, fields: c.fields.filter(f => f.id !== fieldId) } : c) }
        : s
    ));
    setHasChanges(true);
  };
  const handleSelectField = (sectionId: string, columnId: string, fieldId: string) => {
    setSelectedField({ sectionId, columnId, fieldId });
  };

  // Drag from sidebar to canvas
  const handleDragStart = (event) => {
    if (event.active.data.current?.fromSidebar) {
      setDraggedSidebarType(event.active.id);
    }
  };
  const handleDragEnd = (event) => {
    if (draggedSidebarType && event.over && event.over.id.startsWith('column-dropzone-')) {
      // Find section and column
      const columnId = event.over.id.replace('column-dropzone-', '');
      // Find section containing this column
      const section = sections.find(s => s.columns.some(c => c.id === columnId));
      if (section) {
        handleAddField(section.id, columnId, draggedSidebarType);
      }
    }
    setDraggedSidebarType(null);
  };

  // Save as draft
  const handleSaveTemplate = async () => {
    const { error } = await supabase.from('templates').upsert([
      {
        title: templateName,
        fields: sections,
        status: 'draft',
      },
    ]);
    if (error) {
      toast({ title: 'Error saving template', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Template saved as draft' });
      setHasChanges(false);
    }
  };

  // Publish
  const handlePublishTemplate = async () => {
    const { error } = await supabase.from('templates').upsert([
      {
        title: templateName,
        fields: sections,
        status: 'published',
      },
    ]);
    if (error) {
      toast({ title: 'Error publishing template', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Template published' });
      setHasChanges(false);
      navigate('/admin/templates');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in pt-8">
      {/* Header */}
      <div className="flex justify-between items-center px-8">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/templates')}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {editingTitle ? (
            <input
              className="text-2xl font-semibold bg-white border-b border-primary-300 focus:outline-none focus:border-primary-500"
              value={templateName}
              autoFocus
              onChange={e => setTemplateName(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); }}
              style={{ minWidth: 200 }}
            />
          ) : (
            <h1
              className="text-2xl font-semibold cursor-pointer hover:underline"
              onClick={() => setEditingTitle(true)}
            >
              {templateName}
            </h1>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveView(activeView === 'edit' ? 'preview' : 'edit')}
          >
            <Eye className="h-4 w-4 mr-2" />
            {activeView === 'edit' ? 'Preview' : 'Edit'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSaveTemplate}
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handlePublishTemplate}>
            <Upload className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>
      {/* Builder Interface */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 flex-1 min-h-[calc(100vh-200px)] px-8">
          {activeView === 'edit' ? (
            <>
              {/* Tools Panel (Sidebar for draggable components) */}
              <div className="w-64 glass-card overflow-auto">
                <ToolbarPanel onAddElement={() => {}} draggable onDragStartSidebar={setDraggedSidebarType} />
              </div>
              {/* Canvas */}
              <div className="flex-1 glass-card">
                <TemplateCanvas
                  elements={sections}
                  onAddSection={handleAddSection}
                  onAddField={handleAddField}
                  onAddColumn={handleAddColumn}
                  onSelectField={handleSelectField}
                  onDeleteField={handleDeleteField}
                  onDeleteSection={handleDeleteSection}
                />
              </div>
              {/* Properties Panel (not yet implemented for new model) */}
              {/* <div className="w-72 glass-card overflow-auto">
                <MetadataPanel ... />
              </div> */}
            </>
          ) : (
            <PreviewPanel elements={sections} />
          )}
          <DragOverlay>{draggedSidebarType && <div className="p-2 bg-primary-100 rounded shadow">{draggedSidebarType}</div>}</DragOverlay>
        </div>
      </DndContext>
    </div>
  );
};

export default TemplateBuilder; 