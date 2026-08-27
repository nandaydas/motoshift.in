import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getPosts } from '../lib/supabase';
import ArticleCard from '../components/common/ArticleCard';
import { Bookmark } from 'lucide-react';

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark } = useApp();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      setLoading(true);
      const allPosts = await getPosts();
      const filtered = allPosts.filter(p => bookmarks.includes(p.id));
      setSavedPosts(filtered);
      setLoading(false);
    }
    loadBookmarks();
  }, [bookmarks]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      
      <div className="flex items-center justify-between border-b border-moto-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-moto-orange/10 text-moto-orange rounded-lg border border-moto-orange/30">
            <Bookmark size={24} />
          </div>
          <div>
            <h1 className="font-heading text-3xl text-white font-extrabold">Saved Articles</h1>
            <p className="text-xs text-gray-400">Your personal reading list saved for offline reference</p>
          </div>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-moto-panel px-3 py-1.5 rounded border border-moto-border">
          {savedPosts.length} Stories Saved
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-mono text-sm animate-pulse">
          Loading saved reading list...
        </div>
      ) : savedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPosts.map((post) => (
            <ArticleCard key={post.id} post={post} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 bg-moto-card border border-moto-border rounded-xl">
          <Bookmark size={40} className="mx-auto text-gray-600" />
          <h3 className="font-heading text-xl text-white">No Saved Articles Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Click the bookmark icon on any article while browsing to save it to your reading list.
          </p>
        </div>
      )}

    </div>
  );
}
