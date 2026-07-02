import React, { useState, useEffect } from "react";
import { Activity, Cpu, AlertTriangle, XCircle, Zap, ShieldAlert, RefreshCw, Layers } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ProcessItem, SystemTelemetry } from "../types";
import { sound } from "../lib/soundFx";

interface ProcessMonitorTabProps {
  processes: ProcessItem[];
  setProcesses: React.Dispatch<React.SetStateAction<ProcessItem[]>>;
  telemetry: SystemTelemetry | null;
}

export const ProcessMonitorTab: React.FC<ProcessMonitorTabProps> = ({
  processes,
  setProcesses,
  telemetry
}) => {
  const [chartData, setChartData] = useState<{ time: string; cpu: number; ram: number }[]>([]);

  // Initialize and update chart data every second
  useEffect(() => {
    const initData = [];
    const now = new Date();
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 1000);
      initData.push({
        time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        cpu: Math.round(20 + Math.random() * 20),
        ram: Math.round(45 + Math.random() * 10)
      });
    }
    setChartData(initData);

    const interval = setInterval(() => {
      const t = new Date();
      const timeStr = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const currentCpu = telemetry ? telemetry.cpuUsage : Math.round(20 + Math.random() * 25);
      const currentRam = telemetry ? telemetry.ramPercent : Math.round(50 + Math.random() * 8);

      setChartData(prev => {
        const next = [...prev.slice(1), { time: timeStr, cpu: currentCpu, ram: currentRam }];
        return next;
      });

      // Also slightly fluctuate process CPU load to make it feel alive
      setProcesses(prev => prev.map(p => {
        if (p.status === "terminated") return p;
        let delta = (Math.random() - 0.5) * 1.5;
        if (p.status === "throttled") delta = Math.min(0, delta);
        let newCpu = +(Math.max(0.2, p.cpuPercent + delta)).toFixed(1);
        if (p.status === "throttled" && newCpu > 2.0) newCpu = 1.2;
        return { ...p, cpuPercent: newCpu };
      }));
    }, 1200);

    return () => clearInterval(interval);
  }, [telemetry]);

  const handleEndProcess = (id: string, name: string) => {
    if (name.includes("ntoskrnl") || name.includes("Windows Defender") || name.includes("dwm.exe")) {
      sound.playAlert();
      alert(`Safety Shield: Cannot terminate core Windows OS kernel service (${name}).`);
      return;
    }
    sound.playClick();
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, status: "terminated", cpuPercent: 0, memoryMB: 0 } : p));
  };

  const handleThrottleProcess = (id: string) => {
    sound.playClick();
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "throttled" ? "normal" : "throttled", cpuPercent: +(p.cpuPercent * 0.4).toFixed(1) } : p));
  };

  const activeProcesses = processes.filter(p => p.status !== "terminated");
  const totalProcessRam = activeProcesses.reduce((acc, curr) => acc + curr.memoryMB, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2 uppercase tracking-wide">
            <Activity className="w-6 h-6 text-blue-400" />
            <span>Real-Time Telemetry & Process Manager</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live stream of CPU & RAM utilization. Inspect background threads and terminate resource hogs.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono font-bold uppercase">
          <div className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded border border-blue-500/20">
            Active Processes: <span className="font-bold">{activeProcesses.length}</span>
          </div>
          <div className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded border border-purple-500/20">
            Total Allocated: <span className="font-bold">{(totalProcessRam / 1024).toFixed(2)} GB</span>
          </div>
        </div>
      </div>

      {/* RECHARTS LIVE GRAPH */}
      <div className="bg-[#16181d] rounded-2xl p-6 border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-white text-xs uppercase font-mono tracking-wider">Live Utilization Stream (1s Interval)</span>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono uppercase font-bold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-blue-400 inline-block" />
              <span className="text-slate-300">CPU Load (%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-purple-400 inline-block" />
              <span className="text-slate-300">RAM Usage (%)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tick={{ fill: "#64748B" }} />
              <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} unit="%" tick={{ fill: "#64748B" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f1115", borderColor: "#334155", borderRadius: "0.5rem", fontSize: "12px", fontFamily: "monospace" }}
                labelStyle={{ color: "#94A3B8" }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU Load" />
              <Area type="monotone" dataKey="ram" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" name="RAM Usage" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PROCESS TABLE */}
      <div className="bg-[#16181d] rounded-2xl border border-white/5 overflow-hidden shadow-lg">
        <div className="p-4 bg-[#0f1115] border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Active System Process Inspector</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Sort by CPU / Memory utilization</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f1115]/60 border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase font-bold">
                <th className="py-3.5 px-4">Process Name & PID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">CPU (%)</th>
                <th className="py-3.5 px-4">Memory</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {processes.map((proc) => {
                const isTerminated = proc.status === "terminated";
                const isThrottled = proc.status === "throttled";
                const isSystem = proc.category === "System";

                if (isTerminated) {
                  return (
                    <tr key={proc.id} className="bg-black/30 opacity-40">
                      <td className="py-3 px-4 font-mono text-xs text-slate-600 line-through">
                        {proc.name} (PID: {proc.pid})
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{proc.category}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">0.0%</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">0 MB</td>
                      <td className="py-3 px-4 text-right text-[10px] font-mono font-bold text-red-500 uppercase">
                        TERMINATED
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={proc.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-xs uppercase tracking-wide flex items-center space-x-2">
                        <span>{proc.name}</span>
                        {proc.isHighImpact && (
                          <span className="text-[9px] font-mono font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30 uppercase">
                            HIGH I/O
                          </span>
                        )}
                        {isThrottled && (
                          <span className="text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase">
                            THROTTLED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">PID: {proc.pid}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                        isSystem ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        proc.category === "Browser" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-white/5 text-slate-400 border border-white/5"
                      }`}>
                        {proc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-bold ${proc.cpuPercent > 5 ? "text-yellow-400" : "text-blue-400"}`}>
                        {proc.cpuPercent}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {proc.memoryMB} MB
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {!isSystem && (
                        <button
                          onClick={() => handleThrottleProcess(proc.id)}
                          title="Throttle CPU Priority"
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isThrottled 
                              ? "bg-blue-600/30 text-blue-300 border border-blue-500" 
                              : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                          }`}
                        >
                          {isThrottled ? "Unthrottle" : "Throttle"}
                        </button>
                      )}

                      <button
                        onClick={() => handleEndProcess(proc.id, proc.name)}
                        title={isSystem ? "Protected System Service" : "End Process"}
                        className={`px-3 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wider transition-all ${
                          isSystem 
                            ? "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed" 
                            : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 cursor-pointer"
                        }`}
                      >
                        {isSystem ? "Protected" : "End Task"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
