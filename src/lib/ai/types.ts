export type FileType = "txt" | "md" | "csv" | "xlsx" | "json" | "pdf" | "docx" | "image" | "unknown";

export interface ParsedDocument {
  text: string;     // The unified, normalized text representation of the file
  fileName: string;
  fileType: FileType;
  metadata?: Record<string, any>;
}

export interface FileParser {
  /**
   * Returns true if this parser can handle the given file
   */
  accepts: (file: File) => boolean;
  
  /**
   * Parses the file into a unified text document
   */
  parse: (file: File, options?: any) => Promise<ParsedDocument>;
}
