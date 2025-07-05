
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BonafidePreviewProps } from '@/types/templates';
import { Letterhead } from './Letterhead';
import { QRCode } from './QRCode';
import { generateDocumentQRCode } from '@/lib/qr-utils';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';

export const BonafidePreview: React.FC<BonafidePreviewProps & { 
  isEmployeePreview?: boolean; 
  showExportButtons?: boolean;
  requestStatus?: 'pending' | 'approved' | 'rejected';
}> = ({ 
  data, 
  isEmployeePreview = false, 
  showExportButtons = true,
  requestStatus = 'pending'
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { signatureUrl, organizationDetails } = useBranding();
  const { user } = useAuth();

  useEffect(() => {
    if (requestStatus === 'approved' && data.fullName) {
      const generateQR = async () => {
        const url = await generateDocumentQRCode(
          'bonafide-1', 
          data, 
          organizationDetails?.name,
          user?.id
        );
        if (url) setQrCodeUrl(url);
      };
      generateQR();
    }
  }, [data, requestStatus, organizationDetails?.name, user?.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJPG = async () => {
    const element = document.getElementById('bonafide-preview');
    if (element) {
      try {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = 'bonafide-certificate.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
      } catch (error) {
        console.error('Error generating JPG:', error);
      }
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('bonafide-preview');
    if (element) {
      try {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('bonafide-certificate.pdf');
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {showExportButtons && requestStatus === 'approved' && !isEmployeePreview && (
        <div className="flex justify-end gap-2 mb-4 no-print">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadJPG}>
            <Download className="h-4 w-4 mr-2" />
            JPG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      )}
      
      <div id="bonafide-preview" className="a4-document p-8 min-h-[297mm] bg-white">
        <Letterhead />
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold underline decoration-2 underline-offset-4">
            BONAFIDE CERTIFICATE
          </h1>
        </div>

        <div className="mb-8 text-justify leading-7">
          <p className="mb-4">
            This is to certify that {data.gender === 'male' ? 'Mr.' : data.gender === 'female' ? 'Ms.' : ''} <strong>{data.fullName}</strong>, 
            {data.gender === 'male' ? ' son' : data.gender === 'female' ? ' daughter' : ' child'} of <strong>{data.parentName}</strong>, 
            is a bonafide {data.type} of this {data.institutionName}.
          </p>
          
          <p className="mb-4">
            {data.gender === 'male' ? 'He' : data.gender === 'female' ? 'She' : 'They'} has been {data.type === 'student' ? 'studying' : 'working'} 
            {data.courseOrDesignation && ` in ${data.courseOrDesignation}`}
            {data.department && ` in the ${data.department} department`} since <strong>{data.startDate}</strong>.
          </p>
          
          <p className="mb-4">
            This certificate is issued for the purpose of <strong>{data.purpose}</strong> at the request of the concerned {data.type}.
          </p>
        </div>

        <div className="flex justify-between items-end mt-16">
          <div className="flex flex-col">
            {requestStatus === 'approved' && data.includeDigitalSignature && qrCodeUrl && (
              <div className="mb-4">
                <QRCode value={qrCodeUrl} size={80} />
                <p className="text-xs text-gray-600 mt-1">Scan to verify</p>
              </div>
            )}
            {isEmployeePreview && requestStatus !== 'approved' && (
              <div className="mb-4 w-20 h-20 border border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500">
                QR Code
              </div>
            )}
            <div>
              <p className="text-sm">Date: {data.date}</p>
              <p className="text-sm">Place: {data.place}</p>
            </div>
          </div>
          
          <div className="text-center">
            {requestStatus === 'approved' && data.includeDigitalSignature && signatureUrl && (
              <div className="mb-4">
                <img src={signatureUrl} alt="Digital Signature" className="h-16 w-32 object-contain mx-auto" />
              </div>
            )}
            {isEmployeePreview && requestStatus !== 'approved' && (
              <div className="mb-4 h-16 w-32 border border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500 mx-auto">
                [Signature will appear after approval]
              </div>
            )}
            <div>
              <p className="font-semibold">{data.signatoryName}</p>
              <p className="text-sm">{data.signatoryDesignation}</p>
              <p className="text-sm">{data.institutionName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
