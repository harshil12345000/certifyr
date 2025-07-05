import React, { useState, useEffect } from 'react';
import { MaternityLeavePreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';

interface ExtendedMaternityLeavePreviewProps extends MaternityLeavePreviewProps {
  isEmployeePreview?: boolean;
  requestStatus?: 'pending' | 'approved' | 'rejected';
}

export const MaternityLeavePreview: React.FC<ExtendedMaternityLeavePreviewProps> = ({ data, isEmployeePreview = false, requestStatus = 'pending' }) => {
  const {
    fullName,
    employeeId,
    designation,
    department,
    expectedDeliveryDate,
    leaveStartDate,
    leaveEndDate,
    totalLeaveDays,
    medicalCertificateNumber,
    doctorName,
    hospitalName,
    emergencyContact,
    emergencyContactPhone,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { signatureUrl, sealUrl, organizationDetails } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const shouldBlur = isEmployeePreview && requestStatus !== 'approved';

  useEffect(() => {
    const generateQR = async () => {
      if (fullName && leaveStartDate && leaveEndDate) {
        const url = await generateDocumentQRCode(
          'maternity-leave-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
        if (!url) {
          console.error('QR code URL generation failed for Maternity Leave Preview.');
        }
      }
    };
    generateQR();
  }, [data, organizationDetails?.name, user?.id, fullName, leaveStartDate, leaveEndDate]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '[Date]';
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">MATERNITY LEAVE CERTIFICATE</h2>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="space-y-4 text-justify leading-7 text-base">
        <p>
          This is to certify that <strong>{fullName || '[Employee Name]'}</strong>, 
          Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>, 
          working as <strong>{designation || '[Designation]'}</strong> in the 
          <strong> {department || '[Department]'}</strong> department of our organization, 
          has been granted maternity leave.
        </p>

        <div className="my-6">
          <h3 className="font-bold text-lg mb-3">Leave Details:</h3>
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50 w-1/3">Expected Delivery Date</td>
                <td className="border border-gray-400 p-2">{formatDate(expectedDeliveryDate)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Leave Start Date</td>
                <td className="border border-gray-400 p-2">{formatDate(leaveStartDate)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Leave End Date</td>
                <td className="border border-gray-400 p-2">{formatDate(leaveEndDate)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Total Leave Days</td>
                <td className="border border-gray-400 p-2">{totalLeaveDays || '[Total Days]'} days</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="my-6">
          <h3 className="font-bold text-lg mb-3">Medical Information:</h3>
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50 w-1/3">Medical Certificate Number</td>
                <td className="border border-gray-400 p-2">{medicalCertificateNumber || '[Certificate Number]'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Doctor Name</td>
                <td className="border border-gray-400 p-2">{doctorName || '[Doctor Name]'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Hospital Name</td>
                <td className="border border-gray-400 p-2">{hospitalName || '[Hospital Name]'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="my-6">
          <h3 className="font-bold text-lg mb-3">Emergency Contact:</h3>
          <p><strong>Name:</strong> {emergencyContact || '[Emergency Contact Name]'}</p>
          <p><strong>Phone:</strong> {emergencyContactPhone || '[Emergency Contact Phone]'}</p>
        </div>

        <p>
          The employee is expected to resume duties on {formatDate(leaveEndDate)} or as per medical advice.
        </p>

        <p>
          This certificate is issued for official purposes and records.
        </p>
      </div>

      {/* Date and signature */}
      <div className="flex justify-between items-end mt-16">
        <div>
          <p><strong>Date:</strong> {formatDate(issueDate)}</p>
          <p><strong>Place:</strong> {place || '[Place]'}</p>
        </div>
        
        <div className="text-right">
          {includeDigitalSignature && signatureUrl ? (
            <div className="h-16 mb-4 flex justify-end relative">
              <div className="border-b border-gray-800 px-6">
                <img
                  src={signatureUrl}
                  alt="Digital Signature"
                  className={`h-12 object-contain ${shouldBlur ? 'blur-sm' : ''}`}
                  onError={(e) => handleImageError(e, "signature")}
                />
              </div>
              {shouldBlur && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 border border-dashed border-gray-400">
                  <span className="text-xs text-gray-500">Signature pending approval</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-16 mb-4"></div>
          )}
          <p className="font-bold">{signatoryName || "[Authorized Signatory Name]"}</p>
          <p>{signatoryDesignation || "[Designation]"}</p>
          <p className="mb-4">{institutionName || '[Institution Name]'}</p>
          
          {/* QR Code positioned below institution name */}
          {qrCodeUrl && (
            <div className="flex justify-end">
              <QRCode value={qrCodeUrl} size={60} />
            </div>
          )}
        </div>
      </div>

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-8 left-8">
          <img 
            src={sealUrl}
            alt="Organization Seal" 
            className="h-20 w-20 object-contain opacity-75"
            onError={(e) => handleImageError(e, "seal")}
          />
        </div>
      )}
    </div>
  );
};
