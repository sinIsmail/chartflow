"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ProcessHistory {
  id: string;
  filename: string;
  date: string;
  status: "success" | "error";
  provider: string;
  model: string;
  chunks?: number;
  errorMessage?: string;
}

export function HistoryDialog() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ProcessHistory[]>([]);

  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem("chartflow_history");
        if (stored) setHistory(JSON.parse(stored));
      } catch (e) {
        setHistory([]);
      }
    }
  }, [open]);

  const clearHistory = () => {
    localStorage.removeItem("chartflow_history");
    setHistory([]);
    toast.success("History cleared");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-border bg-surface shadow-sm hover:bg-surface-2 hover:text-foreground transition-all" title="Processing History">
          <History className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Processing History</DialogTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive gap-1 mr-4" onClick={clearHistory}>
              <Trash2 className="size-3" />
              Clear
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 mt-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No processing history found.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex flex-col p-3 rounded-lg border border-border bg-surface-2 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {item.status === "success" ? (
                        <CheckCircle2 className="size-4 text-green-500" />
                      ) : (
                        <XCircle className="size-4 text-destructive" />
                      )}
                      <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]" title={item.filename}>
                        {item.filename}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <div><span className="font-semibold">Provider:</span> {item.provider}</div>
                    <div><span className="font-semibold">Model:</span> {item.model}</div>
                    {item.chunks && <div><span className="font-semibold">Chunks:</span> {item.chunks}</div>}
                  </div>
                  {item.errorMessage && (
                    <div className="mt-2 text-xs text-destructive bg-destructive p-2 rounded">
                      {item.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
