import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AcademicTranscriptData } from "@/types/corporate-templates";
import { usePreviewTracking } from "@/hooks/usePreviewTracking";

interface AcademicTranscriptFormProps {
  onSubmit: (data: AcademicTranscriptData) => void;
  initialData: AcademicTranscriptData;
}

export const AcademicTranscriptForm: React.FC<AcademicTranscriptFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { trackPreviewGeneration } = usePreviewTracking();
  const [formData, setFormData] = useState<AcademicTranscriptData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof AcademicTranscriptData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onSubmit(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Track preview generation
    await trackPreviewGeneration("academic-transcript-1", "update");
    // Submit the form
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Student Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name *</Label>
            <Input
              id="studentName"
              value={formData.studentName}
              onChange={(e) => handleChange("studentName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID *</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fatherName">Father's Name *</Label>
            <Input
              id="fatherName"
              value={formData.fatherName}
              onChange={(e) => handleChange("fatherName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motherName">Mother's Name *</Label>
            <Input
              id="motherName"
              value={formData.motherName}
              onChange={(e) => handleChange("motherName", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Academic Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Academic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course/Program *</Label>
            <Input
              id="course"
              value={formData.course}
              onChange={(e) => handleChange("course", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="enrollmentYear">Enrollment Year *</Label>
            <Input
              id="enrollmentYear"
              type="number"
              value={formData.enrollmentYear}
              onChange={(e) => handleChange("enrollmentYear", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduationYear">Graduation Year *</Label>
            <Input
              id="graduationYear"
              type="number"
              value={formData.graduationYear}
              onChange={(e) => handleChange("graduationYear", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Academic Performance Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Academic Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cgpa">CGPA *</Label>
            <Input
              id="cgpa"
              type="number"
              step="0.01"
              value={formData.cgpa}
              onChange={(e) => handleChange("cgpa", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">Grade/Division *</Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) => handleChange("grade", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Signatory Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Signatory Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signatoryName">Signatory Name *</Label>
            <Input
              id="signatoryName"
              value={formData.signatoryName}
              onChange={(e) => handleChange("signatoryName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatoryDesignation">Signatory Designation *</Label>
            <Input
              id="signatoryDesignation"
              value={formData.signatoryDesignation}
              onChange={(e) => handleChange("signatoryDesignation", e.target.value)}
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
              required
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
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
