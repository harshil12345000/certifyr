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

// Add global styles for A4 document sizing
import "./TemplateStyles.css";
const TemplateDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  // Get institution name from user profile/settings - in a real app, this would come from an API or context
  const userInstitutionName = "ABC University"; // This would be fetched from user profile

  // Try to load saved draft if it exists
  const loadSavedDraft = () => {
    try {
      const drafts = JSON.parse(localStorage.getItem('certificateDrafts') || '{}');
      return id && drafts[id] ? drafts[id] : null;
    } catch (error) {
      console.error("Error loading saved draft:", error);
      return null;
    }
  };
  const initialData = loadSavedDraft() || {
    fullName: "",
    gender: "male",
    parentName: "",
    type: "student",
    institutionName: userInstitutionName,
    // Auto-populated from user's institution
    startDate: "",
    courseOrDesignation: "",
    department: "",
    purpose: "",
    date: new Date().toISOString().split('T')[0],
    place: "Mumbai, Maharashtra",
    signatoryName: "Dr. Anil Kumar",
    signatoryDesignation: "Principal",
    includeDigitalSignature: false
  };
  const [certificateData, setCertificateData] = useState<BonafideData>(initialData);
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
      console.error("Save draft error:", error);
    }
  };

  // Export as PDF functionality - with A4 sizing
  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    toast({
      title: "Exporting as PDF",
      description: "Your certificate is being prepared..."
    });
    try {
      // Set up PDF with A4 dimensions (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const canvas = await html2canvas(previewRef.current.querySelector('.a4-document') as HTMLElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Calculate dimensions to fit A4 properly
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;

      // Add the image to the PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

      // Save the PDF
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

  // Export as JPG functionality - with A4 sizing
  const handleExportJPG = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    toast({
      title: "Exporting as JPG",
      description: "Your certificate is being prepared..."
    });
    try {
      const canvas = await html2canvas(previewRef.current.querySelector('.a4-document') as HTMLElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.download = `${certificateData.fullName || 'bonafide'}_certificate.jpg`;
      link.href = imgData;
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
    // Create a unique link ID if one doesn't exist
    const linkId = id || `cert-${Date.now().toString(36)}`;

    // If no ID exists, save the current state with the new ID
    if (!id) {
      const drafts = JSON.parse(localStorage.getItem('certificateDrafts') || '{}');
      drafts[linkId] = certificateData;
      localStorage.setItem('certificateDrafts', JSON.stringify(drafts));
    }

    // Generate a shareable link
    const shareableLink = `${window.location.origin}/templates/${linkId}?share=true`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        title: "Link copied",
        description: "Certificate link copied to clipboard"
      });
    }).catch(err => {
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      });
      console.error("Copy link error:", err);
    });
  };

  // Print functionality
  const handlePrint = () => {
    toast({
      title: "Preparing to print",
      description: "Opening print dialog..."
    });

    // Create a new window for printing just the certificate
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print failed",
        description: "Pop-up window blocked. Please allow pop-ups for print functionality.",
        variant: "destructive"
      });
      return;
    }

    // Add necessary styles and content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bonafide Certificate - ${certificateData.fullName || 'Print'}</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: system-ui, -apple-system, sans-serif;
              background-color: white;
            }
            .print-container {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              background: white;
              padding: 15mm;
              box-sizing: border-box;
            }
            .letterhead {
              text-align: center;
              border-bottom: 1px solid #ccc;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }
            .letterhead h1 {
              font-size: 24px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .title {
              text-align: center;
              margin-bottom: 30px;
            }
            .title h2 {
              display: inline-block;
              border: 2px solid #ccc;
              padding: 10px 20px;
              font-size: 20px;
              font-weight: bold;
            }
            .content {
              line-height: 1.8;
              font-size: 16px;
            }
            .footer {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature {
              text-align: right;
            }
            .signature .sign-space {
              height: 60px;
              margin-bottom: 10px;
            }
            .stamp {
              display: inline-block;
              border: 1px dashed #ccc;
              padding: 8px;
              margin-top: 10px;
            }
            .stamp p {
              margin: 0;
              font-size: 12px;
              color: #666;
            }
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="letterhead">
              <h1>${certificateData.institutionName || "[Institution Name]"}</h1>
              <p>123 Education Street, Knowledge City, 400001 • +91 2222 333333 • info@institution.edu</p>
            </div>
            <div class="title">
              <h2>BONAFIDE CERTIFICATE</h2>
            </div>
            <div class="content">
              <p>
                This is to certify that 
                <strong>${certificateData.fullName || "[Full Name]"}</strong>, 
                ${getChildRelation()} of 
                <strong>${certificateData.parentName || "[Parent's Name]"}</strong>, 
                is a bonafide ${certificateData.type || "student/employee"} of 
                <strong>${certificateData.institutionName || "[Institution Name]"}</strong>.
              </p>
              <p>
                ${getPronoun()} has been ${getPersonType()} in this institution since 
                <strong>${certificateData.startDate ? formatDate(new Date(certificateData.startDate)) : "[Start Date]"}</strong> 
                and is currently ${getPosition()} as a 
                <strong>${certificateData.courseOrDesignation || "[Course/Designation]"}</strong> 
                in the 
                <strong>${certificateData.department || "[Department]"}</strong>.
              </p>
              <p>
                This certificate is issued upon the request of the individual for the purpose of 
                <strong>${certificateData.purpose || "[Purpose]"}</strong>.
              </p>
              <p>
                We confirm that the above information is true and correct to the best of our knowledge and records.
              </p>
            </div>
            <div class="footer">
              <div>
                <p>Date: <strong>${certificateData.date ? formatDate(new Date(certificateData.date)) : "[Date]"}</strong></p>
                <p>Place: <strong>${certificateData.place || "[City, State]"}</strong></p>
              </div>
              <div class="signature">
                <div class="sign-space"></div>
                <p><strong>${certificateData.signatoryName || "[Signatory Name]"}</strong></p>
                <p>${certificateData.signatoryDesignation || "[Designation]"}</p>
                <p>${certificateData.institutionName || "[Institution Name]"}</p>
                <div class="stamp">
                  <p>SEAL/STAMP</p>
                </div>
              </div>
            </div>
          </div>
          <script>
            // Print and close window after a short delay
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper functions to reuse logic
  const getChildRelation = () => {
    switch (certificateData.gender) {
      case "male":
        return "son";
      case "female":
        return "daughter";
      default:
        return "child";
    }
  };
  const getPronoun = () => {
    switch (certificateData.gender) {
      case "male":
        return "He";
      case "female":
        return "She";
      default:
        return "They";
    }
  };
  const getPersonType = () => {
    return certificateData.type === "student" ? "studying" : "working";
  };
  const getPosition = () => {
    return certificateData.type === "student" ? "enrolled" : "employed";
  };
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return <DashboardLayout>
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
          <Button variant="outline" onClick={handleSaveDraft} disabled={isExporting}>
            Save Draft
          </Button>
          <Button onClick={handleExportPDF} className="gap-2" disabled={isExporting}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportJPG} className="gap-2" disabled={isExporting}>
            <Download className="h-4 w-4" /> Export JPG
          </Button>
          <Button variant="outline" onClick={handleCopyLink} className="gap-2" disabled={isExporting}>
            <Copy className="h-4 w-4" /> Copy Link
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2" disabled={isExporting}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        {/* Main content */}
        <div className="glass-card">
          <Tabs defaultValue="form">
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6 my-[13px] mx-0 px-[5px] py-0">
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
    </DashboardLayout>;
};
export default TemplateDetail;