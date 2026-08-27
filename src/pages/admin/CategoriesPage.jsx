import React, { useEffect, useState } from 'react';
import { getCategories, supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Plus } from 'lucide-react';

export default function CategoriesPage() {
  const { showToast } = useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#ff5500',
    is_active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  }

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    const slugified = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
    const newCat = {
      ...formData,
      slug: slugified,
      id: `cat-${Date.now()}`
    };

    try {
      await supabase.from('categories').insert([newCat]);
    } catch (e) {}

    setCategories([...categories, newCat]);
    setIsModalOpen(false);
    showToast('Category created successfully!', 'success');
    setFormData({ name: '', slug: '', description: '', color: '#ff5500', is_active: true });
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-white font-extrabold">CATEGORIES MANAGEMENT</h1>
          <p className="text-xs text-gray-400">Organize motorcycle content into public portal categories.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-glow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat.id} className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-3 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: cat.color || '#ff5500' }}
            />
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-moto-orange uppercase">/{cat.slug}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Active</span>
            </div>
            <h3 className="font-heading text-lg text-white font-bold">{cat.name}</h3>
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{cat.description}</p>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-moto-panel border border-moto-border rounded-xl p-6 space-y-4">
            <h3 className="font-heading text-xl text-white font-bold">Add Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Motorcycles"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-white focus:outline-none focus:border-moto-orange"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="electric-motorcycles"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description for category banner..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Accent Color Hex</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-9 bg-moto-card border border-moto-border rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-moto-card text-gray-400 hover:text-white rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-moto-orange text-white rounded font-bold uppercase"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
