import {
  FormData,
  BonafideData,
  CharacterData,
  ExperienceData,
  EmbassyAttestationData,
  CompletionCertificateData,
  TransferCertificateData,
  NocVisaData,
  IncomeCertificateData,
  MaternityLeaveData,
  BankVerificationData,
  OfferLetterData,
  AddressProofData,
} from "@/types/templates";
import {
  ArticlesOfIncorporationData,
  CorporateBylawsData,
  FoundersAgreementData,
  StockPurchaseAgreementData,
  EmploymentAgreementData,
  NDAData,
  AcademicTranscriptData,
  EmbassyAttestationLetterData,
} from "@/types/corporate-templates";

export const getInitialData = (
  templateId: string,
):
  | FormData
  | ArticlesOfIncorporationData
  | CorporateBylawsData
  | FoundersAgreementData
  | StockPurchaseAgreementData
  | EmploymentAgreementData
  | NDAData
  | AcademicTranscriptData
  | EmbassyAttestationLetterData => {
  const commonFields = {
    institutionName: "",
    date: new Date().toISOString().split("T")[0],
    place: "",
    signatoryName: "",
    signatoryDesignation: "",
    includeDigitalSignature: false,
  };

  switch (templateId) {
    case "academic-transcript-1":
      return {
        studentName: "",
        studentId: "",
        fatherName: "",
        motherName: "",
        dateOfBirth: "",
        courseTitle: "",
        academicYear: "",
        semester: "",
        subjects: "",
        grades: "",
        cgpa: "",
        percentage: "",
        class: "",
        ...commonFields,
      } as AcademicTranscriptData;

    case "embassy-attestation-letter-1":
      return {
        applicantName: "",
        passportNumber: "",
        nationality: "",
        dateOfBirth: "",
        placeOfBirth: "",
        fatherName: "",
        motherName: "",
        documentType: "",
        documentNumber: "",
        issuingAuthority: "",
        documentIssueDate: "",
        purposeOfAttestation: "",
        destinationCountry: "",
        embassyName: "",
        applicantAddress: "",
        phoneNumber: "",
        emailAddress: "",
        ...commonFields,
      } as EmbassyAttestationLetterData;

    case "employment-agreement-1":
      return {
        employeeName: "",
        employerName: "",
        jobTitle: "",
        department: "",
        startDate: new Date().toISOString().split("T")[0],
        employmentType: "full-time" as const,
        salary: "",
        payFrequency: "monthly" as const,
        benefits: "",
        workLocation: "",
        workHours: "",
        probationPeriod: "",
        terminationClause: "",
        duties: "",
        terminationTerms: "",
        confidentialityClause: "",
        nonCompeteClause: "",
        governingLaw: "",
        effectiveDate: new Date().toISOString().split("T")[0],
        ...commonFields,
      } as EmploymentAgreementData;

    case "nda-1":
      return {
        disclosingParty: "",
        receivingParty: "",
        purposeOfDisclosure: "",
        confidentialInformation: "",
        exclusions: "",
        obligations: "",
        termLength: "",
        returnOfInformation: "",
        remedies: "",
        governingLaw: "",
        disclosingPartyAddress: "",
        receivingPartyAddress: "",
        duration: "",
        permittedUse: "",
        permittedDisclosure: "",
        nonDisclosurePeriod: "",
        returnOfMaterials: "",
        effectiveDate: new Date().toISOString().split("T")[0],
        ...commonFields,
      } as NDAData;

    case "founders-agreement-1":
      return {
        founderNames: "",
        founders: "",
        companyName: "",
        businessDescription: "",
        businessPurpose: "",
        equityDistribution: "",
        vestingSchedule: "",
        roles: "",
        rolesResponsibilities: "",
        rolesAndResponsibilities: "",
        capitalContributions: "",
        intellectualProperty: "",
        confidentiality: "",
        nonCompete: "",
        disputeResolution: "",
        exitProvisions: "",
        termination: "",
        governingLaw: "",
        effectiveDate: new Date().toISOString().split("T")[0],
        ...commonFields,
      } as FoundersAgreementData;

    case "stock-purchase-agreement-1":
      return {
        purchaserName: "",
        sellerName: "",
        sellerAddress: "",
        buyerName: "",
        buyer: { name: "", address: "" },
        seller: { name: "", address: "" },
        companyName: "",
        numberOfShares: "",
        shares: { class: "", quantity: "" },
        sharePrice: "",
        pricePerShare: "",
        totalPrice: "",
        totalPurchasePrice: "",
        totalConsideration: "",
        shareClass: "",
        restrictionsOnTransfer: "",
        representationsWarranties: "",
        representations: "",
        warranties: "",
        covenants: "",
        indemnification: "",
        paymentTerms: "",
        closingDate: new Date().toISOString().split("T")[0],
        governingLaw: "",
        purchaserAddress: "",
        effectiveDate: new Date().toISOString().split("T")[0],
        ...commonFields,
      } as StockPurchaseAgreementData;

    case "articles-incorporation-1":
      return {
        corporationName: "",
        companyName: "",
        stateOfIncorporation: "",
        businessPurpose: "",
        purpose: "",
        corporateAddress: "",
        registeredAgent: "",
        registeredAgentAddress: "",
        registeredAddress: "",
        registeredOffice: "",
        authorizedShares: "",
        stockShares: "",
        shareValue: "",
        stockValue: "",
        shareClasses: "",
        incorporatorName: "",
        incorporator: "",
        incorporators: [],
        incorporatorAddress: "",
        incorporatorTitle: "",
        incorporatorSignature: "",
        filingDate: new Date().toISOString().split("T")[0],
        ...commonFields,
      } as ArticlesOfIncorporationData;

    case "corporate-bylaws-1":
      return {
        corporationName: "",
        companyName: "",
        stateOfIncorporation: "",
        registeredAgent: "",
        registeredOffice: "",
        principalOffice: "",
        businessPurpose: "",
        purpose: "",
        authorizedShares: "",
        fiscalYearEnd: "",
        fiscalYear: "",
        boardSize: "",
        numberOfDirectors: "",
        directorTermLength: "",
        boardMembers: "",
        officers: "",
        officerTitles: "",
        stockClasses: "",
        meetingRequirements: "",
        boardMeetingFrequency: "",
        shareholderMeetingDate: "",
        votingRights: "",
        dividendPolicy: "",
        amendmentProcess: "",
        amendmentProcedure: "",
        dissolutionProcess: "",
        adoptionDate: new Date().toISOString().split("T")[0],
        ...commonFields,
      } as CorporateBylawsData;

    case "bonafide-1":
      return {
        fullName: "",
        gender: "male" as const,
        parentName: "",
        type: "student" as const,
        startDate: "",
        courseOrDesignation: "",
        department: "",
        purpose: "",
        ...commonFields,
      } as BonafideData;

    case "character-1":
      return {
        fullName: "",
        parentName: "",
        address: "",
        duration: "",
        conduct: "",
        ...commonFields,
      } as CharacterData;

    case "experience-1":
      return {
        fullName: "",
        employeeId: "",
        designation: "",
        department: "",
        joinDate: "",
        resignationDate: "",
        workDescription: "",
        salary: "",
        ...commonFields,
      } as ExperienceData;

    case "embassy-attestation-1":
      return {
        fullName: "",
        passportNumber: "",
        nationality: "",
        dateOfBirth: "",
        placeOfBirth: "",
        fatherName: "",
        motherName: "",
        documentType: "",
        documentNumber: "",
        issuingAuthority: "",
        documentIssueDate: "",
        purposeOfAttestation: "",
        destinationCountry: "",
        embassyName: "",
        applicantAddress: "",
        phoneNumber: "",
        emailAddress: "",
        ...commonFields,
      } as EmbassyAttestationData;

    case "completion-certificate-1":
      return {
        fullName: "",
        fatherName: "",
        registrationNumber: "",
        courseTitle: "",
        courseDuration: "",
        completionDate: "",
        grade: "",
        percentage: "",
        programType: "course" as const,
        ...commonFields,
      } as CompletionCertificateData;

    case "transfer-certificate-1":
      return {
        fullName: "",
        fatherName: "",
        motherName: "",
        dateOfBirth: "",
        admissionNumber: "",
        class: "",
        section: "",
        academicYear: "",
        dateOfAdmission: "",
        dateOfLeaving: "",
        reasonForLeaving: "",
        conduct: "",
        subjects: "",
        ...commonFields,
      } as TransferCertificateData;

    case "noc-visa-1":
      return {
        fullName: "",
        designation: "",
        employeeId: "",
        department: "",
        passportNumber: "",
        visaType: "",
        destinationCountry: "",
        travelPurpose: "",
        travelDates: "",
        returnDate: "",
        sponsorDetails: "",
        ...commonFields,
      } as NocVisaData;

    case "income-certificate-1":
      return {
        fullName: "",
        fatherName: "",
        designation: "",
        employeeId: "",
        department: "",
        basicSalary: "",
        allowances: "",
        totalIncome: "",
        incomeFrequency: "monthly" as const,
        purpose: "",
        ...commonFields,
      } as IncomeCertificateData;

    case "maternity-leave-1":
      return {
        fullName: "",
        employeeId: "",
        designation: "",
        department: "",
        expectedDeliveryDate: "",
        leaveStartDate: "",
        leaveEndDate: "",
        totalLeaveDays: "",
        medicalCertificateNumber: "",
        doctorName: "",
        hospitalName: "",
        emergencyContact: "",
        emergencyContactPhone: "",
        ...commonFields,
      } as MaternityLeaveData;

    case "bank-verification-1":
      return {
        fullName: "",
        employeeId: "",
        designation: "",
        department: "",
        accountNumber: "",
        bankName: "",
        branchName: "",
        branchAddress: "",
        accountHolderName: "",
        ifscCode: "",
        accountType: "",
        currentSalary: "",
        joinDate: "",
        openingDate: "",
        currentBalance: "",
        purpose: "",
        ...commonFields,
      } as BankVerificationData;

    case "offer-letter-1":
      return {
        candidateName: "",
        candidateAddress: "",
        jobTitle: "",
        department: "",
        startDate: new Date().toISOString().split("T")[0],
        dateOfOffer: new Date().toISOString().split("T")[0],
        salary: "",
        salaryAmount: "",
        salaryCurrency: "",
        salaryFrequency: "",
        benefits: "",
        duties: "",
        jobResponsibilities: "",
        reportingManager: "",
        workLocation: "",
        workHours: "",
        employmentTerms: "",
        probationPeriod: "",
        noticePeriod: "",
        acceptanceDeadline: "",
        ...commonFields,
      } as OfferLetterData;

    case "address-proof-1":
      return {
        fullName: "",
        fatherName: "",
        relationshipWithApplicant: "",
        currentAddress: "",
        permanentAddress: "",
        residenceDuration: "",
        idProofType: "",
        idProofNumber: "",
        purpose: "",
        address: "",
        duration: "",
        proofType: "",
        ...commonFields,
      } as AddressProofData;

    default:
      return {
        fullName: "",
        gender: "male" as const,
        parentName: "",
        type: "student" as const,
        institutionName: "",
        startDate: "",
        courseOrDesignation: "",
        department: "",
        purpose: "",
        date: new Date().toISOString().split("T")[0],
        place: "",
        signatoryName: "",
        signatoryDesignation: "",
        includeDigitalSignature: false,
      } as FormData;
  }
};
