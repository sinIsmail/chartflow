"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  SCHEMA_TEMPLATE,
  AI_PROMPT_TEMPLATE,
  FIELD_DESCRIPTIONS,
} from "@/lib/prompt-template";
import { useSettings } from "@/hooks/use-settings";
import { ClipboardList, Check, Copy, Code2, Sparkles, Database } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PromptDialog() {
  const { allSettings, updateGlobalSettings } = useSettings();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-border/50 bg-surface shadow-sm hover:bg-surface-2 hover:text-foreground transition-all" title="System Prompt">
          <ClipboardList className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-border/40 shadow-2xl bg-surface h-[85vh] flex flex-col">
        <div className="p-6 pb-4 border-b border-border/30 bg-surface-2/30">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
                Prompt & Schema Guide
                <Badge variant="secondary" className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20 text-[10px] uppercase tracking-wider">Universal Schema</Badge>
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm mt-1.5">
              Customize the AI extraction instructions or review the expected JSON schema.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs defaultValue="ai" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4">
            <TabsList className="w-full grid grid-cols-3 bg-surface-2/50 border border-border/40">
              <TabsTrigger value="ai" className="data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                System Prompt
              </TabsTrigger>
              <TabsTrigger value="schema" className="data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Data Schema
              </TabsTrigger>
              <TabsTrigger value="example" className="data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                Example JSON
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              
              {/* System Prompt Editor tab */}
              <TabsContent value="ai" className="m-0 h-full flex flex-col space-y-4 animate-fade-in">
                <div className="flex justify-between items-center bg-accent/5 border border-accent/10 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground font-medium">
                    This prompt instructs the LLM on how to parse your unstructured text into ChartFlow's schema.
                  </p>
                  <Button
                    variant="outline" size="sm"
                    className="h-8 text-xs font-bold bg-surface border-border/50 hover:bg-surface-2"
                    onClick={() => updateGlobalSettings({ systemPrompt: "" })}
                  >
                    Reset to Default
                  </Button>
                </div>
                
                <textarea
                  className="flex-1 min-h-[350px] w-full rounded-xl border border-border/50 bg-surface/50 p-4 font-mono text-[13px] text-foreground shadow-inner focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors resize-none leading-relaxed custom-scrollbar"
                  placeholder={AI_PROMPT_TEMPLATE}
                  value={allSettings.systemPrompt || ""}
                  onChange={(e) => updateGlobalSettings({ systemPrompt: e.target.value })}
                />
              </TabsContent>

              {/* Schema fields tab */}
              <TabsContent value="schema" className="m-0 space-y-4 animate-fade-in">
                <div className="bg-surface-2/30 border border-border/40 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-surface-2/50 text-xs uppercase text-muted-foreground font-bold tracking-wider border-b border-border/40">
                      <tr>
                        <th className="px-4 py-3">Field</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-center">Required</th>
                        <th className="px-4 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {FIELD_DESCRIPTIONS.map((f) => (
                        <tr key={f.field} className="hover:bg-surface/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-[13px] text-accent font-semibold">{f.field}</td>
                          <td className="px-4 py-3 font-mono text-[13px] text-muted-foreground">{f.type}</td>
                          <td className="px-4 py-3 text-center">
                            {f.required ? (
                              <Badge variant="default" className="bg-accent/20 text-accent hover:bg-accent/30 border-none text-[10px]">YES</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-surface-2 text-muted-foreground hover:bg-surface-2 border-none text-[10px]">NO</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-[13px] leading-relaxed">{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Example JSON tab */}
              <TabsContent value="example" className="m-0 space-y-4 animate-fade-in">
                <div className="relative group">
                  <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      className={`h-8 gap-1.5 shadow-md ${copied === 'template' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-surface border-border hover:bg-surface-2 text-foreground'}`}
                      onClick={() => copy(SCHEMA_TEMPLATE, "template")}
                    >
                      {copied === "template" ? (
                        <><Check className="w-3.5 h-3.5" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy JSON</>
                      )}
                    </Button>
                  </div>
                  <pre className="p-5 rounded-xl bg-[#0d0d12] border border-border/40 overflow-x-auto custom-scrollbar">
                    <code className="text-[13px] font-mono leading-relaxed text-[#e2e8f0]">
                      {SCHEMA_TEMPLATE}
                    </code>
                  </pre>
                </div>
              </TabsContent>

            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
