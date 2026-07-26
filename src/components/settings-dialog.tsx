"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings as SettingsIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useSettings, LLMProvider, AIProfile } from "@/hooks/use-settings";
import { fetchAvailableModels } from "@/lib/ai/models-fetcher";
import { toast } from "sonner";

export function SettingsDialog() {
  const { settings, allSettings, updateGlobalSettings, addProfile, updateProfile, removeProfile, isLoaded } = useSettings();
  const [open, setOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [testError, setTestError] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isLoaded) return null;

  const getCustomModels = () => {
    try { return JSON.parse(localStorage.getItem('cf-custom-models') || '[]'); } 
    catch(e) { return []; }
  };
  
  const allModels = Array.from(new Set([...availableModels, ...getCustomModels()]));

  const handleTestConnection = async (profileToTest: AIProfile) => {
    setIsTesting(true);
    setAvailableModels([]);
    setTestError(null);
    try {
      const models = await fetchAvailableModels(profileToTest.endpoint, profileToTest.apiKey);
      setAvailableModels(models);
      
      if (models.length > 0 && !models.includes(profileToTest.model)) {
        updateProfile(profileToTest.id, { model: models[0] });
      }
      
      toast.success("Connection successful!", { description: `Found ${models.length} available models.` });
    } catch (err: any) {
      setTestError(err.message);
      toast.error("Connection failed", { description: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateNewProfile = () => {
    const newId = Date.now().toString();
    addProfile({
      id: newId,
      name: "New Connection",
      provider: "openai",
      endpoint: "https://api.openai.com/v1/chat/completions",
      apiKey: "",
      model: "gpt-4o-mini",
    });
    setIsAddingNew(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" aria-label="AI Settings">
          <SettingsIcon className="size-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>AI Processing Settings</DialogTitle>
          <DialogDescription>
            Manage your AI connections and models. API keys are stored securely in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          
          {/* Connection Profile Selector */}
          <div className="grid gap-2">
            <label className="text-sm font-heading font-bold text-foreground">
              Active Connection Profile
            </label>
            <div className="flex gap-2">
              <Select
                value={allSettings.activeProfileId}
                onValueChange={(val) => {
                  updateGlobalSettings({ activeProfileId: val });
                  setAvailableModels([]); // Reset models for new connection
                }}
              >
                <SelectTrigger className="flex-1 font-medium">
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                  {allSettings.profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCreateNewProfile}
                title="Create New Profile"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Connection Configuration */}
          <div className="bg-surface-2 border border-border rounded-lg p-4 space-y-3 relative group">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Connection Details
              </h3>
              <div className="flex gap-2">
                {allSettings.profiles.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => removeProfile(settings.id)}
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-3 pt-2 animate-fade-in">
                <div className="grid gap-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => updateProfile(settings.id, { name: e.target.value })}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    LLM Provider
                  </label>
                  <Select
                    value={settings.provider}
                    onValueChange={(val: LLMProvider) => updateProfile(settings.id, { provider: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                      <SelectItem value="groq">Groq</SelectItem>
                      <SelectItem value="ollama">Ollama (Local)</SelectItem>
                      <SelectItem value="lmstudio">LM Studio (Local)</SelectItem>
                      <SelectItem value="custom">Custom Endpoint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    API Endpoint
                  </label>
                  <input
                    type="text"
                    value={settings.endpoint}
                    onChange={(e) => updateProfile(settings.id, { endpoint: e.target.value })}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  />
                </div>
                
                <div className="grid gap-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => updateProfile(settings.id, { apiKey: e.target.value })}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                    placeholder="sk-..."
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Target Model
                  </label>
                  <input
                    type="text"
                    list={`models-${settings.id}`}
                    value={settings.model}
                    onChange={(e) => updateProfile(settings.id, { model: e.target.value })}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                    placeholder="e.g. gpt-4o-mini"
                  />
                  <datalist id={`models-${settings.id}`}>
                    {allModels.map(m => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>

                <Button 
                  className="w-full h-8 text-xs mt-2 bg-accent text-white hover:bg-accent/90 rounded-md"
                  onClick={() => handleTestConnection(settings)}
                  disabled={isTesting || !settings.endpoint}
                >
                  {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Test Connection"}
                </Button>
                {testError && (
                  <p className="text-[10px] text-destructive text-center">{testError}</p>
                )}
              </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
