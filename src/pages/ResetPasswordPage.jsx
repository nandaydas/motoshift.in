import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Lock, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const { showToast, setIsAuthModalOpen } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please check again.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setLoading(true);
    try {
      await updatePassword({ password });
      setCompleted(true);
      showToast('Password updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update password. Link may have expired.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
      <div className="w-full bg-moto-panel border border-moto-border rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-moto-orange/20 border border-moto-orange/40 text-moto-orange rounded-full flex items-center justify-center mx-auto mb-2">
            <KeyRound size={24} />
          </div>
          <h1 className="font-heading text-2xl text-white font-bold uppercase tracking-wider">
            Set New Password
          </h1>
          <p className="text-xs text-gray-400">
            Create a secure new password for your MotoShift account.
          </p>
        </div>

        {completed ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm space-y-3 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
            <h3 className="font-bold text-base text-white">Password Updated!</h3>
            <p className="text-xs text-gray-300">
              Your account password has been changed. You can now sign in with your new password.
            </p>
            <button
              onClick={() => {
                navigate('/');
                setIsAuthModalOpen(true);
              }}
              className="mt-2 w-full bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-colors"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password (min. 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-moto-card border border-moto-border rounded-lg px-3 py-2.5 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-moto-card border border-moto-border rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg shadow-glow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={15} />
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
