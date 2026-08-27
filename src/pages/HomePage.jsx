import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, getCategories, subscribeNewsletter } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import ArticleCard from '../components/common/ArticleCard';
import { Flame, Compass, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { categories, showToast } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getPosts();
      setPosts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const heroPost = posts[0];
  const headlinePosts = posts.slice(1, 4);
  const reviewPosts = posts.filter(p => p.category?.slug === 'reviews' || p.category_id === 'cat-1').slice(0, 3);
  const routePosts = posts.filter(p => p.category?.slug === 'routes' || p.category_id === 'cat-2').slice(0, 3);
  const culturePosts = posts.filter(p => p.category?.slug === 'culture' || p.category_id === 'cat-3').slice(0, 3);
  const gearPosts = posts.filter(p => p.category?.slug === 'gear' || p.category_id === 'cat-4').slice(0, 3);

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category?.slug === activeCategory || p.category_id === activeCategory);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    await subscribeNewsletter(newsletterEmail);
    setNewsletterSubscribed(true);
    showToast('Subscribed to MotoShift waitlist!', 'success');
  };

  return (
    <div className="min-h-screen space-y-12 pb-12">
      
      {/* Hero Section: Featured Main Story + Top Headlines Sidebar */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        {loading ? (
          <div className="h-[480px] bg-moto-card rounded-xl border border-moto-border animate-pulse flex items-center justify-center text-gray-500 font-mono">
            Loading MotoShift featured stories...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hero Main Feature (2 cols) */}
            <div className="lg:col-span-2">
              <ArticleCard post={heroPost} variant="hero" />
            </div>

            {/* Top Headlines Sidebar (1 col) */}
            <div className="bg-moto-card rounded-xl border border-moto-border p-5 flex flex-col justify-between space-y-4 shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-moto-border">
                  <div className="flex items-center gap-2">
                    <Flame className="text-moto-orange animate-pulse" size={18} />
                    <h3 className="font-heading text-lg font-bold text-white tracking-wider">Top Headlines</h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-moto-orange/10 text-moto-orange px-2 py-0.5 rounded border border-moto-orange/30">Live Update</span>
                </div>

                <div className="divide-y divide-moto-border/50">
                  {headlinePosts.map((post, idx) => (
                    <ArticleCard key={post.id} post={post} variant="compact" index={idx} />
                  ))}
                </div>
              </div>

              {/* Quick Waitlist Box */}
              <div className="p-3.5 bg-[#0d0d0d] rounded-lg border border-moto-orange/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Zap size={14} className="text-moto-orange" />
                  <span>EARLY ACCESS WAITLIST</span>
                </div>
                <p className="text-[11px] text-gray-400">Get track day invites & route GPX files before anyone else.</p>
                <form onSubmit={handleNewsletter} className="flex gap-1.5 pt-1">
                  <input
                    type="email"
                    required
                    placeholder="your email..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-moto-panel border border-moto-border rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                  />
                  <button type="submit" className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold px-3 py-1.5 rounded transition-colors">
                    Join
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Reviews & Test Rides Section */}
      {reviewPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between border-b border-moto-border pb-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-moto-orange rounded-sm" />
              <h2 className="font-heading text-2xl font-extrabold text-white tracking-wide">
                Reviews & Test Rides
              </h2>
            </div>
            <Link to="/category/reviews" className="text-xs text-moto-orange hover:underline font-bold uppercase tracking-wider">
              View All Reviews →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewPosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="grid" />
            ))}
          </div>
        </section>
      )}

      {/* Epic Routes Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden border border-moto-border bg-gradient-to-r from-black via-moto-panel to-black p-8 md:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="badge-orange bg-emerald-600">Rider Routes & GPX</span>
            <h2 className="font-heading text-3xl md:text-4xl text-white font-extrabold leading-tight">
              UNFILTERED INDIAN RIDING ROUTES
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              From the high-altitude passes of Spiti and Ladakh to the winding coastal curves of Konkan, explore vetted route maps, fuel stop details, and mountain pass status.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/category/routes" className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded shadow-glow-orange transition-all flex items-center gap-2">
                <Compass size={16} />
                <span>Explore Route Guides</span>
              </Link>
              <Link to="/article/spiti-circuit-ktm-390-adventure-guide" className="bg-moto-card hover:bg-moto-border text-gray-200 border border-moto-border text-xs font-bold uppercase tracking-wider px-5 py-3 rounded transition-all">
                Read Spiti Circuit Guide
              </Link>
            </div>
          </div>

          {/* Decorative background image */}
          <img
            src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"
            alt="Spiti Route"
            className="absolute right-0 top-0 bottom-0 w-1/2 object-cover opacity-25 mix-blend-luminosity hidden md:block"
          />
        </div>
      </section>

      {/* Filterable Feed Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-moto-border pb-4 mb-6 gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-moto-orange" size={20} />
            <h2 className="font-heading text-2xl font-extrabold text-white tracking-wide">
              All Stories & Media
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                activeCategory === 'all' ? 'bg-moto-orange text-white' : 'bg-moto-panel text-gray-400 hover:text-white border border-moto-border'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeCategory === cat.slug ? 'bg-moto-orange text-white' : 'bg-moto-panel text-gray-400 hover:text-white border border-moto-border'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <ArticleCard key={post.id} post={post} variant="grid" />
          ))}
        </div>
      </section>

      {/* Newsletter Full Banner */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-moto-card border border-moto-orange/40 rounded-2xl p-8 md:p-12 text-center space-y-4 shadow-glow-sm">
          <div className="w-14 h-14 bg-moto-orange/20 border border-moto-orange rounded-full flex items-center justify-center mx-auto text-moto-orange">
            <Zap size={28} />
          </div>
          <h3 className="font-heading text-3xl text-white font-bold">JOIN THE MOTOSHIFT RIDER WAITLIST</h3>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Subscribe to receive raw bike reviews, route telemetry, track day schedules, and gear deals directly to your inbox.
          </p>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-lg text-sm font-semibold">
              <CheckCircle2 size={18} />
              <span>You are on the early-access waitlist!</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="max-w-md mx-auto flex gap-2 pt-2">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-moto-panel border border-moto-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
              />
              <button
                type="submit"
                className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg shadow-glow-sm transition-all"
              >
                Join Waitlist
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
