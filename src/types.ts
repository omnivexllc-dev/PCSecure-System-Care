export type ScanCategory = 
  | "system_integrity" 
  | "performance" 
  | "privacy_security" 
  | "junk_cleaner" 
  | "registry_startup";

export interface ScanFinding {
  id: string;
  category: ScanCategory;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  impact: string; // e.g., "Saves ~1.4 GB RAM", "Prevents DPC Latency Spikes"
  status: "unscanned" | "scanning" | "found" | "repairing" | "repaired" | "ignored";
  repairAction: string;
  sizeBytes?: number;
}

export interface SystemTelemetry {
  cpuUsage: number; // 0 - 100%
  ramUsageMB: number;
  ramTotalMB: number;
  ramPercent: number;
  diskFreeGB: number;
  diskTotalGB: number;
  networkPingMs: number;
  networkSpeedMbps: number;
  cpuTempC: number;
  batteryPercent: number | null;
  isCharging: boolean | null;
  hardwareConcurrency: number;
  gpuRenderer: string;
  platform: string;
  uptimeSeconds: number;
  wasmState: "IDLE" | "PROBING" | "STRESS_TEST" | "SANDBOX_VERIFIED" | "REPAIRING";
}

export interface WasmBenchmarkResult {
  id: string;
  testName: string;
  status: "idle" | "running" | "completed" | "error";
  score: number;
  metricLabel: string;
  details: string;
}

export interface ProcessItem {
  id: string;
  name: string;
  pid: number;
  cpuPercent: number;
  memoryMB: number;
  category: "System" | "Browser" | "Telemetry" | "Background" | "App";
  status: "normal" | "throttled" | "terminated";
  isHighImpact: boolean;
}

export interface StartupItem {
  id: string;
  name: string;
  publisher: string;
  impact: "High" | "Medium" | "Low";
  enabled: boolean;
  delayMs: number;
  path: string;
}

export interface AiDiagnosticReport {
  stabilityScore: number;
  healthGrade: "A+" | "A" | "B" | "C" | "D" | "F";
  summary: string;
  criticalFindings: {
    category: string;
    title: string;
    severity: string;
    rootCause: string;
    autoRepairAction: string;
  }[];
  recommendedScript?: {
    scriptType: string;
    filename: string;
    code: string;
  };
  performanceGainEstimate?: {
    speedBoostPercent: number;
    freedRamMB: number;
    freedStorageGB: number;
  };
}

export interface LogAnalysisResult {
  crashTitle: string;
  faultingModule: string;
  confidenceScore: number;
  rootCauseAnalysis: string;
  immediateFixSteps: string[];
  automatedRepairCommand: string;
}

export interface CustomScriptResult {
  scriptTitle: string;
  language: string;
  scriptCode: string;
  safetyRating: string;
  expectedTimeSeconds: number;
}
