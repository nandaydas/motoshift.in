import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Bookmark, Clock, Eye, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ArticleCard({ post, variant = 'grid', index }) {
  const { isBookmarked, toggleBookmark } = useApp();

  if (!post) return null;

  const bookmarked = isBookmarked(post.id);
  const formattedDate = post.published_at 
    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
    : 'Recently';

  const categoryName = post.category?.name || 'General';
  const categoryColor = post.category?.color || '#ff5500';

  // Hero Variant (Featured Headline)
  if (variant === 'hero') {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-moto-border bg-moto-card shadow-2xl h-[480px] flex flex-col justify-end">
        {/* Cover Image Background */}
        <img
          src={post.cover_image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 space-y-3">
          <div className="flex items-center gap-3">
            <span 
              className="badge-orange"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryName}
            </span>
            <span className="text-xs font-mono text-gray-300 flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-0.5 rounded">
              <Clock size={12} /> {post.reading_time || 5} min read
            </span>
          </div>

          <Link to={`/article/${post.slug}`} className="block group-hover:text-moto-orange transition-colors">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight font-heading">
              {post.title}
            </h2>
          </Link>

          <p className="text-sm text-gray-300 line-clamp-2 max-w-2xl hidden md:block">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <img
                src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={post.author?.name || 'Author'}
                className="w-6 h-6 rounded-full object-cover border border-moto-orange"
              />
              <span className="text-gray-200 font-medium">{post.author?.name || 'Editorial Team'}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                toggleBookmark(post.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur transition-colors ${
                bookmarked ? 'bg-moto-orange text-white' : 'bg-black/50 text-gray-300 hover:text-white'
              }`}
              title="Bookmark story"
            >
              <Bookmark size={15} className={bookmarked ? 'fill-white' : ''} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Split Horizontal Variant
  if (variant === 'split') {
    return (
      <div className="group flex flex-col sm:flex-row gap-4 p-3 rounded-lg border border-moto-border/60 bg-moto-card hover:border-moto-orange/50 transition-all">
        <Link to={`/article/${post.slug}`} className="sm:w-2/5 shrink-0 h-44 sm:h-auto rounded overflow-hidden relative">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span 
            className="absolute top-2 left-2 badge-orange text-[10px] py-0.5 px-2"
            style={{ backgroundColor: categoryColor }}
          >
            {categoryName}
          </span>
        </Link>

        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {post.reading_time || 4} min</span>
            </div>

            <Link to={`/article/${post.slug}`} className="block group-hover:text-moto-orange transition-colors">
              <h3 className="font-heading font-bold text-lg text-white leading-snug">
                {post.title}
              </h3>
            </Link>

            <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-moto-border/40 text-xs text-gray-400">
            <span className="text-gray-300 font-medium text-[11px]">{post.author?.name || 'MotoShift Staff'}</span>
            <button
              onClick={() => toggleBookmark(post.id)}
              className="text-gray-400 hover:text-moto-orange p-1"
            >
              <Bookmark size={15} className={bookmarked ? 'fill-moto-orange text-moto-orange' : ''} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compact Variant (Headline list with rank number)
  if (variant === 'compact') {
    return (
      <div className="group flex items-start gap-3 py-3 border-b border-moto-border/40 last:border-0">
        {index !== undefined && (
          <span className="font-display font-extrabold text-2xl text-moto-orange/80 leading-none min-w-[24px]">
            0{index + 1}
          </span>
        )}
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="text-moto-orange font-bold uppercase">{categoryName}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
          <Link to={`/article/${post.slug}`} className="block font-heading text-sm text-gray-100 group-hover:text-moto-orange transition-colors leading-snug">
            {post.title}
          </Link>
        </div>
      </div>
    );
  }

  // Grid Standard Variant
  return (
    <div className="group flex flex-col rounded-xl overflow-hidden border border-moto-border/60 bg-moto-card hover:border-moto-orange/50 transition-all duration-300 shadow-lg">
      <Link to={`/article/${post.slug}`} className="relative h-48 overflow-hidden block">
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
        />
        <span 
          className="absolute top-3 left-3 badge-orange text-[10px]"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryName}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleBookmark(post.id);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur transition-colors ${
            bookmarked ? 'bg-moto-orange text-white' : 'bg-black/60 text-gray-300 hover:text-white'
          }`}
        >
          <Bookmark size={14} className={bookmarked ? 'fill-white' : ''} />
        </button>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {post.reading_time || 4}m</span>
            {post.views && (
              <span className="flex items-center gap-1 ml-auto"><Eye size={11} /> {post.views}</span>
            )}
          </div>

          <Link to={`/article/${post.slug}`} className="block group-hover:text-moto-orange transition-colors">
            <h3 className="font-heading font-bold text-base text-white leading-snug line-clamp-2">
              {post.title}
            </h3>
          </Link>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-moto-border/40 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-moto-orange" />
            <span className="text-gray-300 font-medium text-[11px]">{post.author?.name || 'Staff Rider'}</span>
          </div>
          <Link to={`/article/${post.slug}`} className="text-moto-orange hover:underline text-[11px] font-bold uppercase tracking-wider">
            Read →
          </Link>
        </div>
      </div>
    </div>
  );
}
