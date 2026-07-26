/**
 * Utility to fetch available models from an OpenAI-compatible API endpoint.
 */
export async function fetchAvailableModels(endpoint: string, apiKey?: string): Promise<string[]> {
  if (!endpoint) {
    throw new Error("Endpoint is empty");
  }

  // Derive the models endpoint from the chat completions endpoint.
  // Standard: https://api.openai.com/v1/chat/completions -> https://api.openai.com/v1/models
  // Ollama standard: http://localhost:11434/v1/chat/completions -> http://localhost:11434/v1/models
  // Ollama native: http://localhost:11434/api/generate -> http://localhost:11434/api/tags
  
  let modelsEndpoint = endpoint;
  
  if (endpoint.endsWith("/chat/completions")) {
    modelsEndpoint = endpoint.replace("/chat/completions", "/models");
  } else if (endpoint.endsWith("/completions")) {
    modelsEndpoint = endpoint.replace("/completions", "/models");
  } else if (endpoint.includes("/api/")) { // Ollama native fallback
    const baseUrl = endpoint.split("/api/")[0];
    modelsEndpoint = `${baseUrl}/api/tags`;
  } else if (!endpoint.endsWith("/models")) {
    // Attempt appending /models if it's just a base URL
    modelsEndpoint = endpoint.endsWith("/") ? `${endpoint}models` : `${endpoint}/models`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey && apiKey.trim() !== "") {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(modelsEndpoint, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Standard OpenAI response format { data: [{ id: "model-name" }] }
    if (data && data.data && Array.isArray(data.data)) {
      return data.data.map((m: any) => m.id).filter(Boolean);
    }
    
    // Ollama native response format { models: [{ name: "model-name" }] }
    if (data && data.models && Array.isArray(data.models)) {
      return data.models.map((m: any) => m.name).filter(Boolean);
    }

    throw new Error("Unrecognized models response format from the API.");
  } catch (error: any) {
    console.error("Failed to fetch models:", error);
    throw new Error(error.message || "Failed to fetch models");
  }
}
