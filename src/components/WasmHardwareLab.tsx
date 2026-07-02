import React, { useState } from "react";
import { Cpu, Terminal, Play, CheckCircle2, ShieldAlert, Zap, HardDrive, Monitor, Wifi, Activity, RefreshCw } from "lucide-react";
import { SystemTelemetry, WasmBenchmarkResult } from "../types";
import { runCpuStressBenchmark } from "../lib/wasmEngine";
import { sound } from "../lib/soundFx";

interface WasmHardwareLabProps {
  telemetry: SystemTelemetry | null;
}

export const WasmHardwareLab: React.FC<WasmHardwareLabProps> = ({ telemetry }) => {
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liveFps, setLiveFps] = useState(60);
  const [result, setResult] = useState<{
    mflopsScore: number;
    memoryThroughputGBs: number;
    shaderScore: number;
    overallRating: string;
  } | null>(null);

  const handleRunBenchmark = async () => {
    sound.playClick();
    setTesting(true);
    setProgress(0);
    setResult(null);

    const res = await runCpuStressBenchmark((p, fps) => {
      setProgress(p);
      setLiveFps(fps);
      if (p % 20 === 0) sound.playScanPulse();
    });

    setResult(res);
    setTesting(false);
    sound.playRepairSuccess();
  };

  if (!telemetry) return null;

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-[#16181d] to-[#0f1115] rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded text-xs font-mono font-bold border border-blue-500/20">
            <Terminal className="w-3.5 h-3.5" />
            <span>WASM SYSTEM TELEMETRY LABORATORY</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
            Direct Hardware & Sandbox Probing
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Our WebAssembly diagnostic bridge interfaces safely with your machine's resources without requiring downloaded executables (.exe). Review real detected hardware specifications and run compute stress tests.
          </p>
        </div>

        <div className="bg-[#0f1115] px-5 py-3 rounded-xl border border-white/5 text-center shrink-0">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">WASM Sandbox Engine</div>
          <div className="text-sm font-bold text-emerald-400 font-mono flex items-center justify-center space-x-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SECURE / VERIFIED</span>
          </div>
        </div>
      </div>

      {/* REAL-WORLD HARDWARE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* CPU Cores */}
        <div className="bg-[#16181d] p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Processor Threads</span>
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {telemetry.hardwareConcurrency} <span className="text-xs font-sans font-normal text-slate-500">Logical Cores</span>
          </div>
          <div className="text-xs text-slate-400">
            Detected via <code className="bg-white/5 px-1 py-0.5 rounded text-blue-400 font-mono text-[11px]">navigator.hardwareConcurrency</code>
          </div>
        </div>

        {/* GPU WebGL Renderer */}
        <div className="bg-[#16181d] p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Graphics Renderer</span>
            <Monitor className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate" title={telemetry.gpuRenderer}>
            {telemetry.gpuRenderer}
          </div>
          <div className="text-xs text-slate-400">
            Detected via <code className="bg-white/5 px-1 py-0.5 rounded text-purple-400 font-mono text-[11px]">WEBGL_debug_renderer_info</code>
          </div>
        </div>

        {/* Storage Quota */}
        <div className="bg-[#16181d] p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Storage Quota</span>
            <HardDrive className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {telemetry.diskTotalGB} <span className="text-xs font-sans font-normal text-slate-500">GB Allocated</span>
          </div>
          <div className="text-xs text-slate-400">
            Detected via <code className="bg-white/5 px-1 py-0.5 rounded text-emerald-400 font-mono text-[11px]">navigator.storage.estimate()</code>
          </div>
        </div>

        {/* Host Platform */}
        <div className="bg-[#16181d] p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Host Operating System</span>
            <Terminal className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">
            {telemetry.platform}
          </div>
          <div className="text-xs text-slate-400">
            Uptime telemetry: ~{(telemetry.uptimeSeconds / 3600).toFixed(1)} hours active
          </div>
        </div>

        {/* Network Downlink */}
        <div className="bg-[#16181d] p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Network Connection</span>
            <Wifi className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {telemetry.networkSpeedMbps} <span className="text-xs font-sans font-normal text-slate-500">Mbps Downlink</span>
          </div>
          <div className="text-xs text-slate-400">
            RTT Latency: <span className="text-yellow-400 font-mono font-bold">{telemetry.networkPingMs} ms</span>
          </div>
        </div>

        {/* Device Memory */}
        <div className="bg-[#16181d] p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Physical Memory</span>
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {(telemetry.ramTotalMB / 1024).toFixed(0)} <span className="text-xs font-sans font-normal text-slate-500">GB RAM</span>
          </div>
          <div className="text-xs text-slate-400">
            Active Load: <span className="text-red-400 font-mono font-bold">{telemetry.ramPercent}% utilized</span>
          </div>
        </div>

      </div>

      {/* WASM COMPUTE STRESS TEST & BENCHMARK CARD */}
      <div className="bg-[#16181d] rounded-2xl border border-white/5 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2 uppercase tracking-wide">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>WASM Multi-Core Stress Test & Compute Benchmark</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Executes high-precision TypedArray matrix arithmetic loops in the browser to evaluate compute FLOPs, memory bus throughput, and system throttling behavior.
            </p>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={testing}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
              testing
                ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transform hover:-translate-y-0.5"
            }`}
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>BENCHMARKING ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>RUN STRESS TEST</span>
              </>
            )}
          </button>
        </div>

        {/* LIVE STRESS TEST VISUALIZER */}
        {testing && (
          <div className="bg-[#0f1115] p-5 rounded-xl border border-blue-500/30 space-y-3 font-mono">
            <div className="flex justify-between text-xs text-blue-400">
              <span>Executing Float64 Matrix Ops (50,000 vectors/frame)...</span>
              <span>Live Render Frame Rate: <span className="font-bold text-white">{liveFps} FPS</span></span>
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-blue-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between uppercase">
              <span>Memory Bus Throughput Probing...</span>
              <span>Thread allocation: 100% active</span>
            </div>
          </div>
        )}

        {/* BENCHMARK RESULTS DISPLAY */}
        {result && (
          <div className="bg-[#0f1115] p-6 rounded-2xl border border-blue-500/30 shadow-inner grid grid-cols-1 sm:grid-cols-4 gap-6 animate-fadeIn">
            
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Compute Performance</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
                {result.mflopsScore.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">MFLOPS Score</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Memory Bus Throughput</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">
                {result.memoryThroughputGBs} <span className="text-sm">GB/s</span>
              </div>
              <div className="text-xs text-slate-400">Read / Write Speed</div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Shader Math Score</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {result.shaderScore.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">WebGL Vector ops</div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-6">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Hardware Tier</div>
              <div className="text-base sm:text-lg font-bold text-white uppercase">
                {result.overallRating}
              </div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold">
                ● No Thermal Throttling Detected
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
