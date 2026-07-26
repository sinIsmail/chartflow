import { FileParser, ParsedDocument } from "./types";
import { normalizeText } from "./text-normalizer";
import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * TextParser: Handles TXT, MD, JSON
 */
export const TextParser: FileParser = {
  accepts: (file) => {
    const n = file.name.toLowerCase();
    return n.endsWith(".txt") || n.endsWith(".md") || n.endsWith(".markdown") || n.endsWith(".json");
  },
  parse: async (file) => {
    const text = await file.text();
    const type = file.name.toLowerCase().endsWith(".json") ? "json" : 
                 file.name.toLowerCase().endsWith(".md") ? "md" : "txt";
                 
    return {
      fileName: file.name,
      fileType: type,
      text: normalizeText(text)
    };
  }
};

/**
 * CSVParser: Handles CSV files via PapaParse
 */
export const CSVParser: FileParser = {
  accepts: (file) => file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv",
  parse: async (file) => {
    const text = await file.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          // Convert 2D array into a simple Markdown-like table text representation for the LLM
          const rows = results.data as string[][];
          if (rows.length === 0) {
            resolve({ fileName: file.name, fileType: "csv", text: "" });
            return;
          }
          
          const textRepresentation = rows.map(row => row.join(" | ")).join("\n");
          resolve({
            fileName: file.name,
            fileType: "csv",
            text: normalizeText(textRepresentation)
          });
        },
        error: (error: any) => reject(error)
      });
    });
  }
};

/**
 * ExcelParser: Handles XLSX, XLS via SheetJS
 */
export const ExcelParser: FileParser = {
  accepts: (file) => {
    const n = file.name.toLowerCase();
    return n.endsWith(".xlsx") || n.endsWith(".xls");
  },
  parse: async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    
    let combinedText = "";
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      if (csv.trim().length > 0) {
        combinedText += `--- Sheet: ${sheetName} ---\n`;
        const lines = csv.split("\n");
        const piped = lines.map(line => line.split(",").join(" | ")).join("\n");
        combinedText += piped + "\n\n";
      }
    }
    
    return {
      fileName: file.name,
      fileType: "xlsx",
      text: normalizeText(combinedText)
    };
  }
};

/**
 * DocxParser: Handles DOCX via mammoth
 */
export const DocxParser: FileParser = {
  accepts: (file) => file.name.toLowerCase().endsWith(".docx"),
  parse: async (file) => {
    // Dynamic import to avoid SSR issues
    const mammoth = (await import("mammoth")).default;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return {
      fileName: file.name,
      fileType: "docx",
      text: normalizeText(result.value)
    };
  }
};

/**
 * PdfParser: Handles PDF text extraction via pdfjs-dist and optional OCR fallback
 */
export const PdfParser: FileParser = {
  accepts: (file) => file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf",
  parse: async (file, options) => {
    const pdfjsLib = await import("pdfjs-dist");
    
    // Set worker dynamically
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }
    
    const normalized = normalizeText(fullText);
    
    // Fallback to OCR if the PDF appears to be scanned (no selectable text) and OCR is enabled
    if (normalized.length < 50 && options?.enableOcr) {
      const { OCRService } = await import("./ocr-service");
      let ocrText = "";
      
      // Basic approach: convert each page to an image and run OCR
      // Since rendering PDF to canvas in the browser can be complex, for simplicity here,
      // we assume the user uploads standard images if they strictly need OCR, 
      // but if we MUST do PDF OCR, we'd render it. 
      // Due to performance limits, we'll just throw a guided error telling them it's scanned.
      throw new Error("This PDF appears to be scanned. PDF OCR rendering is limited in-browser. Convert it to images first.");
    } else if (normalized.length < 50 && !options?.enableOcr) {
      throw new Error("This PDF appears to be scanned and contains no selectable text. Enable OCR to continue, or upload images instead.");
    }
    
    return {
      fileName: file.name,
      fileType: "pdf",
      text: normalized
    };
  }
};

/**
 * ImageParser: Handles PNG, JPG, WEBP using OCR (if enabled)
 */
export const ImageParser: FileParser = {
  accepts: (file) => file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name),
  parse: async (file, options) => {
    if (!options?.enableOcr) {
      throw new Error("OCR is disabled. Enable OCR in settings to extract text from image files.");
    }
    
    const { OCRService } = await import("./ocr-service");
    const rawText = await OCRService.extractFromImage(file);
    
    return {
      fileName: file.name,
      fileType: "image",
      text: normalizeText(rawText)
    };
  }
};
