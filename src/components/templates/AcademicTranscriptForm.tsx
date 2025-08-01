
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    await trackPreviewGeneration("academic-transcript-1", "update");
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
            <Label htmlFor="courseTitle">Course/Program *</Label>
            <Input
              id="courseTitle"
              value={formData.courseTitle}
              onChange={(e) => handleChange("courseTitle", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year *</Label>
            <Input
              id="academicYear"
              value={formData.academicYear}
              onChange={(e) => handleChange("academicYear", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester *</Label>
            <Input
              id="semester"
              value={formData.semester}
              onChange={(e) => handleChange("semester", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjects">Subjects *</Label>
            <Textarea
              id="subjects"
              value={formData.subjects}
              onChange={(e) => handleChange("subjects", e.target.value)}
              placeholder="List subjects (one per line)"
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
            <Label htmlFor="percentage">Percentage *</Label>
            <Input
              id="percentage"
              value={formData.percentage}
              onChange={(e) => handleChange("percentage", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grades">Grades *</Label>
            <Input
              id="grades"
              value={formData.grades}
              onChange={(e) => handleChange("grades", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class">Class/Division *</Label>
            <Input
              id="class"
              value={formData.class}
              onChange={(e) => handleChange("class", e.target.value)}
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
            <Label htmlFor="institutionName">Institution Name *</Label>
            <Input
              id="institutionName"
              value={formData.institutionName}
              onChange={(e) => handleChange("institutionName", e.target.value)}
              required
            />
          </div>
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
