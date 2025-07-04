import { downloadPDF, downloadJPG } from '@/lib/document-utils';

export const IPAssignmentAgreementPreview: React.FC<IPAssignmentAgreementPreviewProps> = ({ data, isEmployeePreview = false, showExportButtons = false }) => {
  // ... existing code ...
  {/* Signature Section */}
  {data.includeDigitalSignature && signatureUrl && !isEmployeePreview ? (
    <img src={signatureUrl} alt="Signatory Signature" className="h-16 mb-2 object-contain mx-auto" />
  ) : (
    <div className="h-16 mb-2"></div>
  )}
  // ... existing code ...
  {/* QR Code Section */}
  {!isEmployeePreview && qrCodeUrl && (
    <QRCode value={qrCodeUrl} size={75} />
  )}
  // ... existing code ...
  return (
    <div className="a4-document bg-white shadow rounded-lg max-w-4xl mx-auto print:shadow-none print:p-0">
      {showExportButtons && (
        <div className="flex gap-2 justify-end mb-4">
          <button onClick={() => downloadPDF('ip-assignment-agreement.pdf')} className="px-3 py-1 bg-blue-600 text-white rounded">Download PDF</button>
          <button onClick={() => downloadJPG('ip-assignment-agreement.jpg')} className="px-3 py-1 bg-gray-600 text-white rounded">Download JPG</button>
        </div>
      )}
    </div>
  );
} 