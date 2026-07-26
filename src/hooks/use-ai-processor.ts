import { useState, useRef } from "react";
import { ActiveSettings } from "./use-settings";
import { detectFileType } from "@/lib/ai/file-detector";
import { TextParser, CSVParser, ExcelParser, DocxParser, PdfParser, ImageParser } from "@/lib/ai/parsers";
import { generateChunks } from "@/lib/ai/chunk-generator";
import { LLMClient } from "@/lib/ai/llm-client";
import { JSONValidator } from "@/lib/ai/json-validator";
import { JSONMerger } from "@/lib/ai/json-merger";
import { DATA_EXTRACTION_PROMPT, JSON_REPAIR_PROMPT } from "@/lib/ai/prompt";
import { ChartData } from "@/lib/schema";

export type AIProcessStage = "idle" | "extracting" | "chunking" | "calling_llm" | "validating" | "merging" | "completed" | "error";

export function useAIProcessor() {
  const [stage, setStage] = useState<AIProcessStage>("idle");
  const [progress, setProgress] = useState({ currentChunk: 0, totalChunks: 0 });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ChartData | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const processFile = async (file: File, settings: ActiveSettings) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    try {
      setStage("extracting");
      setError(null);
      setResult(null);
      setProgress({ currentChunk: 0, totalChunks: 0 });

      if (!settings.endpoint) {
        throw new Error("No LLM API endpoint configured. Check Settings.");
      }
      
      if (signal.aborted) throw new Error("AbortError");

      const fileType = detectFileType(file);
      
      let parser = TextParser;
      if (fileType === "csv") parser = CSVParser;
      if (fileType === "xlsx") parser = ExcelParser;
      if (fileType === "docx") parser = DocxParser;
      if (fileType === "pdf") parser = PdfParser;
      if (fileType === "image") parser = ImageParser;

      if (!parser.accepts(file)) {
         throw new Error("Unsupported file type.");
      }

      const parsedDoc = await parser.parse(file, { enableOcr: settings.enableOcr });

      if (signal.aborted) throw new Error("AbortError");

      setStage("chunking");
      const chunks = generateChunks(parsedDoc.text, settings.chunkSize, 100);
      setProgress({ currentChunk: 0, totalChunks: chunks.length });

      if (chunks.length === 0) {
        throw new Error("No readable text found in file.");
      }

      let finalData: ChartData | null = null;

      for (let i = 0; i < chunks.length; i++) {
        if (signal.aborted) throw new Error("AbortError");
        
        setStage("calling_llm");
        setProgress(p => ({ ...p, currentChunk: i + 1 }));
        
        let rawResponse = "";
        let attempt = 0;
        let validJson: any = null;
        
        while (attempt < 2 && !validJson) {
           if (signal.aborted) throw new Error("AbortError");
           
           try {
              const prompt = attempt === 0 
                ? (settings.systemPrompt || DATA_EXTRACTION_PROMPT) 
                : `${JSON_REPAIR_PROMPT}\n\nMALFORMED JSON:\n${rawResponse}`;
              
              rawResponse = await LLMClient.processChunk(chunks[i], settings, prompt, signal);
              
              setStage("validating");
              const parsed = JSONValidator.parseRaw(rawResponse);
              validJson = JSONValidator.validateChartData(parsed);
           } catch (e: any) {
              if (e.name === "AbortError" || e.message === "AbortError") throw e;
              attempt++;
              if (attempt >= 2) throw new Error("Failed to generate valid JSON from chunk: " + e.message);
           }
        }

        setStage("merging");
        finalData = JSONMerger.merge(finalData, validJson);
      }

      if (signal.aborted) throw new Error("AbortError");

      setStage("completed");
      setResult(finalData);
      
      try {
        const history = JSON.parse(localStorage.getItem("chartflow_history") || "[]");
        history.unshift({
          id: Date.now().toString(),
          filename: file.name,
          date: new Date().toISOString(),
          status: "success",
          provider: settings.provider,
          model: settings.model,
          chunks: chunks.length
        });
        localStorage.setItem("chartflow_history", JSON.stringify(history.slice(0, 100)));
      } catch (err) {}

      return finalData;

    } catch (e: any) {
      if (e.name === "AbortError" || e.message === "AbortError") {
        setStage("idle");
        return;
      }
      setStage("error");
      setError(e.message || "An unknown error occurred.");
      
      try {
        const history = JSON.parse(localStorage.getItem("chartflow_history") || "[]");
        history.unshift({
          id: Date.now().toString(),
          filename: file.name,
          date: new Date().toISOString(),
          status: "error",
          provider: settings.provider,
          model: settings.model,
          errorMessage: e.message
        });
        localStorage.setItem("chartflow_history", JSON.stringify(history.slice(0, 100)));
      } catch (err) {}

      throw e;
    }
  };

  const cancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    reset();
  };

  const reset = () => {
    setStage("idle");
    setError(null);
    setResult(null);
    setProgress({ currentChunk: 0, totalChunks: 0 });
  };

  return { processFile, cancel, reset, stage, progress, error, result };
}
