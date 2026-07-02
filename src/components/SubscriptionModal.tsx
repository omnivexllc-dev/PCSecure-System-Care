import React, { useState } from "react";
import { Shield, Check, Zap, Sparkles, Lock, CreditCard, Award, ArrowRight, X, AlertTriangle, HelpCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { SubscriptionPlan, UserAccount } from "../types";
import { sound } from "../lib/soundFx";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onSubscribeSuccess: (updatedUser: UserAccount) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubscribeSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY_CARE" | "ANNUAL_PRO" | "LIFETIME_ULTIMATE">("ANNUAL_PRO");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const plans: SubscriptionPlan[] = [
    {
      id: "MONTHLY_CARE",
      name: "Monthly Care",
      price: "$9.99",
      period: "/ month",
      features: [
        "1-Click System Problem Repair",
        "Deep Storage Junk & Dump Cleaner",
        "Browser Spyware & Cookie Shredder",
        "Standard Speed Optimization"
      ]
    },
    {
      id: "ANNUAL_PRO",
      name: "Annual Pro",
      price: "$49.99",
      period: "/ year",
      badge: "SAVE 58% • MOST POPULAR",
      recommended: true,
      features: [
        "Everything in Monthly Care",
        "Gemini AI Root-Cause System Doctor",
        "Turbo Boost Game & High-FPS Mode",
        "Real-Time Background Malware Shield",
        "Startup Bottleneck Optimizer"
      ]
    },
    {
      id: "LIFETIME_ULTIMATE",
      name: "Lifetime Ultimate",
      price: "$99.99",
      period: "one-time payment",
      badge: "BEST VALUE FOR PC CARE",
      features: [
        "Everything in Annual Pro — Forever",
        "No Recurring Subscription Fees",
        "VIP Priority Cyber Technical Support",
        "All Future AI System Lab Modules",
        "Multi-Device License (Up to 3 PCs)"
      ]
    }
  ];

  const handleSubscribe = () => {
    sound.playClick();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      sound.playRepairSuccess();

      const updatedUser: UserAccount = {
        name: user?.name || "PC User",
        email: user?.email || "user@pcsecure.io",
        isLoggedIn: true,
        isSubscribed: true,
        plan: selectedPlan,
        subscribedAt: new Date().toISOString()
      };

      localStorage.setItem("pcsecure_user_account", JSON.stringify(updatedUser));
      onSubscribeSuccess(updatedUser);
      onClose();
    }, 1500);
  };

  const activePlanObj = plans.find(p => p.id === selectedPlan) || plans[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#12141a] border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(30,136,229,0.25)] overflow-hidden my-auto">
        
        {/* Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-blue-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

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

        <div className="p-6 sm:p-10 relative z-10 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>PREMIUM SYSTEM CARE SUBSCRIPTION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Subscribe to Completely Fix All Computer Problems
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              In order to execute deep registry repairs, shred invasive adware tracking cookies, reclaim storage, and permanently normalize your computer, please select your subscription plan below.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedPlan(plan.id);
                  }}
                  className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? "bg-gradient-to-b from-blue-900/40 via-[#161923] to-[#12141a] border-blue-500 shadow-[0_0_30px_rgba(30,136,229,0.3)] scale-[1.02]"
                      : "bg-[#0d0f14] border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg whitespace-nowrap tracking-wider">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-white">{plan.name}</h3>
                        <div className="mt-1 flex items-baseline">
                          <span className="text-2xl sm:text-3xl font-black text-white font-mono">{plan.price}</span>
                          <span className="text-xs text-slate-400 ml-1 font-mono">{plan.period}</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isSelected ? "bg-blue-600 border-blue-500 text-white" : "border-white/20 text-transparent"
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="h-px w-full bg-white/10 my-3"></div>

                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan.id);
                        handleSubscribe();
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
                          : "bg-white/5 hover:bg-white/10 text-slate-300"
                      }`}
                    >
                      {isSelected ? "Select & Subscribe" : "Choose Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="bg-[#0a0b0e] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-xs sm:text-sm">
                  Instant Access • 100% Secure Checkout
                </h4>
                <p className="text-slate-400 text-xs">
                  Your payment entitles you to complete system repair & real-time normalization for <strong className="text-white font-mono">{activePlanObj.name}</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-blue-600 to-blue-500 hover:from-emerald-500 hover:to-blue-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing Secure Payment...</span>
                </span>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Subscribe & Fix PC Now ({activePlanObj.price})</span>
                </>
              )}
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400 font-mono text-center">
            <span className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> 30-Day Money-Back Guarantee</span>
            <span>•</span>
            <span className="flex items-center"><Award className="w-3.5 h-3.5 text-blue-400 mr-1" /> Certified Windows & Mac Care</span>
            <span>•</span>
            <span className="flex items-center"><Shield className="w-3.5 h-3.5 text-purple-400 mr-1" /> No Adware / No Malware Guarantee</span>
          </div>

        </div>
      </div>
    </div>
  );
};
