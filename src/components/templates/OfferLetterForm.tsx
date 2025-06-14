
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OfferLetterData } from '@/types/templates';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';

interface OfferLetterFormProps {
  initialData: OfferLetterData;
  onSubmit: (data: OfferLetterData) => void;
}

export const OfferLetterForm = ({ initialData, onSubmit }: OfferLetterFormProps) => {
  const [formData, setFormData] = useState<OfferLetterData>(initialData);
  const { user } = useAuth();
  const { organizationDetails } = useBranding();

  useEffect(() => {
    if (organizationDetails?.name && !formData.institutionName) {
      const updatedData = { ...formData, institutionName: organizationDetails.name };
      setFormData(updatedData);
      onSubmit(updatedData);
    }
  }, [organizationDetails, formData, onSubmit]);

  const handleInputChange = (field: keyof OfferLetterData, value: string | boolean) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onSubmit(updatedData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input
              id="candidateName"
              value={formData.candidateName}
              onChange={(e) => handleInputChange('candidateName', e.target.value)}
              placeholder="Enter candidate's full name"
            />
          </div>

          <div>
            <Label htmlFor="candidateAddress">Candidate Address</Label>
            <Textarea
              id="candidateAddress"
              value={formData.candidateAddress}
              onChange={(e) => handleInputChange('candidateAddress', e.target.value)}
              placeholder="Enter candidate's full address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Position Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              placeholder="Enter job title"
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              placeholder="Enter department"
            />
          </div>

          <div>
            <Label htmlFor="reportingManager">Reporting Manager</Label>
            <Input
              id="reportingManager"
              value={formData.reportingManager}
              onChange={(e) => handleInputChange('reportingManager', e.target.value)}
              placeholder="Enter reporting manager's name"
            />
          </div>

          <div>
            <Label htmlFor="startDate">Expected Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="probationPeriod">Probation Period</Label>
            <Input
              id="probationPeriod"
              value={formData.probationPeriod}
              onChange={(e) => handleInputChange('probationPeriod', e.target.value)}
              placeholder="e.g., 3 months, None"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compensation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salaryAmount">Salary Amount</Label>
              <Input
                id="salaryAmount"
                value={formData.salaryAmount}
                onChange={(e) => handleInputChange('salaryAmount', e.target.value)}
                placeholder="e.g., 50000"
              />
            </div>

            <div>
              <Label htmlFor="salaryCurrency">Currency</Label>
              <Input
                id="salaryCurrency"
                value={formData.salaryCurrency}
                onChange={(e) => handleInputChange('salaryCurrency', e.target.value)}
                placeholder="e.g., INR, USD"
              />
            </div>

            <div>
              <Label htmlFor="salaryFrequency">Salary Frequency</Label>
              <Select value={formData.salaryFrequency} onValueChange={(value) => handleInputChange('salaryFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              placeholder="Describe company benefits (e.g., Health Insurance, Paid Time Off, etc.)"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workHours">Work Hours</Label>
              <Input
                id="workHours"
                value={formData.workHours}
                onChange={(e) => handleInputChange('workHours', e.target.value)}
                placeholder="e.g., 9 AM to 6 PM, Mon-Fri"
              />
            </div>

            <div>
              <Label htmlFor="workLocation">Work Location</Label>
              <Input
                id="workLocation"
                value={formData.workLocation}
                onChange={(e) => handleInputChange('workLocation', e.target.value)}
                placeholder="e.g., Remote, Office Address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dateOfOffer">Date of Offer</Label>
            <Input
              id="dateOfOffer"
              type="date"
              value={formData.dateOfOffer}
              onChange={(e) => handleInputChange('dateOfOffer', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="acceptanceDeadline">Offer Acceptance Deadline</Label>
            <Input
              id="acceptanceDeadline"
              type="date"
              value={formData.acceptanceDeadline}
              onChange={(e) => handleInputChange('acceptanceDeadline', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="institutionName">Company/Institution Name</Label>
            <Input
              id="institutionName"
              value={formData.institutionName}
              onChange={(e) => handleInputChange('institutionName', e.target.value)}
              placeholder="Enter company/institution name"
            />
          </div>

          <div>
            <Label htmlFor="place">Place</Label>
            <Input
              id="place"
              value={formData.place}
              onChange={(e) => handleInputChange('place', e.target.value)}
              placeholder="Enter place"
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="signatoryName">Signatory Name</Label>
            <Input
              id="signatoryName"
              value={formData.signatoryName}
              onChange={(e) => handleInputChange('signatoryName', e.target.value)}
              placeholder="Enter signatory name"
            />
          </div>

          <div>
            <Label htmlFor="signatoryDesignation">Signatory Designation</Label>
            <Input
              id="signatoryDesignation"
              value={formData.signatoryDesignation}
              onChange={(e) => handleInputChange('signatoryDesignation', e.target.value)}
              placeholder="Enter signatory designation"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="includeDigitalSignature"
              checked={formData.includeDigitalSignature}
              onCheckedChange={(checked) => handleInputChange('includeDigitalSignature', checked)}
            />
            <Label htmlFor="includeDigitalSignature">Include Digital Signature</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
