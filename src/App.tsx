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
import { LandingPage } from "./components/LandingPage";
import { AuthModal } from "./components/AuthModal";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { 
  SystemTelemetry, 
  ScanFinding, 
  ProcessItem, 
  StartupItem,
  UserAccount
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
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [turboActive, setTurboActive] = useState<boolean>(false);
  const [hostOS] = useState<string>(detectHostOS());

  // User Account & Subscription state
  const [user, setUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem("pcsecure_user_account");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [pendingRepairCallback, setPendingRepairCallback] = useState<(() => void) | null>(null);

  // Core data states
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [findings, setFindings] = useState<ScanFinding[]>([]);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [startupItems, setStartupItems] = useState<StartupItem[]>([]);

  // Initialize telemetry and findings on mount
  useEffect(() => {
    const initData = async () => {
      const tel = await probeSystemTelemetry();
      setTelemetry(tel);
      setFindings(generateDiagnosticFindings(tel.platform));
      setProcesses(getInitialProcesses());
      setStartupItems(getInitialStartupItems());
    };
    initData();

    const interval = setInterval(async () => {
      const updatedTel = await probeSystemTelemetry();
      setTelemetry(prev => {
        if (!prev) return updatedTel;
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

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    sound.playClick();
    localStorage.removeItem("pcsecure_user_account");
    setUser(null);
    setActiveTab("landing");
  };

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
        user={user}
        onOpenAuth={handleOpenAuth}
        onOpenSubscription={() => setSubscriptionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. LIVE SYSTEM TELEMETRY HEADER */}
      {activeTab !== "landing" && (
        <LiveTelemetryBar
          telemetry={telemetry}
          turboActive={turboActive}
        />
      )}

      {/* 3. MAIN CONTENT AREA */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-grow">
        
        {activeTab === "landing" && (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onGoToDashboard={() => setActiveTab("scan")}
            isLoggedIn={!!(user && user.isLoggedIn)}
          />
        )}

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
            user={user}
            onRequireAuth={() => handleOpenAuth("register")}
            onRequireSubscription={(onSuccess) => {
              setPendingRepairCallback(() => onSuccess);
              setSubscriptionModalOpen(true);
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

      {/* 4. MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          if (activeTab === "landing") {
            setActiveTab("scan");
          }
        }}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        user={user}
        onSubscribeSuccess={(updatedUser) => {
          setUser(updatedUser);
          if (pendingRepairCallback) {
            setTimeout(() => {
              pendingRepairCallback();
              setPendingRepairCallback(null);
            }, 300);
          }
        }}
      />

      {/* 5. BENTO GRID FOOTER RAIL */}
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
