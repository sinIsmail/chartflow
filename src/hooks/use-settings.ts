"use client";

import { useState, useEffect } from "react";

export type LLMProvider = "openai" | "openrouter" | "groq" | "ollama" | "lmstudio" | "custom";

export interface AIProfile {
  id: string;
  name: string;
  provider: LLMProvider;
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface AppSettings {
  profiles: AIProfile[];
  activeProfileId: string;
  enableOcr: boolean;
  chunkSize: number;
  systemPrompt?: string;
}

export interface ActiveSettings extends AIProfile {
  enableOcr: boolean;
  chunkSize: number;
  systemPrompt?: string;
}

export const DEFAULT_PROFILE: AIProfile = {
  id: "default",
  name: "Default OpenAI",
  provider: "openai",
  endpoint: "https://api.openai.com/v1/chat/completions",
  apiKey: "",
  model: "gpt-4o-mini",
};

export const DEFAULT_SETTINGS: AppSettings = {
  profiles: [DEFAULT_PROFILE],
  activeProfileId: "default",
  enableOcr: false,
  chunkSize: 1000,
  systemPrompt: "",
};

export const PROVIDER_PRESETS: Record<LLMProvider, Partial<AIProfile>> = {
  openai: { endpoint: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini" },
  openrouter: { endpoint: "https://openrouter.ai/api/v1/chat/completions", model: "openai/gpt-4o-mini" },
  groq: { endpoint: "https://api.groq.com/openai/v1/chat/completions", model: "llama3-8b-8192" },
  ollama: { endpoint: "http://localhost:11434/v1/chat/completions", model: "llama3" },
  lmstudio: { endpoint: "http://localhost:1234/v1/chat/completions", model: "local-model" },
  custom: { endpoint: "", model: "" },
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("chartflow_ai_settings_v2");
      const sessionKeysStr = sessionStorage.getItem("chartflow_ai_keys");
      const sessionKeys = sessionKeysStr ? JSON.parse(sessionKeysStr) : {};

      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.profiles = parsed.profiles.map((p: AIProfile) => ({ ...p, apiKey: sessionKeys[p.id] || "" }));
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        // Migration from v1
        const oldStored = localStorage.getItem("chartflow_ai_settings");
        if (oldStored) {
          const parsed = JSON.parse(oldStored);
          const migratedProfile: AIProfile = {
            id: "migrated",
            name: "Migrated Connection",
            provider: parsed.provider || "openai",
            endpoint: parsed.endpoint || "https://api.openai.com/v1/chat/completions",
            apiKey: parsed.apiKey || "", // Will only exist for this session
            model: parsed.model || "gpt-4o-mini",
          };
          const next: AppSettings = {
            profiles: [migratedProfile],
            activeProfileId: "migrated",
            enableOcr: parsed.enableOcr || false,
            chunkSize: parsed.chunkSize || 1000,
            systemPrompt: parsed.systemPrompt || "",
          };
          setSettings(next);
          persistSettings(next);
        }
      }
    } catch (e) {
      console.warn("Failed to load settings", e);
    }
    setIsLoaded(true);
  }, []);

  const persistSettings = (next: AppSettings) => {
    const sessionKeys: Record<string, string> = {};
    const safeSettings = {
      ...next,
      profiles: next.profiles.map(p => {
        if (p.apiKey) sessionKeys[p.id] = p.apiKey;
        return { ...p, apiKey: "" }; // Scrub before writing to disk
      })
    };
    localStorage.setItem("chartflow_ai_settings_v2", JSON.stringify(safeSettings));
    sessionStorage.setItem("chartflow_ai_keys", JSON.stringify(sessionKeys));
  };

  const updateGlobalSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      persistSettings(next);
      return next;
    });
  };

  const addProfile = (profile: AIProfile) => {
    setSettings((prev) => {
      const next = { ...prev, profiles: [...prev.profiles, profile], activeProfileId: profile.id };
      persistSettings(next);
      return next;
    });
  };

  const updateProfile = (id: string, updates: Partial<AIProfile>) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        profiles: prev.profiles.map((p) => {
          if (p.id !== id) return p;
          const updated = { ...p, ...updates };
          if (updates.provider && updates.provider !== p.provider) {
            Object.assign(updated, PROVIDER_PRESETS[updates.provider as LLMProvider]);
          }
          return updated;
        }),
      };
      persistSettings(next);
      return next;
    });
  };

  const removeProfile = (id: string) => {
    setSettings((prev) => {
      if (prev.profiles.length <= 1) return prev; // Don't delete last profile
      const nextProfiles = prev.profiles.filter(p => p.id !== id);
      const next = {
        ...prev,
        profiles: nextProfiles,
        activeProfileId: prev.activeProfileId === id ? nextProfiles[0].id : prev.activeProfileId,
      };
      
      // Clear key from session storage
      try {
        const sessionKeysStr = sessionStorage.getItem("chartflow_ai_keys");
        if (sessionKeysStr) {
          const keys = JSON.parse(sessionKeysStr);
          delete keys[id];
          sessionStorage.setItem("chartflow_ai_keys", JSON.stringify(keys));
        }
      } catch (e) {}

      persistSettings(next);
      return next;
    });
  };

  // Derive the active configuration to maintain hook compatibility for readers
  const activeProfile = settings.profiles.find((p) => p.id === settings.activeProfileId) || settings.profiles[0];
  const activeSettings = {
    ...activeProfile,
    enableOcr: settings.enableOcr,
    chunkSize: settings.chunkSize,
    systemPrompt: settings.systemPrompt,
  };

  return { 
    settings: activeSettings, 
    allSettings: settings,
    updateGlobalSettings,
    addProfile,
    updateProfile,
    removeProfile,
    isLoaded 
  };
}
