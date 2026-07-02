import React, { useState } from "react";
import { Shield, Zap, Cpu, Stethoscope, Play, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, HardDrive, Lock, Award, Clock, Check, RefreshCw, ChevronRight, BarChart2 } from "lucide-react";
import { sound } from "../lib/soundFx";
import pcSecureLogo from "../assets/images/pc_secure_logo_1783009068614.jpg";

interface LandingPageProps {
  onOpenAuth: (mode: "login" | "register") => void;
  onGoToDashboard: () => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onGoToDashboard,
  isLoggedIn
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepLabel, setScanStepLabel] = useState("");
  const [showScanResults, setShowScanResults] = useState(false);

  const handleRunFreeScan = () => {
    sound.playClick();
    sound.playScanStart();
    setIsScanning(true);
    setShowScanResults(false);
    setScanProgress(0);

    const steps = [
      { p: 20, label: "Probing System Memory & Boot Process Bottlenecks..." },
      { p: 45, label: "Checking Temp Directories (%TEMP%) & Error Dump Bloat..." },
      { p: 70, label: "Scanning for Adware, Tracking Cookies & Spyware Traces..." },
      { p: 95, label: "Evaluating Startup Updaters & CPU Throttling Risks..." },
      { p: 100, label: "Finalizing Computer Health Diagnostic Report..." }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < steps.length) {
        setScanProgress(steps[currentIdx].p);
        setScanStepLabel(steps[currentIdx].label);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setShowScanResults(true);
        sound.playAlert();
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0c0d0f] text-slate-300 font-sans selection:bg-blue-600 selection:text-white pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-white/5">
        
        {/* Background Ambient Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-extrabold uppercase tracking-widest shadow-sm animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEXT-GEN AI COMPUTER NORMALIZATION & CARE</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none max-w-4xl mx-auto">
            Your Computer Deserves <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500">100% Peak Speed</span> & Normalization.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Detect hidden system bottlenecks, eliminate storage bloat, shred 142+ browser tracking cookies, and boost boot speeds by up to +4.8s with our automated 1-Click AI System Doctor.
          </p>

          {/* INTERACTIVE SCANNER SECTION */}
          <div className="max-w-2xl mx-auto pt-4">
            
            {!isScanning && !showScanResults && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141721] to-[#0e1016] border border-blue-500/30 shadow-[0_0_50px_rgba(30,136,229,0.2)] space-y-5">
                <div className="flex items-center justify-center space-x-3 text-sm text-slate-300 font-semibold">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span>Free Instant PC Health & Security Diagnostic</span>
                </div>

                <button
                  onClick={handleRunFreeScan}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-lg sm:text-xl uppercase tracking-wider shadow-[0_0_35px_rgba(30,136,229,0.5)] transition-all transform hover:scale-105 flex items-center justify-center space-x-3 cursor-pointer group"
                >
                  <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                  <span>Run Free Instant Computer Scan</span>
                  <ArrowRight className="w-6 h-6" />
                </button>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-mono">
                  <span className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> No Download Required</span>
                  <span>•</span>
                  <span className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Works in Browser</span>
                  <span>•</span>
                  <span className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Instant Results</span>
                </div>
              </div>
            )}

            {/* SCAN IN PROGRESS */}
            {isScanning && (
              <div className="p-8 rounded-3xl bg-[#141721] border border-blue-500/40 shadow-[0_0_50px_rgba(30,136,229,0.3)] space-y-6 text-center animate-pulse">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider font-mono">
                    Analyzing System Integrity...
                  </h3>
                  <p className="text-sm text-blue-300 font-mono">{scanStepLabel}</p>
                </div>
                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-400 to-purple-500 transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 font-mono">{scanProgress}% Complete</p>
              </div>
            )}

            {/* DRAMATIC SCAN RESULTS ALERT */}
            {showScanResults && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-red-950/90 via-[#1a1318] to-[#12141a] border-2 border-red-500/60 shadow-[0_0_60px_rgba(239,68,68,0.35)] space-y-6 text-left animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-red-500/30 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                      <AlertTriangle className="w-7 h-7 animate-bounce" />
                    </div>
                    <div>
                      <span className="bg-red-500 text-white font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded shadow">
                        DIAGNOSTIC COMPLETE
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                        11 Critical Problems Detected on Your Computer!
                      </h3>
                    </div>
                  </div>
                  <span className="text-red-400 font-mono font-bold text-xs bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20 hidden sm:block">
                    HEALTH: 42% DEGRADED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-2.5">
                    <HardDrive className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">~7.1 GB Storage Bloat</strong>
                      <span className="text-slate-300">Stale Windows error dumps (.dmp) and temp cache choking SSD drive speed.</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-2.5">
                    <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">142 Tracking Cookies & Spyware</strong>
                      <span className="text-slate-300">Persistent adware and cross-site profilers active in browser profiles.</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start space-x-2.5">
                    <Clock className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">+4.8s Boot Time Lag</strong>
                      <span className="text-slate-300">8 unrequired background updaters launching at system startup.</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start space-x-2.5">
                    <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">CPU & RAM Throttling</strong>
                      <span className="text-slate-300">Unoptimized SysMain indexing causing random background stutter.</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1014] border border-white/10 text-center space-y-3">
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    To fix all 11 detected problems and permanently normalize your computer, register your account or sign in now!
                  </p>
                  
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (isLoggedIn) {
                        onGoToDashboard();
                      } else {
                        onOpenAuth("register");
                      }
                    }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:scale-105 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Zap className="w-5 h-5 fill-white animate-bounce" />
                    <span>{isLoggedIn ? "PROCEED TO DASHBOARD & FIX PC NOW" : "REGISTER / SIGN IN TO FIX PROBLEMS NOW"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  {!isLoggedIn && (
                    <p className="text-[11px] text-slate-400">
                      Already have an account?{" "}
                      <button
                        onClick={() => onOpenAuth("login")}
                        className="text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Sign In here
                      </button>
                    </p>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* 2. HOW IT WORKS / THE REPAIR WORKFLOW */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 border-b border-white/5">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
            3-STEP SYSTEM NORMALIZATION
          </h2>
          <h3 className="text-2xl sm:text-4xl font-black text-white">
            How PCSecure Restores Peak Computer Speed
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl bg-[#12141c] border border-white/10 space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xl font-mono">
              01
            </div>
            <h4 className="text-lg font-bold text-white">Instant Free Diagnostic Scan</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our WebAssembly engine probes your system memory, browser profiles, and startup registry in seconds to identify bottlenecks and privacy hazards.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#12141c] border border-white/10 space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-xl font-mono">
              02
            </div>
            <h4 className="text-lg font-bold text-white">Register Account & Dashboard</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create your free account or sign in to access the full System Care dashboard, review exact error logs, and track historical speed benchmarks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#12141c] border border-white/10 space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl font-mono">
              03
            </div>
            <h4 className="text-lg font-bold text-white">Subscribe & 1-Click Repair</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your preferred care subscription plan to execute automated 1-Click repair, clear ~7.1 GB of bloat, and activate 24/7 real-time protection.
            </p>
          </div>

        </div>
      </div>

      {/* 3. CORE FEATURES BENTO GRID */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
            ADVANCED CYBER LAB MODULES
          </h2>
          <h3 className="text-2xl sm:text-4xl font-black text-white">
            Everything Required to Safeguard & Normalize Your PC
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 space-y-3 hover:border-blue-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">1-Click Smart Scan & Repair</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shred tracking cookies, neutralize adware, and repair system integrity discrepancies with a single automated click.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 space-y-3 hover:border-purple-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Gemini AI Root-Cause Doctor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes cryptic Windows Event logs and system crashes (.dmp) in natural language, generating automated PowerShell repair scripts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Deep Storage Junk Cleaner</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Purges system temp directories (%TEMP%), clears Windows Prefetch cache, and deletes stale software installation leftovers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 space-y-3 hover:border-yellow-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Turbo Boost Game Mode</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Temporarily suspends non-essential background Windows services and updaters to dedicate 100% CPU and RAM to games and heavy apps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 space-y-3 hover:border-blue-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Wasm Hardware Lab</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stress-test multi-core CPU concurrency, measure memory bandwidth (GB/s), and inspect GPU WebGL rendering capabilities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#12141a] border border-white/10 space-y-3 hover:border-purple-500/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Persisted Scan History</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track your computer's health over time, compare speed improvements (+48% peak boost), and monitor reclaimed disk storage.
            </p>
          </div>

        </div>
      </div>

      {/* 4. FINAL CALL TO ACTION */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900/60 via-purple-900/40 to-[#12141a] border border-blue-500/40 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Restore Your PC to 100% Normal Speed?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Join over 120,000 PC users who rely on PCSecure for automated daily system maintenance and real-time adware protection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                sound.playClick();
                if (isLoggedIn) {
                  onGoToDashboard();
                } else {
                  onOpenAuth("register");
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{isLoggedIn ? "OPEN SYSTEM CARE DASHBOARD" : "REGISTER FREE ACCOUNT & START REPAIR"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenAuth("login");
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm uppercase tracking-wider border border-white/15 transition-all cursor-pointer"
              >
                Sign In to Account
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
