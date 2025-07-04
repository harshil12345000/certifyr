// Corporate template data types
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
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

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
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

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
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

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
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface EmploymentAgreementData {
  employeeName: string;
  employerName: string;
  jobTitle: string;
  department: string;
  startDate: string;
  employmentType: 'full-time' | 'part-time' | 'contract';
  salary: string;
  payFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  benefits: string;
  workLocation: string;
  workHours: string;
  probationPeriod: string;
  terminationClause: string;
  confidentialityClause: string;
  nonCompeteClause: string;
  governingLaw: string;
  effectiveDate: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface IPAssignmentAgreementData {
  assignorName: string;
  assigneeName: string;
  relationshipDescription: string;
  intellectualPropertyDescription: string;
  workScope: string;
  creationPeriod: string;
  compensationDetails: string;
  assignmentScope: string;
  moralRights: string;
  warrantiesAssignor: string;
  governingLaw: string;
  effectiveDate: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

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
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface AcademicTranscriptData {
  studentName: string;
  studentId: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  courseTitle: string;
  academicYear: string;
  semester: string;
  subjects: string;
  grades: string;
  cgpa: string;
  percentage: string;
  class: string;
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
