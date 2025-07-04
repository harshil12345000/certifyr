
// Employment Agreement
export interface EmploymentAgreementData {
  employerName: string;
  employeeName: string;
  jobTitle: string;
  department?: string;
  employmentType: string;
  startDate?: string;
  workLocation: string;
  workHours: string;
  probationPeriod?: string;
  salary: string;
  payFrequency: string;
  benefits?: string;
  terminationClause: string;
  confidentialityClause: string;
  nonCompeteClause?: string;
  governingLaw: string;
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}

// Academic Transcript
export interface AcademicTranscriptData {
  studentName: string;
  studentId: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  courseTitle: string;
  academicYear: string;
  semester?: string;
  subjects?: string;
  grades?: string;
  cgpa?: string;
  percentage?: string;
  class?: string;
  institutionName?: string;
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}

// Offer Letter
export interface OfferLetterData {
  candidateName: string;
  position: string;
  department?: string;
  salary: string;
  startDate?: string;
  reportingManager?: string;
  institutionName?: string;
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}
