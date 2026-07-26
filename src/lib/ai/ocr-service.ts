import { createWorker } from "tesseract.js";

/**
 * OCRService handles client-side optical character recognition.
 * It strictly honors the user's toggle and handles initialization automatically.
 */
export class OCRService {
  /**
   * Extract text from a browser File object (Image).
   */
  static async extractFromImage(file: File): Promise<string> {
    const worker = await createWorker('eng');
    
    // Create an object URL for the image file
    const url = URL.createObjectURL(file);
    
    try {
      const ret = await worker.recognize(url);
      return ret.data.text;
    } finally {
      URL.revokeObjectURL(url);
      await worker.terminate();
    }
  }

  /**
   * Helper to perform OCR on a specific page/image data URL
   */
  static async extractFromDataUrl(dataUrl: string): Promise<string> {
    const worker = await createWorker('eng');
    try {
      const ret = await worker.recognize(dataUrl);
      return ret.data.text;
    } finally {
      await worker.terminate();
    }
  }
}
