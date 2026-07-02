import React, { useState } from "react";
import { Stethoscope, Sparkles, Terminal, ShieldAlert, CheckCircle2, Copy, Check, Play, AlertTriangle, FileCode, Cpu, RefreshCw, ChevronRight } from "lucide-react";
import { ScanFinding, SystemTelemetry, AiDiagnosticReport, LogAnalysisResult, CustomScriptResult } from "../types";
import { sound } from "../lib/soundFx";

interface AiSystemDoctorTabProps {
  findings: ScanFinding[];
  telemetry: SystemTelemetry | null;
}

export const AiSystemDoctorTab: React.FC<AiSystemDoctorTabProps> = ({ findings, telemetry }) => {
  const [activeTool, setActiveTool] = useState<"diagnose" | "log_analyzer" | "script_gen">("diagnose");

  // Tool 1 state
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [diagReport, setDiagReport] = useState<AiDiagnosticReport | null>(null);

  // Tool 2 state
  const [logInput, setLogInput] = useState("");
  const [loadingLog, setLoadingLog] = useState(false);
  const [logResult, setLogResult] = useState<LogAnalysisResult | null>(null);

  // Tool 3 state
  const [selectedIds, setSelectedIds] = useState<string[]>(findings.filter(f => f.status !== "repaired" && f.status !== "ignored").map(f => f.id));
  const [loadingScript, setLoadingScript] = useState(false);
  const [scriptResult, setScriptResult] = useState<CustomScriptResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Sample crash log presets
  const presets = [
    {
      label: "Windows BSOD: DPC_WATCHDOG_VIOLATION",
      code: `BugCheck 133, {1, 1e00, fffff8022a1b3350, 0}
Probably caused by : nvlddmkm.sys ( nvlddmkm+12b4e0 )
IMAGE_NAME:  nvlddmkm.sys
FAILURE_BUCKET_ID:  0x133_ISR_nvlddmkm!unknown_function
SYMPTOM: 3D Game stuttering followed by total system freeze and blue screen crash.`
    },
    {
      label: "Event Viewer: Kernel-Power Error 41",
      code: `Log Name: System
Source: Microsoft-Windows-Kernel-Power
Event ID: 41
Task Category: (63)
Level: Critical
Description: The system has rebooted without cleanly shutting down first. This error could be caused if the system stopped responding, crashed, or lost power unexpectedly.
BugcheckCode: 0x000000ef (CRITICAL_PROCESS_DIED)`
    },
    {
      label: "DirectX DxDiag: GPU TDR Driver Timeout",
      code: `Diagnostics:
Windows Error Reporting: Event Name: LiveKernelEvent
Response: Not available
Cab Id: 0
Problem signature:
P1: 141 (VIDEO_ENGINE_TIMEOUT_DETECTED)
P2: ffffab8b21c40460
P3: fffff8067b21a110
P4: 0
SYMPTOM: Screen goes black for 2 seconds while rendering Unreal Engine scene, then recovers with 'Display driver failed to respond'.`
    }
  ];

  const safeParseJSON = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      if (text.includes("The page could not be found") || text.includes("<title>") || res.status === 404 || res.status >= 500) {
        throw new Error(`AI Backend service was rebooting or offline (HTTP ${res.status}). Please click try again in a moment!`);
      }
      throw new Error(`Server returned unexpected response (HTTP ${res.status}). Please try again.`);
    }
    return await res.json();
  };

  const handleRunAiDiagnosis = async () => {
    sound.playClick();
    setLoadingDiag(true);
    setDiagReport(null);

    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telemetry,
          scanResults: findings,
          osType: telemetry ? telemetry.platform : "Windows 11 / x64"
        })
      });
      const data = await safeParseJSON(res);
      if (res.ok) {
        setDiagReport(data);
        sound.playRepairSuccess();
      } else {
        alert("AI Diagnosis failed: " + (data.error || "Unknown error"));
      }
    } catch (e: any) {
      alert("AI Doctor notification: " + e.message);
    } finally {
      setLoadingDiag(false);
    }
  };

  const handleAnalyzeLog = async () => {
    if (!logInput.trim()) {
      alert("Please paste an error log or select a preset first.");
      return;
    }
    sound.playClick();
    setLoadingLog(true);
    setLogResult(null);

    try {
      const res = await fetch("/api/ai/analyze-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logText: logInput,
          errorType: "Crash Dump / Event Log",
          systemSpec: telemetry ? `${telemetry.platform}, ${telemetry.hardwareConcurrency} Cores, ${telemetry.gpuRenderer}` : "PC System"
        })
      });
      const data = await safeParseJSON(res);
      if (res.ok) {
        setLogResult(data);
        sound.playRepairSuccess();
      } else {
        alert("Log analysis failed: " + (data.error || "Unknown error"));
      }
    } catch (e: any) {
      alert("AI Doctor notification: " + e.message);
    } finally {
      setLoadingLog(false);
    }
  };

  const handleGenerateScript = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one system issue to fix.");
      return;
    }
    sound.playClick();
    setLoadingScript(true);
    setScriptResult(null);

    const selectedItems = findings.filter(f => selectedIds.includes(f.id));

    try {
      const res = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedIssues: selectedItems,
          targetOS: telemetry ? telemetry.platform : "Windows PowerShell"
        })
      });
      const data = await safeParseJSON(res);
      if (res.ok) {
        setScriptResult(data);
        sound.playRepairSuccess();
      } else {
        alert("Script generation failed: " + (data.error || "Unknown error"));
      }
    } catch (e: any) {
      alert("AI Doctor notification: " + e.message);
    } finally {
      setLoadingScript(false);
    }
  };

  const copyCode = (code: string) => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* AI HEADER BANNER */}
      <div className="bg-gradient-to-br from-[#16181d] to-[#0f1115] rounded-2xl p-6 border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded text-xs font-mono font-bold border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>POWERED BY GOOGLE GEMINI AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
            AI System Doctor & Root-Cause Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Harness server-side Gemini AI to interpret complex kernel crashes, evaluate stability bottlenecks, and generate tailored, safe 1-click optimization scripts for your machine.
          </p>
        </div>

        <div className="bg-[#0f1115] px-6 py-4 rounded-xl border border-white/5 text-center shrink-0">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">AI Engine Status</div>
          <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5 flex items-center justify-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GEMINI ONLINE</span>
          </div>
        </div>
      </div>

      {/* SUB-TOOL NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => { sound.playClick(); setActiveTool("diagnose"); }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
            activeTool === "diagnose"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
              : "bg-[#16181d] text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <Stethoscope className="w-4 h-4 text-blue-400" />
          <span>1. Root-Cause Diagnostic</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTool("log_analyzer"); }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
            activeTool === "log_analyzer"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
              : "bg-[#16181d] text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <FileCode className="w-4 h-4 text-blue-400" />
          <span>2. Crash Dump & BSOD Interpreter</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTool("script_gen"); }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
            activeTool === "script_gen"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
              : "bg-[#16181d] text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <Terminal className="w-4 h-4 text-blue-400" />
          <span>3. Repair Script Generator</span>
        </button>
      </div>

      {/* TOOL 1: SMART ROOT-CAUSE DIAGNOSTIC */}
      {activeTool === "diagnose" && (
        <div className="space-y-6">
          <div className="bg-[#16181d] rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <span>Executive System Health Audit</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gemini will synthesize your telemetry ({telemetry?.hardwareConcurrency} Cores, {telemetry?.ramPercent}% RAM load) and {findings.length} detected scan anomalies to evaluate your overall OS stability grade.
              </p>
            </div>

            <button
              onClick={handleRunAiDiagnosis}
              disabled={loadingDiag}
              className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                loadingDiag
                  ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transform hover:-translate-y-0.5"
              }`}
            >
              {loadingDiag ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>ANALYZING HEALTH...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>RUN AI DIAGNOSTIC AUDIT</span>
                </>
              )}
            </button>
          </div>

          {loadingDiag && (
            <div className="bg-[#0B0F19] p-8 rounded-2xl border border-purple-500/30 text-center space-y-3 font-mono">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <div className="text-sm text-purple-300 font-bold">Gemini is evaluating kernel memory fragmentation & COM registry pointers...</div>
              <div className="text-xs text-gray-500">Cross-referencing driver telemetry with stability database</div>
            </div>
          )}

          {diagReport && (
            <div className="space-y-6 animate-fadeIn">
              {/* GRADE BANNER */}
              <div className="bg-gradient-to-br from-[#12112A] via-[#1A1635] to-[#121A2E] p-6 sm:p-8 rounded-2xl border border-purple-500/40 grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-2xl">
                <div className="text-center md:border-r md:border-purple-500/30 pr-0 md:pr-6">
                  <div className="text-xs font-mono text-gray-400 uppercase">AI Health Grade</div>
                  <div className={`text-5xl sm:text-6xl font-extrabold font-mono mt-1 ${
                    diagReport.healthGrade === "A+" || diagReport.healthGrade === "A" ? "text-emerald-400" :
                    diagReport.healthGrade === "B" ? "text-cyan-400" :
                    diagReport.healthGrade === "C" ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {diagReport.healthGrade}
                  </div>
                  <div className="text-xs font-mono text-gray-400 mt-1">Stability: {diagReport.stabilityScore}/100</div>
                </div>

                <div className="md:col-span-3 space-y-3">
                  <h4 className="text-lg font-bold text-white">Executive Diagnosis</h4>
                  <p className="text-sm text-gray-200 leading-relaxed bg-black/30 p-4 rounded-xl border border-purple-500/20">
                    "{diagReport.summary}"
                  </p>
                  {diagReport.performanceGainEstimate && (
                    <div className="flex flex-wrap gap-3 pt-1 text-xs font-mono">
                      <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
                        ⚡ Est. Speed Boost: +{diagReport.performanceGainEstimate.speedBoostPercent}%
                      </span>
                      <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                        🧠 Free RAM: {diagReport.performanceGainEstimate.freedRamMB} MB
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                        🧹 Reclaim Storage: {diagReport.performanceGainEstimate.freedStorageGB} GB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CRITICAL FINDINGS */}
              {diagReport.criticalFindings && diagReport.criticalFindings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-white flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <span>AI Root-Cause Findings & Recommended Actions</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {diagReport.criticalFindings.map((item, idx) => (
                      <div key={idx} className="bg-[#111827] p-5 rounded-xl border border-gray-800 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-white text-sm">{item.title}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            item.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}>
                            {item.severity} • {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300"><span className="text-gray-400 font-semibold">Root Cause:</span> {item.rootCause}</p>
                        <div className="bg-gray-900/90 p-3 rounded-lg border border-cyan-500/20 text-xs text-cyan-300 font-mono flex items-center space-x-2">
                          <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>Auto-Repair Prescription: {item.autoRepairAction}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECOMMENDED SCRIPT */}
              {diagReport.recommendedScript && (
                <div className="bg-[#0B0F19] rounded-xl border border-purple-500/40 overflow-hidden shadow-xl">
                  <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-300 font-bold flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-purple-400" />
                      <span>{diagReport.recommendedScript.filename} ({diagReport.recommendedScript.scriptType})</span>
                    </span>
                    <button
                      onClick={() => copyCode(diagReport.recommendedScript!.code)}
                      className="px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-mono border border-purple-500/40 flex items-center space-x-1.5 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "COPIED!" : "COPY SCRIPT"}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed bg-black/40">
                    <code>{diagReport.recommendedScript.code}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOOL 2: CRASH DUMP & ERROR LOG INTERPRETER */}
      {activeTool === "log_analyzer" && (
        <div className="space-y-6">
          <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <FileCode className="w-5 h-5 text-cyan-400" />
                  <span>BSOD & Event Viewer Crash Log Analyzer</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Paste any error log, crash report, or DirectX DxDiag dump below. Gemini will pinpoint the exact faulting driver or memory violation and provide the exact fix.
                </p>
              </div>
            </div>

            {/* PRESETS */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs font-mono text-gray-400 self-center">Try Sample Crash Presets:</span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { sound.playClick(); setLogInput(p.code); }}
                  className="px-3 py-1 rounded-lg bg-gray-900 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 text-xs font-mono border border-gray-700 hover:border-cyan-500/40 transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              rows={6}
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder="Paste your Windows BSOD crash report, DxDiag text, Linux kernel panic, or Event Viewer error text here..."
              className="w-full bg-[#0B0F19] rounded-xl border border-gray-800 focus:border-cyan-500/60 p-4 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none transition-all resize-y leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                onClick={handleAnalyzeLog}
                disabled={loadingLog || !logInput.trim()}
                className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center space-x-2 cursor-pointer ${
                  loadingLog || !logInput.trim()
                    ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30 transform hover:-translate-y-0.5"
                }`}
              >
                {loadingLog ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>PARSING CRASH STACK TRACE...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>ANALYZE LOG & GENERATE FIX</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {logResult && (
            <div className="bg-gradient-to-br from-[#0B1528] to-[#111A30] rounded-2xl p-6 sm:p-8 border border-cyan-500/40 shadow-2xl space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Diagnosis Confirmed</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">{logResult.crashTitle}</h3>
                  <div className="text-xs font-mono text-gray-400 mt-1">
                    Faulting Module: <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">{logResult.faultingModule}</span>
                  </div>
                </div>

                <div className="bg-gray-900/90 px-4 py-2 rounded-xl border border-cyan-500/30 text-center shrink-0">
                  <div className="text-[10px] font-mono text-gray-400">AI Confidence Score</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">{logResult.confidenceScore}%</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase font-mono">Technical Root-Cause Breakdown</h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-black/40 p-4 rounded-xl border border-gray-800">
                  {logResult.rootCauseAnalysis}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase font-mono">Immediate Actionable Fix Steps</h4>
                <div className="space-y-2">
                  {logResult.immediateFixSteps.map((step, idx) => (
                    <div key={idx} className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800 flex items-start space-x-3 text-xs sm:text-sm text-gray-200">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {logResult.automatedRepairCommand && (
                <div className="bg-[#0B0F19] rounded-xl border border-cyan-500/40 overflow-hidden shadow-xl">
                  <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-300 font-bold flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>Automated Verification & Repair Command</span>
                    </span>
                    <button
                      onClick={() => copyCode(logResult.automatedRepairCommand)}
                      className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-mono border border-cyan-500/40 flex items-center space-x-1.5 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "COPIED!" : "COPY COMMAND"}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed bg-black/50">
                    <code>{logResult.automatedRepairCommand}</code>
                  </pre>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* TOOL 3: CUSTOM AUTOMATED REPAIR SCRIPT GENERATOR */}
      {activeTool === "script_gen" && (
        <div className="space-y-6">
          <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span>Custom 1-Click Automated Repair Script Builder</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Select specific detected system anomalies below. Gemini will generate a custom, safe PowerShell or Bash script with built-in error handling to resolve them in one click.
              </p>
            </div>

            {/* SELECTION CHECKBOXES */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 bg-[#0B0F19]/60 p-4 rounded-xl border border-gray-800">
              {findings.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isRepaired = item.status === "repaired";

                return (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      isRepaired
                        ? "bg-emerald-950/20 border-emerald-500/20 opacity-60"
                        : isSelected
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-gray-900/60 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isRepaired}
                        onChange={() => {
                          sound.playClick();
                          setSelectedIds(prev => isSelected ? prev.filter(i => i !== item.id) : [...prev, item.id]);
                        }}
                        className="w-4 h-4 rounded border-gray-700 text-emerald-500 focus:ring-emerald-400 bg-gray-900"
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] text-gray-400">{item.description}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold shrink-0 ${
                      item.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-300" :
                      item.severity === "HIGH" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"
                    }`}>
                      {item.severity}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
              <div className="text-xs font-mono text-gray-400">
                Selected: <span className="text-emerald-400 font-bold">{selectedIds.length}</span> of {findings.length} issues
              </div>

              <button
                onClick={handleGenerateScript}
                disabled={loadingScript || selectedIds.length === 0}
                className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center space-x-2 cursor-pointer ${
                  loadingScript || selectedIds.length === 0
                    ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30 transform hover:-translate-y-0.5"
                }`}
              >
                {loadingScript ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>BUILDING AUTOMATED SCRIPT...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4 fill-white" />
                    <span>GENERATE 1-CLICK REPAIR SCRIPT</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {scriptResult && (
            <div className="bg-gradient-to-br from-[#091A14] to-[#0E261E] rounded-2xl p-6 sm:p-8 border border-emerald-500/40 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
                <div>
                  <div className="text-xs font-mono text-emerald-400 uppercase">Script Generated Successfully</div>
                  <h3 className="text-xl font-bold text-white mt-1">{scriptResult.scriptTitle}</h3>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-bold">
                    🛡️ {scriptResult.safetyRating}
                  </span>
                  <span className="bg-gray-900/80 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-800">
                    Est. Run Time: ~{scriptResult.expectedTimeSeconds}s
                  </span>
                </div>
              </div>

              <div className="bg-[#0B0F19] rounded-xl border border-emerald-500/40 overflow-hidden shadow-xl">
                <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-300 font-bold flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>PCSecure_AutoRepair.{scriptResult.language === "PowerShell" ? "ps1" : "sh"}</span>
                  </span>
                  <button
                    onClick={() => copyCode(scriptResult.scriptCode)}
                    className="px-4 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-mono border border-emerald-500/40 flex items-center space-x-1.5 transition-all cursor-pointer font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY SCRIPT TO RUN"}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed bg-black/60 max-h-96">
                  <code>{scriptResult.scriptCode}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
