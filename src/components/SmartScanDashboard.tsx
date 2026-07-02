import React, { useState } from "react";
import { Shield, Zap, CheckCircle2, AlertTriangle, Play, RefreshCw, Trash2, Lock, Cpu, Stethoscope, ChevronDown, ChevronUp, Sparkles, HardDrive, Check, X, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { ScanFinding, ScanCategory, SystemTelemetry } from "../types";
import { sound } from "../lib/soundFx";

interface SmartScanDashboardProps {
  findings: ScanFinding[];
  setFindings: React.Dispatch<React.SetStateAction<ScanFinding[]>>;
  telemetry: SystemTelemetry | null;
  onJumpToAi: () => void;
  onTriggerTurbo: () => void;
}

export const SmartScanDashboard: React.FC<SmartScanDashboardProps> = ({
  findings,
  setFindings,
  telemetry,
  onJumpToAi,
  onTriggerTurbo
}) => {
  const [scanState, setScanState] = useState<"ready" | "scanning" | "scanned" | "repairing" | "repaired">("ready");
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScanStep, setCurrentScanStep] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<ScanCategory | null>("system_integrity");

  // Calculate totals
  const activeFindings = findings.filter(f => f.status !== "ignored" && f.status !== "repaired");
  const repairedCount = findings.filter(f => f.status === "repaired").length;
  const criticalCount = activeFindings.filter(f => f.severity === "CRITICAL" || f.severity === "HIGH").length;
  
  const totalJunkBytes = findings
    .filter(f => f.category === "junk_cleaner" && (f.status === "found" || f.status === "unscanned"))
    .reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  
  const totalJunkGB = (totalJunkBytes / (1024 * 1024 * 1024)).toFixed(1);

  // Trigger automated Smart Scan
  const handleStartScan = () => {
    sound.playClick();
    setScanState("scanning");
    setScanProgress(0);

    const steps = [
      { progress: 15, label: "Probing Windows Registry & OS System Integrity..." },
      { progress: 35, label: "Analyzing RAM Pagefile & CPU Throttling Bottlenecks..." },
      { progress: 55, label: "Scanning Browser Tracking Cookies & DNS Prefetch..." },
      { progress: 80, label: "Calculating System Junk & Stale Crash Dumps..." },
      { progress: 100, label: "Evaluating Startup Impact & Background Bloat..." }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setScanProgress(steps[currentStepIdx].progress);
        setCurrentScanStep(steps[currentStepIdx].label);
        sound.playScanPulse();
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setFindings(prev => prev.map(f => ({ ...f, status: "found" })));
        setScanState("scanned");
        sound.playAlert();
      }
    }, 600);
  };

  // Trigger 1-Click Repair All
  const handleRepairAll = () => {
    sound.playClick();
    setScanState("repairing");
    setScanProgress(0);

    const activeIds = activeFindings.map(f => f.id);
    let idx = 0;

    const interval = setInterval(() => {
      if (idx < activeIds.length) {
        const targetId = activeIds[idx];
        setFindings(prev => prev.map(f => f.id === targetId ? { ...f, status: "repairing" } : f));
        sound.playScanPulse();
        
        setTimeout(() => {
          setFindings(prev => prev.map(f => f.id === targetId ? { ...f, status: "repaired" } : f));
        }, 300);

        setScanProgress(Math.round(((idx + 1) / activeIds.length) * 100));
        setCurrentScanStep(`Repairing issue ${idx + 1} of ${activeIds.length}...`);
        idx++;
      } else {
        clearInterval(interval);
        setScanState("repaired");
        sound.playRepairSuccess();
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    }, 450);
  };

  // Fix individual finding
  const handleFixSingle = (id: string) => {
    sound.playClick();
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status: "repairing" } : f));
    setTimeout(() => {
      setFindings(prev => prev.map(f => f.id === id ? { ...f, status: "repaired" } : f));
      sound.playClick();
    }, 400);
  };

  // Ignore finding
  const handleIgnoreSingle = (id: string) => {
    sound.playClick();
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status: "ignored" } : f));
  };

  const categories: { id: ScanCategory; label: string; icon: any; count: number; desc: string }[] = [
    { id: "system_integrity", label: "Registry & OS Integrity", icon: Shield, count: findings.filter(f => f.category === "system_integrity" && f.status !== "ignored").length, desc: "DLL stability, ActiveX handlers & COM pointers" },
    { id: "performance", label: "Performance & RAM Boost", icon: Zap, count: findings.filter(f => f.category === "performance" && f.status !== "ignored").length, desc: "Memory defragmentation, TCP scaling & power scheme" },
    { id: "privacy_security", label: "Privacy & Security Shield", icon: Lock, count: findings.filter(f => f.category === "privacy_security" && f.status !== "ignored").length, desc: "Tracking cookies, DNS encryption & telemetry blocking" },
    { id: "junk_cleaner", label: "Deep Junk Cleaner", icon: HardDrive, count: findings.filter(f => f.category === "junk_cleaner" && f.status !== "ignored").length, desc: `~${totalJunkGB} GB of OS temp files, cache & error dumps` },
    { id: "registry_startup", label: "Startup & Background Bloat", icon: Cpu, count: findings.filter(f => f.category === "registry_startup" && f.status !== "ignored").length, desc: "Boot updaters & disk indexing latency" }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. BENTO GRID HERO CENTERPIECE */}
      <div className="relative bg-gradient-to-br from-[#16181d] to-[#0f1115] rounded-2xl p-8 border border-white/5 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
        
        {/* Subtle Bento radial dot grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-2xl py-4">
          
          {/* THE BENTO CIRCLE GAUGE / BUTTON */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-blue-500/20 flex items-center justify-center mb-6">
            
            {/* Outer rotating decorative ring */}
            <div className={`absolute inset-0 rounded-full border-t-4 border-blue-500 pointer-events-none transition-all duration-500 ${
              scanState === "scanning" || scanState === "repairing"
                ? "animate-spin border-blue-400"
                : scanState === "scanned" && activeFindings.length > 0
                ? "border-yellow-500"
                : scanState === "repaired"
                ? "border-emerald-500"
                : "border-blue-500"
            }`} style={{ animationDuration: scanState === "scanning" || scanState === "repairing" ? "1.5s" : "12s" }} />

            {/* Core Circle Container */}
            <button
              type="button"
              className={`relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center p-6 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
                scanState === "ready"
                  ? "bg-blue-600 hover:bg-blue-500 shadow-[0_0_50px_rgba(37,99,235,0.4)] cursor-pointer group transform hover:scale-105"
                  : scanState === "scanning" || scanState === "repairing"
                  ? "bg-[#16181d] border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] cursor-default"
                  : scanState === "scanned"
                  ? "bg-[#16181d] border-2 border-yellow-500 hover:border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.2)] cursor-pointer group transform hover:scale-105"
                  : "bg-[#16181d] border-2 border-emerald-500 hover:border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] cursor-pointer group transform hover:scale-105"
              }`}
              onClick={() => {
                if (scanState === "ready") handleStartScan();
                else if (scanState === "scanned") handleRepairAll();
                else if (scanState === "repaired") {
                  sound.playClick();
                  setScanState("ready");
                }
              }}
              title={
                scanState === "ready"
                  ? "Click to start system scan"
                  : scanState === "scanned"
                  ? "Click to 1-Click Repair All issues"
                  : scanState === "repaired"
                  ? "Click to scan again"
                  : "Scan in progress..."
              }
            >
              {scanState === "ready" && (
                <>
                  <span className="text-white text-3xl sm:text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform">SCAN</span>
                  <span className="text-blue-200 text-[10px] font-bold tracking-widest mt-1 uppercase">OPTIMIZE ALL</span>
                </>
              )}

              {(scanState === "scanning" || scanState === "repairing") && (
                <>
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                  <span className="text-3xl font-bold text-white font-mono">{scanProgress}%</span>
                  <span className="text-[10px] text-blue-400 font-mono mt-1 text-center max-w-[150px] truncate uppercase">
                    {currentScanStep || "Processing..."}
                  </span>
                </>
              )}

              {scanState === "scanned" && (
                <>
                  <AlertTriangle className="w-10 h-10 text-yellow-400 mb-1 animate-pulse" />
                  <span className="text-3xl sm:text-4xl font-extrabold text-yellow-400 font-mono group-hover:scale-110 transition-transform">
                    {activeFindings.length}
                  </span>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider mt-1">
                    Issues Found
                  </span>
                  <span className="text-[10px] text-red-400 font-mono mt-0.5">
                    {criticalCount} Critical
                  </span>
                </>
              )}

              {scanState === "repaired" && (
                <>
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xl font-bold text-emerald-400 uppercase">SECURED</span>
                  <span className="text-[11px] text-slate-300 mt-1">All {repairedCount} fixed</span>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded mt-1.5 font-bold">
                    SYSTEM HEALTHY
                  </span>
                </>
              )}
            </button>
          </div>

          <p className="text-slate-400 text-sm text-center max-w-md">
            Last full system optimization was 12 days ago. <br/>
            <span className="text-blue-400 font-semibold">System stability score: {scanState === "repaired" ? "100%" : scanState === "scanned" ? "78%" : "84%"}</span>
          </p>

          {/* ACTION BUTTONS WHEN SCANNED OR REPAIRED */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            {scanState === "ready" && (
              <button
                type="button"
                onClick={handleStartScan}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2.5 cursor-pointer uppercase tracking-wider"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>START SMART SYSTEM SCAN</span>
              </button>
            )}

            {scanState === "scanned" && (
              <>
                <button
                  type="button"
                  onClick={handleRepairAll}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>1-CLICK REPAIR ALL ({activeFindings.length})</span>
                </button>

                <button
                  type="button"
                  onClick={onTriggerTurbo}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-all flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Turbo Boost</span>
                </button>
              </>
            )}

            {scanState === "repaired" && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setScanState("ready");
                }}
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-all flex items-center space-x-2 cursor-pointer uppercase tracking-wider"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Scan Again</span>
              </button>
            )}
          </div>

          {/* BENTO HERO BOTTOM RAIL */}
          <div className="w-full mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-between items-end gap-4 text-left">
            <div className="flex gap-8 sm:gap-12">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cleaned Today</p>
                <p className="text-lg sm:text-xl font-mono text-white">{scanState === "repaired" ? `${totalJunkGB} GB` : "1.24 GB"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Security Patches</p>
                <p className="text-lg sm:text-xl font-mono text-white">Up to date</p>
              </div>
            </div>
            <div className="text-right ml-auto">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Auto-Repair</p>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded font-bold uppercase tracking-wider">ENABLED</span>
            </div>
          </div>

        </div>
      </div>

      {/* ESTIMATED OPTIMIZATION GAINS BANNER (Shown when Scanned or Repaired) */}
      {(scanState === "scanned" || scanState === "repaired") && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#16181d] rounded-2xl p-4 border border-white/5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Speed Boost</div>
              <div className="text-sm font-bold text-white font-mono">+25% Faster Boot</div>
            </div>
          </div>

          <div className="bg-[#16181d] rounded-2xl p-4 border border-white/5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Storage Freed</div>
              <div className="text-sm font-bold text-white font-mono">~{totalJunkGB} GB SSD Reclaimed</div>
            </div>
          </div>

          <div className="bg-[#16181d] rounded-2xl p-4 border border-white/5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Privacy Shield</div>
              <div className="text-sm font-bold text-white font-mono">142 Cookies Shredded</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Doctor Link Banner */}
      <div className="bg-blue-600/10 rounded-2xl border border-blue-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI System Doctor Available</h4>
            <p className="text-xs text-slate-400">Ask Gemini AI to analyze root-cause telemetry and generate 1-click repair scripts.</p>
          </div>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onJumpToAi();
          }}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center space-x-1.5"
        >
          <span>Open AI Doctor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. CATEGORIZED ITEMIZED FINDINGS ACCORDIONS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Diagnostic Modules & Itemized Findings</span>
            </h3>
            <p className="text-xs text-slate-500">Review individual system anomalies and automated repair targets</p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Total Items: <span className="text-blue-400 font-bold">{findings.length}</span> | Active: <span className="text-yellow-400 font-bold">{activeFindings.length}</span>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isExpanded = expandedCategory === cat.id;
            const catFindings = findings.filter(f => f.category === cat.id);
            const activeInCat = catFindings.filter(f => f.status !== "ignored" && f.status !== "repaired").length;
            const repairedInCat = catFindings.filter(f => f.status === "repaired").length;

            return (
              <div key={cat.id} className="bg-[#16181d] rounded-2xl border border-white/5 overflow-hidden transition-all">
                
                {/* Accordion Header */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setExpandedCategory(isExpanded ? null : cat.id);
                  }}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${activeInCat > 0 ? "bg-yellow-500/10 text-yellow-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm uppercase tracking-wider">{cat.label}</span>
                        {activeInCat > 0 ? (
                          <span className="text-[10px] font-mono bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold uppercase">
                            {activeInCat} issues
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                            <Check className="w-3 h-3 inline" /> Optimized
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{cat.desc}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {repairedInCat > 0 && (
                      <span className="text-xs font-mono text-emerald-400 hidden sm:inline">
                        {repairedInCat} fixed
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-[#0f1115]/80 p-4 space-y-2.5">
                    {catFindings.map((item) => {
                      const isRepaired = item.status === "repaired";
                      const isIgnored = item.status === "ignored";
                      const isRepairing = item.status === "repairing";

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            isRepaired 
                              ? "bg-emerald-950/10 border-emerald-500/20 opacity-75" 
                              : isIgnored 
                              ? "bg-white/5 border-white/5 opacity-50" 
                              : item.severity === "CRITICAL"
                              ? "bg-red-950/20 border-red-500/30"
                              : "bg-[#16181d] border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="font-semibold text-white text-xs uppercase tracking-wide">{item.title}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                item.severity === "CRITICAL" ? "bg-red-500/20 text-red-400" :
                                item.severity === "HIGH" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-blue-500/20 text-blue-400"
                              }`}>
                                {item.severity}
                              </span>
                              {item.sizeBytes && (
                                <span className="text-[9px] font-mono bg-white/5 text-slate-400 px-1.5 py-0.5 rounded">
                                  ~{(item.sizeBytes / (1024 * 1024)).toFixed(0)} MB
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{item.description}</p>
                            <div className="text-[10px] font-mono text-blue-400 flex items-center space-x-1 pt-1">
                              <Sparkles className="w-3 h-3 inline" />
                              <span>Impact: {item.impact}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                            {isRepaired ? (
                              <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
                                <Check className="w-3.5 h-3.5" />
                                <span className="uppercase text-[10px]">REPAIRED</span>
                              </span>
                            ) : isIgnored ? (
                              <button
                                onClick={() => {
                                  sound.playClick();
                                  setFindings(prev => prev.map(f => f.id === item.id ? { ...f, status: "found" } : f));
                                }}
                                className="text-xs text-slate-500 hover:text-white underline font-mono"
                              >
                                Restore
                              </button>
                            ) : isRepairing ? (
                              <span className="flex items-center space-x-1 text-xs font-mono text-blue-400 animate-pulse bg-blue-500/10 px-3 py-1.5 rounded">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Fixing...</span>
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleFixSingle(item.id)}
                                  className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>Fix Now</span>
                                </button>

                                <button
                                  onClick={() => handleIgnoreSingle(item.id)}
                                  title="Ignore this issue"
                                  className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
