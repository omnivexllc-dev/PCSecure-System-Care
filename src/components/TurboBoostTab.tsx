import React, { useState } from "react";
import { Zap, Cpu, Stethoscope, Check, AlertCircle, Power, Strikethrough, RefreshCw } from "lucide-react";
import { StartupItem, SystemTelemetry } from "../types";
import { sound } from "../lib/soundFx";

interface TurboBoostTabProps {
  turboActive: boolean;
  setTurboActive: React.Dispatch<React.SetStateAction<boolean>>;
  startupItems: StartupItem[];
  setStartupItems: React.Dispatch<React.SetStateAction<StartupItem[]>>;
  telemetry: SystemTelemetry | null;
}

export const TurboBoostTab: React.FC<TurboBoostTabProps> = ({
  turboActive,
  setTurboActive,
  startupItems,
  setStartupItems,
  telemetry
}) => {
  const [reclaiming, setReclaiming] = useState(false);
  const [freedMB, setFreedMB] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<"turbo" | "startup">("turbo");

  const handleToggleTurbo = () => {
    const next = !turboActive;
    sound.playClick();
    if (next) {
      setReclaiming(true);
      sound.playTurboBoost();
      setTimeout(() => {
        setReclaiming(false);
        setFreedMB(Math.round(840 + Math.random() * 420));
        setTurboActive(true);
      }, 900);
    } else {
      setTurboActive(false);
      setFreedMB(0);
    }
  };

  const handleToggleStartup = (id: string) => {
    sound.playClick();
    setStartupItems(prev => prev.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item));
  };

  const enabledCount = startupItems.filter(i => i.enabled).length;
  const highImpactCount = startupItems.filter(i => i.enabled && i.impact === "High").length;
  const totalDelaySec = (startupItems.filter(i => i.enabled).reduce((acc, curr) => acc + curr.delayMs, 0) / 1000).toFixed(1);

  return (
    <div className="space-y-6 pb-12">
      
      {/* SUB-NAV HEADER */}
      <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
        <button
          onClick={() => { sound.playClick(); setActiveSubTab("turbo"); }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 ${
            activeSubTab === "turbo"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
              : "bg-[#16181d] text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <Zap className="w-4 h-4 text-blue-400" />
          <span>1-Click Turbo Boost</span>
          {turboActive && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
              ON
            </span>
          )}
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab("startup"); }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 ${
            activeSubTab === "startup"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
              : "bg-[#16181d] text-slate-400 hover:text-white border border-white/5"
          }`}
        >
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Startup Optimizer ({enabledCount} active)</span>
          {highImpactCount > 0 && (
            <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold">
              {highImpactCount} High
            </span>
          )}
        </button>
      </div>

      {activeSubTab === "turbo" ? (
        <div className="space-y-6">
          
          {/* TURBO BOOST MAIN BANNER */}
          <div className="relative bg-gradient-to-br from-[#16181d] to-[#0f1115] rounded-2xl p-8 border border-white/5 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute -right-24 -top-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded text-xs font-mono font-bold border border-blue-500/20">
                <Zap className="w-3.5 h-3.5 fill-blue-400" />
                <span>REAL-TIME PERFORMANCE OVERDRIVE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
                Unleash Maximum Processing Speed
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Turbo Mode optimizes your system resources in real time. It temporarily pauses background updaters, stops non-essential telemetry services, unparks CPU threads, and switches power management to Ultimate Performance for maximum responsiveness in heavy IDEs, rendering tasks, and gaming.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Stops 14 background updaters</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlocks 100% CPU Turbo Boost</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Compacts Standby RAM pagefile</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prioritizes active foreground app</span>
                </div>
              </div>
            </div>

            {/* BIG TURBO SWITCH */}
            <div className="flex flex-col items-center justify-center shrink-0 bg-[#0f1115] p-6 rounded-2xl border border-white/5 shadow-inner w-full md:w-64 text-center">
              <div className="relative mb-4">
                <button
                  onClick={handleToggleTurbo}
                  disabled={reclaiming}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl border-4 ${
                    reclaiming
                      ? "bg-blue-500/20 border-blue-400 animate-spin"
                      : turboActive
                      ? "bg-blue-600 border-blue-400 shadow-[0_0_40px_rgba(37,99,235,0.4)] scale-105"
                      : "bg-[#16181d] hover:bg-white/5 border-white/10 hover:border-blue-500/50 text-slate-400"
                  }`}
                >
                  <Power className={`w-10 h-10 ${turboActive ? "text-white" : "text-slate-400"}`} />
                  <span className={`text-[10px] font-bold mt-1 uppercase font-mono ${turboActive ? "text-white" : "text-slate-400"}`}>
                    {reclaiming ? "ENABLING..." : turboActive ? "TURBO ON" : "TURN ON"}
                  </span>
                </button>
              </div>

              <div className="text-xs font-mono uppercase font-bold">
                {reclaiming ? (
                  <span className="text-yellow-400 animate-pulse">Reclaiming idle memory...</span>
                ) : turboActive ? (
                  <span className="text-emerald-400">⚡ OVERDRIVE ENGAGED</span>
                ) : (
                  <span className="text-slate-500">Click to boost PC speed</span>
                )}
              </div>

              {turboActive && freedMB > 0 && (
                <div className="mt-3 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-bold border border-emerald-500/30">
                  +{freedMB} MB RAM Freed
                </div>
              )}
            </div>
          </div>

          {/* TURBO PRESETS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#16181d] p-5 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm uppercase tracking-wide">Workstation & Coding Mode</span>
                <span className="text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase">RECOMMENDED</span>
              </div>
              <p className="text-xs text-slate-400">
                Prioritizes Node.js, Docker, IDEs, and compile tools. Stops media updaters and pauses Windows Search indexing.
              </p>
            </div>

            <div className="bg-[#16181d] p-5 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm uppercase tracking-wide">Extreme Gaming Overdrive</span>
                <span className="text-[9px] font-mono font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded uppercase">ULTIMATE</span>
              </div>
              <p className="text-xs text-slate-400">
                Disables all non-critical background services, unparks all CPU cores, sets GPU scheduler priority to High, and clears network buffers.
              </p>
            </div>

            <div className="bg-[#16181d] p-5 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm uppercase tracking-wide">Eco Battery Saver</span>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase">LOW POWER</span>
              </div>
              <p className="text-xs text-slate-400">
                Underclocks idle CPU cores, limits browser background tab rendering to 15 FPS, and extends laptop battery life by ~35%.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* STARTUP OPTIMIZER SUB-TAB */
        <div className="space-y-6">
          <div className="bg-[#16181d] p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">System Boot & Startup Optimizer</h3>
              <p className="text-xs text-slate-400 mt-1">
                Disabling high-impact startup items will reduce your OS boot latency by approximately <span className="text-emerald-400 font-bold">{totalDelaySec} seconds</span> and save idle RAM.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono font-bold uppercase">
              <span className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded border border-red-500/20">
                High Impact: {highImpactCount}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded border border-emerald-500/20">
                Disabled: {startupItems.length - enabledCount}
              </span>
            </div>
          </div>

          {/* STARTUP TABLE */}
          <div className="bg-[#16181d] rounded-2xl border border-white/5 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0f1115] border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase font-bold">
                    <th className="py-3.5 px-4">Application / Service</th>
                    <th className="py-3.5 px-4">Publisher</th>
                    <th className="py-3.5 px-4">Boot Impact</th>
                    <th className="py-3.5 px-4">Boot Delay</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {startupItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-xs uppercase tracking-wide">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{item.path}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">{item.publisher}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          item.impact === "High" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                          item.impact === "Medium" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>
                          {item.impact}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                        +{(item.delayMs / 1000).toFixed(2)}s
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStartup(item.id)}
                          className={`px-3.5 py-1.5 rounded text-[10px] font-bold font-mono transition-all cursor-pointer uppercase tracking-wider ${
                            item.enabled
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {item.enabled ? "ENABLED" : "DISABLED"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
