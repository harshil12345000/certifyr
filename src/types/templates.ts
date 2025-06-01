
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
  workPeriod: string;
  workDescription: string;
  performance: string;
  reason: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface CharacterData {
  fullName: string;
  gender: "male" | "female" | "other";
  parentName: string;
  address: string;
  period: string;
  character: string;
  conduct: string;
  purpose: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface IncomeData {
  fullName: string;
  parentName: string;
  address: string;
  occupation: string;
  annualIncome: string;
  assessmentYear: string;
  purpose: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

export interface NoObjectionData {
  fullName: string;
  employeeId: string;
  designation: string;
  department: string;
  purpose: string;
  activityDetails: string;
  conditions: string;
  date: string;
  place: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}
