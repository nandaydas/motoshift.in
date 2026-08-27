import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPosts, getCategories } from '../lib/supabase';
import ArticleCard from '../components/common/ArticleCard';

export default function CategoryPage() {
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    async function loadCategoryPosts() {
      setLoading(true);
      const cats = await getCategories();
      const cat = cats.find(c => c.slug === slug);
      setCategory(cat || { name: slug.toUpperCase(), description: `Explore all posts under ${slug}` });

      const data = await getPosts({ categorySlug: slug });
      setPosts(data);
      setLoading(false);
    }
    loadCategoryPosts();
    window.scrollTo(0, 0);
  }, [slug]);

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
    return new Date(b.published_at || 0) - new Date(a.published_at || 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      
      {/* Category Banner Header */}
      <div 
        className="p-8 md:p-12 rounded-2xl border border-moto-border bg-moto-card relative overflow-hidden shadow-2xl"
        style={{ borderLeftColor: category?.color || '#ff5500', borderLeftWidth: '6px' }}
      >
        <div className="space-y-3 relative z-10 max-w-2xl">
          <span 
            className="badge-orange"
            style={{ backgroundColor: category?.color || '#ff5500' }}
          >
            Category Feed
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-white font-extrabold tracking-wide uppercase">
            {category?.name}
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            {category?.description || `Discover the latest news, in-depth reviews, and stories in ${category?.name}.`}
          </p>
        </div>
      </div>

      {/* Sort Filter Bar */}
      <div className="flex items-center justify-between border-b border-moto-border pb-4">
        <span className="text-xs font-mono text-gray-400">Showing {posts.length} articles</span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Sort by:</span>
          <button
            onClick={() => setSortBy('latest')}
            className={`px-3 py-1 rounded font-bold uppercase ${
              sortBy === 'latest' ? 'bg-moto-orange text-white' : 'bg-moto-panel text-gray-400'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1 rounded font-bold uppercase ${
              sortBy === 'popular' ? 'bg-moto-orange text-white' : 'bg-moto-panel text-gray-400'
            }`}
          >
            Most Viewed
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-mono text-sm animate-pulse">
          Loading category articles...
        </div>
      ) : sortedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <ArticleCard key={post.id} post={post} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3">
          <p className="text-gray-400">No published articles in this category yet.</p>
        </div>
      )}

    </div>
  );
}
