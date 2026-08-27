import React, { useEffect, useState } from 'react';
import { getContactSubmissionsAdmin } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

export default function ContactSubmissionsPage() {
  const { showToast } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getContactSubmissionsAdmin();
      setMessages(data);
      setLoading(false);
    }
    load();
  }, []);

  const toggleRead = (id) => {
    setMessages(messages.map(m => m.id === id ? { ...m, status: m.status === 'read' ? 'unread' : 'read' } : m));
    showToast('Message status updated', 'info');
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="font-heading text-2xl text-white font-extrabold">CONTACT FORM INBOX</h1>
        <p className="text-xs text-gray-400">Reader messages and sponsorship inquiries submitted via public contact form.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-mono text-sm animate-pulse">
          Loading contact inbox...
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`p-5 rounded-xl border transition-all ${
              m.status === 'unread' ? 'bg-moto-card border-moto-orange/50 shadow-lg' : 'bg-moto-panel border-moto-border/60 opacity-80'
            }`}>
              <div className="flex flex-wrap items-center justify-between text-xs gap-2 border-b border-moto-border pb-2 mb-3">
                <div>
                  <span className="font-bold text-white text-sm">{m.name}</span>
                  <span className="text-gray-400 ml-2 font-mono">({m.email})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-mono text-[11px]">
                    {m.created_at ? formatDistanceToNow(new Date(m.created_at), { addSuffix: true }) : 'Recently'}
                  </span>
                  <button
                    onClick={() => toggleRead(m.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.status === 'unread' ? 'bg-moto-orange text-white' : 'bg-moto-border text-gray-400'
                    }`}
                  >
                    {m.status}
                  </button>
                </div>
              </div>

              {m.subject && (
                <p className="font-heading text-sm text-moto-orange font-bold mb-2">
                  Subject: {m.subject}
                </p>
              )}

              <p className="text-xs text-gray-300 leading-relaxed bg-[#0a0a0a] p-3 rounded border border-moto-border/40">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500 italic text-sm">
          No contact submissions received yet.
        </div>
      )}

    </div>
  );
}
