export interface FoundersAgreementData {
  founderNames: string;
  founders: string;
  companyName: string;
  effectiveDate: string;
  businessDescription: string;
  businessPurpose: string;
  equityDistribution: string;
  roles: string;
  rolesResponsibilities: string;
  rolesAndResponsibilities: string;
  vestingSchedule: string;
  intellectualProperty: string;
  nonCompete: string;
  capitalContributions: string;
  confidentiality: string;
  disputeResolution: string;
  exitProvisions: string;
  termination: string;
  governingLaw: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface ArticlesOfIncorporationData {
  corporationName: string;
  companyName: string;
  stateOfIncorporation: string;
  registeredAgent: string;
  registeredAgentAddress: string;
  registeredAddress: string;
  registeredOffice: string;
  corporateAddress: string;
  authorizedShares: string;
  stockShares: string;
  shareValue: string;
  stockValue: string;
  shareClasses: string;
  incorporatorName: string;
  incorporator: string;
  incorporators: Array<{ name: string; address: string; place?: string }>;
  incorporatorAddress: string;
  incorporatorTitle: string;
  businessPurpose: string;
  purpose: string;
  filingDate: string;
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
  salary: string;
  workLocation: string;
  workHours: string;
  benefits: string;
  duties: string;
  terminationClause: string;
  terminationTerms: string;
  employmentType: string;
  probationPeriod: string;
  payFrequency: string;
  confidentialityClause: string;
  nonCompeteClause: string;
  governingLaw: string;
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
  course: string;
  department: string;
  academicYear: string;
  enrollmentYear: string;
  graduationYear: string;
  semester: string;
  subjects: string;
  cgpa: string;
  percentage: string;
  grades: string;
  grade: string;
  class: string;
  institutionName: string;
  signatoryName: string;
  signatoryDesignation: string;
  date: string;
  place: string;
  includeDigitalSignature: boolean;
}

export interface CorporateBylawsData {
  corporationName: string;
  companyName: string;
  stateOfIncorporation: string;
  registeredAgent: string;
  registeredOffice: string;
  principalOffice: string;
  businessPurpose: string;
  purpose: string;
  authorizedShares: string;
  fiscalYearEnd: string;
  fiscalYear: string;
  boardSize: string;
  numberOfDirectors: string;
  directorTermLength: string;
  boardMembers: string;
  officers: string;
  officerTitles: string;
  stockClasses: string;
  meetingRequirements: string;
  boardMeetingFrequency: string;
  shareholderMeetingDate: string;
  votingRights: string;
  dividendPolicy: string;
  amendmentProcess: string;
  amendmentProcedure: string;
  dissolutionProcess: string;
  adoptionDate: string;
  // Directors can be nested object or string
  directors?: { numberOfDirectors: string; directorTermLength: string; boardMeetingFrequency: string };
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
  duration: string;
  confidentialInformation: string;
  purposeOfDisclosure: string;
  permittedUse: string;
  permittedDisclosure: string;
  exclusions: string;
  obligations: string;
  termLength: string;
  nonDisclosurePeriod: string;
  returnOfMaterials: string;
  returnOfInformation: string;
  remedies: string;
  governingLaw: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface OfferLetterData {
  candidateName: string;
  candidateAddress: string;
  jobTitle: string;
  department: string;
  startDate: string;
  dateOfOffer: string;
  salary: string;
  salaryAmount: string;
  salaryCurrency: string;
  salaryFrequency: string;
  benefits: string;
  duties: string;
  jobResponsibilities: string;
  reportingManager: string;
  workLocation: string;
  workHours: string;
  employmentTerms: string;
  probationPeriod: string;
  noticePeriod: string;
  acceptanceDeadline: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface StockPurchaseAgreementData {
  sellerName: string;
  sellerAddress: string;
  seller: { name: string; address: string };
  buyerName: string;
  purchaserName: string;
  purchaserAddress: string;
  buyer: { name: string; address: string };
  numberOfShares: string;
  shares: { class: string; quantity: string };
  shareClass: string;
  sharePrice: string;
  pricePerShare: string;
  totalPrice: string;
  totalPurchasePrice: string;
  totalConsideration: string;
  companyName: string;
  closingDate: string;
  paymentTerms: string;
  representations: string;
  representationsWarranties: string;
  warranties: string;
  covenants: { restrictionsOnTransfer: string } | string;
  restrictionsOnTransfer: string;
  indemnification: string;
  governingLaw: string;
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
  documentDetails: string;
  documentIssueDate: string;
  issuingAuthority: string;
  attestationPurpose: string;
  purposeOfAttestation: string;
  destinationCountry: string;
  embassyName: string;
  applicantAddress: string;
  phoneNumber: string;
  emailAddress: string;
  submissionDate: string;
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}