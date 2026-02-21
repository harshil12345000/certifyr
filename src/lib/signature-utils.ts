/**
 * Utility functions for processing signature images.
 * - Convert to black & white (grayscale)
 * - Remove white background (for JPG uploads)
 */

/**
 * Loads an image file into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Process a signature image:
 * 1. Convert to black & white (grayscale)
 * 2. Remove white/light background (make transparent)
 * Returns a PNG Blob.
 */
export async function processSignatureImage(file: File): Promise<Blob> {
  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert to grayscale
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    // Remove light background: if pixel is very light, make transparent
    // Threshold: brightness > 220 → transparent
    if (gray > 220) {
      data[i + 3] = 0; // fully transparent
    } else {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob from canvas"));
      },
      "image/png",
      1
    );
  });
}
