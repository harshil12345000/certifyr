import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AcademicTranscriptData } from '@/types/corporate-templates';

interface AcademicTranscriptFormProps {
  onSubmit: (data: AcademicTranscriptData) => void;
  initialData: AcademicTranscriptData;
}

export const AcademicTranscriptForm: React.FC<AcademicTranscriptFormProps> = ({ 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState<AcademicTranscriptData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof AcademicTranscriptData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onSubmit(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              onChange={(e) => handleChange('studentName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID *</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => handleChange('studentId', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fatherName">Father's Name *</Label>
            <Input
              id="fatherName"
              value={formData.fatherName}
              onChange={(e) => handleChange('fatherName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motherName">Mother's Name *</Label>
            <Input
              id="motherName"
              value={formData.motherName}
              onChange={(e) => handleChange('motherName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
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
            <Label htmlFor="courseTitle">Course Title *</Label>
            <Input
              id="courseTitle"
              value={formData.courseTitle}
              onChange={(e) => handleChange('courseTitle', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year *</Label>
            <Input
              id="academicYear"
              value={formData.academicYear}
              onChange={(e) => handleChange('academicYear', e.target.value)}
              placeholder="e.g., 2023-2024"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester/Year *</Label>
            <Input
              id="semester"
              value={formData.semester}
              onChange={(e) => handleChange('semester', e.target.value)}
              placeholder="e.g., Semester 1, Final Year"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class">Class/Division</Label>
            <Select onValueChange={(value) => handleChange('class', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first-class">First Class</SelectItem>
                <SelectItem value="second-class">Second Class</SelectItem>
                <SelectItem value="third-class">Third Class</SelectItem>
                <SelectItem value="distinction">Distinction</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subjects">Subjects & Marks *</Label>
          <Textarea
            id="subjects"
            value={formData.subjects}
            onChange={(e) => handleChange('subjects', e.target.value)}
            placeholder="List subjects with marks (e.g., Mathematics: 85, Physics: 92, Chemistry: 78)"
            className="min-h-[100px]"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cgpa">CGPA/GPA</Label>
            <Input
              id="cgpa"
              value={formData.cgpa}
              onChange={(e) => handleChange('cgpa', e.target.value)}
              placeholder="e.g., 8.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="percentage">Percentage</Label>
            <Input
              id="percentage"
              value={formData.percentage}
              onChange={(e) => handleChange('percentage', e.target.value)}
              placeholder="e.g., 85.5%"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grades">Overall Grade</Label>
            <Input
              id="grades"
              value={formData.grades}
              onChange={(e) => handleChange('grades', e.target.value)}
              placeholder="e.g., A, B+"
            />
          </div>
        </div>
      </div>

      {/* Institution Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Institution Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="institutionName">Institution Name *</Label>
            <Input
              id="institutionName"
              value={formData.institutionName}
              onChange={(e) => handleChange('institutionName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Issue Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="place">Place of Issue *</Label>
            <Input
              id="place"
              value={formData.place}
              onChange={(e) => handleChange('place', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signatoryName">Authorized Signatory Name *</Label>
            <Input
              id="signatoryName"
              value={formData.signatoryName}
              onChange={(e) => handleChange('signatoryName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="signatoryDesignation">Signatory Designation *</Label>
            <Input
              id="signatoryDesignation"
              value={formData.signatoryDesignation}
              onChange={(e) => handleChange('signatoryDesignation', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Digital Signature Option */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeDigitalSignature"
          checked={formData.includeDigitalSignature}
          onCheckedChange={(checked) => handleChange('includeDigitalSignature', checked)}
        />
        <Label htmlFor="includeDigitalSignature">Include Digital Signature</Label>
      </div>

      <Button type="submit" className="w-full">
        Generate Transcript
      </Button>
    </form>
  );
};
