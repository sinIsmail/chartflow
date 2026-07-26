"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, FileText, Cpu, Braces, Layers } from "lucide-react";
import { useAIProcessor, AIProcessStage } from "@/hooks/use-ai-processor";
import { ActiveSettings } from "@/hooks/use-settings";
import { ChartData } from "@/lib/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIProgressDialogProps {
  file: File | null;
  settings: ActiveSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: ChartData) => void;
}

export function AIProgressDialog({ file, settings, open, onOpenChange, onSuccess }: AIProgressDialogProps) {
  const { processFile, cancel, reset, stage, progress, error, result } = useAIProcessor();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (open && file && stage === "idle") {
      processFile(file, settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, file, stage]);

  const handleClose = () => {
    cancel();
    setShowPreview(false);
    onOpenChange(false);
  };

  const getStepStatus = (stepStage: AIProcessStage[]) => {
    if (stage === "error") return "error";
    if (stage === "completed") return "complete";
    if (stepStage.includes(stage)) return "active";
    
    const stageOrder: AIProcessStage[] = ["idle", "extracting", "chunking", "calling_llm", "validating", "merging", "completed"];
    const currentIdx = stageOrder.indexOf(stage);
    const stepIdx = stageOrder.indexOf(stepStage[stepStage.length - 1]);
    
    return currentIdx > stepIdx ? "complete" : "pending";
  };

  const steps = [
    { id: 1, label: "Extracting Document", icon: FileText, stages: ["extracting"] as AIProcessStage[] },
    { id: 2, label: "Chunking Data", icon: Layers, stages: ["chunking"] as AIProcessStage[] },
    { id: 3, label: "Generating JSON via AI", icon: Cpu, stages: ["calling_llm"] as AIProcessStage[] },
    { id: 4, label: "Validating & Merging", icon: Braces, stages: ["validating", "merging"] as AIProcessStage[] },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => {
         // Prevent closing by clicking outside while processing to force intentional cancellation
         if (stage !== "completed" && stage !== "error") e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle>AI Data Pipeline</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {stage === "error" ? (
            <div className="flex flex-col items-center text-destructive gap-4 py-8">
              <XCircle className="w-12 h-12" />
              <p className="text-center font-medium">{error}</p>
              <Button variant="outline" onClick={handleClose}>Close</Button>
            </div>
          ) : stage === "completed" && result ? (
            <div className="flex flex-col items-center w-full gap-6 py-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full" />
                <CheckCircle2 className="w-16 h-16 text-green-500 relative z-10" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xl font-semibold">Processing Complete!</p>
                <p className="text-sm text-muted-foreground">Successfully extracted structured chart data.</p>
              </div>
              
              <div className="flex gap-4 w-full mt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowPreview(!showPreview)}>
                   {showPreview ? "Hide JSON" : "Preview JSON"}
                </Button>
                <Button 
                  className="flex-1 bg-accent text-white hover:bg-accent/90" 
                  onClick={() => {
                    onSuccess(result);
                    handleClose();
                  }}
                >
                  Send to Chart ✨
                </Button>
              </div>

              {showPreview && (
                <ScrollArea className="w-full h-[250px] bg-surface-2 border border-border rounded-lg p-5 text-xs font-mono mt-4 custom-scrollbar">
                  <div className="text-accent font-bold mb-2 uppercase tracking-widest text-[10px]">Extracted Data Shape</div>
                  <pre className="text-muted-foreground leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </ScrollArea>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {steps.map((step) => {
                  const status = getStepStatus(step.stages);
                  const Icon = step.icon;
                  const isActive = status === "active";
                  const isComplete = status === "complete";
                  
                  return (
                    <div key={step.id} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${isActive ? 'bg-secondary/50 border-accent/50' : 'border-transparent'}`}>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${isComplete ? 'bg-green-500/10 border-green-500/20 text-green-500' : isActive ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-secondary border-border text-muted-foreground'}`}>
                        {isComplete ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isActive ? 'text-foreground' : isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                        {isActive && step.id === 3 && progress.totalChunks > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Chunk {progress.currentChunk} of {progress.totalChunks}</span>
                              <span>{Math.round((progress.currentChunk / progress.totalChunks) * 100)}%</span>
                            </div>
                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-accent h-full transition-all duration-300 relative" 
                                style={{ width: `${(progress.currentChunk / progress.totalChunks) * 100}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end pt-2">
                <Button variant="destructive" onClick={handleClose} className="w-full sm:w-auto">
                  Cancel Processing
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
