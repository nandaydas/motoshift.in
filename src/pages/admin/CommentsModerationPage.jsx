import React, { useEffect, useState } from 'react';
import { getPendingCommentsAdmin, updateCommentStatusAdmin, deleteCommentAdmin } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CommentsModerationPage() {
  const { showToast } = useApp();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    setLoading(true);
    const data = await getPendingCommentsAdmin();
    setComments(data);
    setLoading(false);
  }

  const handleUpdateStatus = async (id, newStatus) => {
    await updateCommentStatusAdmin(id, newStatus);
    setComments(comments.map(c => c.id === id ? { ...c, status: newStatus } : c));
    showToast(`Comment set to ${newStatus}`, 'info');
  };

  const handleDeleteComment = async (id) => {
    await deleteCommentAdmin(id);
    setComments(comments.filter(c => c.id !== id));
    showToast('Comment deleted', 'info');
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="font-heading text-2xl text-white font-extrabold">COMMENTS MODERATION</h1>
        <p className="text-xs text-gray-400">Review, approve, or remove reader comments across published articles.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-mono text-sm animate-pulse">
          Loading comments from Supabase...
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs gap-2 border-b border-moto-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{c.name}</span>
                  {c.email && <span className="text-gray-500">({c.email})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-mono text-[11px]">
                    {c.created_at ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true }) : ''}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    c.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">"{c.comment}"</p>
              {c.post?.title && (
                <p className="text-[11px] text-gray-500">Article: <span className="text-moto-orange">{c.post.title}</span></p>
              )}

              <div className="flex justify-end gap-2 pt-2 text-xs">
                {c.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'approved')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center gap-1"
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded font-bold flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500 italic text-sm">
          No pending or submitted comments found in database.
        </div>
      )}

    </div>
  );
}
