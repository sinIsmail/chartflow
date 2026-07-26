import { ActiveSettings } from "@/hooks/use-settings";

/**
 * Handles communication with the user's selected LLM provider via OpenAI-compatible endpoints.
 * Includes automatic retry logic and exponential backoff for network resilience.
 */
export class LLMClient {
  /**
   * Processes a single text chunk and returns the raw response string from the LLM.
   */
  static async processChunk(chunkText: string, settings: ActiveSettings, systemPrompt: string, signal?: AbortSignal): Promise<string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Add auth header if API key exists (local endpoints like Ollama often don't need one)
    if (settings.apiKey && settings.apiKey.trim() !== "") {
      headers["Authorization"] = `Bearer ${settings.apiKey}`;
    }

    const payload = {
      model: settings.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: chunkText }
      ],
      temperature: 0.1, // low temperature for precise JSON generation
      // Optionally could add response_format: { type: "json_object" } but not all APIs support it
    };

    let attempts = 0;
    while (attempts < 3) {
      if (signal?.aborted) throw new Error("AbortError");
      
      try {
        const response = await fetch(settings.endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal
        });

        if (!response.ok) {
          throw new Error(`LLM API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Standard OpenAI-compatible response parser
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content;
        } else if (data.message && data.message.content) { 
          // Raw Ollama fallback
          return data.message.content;
        } else {
          throw new Error("Unexpected LLM response format.");
        }
      } catch (err: any) {
        if (err.name === "AbortError" || err.message === "AbortError") {
          throw err;
        }
        attempts++;
        if (attempts >= 3) {
          throw err;
        }
        // Exponential backoff
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempts)));
      }
    }
    
    throw new Error("Failed to process chunk after multiple attempts.");
  }
}
