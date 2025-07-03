import React, { useState, useEffect } from 'react';
import { IncomeCertificatePreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';
import { downloadPDF, downloadJPG } from '@/lib/document-utils';

export const IncomeCertificatePreview: React.FC<IncomeCertificatePreviewProps> = ({ data, isEmployeePreview = false, showExportButtons = false }) => {
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
    <div className="a4-document bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0">
      {showExportButtons && (
        <div className="flex gap-2 justify-end mb-4">
          <button onClick={() => downloadPDF('income-certificate.pdf')} className="px-3 py-1 bg-blue-600 text-white rounded">Download PDF</button>
          <button onClick={() => downloadJPG('income-certificate.jpg')} className="px-3 py-1 bg-gray-600 text-white rounded">Download JPG</button>
        </div>
      )}

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
          {/* Signature Section */}
          {data.includeDigitalSignature && signatureUrl && !isEmployeePreview ? (
            <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" />
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <p className="font-bold">{signatoryName || "[Authorized Signatory Name]"}</p>
          <p>{signatoryDesignation || "[Designation]"}</p>
          <p className="mb-4">{institutionName || '[Institution Name]'}</p>
          
          {/* QR Code Section */}
          {!isEmployeePreview && qrCodeUrl && (
            <QRCode value={qrCodeUrl} size={60} />
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
