// Configuration-driven document system
// This file contains all document type configurations

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select' | 'switch' | 'number';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  dynamicLabel?: (data: any) => string;
  condition?: string;
  defaultValue?: any;
}

export interface SectionConfig {
  id: string;
  title: string;
  columns?: number;
  fields: FieldConfig[];
}

export interface DocumentConfig {
  id: string;
  name: string;
  description?: string;
  category: string;
  layoutType: 'certificate' | 'letter' | 'agreement' | 'transcript';
  /** If defined, only these org types can access this document. Undefined = all orgs. */
  allowedOrgTypes?: string[];
  sections: SectionConfig[];
}

// ========================================
// 1. BONAFIDE CERTIFICATE
// ========================================
export const bonafideConfig: DocumentConfig = {
  id: "bonafide",
  name: "Bonafide Certificate",
  description: "Standard bonafide certificate for students or employees.",
  category: "academic",
  layoutType: "certificate",
  
  sections: [
    {
      id: "person-details",
      title: "Person Details",
      columns: 1,
      fields: [
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Name must be at least 2 characters" }
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: true,
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" }
          ]
        },
        {
          name: "parentName",
          label: "Parent's Name",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Parent name must be at least 2 characters" }
        },
        {
          name: "type",
          label: "Person Type",
          type: "select",
          required: true,
          options: [
            { value: "student", label: "Student" },
            { value: "employee", label: "Employee" }
          ]
        }
      ]
    },
    {
      id: "institution-role",
      title: "Institution & Role",
      columns: 1,
      fields: [
        {
          name: "institutionName",
          label: "Institution Name",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Institution name is required" }
        },
        {
          name: "startDate",
          label: "Start Date",
          type: "date",
          required: true
        },
        {
          name: "courseOrDesignation",
          label: "Course/Designation",
          type: "text",
          required: true,
          dynamicLabel: (data: any) => data.type === "student" ? "Course Name" : "Designation",
          validation: { minLength: 2, message: "Course/Designation is required" }
        },
        {
          name: "department",
          label: "Department",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Department is required" }
        }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 1,
      fields: [
        {
          name: "purpose",
          label: "Purpose",
          type: "textarea",
          required: true,
          placeholder: "e.g., passport application, bank account, visa processing",
          validation: { minLength: 2, message: "Purpose is required" }
        },
        {
          name: "date",
          label: "Issue Date",
          type: "date",
          required: true
        },
        {
          name: "place",
          label: "Place",
          type: "text",
          required: true,
          placeholder: "City, Country",
          validation: { minLength: 2, message: "Place is required" }
        }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        {
          name: "signatoryName",
          label: "Signatory Name",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Signatory name is required" }
        },
        {
          name: "signatoryDesignation",
          label: "Designation",
          type: "text",
          required: true,
          validation: { minLength: 2, message: "Designation is required" }
        },
        {
          name: "includeDigitalSignature",
          label: "Digital Signature",
          type: "switch",
          description: "Include digital signature in the certificate",
          defaultValue: false
        }
      ]
    }
  ]
};

// ========================================
// 2. CHARACTER CERTIFICATE
// ========================================
export const characterConfig: DocumentConfig = {
  id: "character",
  name: "Character Certificate",
  description: "Certificate attesting to an individual's moral character.",
  category: "academic",
  layoutType: "certificate",
  
  sections: [
    {
      id: "personal-details",
      title: "Personal Details",
      columns: 2,
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true, validation: { minLength: 2, message: "Name must be at least 2 characters" } },
        { name: "gender", label: "Gender", type: "select", required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }] },
        { name: "parentName", label: "Parent's Name", type: "text", required: true, validation: { minLength: 2, message: "Parent name required" } },
        { name: "address", label: "Address", type: "textarea", required: true, placeholder: "Complete residential address", validation: { minLength: 5, message: "Address is required" } },
        { name: "duration", label: "Duration Known", type: "text", required: true, placeholder: "e.g., 5 years, Since 2020", validation: { minLength: 1, message: "Duration is required" } }
      ]
    },
    {
      id: "character-details",
      title: "Character Details",
      columns: 1,
      fields: [
        { name: "conduct", label: "Character & Conduct", type: "textarea", required: true, placeholder: "Describe the person's character, behavior, and moral conduct", validation: { minLength: 2, message: "Conduct description is required" } },
        { name: "institutionName", label: "Institution Name", type: "text", required: true, validation: { minLength: 2, message: "Institution name is required" } }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 2,
      fields: [
        { name: "date", label: "Issue Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, validation: { minLength: 2, message: "Place is required" } }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true, validation: { minLength: 2, message: "Signatory name is required" } },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true, validation: { minLength: 2, message: "Designation is required" } },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", description: "Include digital signature in the certificate", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 3. EXPERIENCE CERTIFICATE
// ========================================
export const experienceConfig: DocumentConfig = {
  id: "experience",
  name: "Experience Certificate",
  description: "Formal letter confirming an individual's work experience.",
  category: "employment",
  layoutType: "certificate",
  
  sections: [
    {
      id: "employee-details",
      title: "Employee Details",
      columns: 2,
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true, validation: { minLength: 2, message: "Full name is required" } },
        { name: "gender", label: "Gender", type: "select", required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }] },
        { name: "designation", label: "Designation", type: "text", required: true, validation: { minLength: 2, message: "Designation is required" } },
        { name: "employeeId", label: "Employee ID", type: "text", required: true, validation: { minLength: 1, message: "Employee ID is required" } },
        { name: "department", label: "Department", type: "text", required: true, validation: { minLength: 2, message: "Department is required" } }
      ]
    },
    {
      id: "employment-period",
      title: "Employment Period",
      columns: 2,
      fields: [
        { name: "joiningDate", label: "Joining Date", type: "date", required: true },
        { name: "relievingDate", label: "Relieving Date", type: "date", required: true }
      ]
    },
    {
      id: "work-description",
      title: "Work Description",
      columns: 1,
      fields: [
        { name: "workDescription", label: "Work Description", type: "textarea", required: true, placeholder: "Describe the employee's work and responsibilities", validation: { minLength: 10, message: "Work description is required" } },
        { name: "conduct", label: "Conduct & Performance", type: "textarea", required: true, placeholder: "Describe conduct and performance", validation: { minLength: 5, message: "Conduct description is required" } }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 2,
      fields: [
        { name: "date", label: "Issue Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country", validation: { minLength: 2, message: "Place is required" } }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true, validation: { minLength: 2, message: "Signatory name is required" } },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true, validation: { minLength: 2, message: "Designation is required" } },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", description: "Include digital signature", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 4. TRANSFER CERTIFICATE
// ========================================
export const transferConfig: DocumentConfig = {
  id: "transfer",
  name: "Transfer Certificate",
  description: "Certificate for students moving between institutions",
  category: "academic",
  layoutType: "certificate",
  allowedOrgTypes: ["Educational Institute", "Other"],
  
  sections: [
    {
      id: "student-details",
      title: "Student Details",
      columns: 2,
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "fatherName", label: "Father's Name", type: "text", required: true },
        { name: "motherName", label: "Mother's Name", type: "text", required: true },
        { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
        { name: "class", label: "Class", type: "text", required: true },
        { name: "section", label: "Section", type: "text", required: true },
        { name: "rollNumber", label: "Roll Number", type: "text", required: true },
        { name: "admissionNumber", label: "Admission Number", type: "text", required: true }
      ]
    },
    {
      id: "academic-details",
      title: "Academic Details",
      columns: 2,
      fields: [
        { name: "admissionDate", label: "Admission Date", type: "date", required: true },
        { name: "lastAttendanceDate", label: "Last Attendance Date", type: "date", required: true },
        { name: "reasonForLeaving", label: "Reason for Leaving", type: "textarea", required: true },
        { name: "conduct", label: "Conduct", type: "text", required: true },
        { name: "subjects", label: "Subjects", type: "textarea", required: true, placeholder: "List subjects studied" }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 2,
      fields: [
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "date", label: "Issue Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 5. ACADEMIC TRANSCRIPT
// ========================================
export const academicTranscriptConfig: DocumentConfig = {
  id: "academic-transcript",
  name: "Academic Transcript",
  description: "Official academic record and transcript",
  category: "academic",
  layoutType: "transcript",
  allowedOrgTypes: ["Educational Institute", "Other"],
  
  sections: [
    {
      id: "student-details",
      title: "Student Details",
      columns: 2,
      fields: [
        { name: "studentName", label: "Student Name", type: "text", required: true },
        { name: "studentId", label: "Student ID", type: "text", required: true },
        { name: "fatherName", label: "Father's Name", type: "text", required: true },
        { name: "motherName", label: "Mother's Name", type: "text", required: true }
      ]
    },
    {
      id: "academic-details",
      title: "Academic Details",
      columns: 2,
      fields: [
        { name: "courseTitle", label: "Course/Program", type: "text", required: true },
        { name: "academicYear", label: "Academic Year", type: "text", required: true },
        { name: "semester", label: "Semester", type: "text", required: true },
        { name: "subjects", label: "Subjects", type: "textarea", required: true, placeholder: "List subjects (one per line)" }
      ]
    },
    {
      id: "performance",
      title: "Academic Performance",
      columns: 2,
      fields: [
        { name: "cgpa", label: "CGPA", type: "number", required: true },
        { name: "percentage", label: "Percentage", type: "text", required: true },
        { name: "grades", label: "Grades", type: "text", required: true },
        { name: "class", label: "Class/Division", type: "text", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 6. COMPLETION CERTIFICATE
// ========================================
export const completionConfig: DocumentConfig = {
  id: "completion",
  name: "Completion Certificate",
  description: "Certificate for courses, training programs, internships",
  category: "academic",
  layoutType: "certificate",
  allowedOrgTypes: ["Educational Institute", "Other"],
  
  sections: [
    {
      id: "student-details",
      title: "Student Details",
      columns: 2,
      fields: [
        { name: "studentName", label: "Student Name", type: "text", required: true },
        { name: "gender", label: "Gender", type: "select", required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }] },
        { name: "fatherName", label: "Father's Name", type: "text", required: true },
        { name: "motherName", label: "Mother's Name", type: "text", required: true },
        { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true }
      ]
    },
    {
      id: "course-details",
      title: "Course Details",
      columns: 2,
      fields: [
        { name: "courseTitle", label: "Course Title", type: "text", required: true },
        { name: "courseDuration", label: "Course Duration", type: "text", required: true },
        { name: "startDate", label: "Start Date", type: "date", required: true },
        { name: "endDate", label: "End Date", type: "date", required: true },
        { name: "grade", label: "Grade/Performance", type: "text", required: true }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 2,
      fields: [
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "date", label: "Issue Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 7. INCOME CERTIFICATE
// ========================================
export const incomeConfig: DocumentConfig = {
  id: "income",
  name: "Income Certificate",
  description: "Certificate stating employee income details",
  category: "employment",
  layoutType: "certificate",
  
  sections: [
    {
      id: "employee-details",
      title: "Employee Details",
      columns: 2,
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "gender", label: "Gender", type: "select", required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }] },
        { name: "employeeId", label: "Employee ID", type: "text", required: true },
        { name: "designation", label: "Designation", type: "text", required: true },
        { name: "department", label: "Department", type: "text", required: true }
      ]
    },
    {
      id: "income-details",
      title: "Income Details",
      columns: 2,
      fields: [
        { name: "basicSalary", label: "Basic Salary", type: "text", required: true },
        { name: "allowances", label: "Allowances", type: "text", required: true },
        { name: "totalMonthlyIncome", label: "Total Monthly Income", type: "text", required: true },
        { name: "annualIncome", label: "Annual Income", type: "text", required: true }
      ]
    },
    {
      id: "employment-details",
      title: "Employment Details",
      columns: 2,
      fields: [
        { name: "joiningDate", label: "Joining Date", type: "date", required: true },
        { name: "institutionName", label: "Institution Name", type: "text", required: true }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 2,
      fields: [
        { name: "purpose", label: "Purpose", type: "textarea", required: true },
        { name: "date", label: "Issue Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 8. MATERNITY LEAVE APPLICATION
// ========================================
export const maternityLeaveConfig: DocumentConfig = {
  id: "maternity-leave",
  name: "Maternity Leave Application",
  description: "Application for maternity leave benefits",
  category: "employment",
  layoutType: "letter",
  
  sections: [
    {
      id: "employee-details",
      title: "Employee Details",
      columns: 2,
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "employeeId", label: "Employee ID", type: "text", required: true },
        { name: "designation", label: "Designation", type: "text", required: true },
        { name: "department", label: "Department", type: "text", required: true }
      ]
    },
    {
      id: "leave-details",
      title: "Leave Details",
      columns: 2,
      fields: [
        { name: "expectedDeliveryDate", label: "Expected Delivery Date", type: "date", required: true },
        { name: "leaveStartDate", label: "Leave Start Date", type: "date", required: true },
        { name: "leaveEndDate", label: "Leave End Date", type: "date", required: true },
        { name: "totalLeaveDays", label: "Total Leave Days", type: "text", required: true }
      ]
    },
    {
      id: "medical-details",
      title: "Medical Details",
      columns: 2,
      fields: [
        { name: "medicalCertificateNumber", label: "Medical Certificate Number", type: "text", required: true },
        { name: "doctorName", label: "Doctor Name", type: "text", required: true },
        { name: "hospitalName", label: "Hospital Name", type: "text", required: true }
      ]
    },
    {
      id: "emergency-contact",
      title: "Emergency Contact",
      columns: 2,
      fields: [
        { name: "emergencyContact", label: "Emergency Contact", type: "text", required: true },
        { name: "emergencyContactPhone", label: "Emergency Contact Phone", type: "text", required: true }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 2,
      fields: [
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 9. OFFER LETTER
// ========================================
export const offerLetterConfig: DocumentConfig = {
  id: "offer-letter",
  name: "Offer Letter",
  description: "Formal job offer letter to candidates",
  category: "employment",
  layoutType: "letter",
  
  sections: [
    {
      id: "candidate-details",
      title: "Candidate Details",
      columns: 2,
      fields: [
        { name: "candidateName", label: "Candidate Name", type: "text", required: true },
        { name: "candidateAddress", label: "Candidate Address", type: "text", required: true }
      ]
    },
    {
      id: "job-details",
      title: "Job Details",
      columns: 2,
      fields: [
        { name: "jobTitle", label: "Job Title", type: "text", required: true },
        { name: "department", label: "Department", type: "text", required: true },
        { name: "startDate", label: "Start Date", type: "date", required: true },
        { name: "reportingManager", label: "Reporting Manager", type: "text", required: true },
        { name: "workLocation", label: "Work Location", type: "text", required: true }
      ]
    },
    {
      id: "compensation",
      title: "Compensation & Benefits",
      columns: 1,
      fields: [
        { name: "salaryAmount", label: "Salary Amount", type: "text", required: true },
        { name: "benefits", label: "Benefits", type: "textarea", required: true },
        { name: "jobResponsibilities", label: "Job Responsibilities", type: "textarea", required: true }
      ]
    },
    {
      id: "terms",
      title: "Employment Terms",
      columns: 2,
      fields: [
        { name: "employmentTerms", label: "Employment Terms", type: "textarea", required: true },
        { name: "probationPeriod", label: "Probation Period", type: "text", required: true },
        { name: "noticePeriod", label: "Notice Period", type: "text", required: true },
        { name: "acceptanceDeadline", label: "Acceptance Deadline", type: "date", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 10. NOC FOR VISA
// ========================================
export const nocVisaConfig: DocumentConfig = {
  id: "noc-visa",
  name: "NOC for Visa",
  description: "No Objection Certificate for employees/students applying for a visa.",
  category: "travel",
  layoutType: "letter",
  
  sections: [
    {
      id: "employee-details",
      title: "Employee Details",
      columns: 2,
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "gender", label: "Gender", type: "select", required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }] },
        { name: "designation", label: "Designation", type: "text", required: true },
        { name: "employeeId", label: "Employee ID", type: "text", required: true },
        { name: "department", label: "Department", type: "text", required: true }
      ]
    },
    {
      id: "travel-details",
      title: "Travel Details",
      columns: 2,
      fields: [
        { name: "passportNumber", label: "Passport Number", type: "text", required: true },
        { name: "visaType", label: "Visa Type", type: "text", required: true },
        { name: "destinationCountry", label: "Destination Country", type: "text", required: true },
        { name: "travelPurpose", label: "Travel Purpose", type: "text", required: true },
        { name: "travelDates", label: "Travel Dates", type: "text", required: true },
        { name: "returnDate", label: "Return Date", type: "date", required: true },
        { name: "sponsorDetails", label: "Sponsor Details", type: "text", required: true }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 2,
      fields: [
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 11. BANK ACCOUNT VERIFICATION
// ========================================
export const bankVerificationConfig: DocumentConfig = {
  id: "bank-verification",
  name: "Bank Account Verification",
  description: "Letter confirming account details for banks",
  category: "financial",
  layoutType: "letter",
  
  sections: [
    {
      id: "employee-details",
      title: "Employee Details",
      columns: 2,
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "employeeId", label: "Employee ID", type: "text", required: true },
        { name: "designation", label: "Designation", type: "text", required: true },
        { name: "department", label: "Department", type: "text", required: true }
      ]
    },
    {
      id: "bank-details",
      title: "Bank Details",
      columns: 2,
      fields: [
        { name: "bankName", label: "Bank Name", type: "text", required: true },
        { name: "accountNumber", label: "Account Number", type: "text", required: true },
        { name: "accountType", label: "Account Type", type: "text", required: true },
        { name: "ifscCode", label: "IFSC Code", type: "text", required: true },
        { name: "branchName", label: "Branch Name", type: "text", required: true },
        { name: "branchAddress", label: "Branch Address", type: "text", required: true },
        { name: "accountHolderName", label: "Account Holder Name", type: "text", required: true }
      ]
    },
    {
      id: "employment-details",
      title: "Employment Details",
      columns: 2,
      fields: [
        { name: "joinDate", label: "Join Date", type: "date", required: true },
        { name: "currentSalary", label: "Current Salary", type: "text", required: true }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 2,
      fields: [
        { name: "purpose", label: "Purpose", type: "text", required: true },
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 12. ADDRESS PROOF CERTIFICATE
// ========================================
export const addressProofConfig: DocumentConfig = {
  id: "address-proof",
  name: "Address Proof Certificate",
  description: "Certificate verifying residential address",
  category: "legal",
  layoutType: "certificate",
  
  sections: [
    {
      id: "personal-info",
      title: "Personal Information",
      columns: 2,
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "gender", label: "Gender", type: "select", required: true, options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }] },
        { name: "fatherName", label: "Father's Name", type: "text", required: true },
        { 
          name: "relationshipWithApplicant", 
          label: "Relationship with Applicant", 
          type: "select", 
          required: true,
          options: [
            { value: "self", label: "Self" },
            { value: "father", label: "Father" },
            { value: "mother", label: "Mother" },
            { value: "guardian", label: "Guardian" },
            { value: "spouse", label: "Spouse" },
            { value: "other", label: "Other" }
          ]
        }
      ]
    },
    {
      id: "address-info",
      title: "Address Information",
      columns: 1,
      fields: [
        { name: "currentAddress", label: "Current Address", type: "textarea", required: true },
        { name: "permanentAddress", label: "Permanent Address", type: "textarea", required: true },
        { name: "residenceDuration", label: "Duration of Residence", type: "text", required: true, placeholder: "e.g., 5 years, 2 months" }
      ]
    },
    {
      id: "id-proof",
      title: "ID Proof Details",
      columns: 2,
      fields: [
        { 
          name: "idProofType", 
          label: "ID Proof Type", 
          type: "select", 
          required: true,
          options: [
            { value: "aadhar", label: "Aadhar Card" },
            { value: "passport", label: "Passport" },
            { value: "voter_id", label: "Voter ID Card" },
            { value: "driving_license", label: "Driving License" },
            { value: "other", label: "Other" }
          ]
        },
        { name: "idProofNumber", label: "ID Proof Number", type: "text", required: true }
      ]
    },
    {
      id: "certificate-details",
      title: "Certificate Details",
      columns: 2,
      fields: [
        { name: "purpose", label: "Purpose", type: "text", required: true },
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "date", label: "Date", type: "date", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 13. NON-DISCLOSURE AGREEMENT (NDA)
// ========================================
export const ndaConfig: DocumentConfig = {
  id: "nda",
  name: "Non-Disclosure Agreement",
  description: "Confidentiality agreement between parties",
  category: "corporate",
  layoutType: "agreement",
  
  sections: [
    {
      id: "parties",
      title: "Parties",
      columns: 1,
      fields: [
        { name: "disclosingParty", label: "Disclosing Party", type: "text", required: true, placeholder: "Party sharing confidential information" },
        { name: "receivingParty", label: "Receiving Party", type: "text", required: true, placeholder: "Party receiving confidential information" },
        { name: "disclosingPartyAddress", label: "Disclosing Party Address", type: "textarea", required: true },
        { name: "receivingPartyAddress", label: "Receiving Party Address", type: "textarea", required: true }
      ]
    },
    {
      id: "agreement-terms",
      title: "Agreement Terms",
      columns: 2,
      fields: [
        { name: "effectiveDate", label: "Effective Date", type: "date", required: true },
        { name: "duration", label: "Duration/Term", type: "text", required: true, placeholder: "e.g., 2 years from effective date" }
      ]
    },
    {
      id: "confidential-info",
      title: "Confidential Information",
      columns: 1,
      fields: [
        { name: "confidentialInformation", label: "Confidential Information", type: "textarea", required: true, placeholder: "Define what constitutes confidential information" },
        { name: "permittedUse", label: "Permitted Use", type: "textarea", required: true, placeholder: "Specify permitted uses of confidential information" }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 14. EMPLOYMENT AGREEMENT
// ========================================
export const employmentAgreementConfig: DocumentConfig = {
  id: "employment-agreement",
  name: "Employment Agreement",
  description: "Comprehensive employment contract",
  category: "corporate",
  layoutType: "agreement",
  
  sections: [
    {
      id: "parties",
      title: "Parties",
      columns: 2,
      fields: [
        { name: "employeeName", label: "Employee Name", type: "text", required: true },
        { name: "employerName", label: "Employer Name", type: "text", required: true }
      ]
    },
    {
      id: "position-details",
      title: "Position Details",
      columns: 2,
      fields: [
        { name: "jobTitle", label: "Job Title", type: "text", required: true },
        { name: "department", label: "Department", type: "text", required: true },
        { name: "startDate", label: "Start Date", type: "date", required: true },
        { name: "workLocation", label: "Work Location", type: "text", required: true },
        { name: "workHours", label: "Work Hours", type: "text", required: true }
      ]
    },
    {
      id: "compensation",
      title: "Compensation",
      columns: 1,
      fields: [
        { name: "salary", label: "Salary", type: "text", required: true },
        { name: "benefits", label: "Benefits", type: "textarea", required: true }
      ]
    },
    {
      id: "terms",
      title: "Terms & Conditions",
      columns: 1,
      fields: [
        { name: "terminationClause", label: "Termination Clause", type: "textarea", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 15. ARTICLES OF INCORPORATION
// ========================================
export const articlesOfIncorporationConfig: DocumentConfig = {
  id: "articles-incorporation",
  name: "Articles of Incorporation",
  description: "Certificate of Incorporation for new corporations",
  category: "corporate",
  layoutType: "agreement",
  allowedOrgTypes: ["Corporate", "Startup", "Law Agency", "Other"],
  
  sections: [
    {
      id: "corporation-details",
      title: "Corporation Details",
      columns: 2,
      fields: [
        { name: "corporationName", label: "Corporation Name", type: "text", required: true },
        { 
          name: "stateOfIncorporation", 
          label: "State of Incorporation", 
          type: "select", 
          required: true,
          options: [
            { value: "california", label: "California" },
            { value: "delaware", label: "Delaware" },
            { value: "nevada", label: "Nevada" },
            { value: "texas", label: "Texas" },
            { value: "florida", label: "Florida" }
          ]
        }
      ]
    },
    {
      id: "agent-details",
      title: "Registered Agent",
      columns: 1,
      fields: [
        { name: "registeredAgent", label: "Registered Agent", type: "text", required: true },
        { name: "registeredAgentAddress", label: "Registered Agent Address", type: "textarea", required: true },
        { name: "corporateAddress", label: "Corporate Address", type: "textarea", required: true }
      ]
    },
    {
      id: "shares",
      title: "Shares",
      columns: 2,
      fields: [
        { name: "authorizedShares", label: "Number of Authorized Shares", type: "number", required: true },
        { name: "shareValue", label: "Par Value per Share", type: "number", required: true }
      ]
    },
    {
      id: "incorporator",
      title: "Incorporator",
      columns: 1,
      fields: [
        { name: "incorporatorName", label: "Incorporator Name", type: "text", required: true },
        { name: "incorporatorAddress", label: "Incorporator Address", type: "textarea", required: true },
        { name: "businessPurpose", label: "Corporate Purpose", type: "textarea", required: true }
      ]
    },
    {
      id: "filing-details",
      title: "Filing Details",
      columns: 2,
      fields: [
        { name: "filingDate", label: "Filing Date", type: "date", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 16. CORPORATE BYLAWS
// ========================================
export const corporateBylawsConfig: DocumentConfig = {
  id: "corporate-bylaws",
  name: "Corporate Bylaws",
  description: "Governance rules and procedures for a corporation",
  category: "corporate",
  layoutType: "agreement",
  allowedOrgTypes: ["Corporate", "Startup", "Law Agency", "Other"],
  
  sections: [
    {
      id: "corporation-info",
      title: "Corporation Information",
      columns: 2,
      fields: [
        { name: "corporationName", label: "Corporation Name", type: "text", required: true },
        { name: "stateOfIncorporation", label: "State of Incorporation", type: "text", required: true },
        { name: "registeredOffice", label: "Registered Office", type: "textarea", required: true },
        { name: "fiscalYearEnd", label: "Fiscal Year End", type: "text", required: true }
      ]
    },
    {
      id: "board-structure",
      title: "Board Structure",
      columns: 2,
      fields: [
        { name: "numberOfDirectors", label: "Number of Directors", type: "text", required: true },
        { name: "directorTermLength", label: "Director Term Length", type: "text", required: true }
      ]
    },
    {
      id: "officers",
      title: "Officers",
      columns: 1,
      fields: [
        { name: "officerTitles", label: "Officer Titles", type: "textarea", required: true, placeholder: "List officer positions" }
      ]
    },
    {
      id: "governance",
      title: "Governance",
      columns: 1,
      fields: [
        { name: "votingRights", label: "Voting Rights", type: "textarea", required: true },
        { name: "meetingFrequency", label: "Meeting Frequency", type: "text", required: true },
        { name: "dividendPolicy", label: "Dividend Policy", type: "textarea", required: true },
        { name: "amendmentProcess", label: "Amendment Process", type: "textarea", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 17. FOUNDERS' AGREEMENT
// ========================================
export const foundersAgreementConfig: DocumentConfig = {
  id: "founders-agreement",
  name: "Founders' Agreement",
  description: "Agreement between co-founders of a startup",
  category: "corporate",
  layoutType: "agreement",
  allowedOrgTypes: ["Corporate", "Startup", "Law Agency", "Other"],
  
  sections: [
    {
      id: "parties",
      title: "Parties",
      columns: 2,
      fields: [
        { name: "founder1Name", label: "Founder 1 Name", type: "text", required: true },
        { name: "founder2Name", label: "Founder 2 Name", type: "text", required: true },
        { name: "companyName", label: "Company Name", type: "text", required: true },
        { name: "effectiveDate", label: "Effective Date", type: "date", required: true }
      ]
    },
    {
      id: "business",
      title: "Business Description",
      columns: 1,
      fields: [
        { name: "businessDescription", label: "Business Description", type: "textarea", required: true }
      ]
    },
    {
      id: "equity",
      title: "Equity Distribution",
      columns: 2,
      fields: [
        { name: "founder1Equity", label: "Founder 1 Equity %", type: "text", required: true },
        { name: "founder2Equity", label: "Founder 2 Equity %", type: "text", required: true },
        { name: "vestingSchedule", label: "Vesting Schedule", type: "textarea", required: true }
      ]
    },
    {
      id: "roles",
      title: "Roles & Responsibilities",
      columns: 1,
      fields: [
        { name: "rolesAndResponsibilities", label: "Roles & Responsibilities", type: "textarea", required: true }
      ]
    },
    {
      id: "ip-and-clauses",
      title: "Legal Clauses",
      columns: 1,
      fields: [
        { name: "intellectualProperty", label: "Intellectual Property", type: "textarea", required: true },
        { name: "confidentialityClause", label: "Confidentiality", type: "textarea", required: true },
        { name: "nonCompeteClause", label: "Non-Compete", type: "textarea", required: true },
        { name: "disputeResolution", label: "Dispute Resolution", type: "textarea", required: true },
        { name: "governingLaw", label: "Governing Law", type: "text", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 18. STOCK PURCHASE AGREEMENT
// ========================================
export const stockPurchaseAgreementConfig: DocumentConfig = {
  id: "stock-purchase-agreement",
  name: "Stock Purchase Agreement",
  description: "Agreement for purchase of company shares",
  category: "corporate",
  layoutType: "agreement",
  allowedOrgTypes: ["Corporate", "Startup", "Law Agency", "Other"],
  
  sections: [
    {
      id: "parties",
      title: "Parties",
      columns: 2,
      fields: [
        { name: "sellerName", label: "Seller Name", type: "text", required: true },
        { name: "buyerName", label: "Buyer Name", type: "text", required: true }
      ]
    },
    {
      id: "shares",
      title: "Share Details",
      columns: 2,
      fields: [
        { name: "numberOfShares", label: "Number of Shares", type: "number", required: true },
        { name: "sharePrice", label: "Price per Share", type: "number", required: true },
        { name: "totalPrice", label: "Total Purchase Price", type: "number", required: true },
        { name: "closingDate", label: "Closing Date", type: "date", required: true }
      ]
    },
    {
      id: "representations",
      title: "Representations & Warranties",
      columns: 1,
      fields: [
        { name: "representations", label: "Representations", type: "textarea", required: true },
        { name: "warranties", label: "Warranties", type: "textarea", required: true },
        { name: "covenants", label: "Covenants", type: "textarea", required: true }
      ]
    },
    {
      id: "legal",
      title: "Legal Details",
      columns: 2,
      fields: [
        { name: "governingLaw", label: "Governing Law", type: "text", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 19. EMBASSY ATTESTATION
// ========================================
export const embassyAttestationConfig: DocumentConfig = {
  id: "embassy-attestation",
  name: "Embassy Attestation",
  description: "Letter for document attestation at embassies",
  category: "travel",
  layoutType: "letter",
  
  sections: [
    {
      id: "applicant-details",
      title: "Applicant Details",
      columns: 2,
      fields: [
        { name: "applicantName", label: "Applicant Name", type: "text", required: true },
        { name: "passportNumber", label: "Passport Number", type: "text", required: true },
        { name: "nationality", label: "Nationality", type: "text", required: true },
        { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true }
      ]
    },
    {
      id: "document-details",
      title: "Document Details",
      columns: 2,
      fields: [
        { name: "documentType", label: "Document Type", type: "text", required: true },
        { name: "documentNumber", label: "Document Number", type: "text", required: true },
        { name: "issuingAuthority", label: "Issuing Authority", type: "text", required: true },
        { name: "issueDate", label: "Issue Date", type: "date", required: true }
      ]
    },
    {
      id: "embassy-details",
      title: "Embassy Details",
      columns: 2,
      fields: [
        { name: "embassyName", label: "Embassy Name", type: "text", required: true },
        { name: "embassyCountry", label: "Embassy Country", type: "text", required: true }
      ]
    },
    {
      id: "attestation-details",
      title: "Attestation Details",
      columns: 1,
      fields: [
        { name: "purposeOfAttestation", label: "Purpose of Attestation", type: "textarea", required: true },
        { name: "contactInformation", label: "Contact Information", type: "textarea", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true, placeholder: "City, Country" },
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// 20. EMBASSY ATTESTATION LETTER
// ========================================
export const embassyAttestationLetterConfig: DocumentConfig = {
  id: "embassy-attestation-letter",
  name: "Embassy Attestation Letter",
  description: "Letter for document attestation at embassies",
  category: "travel",
  layoutType: "letter",
  
  sections: [
    {
      id: "applicant-details",
      title: "Applicant Details",
      columns: 2,
      fields: [
        { name: "applicantName", label: "Applicant Name", type: "text", required: true },
        { name: "passportNumber", label: "Passport Number", type: "text", required: true },
        { name: "nationality", label: "Nationality", type: "text", required: true },
        { name: "residentialAddress", label: "Residential Address", type: "textarea", required: true }
      ]
    },
    {
      id: "document-details",
      title: "Document Details",
      columns: 2,
      fields: [
        { name: "documentType", label: "Document Type", type: "text", required: true },
        { name: "documentNumber", label: "Document Number", type: "text", required: true },
        { name: "issuingAuthority", label: "Issuing Authority", type: "text", required: true },
        { name: "issueDate", label: "Issue Date", type: "date", required: true }
      ]
    },
    {
      id: "embassy-details",
      title: "Embassy Details",
      columns: 2,
      fields: [
        { name: "embassyName", label: "Embassy Name", type: "text", required: true },
        { name: "embassyAddress", label: "Embassy Address", type: "textarea", required: true }
      ]
    },
    {
      id: "attestation-purpose",
      title: "Attestation Purpose",
      columns: 1,
      fields: [
        { name: "purposeOfAttestation", label: "Purpose of Attestation", type: "textarea", required: true },
        { name: "travelDetails", label: "Travel Details", type: "textarea", required: true }
      ]
    },
    {
      id: "signatory-details",
      title: "Signatory Details",
      columns: 2,
      fields: [
        { name: "institutionName", label: "Institution Name", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "place", label: "Place", type: "text", required: true },
        { name: "signatoryName", label: "Signatory Name", type: "text", required: true },
        { name: "signatoryDesignation", label: "Designation", type: "text", required: true },
        { name: "includeDigitalSignature", label: "Digital Signature", type: "switch", defaultValue: false }
      ]
    }
  ]
};

// ========================================
// EXPORT ALL CONFIGS
// ========================================
export const documentConfigs: Record<string, DocumentConfig> = {
  "bonafide": bonafideConfig,
  "character": characterConfig,
  "experience": experienceConfig,
  "transfer": transferConfig,
  "academic-transcript": academicTranscriptConfig,
  "completion": completionConfig,
  "income": incomeConfig,
  "maternity-leave": maternityLeaveConfig,
  "offer-letter": offerLetterConfig,
  "noc-visa": nocVisaConfig,
  "bank-verification": bankVerificationConfig,
  "address-proof": addressProofConfig,
  "nda": ndaConfig,
  "employment-agreement": employmentAgreementConfig,
  "articles-incorporation": articlesOfIncorporationConfig,
  "corporate-bylaws": corporateBylawsConfig,
  "founders-agreement": foundersAgreementConfig,
  "stock-purchase-agreement": stockPurchaseAgreementConfig,
  "embassy-attestation": embassyAttestationConfig,
  "embassy-attestation-letter": embassyAttestationLetterConfig
};

// Helper function to get config by template ID
export const getDocumentConfig = (templateId: string): DocumentConfig | undefined => {
  // Extract base template ID by removing numeric suffix (e.g., "academic-transcript-1" -> "academic-transcript")
  const baseId = templateId.replace(/-\d+$/, '');
  return documentConfigs[baseId];
};
