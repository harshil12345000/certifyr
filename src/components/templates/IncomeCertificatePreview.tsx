import React, { useState, useEffect } from 'react';
import { IncomeCertificatePreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';

export const IncomeCertificatePreview: React.FC<IncomeCertificatePreviewProps> = ({ data }) => {
  const {
    fullName,
    fatherName,
    designation,
    employeeId,
    department,
    basicSalary,
    allowances,
    totalIncome,
    incomeFrequency,
    purpose,
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

  useEffect(() => {
    const generateQR = async () => {
      if (fullName && designation && totalIncome) {
        const url = await generateDocumentQRCode(
          'income-certificate-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
      }
    };
    generateQR();
  }, [data, organizationDetails?.name, user?.id, fullName, designation, totalIncome]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: string) => {
    console.error(`Error loading ${type}:`, e);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';

  const formatCurrency = (amount: string) => {
    if (!amount) return '[Amount]';
    const num = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(num)) return amount;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="a4-document p-8 bg-white text-gray-800 font-sans text-sm leading-relaxed relative">
      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">INCOME CERTIFICATE</h2>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="space-y-4 text-justify leading-7 text-base">
        <p>
          This is to certify that <strong>{fullName || '[Employee Name]'}</strong>
          {fatherName && `, son/daughter of ${fatherName},`} 
          is a bonafide employee of this organization working as <strong>{designation || '[Designation]'}</strong> 
          in the <strong>{department || '[Department]'}</strong> department.
        </p>

        {employeeId && (
          <p>Employee ID: <strong>{employeeId}</strong></p>
        )}

        <div className="my-6">
          <h3 className="font-bold text-lg mb-3">Income Details:</h3>
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Basic Salary</td>
                <td className="border border-gray-400 p-2">{formatCurrency(basicSalary)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">Allowances</td>
                <td className="border border-gray-400 p-2">{formatCurrency(allowances)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold bg-gray-50">
                  Total {incomeFrequency === 'monthly' ? 'Monthly' : 'Annual'} Income
                </td>
                <td className="border border-gray-400 p-2 font-semibold">{formatCurrency(totalIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          This certificate is issued for <strong>{purpose || '[Purpose]'}</strong> purposes.
        </p>

        <p>
          The information provided above is true and correct to the best of our knowledge.
        </p>
      </div>

      {/* Date and signature */}
      <div className="flex justify-between items-end mt-16">
        <div>
          <p><strong>Date:</strong> {formattedIssueDate}</p>
          <p><strong>Place:</strong> {place || '[Place]'}</p>
        </div>
        
        <div className="text-right">
          {includeDigitalSignature ? (
            <div className="h-16 mb-4 flex justify-end">
              {signatureUrl ? (
                <div className="border-b border-gray-800 px-6">
                  <img 
                    src={signatureUrl}
                    alt="Digital Signature" 
                    className="h-12 object-contain"
                    onError={(e) => handleImageError(e, "signature")}
                  />
                </div>
              ) : (
                <div className="border-b border-gray-800 px-6 py-3">
                  <div className="h-8 w-24 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    [Signature]
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-16 mb-4">
              {/* Space for manual signature */}
            </div>
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
