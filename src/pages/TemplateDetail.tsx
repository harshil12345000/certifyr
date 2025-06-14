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
import { EmbassyAttestationForm } from "@/components/templates/EmbassyAttestationForm";
import { EmbassyAttestationPreview } from "@/components/templates/EmbassyAttestationPreview";
import { CompletionCertificateForm } from "@/components/templates/CompletionCertificateForm";
import { CompletionCertificatePreview } from "@/components/templates/CompletionCertificatePreview";
import { TransferCertificateForm } from "@/components/templates/TransferCertificateForm";
import { TransferCertificatePreview } from "@/components/templates/TransferCertificatePreview";
import { NocVisaForm } from "@/components/templates/NocVisaForm";
import { NocVisaPreview } from "@/components/templates/NocVisaPreview";
import { IncomeCertificateForm } from "@/components/templates/IncomeCertificateForm";
import { IncomeCertificatePreview } from "@/components/templates/IncomeCertificatePreview";
import { BonafideData, ExperienceData, CharacterData, EmbassyAttestationData, CompletionCertificateData, TransferCertificateData, NocVisaData, IncomeCertificateData, FormData } from "@/types/templates";
import { popularTemplates } from "@/data/mockData";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";
import "./TemplateStyles.css";

const TemplateDetail = () => {
  const { id } = useParams();
  const template = popularTemplates.find(t => t.id === id) || {
    id: id || "unknown",
    title: getTemplateTitle(id),
    description: getTemplateDescription(id),
    category: getTemplateCategory(id)
  };

  function getTemplateTitle(id: string | undefined): string {
    switch (id) {
      case "embassy-attestation-1": return "Embassy Attestation Letter";
      case "completion-certificate-1": return "Completion Certificate";
      case "transfer-certificate-1": return "Transfer Certificate";
      case "noc-visa-1": return "NOC for Visa Application";
      case "income-certificate-1": return "Income Certificate";
      default: return "Unknown Template";
    }
  }

  function getTemplateDescription(id: string | undefined): string {
    switch (id) {
      case "embassy-attestation-1": return "Letter for document attestation at embassies";
      case "completion-certificate-1": return "Certificate for courses, training programs, internships";
      case "transfer-certificate-1": return "Certificate for students moving between institutions";
      case "noc-visa-1": return "No Objection Certificate for visa applications";
      case "income-certificate-1": return "Certificate stating employee income details";
      default: return "Template description";
    }
  }

  function getTemplateCategory(id: string | undefined): string {
    switch (id) {
      case "embassy-attestation-1": return "Travel";
      case "completion-certificate-1": return "Educational";
      case "transfer-certificate-1": return "Educational";
      case "noc-visa-1": return "Travel";
      case "income-certificate-1": return "Employment";
      default: return "General";
    }
  }

  // Initialize form data based on template type
  const getInitialData = (): FormData => {
    const commonFields = {
      institutionName: "",
      date: new Date().toLocaleDateString('en-CA'),
      place: "",
      signatoryName: "",
      signatoryDesignation: "",
      includeDigitalSignature: false,
    };

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
          ...commonFields,
        } as ExperienceData;
      case "character-1":
        return {
          fullName: "",
          parentName: "",
          address: "",
          duration: "",
          conduct: "",
          ...commonFields,
        } as CharacterData;
      case "embassy-attestation-1":
        return {
          fullName: "",
          passportNumber: "",
          nationality: "",
          dateOfBirth: "",
          placeOfBirth: "",
          fatherName: "",
          motherName: "",
          documentType: "",
          documentNumber: "",
          issuingAuthority: "",
          documentIssueDate: "",
          purposeOfAttestation: "",
          destinationCountry: "",
          embassyName: "",
          applicantAddress: "",
          phoneNumber: "",
          emailAddress: "",
          ...commonFields,
        } as EmbassyAttestationData;
      case "completion-certificate-1":
        return {
          fullName: "",
          fatherName: "",
          registrationNumber: "",
          courseTitle: "",
          courseDuration: "",
          completionDate: "",
          grade: "",
          percentage: "",
          programType: "course" as const,
          ...commonFields,
        } as CompletionCertificateData;
      case "transfer-certificate-1":
        return {
          fullName: "",
          fatherName: "",
          motherName: "",
          dateOfBirth: "",
          admissionNumber: "",
          class: "",
          section: "",
          academicYear: "",
          dateOfAdmission: "",
          dateOfLeaving: "",
          reasonForLeaving: "",
          conduct: "",
          subjects: "",
          ...commonFields,
        } as TransferCertificateData;
      case "noc-visa-1":
        return {
          fullName: "",
          designation: "",
          employeeId: "",
          department: "",
          passportNumber: "",
          visaType: "",
          destinationCountry: "",
          travelPurpose: "",
          travelDates: "",
          returnDate: "",
          sponsorDetails: "",
          ...commonFields,
        } as NocVisaData;
      case "income-certificate-1":
        return {
          fullName: "",
          fatherName: "",
          designation: "",
          employeeId: "",
          department: "",
          basicSalary: "",
          allowances: "",
          totalIncome: "",
          incomeFrequency: "monthly" as const,
          purpose: "",
          ...commonFields,
        } as IncomeCertificateData;
      default:
        return {
          fullName: "",
          gender: "male" as const,
          parentName: "",
          type: "student" as const,
          startDate: "",
          courseOrDesignation: "",
          department: "",
          purpose: "",
          ...commonFields,
        } as BonafideData;
    }
  };
  const [formData, setFormData] = useState<FormData>(getInitialData());

  const handleSubmit = (data: FormData) => {
    setFormData(data);
    console.log("Form submitted:", data);
    toast({
      title: "Form Data Updated",
      description: "Preview is now reflecting the new data.",
    });
  };

  const handlePrint = () => {
    document.body.classList.add('printing');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing');
      toast({
        title: "Print dialog opened",
        description: "Your document is ready to print."
      });
    }, 100);
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.querySelector('.a4-document');
      if (!element) {
        toast({
          title: "Error",
          description: "Document not found for download.",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your document."
      });

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      const imgData = canvas.toDataURL('image/png', 1.0);

      const a4Width = 210;
      const a4Height = 297;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const imgAspectRatio = imgWidth / imgHeight;
      const a4AspectRatio = a4Width / a4Height;
      let pdfImgWidth,
        pdfImgHeight,
        offsetX = 0,
        offsetY = 0;
      if (imgAspectRatio > a4AspectRatio) {
        pdfImgWidth = a4Width;
        pdfImgHeight = a4Width / imgAspectRatio;
        offsetY = (a4Height - pdfImgHeight) / 2;
      } else {
        pdfImgHeight = a4Height;
        pdfImgWidth = a4Height * imgAspectRatio;
        offsetX = (a4Width - pdfImgWidth) / 2;
      }
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, pdfImgWidth, pdfImgHeight);
      pdf.save(`${template?.title || 'document'}.pdf`);
      toast({
        title: "PDF Downloaded",
        description: "Your document has been downloaded in A4 format."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
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
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Generating JPG...",
        description: "Please wait while we prepare your image."
      });

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: Math.min(element.scrollWidth, 1654),
        height: Math.min(element.scrollHeight, 2339)
      });
      canvas.toBlob(blob => {
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
            description: "Your document has been downloaded."
          });
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error generating JPG:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the JPG. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderForm = () => {
    switch (id) {
      case "experience-1":
        return <ExperienceForm onSubmit={handleSubmit} initialData={formData as ExperienceData} />;
      case "character-1":
        return <CharacterForm onSubmit={handleSubmit} initialData={formData as CharacterData} />;
      case "embassy-attestation-1":
        return <EmbassyAttestationForm onSubmit={handleSubmit} initialData={formData as EmbassyAttestationData} />;
      case "completion-certificate-1":
        return <CompletionCertificateForm onSubmit={handleSubmit} initialData={formData as CompletionCertificateData} />;
      case "transfer-certificate-1":
        return <TransferCertificateForm onSubmit={handleSubmit} initialData={formData as TransferCertificateData} />;
      case "noc-visa-1":
        return <NocVisaForm onSubmit={handleSubmit} initialData={formData as NocVisaData} />;
      case "income-certificate-1":
        return <IncomeCertificateForm onSubmit={handleSubmit} initialData={formData as IncomeCertificateData} />;
      default:
        return <BonafideForm onSubmit={handleSubmit} initialData={formData as BonafideData} />;
    }
  };

  const renderPreview = () => {
    switch (id) {
      case "experience-1":
        return <ExperiencePreview data={formData as ExperienceData} />;
      case "character-1":
        return <CharacterPreview data={formData as CharacterData} />;
      case "embassy-attestation-1":
        return <EmbassyAttestationPreview data={formData as EmbassyAttestationData} />;
      case "completion-certificate-1":
        return <CompletionCertificatePreview data={formData as CompletionCertificateData} />;
      case "transfer-certificate-1":
        return <TransferCertificatePreview data={formData as TransferCertificateData} />;
      case "noc-visa-1":
        return <NocVisaPreview data={formData as NocVisaData} />;
      case "income-certificate-1":
        return <IncomeCertificatePreview data={formData as IncomeCertificateData} />;
      default:
        return <BonafidePreview data={formData as BonafideData} />;
    }
  };

  if (!template) {
    return <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Template not found</h1>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
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
        <Tabs defaultValue="form" className="w-full" onValueChange={() => { /* Reset scroll or any state if needed */ }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Document Details</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-medium mb-4">Fill in the details for your {template.title}</h2>
              {renderForm()}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Preview your {template.title}</h2>
                 {/* Could add zoom controls or other preview options here */}
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[600px] overflow-auto">
                {renderPreview()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};

export default TemplateDetail;
