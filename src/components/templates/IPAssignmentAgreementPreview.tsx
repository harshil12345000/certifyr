
import React, { useState, useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';
import { downloadPDF, downloadJPG } from '@/lib/document-utils';

interface IPAssignmentAgreementData {
  employeeName: string;
  employeeAddress: string;
  companyName: string;
  effectiveDate: string;
  workDescription: string;
  signatoryName: string;
  signatoryDesignation: string;
  includeDigitalSignature: boolean;
}

interface IPAssignmentAgreementPreviewProps {
  data: IPAssignmentAgreementData;
  isEmployeePreview?: boolean;
  showExportButtons?: boolean;
}

export const IPAssignmentAgreementPreview: React.FC<IPAssignmentAgreementPreviewProps> = ({ 
  data, 
  isEmployeePreview = false, 
  showExportButtons = false 
}) => {
  const { signatureUrl, sealUrl, organizationDetails } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (data.employeeName && data.companyName) {
        const url = await generateDocumentQRCode(
          'ip-assignment-agreement-1',
          data,
          organizationDetails?.name,
          user?.id
        );
        setQrCodeUrl(url);
      }
    };
    if (!isEmployeePreview) {
      generateQR();
    }
  }, [data, organizationDetails?.name, user?.id, isEmployeePreview]);

  return (
    <div className="a4-document bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0">
      {showExportButtons && (
        <div className="flex gap-2 justify-end mb-4">
          <button onClick={() => downloadPDF('ip-assignment-agreement.pdf')} className="px-3 py-1 bg-blue-600 text-white rounded">Download PDF</button>
          <button onClick={() => downloadJPG('ip-assignment-agreement.jpg')} className="px-3 py-1 bg-gray-600 text-white rounded">Download JPG</button>
        </div>
      )}

      <Letterhead />

      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT</h2>
        </div>
      </div>

      <div className="space-y-6 text-justify leading-7 text-base">
        <p>
          This Intellectual Property Assignment Agreement is entered into on{' '}
          <strong>{data.effectiveDate ? new Date(data.effectiveDate).toLocaleDateString() : '[Date]'}</strong>{' '}
          between <strong>{data.companyName || '[Company Name]'}</strong> and{' '}
          <strong>{data.employeeName || '[Employee Name]'}</strong>.
        </p>

        <p>
          The employee agrees to assign all intellectual property rights created during employment to the company,
          including but not limited to: {data.workDescription || '[Work Description]'}.
        </p>
      </div>

      <div className="flex justify-between items-end mt-16">
        <div>
          <p><strong>Date:</strong> {data.effectiveDate ? new Date(data.effectiveDate).toLocaleDateString() : '[Date]'}</p>
        </div>
        
        <div className="text-right">
          {/* Signature Section */}
          {data.includeDigitalSignature && signatureUrl && !isEmployeePreview ? (
            <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" />
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <p className="font-bold">{data.signatoryName || "[Authorized Signatory Name]"}</p>
          <p>{data.signatoryDesignation || "[Designation]"}</p>
          <p className="mb-4">{data.companyName || '[Company Name]'}</p>
          
          {/* QR Code Section */}
          {!isEmployeePreview && qrCodeUrl && (
            <QRCode value={qrCodeUrl} size={75} />
          )}
        </div>
      </div>

      {/* Seal */}
      {sealUrl && (
        <div className="absolute bottom-8 left-8">
          <img src={sealUrl} alt="Organization Seal" className="h-20 w-20 object-contain opacity-75" />
        </div>
      )}
    </div>
  );
};
