import React, { useState } from "react";
import { Shield, Lock, Mail, User, Key, CheckCircle2, AlertCircle, ArrowRight, Sparkles, X } from "lucide-react";
import { UserAccount } from "../types";
import { sound } from "../lib/soundFx";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  initialMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "register"
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setError("");

    if (!email || !password || (mode === "register" && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userObj: UserAccount = {
        name: mode === "register" ? name : email.split("@")[0] || "PC User",
        email: email,
        isLoggedIn: true,
        isSubscribed: false
      };
      
      // Check if user previously had a subscription stored
      const existing = localStorage.getItem("pcsecure_user_account");
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (parsed && parsed.email === email && parsed.isSubscribed) {
            userObj.isSubscribed = true;
            userObj.plan = parsed.plan;
            userObj.subscribedAt = parsed.subscribedAt;
          }
        } catch (err) {}
      }

      localStorage.setItem("pcsecure_user_account", JSON.stringify(userObj));
      sound.playRepairSuccess();
      onSuccess(userObj);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#12141a] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(30,136,229,0.2)] overflow-hidden">
        
        {/* Header Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 relative z-10 space-y-6">
          
          {/* Title & Icon */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === "register" ? "Create Account to Unlock Repair" : "Sign In to PCSecure"}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === "register"
                ? "Register your account to access diagnostic results and fix all detected system bottlenecks."
                : "Welcome back! Enter your credentials to access your computer care dashboard."}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-[#0a0b0e] p-1 border border-white/5 font-semibold text-xs">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode("register");
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-lg transition-all text-center uppercase tracking-wider cursor-pointer ${
                mode === "register"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register Account
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode("login");
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-lg transition-all text-center uppercase tracking-wider cursor-pointer ${
                mode === "login"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Robinson"
                    className="w-full bg-[#0a0b0e] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full bg-[#0a0b0e] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0b0e] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(30,136,229,0.4)] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{mode === "register" ? "Creating Account..." : "Signing In..."}</span>
                  </span>
                ) : (
                  <>
                    <span>{mode === "register" ? "Register & Unlock Access" : "Sign In & Continue"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Security Badges */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-center space-x-4 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center"><CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" /> 256-bit Encrypted</span>
            <span>•</span>
            <span className="flex items-center"><Shield className="w-3 h-3 text-blue-400 mr-1" /> Privacy Guaranteed</span>
          </div>

        </div>
      </div>
    </div>
  );
};
