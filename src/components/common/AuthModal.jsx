import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { signInUser, signUpUser } from '../../lib/supabase';
import { ShieldCheck, User, X, CheckCircle, Lock, Mail } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginAsAdmin, user, setUser, logout, showToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isSignUp) {
        const res = await signUpUser({ email, password, name });
        setUser(res.user);
        showToast('Account created successfully!', 'success');
      } else {
        const res = await signInUser({ email, password });
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}! (${res.user.role} role)`, 'success');
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    }
    setLoading(false);
  };

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
          <h3 className="font-heading text-xl text-white">
            {user ? 'Account Profile' : isSignUp ? 'Create MotoShift Account' : 'Sign In to MotoShift'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {user ? 'Logged in session details' : 'Access reader bookmarks or administrative content management'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {user ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-moto-card rounded-lg border border-moto-border inline-block w-full">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={user.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-moto-orange object-cover"
                />
                <h4 className="font-bold text-white text-base">{user.name}</h4>
                <p className="text-xs text-moto-orange uppercase tracking-wider font-semibold">{user.role} role</p>
                <p className="text-xs text-gray-400 mt-1">{user.email}</p>
              </div>

              {user.role === 'admin' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400 flex items-center justify-center gap-2">
                  <ShieldCheck size={16} />
                  <span>Full Admin CMS Access Granted</span>
                </div>
              )}

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
              {/* Preset Switcher */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    loginAsAdmin();
                    setIsAuthModalOpen(false);
                  }}
                  className="w-full p-2.5 bg-moto-orange hover:bg-moto-orange-hover text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-glow-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} />
                    <span>Quick Admin Access (CMS Portal)</span>
                  </div>
                  <CheckCircle size={15} />
                </button>
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-moto-border w-full" />
                <span className="bg-moto-panel px-3 text-[10px] uppercase font-mono text-gray-500">SUPABASE AUTHENTICATION</span>
              </div>

              {/* Supabase Email Input Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {isSignUp && (
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Nanday Das"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-moto-panel hover:bg-moto-border text-white border border-moto-border font-bold text-xs uppercase py-2.5 rounded transition-colors shadow-glow-sm"
                >
                  {loading ? 'Authenticating...' : isSignUp ? 'Create Supabase Account' : 'Sign In with Supabase'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-moto-orange hover:underline font-medium"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
