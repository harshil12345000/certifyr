
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

export interface OfferLetterData {
  candidateName: string;
  candidateAddress: string;
  dateOfOffer: string;
  jobTitle: string;
  department: string;
  reportingManager: string;
  startDate: string;
  probationPeriod: string;
  salaryAmount: string;
  salaryCurrency: string;
  salaryFrequency: "monthly" | "annually";
  benefits: string;
  workHours: string;
  workLocation: string;
  acceptanceDeadline: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface AddressProofData {
  fullName: string;
  fatherName: string;
  currentAddress: string;
  permanentAddress: string;
  residenceDuration: string;
  relationshipWithApplicant: "self" | "father" | "mother" | "guardian" | "spouse" | "other";
  idProofType: "aadhar" | "passport" | "voter_id" | "driving_license" | "other";
  idProofNumber: string;
  purpose: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

// Corporate template types - aligned with preview components
export interface ArticlesOfIncorporationData {
  companyName: string;
  stateOfIncorporation: string;
  registeredAgent: string;
  registeredOffice: string;
  purpose: string;
  authorizedShares: string;
  shareClasses: string;
  incorporators: Array<{
    name: string;
    address: string;
    place?: string;
  }>;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface CorporateBylawsData {
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
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface FoundersAgreementData {
  companyName: string;
  founders: string;
  equityDistribution: string;
  vestingSchedule: string;
  rolesAndResponsibilities: string;
  intellectualProperty: string;
  nonCompete: string;
  termination: any;
  governingLaw: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface StockPurchaseAgreementData {
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
  closingDate: string;
  representations: string;
  warranties: string;
  covenants: {
    restrictionsOnTransfer: string;
  };
  governingLaw: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface EmploymentAgreementData {
  employeeName: string;
  employeeAddress: string;
  companyName: string;
  companyAddress: string;
  jobTitle: string;
  startDate: string;
  employmentType: string;
  salary: string;
  benefits: string;
  workingHours: string;
  probationPeriod: string;
  terminationClause: string;
  confidentialityClause: string;
  nonCompeteClause: string;
  governingLaw: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface IPAssignmentAgreementData {
  assignorName: string;
  assignorAddress: string;
  assigneeName: string;
  assigneeAddress: string;
  intellectualPropertyDescription: string;
  assignmentScope: string;
  consideration: string;
  effectiveDate: string;
  representations: string;
  governingLaw: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface NDAData {
  disclosingParty: string;
  disclosingPartyAddress: string;
  receivingParty: string;
  receivingPartyAddress: string;
  effectiveDate: string;
  purposeOfDisclosure: string;
  confidentialInformation: string;
  exclusions: string;
  obligations: string;
  termLength: string;
  returnOfInformation: string;
  remedies: string;
  governingLaw: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

// Corporate FormData union type
export type CorporateFormData = 
  | ArticlesOfIncorporationData
  | CorporateBylawsData
  | FoundersAgreementData
  | StockPurchaseAgreementData
  | EmploymentAgreementData
  | IPAssignmentAgreementData
  | NDAData;

// Update the main FormData type to include corporate templates
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
  | AddressProofData
  | CorporateFormData;

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

export interface OfferLetterPreviewProps {
  data: OfferLetterData;
}

export interface AddressProofPreviewProps {
  data: AddressProofData;
}

// Corporate template preview props
export interface ArticlesOfIncorporationPreviewProps {
  data: ArticlesOfIncorporationData;
}

export interface CorporateBylawsPreviewProps {
  data: CorporateBylawsData;
}

export interface FoundersAgreementPreviewProps {
  data: FoundersAgreementData;
}

export interface StockPurchaseAgreementPreviewProps {
  data: StockPurchaseAgreementData;
}

export interface EmploymentAgreementPreviewProps {
  data: EmploymentAgreementData;
}

export interface IPAssignmentAgreementPreviewProps {
  data: IPAssignmentAgreementData;
}

export interface NDAPreviewProps {
  data: NDAData;
}
