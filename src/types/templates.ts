
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
