import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_PX = 794;  // A4 width in pixels at 96 DPI
const A4_HEIGHT_PX = 1123; // A4 height in pixels at 96 DPI

const getPreviewElement = () => {
  const previewElement = document.querySelector('.a4-document') as HTMLElement;
  if (!previewElement) {
    throw new Error('Preview element not found');
  }
  return previewElement;
};

const generateCanvas = async (element: HTMLElement) => {
  return await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: A4_WIDTH_PX,
    height: A4_HEIGHT_PX,
  });
};

export const downloadPDF = async (filename: string = 'document.pdf') => {
  try {
    const previewElement = getPreviewElement();
    // Save original styles
    const originalWidth = previewElement.style.width;
    const originalHeight = previewElement.style.height;
    const originalMaxWidth = previewElement.style.maxWidth;
    const originalMinHeight = previewElement.style.minHeight;

    // Force A4 size in px
    previewElement.style.width = A4_WIDTH_PX + 'px';
    previewElement.style.height = A4_HEIGHT_PX + 'px';
    previewElement.style.maxWidth = 'none';
    previewElement.style.minHeight = '0';

    const canvas = await generateCanvas(previewElement);

    // Restore original styles
    previewElement.style.width = originalWidth;
    previewElement.style.height = originalHeight;
    previewElement.style.maxWidth = originalMaxWidth;
    previewElement.style.minHeight = originalMinHeight;

    // PDF export: use mm units and fit image to A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pageWidth = 210; // mm
    const pageHeight = 297; // mm

    // Get image data and scale
    const imgData = canvas.toDataURL('image/png', 1.0);
    const imgProps = {
      width: canvas.width,
      height: canvas.height,
    };
    // Calculate dimensions in mm
    const pxPerMm = imgProps.width / pageWidth;
    const imgHeightMm = imgProps.height / pxPerMm;
    let x = 0, y = 0, w = pageWidth, h = imgHeightMm;
    console.log('PDF Export:', { imgProps, pxPerMm, imgHeightMm, pageWidth, pageHeight });
    if (!isFinite(pxPerMm) || !isFinite(imgHeightMm) || imgProps.width === 0 || imgProps.height === 0) {
      // Fallback: fit to page
      w = pageWidth;
      h = pageHeight;
      x = 0;
      y = 0;
      console.warn('Falling back to full page size for PDF export.');
    } else if (imgHeightMm > pageHeight) {
      // Scale down to fit page height
      h = pageHeight;
      w = (imgProps.width / imgProps.height) * h;
      x = (pageWidth - w) / 2;
      y = 0;
    } else {
      // Center vertically
      y = (pageHeight - h) / 2;
    }
    pdf.addImage(imgData, 'PNG', x, y, w, h);
    pdf.save(filename);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    alert('Failed to generate PDF. See console for details.');
  }
};

export const downloadJPG = async (filename: string = 'document.jpg') => {
  const previewElement = getPreviewElement();
  // Save original styles
  const originalWidth = previewElement.style.width;
  const originalHeight = previewElement.style.height;
  const originalMaxWidth = previewElement.style.maxWidth;
  const originalMinHeight = previewElement.style.minHeight;

  // Force A4 size in px
  previewElement.style.width = A4_WIDTH_PX + 'px';
  previewElement.style.height = A4_HEIGHT_PX + 'px';
  previewElement.style.maxWidth = 'none';
  previewElement.style.minHeight = '0';

  const canvas = await generateCanvas(previewElement);

  // Restore original styles
  previewElement.style.width = originalWidth;
  previewElement.style.height = originalHeight;
  previewElement.style.maxWidth = originalMaxWidth;
  previewElement.style.minHeight = originalMinHeight;

  // Create a temporary link element
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printDocument = async () => {
  const previewElement = getPreviewElement();

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups for this site.');
  }

  // Copy all <link rel="stylesheet"> and <style> tags
  let headContent = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => {
    headContent += el.outerHTML;
  });

  // Compose the print HTML
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Document</title>
        ${headContent}
        <style>
          @media print { html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; } }
          @page { size: A4; margin: 0; }
        </style>
      </head>
      <body style="margin:0;padding:0;">
        ${previewElement.outerHTML}
        <script>
          function allImagesLoaded(doc) {
            const imgs = doc.images;
            if (!imgs || imgs.length === 0) return Promise.resolve();
            return Promise.all(Array.from(imgs).map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(res => { img.onload = img.onerror = res; });
            }));
          }
          window.onload = function() {
            allImagesLoaded(document).then(function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              }, 100);
            });
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}; 