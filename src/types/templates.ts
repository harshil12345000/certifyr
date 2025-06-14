
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
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  fatherName: string;
  motherName: string;
  documentType: string;
  documentNumber: string;
  issuingAuthority: string;
  documentIssueDate: string;
  purposeOfAttestation: string;
  destinationCountry: string;
  embassyName: string;
  applicantAddress: string;
  phoneNumber: string;
  emailAddress: string;
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

export interface MaternityLeaveData {
  fullName: string;
  employeeId: string;
  designation: string;
  department: string;
  expectedDeliveryDate: string;
  leaveStartDate: string;
  leaveEndDate: string;
  totalLeaveDays: string;
  medicalCertificateNumber: string;
  doctorName: string;
  hospitalName: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface BankVerificationData {
  fullName: string;
  employeeId: string;
  designation: string;
  department: string;
  bankName: string;
  accountNumber: string;
  accountType: "savings" | "current" | "salary";
  ifscCode: string;
  branchName: string;
  branchAddress: string;
  accountHolderName: string;
  joinDate: string;
  currentSalary: string;
  purpose: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export type FormData = BonafideData | ExperienceData | CharacterData | EmbassyAttestationData | CompletionCertificateData | TransferCertificateData | NocVisaData | IncomeCertificateData | MaternityLeaveData | BankVerificationData;

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

export interface MaternityLeavePreviewProps {
  data: MaternityLeaveData;
}

export interface BankVerificationPreviewProps {
  data: BankVerificationData;
}
