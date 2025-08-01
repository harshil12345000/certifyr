
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
