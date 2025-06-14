import { useState, useEffect, useRef } from 'react';
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
  templateName?: string;
}

const DEFAULT_BODY = `This is to certify that [Full Name], son of [Parent's Name], is a bonafide student of [Institution Name].<br><br>He has been studying in this institution since [Start Date] and is currently enrolled as a [Course/Designation] student in the [Department] department.<br><br>This certificate is issued upon the request of the individual for the purpose of [Purpose].<br><br>We confirm that the above information is true and correct to the best of our knowledge and records.`;

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ elements, templateName = 'Document Title' }) => {
  const [sampleData, setSampleData] = useState<Record<string, any>>({});
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_BODY);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Generate sample data for placeholders
  useEffect(() => {
    const data: Record<string, any> = {
      'Full Name': 'John Doe',
      "Parent's Name": 'Richard Roe',
      'Institution Name': 'Knowledge Institute',
      'Start Date': '01/01/2020',
      'Course/Designation': 'B.Sc. Computer Science',
      'Department': 'Computer Science',
      'Purpose': 'Higher Studies',
      'Date': new Date().toLocaleDateString(),
      'Place': 'Knowledge City, 400001',
      'Authorized Signatory Name': 'Dr. Jane Smith',
      'Designation': 'Principal',
    };
    elements.forEach(element => {
      if (element.type === 'placeholder') {
        const fieldName = element.metadata?.fieldName || element.content;
            data[fieldName] = `Sample ${fieldName}`;
      }
    });
    setSampleData(data);
  }, [elements]);
  
  // Toolbar actions
  const format = (command: string) => {
    document.execCommand(command, false);
  };

  // Replace [Field Name] with sampleData or fallback, preserving HTML formatting
  function renderProcessedBody(html: string) {
    // Replace [Field Name] with <span> containing the value
    const replaced = html.replace(/\[(.+?)\]/g, (match, p1) => `<span class="font-semibold">${sampleData[p1.trim()] || `[${p1}]`}</span>`);
    return <div dangerouslySetInnerHTML={{ __html: replaced }} />;
  }
  
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
        <div className="w-[21cm] min-h-[29.7cm] bg-white border border-gray-200 shadow-lg relative overflow-hidden flex flex-col">
          {/* Letterhead */}
          <div className="pt-10 pb-2 text-center border-b border-gray-200">
            <div className="text-2xl font-bold text-blue-600 tracking-wide">[INSTITUTION NAME]</div>
            <div className="text-sm text-gray-500 mt-1">123 Education Street, Knowledge City, 400001 &bull; +1 - info@institution.edu</div>
          </div>
          {/* Template Name in grey box */}
          <div className="flex justify-center mt-8">
            <div className="bg-gray-100 border border-gray-300 rounded px-6 py-2 text-xl font-bold shadow-sm">
              {templateName}
            </div>
          </div>
          {/* Editable Document Body */}
          <div className="mt-8 px-8">
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant="outline" type="button" onClick={() => format('bold')}><b>B</b></Button>
              <Button size="sm" variant="outline" type="button" onClick={() => format('italic')}><i>I</i></Button>
              <Button size="sm" variant="outline" type="button" onClick={() => format('underline')}><u>U</u></Button>
            </div>
            {isEditingBody ? (
              <div
                ref={editorRef}
                className="w-full min-h-[200px] border rounded p-2 text-base mb-2 focus:outline-none bg-white"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
                onBlur={e => {
                  setBodyHtml(e.currentTarget.innerHTML);
                  setIsEditingBody(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    setIsEditingBody(false);
                  }
                }}
                style={{ whiteSpace: 'pre-wrap' }}
                autoFocus
              />
            ) : (
              <div
                className="text-base leading-relaxed cursor-pointer min-h-[100px]"
                onClick={() => setIsEditingBody(true)}
              >
                {renderProcessedBody(bodyHtml)}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-2">Click to edit. Use [Field Name] to insert fields. Use toolbar for formatting.</div>
          </div>
          {/* Date, Place, Signatory */}
          <div className="flex justify-between items-end px-8 mt-16 mb-8">
            <div>
              <div className="font-bold">Date: <span className="font-normal">{sampleData['Date'] || '[Date]'}</span></div>
              <div className="font-bold">Place: <span className="font-normal">{sampleData['Place'] || '[Place]'}</span></div>
            </div>
            <div className="text-right">
              <div className="font-bold">{sampleData['Authorized Signatory Name'] || '[Authorized Signatory Name]'}</div>
              <div>{sampleData['Designation'] || '[Designation]'}</div>
              <div>{sampleData['Institution Name'] || '[Institution Name]'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
