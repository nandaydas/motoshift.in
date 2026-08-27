import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPostsAdmin, deletePostAdmin } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Search, Edit3, Trash2, Eye, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PostsListPage() {
  const { showToast } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const data = await getAllPostsAdmin();
    setPosts(data);
    setLoading(false);
  }

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deletePostAdmin(id);
      showToast('Article deleted', 'info');
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & New Article CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-white font-extrabold">MANAGE ARTICLES</h1>
          <p className="text-xs text-gray-400">View, edit, or publish news and review articles.</p>
        </div>

        <Link
          to="/admin/posts/new"
          className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-glow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>New Article</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-moto-panel border border-moto-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by article title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-moto-card border border-moto-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full md:w-auto">
          <span className="text-gray-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-moto-card border border-moto-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-moto-orange"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-moto-card border border-moto-border rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-mono text-sm animate-pulse">
            Loading articles table...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0c0c0c] uppercase font-mono text-[10px] text-gray-500 border-b border-moto-border">
                <tr>
                  <th className="px-4 py-3">Cover</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-moto-border/40">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-moto-panel transition-colors">
                    <td className="px-4 py-3">
                      <img
                        src={post.cover_image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80'}
                        alt=""
                        className="w-12 h-10 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-white max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-moto-orange font-bold uppercase text-[10px]">
                        {post.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        post.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{post.views || 0}</td>
                    <td className="px-4 py-3 text-gray-400 text-[11px]">
                      {post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : 'Draft'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <Link
                        to={`/article/${post.slug}`}
                        target="_blank"
                        className="text-gray-400 hover:text-white inline-block"
                        title="View Public Story"
                      >
                        <ExternalLink size={15} />
                      </Link>
                      <Link
                        to={`/admin/posts/edit/${post.id}`}
                        className="text-moto-orange hover:text-white font-bold text-xs inline-block"
                        title="Edit Article"
                      >
                        <Edit3 size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="text-red-400 hover:text-red-300 inline-block"
                        title="Delete Article"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
