import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "PulseWASM System Care Engine", timestamp: Date.now() });
});

// Endpoint 1: AI Smart System Diagnostic & Root-Cause Analysis
app.post("/api/ai/diagnose", async (req, res) => {
  try {
    const { telemetry, scanResults, osType } = req.body;
    const ai = getAI();

    const prompt = `You are the core AI Engine for "PulseWASM System Care", an advanced browser-based PC Diagnostic & Automated Repair suite.
Analyze the following system telemetry and diagnostic scan results for a ${osType || "Windows 11 / x64"} machine:

Telemetry:
${JSON.stringify(telemetry, null, 2)}

Scan Results (Anomalies, Junk, Registry/System Integrity, Performance Bottlenecks):
${JSON.stringify(scanResults, null, 2)}

Provide an expert, professional PC diagnostic report and automated repair prescription. Focus on system stability, latency reduction, memory fragmentation, and kernel/driver health.
Return a valid JSON matching this schema:
{
  "stabilityScore": number (0 to 100),
  "healthGrade": string ("A+", "A", "B", "C", "D", or "F"),
  "summary": string (2-3 sentence executive diagnosis of machine health),
  "criticalFindings": [
    {
      "category": string ("Registry & OS Integrity" | "Memory & Kernel" | "Storage & I/O" | "Security Shield" | "Background Bloat"),
      "title": string,
      "severity": string ("CRITICAL" | "HIGH" | "MEDIUM" | "LOW"),
      "rootCause": string,
      "autoRepairAction": string (What our WASM engine / repair script will do to fix it)
    }
  ],
  "recommendedScript": {
    "scriptType": string ("PowerShell" | "Bash" | "OS Optimization Script"),
    "filename": string,
    "code": string (Actual command/script snippet to resolve critical bottlenecks, clean temp files, or repair image health like DISM/SFC or sysctl adjustments)
  },
  "performanceGainEstimate": {
    "speedBoostPercent": number,
    "freedRamMB": number,
    "freedStorageGB": number
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stabilityScore: { type: Type.NUMBER },
            healthGrade: { type: Type.STRING },
            summary: { type: Type.STRING },
            criticalFindings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  rootCause: { type: Type.STRING },
                  autoRepairAction: { type: Type.STRING },
                },
              },
            },
            recommendedScript: {
              type: Type.OBJECT,
              properties: {
                scriptType: { type: Type.STRING },
                filename: { type: Type.STRING },
                code: { type: Type.STRING },
              },
            },
            performanceGainEstimate: {
              type: Type.OBJECT,
              properties: {
                speedBoostPercent: { type: Type.NUMBER },
                freedRamMB: { type: Type.NUMBER },
                freedStorageGB: { type: Type.NUMBER },
              },
            },
          },
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("AI Diagnose Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI diagnosis" });
  }
});

// Endpoint 2: Crash Dump & Error Log Interpreter (BSOD, Event Viewer, DxDiag, Game Freeze)
app.post("/api/ai/analyze-log", async (req, res) => {
  try {
    const { logText, errorType, systemSpec } = req.body;
    const ai = getAI();

    const prompt = `You are a Principal OS Kernel & Hardware Stability Expert. A user has provided an error log or crash report from their computer (${errorType || "System Log"}).

System Specification / Context: ${systemSpec || "Standard PC"}

Error Log / Symptom Input:
"""
${logText}
"""

Analyze this log in deep technical detail. Identify the offending driver, memory violation, thermal anomaly, DLL conflict, or service crash. Then provide a precise, step-by-step automated repair plan.
Return a valid JSON matching this schema:
{
  "crashTitle": string (e.g. "NVIDIA Kernel Driver Timeout (TDR)" or "Page Fault in Nonpaged Area"),
  "faultingModule": string (e.g. "nvlddmkm.sys", "ntoskrnl.exe", "rtwlane.sys", or "Unknown"),
  "confidenceScore": number (0 to 100),
  "rootCauseAnalysis": string (Detailed technical breakdown of why this occurred),
  "immediateFixSteps": [
    string (Step 1),
    string (Step 2),
    string (Step 3)
  ],
  "automatedRepairCommand": string (A terminal or PowerShell command to verify/repair files or reset corrupted services)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            crashTitle: { type: Type.STRING },
            faultingModule: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            rootCauseAnalysis: { type: Type.STRING },
            immediateFixSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            automatedRepairCommand: { type: Type.STRING },
          },
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Log Analyze Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze log" });
  }
});

// Endpoint 3: Custom Automated Repair Script Generator
app.post("/api/ai/generate-script", async (req, res) => {
  try {
    const { selectedIssues, targetOS } = req.body;
    const ai = getAI();

    const prompt = `You are an expert system automation engineer. Generate a safe, highly effective 1-click automated repair and optimization script for ${targetOS || "Windows (PowerShell)"} to resolve these specific user-selected system problems:

Selected Issues:
${JSON.stringify(selectedIssues, null, 2)}

Requirements:
1. Include clear echo/print progress statements.
2. Ensure commands are safe (e.g., clearing Windows temp folders, resetting network winsock/DNS cache, running DISM online image repair, optimizing power plan, flushing icon cache).
3. Provide a brief explanation of what the script does.

Return valid JSON:
{
  "scriptTitle": string,
  "language": string ("PowerShell" | "Bash" | "Batch"),
  "scriptCode": string,
  "safetyRating": string ("100% Safe - Standard Maintenance" | "Advanced Admin Required"),
  "expectedTimeSeconds": number
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scriptTitle: { type: Type.STRING },
            language: { type: Type.STRING },
            scriptCode: { type: Type.STRING },
            safetyRating: { type: Type.STRING },
            expectedTimeSeconds: { type: Type.NUMBER },
          },
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Script Generate Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate script" });
  }
});

// Vite middleware setup for SPA fallback and dev server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PulseWASM System Care server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
