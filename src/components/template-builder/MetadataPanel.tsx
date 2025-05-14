
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { TemplateElement } from '@/types/template-builder';
import { 
  Input as InputIcon, 
  Calendar, 
  CheckSquare, 
  FileText, 
  ListChecks,
  Trash
} from 'lucide-react';

interface MetadataPanelProps {
  elements: TemplateElement[];
  selectedElement: string | null;
  onUpdateElement: (id: string, updates: Partial<TemplateElement>) => void;
  templateName: string;
  setTemplateName: (name: string) => void;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  elements,
  selectedElement,
  onUpdateElement,
  templateName,
  setTemplateName
}) => {
  const [activeTab, setActiveTab] = useState<string>('properties');
  const selectedElementData = elements.find(el => el.id === selectedElement);
  
  // Reset to properties tab when selecting a new element
  useEffect(() => {
    setActiveTab('properties');
  }, [selectedElement]);
  
  if (!selectedElement || !selectedElementData) {
    return (
      <div className="p-4 h-full">
        <h2 className="font-semibold mb-4">Template Properties</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input 
              id="templateName" 
              value={templateName} 
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="templateCategory">Category</Label>
            <Input id="templateCategory" placeholder="e.g. HR, Finance, Legal" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="templateDesc">Description</Label>
            <Textarea id="templateDesc" placeholder="Describe this template" className="min-h-[100px]" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="templateTags">Tags (comma separated)</Label>
            <Input id="templateTags" placeholder="e.g. offer, employment, contract" />
          </div>
          
          <div className="space-y-2">
            <Label>Region</Label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">India</Button>
              <Button variant="outline" className="flex-1">Global</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const handleContentChange = (content: string) => {
    onUpdateElement(selectedElement, { content });
  };
  
  const handleStyleChange = (property: keyof TemplateElement['style'], value: any) => {
    onUpdateElement(selectedElement, {
      style: { ...selectedElementData.style, [property]: value }
    });
  };
  
  const handleMetadataChange = (property: string, value: any) => {
    onUpdateElement(selectedElement, {
      metadata: { ...selectedElementData.metadata, [property]: value }
    });
  };
  
  const getFieldTypeIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text': return <InputIcon size={16} />;
      case 'date': return <Calendar size={16} />;
      case 'select': return <ListChecks size={16} />;
      case 'checkbox': return <CheckSquare size={16} />;
      case 'file': return <FileText size={16} />;
      default: return <InputIcon size={16} />;
    }
  };
  
  return (
    <div className="p-4 h-full">
      <h2 className="font-semibold mb-4">Element Properties</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
          {selectedElementData.type === 'placeholder' && (
            <TabsTrigger value="field" className="flex-1">Field</TabsTrigger>
          )}
          <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Element Type</Label>
            <div className="rounded-md bg-muted p-2 text-sm font-medium">
              {selectedElementData.type.charAt(0).toUpperCase() + selectedElementData.type.slice(1)}
            </div>
          </div>
          
          {selectedElementData.type !== 'divider' && (
            <div className="space-y-2">
              <Label htmlFor="elementContent">Content</Label>
              <Textarea
                id="elementContent"
                value={selectedElementData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="elementX" className="text-xs">X Position</Label>
              <Input 
                id="elementX" 
                type="number"
                value={selectedElementData.style.x}
                onChange={(e) => handleStyleChange('x', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="elementY" className="text-xs">Y Position</Label>
              <Input 
                id="elementY" 
                type="number"
                value={selectedElementData.style.y}
                onChange={(e) => handleStyleChange('y', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="elementWidth" className="text-xs">Width</Label>
              <Input 
                id="elementWidth" 
                type="number"
                value={selectedElementData.style.width}
                onChange={(e) => handleStyleChange('width', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="elementHeight" className="text-xs">Height</Label>
              <Input 
                id="elementHeight" 
                type="number"
                value={selectedElementData.style.height}
                onChange={(e) => handleStyleChange('height', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <Button variant="destructive" className="w-full mt-4" size="sm">
            <Trash size={16} className="mr-2" /> Delete Element
          </Button>
        </TabsContent>
        
        {selectedElementData.type === 'placeholder' && (
          <TabsContent value="field" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                value={selectedElementData.metadata?.fieldName || selectedElementData.content}
                onChange={(e) => handleMetadataChange('fieldName', e.target.value)}
                placeholder="e.g. fullName"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {['text', 'date', 'select', 'checkbox', 'file'].map(type => (
                  <Button
                    key={type}
                    variant={selectedElementData.metadata?.fieldType === type ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleMetadataChange('fieldType', type)}
                  >
                    {getFieldTypeIcon(type)}
                    <span className="capitalize">{type}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input
                id="placeholder"
                value={selectedElementData.metadata?.placeholder || ''}
                onChange={(e) => handleMetadataChange('placeholder', e.target.value)}
                placeholder="e.g. Enter your full name"
              />
            </div>
            
            {selectedElementData.metadata?.fieldType === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="options">Options (one per line)</Label>
                <Textarea
                  id="options"
                  value={(selectedElementData.metadata?.options || []).join('\n')}
                  onChange={(e) => handleMetadataChange('options', e.target.value.split('\n').filter(Boolean))}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className="min-h-[100px]"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRequired"
                checked={selectedElementData.metadata?.isRequired || false}
                onCheckedChange={(checked) => handleMetadataChange('isRequired', checked)}
              />
              <Label htmlFor="isRequired">Required field</Label>
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="style" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
              <Input 
                id="fontSize" 
                type="number"
                value={selectedElementData.style.fontSize || 12}
                onChange={(e) => handleStyleChange('fontSize', parseFloat(e.target.value) || 12)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="color" className="text-xs">Text Color</Label>
              <div className="flex">
                <Input 
                  id="color" 
                  type="color"
                  value={selectedElementData.style.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-10 p-0 mr-2"
                />
                <Input 
                  value={selectedElementData.style.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <div className="flex gap-2">
              <Button
                variant={selectedElementData.style.alignment === 'left' ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleStyleChange('alignment', 'left')}
              >
                Left
              </Button>
              <Button
                variant={selectedElementData.style.alignment === 'center' ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleStyleChange('alignment', 'center')}
              >
                Center
              </Button>
              <Button
                variant={selectedElementData.style.alignment === 'right' ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleStyleChange('alignment', 'right')}
              >
                Right
              </Button>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="bgColor" className="text-xs">Background Color</Label>
            <div className="flex">
              <Input 
                id="bgColor" 
                type="color"
                value={selectedElementData.style.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-10 p-0 mr-2"
              />
              <Input 
                value={selectedElementData.style.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="borderWidth" className="text-xs">Border Width</Label>
              <Input 
                id="borderWidth" 
                type="number"
                value={selectedElementData.style.borderWidth || 0}
                onChange={(e) => handleStyleChange('borderWidth', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="borderStyle" className="text-xs">Border Style</Label>
              <select
                id="borderStyle"
                value={selectedElementData.style.borderStyle || 'solid'}
                onChange={(e) => handleStyleChange('borderStyle', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="borderColor" className="text-xs">Border Color</Label>
            <div className="flex">
              <Input 
                id="borderColor" 
                type="color"
                value={selectedElementData.style.borderColor || '#000000'}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                className="w-10 p-0 mr-2"
              />
              <Input 
                value={selectedElementData.style.borderColor || '#000000'}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="padding" className="text-xs">Padding</Label>
            <Input 
              id="padding" 
              type="number"
              value={selectedElementData.style.padding || 0}
              onChange={(e) => handleStyleChange('padding', parseFloat(e.target.value) || 0)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
