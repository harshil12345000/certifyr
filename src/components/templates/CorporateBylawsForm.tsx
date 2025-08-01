

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
    await trackPreviewGeneration("corporate-bylaws-1", "update");
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
          <Label htmlFor="fiscalYearEnd">Fiscal Year End *</Label>
          <Input
            id="fiscalYearEnd"
            type="date"
            value={formData.fiscalYearEnd}
            onChange={(e) => handleChange("fiscalYearEnd", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfDirectors">Number of Directors *</Label>
          <Input
            id="numberOfDirectors"
            value={formData.numberOfDirectors}
            onChange={(e) => handleChange("numberOfDirectors", e.target.value)}
            placeholder="e.g., 3"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="directorTermLength">Director Term Length *</Label>
          <Input
            id="directorTermLength"
            value={formData.directorTermLength}
            onChange={(e) => handleChange("directorTermLength", e.target.value)}
            placeholder="e.g., 1 year"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="officerTitles">Officer Titles *</Label>
          <Textarea
            id="officerTitles"
            value={formData.officerTitles}
            onChange={(e) => handleChange("officerTitles", e.target.value)}
            placeholder="List officer titles"
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
          <Label htmlFor="boardMeetingFrequency">Board Meeting Frequency *</Label>
          <Input
            id="boardMeetingFrequency"
            value={formData.boardMeetingFrequency}
            onChange={(e) => handleChange("boardMeetingFrequency", e.target.value)}
            placeholder="e.g., Monthly"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shareholderMeetingDate">Shareholder Meeting Date *</Label>
          <Input
            id="shareholderMeetingDate"
            value={formData.shareholderMeetingDate}
            onChange={(e) => handleChange("shareholderMeetingDate", e.target.value)}
            placeholder="e.g., First Monday in May"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dividendPolicy">Dividend Policy *</Label>
          <Textarea
            id="dividendPolicy"
            value={formData.dividendPolicy}
            onChange={(e) => handleChange("dividendPolicy", e.target.value)}
            placeholder="Describe dividend policy"
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
        <Label htmlFor="amendmentProcess">Amendment Process *</Label>
        <Textarea
          id="amendmentProcess"
          value={formData.amendmentProcess}
          onChange={(e) => handleChange("amendmentProcess", e.target.value)}
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

