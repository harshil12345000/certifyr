import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Copy, Printer, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BonafideForm } from "@/components/templates/BonafideForm";
import { BonafidePreview } from "@/components/templates/BonafidePreview";
import { BonafideData } from "@/types/templates";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Add global styles for A4 document sizing
import "./TemplateStyles.css";

type DocumentDraft = {
  id: string;
  name: string;
  template_id: string;
  data: BonafideData;
  created_at: string;
  updated_at: string;
};

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [existingDraft, setExistingDraft] = useState<DocumentDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get institution name from user profile/settings - in a real app, this would come from an API or context
  const userInstitutionName = "ABC University"; // This would be fetched from user profile

  // Function to load draft from Supabase
  const loadDraftFromSupabase = async (draftId: string) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('document_drafts')
        .select('*')
        .eq('template_id', draftId)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setExistingDraft(data as DocumentDraft);
        setDocumentName(data.name);
        return data.data as BonafideData;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading draft from Supabase:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Try to load saved draft if it exists
  const loadSavedDraft = async () => {
    try {
      // If the user is logged in, try to load from Supabase first
      if (user && id) {
        const supabaseDraft = await loadDraftFromSupabase(id);
        if (supabaseDraft) {
          return supabaseDraft;
        }
      }
      
      // Fallback to localStorage if no Supabase draft is found
      const drafts = JSON.parse(localStorage.getItem('certificateDrafts') || '{}');
      return id && drafts[id] ? drafts[id] : null;
    } catch (error) {
      console.error("Error loading saved draft:", error);
      return null;
    }
  };

  const initialData = {
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
    includeDigitalSignature: false
  };

  const [certificateData, setCertificateData] = useState<BonafideData>(initialData);

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await loadSavedDraft();
      if (draft) {
        setCertificateData(draft);
      }
    };
    
    loadDraft();
  }, [id, user]);

  // Save draft functionality
  const handleSaveDraft = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save drafts to your account.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    if (existingDraft) {
      // If draft already exists, update it directly
      updateDraftInSupabase(existingDraft.id);
    } else {
      // Otherwise open the dialog to name the document
      setIsSaveDialogOpen(true);
    }
  };

  const createDraftInSupabase = async () => {
    if (!user || !documentName.trim()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('document_drafts')
        .insert({
          user_id: user.id,
          template_id: id || `template-${Date.now()}`,
          name: documentName,
          data: certificateData
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setExistingDraft(data as DocumentDraft);
      setIsSaveDialogOpen(false);
      
      toast({
        title: "Draft saved",
        description: "Your certificate draft has been saved successfully."
      });
      
      // Also save to localStorage as fallback
      const drafts = JSON.parse(localStorage.getItem('certificateDrafts') || '{}');
      const draftId = id || `draft-${Date.now()}`;
      drafts[draftId] = certificateData;
      localStorage.setItem('certificateDrafts', JSON.stringify(drafts));
    } catch (error: any) {
      toast({
        title: "Error saving draft",
        description: error.message || "There was an error saving your draft. Please try again.",
        variant: "destructive"
      });
      console.error("Save draft error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateDraftInSupabase = async (draftId: string) => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('document_drafts')
        .update({
          data: certificateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Draft updated",
        description: "Your certificate draft has been updated successfully."
      });
      
      // Also update localStorage as fallback
      const drafts = JSON.parse(localStorage.getItem('certificateDrafts') || '{}');
      const draftId = id || `draft-${Date.now()}`;
      drafts[draftId] = certificateData;
      localStorage.setItem('certificateDrafts', JSON.stringify(drafts));
    } catch (error: any) {
      toast({
        title: "Error updating draft",
        description: error.message || "There was an error updating your draft. Please try again.",
        variant: "destructive"
      });
      console.error("Update draft error:", error);
    } finally {
      setIsSaving(false);
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
  const handleCopyLink = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create shareable links.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    try {
      // First ensure draft is saved
      let draftId = existingDraft?.id;
      
      if (!draftId) {
        // If not saved yet, ask user to save
        toast({
          title: "Save required",
          description: "Please save your draft first to create a shareable link.",
        });
        setIsSaveDialogOpen(true);
        return;
      }
      
      // Create shared link in database
      const { data: sharedLink, error } = await supabase
        .from('shared_links')
        .insert({
          document_id: draftId,
          user_id: user.id,
          // Optional: Set expiration date for the link
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Generate a shareable link
      const shareableLink = `${window.location.origin}/templates/${id}?share=${sharedLink.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableLink);
      
      toast({
        title: "Link copied",
        description: "Certificate link copied to clipboard (valid for 30 days)"
      });
    } catch (err: any) {
      toast({
        title: "Copy failed",
        description: err.message || "Failed to copy link to clipboard",
        variant: "destructive"
      });
      console.error("Copy link error:", err);
    }
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
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading document...</p>
        </div>
      </DashboardLayout>
    );
  }

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
              {existingDraft?.name || "Bonafide Certificate"}
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
            disabled={isSaving || isExporting}
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Draft
          </Button>
          <Button onClick={handleExportPDF} className="gap-2" disabled={isExporting || isSaving}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} 
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportJPG} className="gap-2" disabled={isExporting || isSaving}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} 
            Export JPG
          </Button>
          <Button variant="outline" onClick={handleCopyLink} className="gap-2" disabled={isExporting || isSaving}>
            <Copy className="h-4 w-4" /> Copy Link
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2" disabled={isExporting || isSaving}>
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

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Draft</DialogTitle>
            <DialogDescription>
              Give your document a name to save it to your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Document Name</Label>
              <Input 
                id="name" 
                placeholder="Enter document name" 
                value={documentName} 
                onChange={(e) => setDocumentName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createDraftInSupabase} 
              disabled={!documentName.trim() || isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TemplateDetail;
