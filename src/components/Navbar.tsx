import React from "react";
import { Shield, Zap, Cpu, Activity, Stethoscope, Volume2, VolumeX, Sparkles, Terminal, User, LogIn, LogOut, Award, Home } from "lucide-react";
import { sound } from "../lib/soundFx";
import { UserAccount } from "../types";
import pcSecureLogo from "../assets/images/pc_secure_logo_1783009068614.jpg";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  turboActive: boolean;
  hostOS: string;
  user?: UserAccount | null;
  onOpenAuth?: (mode: "login" | "register") => void;
  onOpenSubscription?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  turboActive,
  hostOS,
  user,
  onOpenAuth,
  onOpenSubscription,
  onLogout
}) => {
  const tabs = [
    { id: "landing", label: "Home", icon: Home },
    { id: "scan", label: "Smart Scan & Repair", icon: Shield, badge: "1-Click" },
    { id: "turbo", label: "Turbo Boost & Startup", icon: Zap, badge: turboActive ? "ACTIVE" : undefined },
    { id: "lab", label: "WASM Hardware Lab", icon: Cpu },
    { id: "monitor", label: "Real-Time Monitor", icon: Activity },
    { id: "ai", label: "AI System Doctor", icon: Stethoscope, badge: "Gemini AI", isAi: true }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c0d0f]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("landing")}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#0c192c] border border-blue-500/30 shadow-[0_0_15px_rgba(30,136,229,0.3)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300">
              <img
                src={pcSecureLogo}
                alt="PCSecure System Care Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-extrabold text-lg leading-tight tracking-tight flex items-center">
                  <span>PC</span>
                  <span className="text-blue-500 font-black">Secure</span>
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  v4.02.1
                </span>
              </div>
              <p className="text-[9px] text-blue-400 font-mono font-bold tracking-[0.18em] leading-none mt-0.5 uppercase flex items-center gap-1.5">
                <span>— SYSTEM CARE —</span>
                <span className="text-slate-600 font-normal">• {hostOS.toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`relative px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center space-x-1.5 ${
                    isActive
                      ? tab.isAi 
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm"
                        : "bg-white/10 text-white border border-white/10 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (tab.isAi ? "text-purple-400" : "text-blue-400") : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] font-mono px-1 py-0.5 rounded font-bold uppercase tracking-normal ${
                      tab.badge === "ACTIVE" 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse" 
                        : tab.isAi
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {tab.isAi && <Sparkles className="w-2.5 h-2.5 inline" />}
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar: Auth, Bento Status & Sound FX */}
          <div className="flex gap-3 sm:gap-4 items-center">
            
            {/* User Account Section */}
            {user && user.isLoggedIn ? (
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">{user.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono uppercase">{user.isSubscribed ? "Pro Member" : "Free Tier"}</span>
                </div>

                {user.isSubscribed ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1">
                    <Award className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">PRO CARE</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenSubscription && onOpenSubscription();
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-[10px] uppercase px-2 py-1 rounded shadow transition-all transform hover:scale-105 cursor-pointer flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 fill-black" />
                    <span>Upgrade</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    sound.playClick();
                    onLogout && onLogout();
                  }}
                  title="Sign Out"
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenAuth && onOpenAuth("register");
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(30,136,229,0.3)] transition-all transform hover:scale-105 flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Register / Sign In</span>
              </button>
            )}

            <div className="hidden sm:block h-6 w-px bg-white/10"></div>

            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sound.enabled = next;
                if (next) sound.playClick();
              }}
              title={soundEnabled ? "Mute Cyber Audio FX" : "Enable Cyber Audio FX"}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                soundEnabled 
                  ? "bg-white/5 hover:bg-white/10 text-white border-white/10 shadow-sm" 
                  : "bg-white/5 text-slate-500 border-white/5"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline font-mono text-[10px]">SFX</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex overflow-x-auto border-t border-white/5 px-4 py-2 space-x-2 bg-[#0c0d0f]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                isActive
                  ? tab.isAi
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "bg-white/10 text-white border border-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

