

export interface IncomeCertificateData {
  fullName: string;
  fatherName: string;
  designation: string;
  department: string;
  employeeId: string;
  joiningDate: string;
  currentSalary: string;
  annualIncome: string;
  incomeFrequency: string;
  purpose: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface EmbassyAttestationData {
  fullName: string;
  passportNumber: string;
  nationality: string;
  address: string;
  documentType: string;
  documentNumber: string;
  documentIssueDate: string;
  issuingAuthority: string;
  embassyName: string;
  embassy: string;
  purposeOfAttestation: string;
  purpose: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface EmbassyAttestationLetterData {
  applicantName: string;
  passportNumber: string;
  nationality: string;
  documentType: string;
  documentDetails: string;
  attestationPurpose: string;
  embassyName: string;
  submissionDate: string;
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
  class: string;
  section: string;
  rollNumber: string;
  admissionNumber: string;
  admissionDate: string;
  lastAttendanceDate: string;
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

export interface BonafideData {
  fullName: string;
  fatherName: string;
  class: string;
  section: string;
  rollNumber: string;
  academicYear: string;
  purpose: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface ExperienceData {
  fullName: string;
  designation: string;
  department: string;
  employeeId: string;
  joiningDate: string;
  lastWorkingDate: string;
  workDuration: string;
  conduct: string;
  performance: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface AddressProofData {
  fullName: string;
  address: string;
  duration: string;
  proofType: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface BankVerificationData {
  fullName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  accountType: string;
  openingDate: string;
  currentBalance: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface MaternityLeaveData {
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  leaveStartDate: string;
  leaveEndDate: string;
  totalDays: string;
  expectedDeliveryDate: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface CompletionCertificateData {
  participantName: string;
  courseName: string;
  duration: string;
  startDate: string;
  endDate: string;
  grade: string;
  skills: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

// Preview Props Interfaces
export interface IncomeCertificatePreviewProps {
  data: IncomeCertificateData;
}

export interface EmbassyAttestationPreviewProps {
  data: EmbassyAttestationData;
}

export interface CharacterPreviewProps {
  data: CharacterData;
}

export interface BonafidePreviewProps {
  data: BonafideData;
}

export interface ExperiencePreviewProps {
  data: ExperienceData;
}

export interface AddressProofPreviewProps {
  data: AddressProofData;
}

export interface BankVerificationPreviewProps {
  data: BankVerificationData;
}

export interface MaternityLeavePreviewProps {
  data: MaternityLeaveData;
}

export interface CompletionCertificatePreviewProps {
  data: CompletionCertificateData;
}

export interface ArticlesOfIncorporationPreviewProps {
  data: import('./corporate-templates').ArticlesOfIncorporationData;
}

export interface CorporateBylawsPreviewProps {
  data: import('./corporate-templates').CorporateBylawsData;
}

export interface FoundersAgreementPreviewProps {
  data: import('./corporate-templates').FoundersAgreementData;
}

// Form Data Interface for Employee Portal
export interface FormData {
  [key: string]: any;
}

