
import { useState, useEffect } from 'react';
import { TemplateElement } from '@/types/template-builder';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Copy, 
  Smartphone, 
  Printer, 
  Share2 
} from 'lucide-react';

interface PreviewPanelProps {
  elements: TemplateElement[];
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ elements }) => {
  const [sampleData, setSampleData] = useState<Record<string, any>>({});
  
  // Generate sample data for placeholders
  useEffect(() => {
    const data: Record<string, any> = {};
    
    elements.forEach(element => {
      if (element.type === 'placeholder') {
        const fieldName = element.metadata?.fieldName || element.content;
        
        // Generate appropriate sample data based on field type
        switch (element.metadata?.fieldType) {
          case 'date':
            data[fieldName] = new Date().toLocaleDateString();
            break;
          case 'number':
            data[fieldName] = '42';
            break;
          case 'select':
            data[fieldName] = element.metadata.options?.[0] || 'Option 1';
            break;
          case 'checkbox':
            data[fieldName] = true;
            break;
          case 'file':
            data[fieldName] = 'document.pdf';
            break;
          default:
            data[fieldName] = `Sample ${fieldName}`;
        }
      }
    });
    
    setSampleData(data);
  }, [elements]);
  
  return (
    <div className="flex flex-col w-full h-full">
      <div className="bg-muted p-4 flex justify-between items-center">
        <div>
          <h2 className="font-semibold">Document Preview</h2>
          <p className="text-xs text-muted-foreground">Preview with sample data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Smartphone className="h-4 w-4 mr-1" /> Mobile
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
        <div className="w-[21cm] h-[29.7cm] bg-white border border-gray-200 shadow-lg relative overflow-hidden">
          {elements.map(element => {
            let content = element.content;
            
            // Replace placeholders with sample data
            if (element.type === 'placeholder') {
              const fieldName = element.metadata?.fieldName || element.content;
              content = sampleData[fieldName] || `{{${fieldName}}}`;
            }
            
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: `${element.style.x}px`,
                  top: `${element.style.y}px`,
                  width: `${element.style.width}px`,
                  height: `${element.style.height}px`,
                  fontSize: element.style.fontSize ? `${element.style.fontSize}px` : undefined,
                  fontFamily: element.style.fontFamily,
                  color: element.style.color,
                  backgroundColor: element.style.backgroundColor,
                  borderWidth: element.style.borderWidth,
                  borderStyle: element.style.borderStyle,
                  borderColor: element.style.borderColor,
                  padding: element.style.padding ? `${element.style.padding}px` : undefined,
                  textAlign: element.style.alignment,
                  opacity: element.style.opacity,
                }}
              >
                {element.type === 'heading' ? (
                  <h2 className="font-bold">{content}</h2>
                ) : element.type === 'image' ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    {content ? (
                      <img src={content} alt="Template element" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-gray-400">Image</span>
                    )}
                  </div>
                ) : element.type === 'signature' ? (
                  <div className="w-full h-full border border-dashed border-gray-400 flex items-center justify-center">
                    <span className="text-gray-400">Signature Area</span>
                  </div>
                ) : element.type === 'divider' ? (
                  <hr className="w-full border-t border-gray-300" />
                ) : (
                  <div>{content}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
