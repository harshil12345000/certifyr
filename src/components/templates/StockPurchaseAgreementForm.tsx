import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StockPurchaseAgreementData } from "@/types/corporate-templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";

interface StockPurchaseAgreementFormProps {
  initialData: StockPurchaseAgreementData;
  onSubmit: (data: StockPurchaseAgreementData) => void;
}

export const StockPurchaseAgreementForm: React.FC<
  StockPurchaseAgreementFormProps
> = ({ initialData, onSubmit }) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  const [formData, setFormData] =
    useState<StockPurchaseAgreementData>(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Track preview generation
    await trackPreviewGeneration("stock-purchase-agreement-1", "update");
    // Submit the form
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof StockPurchaseAgreementData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seller">Seller Name *</Label>
          <Input
            id="seller"
            value={formData.seller}
            onChange={(e) => handleChange("seller", e.target.value)}
            placeholder="Enter seller name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer">Buyer Name *</Label>
          <Input
            id="buyer"
            value={formData.buyer}
            onChange={(e) => handleChange("buyer", e.target.value)}
            placeholder="Enter buyer name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shares">Number of Shares *</Label>
          <Input
            id="shares"
            type="number"
            value={formData.shares}
            onChange={(e) => handleChange("shares", e.target.value)}
            placeholder="Enter number of shares"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricePerShare">Price per Share *</Label>
          <Input
            id="pricePerShare"
            type="number"
            step="0.01"
            value={formData.pricePerShare}
            onChange={(e) => handleChange("pricePerShare", e.target.value)}
            placeholder="Enter price per share"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalConsideration">Total Consideration *</Label>
          <Input
            id="totalConsideration"
            type="number"
            step="0.01"
            value={formData.totalConsideration}
            onChange={(e) => handleChange("totalConsideration", e.target.value)}
            placeholder="Enter total consideration"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closingDate">Closing Date *</Label>
          <Input
            id="closingDate"
            type="date"
            value={formData.closingDate}
            onChange={(e) => handleChange("closingDate", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="governingLaw">Governing Law *</Label>
          <Input
            id="governingLaw"
            value={formData.governingLaw}
            onChange={(e) => handleChange("governingLaw", e.target.value)}
            placeholder="Enter governing law"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="representations">Representations & Warranties *</Label>
        <Textarea
          id="representations"
          value={formData.representations}
          onChange={(e) => handleChange("representations", e.target.value)}
          placeholder="Enter representations and warranties"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="warranties">Additional Warranties *</Label>
        <Textarea
          id="warranties"
          value={formData.warranties}
          onChange={(e) => handleChange("warranties", e.target.value)}
          placeholder="Enter additional warranties"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="covenants">Covenants *</Label>
        <Textarea
          id="covenants"
          value={formData.covenants}
          onChange={(e) => handleChange("covenants", e.target.value)}
          placeholder="Enter covenants"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="place">Place *</Label>
          <Input
            id="place"
            value={formData.place}
            onChange={(e) => handleChange("place", e.target.value)}
            placeholder="e.g., San Francisco, CA"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatoryName">Signatory Name *</Label>
          <Input
            id="signatoryName"
            value={formData.signatoryName}
            onChange={(e) => handleChange("signatoryName", e.target.value)}
            placeholder="Enter signatory name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatoryDesignation">Signatory Designation *</Label>
          <Input
            id="signatoryDesignation"
            value={formData.signatoryDesignation}
            onChange={(e) => handleChange("signatoryDesignation", e.target.value)}
            placeholder="Enter signatory designation"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="includeDigitalSignature"
          checked={formData.includeDigitalSignature}
          onCheckedChange={(checked) =>
            handleChange("includeDigitalSignature", checked)
          }
        />
        <Label htmlFor="includeDigitalSignature">Include Digital Signature</Label>
      </div>

      <Button type="submit" className="w-full">
        Update Preview
      </Button>
    </form>
  );
};
