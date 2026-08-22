"use client";

import { useUIStore } from "../../hooks/use-ui-store";
import { X, Lock, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthModal() {
  const { activeModal, closeModal } = useUIStore();
  const [isLogin, setIsLogin] = useState(false);

  if (activeModal !== "auth") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-on-background/40 backdrop-blur-sm"
          onClick={closeModal}
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border-subtle"
        >
          {/* Header */}
          <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-bright">
            <h2 className="font-headline-sm text-[20px] font-bold text-on-background">
              {isLogin ? "Welcome Back" : "Start Preparing"}
            </h2>
            <button 
              onClick={closeModal}
              className="p-2 rounded-full hover:bg-surface-container text-secondary hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="block font-label-sm text-[12px] font-medium text-secondary mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Alex Chen"
                  className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}
            
            <div>
              <label className="block font-label-sm text-[12px] font-medium text-secondary mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input 
                  type="email" 
                  placeholder="alex@example.com"
                  className="w-full bg-surface-container-low border border-border-subtle rounded-lg pl-10 pr-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-[12px] font-medium text-secondary mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-border-subtle rounded-lg pl-10 pr-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                closeModal();
                if (isLogin) {
                  window.location.href = "/dashboard";
                } else {
                  window.location.href = "/onboarding";
                }
              }}
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-[14px] font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2 mt-6"
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 bg-surface-container-lowest border-t border-border-subtle text-center">
            <p className="font-body-sm text-[14px] text-secondary">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-primary hover:text-primary-container transition-colors"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
