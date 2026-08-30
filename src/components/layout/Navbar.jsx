import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getPosts } from '../../lib/supabase';
import { 
  Search, Bookmark, ShieldCheck, User, LogOut, Menu, X, 
  Flame, Instagram, Youtube, Facebook, ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const { categories, bookmarks, user, logout, setIsSearchOpen, setIsAuthModalOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [latestPost, setLatestPost] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadLatest() {
      const posts = await getPosts({ limit: 1 });
      if (posts && posts.length > 0) {
        setLatestPost(posts[0]);
      }
    }
    loadLatest();
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) return null; // Admin has its own sidebar layout

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Bar */}
      <div className="bg-[#050505] border-b border-moto-border/60 text-xs py-1.5 px-4 text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="font-mono text-gray-500 uppercase tracking-widest text-[11px]">{formattedDate}</span>
            {latestPost && (
              <div className="hidden md:flex items-center gap-2 text-moto-orange font-medium">
                <Flame size={13} className="animate-pulse" />
                <span className="text-gray-300">LATEST STORY:</span>
                <Link to={`/article/${latestPost.slug}`} className="hover:underline text-gray-200 truncate max-w-xs">
                  {latestPost.title}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-gray-400">
              <a href="https://www.instagram.com/motoshift.in_official" target="_blank" rel="noreferrer" className="hover:text-moto-orange transition-colors">
                <Instagram size={14} />
              </a>
              <a href="https://youtube.com/@nandayvlogs8655" target="_blank" rel="noreferrer" className="hover:text-moto-orange transition-colors">
                <Youtube size={14} />
              </a>
              <a href="https://facebook.com/nandaydas" target="_blank" rel="noreferrer" className="hover:text-moto-orange transition-colors">
                <Facebook size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <nav className="glass-nav px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="MotoShift Logo" 
              className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col">
              <span className="font-display text-2xl font-black tracking-tight text-white leading-none">
                MOTO<span className="text-moto-orange">SHIFT</span><span className="text-xs font-sans text-gray-400 font-normal">.IN</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Raw Throttle Media</span>
            </div>
          </Link>

          {/* Desktop Categories Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              to="/" 
              className={`font-display text-sm uppercase font-semibold tracking-wider transition-colors ${
                location.pathname === '/' ? 'text-moto-orange border-b-2 border-moto-orange pb-0.5' : 'text-gray-300 hover:text-moto-orange'
              }`}
            >
              Latest
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`font-display text-sm uppercase font-semibold tracking-wider transition-colors ${
                  location.pathname === `/category/${cat.slug}` ? 'text-moto-orange border-b-2 border-moto-orange pb-0.5' : 'text-gray-300 hover:text-moto-orange'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Actions Right */}
          <div className="flex items-center gap-3">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-300 hover:text-moto-orange hover:bg-moto-panel rounded-lg transition-colors flex items-center gap-2 text-xs font-medium border border-moto-border/40"
              title="Search stories"
            >
              <Search size={17} />
              <span className="hidden md:inline font-mono text-[11px] text-gray-400">CMD+K</span>
            </button>

            {/* Bookmarks link */}
            <Link
              to="/bookmarks"
              className="relative p-2 text-gray-300 hover:text-moto-orange hover:bg-moto-panel rounded-lg transition-colors border border-moto-border/40"
              title="Saved Bookmarks"
            >
              <Bookmark size={17} />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-moto-orange text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </Link>

            {/* User Profile / Auth Toggle */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-moto-border hover:border-moto-orange transition-colors bg-moto-panel"
                >
                  <img 
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-moto-orange" 
                  />
                  <span className="hidden md:inline text-xs font-semibold text-white max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-moto-panel border border-moto-border rounded-lg shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-moto-border mb-1">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-gray-400 capitalize">{user.role} role</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-moto-orange hover:bg-moto-border/50 font-semibold"
                      >
                        <ShieldCheck size={14} />
                        Admin CMS Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-moto-border/50"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-moto-border flex flex-col gap-3 pb-2 animate-fadeIn">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="font-display uppercase text-sm tracking-wider font-semibold py-1.5 px-2 hover:bg-moto-panel rounded text-moto-orange"
            >
              Home / Latest
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="font-display uppercase text-sm tracking-wider font-semibold py-1.5 px-2 hover:bg-moto-panel rounded text-gray-200"
              >
                {cat.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-moto-border flex items-center justify-between">
              <Link 
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-moto-orange flex items-center gap-1"
              >
                <ShieldCheck size={16} /> Admin CMS Portal
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
