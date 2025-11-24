import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Printer, Save } from 'lucide-react';
import { DynamicForm } from '@/components/templates/DynamicForm';
import { DynamicPreview } from '@/components/templates/DynamicPreview';
import { getDocumentConfig } from '@/config/documentConfigs';
import { getInitialData } from '@/lib/document-initial-data';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { useDocumentHistory } from '@/hooks/useDocumentHistory';
import { useOrganizationSecurity } from '@/hooks/useOrganizationSecurity';

// Helper function to parse organization location to "City, Country" format
const parseLocation = (location: string | null | undefined): string => {
  if (!location) return '';
  // Format: "1111, 27 Antath Street||Pune||Maharashtra||412115||India"
  // Extract city (3rd segment) and country (last segment)
  const parts = location.split('||').map(part => part.trim());
  if (parts.length >= 2) {
    const city = parts[1] || ''; // Second segment is city
    const country = parts[parts.length - 1] || ''; // Last segment is country
    return `${city}, ${country}`;
  }
  return location;
};

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organizationId } = useOrganizationSecurity();
  const { saveDocument } = useDocumentHistory();
  const { userProfile, organizationDetails, isLoading: brandingLoading } = useBranding();
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Find the document config by ID
  const documentConfig = getDocumentConfig(id || '');
  
  // Initialize form data state with default values
  const [formData, setFormData] = useState<any>(() => getInitialData(id || ''));
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-populate form data with user profile information
  useEffect(() => {
    if (brandingLoading || !userProfile) return;

    // Only update if fields are empty (preserve user edits)
    setFormData((prev: any) => ({
      ...prev,
      // Auto-populate place from organization location
      place: prev.place || parseLocation(userProfile.organizationLocation),
      // Auto-populate signatory name from user profile
      signatoryName: prev.signatoryName || 
        `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
      // Auto-populate signatory designation from user profile
      signatoryDesignation: prev.signatoryDesignation || userProfile.designation || '',
    }));
  }, [userProfile, brandingLoading]);

  if (!documentConfig) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p>Document not found</p>
          <Button onClick={() => navigate('/documents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    
    setIsProcessing(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${documentConfig?.name || 'document'}.pdf`);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    if (!previewRef.current) return;
    
    const printWindow = window.open('', '', 'height=842,width=595');
    if (!printWindow) return;
    
    // Get all stylesheets from the current document
    const styleSheets = Array.from(document.styleSheets);
    let allStyles = '';
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          allStyles += rule.cssText + '\n';
        });
      } catch (e) {
        // Handle CORS errors for external stylesheets
        console.warn('Could not access stylesheet:', e);
      }
    });
    
    // Build the print document with all styles
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Document</title>
          <style>
            @page { 
              size: A4; 
              margin: 0; 
            }
            html, body { 
              margin: 0; 
              padding: 0;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }
            ${allStyles}
          </style>
        </head>
        <body>
          ${previewRef.current.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content and styles to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleSaveDocument = async () => {
    if (!user) {
      toast.error('You must be logged in to save documents');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Use the hook's saveDocument function which handles organization lookup,
      // duplicate checking, and syncing with document_drafts
      const result = await saveDocument(
        documentConfig?.name || 'Untitled Document',
        formData,
        documentConfig?.id || id || ''
      );
      
      if (result && organizationId) {
        // Increment documents_created stat
        await supabase.rpc('increment_user_stat', {
          p_user_id: user.id,
          p_organization_id: organizationId,
          p_stat_field: 'documents_created'
        });
      }
      
    } catch (error) {
      console.error('Save document error:', error);
      toast.error('Failed to save document');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/documents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{documentConfig.name}</h1>
            <p className="text-sm text-muted-foreground">{documentConfig.description}</p>
          </div>
        </div>

        {/* Form and Preview Tabs */}
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Card>
              <CardContent className="pt-6">
                <DynamicForm
                  config={documentConfig}
                  initialData={formData}
                  onSubmit={setFormData}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6">
                {/* Action Buttons */}
                <div className="flex gap-2 mb-6 pb-4 border-b">
                  <Button 
                    onClick={handleDownloadPDF} 
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={isProcessing}
                    variant="default"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button 
                    onClick={handlePrint}
                    onMouseDown={(e) => e.preventDefault()}
                    variant="outline"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button 
                    onClick={handleSaveDocument} 
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={isProcessing}
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Document
                  </Button>
                </div>

                {/* Preview Content */}
                <div ref={previewRef} className="w-full">
                  <DynamicPreview config={documentConfig} data={formData} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
