
import React, { useState, useEffect } from 'react';
import { AddressProofPreviewProps } from '@/types/templates';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';
import { downloadPDF, downloadJPG } from '@/lib/document-utils';

export const AddressProofPreview: React.FC<AddressProofPreviewProps> = ({ data, isEmployeePreview = false, showExportButtons = false }) => {
  const { signatureUrl, sealUrl, organizationDetails } = useBranding();
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (data.fullName && data.purpose) {
        const url = await generateDocumentQRCode(
          'address-proof-1',
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
          <button onClick={() => downloadPDF('address-proof.pdf')} className="px-3 py-1 bg-blue-600 text-white rounded">Download PDF</button>
          <button onClick={() => downloadJPG('address-proof.jpg')} className="px-3 py-1 bg-gray-600 text-white rounded">Download JPG</button>
        </div>
      )}

      <Letterhead />

      <div className="text-center mb-8">
        <div className="border border-gray-400 inline-block px-8 py-3">
          <h2 className="text-lg font-bold uppercase tracking-widest">ADDRESS PROOF CERTIFICATE</h2>
        </div>
      </div>

      <div className="space-y-6 text-justify leading-7 text-base">
        <p>
          This is to certify that <strong>{data.fullName || '[Full Name]'}</strong>, 
          {data.fatherName && ` son/daughter of ${data.fatherName},`} has been residing at the following address:
        </p>

        <div className="bg-gray-50 p-4 rounded">
          <p><strong>Current Address:</strong></p>
          <p className="ml-4">{data.currentAddress || '[Current Address]'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <p><strong>Permanent Address:</strong></p>
          <p className="ml-4">{data.permanentAddress || '[Permanent Address]'}</p>
        </div>

        <p>
          The above-mentioned person has been residing at the current address for a period of{' '}
          <strong>{data.residenceDuration || '[Duration]'}</strong>.
        </p>

        <p>
          <strong>ID Proof Details:</strong><br/>
          Type: {data.idProofType || '[ID Proof Type]'}<br/>
          Number: {data.idProofNumber || '[ID Proof Number]'}
        </p>

        <p>
          This certificate is issued for the purpose of <strong>{data.purpose || '[Purpose]'}</strong>.
        </p>
      </div>

      <div className="flex justify-between items-end mt-16">
        <div>
          <p><strong>Date:</strong> {data.date ? new Date(data.date).toLocaleDateString() : '[Date]'}</p>
          <p><strong>Place:</strong> {data.place || '[Place]'}</p>
        </div>
        
        <div className="text-right">
          {data.includeDigitalSignature && signatureUrl && !isEmployeePreview ? (
            <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" />
          ) : (
            <div className="h-16 mb-2"></div>
          )}
          <p className="font-bold">{data.signatoryName || "[Authorized Signatory Name]"}</p>
          <p>{data.signatoryDesignation || "[Designation]"}</p>
          <p className="mb-4">{data.institutionName || '[Institution Name]'}</p>
          
          {!isEmployeePreview && qrCodeUrl && (
            <QRCode value={qrCodeUrl} size={75} />
          )}
        </div>
      </div>

      {sealUrl && (
        <div className="absolute bottom-8 left-8">
          <img src={sealUrl} alt="Organization Seal" className="h-20 w-20 object-contain opacity-75" />
        </div>
      )}
    </div>
  );
};
