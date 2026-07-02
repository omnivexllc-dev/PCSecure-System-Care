/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LiveTelemetryBar } from "./components/LiveTelemetryBar";
import { SmartScanDashboard } from "./components/SmartScanDashboard";
import { TurboBoostTab } from "./components/TurboBoostTab";
import { WasmHardwareLab } from "./components/WasmHardwareLab";
import { ProcessMonitorTab } from "./components/ProcessMonitorTab";
import { AiSystemDoctorTab } from "./components/AiSystemDoctorTab";
import { 
  SystemTelemetry, 
  ScanFinding, 
  ProcessItem, 
  StartupItem 
} from "./types";
import { 
  probeSystemTelemetry, 
  generateDiagnosticFindings, 
  getInitialProcesses, 
  getInitialStartupItems,
  detectHostOS 
} from "./lib/wasmEngine";
import { sound } from "./lib/soundFx";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("scan");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [turboActive, setTurboActive] = useState<boolean>(false);
  const [hostOS] = useState<string>(detectHostOS());

  // Core data states
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [findings, setFindings] = useState<ScanFinding[]>([]);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [startupItems, setStartupItems] = useState<StartupItem[]>([]);

  // Initialize telemetry and findings on mount
  useEffect(() => {
    // Initial data load
    const initData = async () => {
      const tel = await probeSystemTelemetry();
      setTelemetry(tel);
      setFindings(generateDiagnosticFindings(tel.platform));
      setProcesses(getInitialProcesses());
      setStartupItems(getInitialStartupItems());
    };
    initData();

    // Periodic telemetry probe
    const interval = setInterval(async () => {
      const updatedTel = await probeSystemTelemetry();
      setTelemetry(prev => {
        if (!prev) return updatedTel;
        // Keep some continuity
        return {
          ...updatedTel,
          cpuUsage: turboActive 
            ? Math.max(5, Math.min(35, Math.round(prev.cpuUsage * 0.8 + (Math.random() * 8 - 4))))
            : Math.max(10, Math.min(85, Math.round(prev.cpuUsage + (Math.random() * 12 - 6)))),
          ramPercent: turboActive
            ? Math.max(30, Math.min(65, prev.ramPercent - 1))
            : prev.ramPercent
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [turboActive]);

  return (
    <div className="min-h-screen bg-[#0c0d0f] text-slate-400 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
      
      {/* 1. TOP NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        turboActive={turboActive}
        hostOS={hostOS}
      />

      {/* 2. LIVE SYSTEM TELEMETRY HEADER */}
      <LiveTelemetryBar
        telemetry={telemetry}
        turboActive={turboActive}
      />

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-grow">
        
        {activeTab === "scan" && (
          <SmartScanDashboard
            findings={findings}
            setFindings={setFindings}
            telemetry={telemetry}
            onJumpToAi={() => {
              sound.playClick();
              setActiveTab("ai");
            }}
            onTriggerTurbo={() => {
              setTurboActive(true);
              sound.playTurboBoost();
            }}
          />
        )}

        {activeTab === "turbo" && (
          <TurboBoostTab
            turboActive={turboActive}
            setTurboActive={setTurboActive}
            startupItems={startupItems}
            setStartupItems={setStartupItems}
            telemetry={telemetry}
          />
        )}

        {activeTab === "lab" && (
          <WasmHardwareLab
            telemetry={telemetry}
          />
        )}

        {activeTab === "monitor" && (
          <ProcessMonitorTab
            processes={processes}
            setProcesses={setProcesses}
            telemetry={telemetry}
          />
        )}

        {activeTab === "ai" && (
          <AiSystemDoctorTab
            findings={findings}
            telemetry={telemetry}
          />
        )}

      </main>

      {/* 4. BENTO GRID FOOTER RAIL */}
      <footer className="border-t border-white/5 bg-[#0c0d0f] mt-12 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-600 uppercase">
          <div className="flex flex-wrap items-center gap-4">
            <span>IP: 127.0.0.1 (WASM LOCAL)</span>
            <span>GATEWAY: CONNECTED</span>
            <span>SECURE_BOOT: ENABLED</span>
            <span className="text-blue-500 font-bold">AUTO-PROTECT ACTIVE</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>AI Root-Cause: <span className="text-blue-400 font-semibold">Gemini 3.5 Flash</span></span>
            <span>•</span>
            <span>© 2026 PCSECURE — SYSTEM CARE CORE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
