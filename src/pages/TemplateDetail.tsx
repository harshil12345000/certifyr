import { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share2, Printer, FileImage } from "lucide-react";
import { BonafideForm } from "@/components/templates/BonafideForm";
import { BonafidePreview } from "@/components/templates/BonafidePreview";
import { ExperienceForm } from "@/components/templates/ExperienceForm";
import { ExperiencePreview } from "@/components/templates/ExperiencePreview";
import { CharacterForm } from "@/components/templates/CharacterForm";
import { CharacterPreview } from "@/components/templates/CharacterPreview";
import { BonafideData, ExperienceData, CharacterData } from "@/types/templates";
import { popularTemplates } from "@/data/mockData";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";

const TemplateDetail = () => {
  const { id } = useParams();
  const template = popularTemplates.find(t => t.id === id);

  // Initialize form data based on template type
  const getInitialData = () => {
    switch (id) {
      case "experience-1":
        return {
          fullName: "",
          employeeId: "",
          designation: "",
          department: "",
          joinDate: "",
          resignationDate: "",
          workDescription: "",
          salary: "",
          institutionName: "",
          date: "",
          place: "",
          signatoryName: "",
          signatoryDesignation: "",
          includeDigitalSignature: false,
        } as ExperienceData;
      case "character-1":
        return {
          fullName: "",
          parentName: "",
          address: "",
          duration: "",
          conduct: "",
          institutionName: "",
          date: "",
          place: "",
          signatoryName: "",
          signatoryDesignation: "",
          includeDigitalSignature: false,
        } as CharacterData;
      default:
        return {
          fullName: "",
          gender: "male" as const,
          parentName: "",
          type: "student" as const,
          institutionName: "",
          startDate: "",
          courseOrDesignation: "",
          department: "",
          purpose: "",
          date: "",
          place: "",
          signatoryName: "",
          signatoryDesignation: "",
          includeDigitalSignature: false,
        } as BonafideData;
    }
  };

  const [formData, setFormData] = useState(getInitialData());

  const handleSubmit = (data: any) => {
    setFormData(data);
    console.log("Form submitted:", data);
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print dialog opened",
      description: "Your document is ready to print.",
    });
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.querySelector('.a4-document');
      if (!element) {
        toast({
          title: "Error",
          description: "Document not found for download.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your document.",
      });

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${template?.title || 'document'}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Your document has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadJPG = async () => {
    try {
      const element = document.querySelector('.a4-document');
      if (!element) {
        toast({
          title: "Error",
          description: "Document not found for download.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Generating JPG...",
        description: "Please wait while we prepare your image.",
      });

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${template?.title || 'document'}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({
            title: "JPG Downloaded",
            description: "Your document has been downloaded successfully.",
          });
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error generating JPG:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the JPG. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderForm = () => {
    switch (id) {
      case "experience-1":
        return (
          <ExperienceForm
            onSubmit={handleSubmit}
            initialData={formData as ExperienceData}
          />
        );
      case "character-1":
        return (
          <CharacterForm
            onSubmit={handleSubmit}
            initialData={formData as CharacterData}
          />
        );
      default:
        return (
          <BonafideForm
            onSubmit={handleSubmit}
            initialData={formData as BonafideData}
          />
        );
    }
  };

  const renderPreview = () => {
    switch (id) {
      case "experience-1":
        return <ExperiencePreview data={formData as ExperienceData} />;
      case "character-1":
        return <CharacterPreview data={formData as CharacterData} />;
      default:
        return <BonafidePreview data={formData as BonafideData} />;
    }
  };

  if (!template) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Template not found</h1>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{template.title}</h1>
              <p className="text-muted-foreground">{template.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadJPG}>
              <FileImage className="w-4 h-4 mr-2" />
              Download JPG
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Tabs for Form and Preview */}
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Document Details</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-medium mb-4">Document Details</h2>
              {renderForm()}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-medium mb-4">Preview</h2>
              <div className="border rounded-lg p-4 bg-white min-h-[600px]">
                {renderPreview()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TemplateDetail;
