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
import { Settings as SettingsIcon, Loader2, Plus, Trash2, CheckCircle2, Server, Key, Bot } from "lucide-react";
import { useSettings, LLMProvider, AIProfile } from "@/hooks/use-settings";
import { fetchAvailableModels } from "@/lib/ai/models-fetcher";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export function SettingsDialog() {
  const { settings, allSettings, updateGlobalSettings, addProfile, updateProfile, removeProfile, isLoaded } = useSettings();
  const [open, setOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [testError, setTestError] = useState<string | null>(null);

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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-border/50 bg-surface shadow-sm hover:bg-surface-2 hover:text-foreground transition-all" title="Settings">
          <SettingsIcon className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-border/40 shadow-2xl bg-surface">
        <div className="p-6 pb-4 border-b border-border/30 bg-surface-2/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold">AI Configuration</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1.5">
              Connect to your favorite LLM provider. Keys are securely stored in your local browser session.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Profile Selector row */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Active Profile
              </label>
              <Select
                value={allSettings.activeProfileId}
                onValueChange={(val) => {
                  updateGlobalSettings({ activeProfileId: val });
                  setAvailableModels([]);
                }}
              >
                <SelectTrigger className="w-full h-10 bg-surface border-border/50 shadow-sm focus:ring-accent/50">
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                  {allSettings.profiles.map(p => (
                    <SelectItem key={p.id} value={p.id} className="font-medium cursor-pointer">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              className="h-10 w-10 p-0 border-border/50 shadow-sm hover:bg-surface-2 hover:text-foreground text-muted-foreground transition-all"
              onClick={handleCreateNewProfile}
              title="Add New Profile"
            >
              <Plus className="w-5 h-5" />
            </Button>
            
            {allSettings.profiles.length > 1 && (
              <Button
                variant="outline"
                className="h-10 w-10 p-0 border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                onClick={() => removeProfile(settings.id)}
                title="Delete Profile"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Separator className="bg-border/30" />

          {/* Form Fields */}
          <div className="space-y-5 animate-fade-in">
            {/* Row 1: Profile Name & Provider */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/80" />
                  Profile Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => updateProfile(settings.id, { name: e.target.value })}
                  className="w-full h-10 rounded-md border border-border/50 bg-surface/50 px-3 text-sm shadow-sm transition-colors focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-muted-foreground" />
                  Provider
                </label>
                <Select
                  value={settings.provider}
                  onValueChange={(val: LLMProvider) => updateProfile(settings.id, { provider: val })}
                >
                  <SelectTrigger className="h-10 border-border/50 bg-surface/50 shadow-sm focus:ring-accent/50">
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
            </div>

            {/* Row 2: API Endpoint */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-muted-foreground" />
                API Endpoint URL
              </label>
              <input
                type="text"
                value={settings.endpoint}
                onChange={(e) => updateProfile(settings.id, { endpoint: e.target.value })}
                className="w-full h-10 rounded-md border border-border/50 bg-surface/50 px-3 text-sm shadow-sm transition-colors focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 font-mono text-[13px]"
              />
            </div>
            
            {/* Row 3: API Key & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-muted-foreground" />
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => updateProfile(settings.id, { apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full h-10 rounded-md border border-border/50 bg-surface/50 px-3 text-sm shadow-sm transition-colors focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 font-mono text-[13px] placeholder:text-muted-foreground/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                  Model ID
                </label>
                <input
                  type="text"
                  list={`models-${settings.id}`}
                  value={settings.model}
                  onChange={(e) => updateProfile(settings.id, { model: e.target.value })}
                  className="w-full h-10 rounded-md border border-border/50 bg-surface/50 px-3 text-sm shadow-sm transition-colors focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 font-mono text-[13px] placeholder:text-muted-foreground/40"
                  placeholder="e.g. gpt-4o"
                />
                <datalist id={`models-${settings.id}`}>
                  {allModels.map(m => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border/30 bg-surface-2/30 flex flex-col items-center">
          <Button 
            className="w-full h-11 text-sm font-bold bg-accent text-white hover:bg-accent/90 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            onClick={() => handleTestConnection(settings)}
            disabled={isTesting || !settings.endpoint}
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Test Connection & Save
              </>
            )}
          </Button>
          {testError && (
            <p className="text-xs text-destructive mt-3 bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20 w-full text-center">
              {testError}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
