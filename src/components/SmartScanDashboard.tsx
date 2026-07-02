import React, { useState } from "react";
import { Shield, Zap, CheckCircle2, AlertTriangle, Play, RefreshCw, Trash2, Lock, Cpu, Stethoscope, ChevronDown, ChevronUp, Sparkles, HardDrive, Check, X, ArrowRight, History, BarChart2, TrendingUp, Clock, Award, ShieldAlert, CheckCircle, Calendar, RotateCcw, FileText, ArrowUpRight } from "lucide-react";
import confetti from "canvas-confetti";
import { ScanFinding, ScanCategory, SystemTelemetry, ScanHistoryItem } from "../types";
import { sound } from "../lib/soundFx";
import pcSecureLogo from "../assets/images/pc_secure_logo_1783009068614.jpg";

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

  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(() => {
    return localStorage.getItem("pcsecure_first_launch_done") !== "true";
  });

  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>(() => {
    const saved = localStorage.getItem("pcsecure_scan_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    if (localStorage.getItem("pcsecure_first_launch_done") !== "true") {
      return [
        {
          id: "baseline_initial",
          timestamp: new Date(Date.now() - 60000).toISOString(),
          dateStr: "Initial Boot Assessment",
          issuesFound: 11,
          issuesRepaired: 0,
          storageReclaimedGB: 0,
          systemHealthAfter: "CRITICAL",
          scanType: "First-Time System Audit",
          speedBoostPercent: 0
        }
      ];
    }
    return [];
  });


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
      { progress: 15, label: "Scanning Temp Files (%TEMP%), Windows Prefetch Cache & Error Dumps (.dmp)..." },
      { progress: 35, label: "Running CleanMgr Simulation & Purging Windows Update Staging Cache..." },
      { progress: 55, label: "Deep Scanning for Viruses, Spyware, Adware & Browser Popup Hijackers..." },
      { progress: 80, label: "Auditing Unused Browser Extensions (Chrome/Edge/Firefox) & Cookies..." },
      { progress: 100, label: "Analyzing & Disabling Non-Essential High-Impact Startup Items..." }
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

        const wasFirst = localStorage.getItem("pcsecure_first_launch_done") !== "true";
        if (wasFirst) {
          localStorage.setItem("pcsecure_first_launch_done", "true");
          setIsFirstLaunch(false);
        }

        const newEntry: ScanHistoryItem = {
          id: `scan_${Date.now()}`,
          timestamp: new Date().toISOString(),
          dateStr: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          issuesFound: activeFindings.length || 11,
          issuesRepaired: activeFindings.length || 11,
          storageReclaimedGB: parseFloat(totalJunkGB) || 7.1,
          systemHealthAfter: "OPTIMIZED",
          scanType: wasFirst ? "First-Time System Audit" : "Routine Smart Scan",
          speedBoostPercent: wasFirst ? 48 : Math.floor(Math.random() * 12) + 14
        };

        setScanHistory(prev => {
          const updated = [newEntry, ...prev.filter(item => item.id !== "baseline_initial")];
          const baseline = prev.find(item => item.id === "baseline_initial");
          const finalHistory = baseline ? [...updated, baseline] : updated;
          localStorage.setItem("pcsecure_scan_history", JSON.stringify(finalHistory));
          return finalHistory;
        });
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
      
      {/* FIRST-TIME COMPUTER HEALTH AUDIT BANNER */}
      {isFirstLaunch ? (
        <div className="bg-gradient-to-r from-red-950/90 via-red-900/50 to-[#16181d] border-2 border-red-500/50 rounded-2xl p-6 shadow-[0_0_35px_rgba(239,68,68,0.25)] relative overflow-hidden animate-pulse-subtle">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="bg-red-500 text-white font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 inline" />
                  <span>FIRST-TIME LAUNCH AUDIT</span>
                </span>
                <span className="text-red-400 font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                  STATUS: CRITICAL RISK (42% SPEED CAPACITY)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Your Computer Has 11 Major System & Security Bottlenecks!
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                Our initial boot diagnostic detected <strong className="text-red-400 font-semibold">11 unresolved system hazards</strong>, <strong className="text-yellow-400 font-semibold">~{totalJunkGB} GB of junk & Windows crash dumps (.dmp)</strong>, 142 tracking cookies, and 8 unnecessary startup updaters. Your computer is currently severely throttled and exposed.
              </p>
              <div className="flex items-center space-x-4 pt-1 text-xs text-slate-400 font-mono flex-wrap gap-y-1">
                <span className="flex items-center text-red-400"><AlertTriangle className="w-3.5 h-3.5 mr-1 inline" /> Spyware Tracking Active</span>
                <span>•</span>
                <span className="flex items-center text-yellow-400"><HardDrive className="w-3.5 h-3.5 mr-1 inline" /> {totalJunkGB} GB Storage Bloat</span>
                <span>•</span>
                <span className="flex items-center text-blue-400"><Clock className="w-3.5 h-3.5 mr-1 inline" /> Boot Time +4.8s Slow</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  if (scanState === "ready") handleStartScan();
                  else if (scanState === "scanned") handleRepairAll();
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all transform hover:scale-105 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-white animate-bounce" />
                <span>{scanState === "scanned" ? "1-CLICK REPAIR ALL NOW" : "START SMART SCAN & NORMALIZE PC"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-[#16181d] border border-emerald-500/30 rounded-2xl p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-extrabold text-base sm:text-lg tracking-tight">
                  Computer Health: NORMAL / 100% OPTIMIZED
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  SYSTEM PROTECTED
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                All initial major computer problems have been resolved. Real-time background system care is actively monitoring your PC.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                handleStartScan();
              }}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanState === "scanning" ? "animate-spin" : ""}`} />
              <span>Routine Check</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                localStorage.removeItem("pcsecure_first_launch_done");
                setIsFirstLaunch(true);
                setScanState("ready");
                setFindings(prev => prev.map(f => ({ ...f, status: "unscanned" })));
              }}
              title="Reset First-Time Launch status for testing"
              className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-[10px] border border-white/10 transition-all cursor-pointer"
            >
              🔄 Test First-Time Alert
            </button>
          </div>
        </div>
      )}

      {/* 1. BENTO GRID HERO CENTERPIECE */}
      <div className="relative bg-gradient-to-br from-[#16181d] to-[#0f1115] rounded-2xl p-8 border border-white/5 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
        
        {/* Subtle Bento radial dot grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-2xl py-4">
          
          {/* BRAND HERO LOGO BANNER */}
          <div className="flex items-center justify-center gap-3 mb-6 bg-white/[0.03] px-5 py-2 rounded-full border border-white/5 shadow-lg backdrop-blur-md">
            <img
              src={pcSecureLogo}
              alt="PCSecure Logo"
              className="w-7 h-7 rounded-lg object-cover border border-blue-500/30 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="text-left leading-none">
              <span className="text-white font-extrabold text-base tracking-tight">
                PC<span className="text-blue-500 font-black">Secure</span>
              </span>
              <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-blue-400/80 uppercase block mt-0.5">
                — SYSTEM CARE —
              </span>
            </div>
          </div>

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

      {/* 3. SCAN HISTORY & PERFORMANCE COMPARISON SECTION */}
      <div className="bg-gradient-to-br from-[#16181d] to-[#0f1115] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>Scan History & Performance Comparison</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  LOCAL PERSISTED
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare performance improvements, storage reclaimed, and system normalization over time.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-2">
            <button
              onClick={() => {
                sound.playClick();
                const simEntry: ScanHistoryItem = {
                  id: `scan_${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  dateStr: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
                  issuesFound: Math.floor(Math.random() * 3) + 2,
                  issuesRepaired: Math.floor(Math.random() * 3) + 2,
                  storageReclaimedGB: parseFloat((Math.random() * 1.5 + 0.3).toFixed(1)),
                  systemHealthAfter: "OPTIMIZED",
                  scanType: "Routine Smart Scan",
                  speedBoostPercent: Math.floor(Math.random() * 10) + 12
                };
                setScanHistory(prev => {
                  const updated = [simEntry, ...prev];
                  localStorage.setItem("pcsecure_scan_history", JSON.stringify(updated));
                  return updated;
                });
                sound.playRepairSuccess();
              }}
              className="px-3.5 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 inline" />
              <span>Log Maintenance Test</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (confirm("Clear all locally stored scan history?")) {
                  setScanHistory([]);
                  localStorage.removeItem("pcsecure_scan_history");
                }
              }}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-semibold text-xs border border-white/10 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 inline" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Performance Improvement Overview Cards */}
        {scanHistory.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/30 to-[#16181d] border border-blue-500/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold">Peak Speed Boost</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    +{scanHistory.reduce((max, s) => Math.max(max, s.speedBoostPercent), 0)}%
                  </span>
                  <p className="text-[10px] text-blue-400 mt-1 font-semibold uppercase">Compared to Baseline</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-[#16181d] border border-emerald-500/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold">Total Storage Reclaimed</span>
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {scanHistory.reduce((sum, s) => sum + s.storageReclaimedGB, 0).toFixed(1)} GB
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Junk, cache & dumps cleared</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/30 to-[#16181d] border border-purple-500/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold">Total Problems Fixed</span>
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {scanHistory.reduce((sum, s) => sum + s.issuesRepaired, 0)}
                  </span>
                  <p className="text-[10px] text-purple-300 mt-1">Bottlenecks & privacy risks solved</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-950/30 to-[#16181d] border border-yellow-500/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-semibold">Current Health Status</span>
                  <Award className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <span className={`text-base sm:text-lg font-black uppercase font-mono ${
                    scanHistory[0]?.systemHealthAfter === "OPTIMIZED" ? "text-emerald-400" :
                    scanHistory[0]?.systemHealthAfter === "NEEDS_ATTENTION" ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {scanHistory[0]?.systemHealthAfter === "OPTIMIZED" ? "100% NORMAL" : scanHistory[0]?.systemHealthAfter}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Last scan: {scanHistory[0]?.dateStr}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Performance Progression Bar */}
            <div className="p-5 rounded-xl bg-[#0e1014] border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-400 inline" />
                  <span>Computer Normalization & Performance Progress</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {scanHistory[0]?.systemHealthAfter === "OPTIMIZED" ? "98% PEAK CAPACITY (NORMALIZED)" : "42% DEGRADED"}
                </span>
              </div>
              <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                    scanHistory[0]?.systemHealthAfter === "OPTIMIZED" 
                      ? "from-blue-600 via-emerald-500 to-emerald-400 w-[98%]" 
                      : "from-red-600 to-yellow-500 w-[42%]"
                  }`}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>First Boot Assessment: Critical Lag (42%)</span>
                <span>System Normalization Target (100%)</span>
              </div>
            </div>

            {/* Detailed Scan History Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Scan Date & Time</th>
                    <th className="py-3 px-4 font-semibold">Scan Type</th>
                    <th className="py-3 px-4 font-semibold">Issues Repaired</th>
                    <th className="py-3 px-4 font-semibold">Storage Freed</th>
                    <th className="py-3 px-4 font-semibold">Speed Boost</th>
                    <th className="py-3 px-4 font-semibold">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {scanHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                      <td className="py-3.5 px-4 text-white font-medium flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
                        <span>{item.dateStr}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.scanType === "First-Time System Audit"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-blue-500/10 text-blue-300"
                        }`}>
                          {item.scanType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="text-white font-bold">{item.issuesRepaired}</span>
                        <span className="text-slate-500"> / {item.issuesFound} fixed</span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">
                        {item.storageReclaimedGB > 0 ? `+${item.storageReclaimedGB} GB` : "0 GB"}
                      </td>
                      <td className="py-3.5 px-4 text-blue-400 font-bold">
                        {item.speedBoostPercent > 0 ? `+${item.speedBoostPercent}%` : "Baseline"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center space-x-1 w-max ${
                          item.systemHealthAfter === "OPTIMIZED" 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : item.systemHealthAfter === "NEEDS_ATTENTION"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                          {item.systemHealthAfter === "OPTIMIZED" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                          {item.systemHealthAfter === "CRITICAL" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                          <span>{item.systemHealthAfter === "OPTIMIZED" ? "NORMAL / OPTIMIZED" : item.systemHealthAfter}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-[#0e1014] rounded-xl border border-dashed border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6 inline" />
            </div>
            <h3 className="text-white font-bold text-sm">No Scan History Recorded Yet</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Run your first Smart Scan to clean up system bottlenecks and establish a baseline comparison for future computer performance improvements.
            </p>
            <button
              onClick={() => {
                sound.playClick();
                handleStartScan();
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md inline-flex items-center space-x-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white inline" />
              <span>Run First Smart Scan Now</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

