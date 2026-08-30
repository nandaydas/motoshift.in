import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { updateUserProfile } from '../../lib/supabase';
import MediaSelectModal from '../../components/common/MediaSelectModal';
import { User, Mail, Shield, Camera, Save, CheckCircle2, Sparkles, Key } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, setUser, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || 'Nanday Das',
    username: user?.username || 'nandaydas',
    email: user?.email || 'admin@motoshift.in',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: user?.bio || 'Senior motorcycle journalist, track rider, and founder of MotoShift.in. Obsessed with high-rpm inline triples and long-distance mountain expeditions.',
    role: user?.role || 'admin'
  });

  const [saving, setSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUserProfile(user?.id || 'u-1', formData);
      const newUserData = {
        ...user,
        name: updated.name || formData.name,
        username: updated.username || formData.username,
        email: updated.email || formData.email,
        avatar: updated.avatar || formData.avatar,
        bio: updated.bio || formData.bio,
        role: updated.role || formData.role
      };
      setUser(newUserData);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl text-white font-extrabold">PROFILE SETTINGS</h1>
        <p className="text-xs text-gray-400">Manage your editorial profile, author avatar, display name, and bio.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: Avatar & Overview */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl flex flex-col items-center text-center space-y-4">
            
            {/* Avatar Preview */}
            <div className="relative group">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-moto-orange shadow-glow-sm"
              />
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
              >
                <Camera size={22} />
              </button>
            </div>

            <div>
              <h3 className="font-heading text-lg text-white font-bold">{formData.name}</h3>
              <p className="text-xs text-moto-orange font-mono font-semibold">@{formData.username}</p>
            </div>

            <div className="px-3 py-1 bg-moto-panel border border-moto-border rounded-full text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
              <Shield size={12} />
              <span>{formData.role} Account</span>
            </div>

            <button
              type="button"
              onClick={() => setIsMediaModalOpen(true)}
              className="w-full py-2 bg-moto-panel border border-moto-border hover:border-moto-orange rounded text-xs text-gray-300 font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Camera size={14} className="text-moto-orange" />
              <span>Change Profile Image</span>
            </button>
          </div>

          {/* Quick Tip */}
          <div className="p-4 bg-moto-card border border-moto-border/60 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-moto-orange font-bold">
              <Sparkles size={14} />
              <span>Author Byline Preview</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Your name, avatar, and bio appear under published article stories across MotoShift.in.
            </p>
          </div>
        </div>

        {/* Right Column: Form Fields */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-4">
            <h3 className="font-heading text-sm text-white font-bold border-b border-moto-border pb-2">Personal & Editorial Information</h3>

            {/* Display Name */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Display Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-moto-panel border border-moto-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-moto-orange"
                  placeholder="e.g. Nanday Das"
                />
                <User size={15} className="absolute left-3 top-2.5 text-gray-500" />
              </div>
            </div>

            {/* Username / Handle */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Editorial Username / Handle</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  className="w-full bg-moto-panel border border-moto-border rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-moto-orange"
                  placeholder="nandaydas"
                />
                <span className="absolute left-3 top-2 text-xs text-gray-500 font-mono font-bold">@</span>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Account Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-moto-panel border border-moto-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-moto-orange"
                  placeholder="admin@motoshift.in"
                />
                <Mail size={15} className="absolute left-3 top-2.5 text-gray-500" />
              </div>
            </div>

            {/* Avatar URL direct edit */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Profile Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="flex-1 bg-moto-panel border border-moto-border rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-moto-orange"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-3 py-2 bg-moto-panel border border-moto-border hover:border-moto-orange rounded-lg text-xs text-gray-300 font-semibold shrink-0"
                >
                  Select Media
                </button>
              </div>
            </div>

            {/* Writer Bio */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Writer Bio (Appears under published articles)</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-moto-orange"
                placeholder="Senior motorcycle journalist, track rider, and founder of MotoShift.in..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-moto-border flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-glow-sm transition-all flex items-center gap-2"
              >
                <Save size={16} />
                <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </div>
        </div>

      </form>

      {/* Media Select Modal for Avatar */}
      <MediaSelectModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        title="Select Profile Avatar Image"
        onSelectImage={(url) => {
          setFormData(prev => ({ ...prev, avatar: url }));
          setIsMediaModalOpen(false);
          showToast('Selected profile avatar image!', 'success');
        }}
      />

    </div>
  );
}
