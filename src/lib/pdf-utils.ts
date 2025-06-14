
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateAndDownloadPdf = async (element: React.ReactElement, filename: string) => {
  // Create a temporary div to render the element
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  document.body.appendChild(tempDiv);

  // Find the preview element in the current DOM
  const previewElement = document.querySelector('.a4-document') as HTMLElement;
  
  if (!previewElement) {
    throw new Error('Preview element not found');
  }

  try {
    // Generate canvas from the preview element
    const canvas = await html2canvas(previewElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [794, 1123], // A4 dimensions in pixels
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123);

    // Download the PDF
    pdf.save(filename);
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};
