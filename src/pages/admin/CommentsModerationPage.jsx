import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, Trash2 } from 'lucide-react';

export default function CommentsModerationPage() {
  const { showToast } = useApp();
  const [comments, setComments] = useState([
    { id: 'c-1', name: 'Arjun K.', email: 'arjun@example.com', comment: 'Amazing review! The triple engine powerband sounds incredible.', post_title: '2026 Triumph Daytona 660 Track Test', status: 'approved', date: '2 hours ago' },
    { id: 'c-2', name: 'Priya Verma', email: 'priya@example.com', comment: 'Added this route to my Spiti ride bucket list for next month.', post_title: 'Riding the Spiti Circuit on a KTM Adventure 390', status: 'approved', date: '5 hours ago' },
    { id: 'c-3', name: 'Karan Shah', email: 'karan@example.com', comment: 'Where can we buy the ECE 22.06 certified Alpinestars helmet in India?', post_title: 'Top 5 Carbon Fiber ECE 22.06 Race Helmets', status: 'pending', date: '1 day ago' },
  ]);

  const updateStatus = (id, newStatus) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: newStatus } : c));
    showToast(`Comment set to ${newStatus}`, 'info');
  };

  const deleteComment = (id) => {
    setComments(comments.filter(c => c.id !== id));
    showToast('Comment deleted', 'info');
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="font-heading text-2xl text-white font-extrabold">COMMENTS MODERATION</h1>
        <p className="text-xs text-gray-400">Review, approve, or remove reader comments across articles.</p>
      </div>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between text-xs gap-2 border-b border-moto-border pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{c.name}</span>
                <span className="text-gray-500">({c.email})</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                c.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {c.status}
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">"{c.comment}"</p>
            <p className="text-[11px] text-gray-500">Article: <span className="text-moto-orange">{c.post_title}</span></p>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              {c.status === 'pending' && (
                <button
                  onClick={() => updateStatus(c.id, 'approved')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center gap-1"
                >
                  <Check size={14} /> Approve
                </button>
              )}
              <button
                onClick={() => deleteComment(c.id)}
                className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded font-bold flex items-center gap-1"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
