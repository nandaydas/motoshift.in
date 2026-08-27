import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, User, X, CheckCircle } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginAsAdmin, loginAsReader, user, logout } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-moto-panel border border-moto-border rounded-xl shadow-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-3 right-3 p-1 rounded-full bg-moto-dark border border-moto-border text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="p-6 text-center border-b border-moto-border/60 bg-[#0d0d0d]">
          <div className="w-12 h-12 bg-moto-orange rounded-full flex items-center justify-center mx-auto mb-3 shadow-glow-orange text-black font-display font-extrabold text-2xl">
            M
          </div>
          <h3 className="font-heading text-xl text-white">Sign In to MotoShift</h3>
          <p className="text-xs text-gray-400 mt-1">
            Access reader bookmarks or administrative content management
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {user ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-moto-card rounded-lg border border-moto-border inline-block w-full">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-moto-orange object-cover"
                />
                <h4 className="font-bold text-white text-base">{user.name}</h4>
                <p className="text-xs text-moto-orange uppercase tracking-wider font-semibold">{user.role} role</p>
                <p className="text-xs text-gray-400 mt-1">{user.email}</p>
              </div>

              <button
                onClick={() => {
                  logout();
                  setIsAuthModalOpen(false);
                }}
                className="w-full py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 rounded font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              {/* Quick Preset Access Buttons */}
              <div className="space-y-3">
                <label className="text-xs uppercase font-mono text-gray-400 font-bold">Quick Demo Access</label>
                
                <button
                  onClick={() => {
                    loginAsAdmin();
                    setIsAuthModalOpen(false);
                  }}
                  className="w-full p-3 bg-moto-orange hover:bg-moto-orange-hover text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-glow-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>Sign In as Admin (Full CMS Access)</span>
                  </div>
                  <CheckCircle size={16} />
                </button>

                <button
                  onClick={() => {
                    loginAsReader();
                    setIsAuthModalOpen(false);
                  }}
                  className="w-full p-3 bg-moto-card hover:bg-moto-border text-gray-200 border border-moto-border rounded-lg font-semibold text-xs uppercase tracking-wider flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-moto-orange" />
                    <span>Sign In as Community Reader</span>
                  </div>
                  <CheckCircle size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-moto-border w-full" />
                <span className="bg-moto-panel px-3 text-[10px] uppercase font-mono text-gray-500">OR SUPABASE AUTH</span>
              </div>

              {/* Standard Email Input Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                loginAsReader();
                setIsAuthModalOpen(false);
              }} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="rider@motoshift.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-moto-panel hover:bg-moto-border text-gray-200 border border-moto-border font-bold text-xs uppercase py-2.5 rounded transition-colors"
                >
                  Continue with Credentials
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
