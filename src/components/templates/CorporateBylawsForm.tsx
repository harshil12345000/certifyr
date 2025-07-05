import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CorporateBylawsData } from "@/types/corporate-templates";

interface CorporateBylawsFormProps {
  initialData: CorporateBylawsData;
  onSubmit: (data: CorporateBylawsData) => void;
}

export const CorporateBylawsForm: React.FC<CorporateBylawsFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CorporateBylawsData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="principalOffice">Principal Office Address *</Label>
          <Textarea
            id="principalOffice"
            value={formData.principalOffice}
            onChange={(e) => handleChange("principalOffice", e.target.value)}
            placeholder="Principal office address"
            rows={2}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="boardMeetingFrequency">
            Board Meeting Frequency *
          </Label>
          <Select
            value={formData.boardMeetingFrequency}
            onValueChange={(value) =>
              handleChange("boardMeetingFrequency", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="semi-annually">Semi-Annually</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shareholderMeetingDate">
            Annual Shareholder Meeting Date *
          </Label>
          <Input
            id="shareholderMeetingDate"
            value={formData.shareholderMeetingDate}
            onChange={(e) =>
              handleChange("shareholderMeetingDate", e.target.value)
            }
            placeholder="e.g., Second Tuesday of May"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fiscalYearEnd">Fiscal Year End *</Label>
          <Input
            id="fiscalYearEnd"
            value={formData.fiscalYearEnd}
            onChange={(e) => handleChange("fiscalYearEnd", e.target.value)}
            placeholder="e.g., December 31"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfDirectors">Number of Directors *</Label>
          <Select
            value={formData.numberOfDirectors}
            onValueChange={(value) => handleChange("numberOfDirectors", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select number" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="9">9</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="directorTermLength">Director Term Length *</Label>
          <Select
            value={formData.directorTermLength}
            onValueChange={(value) => handleChange("directorTermLength", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 year">1 Year</SelectItem>
              <SelectItem value="2 years">2 Years</SelectItem>
              <SelectItem value="3 years">3 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="officerTitles">Officer Titles *</Label>
          <Textarea
            id="officerTitles"
            value={formData.officerTitles}
            onChange={(e) => handleChange("officerTitles", e.target.value)}
            placeholder="e.g., President, Secretary, Treasurer"
            rows={2}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="votingRights">Voting Rights Description *</Label>
          <Textarea
            id="votingRights"
            value={formData.votingRights}
            onChange={(e) => handleChange("votingRights", e.target.value)}
            placeholder="Describe voting rights of shareholders"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="dividendPolicy">Dividend Policy *</Label>
          <Textarea
            id="dividendPolicy"
            value={formData.dividendPolicy}
            onChange={(e) => handleChange("dividendPolicy", e.target.value)}
            placeholder="Describe dividend distribution policy"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="amendmentProcess">Amendment Process *</Label>
          <Textarea
            id="amendmentProcess"
            value={formData.amendmentProcess}
            onChange={(e) => handleChange("amendmentProcess", e.target.value)}
            placeholder="Describe how bylaws can be amended"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adoptionDate">Adoption Date *</Label>
          <Input
            id="adoptionDate"
            type="date"
            value={formData.adoptionDate}
            onChange={(e) => handleChange("adoptionDate", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="place">Place of Adoption *</Label>
          <Input
            id="place"
            value={formData.place}
            onChange={(e) => handleChange("place", e.target.value)}
            placeholder="City, State"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatoryName">Secretary/Signatory Name *</Label>
          <Input
            id="signatoryName"
            value={formData.signatoryName}
            onChange={(e) => handleChange("signatoryName", e.target.value)}
            placeholder="Name of corporate secretary"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signatoryDesignation">Signatory Title *</Label>
          <Input
            id="signatoryDesignation"
            value={formData.signatoryDesignation}
            onChange={(e) =>
              handleChange("signatoryDesignation", e.target.value)
            }
            placeholder="e.g., Corporate Secretary"
            required
          />
        </div>

        <div className="flex items-center space-x-2 md:col-span-2">
          <Switch
            id="includeDigitalSignature"
            checked={formData.includeDigitalSignature}
            onCheckedChange={(checked) =>
              handleChange("includeDigitalSignature", checked)
            }
          />
          <Label htmlFor="includeDigitalSignature">
            Include Digital Signature
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Generate Corporate Bylaws
      </Button>
    </form>
  );
};
