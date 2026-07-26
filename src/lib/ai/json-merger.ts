import { ChartData, ChartSeries } from "@/lib/schema";

/**
 * Safely merges multiple JSON chunk responses into a single valid ChartData object.
 */
export class JSONMerger {
  /**
   * Merges a new chunk into the accumulator.
   */
  static merge(accumulator: ChartData | null, nextChunk: ChartData): ChartData {
    if (!accumulator) {
      // First chunk becomes the base
      return JSON.parse(JSON.stringify(nextChunk));
    }

    // Merge titles/descriptions (prefer the first one if it exists)
    const title = accumulator.title || nextChunk.title;
    const description = accumulator.description || nextChunk.description;
    const xKey = accumulator.xKey || nextChunk.xKey || "name";

    // Concatenate data rows
    const data = [...(accumulator.data || []), ...(nextChunk.data || [])];

    // Merge series intelligently (avoid duplicates based on key)
    const seriesMap = new Map<string, ChartSeries>();
    
    // Add existing series
    (accumulator.series || []).forEach(s => {
      if (s.key) seriesMap.set(s.key, s);
    });
    
    // Add new series from this chunk if they don't exist
    (nextChunk.series || []).forEach(s => {
      if (s.key && !seriesMap.has(s.key)) {
        seriesMap.set(s.key, s);
      }
    });

    return {
      title,
      description,
      xKey,
      data,
      series: Array.from(seriesMap.values())
    };
  }
}
