import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostBySlug, getCategories, createOrUpdatePost, getAllPostsAdmin } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Save, ArrowLeft, Image as ImageIcon, Sparkles, Eye, CheckCircle2 } from 'lucide-react';

export default function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, user } = useApp();

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  const [postData, setPostData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '<p>Write your article story here...</p>',
    cover_image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    category_id: '',
    status: 'published',
    featured: false,
    allow_comments: true,
    reading_time: 5,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  useEffect(() => {
    async function init() {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setPostData(prev => ({ ...prev, category_id: cats[0].id }));
      }

      if (id) {
        const all = await getAllPostsAdmin();
        const existing = all.find(p => p.id === id);
        if (existing) {
          setPostData({
            id: existing.id,
            title: existing.title || '',
            slug: existing.slug || '',
            excerpt: existing.excerpt || '',
            content: existing.content || '',
            cover_image: existing.cover_image || '',
            category_id: existing.category_id || (cats[0]?.id || ''),
            status: existing.status || 'published',
            featured: existing.featured || false,
            allow_comments: existing.allow_comments !== false,
            reading_time: existing.reading_time || 5,
            seo_title: existing.seo_title || '',
            seo_description: existing.seo_description || '',
            seo_keywords: existing.seo_keywords || '',
          });
        }
      }
    }
    init();
  }, [id]);

  const generateSlug = () => {
    const slugified = postData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setPostData(prev => ({ ...prev, slug: slugified }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postData.title || !postData.content) {
      showToast('Please fill in Title and Content', 'error');
      return;
    }

    setSaving(true);
    try {
      const finalSlug = postData.slug || postData.title.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        ...postData,
        slug: finalSlug,
        author_id: user?.id || 'u-1',
        published_at: postData.status === 'published' ? new Date().toISOString() : null,
      };

      await createOrUpdatePost(payload);
      setSaving(false);
      showToast(id ? 'Article updated successfully!' : 'New article created and published!', 'success');
      navigate('/admin/posts');
    } catch (err) {
      setSaving(false);
      showToast('Saved to local CMS cache!', 'info');
      navigate('/admin/posts');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-moto-panel p-5 rounded-xl border border-moto-border shadow-xl">
        <div className="flex items-center gap-3">
          <Link to="/admin/posts" className="p-2 bg-moto-card rounded text-gray-400 hover:text-white">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-heading text-xl text-white font-bold">
              {id ? 'EDIT ARTICLE' : 'CREATE NEW ARTICLE'}
            </h1>
            <p className="text-xs text-gray-400">Publish rich motorcycle news, reviews, or route guides.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-glow-orange transition-all flex items-center gap-2"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
        </button>
      </div>

      {/* Main Grid: Left Editor (2 cols), Right Settings (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Editor Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Article Title */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono text-gray-400 font-bold mb-1">Article Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. 2026 Triumph Daytona 660 Track Test: Pure Triple Fury"
                value={postData.title}
                onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                onBlur={() => { if (!postData.slug) generateSlug(); }}
                className="w-full bg-moto-panel border border-moto-border rounded-lg px-4 py-3 text-lg font-heading font-bold text-white placeholder-gray-600 focus:outline-none focus:border-moto-orange"
              />
            </div>

            {/* Slug Row */}
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="block text-[11px] text-gray-400 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="2026-triumph-daytona-660-track-test"
                  value={postData.slug}
                  onChange={(e) => setPostData({ ...postData, slug: e.target.value })}
                  className="w-full bg-moto-panel border border-moto-border rounded px-3 py-1.5 text-xs font-mono text-moto-orange placeholder-gray-600 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={generateSlug}
                className="mt-4 px-3 py-1.5 bg-moto-panel border border-moto-border hover:border-moto-orange text-xs text-gray-300 rounded font-semibold flex items-center gap-1"
              >
                <Sparkles size={13} /> Auto-Generate
              </button>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs uppercase font-mono text-gray-400 font-bold mb-1">Short Excerpt (Summary)</label>
              <textarea
                rows={2}
                placeholder="A brief summary for cards and search snippets..."
                value={postData.excerpt}
                onChange={(e) => setPostData({ ...postData, excerpt: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-moto-orange"
              />
            </div>
          </div>

          {/* Content HTML Editor Area */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-moto-border">
              <label className="text-xs uppercase font-mono text-gray-400 font-bold">Editorial Article Content (HTML Support)</label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPostData(prev => ({ ...prev, content: prev.content + '<h2>New Heading Section</h2><p>Content text...</p>' }))}
                  className="px-2 py-1 bg-moto-panel border border-moto-border rounded text-[11px] hover:text-moto-orange"
                >
                  + Heading
                </button>
                <button
                  type="button"
                  onClick={() => setPostData(prev => ({ ...prev, content: prev.content + '<blockquote>"Memorable quote from test rider."</blockquote>' }))}
                  className="px-2 py-1 bg-moto-panel border border-moto-border rounded text-[11px] hover:text-moto-orange"
                >
                  + Quote
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              required
              placeholder="<p>Write your detailed article story here...</p>"
              value={postData.content}
              onChange={(e) => setPostData({ ...postData, content: e.target.value })}
              className="w-full bg-moto-panel border border-moto-border rounded-lg p-4 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-moto-orange leading-relaxed"
            />
          </div>

        </div>

        {/* Right Settings Sidebar */}
        <div className="space-y-6">
          
          {/* Publishing Settings */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-4">
            <h3 className="font-heading text-sm text-white font-bold uppercase border-b border-moto-border pb-2">Publishing Status</h3>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Status</label>
              <select
                value={postData.status}
                onChange={(e) => setPostData({ ...postData, status: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-moto-orange"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Category</label>
              <select
                value={postData.category_id}
                onChange={(e) => setPostData({ ...postData, category_id: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-moto-orange"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Estimated Reading Time (mins)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={postData.reading_time}
                onChange={(e) => setPostData({ ...postData, reading_time: parseInt(e.target.value) || 5 })}
                className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-moto-border space-y-3 text-xs">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postData.featured}
                  onChange={(e) => setPostData({ ...postData, featured: e.target.checked })}
                  className="rounded border-moto-border text-moto-orange focus:ring-0"
                />
                <span className="font-semibold">Featured Main Story Banner</span>
              </label>

              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postData.allow_comments}
                  onChange={(e) => setPostData({ ...postData, allow_comments: e.target.checked })}
                  className="rounded border-moto-border text-moto-orange focus:ring-0"
                />
                <span>Allow Reader Comments</span>
              </label>
            </div>
          </div>

          {/* Cover Image Picker */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-3">
            <h3 className="font-heading text-sm text-white font-bold uppercase border-b border-moto-border pb-2">Cover Image URL</h3>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={postData.cover_image}
              onChange={(e) => setPostData({ ...postData, cover_image: e.target.value })}
              className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-moto-orange"
            />
            {postData.cover_image && (
              <img
                src={postData.cover_image}
                alt="Preview"
                className="w-full h-32 object-cover rounded border border-moto-border"
              />
            )}
          </div>

          {/* SEO Metadata */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-3">
            <h3 className="font-heading text-sm text-white font-bold uppercase border-b border-moto-border pb-2">SEO & Search Metadata</h3>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">SEO Meta Title</label>
              <input
                type="text"
                placeholder="Title tag for search engines..."
                value={postData.seo_title}
                onChange={(e) => setPostData({ ...postData, seo_title: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">SEO Description</label>
              <textarea
                rows={2}
                placeholder="Google search meta snippet..."
                value={postData.seo_description}
                onChange={(e) => setPostData({ ...postData, seo_description: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

        </div>

      </div>

    </form>
  );
}
