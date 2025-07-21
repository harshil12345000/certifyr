import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CorporateBylawsData } from "@/types/corporate-templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CorporateBylawsFormProps {
  initialData: CorporateBylawsData;
  onSubmit: (data: CorporateBylawsData) => void;
}

export const CorporateBylawsForm: React.FC<CorporateBylawsFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  const [formData, setFormData] = useState<CorporateBylawsData>(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Track preview generation
    await trackPreviewGeneration("corporate-bylaws-1", "update");
    // Submit the form
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof CorporateBylawsData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="corporationName">Corporation Name *</Label>
          <Input
            id="corporationName"
            value={formData.corporationName}
            onChange={(e) => handleChange("corporationName", e.target.value)}
            placeholder="e.g., ABC Corporation"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stateOfIncorporation">State of Incorporation *</Label>
          <Select
            value={formData.stateOfIncorporation}
            onValueChange={(value) =>
              handleChange("stateOfIncorporation", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="california">California</SelectItem>
              <SelectItem value="delaware">Delaware</SelectItem>
              <SelectItem value="nevada">Nevada</SelectItem>
              <SelectItem value="texas">Texas</SelectItem>
              <SelectItem value="florida">Florida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registeredOffice">Registered Office *</Label>
          <Input
            id="registeredOffice"
            value={formData.registeredOffice}
            onChange={(e) => handleChange("registeredOffice", e.target.value)}
            placeholder="Enter registered office address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fiscalYear">Fiscal Year End *</Label>
          <Input
            id="fiscalYear"
            type="date"
            value={formData.fiscalYear}
            onChange={(e) => handleChange("fiscalYear", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="boardMembers">Board Members *</Label>
          <Textarea
            id="boardMembers"
            value={formData.boardMembers}
            onChange={(e) => handleChange("boardMembers", e.target.value)}
            placeholder="List board members (one per line)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="officers">Corporate Officers *</Label>
          <Textarea
            id="officers"
            value={formData.officers}
            onChange={(e) => handleChange("officers", e.target.value)}
            placeholder="List officers and their positions"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stockClasses">Stock Classes *</Label>
          <Textarea
            id="stockClasses"
            value={formData.stockClasses}
            onChange={(e) => handleChange("stockClasses", e.target.value)}
            placeholder="Describe stock classes and rights"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="votingRights">Voting Rights *</Label>
          <Textarea
            id="votingRights"
            value={formData.votingRights}
            onChange={(e) => handleChange("votingRights", e.target.value)}
            placeholder="Describe voting rights"
            required
          />
        </div>

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

      <div className="space-y-2">
        <Label htmlFor="amendmentProcedure">Amendment Procedure *</Label>
        <Textarea
          id="amendmentProcedure"
          value={formData.amendmentProcedure}
          onChange={(e) => handleChange("amendmentProcedure", e.target.value)}
          placeholder="Describe the procedure for amending bylaws"
          required
        />
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
