import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Section, Field } from '@/types/template-builder';
import { 
  Trash,
  // Icons below might not be relevant if we are only editing Section properties
  // Calendar, CheckSquare, FileText, ListChecks, Type 
} from 'lucide-react';

interface MetadataPanelProps {
  elements: Section[]; // Now explicitly Section[]
  selectedElement: string | null; // ID of the selected Section
  onUpdateElement: (id: string, updates: Partial<Section>) => void; // Updates are Partial<Section>
  templateName: string;
  setTemplateName: (name: string) => void;
  // If this panel should edit Fields, it needs different props or internal logic
  // e.g., selectedFieldId, onUpdateField, etc.
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  elements,
  selectedElement,
  onUpdateElement,
  templateName,
  setTemplateName
}) => {
  const [activeTab, setActiveTab] = useState<string>('properties');
  const selectedSectionData = elements.find(el => el.id === selectedElement);
  
  useEffect(() => {
    setActiveTab('properties');
  }, [selectedElement]);
  
  if (!selectedElement || !selectedSectionData) {
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
  
  // These handlers are problematic if selectedSectionData is a Section
  // Section does not have 'content', 'style', 'metadata' in the way generic elements do.
  // const handleContentChange = (content: string) => {
  //   onUpdateElement(selectedElement, { content }); // 'content' is not a property of Section
  // };
  
  // const handleStyleChange = (property: keyof ElementStyle, value: any) => {
  //   // onUpdateElement(selectedElement, {
  //   //   style: { ...(selectedSectionData as any).style, [property]: value } // 'style' is not on Section
  //   // });
  // };
  
  // const handleMetadataChange = (property: string, value: any) => {
  //   // onUpdateElement(selectedElement, {
  //   //   metadata: { ...(selectedSectionData as any).metadata, [property]: value } // 'metadata' is not on Section
  //   // });
  // };

  // This function is for Field types, not Section types.
  // const getFieldTypeIcon = (fieldType: string) => { ... };
  
  return (
    <div className="p-4 h-full">
      <h2 className="font-semibold mb-4">Section Properties</h2> {/* Changed from Element Properties */}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
          {/* "Field" and "Style" tabs are likely irrelevant if selectedElement is a Section ID
              and Section doesn't have style or direct field metadata in this context.
              If a field *within* the section is selected, this panel would need different props.
          */}
          {/* <TabsTrigger value="field" className="flex-1">Field</TabsTrigger> */}
          {/* <TabsTrigger value="style" className="flex-1">Style</TabsTrigger> */}
        </TabsList>
        
        <TabsContent value="properties" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Element Type</Label>
            <div className="rounded-md bg-muted p-2 text-sm font-medium">
              Section {/* Sections don't have a 'type' property like generic elements */}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sectionTitle">Section Title</Label>
            <Input
              id="sectionTitle"
              value={selectedSectionData.title}
              onChange={(e) => onUpdateElement(selectedElement, { title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sectionDescription">Section Description</Label>
            <Textarea
              id="sectionDescription"
              value={selectedSectionData.description || ''}
              onChange={(e) => onUpdateElement(selectedElement, { description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
          
          {/* Positional/Sizing properties are not part of Section type */}
          {/* <div className="grid grid-cols-2 gap-2"> ... X, Y, Width, Height ... </div> */}
          
          <Button 
            variant="destructive" 
            className="w-full mt-4" 
            size="sm"
            onClick={() => {
              // Assuming onDeleteElement in parent (TemplateBuilder) handles Section deletion
              // This button might be passed from parent later or use a specific onDeleteSection prop
            }}
          >
            <Trash size={16} className="mr-2" /> Delete Section
          </Button>
        </TabsContent>
        
        {/* "Field" Tab Content - This is not applicable if selectedElement is a Section.
            This tab would make sense if this panel was for editing a selected Field.
            For now, commenting out as it relies on non-Section properties.
        */}
        {/* 
        {selectedSectionData.type === 'placeholder' && ( // Section doesn't have 'type'
          <TabsContent value="field" className="space-y-4 mt-4">
            ... field editing UI ...
          </TabsContent>
        )}
        */}
        
        {/* "Style" Tab Content - Sections do not have a 'style' property in their type definition.
            Commenting out this tab.
        */}
        {/*
        <TabsContent value="style" className="space-y-4 mt-4">
          ... style editing UI ...
        </TabsContent>
        */}
      </Tabs>
    </div>
  );
};
