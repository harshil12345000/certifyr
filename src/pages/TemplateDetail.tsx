
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Copy, Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BonafideForm } from "@/components/templates/BonafideForm";
import { BonafidePreview } from "@/components/templates/BonafidePreview";
import { BonafideData } from "@/types/templates";
import { useToast } from "@/hooks/use-toast";

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [certificateData, setCertificateData] = useState<BonafideData>({
    fullName: "",
    gender: "male",
    parentName: "",
    type: "student",
    institutionName: "ABC University",
    startDate: "",
    courseOrDesignation: "",
    department: "",
    purpose: "",
    date: new Date().toISOString().split('T')[0],
    place: "Mumbai, Maharashtra",
    signatoryName: "Dr. Anil Kumar",
    signatoryDesignation: "Principal",
  });

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your certificate draft has been saved successfully."
    });
  };

  const handleExport = (format: "pdf" | "jpg") => {
    // This would be replaced with actual export logic
    toast({
      title: `Exporting as ${format.toUpperCase()}`,
      description: "Your certificate is being exported..."
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Your certificate has been exported as ${format.toUpperCase()}`
      });
    }, 1500);
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
          <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
          <Button onClick={() => handleExport("pdf")} className="gap-2">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("jpg")} className="gap-2">
            <Download className="h-4 w-4" /> Export JPG
          </Button>
          <Button variant="outline" className="gap-2">
            <Copy className="h-4 w-4" /> Copy Link
          </Button>
          <Button variant="outline" className="gap-2">
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
              <BonafidePreview data={certificateData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TemplateDetail;
