
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TemplateCanvas } from '@/components/template-builder/TemplateCanvas';
import { ToolbarPanel } from '@/components/template-builder/ToolbarPanel';
import { MetadataPanel } from '@/components/template-builder/MetadataPanel';
import { PreviewPanel } from '@/components/template-builder/PreviewPanel';
import { TemplateElement } from '@/types/template-builder';
import { Button } from '@/components/ui/button';
import { Save, Eye, Upload, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const TemplateBuilder = () => {
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [hasChanges, setHasChanges] = useState(false);
  const [templateName, setTemplateName] = useState('Untitled Template');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Template state
  const [templateElements, setTemplateElements] = useState<TemplateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  const handleSaveTemplate = () => {
    toast({
      title: "Template saved",
      description: "Your template has been saved successfully.",
      duration: 3000,
    });
    setHasChanges(false);
  };
  
  const handlePublishTemplate = () => {
    toast({
      title: "Template published",
      description: "Your template is now available in the library.",
      duration: 3000,
    });
    navigate('/templates');
  };
  
  const handleElementChange = () => {
    setHasChanges(true);
  };
  
  const handleAddElement = (element: TemplateElement) => {
    setTemplateElements([...templateElements, element]);
    setHasChanges(true);
  };
  
  const handleUpdateElement = (id: string, updates: Partial<TemplateElement>) => {
    setTemplateElements(
      templateElements.map(el => el.id === id ? { ...el, ...updates } : el)
    );
    setHasChanges(true);
  };
  
  const handleDeleteElement = (id: string) => {
    setTemplateElements(templateElements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    setHasChanges(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/templates')}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-semibold">{templateName}</h1>
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
        <div className="flex gap-4 flex-1 min-h-[calc(100vh-200px)]">
          {activeView === 'edit' ? (
            <>
              {/* Tools Panel */}
              <div className="w-64 glass-card overflow-auto">
                <ToolbarPanel onAddElement={handleAddElement} />
              </div>
              
              {/* Canvas */}
              <div className="flex-1 glass-card">
                <TemplateCanvas
                  elements={templateElements}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  onUpdateElement={handleUpdateElement}
                  onDeleteElement={handleDeleteElement}
                  onChange={handleElementChange}
                />
              </div>
              
              {/* Properties Panel */}
              <div className="w-72 glass-card overflow-auto">
                <MetadataPanel
                  elements={templateElements}
                  selectedElement={selectedElement}
                  onUpdateElement={handleUpdateElement}
                  templateName={templateName}
                  setTemplateName={setTemplateName}
                />
              </div>
            </>
          ) : (
            <PreviewPanel elements={templateElements} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TemplateBuilder;
