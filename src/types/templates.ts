
export interface BonafideData {
  fullName: string;
  gender: "male" | "female" | "other";
  parentName: string;
  type: "student" | "employee";
  institutionName: string;
  startDate: string;
  courseOrDesignation: string;
  department: string;
  purpose: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
  fontFamily?: string;
  fontSize?: number;
}

export interface ExperienceData {
  fullName: string;
  employeeId: string;
  designation: string;
  department: string;
  joinDate: string;
  resignationDate: string;
  workDescription: string;
  salary: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
  fontFamily?: string;
  fontSize?: number;
}

export interface CharacterData {
  fullName: string;
  parentName: string;
  address: string;
  duration: string;
  conduct: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
  fontFamily?: string;
  fontSize?: number;
}

export interface EmbassyAttestationData {
  // Applicant Details
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  fatherName: string;
  motherName: string;
  
  // Document Details
  documentType: string; // e.g., Educational Certificate, Birth Certificate, etc.
  documentNumber: string;
  issuingAuthority: string;
  documentIssueDate: string;
  
  // Purpose and Destination
  purposeOfAttestation: string;
  destinationCountry: string;
  embassyName: string;
  
  // Contact Information
  applicantAddress: string;
  phoneNumber: string;
  emailAddress: string;
  
  // Institution/Authority Details
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
  fontFamily?: string;
  fontSize?: number;
}

export interface CompletionCertificateData {
  fullName: string;
  fatherName: string;
  registrationNumber: string;
  courseTitle: string;
  courseDuration: string;
  completionDate: string;
  grade: string;
  percentage: string;
  programType: "course" | "training" | "internship";
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
  fontFamily?: string;
  fontSize?: number;
}

export interface TransferCertificateData {
  fullName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  admissionNumber: string;
  class: string;
  section: string;
  academicYear: string;
  dateOfAdmission: string;
  dateOfLeaving: string;
  reasonForLeaving: string;
  conduct: string;
  subjects: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
  fontFamily?: string;
  fontSize?: number;
}

export type FormData = BonafideData | ExperienceData | CharacterData | EmbassyAttestationData | CompletionCertificateData | TransferCertificateData;

export interface BonafidePreviewProps {
  data: BonafideData;
}

export interface CharacterPreviewProps {
  data: CharacterData;
}

export interface ExperiencePreviewProps {
  data: ExperienceData;
}

export interface EmbassyAttestationPreviewProps {
  data: EmbassyAttestationData;
}

export interface CompletionCertificatePreviewProps {
  data: CompletionCertificateData;
}

export interface TransferCertificatePreviewProps {
  data: TransferCertificateData;
}
