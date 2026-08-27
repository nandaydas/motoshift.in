import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, Copy, Check } from 'lucide-react';

export default function MediaLibraryPage() {
  const { showToast } = useApp();
  const [copiedId, setCopiedId] = useState(null);

  const [mediaList, setMediaList] = useState([
    { id: 'm-1', name: 'Triumph Daytona 660 Track', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80', size: '1.4 MB', dimensions: '1920x1080' },
    { id: 'm-2', name: 'Spiti Pass Mountain Route', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80', size: '2.1 MB', dimensions: '2048x1365' },
    { id: 'm-3', name: 'Carbon Fiber Race Helmet', url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80', size: '890 KB', dimensions: '1200x800' },
    { id: 'm-4', name: 'Royal Enfield Bear 650 Twin', url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1200&q=80', size: '1.8 MB', dimensions: '1920x1080' },
  ]);

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Image URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadSimulate = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMedia = {
        id: `m-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        dimensions: '1920x1080'
      };
      setMediaList([newMedia, ...mediaList]);
      showToast('Image asset added to media library!', 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-white font-extrabold">MEDIA LIBRARY</h1>
          <p className="text-xs text-gray-400">Manage article cover images, banners, and media assets.</p>
        </div>

        <label className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-glow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto">
          <Upload size={16} />
          <span>Upload Image</span>
          <input type="file" accept="image/*" onChange={handleUploadSimulate} className="hidden" />
        </label>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {mediaList.map((item) => (
          <div key={item.id} className="bg-moto-card border border-moto-border rounded-xl overflow-hidden group shadow-lg">
            <div className="h-44 overflow-hidden relative bg-black">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>

            <div className="p-3 space-y-2 text-xs">
              <p className="font-bold text-white truncate">{item.name}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span>{item.size}</span>
                <span>{item.dimensions}</span>
              </div>
              <button
                onClick={() => copyUrl(item.url, item.id)}
                className="w-full py-1.5 bg-moto-panel border border-moto-border hover:border-moto-orange text-moto-orange font-bold text-[11px] uppercase rounded flex items-center justify-center gap-1 transition-colors"
              >
                {copiedId === item.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedId === item.id ? 'Copied Link' : 'Copy Image URL'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
