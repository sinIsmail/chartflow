"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  SCHEMA_TEMPLATE,
  AI_PROMPT_TEMPLATE,
  FIELD_DESCRIPTIONS,
} from "@/lib/prompt-template";

export function PromptDialog() {
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
        <Button variant="outline" size="sm" id="prompt-btn" aria-label="Open JSON format prompt">
          📋 Prompt
        </Button>
      </DialogTrigger>

      <DialogContent
        style={{ maxWidth: 680, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <DialogHeader>
          <DialogTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
            JSON Format Guide
            <Badge variant="secondary" style={{ fontSize: 10 }}>Universal Schema</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="schema" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <TabsList style={{ marginBottom: 12 }}>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="example">Example JSON</TabsTrigger>
            <TabsTrigger value="ai">AI Prompt</TabsTrigger>
          </TabsList>

          {/* Schema fields tab */}
          <TabsContent value="schema" style={{ flex: 1, overflowY: "auto" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
              All chart types use the same JSON format. Here are all the fields:
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Field", "Type", "Required", "Description"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELD_DESCRIPTIONS.map((f) => (
                  <tr key={f.field} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px", fontFamily: "monospace", color: "var(--accent)", fontSize: 12 }}>{f.field}</td>
                    <td style={{ padding: "8px", fontFamily: "monospace", color: "var(--text-muted)", fontSize: 12 }}>{f.type}</td>
                    <td style={{ padding: "8px" }}>
                      <Badge variant={f.required ? "default" : "secondary"} style={{ fontSize: 10 }}>
                        {f.required ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td style={{ padding: "8px", color: "var(--text)", fontSize: 12 }}>{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>

          {/* Example JSON tab */}
          <TabsContent value="example" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
              Copy this template, fill in your data, and upload:
            </p>
            <div style={{ position: "relative" }}>
              <pre style={{
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 8, padding: 16, fontSize: 12, overflowX: "auto",
                color: "var(--text)", margin: 0, lineHeight: 1.6,
              }}>
                {SCHEMA_TEMPLATE}
              </pre>
              <Button
                size="sm" variant="outline"
                onClick={() => copy(SCHEMA_TEMPLATE, "template")}
                style={{ position: "absolute", top: 8, right: 8, fontSize: 11 }}
                aria-label="Copy JSON template"
              >
                {copied === "template" ? "✅ Copied!" : "Copy"}
              </Button>
            </div>
          </TabsContent>

          {/* AI Prompt tab */}
          <TabsContent value="ai" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
              Copy this prompt into ChatGPT, Claude, or Gemini with your data attached:
            </p>
            <div style={{ position: "relative" }}>
              <pre style={{
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 8, padding: 16, fontSize: 12, overflowX: "auto",
                color: "var(--text)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>
                {AI_PROMPT_TEMPLATE}
              </pre>
              <Button
                size="sm" variant="outline"
                onClick={() => copy(AI_PROMPT_TEMPLATE, "ai")}
                style={{ position: "absolute", top: 8, right: 8, fontSize: 11 }}
                aria-label="Copy AI prompt"
              >
                {copied === "ai" ? "✅ Copied!" : "Copy"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
