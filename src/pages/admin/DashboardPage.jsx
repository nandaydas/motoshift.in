import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPostsAdmin, getContactSubmissionsAdmin, getPendingCommentsAdmin } from '../../lib/supabase';
import { FileText, Eye, MessageSquare, Mail, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const [posts, setPosts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      const [p, c, comm] = await Promise.all([
        getAllPostsAdmin(),
        getContactSubmissionsAdmin(),
        getPendingCommentsAdmin()
      ]);
      setPosts(p);
      setContacts(c);
      setComments(comm);
      setLoading(false);
    }
    loadMetrics();
  }, []);

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const unreadContacts = contacts.filter(c => c.status === 'unread').length;
  const pendingComments = comments.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-8">
      
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-moto-panel p-6 rounded-xl border border-moto-border shadow-xl">
        <div>
          <h1 className="font-heading text-2xl text-white font-extrabold">EDITORIAL DASHBOARD</h1>
          <p className="text-xs text-gray-400">Overview of MotoShift publishing analytics and pending tasks.</p>
        </div>

        <Link
          to="/admin/posts/new"
          className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-glow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-mono uppercase">Total Articles</span>
            <FileText size={18} className="text-moto-orange" />
          </div>
          <p className="font-heading text-3xl text-white font-bold">{posts.length}</p>
          <p className="text-[11px] text-gray-400">{posts.filter(p => p.status === 'published').length} published</p>
        </div>

        <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-mono uppercase">Total Article Views</span>
            <Eye size={18} className="text-emerald-400" />
          </div>
          <p className="font-heading text-3xl text-white font-bold">{totalViews.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 font-semibold">+14.2% this week</p>
        </div>

        <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-mono uppercase">Pending Comments</span>
            <MessageSquare size={18} className="text-amber-400" />
          </div>
          <p className="font-heading text-3xl text-white font-bold">{pendingComments}</p>
          <Link to="/admin/comments" className="text-[11px] text-amber-400 hover:underline">Review comments →</Link>
        </div>

        <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-mono uppercase">Unread Messages</span>
            <Mail size={18} className="text-blue-400" />
          </div>
          <p className="font-heading text-3xl text-white font-bold">{unreadContacts}</p>
          <Link to="/admin/contact" className="text-[11px] text-blue-400 hover:underline">View inbox →</Link>
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="bg-moto-card border border-moto-border rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-moto-border flex items-center justify-between">
          <h3 className="font-heading text-lg text-white font-bold">Recent Articles</h3>
          <Link to="/admin/posts" className="text-xs text-moto-orange hover:underline font-bold uppercase">
            View All Posts ({posts.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0c0c0c] uppercase font-mono text-[10px] text-gray-500 border-b border-moto-border">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-moto-border/40">
              {posts.slice(0, 5).map((post) => (
                <tr key={post.id} className="hover:bg-moto-panel transition-colors">
                  <td className="px-4 py-3.5 font-bold text-white max-w-xs truncate">
                    {post.title}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-moto-orange font-bold uppercase text-[10px]">
                      {post.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      post.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono">{post.views || 0}</td>
                  <td className="px-4 py-3.5 text-gray-400 text-[11px]">
                    {post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : 'Draft'}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="text-moto-orange hover:underline font-bold text-[11px]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
