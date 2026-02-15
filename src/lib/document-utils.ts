import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_WIDTH_PX = 794; // A4 width in pixels at 96 DPI
const A4_HEIGHT_PX = 1123; // A4 height in pixels at 96 DPI
const EXPORT_SCALE = 3;

const ensureFileExtension = (filename: string, ext: "pdf" | "jpg") => {
  const normalized = filename.trim();
  if (normalized.toLowerCase().endsWith(`.${ext}`)) return normalized;
  return `${normalized}.${ext}`;
};

const waitForFontsToLoad = async (doc: Document = document) => {
  const fonts = (doc as unknown as { fonts?: FontFaceSet }).fonts;
  if (!fonts?.ready) return;
  try {
    await fonts.ready;
  } catch {
    // Ignore font loading issues and continue best-effort.
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

// Only inline text/visual properties that matter for typography fidelity.
// Layout properties are intentionally excluded so the clone reflows
// naturally at the full 794px A4 width inside the offscreen container.
const INLINE_PROPS = new Set([
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant",
  "font-stretch",
  "letter-spacing",
  "word-spacing",
  "line-height",
  "text-align",
  "text-decoration",
  "text-transform",
  "text-indent",
  "text-shadow",
  "white-space",
  "word-break",
  "word-wrap",
  "overflow-wrap",
  "color",
  "background-color",
  "background-image",
  "background",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-width",
  "border-style",
  "border-color",
  "border-radius",
  "box-shadow",
  "opacity",
  "visibility",
  "vertical-align",
  "list-style",
  "list-style-type",
]);

const inlineAllComputedStyles = (sourceRoot: HTMLElement, cloneRoot: HTMLElement) => {
  const sourceElements = [
    sourceRoot,
    ...(Array.from(sourceRoot.querySelectorAll("*")) as HTMLElement[]),
  ];
  const cloneElements = [
    cloneRoot,
    ...(Array.from(cloneRoot.querySelectorAll("*")) as HTMLElement[]),
  ];

  const length = Math.min(sourceElements.length, cloneElements.length);

  for (let i = 0; i < length; i++) {
    const sourceEl = sourceElements[i];
    const cloneEl = cloneElements[i];

    const computed = window.getComputedStyle(sourceEl);
    for (let j = 0; j < computed.length; j++) {
      const prop = computed.item(j);
      if (!prop || !INLINE_PROPS.has(prop)) continue;
      cloneEl.style.setProperty(
        prop,
        computed.getPropertyValue(prop),
        computed.getPropertyPriority(prop),
      );
    }
  }
};

const createOffscreenA4Clone = (element: HTMLElement) => {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${A4_WIDTH_PX}px;
    height: ${A4_HEIGHT_PX}px;
    background: #ffffff;
    overflow: hidden;
    z-index: -9999;
    contain: strict;
  `;

  const cloneRoot = element.cloneNode(true) as HTMLElement;
  container.appendChild(cloneRoot);
  document.body.appendChild(container);

  // Aggressive: inline computed styles to avoid font/letter-spacing drift
  // from transforms, responsive scaling, or missing stylesheet rules inside exports.
  inlineAllComputedStyles(element, cloneRoot);

  // Enforce true A4 surface and prevent transform-based scaling from corrupting text.
  cloneRoot.style.width = `${A4_WIDTH_PX}px`;
  cloneRoot.style.height = `${A4_HEIGHT_PX}px`;
  cloneRoot.style.maxWidth = "none";
  cloneRoot.style.minHeight = "0";
  cloneRoot.style.margin = "0";
  cloneRoot.style.transform = "none";
  (cloneRoot.style as unknown as { zoom?: string }).zoom = "1";
  cloneRoot.style.aspectRatio = "unset";
  cloneRoot.style.background = "#ffffff";

  return {
    container,
    cloneRoot,
    cleanup: () => {
      if (container.parentNode) container.parentNode.removeChild(container);
    },
  };
};

const generateA4CanvasFromElement = async (element: HTMLElement) => {
  await waitForFontsToLoad(document);

  const { cloneRoot, cleanup } = createOffscreenA4Clone(element);
  try {
    await waitForFontsToLoad(document);
    await waitForImagesToLoad(cloneRoot);

    const restoreImages = await replaceImagesWithDataUrls(cloneRoot);
    const canvas = await html2canvas(cloneRoot, {
      scale: EXPORT_SCALE,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      windowWidth: A4_WIDTH_PX,
      windowHeight: A4_HEIGHT_PX,
    });
    restoreImages();

    return canvas;
  } finally {
    cleanup();
  }
};

export const exportElementToPdfA4 = async (element: HTMLElement, filename: string) => {
  const safeFilename = ensureFileExtension(filename, "pdf");
  const canvas = await generateA4CanvasFromElement(element);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgData = canvas.toDataURL("image/png", 1.0);
  pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
  pdf.save(safeFilename);
};

export const exportElementToJpgA4 = async (element: HTMLElement, filename: string) => {
  const safeFilename = ensureFileExtension(filename, "jpg");
  const canvas = await generateA4CanvasFromElement(element);

  const link = document.createElement("a");
  link.download = safeFilename;
  link.href = canvas.toDataURL("image/jpeg", 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printElementA4 = async (element: HTMLElement, title: string = "Print Document") => {
  await waitForFontsToLoad(document);

  const { cloneRoot, cleanup } = createOffscreenA4Clone(element);
  try {
    await waitForFontsToLoad(document);
    await waitForImagesToLoad(cloneRoot);
    await replaceImagesWithDataUrls(cloneRoot);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Failed to open print window. Please allow popups for this site.");
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { size: A4; margin: 0; }
            html, body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }
          </style>
        </head>
        <body style="margin:0;padding:0;">
          ${cloneRoot.outerHTML}
          <script>
            function allImagesLoaded(doc) {
              const imgs = doc.images;
              if (!imgs || imgs.length === 0) return Promise.resolve();
              return Promise.all(Array.from(imgs).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(res => { img.onload = img.onerror = res; });
              }));
            }
            function waitForFonts(doc) {
              try {
                if (doc.fonts && doc.fonts.ready) return doc.fonts.ready;
              } catch (e) {}
              return Promise.resolve();
            }
            window.onload = function() {
              Promise.all([waitForFonts(document), allImagesLoaded(document)]).then(function() {
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
  } finally {
    cleanup();
  }
};

// Backward-compatible API (kept to avoid touching existing call-sites)
const getPreviewElement = () => {
  const previewElement = document.querySelector(".a4-document") as HTMLElement;
  if (!previewElement) {
    throw new Error("Preview element not found");
  }
  return previewElement;
};

export const downloadPDF = async (filename: string = "document.pdf") => {
  const previewElement = getPreviewElement();
  await exportElementToPdfA4(previewElement, filename);
};

export const downloadJPG = async (filename: string = "document.jpg") => {
  const previewElement = getPreviewElement();
  await exportElementToJpgA4(previewElement, filename);
};

export const printDocument = async () => {
  const previewElement = getPreviewElement();
  await printElementA4(previewElement, "Print Document");
};
