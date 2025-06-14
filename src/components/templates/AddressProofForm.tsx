
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressProofData } from '@/types/templates';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';

interface AddressProofFormProps {
  initialData: AddressProofData;
  onDataChange: (data: AddressProofData) => void;
}

export const AddressProofForm = ({ initialData, onDataChange }: AddressProofFormProps) => {
  const [formData, setFormData] = useState<AddressProofData>(initialData);
  const { user } = useAuth();
  const { organizationDetails } = useBranding();

  useEffect(() => {
    if (organizationDetails?.name && !formData.institutionName) {
      const updatedData = { ...formData, institutionName: organizationDetails.name };
      setFormData(updatedData);
      onDataChange(updatedData);
    }
  }, [organizationDetails, formData, onDataChange]);

  const handleInputChange = (field: keyof AddressProofData, value: string | boolean) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <Label htmlFor="fatherName">Father's Name</Label>
            <Input
              id="fatherName"
              value={formData.fatherName}
              onChange={(e) => handleInputChange('fatherName', e.target.value)}
              placeholder="Enter father's name"
            />
          </div>

          <div>
            <Label htmlFor="relationshipWithApplicant">Relationship with Applicant</Label>
            <Select value={formData.relationshipWithApplicant} onValueChange={(value) => handleInputChange('relationshipWithApplicant', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Self</SelectItem>
                <SelectItem value="father">Father</SelectItem>
                <SelectItem value="mother">Mother</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentAddress">Current Address</Label>
            <Textarea
              id="currentAddress"
              value={formData.currentAddress}
              onChange={(e) => handleInputChange('currentAddress', e.target.value)}
              placeholder="Enter current address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="permanentAddress">Permanent Address</Label>
            <Textarea
              id="permanentAddress"
              value={formData.permanentAddress}
              onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
              placeholder="Enter permanent address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="residenceDuration">Duration of Residence</Label>
            <Input
              id="residenceDuration"
              value={formData.residenceDuration}
              onChange={(e) => handleInputChange('residenceDuration', e.target.value)}
              placeholder="e.g., 5 years, 2 months"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ID Proof Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="idProofType">ID Proof Type</Label>
            <Select value={formData.idProofType} onValueChange={(value) => handleInputChange('idProofType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select ID proof type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadhar">Aadhar Card</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="voter_id">Voter ID Card</SelectItem>
                <SelectItem value="driving_license">Driving License</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="idProofNumber">ID Proof Number</Label>
            <Input
              id="idProofNumber"
              value={formData.idProofNumber}
              onChange={(e) => handleInputChange('idProofNumber', e.target.value)}
              placeholder="Enter ID proof number"
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
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              placeholder="Enter purpose for the certificate"
            />
          </div>

          <div>
            <Label htmlFor="institutionName">Institution Name</Label>
            <Input
              id="institutionName"
              value={formData.institutionName}
              onChange={(e) => handleInputChange('institutionName', e.target.value)}
              placeholder="Enter institution name"
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
