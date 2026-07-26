/**
 * Normalizes raw extracted text from any source file.
 * Preserves structural newlines (paragraphs, lists) but removes excess whitespace.
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  
  // 1. Replace Windows CRLF and Mac CR with standard LF
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 2. Collapse 3 or more consecutive newlines into exactly 2 (paragraph break)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  
  // 3. Remove trailing spaces on each line
  normalized = normalized.replace(/[ \t]+$/gm, '');

  return normalized.trim();
}
