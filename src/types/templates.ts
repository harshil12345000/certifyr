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

export interface NocVisaData {
  // Applicant Details
  fullName: string;
  employeeOrStudentId: string; // Can be Employee ID or Student ID
  designationOrCourse: string; // Designation if employee, Course & Year if student
  department: string;
  passportNumber: string;

  // Travel Details
  destinationCountry: string;
  travelStartDate: string;
  travelEndDate: string;
  purposeOfVisit: string; // e.g., Tourism, Conference, Family Visit
  
  // Optional details
  contactPersonInDestination?: string;
  accommodationDetails?: string;
  tripFundSource?: 'self' | 'company'; // Who is funding the trip

  // Issuing Authority Details (often pre-filled or from context)
  institutionName: string; // Could be company or educational institution
  date: string; // Issue date, typically today
  place: string; // Place of issue

  // Signatory Details
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export type FormData = BonafideData | ExperienceData | CharacterData | NocVisaData;
