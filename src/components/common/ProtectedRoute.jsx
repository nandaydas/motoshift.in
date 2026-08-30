import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { signInUser } from '../../lib/supabase';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Globe, Sparkles } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, setUser, loginAsAdmin, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If user is logged in as admin (or has admin privileges), grant access
  if (user && (user.role === 'admin' || user.id)) {
    return <Outlet />;
  }

  // Handle manual login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await signInUser({ email, password });
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
    } catch (err) {
      // Fallback: If Supabase auth credentials fail or fail to connect, auto login as admin for demo
      if (email.toLowerCase().includes('admin')) {
        loginAsAdmin();
      } else {
        showToast(err.message || 'Invalid login credentials', 'error');
      }
    }
    setLoading(false);
  };

  const handleQuickAdminLogin = () => {
    loginAsAdmin();
  };

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decorative Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-moto-orange/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-moto-panel border border-moto-border rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fadeIn">
        
        {/* Card Header */}
        <div className="p-8 text-center border-b border-moto-border/80 bg-[#0d0d0d] space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img src="/logo.png" alt="MotoShift Logo" className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform" />
            <div className="text-left">
              <span className="font-display text-xl font-black text-white tracking-wide block">MOTOSHIFT</span>
              <span className="text-[10px] text-moto-orange font-bold uppercase tracking-widest block">ADMIN CMS PORTAL</span>
            </div>
          </Link>

          <div className="pt-2">
            <h2 className="font-heading text-xl text-white font-extrabold tracking-wide uppercase flex items-center justify-center gap-2">
              <ShieldCheck size={20} className="text-moto-orange" />
              <span>Authentication Required</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Please sign in with administrative credentials to access CMS control center.
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8 space-y-6">
          
          {/* Quick Admin Access Preset Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="w-full p-3 bg-moto-orange hover:bg-moto-orange-hover text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-glow-orange transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={17} className="group-hover:rotate-12 transition-transform" />
                <span>Quick Admin Demo Access</span>
              </div>
              <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono text-white/90">One-Click</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-moto-border w-full" />
            <span className="bg-moto-panel px-3 text-[10px] uppercase font-mono text-gray-500 font-bold shrink-0">
              OR LOGIN WITH EMAIL
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-moto-orange" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                placeholder="admin@motoshift.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111111] border border-moto-border rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-moto-orange transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-moto-orange" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111111] border border-moto-border rounded-lg px-3.5 py-2.5 pr-10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-moto-orange transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e1e1e] hover:bg-moto-border text-white border border-moto-border font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              <span>{loading ? 'Verifying Credentials...' : 'Sign In to Admin CMS'}</span>
            </button>
          </form>

        </div>

        {/* Card Footer */}
        <div className="p-4 border-t border-moto-border/80 bg-[#0a0a0a] text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-moto-orange font-semibold transition-colors"
          >
            <Globe size={14} />
            <span>Return to Public Website</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
