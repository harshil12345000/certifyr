
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

// Articles of Incorporation
export interface ArticlesOfIncorporationData {
  corporationName: string;
  stateOfIncorporation: string;
  businessPurpose: string;
  corporateAddress: string;
  registeredAgent: string;
  registeredAgentAddress: string;
  authorizedShares: string;
  shareValue: string;
  incorporatorName: string;
  incorporatorAddress: string;
  incorporatorSignature: string;
  filingDate: string;
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}

// Corporate Bylaws
export interface CorporateBylawsData {
  corporationName: string;
  stateOfIncorporation: string;
  principalOffice: string;
  boardMeetingFrequency: string;
  shareholderMeetingDate: string;
  fiscalYearEnd: string;
  numberOfDirectors: string;
  directorTermLength: string;
  officerTitles: string;
  votingRights: string;
  dividendPolicy: string;
  amendmentProcess: string;
  adoptionDate: string;
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}

// Embassy Attestation Letter
export interface EmbassyAttestationLetterData {
  applicantName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  fatherName: string;
  motherName: string;
  documentType: string;
  documentNumber?: string;
  issuingAuthority: string;
  documentIssueDate?: string;
  purposeOfAttestation: string;
  destinationCountry: string;
  embassyName: string;
  applicantAddress: string;
  phoneNumber: string;
  emailAddress: string;
  institutionName?: string;
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}

// Founders Agreement
export interface FoundersAgreementData {
  founderNames: string;
  companyName: string;
  businessDescription: string;
  equityDistribution: string;
  vestingSchedule: string;
  roles: string;
  capitalContributions: string;
  intellectualProperty: string;
  confidentiality: string;
  nonCompete: string;
  disputeResolution: string;
  governingLaw: string;
  effectiveDate: string;
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}

// Stock Purchase Agreement
export interface StockPurchaseAgreementData {
  purchaserName: string;
  sellerName: string;
  companyName: string;
  numberOfShares: string;
  sharePrice: string;
  totalPurchasePrice: string;
  shareClass: string;
  restrictionsOnTransfer: string;
  representationsWarranties: string;
  closingDate: string;
  governingLaw: string;
  purchaserAddress: string;
  sellerAddress: string;
  effectiveDate: string;
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}

// NDA
export interface NDAData {
  disclosingParty: string;
  receivingParty: string;
  purposeOfDisclosure: string;
  confidentialInformation: string;
  exclusions: string;
  obligations: string;
  termLength: string;
  returnOfInformation: string;
  remedies: string;
  governingLaw: string;
  disclosingPartyAddress: string;
  receivingPartyAddress: string;
  effectiveDate: string;
  date?: string;
  place?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  includeDigitalSignature?: boolean;
  qrCodeUrl?: string;
}
