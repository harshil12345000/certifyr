
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StockPurchaseAgreementData } from '@/types/corporate-templates';

interface StockPurchaseAgreementFormProps {
  initialData: StockPurchaseAgreementData;
  onSubmit: (data: StockPurchaseAgreementData) => void;
}

export const StockPurchaseAgreementForm: React.FC<StockPurchaseAgreementFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<StockPurchaseAgreementData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof StockPurchaseAgreementData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="purchaserName">Purchaser Name *</Label>
          <Input
            id="purchaserName"
            value={formData.purchaserName}
            onChange={(e) => handleChange('purchaserName', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellerName">Seller Name *</Label>
          <Input
            id="sellerName"
            value={formData.sellerName}
            onChange={(e) => handleChange('sellerName', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shareClass">Share Class *</Label>
          <Select value={formData.shareClass} onValueChange={(value) => handleChange('shareClass', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select share class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="common">Common Stock</SelectItem>
              <SelectItem value="preferred">Preferred Stock</SelectItem>
              <SelectItem value="class-a">Class A Common</SelectItem>
              <SelectItem value="class-b">Class B Common</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfShares">Number of Shares *</Label>
          <Input
            id="numberOfShares"
            value={formData.numberOfShares}
            onChange={(e) => handleChange('numberOfShares', e.target.value)}
            placeholder="e.g., 10,000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sharePrice">Price per Share *</Label>
          <Input
            id="sharePrice"
            value={formData.sharePrice}
            onChange={(e) => handleChange('sharePrice', e.target.value)}
            placeholder="e.g., $10.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalPurchasePrice">Total Purchase Price *</Label>
          <Input
            id="totalPurchasePrice"
            value={formData.totalPurchasePrice}
            onChange={(e) => handleChange('totalPurchasePrice', e.target.value)}
            placeholder="e.g., $100,000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closingDate">Closing Date *</Label>
          <Input
            id="closingDate"
            type="date"
            value={formData.closingDate}
            onChange={(e) => handleChange('closingDate', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="purchaserAddress">Purchaser Address *</Label>
          <Textarea
            id="purchaserAddress"
            value={formData.purchaserAddress}
            onChange={(e) => handleChange('purchaserAddress', e.target.value)}
            rows={2}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sellerAddress">Seller Address *</Label>
          <Textarea
            id="sellerAddress"
            value={formData.sellerAddress}
            onChange={(e) => handleChange('sellerAddress', e.target.value)}
            rows={2}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="restrictionsOnTransfer">Restrictions on Transfer *</Label>
          <Textarea
            id="restrictionsOnTransfer"
            value={formData.restrictionsOnTransfer}
            onChange={(e) => handleChange('restrictionsOnTransfer', e.target.value)}
            placeholder="Describe any restrictions on transferring the shares"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="representationsWarranties">Representations and Warranties *</Label>
          <Textarea
            id="representationsWarranties"
            value={formData.representationsWarranties}
            onChange={(e) => handleChange('representationsWarranties', e.target.value)}
            placeholder="Key representations and warranties"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="governingLaw">Governing Law *</Label>
          <Input
            id="governingLaw"
            value={formData.governingLaw}
            onChange={(e) => handleChange('governingLaw', e.target.value)}
            placeholder="e.g., State of Delaware"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="place">Place of Signing *</Label>
          <Input
            id="place"
            value={formData.place}
            onChange={(e) => handleChange('place', e.target.value)}
            placeholder="City, State"
            required
          />
        </div>

        <div className="flex items-center space-x-2 md:col-span-2">
          <Switch
            id="includeDigitalSignature"
            checked={formData.includeDigitalSignature}
            onCheckedChange={(checked) => handleChange('includeDigitalSignature', checked)}
          />
          <Label htmlFor="includeDigitalSignature">Include Digital Signatures</Label>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Generate Stock Purchase Agreement
      </Button>
    </form>
  );
};
