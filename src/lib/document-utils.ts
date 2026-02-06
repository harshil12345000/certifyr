import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_WIDTH_PX = 794; // A4 width in pixels at 96 DPI
const A4_HEIGHT_PX = 1123; // A4 height in pixels at 96 DPI
const A4_CAPTURE_SCALE = 3;

const getA4DocumentElement = (root: ParentNode = document): HTMLElement => {
  const previewElement = root.querySelector(".a4-document") as HTMLElement | null;
  if (!previewElement) {
    throw new Error("Preview element not found");
  }
  return previewElement;
};

const waitForFonts = async (doc: Document = document) => {
  const maybeDoc = doc as unknown as { fonts?: FontFaceSet };
  if (!maybeDoc.fonts?.ready) return;

  try {
    await maybeDoc.fonts.ready;
  } catch {
    // Ignore font readiness errors; exports should still proceed.
  }
};

const waitForImagesToLoad = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll("img")) as HTMLImageElement[];
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = img.onerror = resolve;
      });
    }),
  );
};

const toDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const replaceImagesWithDataUrls = async (element: HTMLElement) => {
  const images = Array.from(element.querySelectorAll("img")) as HTMLImageElement[];
  const originalSrcs: string[] = [];

  for (const img of images) {
    originalSrcs.push(img.src);
    if (img.src.startsWith("http")) {
      try {
        img.crossOrigin = "anonymous";
        img.src = await toDataUrl(img.src);
      } catch {
        // If fetch fails, keep original src.
      }
    }
  }

  return () => {
    images.forEach((img, i) => {
      img.src = originalSrcs[i];
    });
  };
};

/**
 * Aggressive export stabilization:
 * - clones the A4 node into an offscreen container (avoids parent transforms / responsive scaling)
 * - forces a fixed A4 pixel box (stable letter spacing)
 * - waits for fonts + images
 */
const createOffscreenA4Clone = (sourceA4: HTMLElement) => {
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${A4_WIDTH_PX}px`;
  wrapper.style.height = `${A4_HEIGHT_PX}px`;
  wrapper.style.background = "#ffffff";
  wrapper.style.padding = "0";
  wrapper.style.margin = "0";
  wrapper.style.overflow = "hidden";
  wrapper.style.transform = "none";
  // isolate rendering so inherited layout/transform from the app can't affect this clone
  wrapper.style.contain = "layout style paint";

  const clone = sourceA4.cloneNode(true) as HTMLElement;
  clone.style.width = `${A4_WIDTH_PX}px`;
  clone.style.height = `${A4_HEIGHT_PX}px`;
  clone.style.maxWidth = "none";
  clone.style.minHeight = "0";
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return {
    captureElement: clone,
    dispose: () => {
      wrapper.remove();
    },
  };
};

const generateCanvasForA4Element = async (a4Element: HTMLElement) => {
  await waitForFonts();

  const { captureElement, dispose } = createOffscreenA4Clone(a4Element);
  try {
    await waitForFonts();
    await waitForImagesToLoad(captureElement);

    const restoreImages = await replaceImagesWithDataUrls(captureElement);
    try {
      return await html2canvas(captureElement, {
        scale: A4_CAPTURE_SCALE,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
      });
    } finally {
      restoreImages();
    }
  } finally {
    dispose();
  }
};

export const downloadPDFInContainer = async (
  container: ParentNode,
  filename: string = "document.pdf",
) => {
  const a4Element = getA4DocumentElement(container);
  const canvas = await generateCanvasForA4Element(a4Element);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgData = canvas.toDataURL("image/png", 1.0);
  const imgWidthMm = 210;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidthMm, imgHeightMm);
  pdf.save(filename);
};

export const downloadJPGInContainer = async (
  container: ParentNode,
  filename: string = "document.jpg",
) => {
  const a4Element = getA4DocumentElement(container);
  const canvas = await generateCanvasForA4Element(a4Element);

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/jpeg", 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printDocumentInContainer = async (container: ParentNode) => {
  const a4Element = getA4DocumentElement(container);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Failed to open print window. Please allow popups for this site.");
  }

  // Copy all <link rel="stylesheet"> and <style> tags (more reliable than cssRules; avoids CORS access issues)
  let headContent = "";
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => {
    headContent += el.outerHTML;
  });

  const baseHref = window.location.origin + "/";

  printWindow.document.write(`
    <html>
      <head>
        <base href="${baseHref}" />
        <title>Print Document</title>
        ${headContent}
        <style>
          @page { size: A4; margin: 0; }
          html, body { margin: 0; padding: 0; background: #ffffff !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
          .a4-document { width: 210mm !important; min-height: 297mm !important; box-shadow: none !important; }
        </style>
      </head>
      <body style="margin:0;padding:0;">
        ${a4Element.outerHTML}
        <script>
          function allImagesLoaded(doc) {
            const imgs = doc.images;
            if (!imgs || imgs.length === 0) return Promise.resolve();
            return Promise.all(Array.from(imgs).map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise(res => { img.onload = img.onerror = res; });
            }));
          }

          function fontsReady(doc) {
            try {
              return (doc.fonts && doc.fonts.ready) ? doc.fonts.ready : Promise.resolve();
            } catch (e) {
              return Promise.resolve();
            }
          }

          window.onload = function() {
            Promise.all([allImagesLoaded(document), fontsReady(document)]).then(function() {
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

// Backwards-compatible wrappers
export const downloadPDF = async (filename: string = "document.pdf") => {
  try {
    await downloadPDFInContainer(document, filename);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    alert("Failed to generate PDF. See console for details.");
  }
};

export const downloadJPG = async (filename: string = "document.jpg") => {
  await downloadJPGInContainer(document, filename);
};

export const printDocument = async () => {
  await printDocumentInContainer(document);
};
