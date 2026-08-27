import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug, getPosts, getCommentsForPost, submitComment, incrementPostViews } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import ArticleCard from '../components/common/ArticleCard';
import { Clock, Eye, Bookmark, Share2, MessageSquare, Send, CheckCircle2, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { marked } from 'marked';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { isBookmarked, toggleBookmark, showToast } = useApp();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comment Form State
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      const article = await getPostBySlug(slug);
      setPost(article);

      if (article?.id) {
        incrementPostViews(article.id);
        const comms = await getCommentsForPost(article.id);
        setComments(comms);
      }

      // Load related posts
      const allPosts = await getPosts({ limit: 4 });
      setRelatedPosts(allPosts.filter(p => p.slug !== slug).slice(0, 3));
      setLoading(false);
    }
    loadPost();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-moto-orange border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 font-mono text-sm">Loading article story...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading text-3xl text-white">Article Not Found</h2>
        <p className="text-gray-400">The story you are looking for does not exist or has been archived.</p>
        <Link to="/" className="inline-block bg-moto-orange text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider">
          Return to News Portal
        </Link>
      </div>
    );
  }

  const bookmarked = isBookmarked(post.id);
  const categoryName = post.category?.name || 'General';
  const categoryColor = post.category?.color || '#ff5500';
  const formattedDate = post.published_at 
    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
    : 'Recently';

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Article link copied to clipboard!', 'success');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName || !commentText) return;
    setSubmittingComment(true);
    await submitComment({
      postId: post.id,
      name: commentName,
      email: commentEmail,
      comment: commentText
    });
    setSubmittingComment(false);
    setCommentSubmitted(true);
    setCommentText('');
    showToast('Comment submitted for moderation!', 'success');
  };

  return (
    <article className="min-h-screen pb-20">
      
      {/* Top Breadcrumb Header */}
      <div className="bg-[#080808] border-b border-moto-border/60 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <Link to="/" className="flex items-center gap-1 hover:text-moto-orange transition-colors">
            <ChevronLeft size={14} /> Back to Portal
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-moto-orange font-bold uppercase">{categoryName}</span>
            <span>/</span>
            <span className="truncate max-w-xs text-gray-300">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        
        {/* Article Meta Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span 
              className="badge-orange"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryName}
            </span>
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
              <Clock size={13} /> {post.reading_time || 5} min read
            </span>
            <span className="text-xs font-mono text-gray-400 flex items-center gap-1 ml-auto">
              <Eye size={13} /> {post.views || 102} views
            </span>
          </div>

          <h1 className="font-heading text-3xl md:text-5xl text-white font-extrabold leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-gray-300 leading-relaxed font-light">
            {post.excerpt}
          </p>

          {/* Author Card & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-moto-border text-xs">
            <div className="flex items-center gap-3">
              <img
                src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={post.author?.name || 'Author'}
                className="w-10 h-10 rounded-full object-cover border-2 border-moto-orange"
              />
              <div>
                <p className="font-bold text-white text-sm">{post.author?.name || 'MotoShift Staff'}</p>
                <p className="text-gray-400">Published {formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleBookmark(post.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  bookmarked 
                    ? 'bg-moto-orange border-moto-orange text-white' 
                    : 'bg-moto-panel border-moto-border text-gray-300 hover:border-moto-orange'
                }`}
              >
                <Bookmark size={15} className={bookmarked ? 'fill-white' : ''} />
                <span>{bookmarked ? 'Saved' : 'Save Story'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-moto-panel border border-moto-border text-gray-300 hover:border-moto-orange text-xs font-semibold transition-colors"
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="rounded-xl overflow-hidden border border-moto-border shadow-2xl">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Rendered Article Content (Markdown / HTML) */}
        <div 
          className="prose prose-invert max-w-none prose-headings:font-heading prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-moto-orange prose-blockquote:border-l-4 prose-blockquote:border-moto-orange prose-blockquote:bg-moto-card prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r font-sans text-base space-y-6"
          dangerouslySetInnerHTML={{ __html: post.content ? (post.content.trim().startsWith('<') ? post.content : marked.parse(post.content)) : '' }}
        />

        {/* Author Bio Box */}
        <div className="bg-moto-card border border-moto-border rounded-xl p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <img
            src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={post.author?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-moto-orange shrink-0"
          />
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-heading font-bold text-white text-base">Written by {post.author?.name || 'Nanday Das'}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {post.author?.bio || 'Senior motorcycle journalist, track rider, and founder of MotoShift.in. Obsessed with high-rpm inline triples and long-distance mountain expeditions.'}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <section className="pt-8 border-t border-moto-border space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-moto-orange" />
            <h3 className="font-heading text-2xl text-white">Reader Discussion ({comments.length})</h3>
          </div>

          {/* List Approved Comments */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="p-4 bg-moto-panel border border-moto-border/60 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-moto-orange/20 text-moto-orange rounded-full flex items-center justify-center font-bold text-[10px]">
                        {c.name.charAt(0)}
                      </div>
                      <span className="font-bold text-white">{c.name}</span>
                    </div>
                    <span className="text-gray-500 font-mono">
                      {c.created_at ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true }) : 'Recently'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed pl-8">
                    {c.comment}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>

          {/* Comment Submission Form */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-4">
            <h4 className="font-heading text-lg text-white">Leave a Comment</h4>
            
            {commentSubmitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Thank you! Your comment has been submitted and is pending moderation.</span>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Rider"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Email Address (Private)</label>
                    <input
                      type="email"
                      placeholder="rider@example.com"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Your Comment *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience or thought on this story..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded shadow-glow-sm transition-colors flex items-center gap-2"
                >
                  <Send size={13} />
                  <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Related Articles Grid */}
        {relatedPosts.length > 0 && (
          <section className="pt-10 border-t border-moto-border space-y-6">
            <h3 className="font-heading text-2xl text-white">More Stories You Might Like</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <ArticleCard key={post.id} post={post} variant="grid" />
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  );
}
