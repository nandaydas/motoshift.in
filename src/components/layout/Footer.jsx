import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { subscribeNewsletter } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Instagram, Youtube, Facebook, Send, Heart } from 'lucide-react';

export default function Footer() {
  const { categories, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return null;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await subscribeNewsletter(email);
    setLoading(false);
    setEmail('');
    showToast('Subscribed to MotoShift waitlist!', 'success');
  };

  return (
    <footer className="bg-[#050505] border-t border-moto-border mt-20 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-moto-orange rounded flex items-center justify-center font-display font-extrabold text-xl text-black shadow-glow-sm">
                M
              </div>
              <span className="font-display text-2xl font-black tracking-tight text-white">
                MOTO<span className="text-moto-orange">SHIFT</span><span className="text-xs font-sans text-gray-400 font-normal">.IN</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
              Your home for raw motorcycle reviews, epic route guides, track days, and unfiltered two-wheeled Indian moto culture. Built for riders, by riders.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com/mr_nanday" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-moto-panel border border-moto-border flex items-center justify-center text-gray-300 hover:text-moto-orange hover:border-moto-orange transition-colors">
                <Instagram size={17} />
              </a>
              <a href="https://youtube.com/@nandayvlogs8655" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-moto-panel border border-moto-border flex items-center justify-center text-gray-300 hover:text-moto-orange hover:border-moto-orange transition-colors">
                <Youtube size={17} />
              </a>
              <a href="https://facebook.com/nandaydas" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-moto-panel border border-moto-border flex items-center justify-center text-gray-300 hover:text-moto-orange hover:border-moto-orange transition-colors">
                <Facebook size={17} />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-display text-white font-bold uppercase tracking-wider text-sm mb-4 border-b border-moto-orange/40 pb-1.5 inline-block">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="hover:text-moto-orange transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional / Pages */}
          <div>
            <h4 className="font-display text-white font-bold uppercase tracking-wider text-sm mb-4 border-b border-moto-orange/40 pb-1.5 inline-block">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-moto-orange transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-moto-orange transition-colors">Contact Editorial</Link></li>
              <li><Link to="/privacy" className="hover:text-moto-orange transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-moto-orange transition-colors">Terms of Service</Link></li>
              <li><Link to="/admin" className="text-moto-orange font-semibold hover:underline">Admin CMS</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="font-display text-white font-bold uppercase tracking-wider text-sm mb-4 border-b border-moto-orange/40 pb-1.5 inline-block">
              Rider Waitlist
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Get weekly track breakdowns, route GPX files, and new bike launches delivered.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-moto-panel border border-moto-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-1.5 transition-colors shadow-glow-sm"
              >
                <Send size={13} />
                <span>{loading ? 'Joining...' : 'Subscribe'}</span>
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-moto-border/60 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} MotoShift.in. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart size={12} className="text-moto-orange fill-moto-orange" />
            <span>for the Indian riding community.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
