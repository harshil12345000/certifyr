import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { DynamicForm } from '@/components/templates/DynamicForm';
import { DynamicPreview } from '@/components/templates/DynamicPreview';
import { getDocumentConfig } from '@/config/documentConfigs';
import { toast } from 'sonner';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the document config by ID
  const documentConfig = getDocumentConfig(id || '');
  
  // Initialize form data state
  const [formData, setFormData] = useState<any>({});

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

  const handleDownload = () => {
    // TODO: Implement PDF download
    toast.info('Download feature coming soon');
  };

  const handleShare = () => {
    // TODO: Implement document sharing
    toast.info('Share feature coming soon');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/documents')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{documentConfig.name}</h1>
              <p className="text-sm text-muted-foreground">{documentConfig.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
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
                <div className="scale-[0.7] origin-top">
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
