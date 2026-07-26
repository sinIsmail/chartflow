/**
 * Splits a normalized text document into manageable chunks for LLM processing.
 * Utilizes a sliding window approach with a configurable overlap to preserve context.
 */
export function generateChunks(text: string, chunkSize: number = 1000, overlap: number = 100): string[] {
  if (!text) return [];
  
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  // If the text is smaller than the chunk size, return it as a single chunk
  if (words.length <= chunkSize) {
    return [text];
  }

  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push(chunkWords.join(" "));
    
    // Advance the index by chunkSize minus overlap
    // Ensure we always advance by at least 1 to prevent infinite loops
    i += Math.max(1, chunkSize - overlap);
  }
  
  return chunks;
}
