
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Copy, Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BonafideForm } from "@/components/templates/BonafideForm";
import { BonafidePreview } from "@/components/templates/BonafidePreview";
import { BonafideData } from "@/types/templates";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Get institution name from user profile/settings - in a real app, this would come from an API or context
  const userInstitutionName = "ABC University"; // This would be fetched from user profile
  
  const [certificateData, setCertificateData] = useState<BonafideData>({
    fullName: "",
    gender: "male",
    parentName: "",
    type: "student",
    institutionName: userInstitutionName, // Auto-populated from user's institution
    startDate: "",
    courseOrDesignation: "",
    department: "",
    purpose: "",
    date: new Date().toISOString().split('T')[0],
    place: "Mumbai, Maharashtra",
    signatoryName: "Dr. Anil Kumar",
    signatoryDesignation: "Principal",
    includeDigitalSignature: false,
  });

  const [isExporting, setIsExporting] = useState(false);

  // Save draft functionality
  const handleSaveDraft = () => {
    try {
      // In a real app, this would save to a database or cloud storage
      const drafts = JSON.parse(localStorage.getItem('certificateDrafts') || '{}');
      const draftId = id || `draft-${Date.now()}`;
      drafts[draftId] = certificateData;
      localStorage.setItem('certificateDrafts', JSON.stringify(drafts));
      
      toast({
        title: "Draft saved",
        description: "Your certificate draft has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error saving draft",
        description: "There was an error saving your draft. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Export as PDF functionality
  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    
    setIsExporting(true);
    toast({
      title: "Exporting as PDF",
      description: "Your certificate is being prepared..."
    });
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${certificateData.fullName || 'bonafide'}_certificate.pdf`);
      
      toast({
        title: "Export Complete",
        description: "Your PDF has been downloaded successfully."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error creating your PDF. Please try again.",
        variant: "destructive"
      });
      console.error("PDF export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Export as JPG functionality
  const handleExportJPG = async () => {
    if (!previewRef.current) return;
    
    setIsExporting(true);
    toast({
      title: "Exporting as JPG",
      description: "Your certificate is being prepared..."
    });
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `${certificateData.fullName || 'bonafide'}_certificate.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      link.click();
      
      toast({
        title: "Export Complete",
        description: "Your JPG has been downloaded successfully."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error creating your JPG. Please try again.",
        variant: "destructive"
      });
      console.error("JPG export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy link functionality
  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/templates/${id}?share=true`;
    
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Certificate link copied to clipboard"
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Failed to copy link to clipboard",
          variant: "destructive"
        });
      });
  };

  // Print functionality
  const handlePrint = () => {
    toast({
      title: "Preparing to print",
      description: "Opening print dialog..."
    });
    
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/templates")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Bonafide Certificate
            </h1>
            <p className="text-muted-foreground">
              Create a standard bonafide certificate for students or employees
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft} 
            disabled={isExporting}
          >
            Save Draft
          </Button>
          <Button 
            onClick={handleExportPDF} 
            className="gap-2"
            disabled={isExporting}
          >
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportJPG} 
            className="gap-2"
            disabled={isExporting}
          >
            <Download className="h-4 w-4" /> Export JPG
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCopyLink} 
            className="gap-2"
            disabled={isExporting}
          >
            <Copy className="h-4 w-4" /> Copy Link
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint} 
            className="gap-2"
            disabled={isExporting}
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        {/* Main content */}
        <div className="glass-card">
          <Tabs defaultValue="form">
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="p-4">
              <BonafideForm data={certificateData} setData={setCertificateData} />
            </TabsContent>

            <TabsContent value="preview" className="p-4">
              <div ref={previewRef}>
                <BonafidePreview data={certificateData} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TemplateDetail;
