import { useState, useEffect, useRef } from "react";
import { Section, Field } from "@/types/template-builder";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  ImageDown,
  Printer,
  Smartphone,
  Share2,
  Copy,
} from "lucide-react";
import { downloadPDF, downloadJPG, printDocument } from "@/lib/document-utils";
import { useToast } from "@/hooks/use-toast";
import { Letterhead } from "@/components/templates/Letterhead";

interface PreviewPanelProps {
  elements: Section[];
  templateName?: string;
}

const DEFAULT_BODY = `This is to certify that [Full Name], son of [Parent's Name], is a bonafide student of [Institution Name].<br><br>He has been studying in this institution since [Start Date] and is currently enrolled as a [Course/Designation] student in the [Department] department.<br><br>This certificate is issued upon the request of the individual for the purpose of [Purpose].<br><br>We confirm that the above information is true and correct to the best of our knowledge and records.`;

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  elements,
  templateName = "Document Title",
}) => {
  const { toast } = useToast();
  const [sampleData, setSampleData] = useState<Record<string, any>>({});
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_BODY);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data: Record<string, any> = {
      "Full Name": "John Doe",
      "Parent's Name": "Richard Roe",
      "Institution Name": "Knowledge Institute",
      "Start Date": "01/01/2020",
      "Course/Designation": "B.Sc. Computer Science",
      Department: "Computer Science",
      Purpose: "Higher Studies",
      Date: new Date().toLocaleDateString(),
      Place: "Knowledge City, 400001",
      "Authorized Signatory Name": "Dr. Jane Smith",
      Designation: "Principal",
    };
    elements.forEach((section) => {
      section.columns.forEach((column) => {
        column.fields.forEach((field) => {
          data[field.label] = `Sample ${field.label}`;
        });
      });
    });
    setSampleData(data);
  }, [elements]);

  const format = (command: string) => {
    document.execCommand(command, false);
  };

  function renderProcessedBody(html: string) {
    const replaced = html.replace(
      /\[(.+?)\]/g,
      (match, p1) =>
        `<span class="font-semibold">${sampleData[p1.trim()] || `[${p1}]`}</span>`,
    );
    return <div dangerouslySetInnerHTML={{ __html: replaced }} />;
  }

  const handleDownloadPDF = async () => {
    try {
      await downloadPDF(
        `${templateName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      );
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadJPG = async () => {
    try {
      await downloadJPG(
        `${templateName.toLowerCase().replace(/\s+/g, "-")}.jpg`,
      );
    } catch (error) {
      console.error("Error downloading JPG:", error);
      toast({
        title: "Error",
        description: "Failed to download JPG. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async () => {
    try {
      await printDocument();
    } catch (error) {
      console.error("Error printing document:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to print document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="bg-muted p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold">Document Preview</h2>
            <p className="text-xs text-muted-foreground">
              Preview with sample data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Smartphone className="h-4 w-4 mr-1" /> Mobile
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
        </div>

        {/* Document Actions */}
        <div className="flex gap-2 justify-center border-t pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrint}
            className="flex-1 max-w-[200px]"
          >
            <Printer className="h-5 w-5 mr-2" /> Print Document
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleDownloadJPG}
            className="flex-1 max-w-[200px]"
          >
            <ImageDown className="h-5 w-5 mr-2" /> Download JPG
          </Button>
          <Button
            size="lg"
            onClick={handleDownloadPDF}
            className="flex-1 max-w-[200px]"
          >
            <FileDown className="h-5 w-5 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div
          id="document-preview"
          className="a4-document w-[21cm] min-h-[29.7cm] bg-white border border-gray-200 shadow-lg relative overflow-hidden flex flex-col mx-auto"
        >
          <Letterhead />

          <div className="flex justify-center mt-8">
            <div className="bg-gray-100 border border-gray-300 rounded px-6 py-2 text-xl font-bold shadow-sm">
              {templateName}
            </div>
          </div>

          <div className="flex-1 p-8">
            <div className="flex gap-2 mb-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => format("bold")}
              >
                <b>B</b>
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => format("italic")}
              >
                <i>I</i>
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => format("underline")}
              >
                <u>U</u>
              </Button>
            </div>
            {isEditingBody ? (
              <div
                ref={editorRef}
                className="w-full min-h-[200px] border rounded p-2 text-base mb-2 focus:outline-none bg-white"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
                onBlur={(e) => {
                  setBodyHtml(e.currentTarget.innerHTML);
                  setIsEditingBody(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsEditingBody(false);
                  }
                }}
                style={{ whiteSpace: "pre-wrap" }}
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
            <div className="text-xs text-gray-400 mt-2">
              Click to edit. Use [Field Name] to insert fields. Use toolbar for
              formatting.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
