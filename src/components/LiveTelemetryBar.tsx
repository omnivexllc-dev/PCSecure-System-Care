import React from "react";
import { Cpu, HardDrive, Wifi, BatteryCharging, Zap, Activity, ShieldCheck, Thermometer } from "lucide-react";
import { SystemTelemetry } from "../types";

interface LiveTelemetryBarProps {
  telemetry: SystemTelemetry | null;
  turboActive: boolean;
}

interface MetricTooltipProps {
  title: string;
  metric: string;
  description: string;
  impact: string;
  align?: "left" | "center" | "right";
  children: React.ReactNode;
}

const MetricTooltip: React.FC<MetricTooltipProps> = ({
  title,
  metric,
  description,
  impact,
  align = "left",
  children
}) => {
  const alignClass =
    align === "right"
      ? "right-0 left-auto"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0";

  const arrowClass =
    align === "right"
      ? "right-6 left-auto"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-6";

  return (
    <div className="group relative flex items-center cursor-help">
      {children}

      {/* Floating Interactive Tooltip */}
      <div
        className={`absolute top-full ${alignClass} mt-2.5 w-64 sm:w-72 p-3.5 bg-[#0f1115]/95 backdrop-blur-xl rounded-xl border border-blue-500/30 shadow-2xl shadow-black/80 text-left pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {title}
          </span>
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-semibold uppercase shrink-0 ml-2">
            {metric}
          </span>
        </div>

        <p className="text-slate-300 text-[11px] leading-relaxed mb-2.5 font-sans font-normal">
          {description}
        </p>

        <div className="flex items-start space-x-2 bg-white/5 p-2 rounded-lg border border-white/5">
          <span className="text-yellow-400 font-bold text-[10px] uppercase font-mono shrink-0 mt-0.5">
            Performance Impact:
          </span>
          <span className="text-slate-400 text-[10px] font-mono leading-tight">
            {impact}
          </span>
        </div>

        {/* Subtle top indicator arrow */}
        <div
          className={`absolute -top-1.5 ${arrowClass} w-3 h-3 bg-[#0f1115] border-t border-l border-blue-500/30 transform rotate-45`}
        />
      </div>
    </div>
  );
};

export const LiveTelemetryBar: React.FC<LiveTelemetryBarProps> = ({ telemetry, turboActive }) => {
  if (!telemetry) return null;

  const ramGB = (telemetry.ramUsageMB / 1024).toFixed(1);
  const totalRamGB = (telemetry.ramTotalMB / 1024).toFixed(0);

  return (
    <div className="relative z-40 bg-[#16181d] border-b border-white/5 py-2.5 px-4 shadow-inner text-xs font-mono text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        
        {/* CPU Meter */}
        <MetricTooltip
          title="CPU Load & Threads"
          metric={`${telemetry.cpuUsage}% (${telemetry.hardwareConcurrency} Cores)`}
          description="Monitors active processor execution threads across all hardware cores in real time via WebAssembly worker pools."
          impact="Sustained load above 80% causes frame stutter, increased thermal dissipation, and slower application response times."
          align="left"
        >
          <div className="flex items-center space-x-2 bg-[#0f1115] group-hover:bg-white/10 px-3 py-1.5 rounded border border-white/5 group-hover:border-blue-500/40 transition-all">
            <Cpu className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="text-slate-500 uppercase text-[10px]">CPU:</span>
            <span className={`font-bold ${telemetry.cpuUsage > 75 ? "text-red-400" : telemetry.cpuUsage > 45 ? "text-yellow-400" : "text-white"}`}>
              {telemetry.cpuUsage}%
            </span>
            <div className="w-12 bg-white/5 h-1.5 rounded-full overflow-hidden hidden sm:block">
              <div 
                className={`h-full transition-all duration-300 ${telemetry.cpuUsage > 75 ? "bg-red-500" : telemetry.cpuUsage > 45 ? "bg-yellow-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(100, telemetry.cpuUsage)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500">({telemetry.hardwareConcurrency} Cores)</span>
          </div>
        </MetricTooltip>

        {/* RAM Meter */}
        <MetricTooltip
          title="Physical RAM Allocation"
          metric={`${ramGB} / ${totalRamGB} GB (${telemetry.ramPercent}%)`}
          description="Measures active system memory currently consumed by active application tables, background services, and cached OS buffers."
          impact="Exceeding 85% RAM forces OS pagefile swapping to disk, causing severe multitasking lag and disk thrashing."
          align="left"
        >
          <div className="flex items-center space-x-2 bg-[#0f1115] group-hover:bg-white/10 px-3 py-1.5 rounded border border-white/5 group-hover:border-blue-500/40 transition-all">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500 uppercase text-[10px]">RAM:</span>
            <span className={`font-bold ${telemetry.ramPercent > 80 ? "text-red-400" : "text-emerald-400"}`}>
              {ramGB} GB / {totalRamGB} GB ({telemetry.ramPercent}%)
            </span>
            <div className="w-12 bg-white/5 h-1.5 rounded-full overflow-hidden hidden sm:block">
              <div 
                className={`h-full transition-all duration-300 ${telemetry.ramPercent > 80 ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(100, telemetry.ramPercent)}%` }}
              />
            </div>
          </div>
        </MetricTooltip>

        {/* Storage Meter */}
        <MetricTooltip
          title="SSD / Disk Headroom"
          metric={`${telemetry.diskFreeGB} GB Free / ${telemetry.diskTotalGB} GB Total`}
          description="Monitors available non-volatile storage volume capacity available for temporary swap files, application caches, and updates."
          impact="Maintaining under 15% free disk capacity degrades SSD wear-leveling and slows down read/write IOPS by up to 40%."
          align="center"
        >
          <div className="flex items-center space-x-2 bg-[#0f1115] group-hover:bg-white/10 px-3 py-1.5 rounded border border-white/5 group-hover:border-blue-500/40 transition-all">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-500 uppercase text-[10px]">DISK FREE:</span>
            <span className="font-bold text-white">{telemetry.diskFreeGB} GB</span>
            <span className="text-[10px] text-slate-500">/ {telemetry.diskTotalGB} GB</span>
          </div>
        </MetricTooltip>

        {/* Network & Ping */}
        <MetricTooltip
          title="Network Latency & Speed"
          metric={`${telemetry.networkPingMs} ms RTT | ${telemetry.networkSpeedMbps} Mbps`}
          description="Measures packet round-trip time to primary gateway and active downlink bandwidth capacity for cloud synchronization."
          impact="Ping spikes above 50ms or packet loss cause lag in real-time gaming, VoIP calls, and collaborative cloud IDE syncing."
          align="center"
        >
          <div className="flex items-center space-x-2 bg-[#0f1115] group-hover:bg-white/10 px-3 py-1.5 rounded border border-white/5 group-hover:border-blue-500/40 transition-all">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500 uppercase text-[10px]">PING:</span>
            <span className={`font-bold ${telemetry.networkPingMs > 50 ? "text-yellow-400" : "text-white"}`}>
              {telemetry.networkPingMs} ms
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">{telemetry.networkSpeedMbps} Mbps</span>
          </div>
        </MetricTooltip>

        {/* Thermal & Battery */}
        <div className="flex items-center space-x-3">
          <MetricTooltip
            title="CPU Core Temperature"
            metric={`${telemetry.cpuTempC}°C`}
            description="Estimated internal processor die temperature during active compute workloads and WebAssembly execution."
            impact="Temperatures above 85°C trigger hardware thermal throttling, automatically dropping CPU clock speeds to prevent silicon damage."
            align="right"
          >
            <div className="flex items-center space-x-1 text-slate-400 bg-[#0f1115] group-hover:bg-white/10 px-2.5 py-1.5 rounded border border-white/5 group-hover:border-blue-500/40 transition-all">
              <Thermometer className="w-3.5 h-3.5 text-yellow-400" />
              <span>{telemetry.cpuTempC}°C</span>
            </div>
          </MetricTooltip>

          {telemetry.batteryPercent !== null && (
            <MetricTooltip
              title="Battery & Power Delivery"
              metric={`${telemetry.batteryPercent}% (${telemetry.isCharging ? "Charging" : "Unplugged"})`}
              description="Monitors power delivery state and remaining battery capacity. Eco-mode throttles background rendering to conserve energy."
              impact="Background resource hogs drain battery life up to 3x faster when unplugged from AC power."
              align="right"
            >
              <div className="flex items-center space-x-1 text-slate-400 bg-[#0f1115] group-hover:bg-white/10 px-2.5 py-1.5 rounded border border-white/5 group-hover:border-blue-500/40 transition-all">
                <BatteryCharging className={`w-3.5 h-3.5 ${telemetry.isCharging ? "text-emerald-400 animate-pulse" : "text-blue-400"}`} />
                <span>{telemetry.batteryPercent}%</span>
              </div>
            </MetricTooltip>
          )}

          {/* Turbo Mode Indicator */}
          <MetricTooltip
            title="Real-Time System Guard"
            metric={turboActive ? "Turbo Boost Overdrive" : "Standard Active Guard"}
            description="Active kernel-level guard monitoring background processes, preventing memory leaks, and shielding against resource hijacking."
            impact={turboActive ? "All non-essential background updaters paused. 100% CPU priority granted to active foreground application." : "Standard protection enabled. Click Turbo Boost to unlock extreme workstation performance."}
            align="right"
          >
            {turboActive ? (
              <div className="flex items-center space-x-1.5 bg-blue-600/20 group-hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 group-hover:border-blue-500/60 px-3 py-1 rounded font-sans text-xs animate-pulse font-semibold transition-all">
                <Zap className="w-3 h-3 text-blue-400 fill-blue-400" />
                <span>TURBO BOOST ON</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-slate-500 group-hover:text-slate-300 text-[11px] font-sans bg-[#0f1115] group-hover:bg-white/10 px-2.5 py-1.5 rounded border border-white/5 group-hover:border-blue-500/40 transition-all">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Real-Time Guard: Active</span>
              </div>
            )}
          </MetricTooltip>
        </div>

      </div>
    </div>
  );
};

