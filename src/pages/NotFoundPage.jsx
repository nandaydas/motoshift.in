import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home, Search, AlertTriangle, ChevronRight, Zap } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const quickCategories = [
    { name: 'Superbikes', slug: 'superbikes' },
    { name: 'Motorcycle News', slug: 'motorcycle-news' },
    { name: 'Electric Moto', slug: 'electric-moto' },
    { name: 'Track Reviews', slug: 'track-reviews' },
    { name: 'Gear & Safety', slug: 'gear-safety' },
  ];

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-3xl w-full text-center space-y-8 bg-moto-panel border border-moto-border p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Background Subtle Gradient Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-moto-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-moto-orange/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Hero Header */}
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-moto-orange/10 border border-moto-orange/30 rounded-full text-moto-orange text-xs font-mono font-bold">
            <AlertTriangle size={15} />
            <span>ERROR 404 • ROUTE UNCHARTED</span>
          </div>

          <h1 className="font-heading text-7xl md:text-9xl font-black text-white tracking-tighter leading-none select-none">
            4<span className="text-moto-orange">0</span>4
          </h1>

          <h2 className="font-heading text-xl md:text-2xl font-bold text-white uppercase tracking-wider">
            You've Ridden Off-Course!
          </h2>

          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            The page you're searching for might have been moved, renamed, or temporarily parked in the garage.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 bg-moto-card hover:bg-moto-border border border-moto-border text-xs text-gray-200 font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-3 bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-glow-orange transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} />
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Popular Categories Grid */}
        <div className="pt-6 border-t border-moto-border space-y-3 text-left relative z-10">
          <p className="text-xs uppercase font-mono text-gray-400 font-bold flex items-center gap-2">
            <Compass size={14} className="text-moto-orange" />
            <span>Popular MotoShift Destinations:</span>
          </p>

          <div className="flex flex-wrap gap-2">
            {quickCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="px-3.5 py-1.5 bg-[#141414] hover:bg-moto-card border border-moto-border hover:border-moto-orange text-xs text-gray-300 hover:text-white rounded-lg transition-all flex items-center gap-1 font-semibold group"
              >
                <span>{cat.name}</span>
                <ChevronRight size={12} className="text-gray-500 group-hover:text-moto-orange transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
