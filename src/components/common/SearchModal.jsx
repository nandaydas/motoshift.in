import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getPosts } from '../../lib/supabase';
import { Search, X, ArrowRight } from 'lucide-react';

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, categories } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await getPosts({ search: query, limit: 6 });
      setResults(res);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-moto-panel border border-moto-border rounded-xl shadow-2xl overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-moto-border flex items-center gap-3">
          <Search size={20} className="text-moto-orange" />
          <input
            type="text"
            autoFocus
            placeholder="Search reviews, routes, gear, riders, motorcycle specs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-500 font-sans text-base focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories Quick Filter Pills */}
        <div className="px-4 py-2 bg-[#0d0d0d] border-b border-moto-border/50 flex flex-wrap gap-2 text-xs">
          <span className="text-gray-500 py-1">Quick categories:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setIsSearchOpen(false);
                navigate(`/category/${cat.slug}`);
              }}
              className="bg-moto-dark border border-moto-border/60 hover:border-moto-orange px-2.5 py-1 rounded text-gray-300 hover:text-white transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm animate-pulse">
              Searching MotoShift archives...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs uppercase font-mono text-gray-400">Search Results ({results.length})</p>
              {results.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(`/article/${post.slug}`);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-moto-card cursor-pointer group border border-transparent hover:border-moto-border transition-all"
                >
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-14 h-14 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-moto-orange uppercase">{post.category?.name}</span>
                    <h4 className="font-heading text-sm text-white group-hover:text-moto-orange transition-colors truncate">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">{post.excerpt}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-500 group-hover:text-moto-orange shrink-0" />
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              No matching stories found for "<span className="text-white">{query}</span>".
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-gray-500">
              Type any motorcycle model, location, helmet brand, or topic to search across all published posts.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
