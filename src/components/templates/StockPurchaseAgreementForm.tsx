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
  const [formData, setFormData] = useState<StockPurchaseAgreementData>(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await trackPreviewGeneration("stock-purchase-agreement-1", "update");
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
          <Label htmlFor="sellerName">Seller Name *</Label>
          <Input
            id="sellerName"
            value={formData.sellerName}
            onChange={(e) => handleChange("sellerName", e.target.value)}
            placeholder="Enter seller's name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyerName">Buyer Name *</Label>
          <Input
            id="buyerName"
            value={formData.buyerName}
            onChange={(e) => handleChange("buyerName", e.target.value)}
            placeholder="Enter buyer's name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfShares">Number of Shares *</Label>
          <Input
            id="numberOfShares"
            type="number"
            value={formData.numberOfShares}
            onChange={(e) => handleChange("numberOfShares", e.target.value)}
            placeholder="Enter number of shares"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sharePrice">Price per Share *</Label>
          <Input
            id="sharePrice"
            type="number"
            step="0.01"
            value={formData.sharePrice}
            onChange={(e) => handleChange("sharePrice", e.target.value)}
            placeholder="Enter price per share"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalPrice">Total Purchase Price *</Label>
          <Input
            id="totalPrice"
            type="number"
            step="0.01"
            value={formData.totalPrice}
            onChange={(e) => handleChange("totalPrice", e.target.value)}
            placeholder="Enter total purchase price"
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
        <Label htmlFor="representations">Representations *</Label>
        <Textarea
          id="representations"
          value={formData.representations}
          onChange={(e) => handleChange("representations", e.target.value)}
          placeholder="Specify representations and warranties"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="warranties">Warranties *</Label>
        <Textarea
          id="warranties"
          value={formData.warranties}
          onChange={(e) => handleChange("warranties", e.target.value)}
          placeholder="Specify warranties"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="covenants">Covenants *</Label>
        <Textarea
          id="covenants"
          value={formData.covenants}
          onChange={(e) => handleChange("covenants", e.target.value)}
          placeholder="Specify covenants and agreements"
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
