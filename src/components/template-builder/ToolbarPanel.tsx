
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateElement, ElementType } from '@/types/template-builder';
import { v4 as uuidv4 } from 'uuid';
import { 
  Text, 
  Heading1, 
  FormInput, 
  Image, 
  FileSignature, 
  Table, 
  QrCode, 
  SeparatorHorizontal
} from 'lucide-react';

interface ToolbarPanelProps {
  onAddElement: (element: TemplateElement) => void;
}

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({ onAddElement }) => {
  const [activeTab, setActiveTab] = useState<string>('elements');
  
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
      <h2 className="font-semibold mb-4">Elements</h2>
      
      <Tabs defaultValue="elements" onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full">
          <TabsTrigger value="elements" className="flex-1">Elements</TabsTrigger>
          <TabsTrigger value="presets" className="flex-1">Presets</TabsTrigger>
        </TabsList>
        <TabsContent value="elements" className="flex-1">
          <div className="grid gap-2 mt-4 pb-4">
            {elementTypes.map((element) => (
              <Button
                key={element.id}
                variant="outline"
                className="justify-start h-auto py-2 hover:bg-blue-50"
                onClick={() => handleAddElement({ type: element.type, content: element.content })}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 text-blue-600">
                    {element.icon}
                  </div>
                  <span>{element.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="presets" className="flex-1">
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Saved section presets will appear here.</p>
            
            {/* Placeholder for presets */}
            <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                <Text size={20} />
              </div>
              <h3 className="font-medium">No presets yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Save sections to reuse them across templates
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
