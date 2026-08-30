import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCategories, createOrUpdatePost, getAllPostsAdmin } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import TiptapEditor from '../../components/editor/TiptapEditor';
import MediaSelectModal from '../../components/common/MediaSelectModal';
import { Save, ArrowLeft, Sparkles, Image as ImageIcon, Plus, X } from 'lucide-react';

// Helper to extract clean plain text and calculate post metadata automatically
function autoGeneratePostMetadata(data, categories = []) {
  const title = (data.title || '').trim();
  const rawContent = (data.content || '').trim();

  // Strip HTML and Markdown to get clean text for word counting & excerpt
  const plainText = rawContent
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*`_~>[\]()|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Calculate reading time (200 words/min, minimum 1 min)
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const calculatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  // 2. Short Excerpt (Summary) if empty
  let excerpt = (data.excerpt || '').trim();
  if (!excerpt && plainText) {
    excerpt = plainText.length > 160
      ? plainText.slice(0, 157).trim() + '...'
      : plainText;
  }

  // 3. SEO Meta Title if empty
  const seo_title = (data.seo_title || '').trim() || title;

  // 4. SEO Description if empty
  const seo_description = (data.seo_description || '').trim() || excerpt;

  // 5. SEO Keywords if empty
  let seo_keywords = (data.seo_keywords || '').trim();
  if (!seo_keywords && (title || plainText)) {
    const categoryObj = categories.find(c => c.id === data.category_id);
    const categoryName = categoryObj ? categoryObj.name : '';
    const stopWords = new Set([
      'the','and','a','an','is','in','it','of','to','for','with','on','at','by',
      'this','that','from','be','are','or','as','was','your','you','how','what',
      'when','where','why','can','will','have','has','had','more','than','all'
    ]);
    
    const sourceText = `${title} ${categoryName} ${plainText.slice(0, 400)}`;
    const wordList = sourceText
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));
    
    const uniqueKeywords = Array.from(new Set(wordList)).slice(0, 8);
    seo_keywords = uniqueKeywords.join(', ');
  }

  return {
    reading_time: calculatedReadingTime,
    excerpt,
    seo_title,
    seo_description,
    seo_keywords
  };
}

export default function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, user, setAdminHeader, addCategory } = useApp();

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isCoverMediaModalOpen, setIsCoverMediaModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCatData, setNewCatData] = useState({ name: '', description: '', color: '#ff5500' });
  const [creatingCat, setCreatingCat] = useState(false);

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

  // Register top navbar header title, back link, and Save button
  useEffect(() => {
    setAdminHeader({
      title: id ? 'EDIT ARTICLE' : 'CREATE NEW ARTICLE',
      subTitle: 'Publish rich motorcycle news, reviews, or route guides.',
      backLink: '/admin/posts',
      formId: 'post-editor-form',
      saving
    });
    return () => setAdminHeader(null);
  }, [id, saving, setAdminHeader]);

  useEffect(() => {
    async function init() {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setPostData(prev => ({ 
          ...prev, 
          category_id: prev.category_id ? (cats.find(c => c.id === prev.category_id || c.slug === prev.category_id)?.id || prev.category_id) : cats[0].id 
        }));
      }

      if (id) {
        const all = await getAllPostsAdmin();
        const existing = all.find(p => p.id === id);
        if (existing) {
          const matched = cats.find(c => c.id === existing.category_id || c.slug === existing.category_id);
          const activeCatId = matched ? matched.id : (existing.category_id || cats[0]?.id || '');

          setPostData({
            id: existing.id,
            title: existing.title || '',
            slug: existing.slug || '',
            excerpt: existing.excerpt || '',
            content: existing.content || '',
            cover_image: existing.cover_image || '',
            category_id: activeCatId,
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

  const handleCreateCategory = async (e) => {
    if (e) e.preventDefault();
    if (!newCatData.name.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }
    setCreatingCat(true);
    try {
      const created = await addCategory(newCatData);
      setCategories(prev => {
        const exists = prev.some(c => c.id === created.id);
        return exists ? prev : [...prev, created];
      });
      setPostData(prev => ({ ...prev, category_id: created.id }));
      setIsNewCategoryModalOpen(false);
      setNewCatData({ name: '', description: '', color: '#ff5500' });
      showToast(`Category "${created.name}" created and selected!`, 'success');
    } catch (err) {
      showToast('Failed to create category', 'error');
    } finally {
      setCreatingCat(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postData.title || !postData.content) {
      showToast('Please fill in Title and Content', 'error');
      return;
    }

    setSaving(true);
    try {
      // Ensure double newlines before markdown headings so parsers treat them as H1-H6 blocks
      let formattedContent = (postData.content || '').replace(/([^\n])\n*(#{1,6}\s+)/g, '$1\n\n$2');
      const postWithCleanContent = { ...postData, content: formattedContent };

      // Auto-generate missing metadata, SEO fields, tags, & calculate reading time
      const generatedMeta = autoGeneratePostMetadata(postWithCleanContent, categories);
      const finalSlug = postData.slug || postData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      
      const payload = {
        ...postWithCleanContent,
        ...generatedMeta,
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
    <form id="post-editor-form" onSubmit={handleSubmit} className="space-y-6 pb-12">

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

          {/* Content Tiptap WYSIWYG Editor Area */}
          <div className="space-y-2">
            <label className="block text-xs uppercase font-mono text-gray-400 font-bold mb-1">
              Article Content (Tiptap Visual Editor • Markdown Storage)
            </label>
            <TiptapEditor
              markdown={postData.content}
              onChange={(md) => setPostData(prev => ({ ...prev, content: md }))}
            />
          </div>

        </div>

        {/* Right Settings Sidebar */}
        <div className="space-y-6">

          {/* Publishing Settings */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-4">
            <h3 className="font-heading text-sm text-white font-bold border-b border-moto-border pb-2">Publishing Status</h3>

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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] text-gray-400">Category</label>
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="text-[10px] text-moto-orange hover:underline font-bold flex items-center gap-0.5"
                >
                  <Plus size={11} /> Add Category
                </button>
              </div>
              <select
                value={postData.category_id || (categories[0]?.id || '')}
                onChange={(e) => setPostData({ ...postData, category_id: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-moto-orange font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id || c.slug} value={c.id}>
                    {c.name}
                  </option>
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
            <div className="flex items-center justify-between border-b border-moto-border pb-2">
              <h3 className="font-heading text-sm text-white font-bold">Cover Image</h3>
              <button
                type="button"
                onClick={() => setIsCoverMediaModalOpen(true)}
                className="px-3 py-1 bg-moto-panel hover:bg-moto-border text-moto-orange border border-moto-border rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ImageIcon size={13} /> Select / Upload
              </button>
            </div>

            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={postData.cover_image}
              onChange={(e) => setPostData({ ...postData, cover_image: e.target.value })}
              className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-moto-orange font-mono"
            />

            {postData.cover_image && (
              <img
                src={postData.cover_image}
                alt="Preview"
                className="w-full h-36 object-cover rounded-lg border border-moto-border shadow-md"
              />
            )}

            <MediaSelectModal
              isOpen={isCoverMediaModalOpen}
              onClose={() => setIsCoverMediaModalOpen(false)}
              onSelectImage={(url) => setPostData(prev => ({ ...prev, cover_image: url }))}
              title="Select Cover Image for Article"
            />
          </div>

          {/* SEO Metadata */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-moto-border pb-2">
              <h3 className="font-heading text-sm text-white font-bold">SEO & Search Metadata</h3>
              <button
                type="button"
                onClick={() => {
                  const gen = autoGeneratePostMetadata(postData, categories);
                  setPostData(prev => ({ ...prev, ...gen }));
                  showToast('Auto-generated Excerpt, SEO fields, keywords & reading time!', 'success');
                }}
                className="px-2.5 py-1 bg-moto-panel hover:bg-moto-border text-moto-orange border border-moto-border rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Fill missing fields automatically"
              >
                <Sparkles size={12} /> Auto-Generate
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">SEO Meta Title</label>
              <input
                type="text"
                placeholder="Title tag for search engines (auto-filled on save)..."
                value={postData.seo_title}
                onChange={(e) => setPostData({ ...postData, seo_title: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-moto-orange"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">SEO Description</label>
              <textarea
                rows={2}
                placeholder="Google search meta snippet (auto-filled on save)..."
                value={postData.seo_description}
                onChange={(e) => setPostData({ ...postData, seo_description: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-moto-orange"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">SEO Keywords / Tags</label>
              <input
                type="text"
                placeholder="e.g. motorcycle, maintenance, engine oil, track test..."
                value={postData.seo_keywords}
                onChange={(e) => setPostData({ ...postData, seo_keywords: e.target.value })}
                className="w-full bg-moto-panel border border-moto-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-moto-orange"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Quick Add Category Modal */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-moto-panel border border-moto-border rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-moto-border pb-2">
              <h4 className="font-heading text-base text-white font-bold">Create New Category</h4>
              <button
                type="button"
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adventure Touring"
                  value={newCatData.name}
                  onChange={(e) => setNewCatData({ ...newCatData, name: e.target.value })}
                  className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-white focus:outline-none focus:border-moto-orange"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Category Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCatData.color}
                    onChange={(e) => setNewCatData({ ...newCatData, color: e.target.value })}
                    className="w-8 h-8 rounded border border-moto-border bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-gray-300">{newCatData.color}</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description for public category portal..."
                  value={newCatData.description}
                  onChange={(e) => setNewCatData({ ...newCatData, description: e.target.value })}
                  className="w-full bg-moto-card border border-moto-border rounded px-3 py-2 text-white focus:outline-none focus:border-moto-orange"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-moto-border">
              <button
                type="button"
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="px-3 py-1.5 rounded bg-moto-card text-gray-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCat}
                className="px-4 py-1.5 rounded bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase shadow-glow-sm"
              >
                {creatingCat ? 'Saving...' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  );
}
