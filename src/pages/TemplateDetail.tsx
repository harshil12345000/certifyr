import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  BonafideForm,
  CharacterForm,
  ExperienceForm,
  EmbassyAttestationForm,
  CompletionCertificateForm,
  TransferCertificateForm,
  NocVisaForm,
  IncomeCertificateForm,
  MaternityLeaveForm,
  BankVerificationForm,
  OfferLetterForm,
  AddressProofForm,
  ArticlesOfIncorporationForm,
  CorporateBylawsForm,
} from '@/components/templates/forms';
import {
  BonafidePreview,
  CharacterPreview,
  ExperiencePreview,
  EmbassyAttestationPreview,
  CompletionCertificatePreview,
  TransferCertificatePreview,
  NocVisaPreview,
  IncomeCertificatePreview,
  MaternityLeavePreview,
  BankVerificationPreview,
  OfferLetterPreview,
  AddressProofPreview,
  ArticlesOfIncorporationPreview,
  CorporateBylawsPreview,
} from '@/components/templates';
import {
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
  FormData,
} from '@/types/templates';
import {
  ArticlesOfIncorporationData,
  CorporateBylawsData,
} from '@/types/corporate-templates';
import { Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { generateAndDownloadPdf } from '@/lib/pdf-utils';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

const getInitialData = (templateId: string): FormData | ArticlesOfIncorporationData | CorporateBylawsData => {
  const commonFields = {
    institutionName: '',
    date: new Date().toISOString().split('T')[0],
    place: '',
    signatoryName: '',
    signatoryDesignation: '',
    includeDigitalSignature: false,
  };

  switch (templateId) {
    case 'articles-incorporation-1':
      return {
        corporationName: '',
        stateOfIncorporation: '',
        businessPurpose: '',
        corporateAddress: '',
        registeredAgent: '',
        registeredAgentAddress: '',
        authorizedShares: '',
        shareValue: '',
        incorporatorName: '',
        incorporatorAddress: '',
        incorporatorSignature: '',
        filingDate: new Date().toISOString().split('T')[0],
        ...commonFields,
      } as ArticlesOfIncorporationData;

    case 'corporate-bylaws-1':
      return {
        corporationName: '',
        stateOfIncorporation: '',
        principalOffice: '',
        boardMeetingFrequency: '',
        shareholderMeetingDate: '',
        fiscalYearEnd: '',
        numberOfDirectors: '',
        directorTermLength: '',
        officerTitles: '',
        votingRights: '',
        dividendPolicy: '',
        amendmentProcess: '',
        adoptionDate: new Date().toISOString().split('T')[0],
        ...commonFields,
      } as CorporateBylawsData;

    case 'bonafide-1':
      return {
        fullName: '',
        gender: 'male' as const,
        parentName: '',
        type: 'student' as const,
        startDate: '',
        courseOrDesignation: '',
        department: '',
        purpose: '',
        ...commonFields,
      } as BonafideData;

    case 'character-1':
      return {
        fullName: '',
        parentName: '',
        address: '',
        duration: '',
        conduct: '',
        ...commonFields,
      } as CharacterData;

    case 'experience-1':
      return {
        fullName: '',
        employeeId: '',
        designation: '',
        department: '',
        joinDate: '',
        resignationDate: '',
        workDescription: '',
        salary: '',
        ...commonFields,
      } as ExperienceData;

    case 'embassy-attestation-1':
      return {
        fullName: '',
        passportNumber: '',
        nationality: '',
        dateOfBirth: '',
        placeOfBirth: '',
        fatherName: '',
        motherName: '',
        documentType: '',
        documentNumber: '',
        issuingAuthority: '',
        documentIssueDate: '',
        purposeOfAttestation: '',
        destinationCountry: '',
        embassyName: '',
        applicantAddress: '',
        phoneNumber: '',
        emailAddress: '',
        ...commonFields,
      } as EmbassyAttestationData;

    case 'completion-certificate-1':
      return {
        fullName: '',
        fatherName: '',
        registrationNumber: '',
        courseTitle: '',
        courseDuration: '',
        completionDate: '',
        grade: '',
        percentage: '',
        programType: 'course' as const,
        ...commonFields,
      } as CompletionCertificateData;

    case 'transfer-certificate-1':
      return {
        fullName: '',
        fatherName: '',
        motherName: '',
        dateOfBirth: '',
        admissionNumber: '',
        class: '',
        section: '',
        academicYear: '',
        dateOfAdmission: '',
        dateOfLeaving: '',
        reasonForLeaving: '',
        conduct: '',
        subjects: '',
        ...commonFields,
      } as TransferCertificateData;

    case 'noc-visa-1':
      return {
        fullName: '',
        designation: '',
        employeeId: '',
        department: '',
        passportNumber: '',
        visaType: '',
        destinationCountry: '',
        travelPurpose: '',
        travelDates: '',
        returnDate: '',
        sponsorDetails: '',
        ...commonFields,
      } as NocVisaData;

    case 'income-certificate-1':
      return {
        fullName: '',
        fatherName: '',
        designation: '',
        employeeId: '',
        department: '',
        basicSalary: '',
        allowances: '',
        totalIncome: '',
        incomeFrequency: 'monthly' as const,
        purpose: '',
        ...commonFields,
      } as IncomeCertificateData;

    case 'maternity-leave-1':
      return {
        fullName: '',
        employeeId: '',
        designation: '',
        department: '',
        expectedDeliveryDate: '',
        leaveStartDate: '',
        leaveEndDate: '',
        totalLeaveDays: '',
        medicalCertificateNumber: '',
        doctorName: '',
        hospitalName: '',
        emergencyContact: '',
        emergencyContactPhone: '',
        ...commonFields,
      } as MaternityLeaveData;

    case 'bank-verification-1':
      return {
        fullName: '',
        employeeId: '',
        designation: '',
        department: '',
        bankName: '',
        accountNumber: '',
        accountType: 'savings' as const,
        ifscCode: '',
        branchName: '',
        branchAddress: '',
        accountHolderName: '',
        joinDate: '',
        currentSalary: '',
        purpose: '',
        ...commonFields,
      } as BankVerificationData;

    case 'offer-letter-1':
      return {
        candidateName: '',
        candidateAddress: '',
        dateOfOffer: new Date().toISOString().split('T')[0],
        jobTitle: '',
        department: '',
        reportingManager: '',
        startDate: '',
        probationPeriod: '',
        salaryAmount: '',
        salaryCurrency: 'INR',
        salaryFrequency: 'monthly' as const,
        benefits: '',
        workHours: '',
        workLocation: '',
        acceptanceDeadline: '',
        ...commonFields,
      } as OfferLetterData;

    case 'address-proof-1':
      return {
        fullName: '',
        fatherName: '',
        currentAddress: '',
        permanentAddress: '',
        residenceDuration: '',
        relationshipWithApplicant: 'self' as const,
        idProofType: 'aadhar' as const,
        idProofNumber: '',
        purpose: '',
        ...commonFields,
      } as AddressProofData;

    default:
      return {
        fullName: '',
        gender: 'male' as const,
        parentName: '',
        type: 'student' as const,
        startDate: '',
        courseOrDesignation: '',
        department: '',
        purpose: '',
        ...commonFields,
      } as BonafideData;
  }
};

const TemplateDetail = () => {
  const { id: templateId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData | ArticlesOfIncorporationData | CorporateBylawsData>(() => getInitialData(templateId || ''));

  useEffect(() => {
    if (!templateId) {
      toast({
        title: 'Error',
        description: 'Template ID is missing.',
        variant: 'destructive',
      });
      navigate('/templates');
    }
  }, [templateId, navigate, toast]);

  const handleFormSubmit = (data: FormData | ArticlesOfIncorporationData | CorporateBylawsData) => {
    setFormData(data);
  };

  const renderForm = () => {
    switch (templateId) {
      case 'articles-incorporation-1':
        return (
          <ArticlesOfIncorporationForm
            initialData={formData as ArticlesOfIncorporationData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'corporate-bylaws-1':
        return (
          <CorporateBylawsForm
            initialData={formData as CorporateBylawsData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'bonafide-1':
        return (
          <BonafideForm
            initialData={formData as BonafideData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'character-1':
        return (
          <CharacterForm
            initialData={formData as CharacterData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'experience-1':
        return (
          <ExperienceForm
            initialData={formData as ExperienceData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'embassy-attestation-1':
        return (
          <EmbassyAttestationForm
            initialData={formData as EmbassyAttestationData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'completion-certificate-1':
        return (
          <CompletionCertificateForm
            initialData={formData as CompletionCertificateData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'transfer-certificate-1':
        return (
          <TransferCertificateForm
            initialData={formData as TransferCertificateData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'noc-visa-1':
        return (
          <NocVisaForm
            initialData={formData as NocVisaData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'income-certificate-1':
        return (
          <IncomeCertificateForm
            initialData={formData as IncomeCertificateData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'maternity-leave-1':
        return (
          <MaternityLeaveForm
            initialData={formData as MaternityLeaveData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'bank-verification-1':
        return (
          <BankVerificationForm
            initialData={formData as BankVerificationData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'offer-letter-1':
        return (
          <OfferLetterForm
            initialData={formData as OfferLetterData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
      case 'address-proof-1':
        return (
          <AddressProofForm
            initialData={formData as AddressProofData}
            onDataChange={setFormData}
          />
        );
      default:
        return (
          <BonafideForm
            initialData={formData as BonafideData}
            onSubmit={(data) => handleFormSubmit(data)}
          />
        );
    }
  };

  const renderPreview = () => {
    switch (templateId) {
      case 'articles-incorporation-1':
        return <ArticlesOfIncorporationPreview data={formData as ArticlesOfIncorporationData} />;
      case 'corporate-bylaws-1':
        return <CorporateBylawsPreview data={formData as CorporateBylawsData} />;
      case 'bonafide-1':
        return <BonafidePreview data={formData as BonafideData} />;
      case 'character-1':
        return <CharacterPreview data={formData as CharacterData} />;
      case 'experience-1':
        return <ExperiencePreview data={formData as ExperienceData} />;
      case 'embassy-attestation-1':
        return <EmbassyAttestationPreview data={formData as EmbassyAttestationData} />;
      case 'completion-certificate-1':
        return <CompletionCertificatePreview data={formData as CompletionCertificateData} />;
      case 'transfer-certificate-1':
        return <TransferCertificatePreview data={formData as TransferCertificateData} />;
      case 'noc-visa-1':
        return <NocVisaPreview data={formData as NocVisaData} />;
      case 'income-certificate-1':
        return <IncomeCertificatePreview data={formData as IncomeCertificateData} />;
      case 'maternity-leave-1':
        return <MaternityLeavePreview data={formData as MaternityLeaveData} />;
      case 'bank-verification-1':
        return <BankVerificationPreview data={formData as BankVerificationData} />;
      case 'offer-letter-1':
        return <OfferLetterPreview data={formData as OfferLetterData} />;
      case 'address-proof-1':
        return <AddressProofPreview data={formData as AddressProofData} />;
      default:
        return <BonafidePreview data={formData as BonafideData} />;
    }
  };

  const handleDownload = async () => {
    if (!templateId) {
      toast({
        title: 'Error',
        description: 'Template ID is missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await generateAndDownloadPdf(renderPreview(), `${templateId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please check the console for details.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Template Details</h1>
          <Button onClick={handleDownload} className="gradient-blue gap-2">
            Download <Download className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
        <div>
          <Tabs defaultValue="form" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="form" className="w-1/2">Form</TabsTrigger>
              <TabsTrigger value="preview" className="w-1/2">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="bg-secondary rounded-md p-4">
              <h2 className="text-lg font-semibold mb-4">Form</h2>
              {renderForm()}
            </TabsContent>
            <TabsContent value="preview" className="bg-secondary rounded-md p-4">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              {renderPreview()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TemplateDetail;
