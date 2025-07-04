// Base interfaces for all template data
export interface BaseTemplateData {
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}

// Preview component props interfaces
export interface BasePreviewProps {
  isEmployeePreview?: boolean;
  showExportButtons?: boolean;
}

// Generic FormData type for templates
export type FormData = 
  | BonafideData 
  | CharacterData 
  | ExperienceData 
  | EmbassyAttestationData 
  | CompletionCertificateData 
  | TransferCertificateData 
  | NocVisaData 
  | IncomeCertificateData 
  | MaternityLeaveData 
  | BankVerificationData 
  | OfferLetterData
  | AddressProofData;

// Academic Transcript
export interface AcademicTranscriptData extends BaseTemplateData {
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
}

export interface AcademicTranscriptPreviewProps extends BasePreviewProps {
  data: AcademicTranscriptData;
}

// Address Proof
export interface AddressProofData extends BaseTemplateData {
  fullName: string;
  fatherName?: string;
  currentAddress: string;
  permanentAddress: string;
  residenceDuration: string;
  relationshipWithApplicant: 'self' | 'father' | 'mother' | 'spouse' | 'other';
  idProofType: 'aadhar' | 'passport' | 'driving_license' | 'voter_id' | 'other';
  idProofNumber: string;
  purpose: string;
  institutionName?: string;
}

export interface AddressProofPreviewProps extends BasePreviewProps {
  data: AddressProofData;
}

// Articles of Incorporation
export interface ArticlesOfIncorporationData extends BaseTemplateData {
  companyName: string;
  stateOfIncorporation: string;
  registeredAgent: string;
  registeredOffice: string;
  purpose: string;
  authorizedShares: string;
  shareClasses?: string;
  incorporators: Array<{
    name: string;
    address: string;
    place?: string;
  }>;
}

export interface ArticlesOfIncorporationPreviewProps extends BasePreviewProps {
  data: ArticlesOfIncorporationData;
}

// Bank Verification
export interface BankVerificationData extends BaseTemplateData {
  fullName: string;
  employeeId?: string;
  designation: string;
  department?: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  ifscCode: string;
  branchName?: string;
  branchAddress?: string;
  accountHolderName: string;
  joinDate?: string;
  currentSalary?: string;
  purpose?: string;
  institutionName?: string;
}

export interface BankVerificationPreviewProps extends BasePreviewProps {
  data: BankVerificationData;
}

// Bonafide
export interface BonafideData extends BaseTemplateData {
  fullName: string;
  gender?: 'male' | 'female' | 'other';
  parentName?: string;
  type?: 'student' | 'employee';
  courseOrDesignation: string;
  department?: string;
  startDate?: string;
  purpose?: string;
  institutionName?: string;
}

export interface BonafidePreviewProps extends BasePreviewProps {
  data: BonafideData;
}

// Character Certificate
export interface CharacterData extends BaseTemplateData {
  fullName: string;
  parentName?: string;
  address?: string;
  duration: string;
  conduct: string;
  institutionName?: string;
}

export interface CharacterPreviewProps extends BasePreviewProps {
  data: CharacterData;
}

// Completion Certificate
export interface CompletionCertificateData extends BaseTemplateData {
  fullName: string;
  fatherName?: string;
  registrationNumber?: string;
  courseTitle: string;
  courseDuration?: string;
  completionDate?: string;
  grade?: string;
  percentage?: string;
  programType?: string;
  institutionName?: string;
}

export interface CompletionCertificatePreviewProps extends BasePreviewProps {
  data: CompletionCertificateData;
}

// Corporate Bylaws
export interface CorporateBylawsData extends BaseTemplateData {
  companyName: string;
  stateOfIncorporation: string;
  registeredAgent: string;
  registeredOffice: string;
  directors: {
    numberOfDirectors: string;
    directorTermLength: string;
    boardMeetingFrequency: string;
  };
  officers: {
    officerTitles: string;
  };
  shareholders: any;
  shareClasses: {
    dividendPolicy: string;
  };
  meetings: {
    shareholderMeetingDate: string;
    fiscalYearEnd: string;
  };
  voting: {
    votingRights: string;
  };
  indemnification: any;
  amendments: {
    amendmentProcess: string;
  };
}

export interface CorporateBylawsPreviewProps extends BasePreviewProps {
  data: CorporateBylawsData;
}

// Embassy Attestation
export interface EmbassyAttestationData extends BaseTemplateData {
  fullName: string;
  passportNumber: string;
  nationality?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  documentType: string;
  documentNumber?: string;
  issuingAuthority?: string;
  documentIssueDate?: string;
  purposeOfAttestation?: string;
  destinationCountry?: string;
  embassyName?: string;
  applicantAddress?: string;
  phoneNumber?: string;
  emailAddress?: string;
  purpose: string;
  destination?: string;
  institutionName?: string;
}

export interface EmbassyAttestationPreviewProps extends BasePreviewProps {
  data: EmbassyAttestationData;
}

// Embassy Attestation Letter
export interface EmbassyAttestationLetterData extends BaseTemplateData {
  fullName: string;
  passportNumber: string;
  nationality?: string;
  documentType: string;
  purpose: string;
  destination?: string;
  institutionName?: string;
}

// Experience Certificate
export interface ExperienceData extends BaseTemplateData {
  fullName: string;
  employeeId?: string;
  designation: string;
  department?: string;
  joinDate?: string;
  resignationDate?: string;
  workDescription?: string;
  salary?: string;
  institutionName?: string;
}

export interface ExperiencePreviewProps extends BasePreviewProps {
  data: ExperienceData;
}

// Founders Agreement
export interface FoundersAgreementData extends BaseTemplateData {
  companyName: string;
  founders: string;
  equityDistribution: string;
  vestingSchedule: string;
  rolesAndResponsibilities: string;
  intellectualProperty: string;
  nonCompete: string;
  termination: string;
  governingLaw: string;
}

export interface FoundersAgreementPreviewProps extends BasePreviewProps {
  data: FoundersAgreementData;
}

// Income Certificate
export interface IncomeCertificateData extends BaseTemplateData {
  fullName: string;
  fatherName?: string;
  designation: string;
  employeeId?: string;
  department?: string;
  basicSalary: string;
  allowances: string;
  totalIncome: string;
  incomeFrequency: string;
  purpose?: string;
  institutionName?: string;
}

export interface IncomeCertificatePreviewProps extends BasePreviewProps {
  data: IncomeCertificateData;
}

// IP Assignment Agreement
export interface IPAssignmentAgreementData extends BaseTemplateData {
  employeeName: string;
  employeeAddress: string;
  companyName: string;
  effectiveDate: string;
  workDescription: string;
}

export interface IPAssignmentAgreementPreviewProps extends BasePreviewProps {
  data: IPAssignmentAgreementData;
}

// Maternity Leave
export interface MaternityLeaveData extends BaseTemplateData {
  fullName: string;
  employeeId?: string;
  designation: string;
  department?: string;
  expectedDeliveryDate?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  totalLeaveDays?: string;
  medicalCertificateNumber?: string;
  doctorName?: string;
  hospitalName?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  institutionName?: string;
}

export interface MaternityLeavePreviewProps extends BasePreviewProps {
  data: MaternityLeaveData;
}

// NDA
export interface NDAData extends BaseTemplateData {
  disclosingParty: string;
  disclosingPartyAddress: string;
  receivingParty: string;
  receivingPartyAddress: string;
  effectiveDate?: string;
  purposeOfDisclosure: string;
  confidentialInformation: string;
  exclusions: string;
  obligations: string;
  termLength: string;
  returnOfInformation: string;
  remedies: string;
  governingLaw: string;
}

export interface NDAPreviewProps extends BasePreviewProps {
  data: NDAData;
}

// NOC Visa
export interface NocVisaData extends BaseTemplateData {
  fullName: string;
  passportNumber: string;
  nationality?: string;
  designation: string;
  employeeId?: string;
  department?: string;
  joinDate?: string;
  travelDates?: string;
  travelPurpose?: string;
  destinationCountry?: string;
  visaType?: string;
  returnDate?: string;
  sponsorDetails?: string;
  institutionName?: string;
}

export interface NocVisaPreviewProps extends BasePreviewProps {
  data: NocVisaData;
}

// Offer Letter
export interface OfferLetterData extends BaseTemplateData {
  candidateName: string;
  candidateAddress?: string;
  dateOfOffer?: string;
  jobTitle?: string;
  position?: string;
  department?: string;
  reportingManager?: string;
  startDate?: string;
  probationPeriod?: string;
  salary?: string;
  salaryAmount?: string;
  salaryCurrency?: string;
  salaryFrequency?: 'monthly' | 'annually';
  benefits?: string;
  workHours?: string;
  workLocation?: string;
  acceptanceDeadline?: string;
  institutionName?: string;
}

export interface OfferLetterPreviewProps extends BasePreviewProps {
  data: OfferLetterData;
}

// Stock Purchase Agreement
export interface StockPurchaseAgreementData extends BaseTemplateData {
  companyName: string;
  seller: {
    name: string;
    address: string;
  };
  buyer: {
    name: string;
    address: string;
  };
  shares: {
    class: string;
    quantity: string;
  };
  pricePerShare: string;
  totalConsideration: string;
  closingDate?: string;
  representations: string;
  warranties: string;
  covenants: {
    restrictionsOnTransfer: string;
  };
  governingLaw: string;
}

export interface StockPurchaseAgreementPreviewProps extends BasePreviewProps {
  data: StockPurchaseAgreementData;
}

// Transfer Certificate
export interface TransferCertificateData extends BaseTemplateData {
  id?: string;
  fullName: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  admissionNumber?: string;
  className?: string;
  section?: string;
  academicYear?: string;
  dateOfAdmission?: string;
  dateOfLeaving?: string;
  lastAttendanceDate?: string;
  reasonForLeaving?: string;
  conduct?: string;
  subjects?: string;
  institutionName?: string;
}

export interface TransferCertificatePreviewProps extends BasePreviewProps {
  data: TransferCertificateData;
}
