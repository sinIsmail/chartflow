import { FileType } from "./types";

/**
 * Robustly detects the logical file type of an uploaded file.
 * We rely on both extension and MIME type to cover cases where OS sets generic MIMEs.
 */
export function detectFileType(file: File): FileType {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv") || type === "text/csv") return "csv";
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || type.includes("spreadsheetml") || type.includes("excel")) return "xlsx";
  if (name.endsWith(".json") || type === "application/json") return "json";
  if (name.endsWith(".pdf") || type === "application/pdf") return "pdf";
  if (name.endsWith(".docx") || type.includes("wordprocessingml")) return "docx";
  if (name.endsWith(".md") || name.endsWith(".markdown") || type === "text/markdown") return "md";
  if (name.endsWith(".txt") || type.startsWith("text/plain")) return "txt";
  
  if (type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(name)) {
    return "image";
  }

  return "unknown";
}
