import React, { useState, useEffect } from 'react';
import { BankVerificationPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';
import { Letterhead } from './Letterhead';
import { downloadPDF, downloadJPG } from '@/lib/document-utils';

export const BankVerificationPreview: React.FC<BankVerificationPreviewProps> = ({ data, isEmployeePreview = false, showExportButtons = false }) => {
  const {
    fullName,
    employeeId,
    designation,
    department,
    bankName,
    accountNumber,
    accountType,
    ifscCode,
    branchName,
    branchAddress,
    accountHolderName,
    joinDate,
    currentSalary,
    purpose,
    institutionName,
    date: issueDate,
    place,
    signatoryName,
    signatoryDesignation,
    includeDigitalSignature,
  } = data;

  const { logoUrl, sealUrl, signatureUrl, organizationDetails } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (fullName && bankName && accountNumber) {
        const url = await generateDocumentQRCode(
          'bank-verification-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
        if (!url) {
          console.error('QR code URL generation failed for Bank Verification Preview.');
        }
      }
    };
    generateQR();
  }, [data, organizationDetails?.name, user?.id, fullName, bankName, accountNumber]);

  const formattedIssueDate = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Issue Date]';
  const formattedJoinDate = joinDate ? new Date(joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Join Date]';

  const formatCurrency = (amount: string) => {
    if (!amount) return '0';
    const num = parseFloat(amount.replace(/,/g, ''));
    return isNaN(num) ? amount : num.toLocaleString('en-IN');
  };

  const getAccountTypeText = (type: string) => {
    switch (type) {
      case 'savings': return 'Savings Account';
      case 'current': return 'Current Account';
      case 'salary': return 'Salary Account';
      default: return 'Account';
    }
  };

  const displayInstitutionName = organizationDetails?.name || institutionName || '[INSTITUTION NAME]';

  return (
    <div className="a4-document bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0">
      {showExportButtons && (
        <div className="flex gap-2 justify-end mb-4">
          <button onClick={() => downloadPDF('bank-verification.pdf')} className="px-3 py-1 bg-blue-600 text-white rounded">Download PDF</button>
          <button onClick={() => downloadJPG('bank-verification.jpg')} className="px-3 py-1 bg-gray-600 text-white rounded">Download JPG</button>
        </div>
      )}

      {/* Letterhead */}
      <Letterhead />

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <div className="border-2 border-gray-600 inline-block px-6 py-2">
          <h2 className="text-lg font-bold uppercase tracking-widest">BANK ACCOUNT VERIFICATION LETTER</h2>
        </div>
      </div>

      {/* Reference Number */}
      <div className="flex justify-between mb-6 text-sm">
        <p><strong>Reference No.:</strong> BAV/{new Date().getFullYear()}/______</p>
        <p><strong>Date:</strong> {formattedIssueDate}</p>
      </div>

      {/* Letter Content */}
      <div className="space-y-6 text-base leading-7">
        <p className="text-center font-semibold text-lg mb-6">
          TO WHOM IT MAY CONCERN
        </p>

        <p className="text-justify">
          This is to certify that <strong>{fullName || '[Employee Name]'}</strong> (Employee ID: <strong>{employeeId || '[Employee ID]'}</strong>) 
          is a regular employee of our organization working as <strong>{designation || '[Designation]'}</strong> 
          in the <strong>{department || '[Department]'}</strong> department since <strong>{formattedJoinDate}</strong>.
        </p>

        <p className="text-justify">
          The employee's current salary is <strong>₹ {formatCurrency(currentSalary) || '[Current Salary]'}</strong> per month, 
          which is directly credited to the following bank account:
        </p>

        <div className="ml-8 space-y-2">
          <p><strong>Account Holder Name:</strong> {accountHolderName || '[Account Holder Name]'}</p>
          <p><strong>Bank Name:</strong> {bankName || '[Bank Name]'}</p>
          <p><strong>Account Number:</strong> {accountNumber || '[Account Number]'}</p>
          <p><strong>Account Type:</strong> {getAccountTypeText(accountType || 'savings')}</p>
          <p><strong>IFSC Code:</strong> {ifscCode || '[IFSC Code]'}</p>
          <p><strong>Branch Name:</strong> {branchName || '[Branch Name]'}</p>
          <p><strong>Branch Address:</strong> {branchAddress || '[Branch Address]'}</p>
        </div>

        <p className="text-justify">
          We hereby confirm that the above-mentioned bank account details are authentic and belong to our employee. 
          The salary of the employee is directly credited to this account on a monthly basis.
        </p>

        <p className="text-justify">
          This letter is being issued for <strong>{purpose || '[Purpose for bank account verification]'}</strong>.
        </p>

        <p className="text-justify text-sm">
          <strong>Disclaimer:</strong> This letter is issued based on the records available with us and is valid as on the date of issue. 
          The organization does not take any responsibility for any financial transactions or commitments made by the employee.
        </p>

        <p className="text-center font-medium">
          This letter is issued upon the request of the employee for official purposes only.
        </p>
      </div>

      {/* Date and Place */}
      <div className="mt-16 mb-8">
        <p><strong>Date:</strong> {formattedIssueDate}</p>
        <p><strong>Place:</strong> {place || '[Place]'}</p>
      </div>

      {/* Signatory Section */}
      <div className="flex justify-end items-end mt-16">
        <div className="text-center">
          {/* Signature Section */}
          {data.includeDigitalSignature && signatureUrl && !isEmployeePreview ? (
            <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" />
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <div className="border-t border-black pt-2 min-w-[200px]">
            <p className="font-semibold">{signatoryName || '[Authorized Signatory Name]'}</p>
            <p className="text-sm">{signatoryDesignation || '[Designation]'}</p>
            <p className="text-sm">{displayInstitutionName}</p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      {!isEmployeePreview && qrCodeUrl && (
        <div className="absolute bottom-8 right-8">
          <QRCode value={qrCodeUrl} size={60} />
        </div>
      )}

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-32 left-16">
          <img src={sealUrl} alt="Institution Seal" className="h-20 w-20 object-contain opacity-50" />
        </div>
      )}
    </div>
  );
};
