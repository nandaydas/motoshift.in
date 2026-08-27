import React, { useEffect, useState } from 'react';
import { getMediaAdmin, uploadMediaAdmin } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Upload, Copy, Check } from 'lucide-react';

export default function MediaLibraryPage() {
  const { showToast } = useApp();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    setLoading(true);
    const data = await getMediaAdmin();
    setMediaList(data);
    setLoading(false);
  }

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Image URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const record = await uploadMediaAdmin(file);
      setMediaList([record, ...mediaList]);
      showToast('Media asset uploaded to Supabase storage!', 'success');
    } catch (err) {
      showToast('Failed to upload media asset', 'error');
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-white font-extrabold">MEDIA LIBRARY</h1>
          <p className="text-xs text-gray-400">Manage article cover images, banners, and media assets in Supabase.</p>
        </div>

        <label className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-glow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto">
          <Upload size={16} />
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          <input type="file" accept="image/*" disabled={uploading} onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-mono text-sm animate-pulse">
          Loading media library from Supabase...
        </div>
      ) : mediaList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mediaList.map((item) => (
            <div key={item.id} className="bg-moto-card border border-moto-border rounded-xl overflow-hidden group shadow-lg">
              <div className="h-44 overflow-hidden relative bg-black">
                <img src={item.public_url} alt={item.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>

              <div className="p-3 space-y-2 text-xs">
                <p className="font-bold text-white truncate">{item.original_filename || item.filename}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <span>{item.size ? `${(item.size / 1024).toFixed(0)} KB` : 'Media'}</span>
                  <span>{item.mime_type || 'image'}</span>
                </div>
                <button
                  onClick={() => copyUrl(item.public_url, item.id)}
                  className="w-full py-1.5 bg-moto-panel border border-moto-border hover:border-moto-orange text-moto-orange font-bold text-[11px] uppercase rounded flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedId === item.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedId === item.id ? 'Copied Link' : 'Copy Image URL'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500 italic text-sm">
          No media files uploaded yet. Click "Upload Image" to add assets to Supabase storage.
        </div>
      )}

    </div>
  );
}
