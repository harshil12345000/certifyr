
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
}

export interface NocVisaData {
  fullName: string;
  designation: string;
  employeeId: string;
  department: string;
  passportNumber: string;
  visaType: string;
  destinationCountry: string;
  travelPurpose: string;
  travelDates: string;
  returnDate: string;
  sponsorDetails: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface IncomeCertificateData {
  fullName: string;
  fatherName: string;
  designation: string;
  employeeId: string;
  department: string;
  basicSalary: string;
  allowances: string;
  totalIncome: string;
  incomeFrequency: "monthly" | "yearly";
  purpose: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export type FormData = BonafideData | ExperienceData | CharacterData | EmbassyAttestationData | CompletionCertificateData | TransferCertificateData | NocVisaData | IncomeCertificateData;

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

export interface NocVisaPreviewProps {
  data: NocVisaData;
}

export interface IncomeCertificatePreviewProps {
  data: IncomeCertificateData;
}
