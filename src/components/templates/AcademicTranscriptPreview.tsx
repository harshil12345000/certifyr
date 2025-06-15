
import React, { useState, useEffect } from 'react';
import { AcademicTranscriptData } from '@/types/corporate-templates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BrandingAssets {
  logoUrl: string | null;
  sealUrl: string | null;
  signatureUrl: string | null;
  organizationAddress: string | null;
  organizationPhone: string | null;
  organizationEmail: string | null;
}

export interface AcademicTranscriptPreviewProps {
  data: AcademicTranscriptData;
}

export const AcademicTranscriptPreview: React.FC<AcademicTranscriptPreviewProps> = ({ data }) => {
  const {
    studentName,
    studentId,
    fatherName,
    motherName,
    dateOfBirth,
    courseTitle,
    academicYear,
    semester,
    subjects,
    grades,
    cgpa,
    percentage,
    class: studentClass,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const [branding, setBranding] = useState<BrandingAssets>({ 
    logoUrl: null, 
    sealUrl: null, 
    signatureUrl: null,
    organizationAddress: null,
    organizationPhone: null,
    organizationEmail: null
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchBranding = async () => {
      if (!institutionName && !user?.id) {
        console.warn("Academic Transcript Preview: Institution name or user context not available for fetching branding.");
        return;
      }
      try {
        let orgIdToQuery: string | null = null;

        if (institutionName) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, address, phone, email')
            .eq('name', institutionName)
            .single();

          if (orgError && orgError.code !== 'PGRST116') {
            console.error("Error fetching organization by name:", orgError.message);
          } else if (orgError?.code === 'PGRST116') {
            console.warn(`Organization named "${institutionName}" not found.`);
          }
          
          if (orgData) {
            orgIdToQuery = orgData.id;
            setBranding(prev => ({
              ...prev,
              organizationAddress: orgData.address,
              organizationPhone: orgData.phone,
              organizationEmail: orgData.email,
            }));
          }
        }

        if (orgIdToQuery) {
          const { data: filesData, error: filesError } = await supabase
            .from('branding_files')
            .select('name, path')
            .eq('organization_id', orgIdToQuery);

          if (filesError) {
            console.error("Error fetching branding files:", filesError);
          } else if (filesData) {
            let newLogoUrl: string | null = null;
            let newSealUrl: string | null = null;
            let newSignatureUrl: string | null = null;

            filesData.forEach(file => {
              const publicUrlRes = supabase.storage.from('branding-assets').getPublicUrl(file.path);
              const publicUrl = publicUrlRes.data?.publicUrl;
              if (publicUrl) {
                if (file.name === 'logo') newLogoUrl = publicUrl;
                if (file.name === 'seal') newSealUrl = publicUrl;
                if (file.name === 'signature') newSignatureUrl = publicUrl;
              }
            });
            
            setBranding(prev => ({ ...prev, logoUrl: newLogoUrl, sealUrl: newSealUrl, signatureUrl: newSignatureUrl }));
          }
        }

      } catch (error) {
        console.error("Unexpected error fetching branding:", error);
      }
    };
    fetchBranding();
  }, [institutionName, user]);

  const formattedDateOfBirth = dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Date of Birth]';
  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-serif text-sm leading-relaxed">
      {/* Letterhead Section */}
      <div className="text-center mb-8 pb-4 border-b-2 border-blue-200">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={`${institutionName || 'Institution'} Logo`} className="h-20 mx-auto mb-4 object-contain" />
        )}
        <h1 className="text-3xl font-bold text-blue-600 uppercase tracking-wide">{institutionName || '[INSTITUTION NAME]'}</h1>
        {branding.organizationAddress && <p className="text-sm mt-2">{branding.organizationAddress}</p>}
        {(branding.organizationPhone || branding.organizationEmail) && (
          <p className="text-sm">
            {branding.organizationPhone && `Tel: ${branding.organizationPhone}`}
            {branding.organizationPhone && branding.organizationEmail && ' | '}
            {branding.organizationEmail && `Email: ${branding.organizationEmail}`}
          </p>
        )}
      </div>

      {/* Document Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">ACADEMIC TRANSCRIPT</h2>
        </div>
      </div>

      {/* Student Information */}
      <div className="mb-8">
        <h3 className="text-base font-bold mb-4 text-blue-600 border-b border-blue-200 pb-1">STUDENT INFORMATION</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Student Name:</strong> {studentName || '[Student Name]'}</div>
          <div><strong>Student ID:</strong> {studentId || '[Student ID]'}</div>
          <div><strong>Father's Name:</strong> {fatherName || "[Father's Name]"}</div>
          <div><strong>Mother's Name:</strong> {motherName || "[Mother's Name]"}</div>
          <div><strong>Date of Birth:</strong> {formattedDateOfBirth}</div>
          <div><strong>Course:</strong> {courseTitle || '[Course Title]'}</div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="mb-8">
        <h3 className="text-base font-bold mb-4 text-blue-600 border-b border-blue-200 pb-1">ACADEMIC DETAILS</h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><strong>Academic Year:</strong> {academicYear || '[Academic Year]'}</div>
          <div><strong>Semester/Year:</strong> {semester || '[Semester]'}</div>
          <div><strong>Class/Division:</strong> {studentClass || '[Class]'}</div>
          <div><strong>Overall Grade:</strong> {grades || '[Grade]'}</div>
        </div>
        
        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-6 bg-blue-50 p-4 rounded">
          <div className="text-center">
            <strong>CGPA/GPA</strong>
            <div className="text-lg font-bold text-blue-600">{cgpa || '[CGPA]'}</div>
          </div>
          <div className="text-center">
            <strong>Percentage</strong>
            <div className="text-lg font-bold text-blue-600">{percentage || '[Percentage]'}</div>
          </div>
          <div className="text-center">
            <strong>Class</strong>
            <div className="text-lg font-bold text-blue-600">{studentClass || '[Class]'}</div>
          </div>
        </div>

        {/* Subjects and Marks */}
        <div className="mb-6">
          <h4 className="font-bold mb-2">Subjects & Marks:</h4>
          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-line">
            {subjects || '[Subjects and marks will be listed here]'}
          </div>
        </div>
      </div>

      {/* Certification */}
      <div className="mb-8 text-justify">
        <p>
          This is to certify that the above academic record is true and correct as per the records maintained by this institution. 
          <strong> {studentName || '[Student Name]'}</strong> has successfully completed the requirements for <strong>{courseTitle || '[Course Title]'}</strong> 
          during the academic year <strong>{academicYear || '[Academic Year]'}</strong>.
        </p>
      </div>

      {/* Date and Place */}
      <div className="mt-12 mb-16">
        <p><strong>Date:</strong> {formattedIssueDate}</p>
        <p><strong>Place:</strong> {place || '[Place]'}</p>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-end items-end">
        <div className="text-right">
          {includeDigitalSignature && branding.signatureUrl && (
            <img src={branding.signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain ml-auto" />
          )}
          {includeDigitalSignature && !branding.signatureUrl && (
            <div className="h-16 w-48 mb-2 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 italic ml-auto">
              [Digital Signature Placeholder]
            </div>
          )}
          {!includeDigitalSignature && <div className="h-16"></div>}
          <p className="font-semibold">{signatoryName || '[Authorized Signatory Name]'}</p>
          <p>{signatoryDesignation || '[Designation]'}</p>
          <p>{institutionName || '[Institution Name]'}</p>
        </div>
      </div>

      {/* Seal */}
      {branding.sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img src={branding.sealUrl} alt="Institution Seal" className="h-24 w-24 object-contain opacity-50" />
        </div>
      )}
    </div>
  );
};
