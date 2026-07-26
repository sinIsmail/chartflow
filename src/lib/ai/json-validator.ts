import { ChartData } from "@/lib/schema";

/**
 * Validates and sanitizes LLM JSON outputs.
 * Helps recover from common LLM hallucinations like markdown wrappers.
 */
export class JSONValidator {
  /**
   * Attempts to parse raw LLM output into a JSON object.
   * Cleans up markdown code blocks if the LLM hallucinated them.
   */
  static parseRaw(raw: string): any {
    let clean = raw.trim();
    
    // Remove markdown code blocks if present
    if (clean.startsWith("\`\`\`")) {
      const lines = clean.split("\n");
      // Remove first line (e.g. \`\`\`json)
      lines.shift();
      // Remove last line if it's \`\`\`
      if (lines.length > 0 && lines[lines.length - 1].trim() === "\`\`\`") {
        lines.pop();
      }
      clean = lines.join("\n").trim();
    }
    
    // Attempt standard parse
    return JSON.parse(clean);
  }

  /**
   * Validates if the parsed object conforms to the basic ChartData schema.
   * Throws an error if invalid, which signals the pipeline to repair it.
   */
  static validateChartData(data: any): ChartData {
    if (!data || typeof data !== "object") {
      throw new Error("Result is not a valid JSON object.");
    }
    
    if (!Array.isArray(data.data)) {
      data.data = []; // graceful fallback
    }
    
    if (!Array.isArray(data.series)) {
      data.series = []; // graceful fallback
    }
    
    return data as ChartData;
  }
}
