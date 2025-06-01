
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { BonafideForm } from '@/components/templates/BonafideForm';
import { BonafidePreview } from '@/components/templates/BonafidePreview';
import { ExperienceForm } from '@/components/templates/ExperienceForm';
import { ExperiencePreview } from '@/components/templates/ExperiencePreview';
import { CharacterForm } from '@/components/templates/CharacterForm';
import { CharacterPreview } from '@/components/templates/CharacterPreview';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, Share2, Save } from 'lucide-react';
import { BonafideData, ExperienceData, CharacterData } from '@/types/templates';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const templateConfig = {
  'bonafide-1': {
    title: 'Bonafide Certificate',
    description: 'Official certificate confirming student/employee status',
    FormComponent: BonafideForm,
    PreviewComponent: BonafidePreview,
  },
  'experience-1': {
    title: 'Experience Certificate',
    description: 'Employment experience verification document',
    FormComponent: ExperienceForm,
    PreviewComponent: ExperiencePreview,
  },
  'character-1': {
    title: 'Character Certificate',
    description: 'Certificate of good character and conduct',
    FormComponent: CharacterForm,
    PreviewComponent: CharacterPreview,
  },
  'leave-application-1': {
    title: 'Leave Application',
    description: 'Standard format for leave requests',
    FormComponent: BonafideForm, // Placeholder - you can create specific forms later
    PreviewComponent: BonafidePreview,
  },
  'address-proof-1': {
    title: 'Address Proof',
    description: 'Verification of residential address',
    FormComponent: BonafideForm,
    PreviewComponent: BonafidePreview,
  },
  'income-certificate-1': {
    title: 'Income Certificate',
    description: 'Official proof of annual income',
    FormComponent: BonafideForm,
    PreviewComponent: BonafidePreview,
  },
};

const TemplateDetail = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<BonafideData | ExperienceData | CharacterData | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  const config = templateConfig[templateId as keyof typeof templateConfig];

  if (!config) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-2xl font-semibold mb-2">Template Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested template could not be found.</p>
          <Button asChild>
            <Link to="/templates">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { title, description, FormComponent, PreviewComponent } = config;

  const handleFormSubmit = (data: any) => {
    setFormData(data);
    setActiveTab('preview');
    toast({
      title: "Certificate generated",
      description: "Your certificate has been generated successfully.",
    });
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('certificate-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your certificate has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    toast({
      title: "Share feature coming soon",
      description: "This feature will be available in a future update.",
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your certificate draft has been saved.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/templates">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
          
          {formData && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'form' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('form')}
          >
            Fill Details
          </Button>
          <Button
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('preview')}
            disabled={!formData}
          >
            Preview
          </Button>
        </div>

        {/* Content */}
        <div className="glass-card p-6">
          {activeTab === 'form' ? (
            <FormComponent onSubmit={handleFormSubmit} initialData={formData} />
          ) : (
            <div id="certificate-preview">
              <PreviewComponent data={formData} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TemplateDetail;
