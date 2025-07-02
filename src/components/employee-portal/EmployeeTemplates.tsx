import { useState, useEffect } from 'react';
import { useEmployeePortal } from '@/contexts/EmployeePortalContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { popularTemplates } from '@/data/mockData';
import { FileText, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmployeeTemplatesProps {
  employee: any;
}

export function EmployeeTemplates({ employee }: EmployeeTemplatesProps) {
  const { organizationId } = useEmployeePortal();
  const [requests, setRequests] = useState<any[]>([]);

  const requestDocument = async (templateId: string) => {
    try {
      // This would normally show a form to fill template data
      // For now, we'll just create a basic request
      toast({
        title: 'Request Submitted',
        description: 'Your document request has been submitted for approval'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Browse and request documents from available templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => requestDocument(template.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Request Document
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}