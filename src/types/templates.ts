
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

export interface NocVisaData {
  fullName: string;
  employeeOrStudentId: string;
  designationOrCourse: string;
  department: string;
  passportNumber: string;
  destinationCountry: string;
  travelStartDate: string;
  travelEndDate: string;
  purposeOfVisit: string;
  contactPersonInDestination?: string;
  accommodationDetails?: string;
  tripFundSource?: 'self' | 'company';
  institutionName: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
  fontFamily?: string;
  fontSize?: number;
}

export type FormData = BonafideData | ExperienceData | CharacterData | NocVisaData;

export interface BonafidePreviewProps {
  data: BonafideData;
}

export interface ExperiencePreviewProps {
  data: ExperienceData;
}

export interface CharacterPreviewProps {
  data: CharacterData;
}

export interface NocVisaPreviewProps {
  data: NocVisaData;
}
