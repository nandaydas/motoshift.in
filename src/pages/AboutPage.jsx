import React from 'react';
import { Flame, Compass, Award, Instagram, Youtube, Facebook } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 min-h-screen">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="badge-orange">About MotoShift.in</span>
        <h1 className="font-heading text-4xl md:text-5xl text-white font-black tracking-wide">
          RAW THROTTLE MEDIA FOR INDIAN RIDERS
        </h1>
        <p className="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Unfiltered motorcycle test rides, high-speed track reviews, long-distance expedition GPX maps, and garage custom builds.
        </p>
      </div>

      {/* Hero Visual */}
      <div className="rounded-2xl overflow-hidden border border-moto-border shadow-2xl relative h-72">
        <img
          src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80"
          alt="MotoShift Culture"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div>
            <h3 className="font-heading text-2xl text-white font-extrabold">ESTABLISHED 2026</h3>
            <p className="text-xs text-gray-300">Independent Editorial Team</p>
          </div>
        </div>
      </div>

      {/* Mission Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-3">
          <div className="w-10 h-10 bg-moto-orange/20 text-moto-orange rounded-lg flex items-center justify-center">
            <Flame size={20} />
          </div>
          <h3 className="font-heading text-lg text-white font-bold">Unbiased Track & Street Tests</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            We don't do manufacturer PR spin. Every bike is benchmarked on real highways, city commutes, and race tracks.
          </p>
        </div>

        <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-3">
          <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
            <Compass size={20} />
          </div>
          <h3 className="font-heading text-lg text-white font-bold">Vetted Expedition Routes</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Tested mountain pass telemetry, fuel pump locations, tarmac quality updates, and downloadable route maps.
          </p>
        </div>

        <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-3">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center">
            <Award size={20} />
          </div>
          <h3 className="font-heading text-lg text-white font-bold">Rider Safety & Gear Standards</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Rigorous ECE 22.06 helmet evaluations, CE armor ratings, and real-world riding gear benchmarks.
          </p>
        </div>
      </div>

      {/* Editorial Founder Profile */}
      <div className="bg-moto-panel border border-moto-border rounded-2xl p-8 space-y-6">
        <h3 className="font-heading text-2xl text-white">Editorial Team</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
            alt="Nanday Das"
            className="w-24 h-24 rounded-full object-cover border-4 border-moto-orange shrink-0 shadow-glow-sm"
          />
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="font-heading text-xl text-white font-bold">Nanday Das</h4>
            <p className="text-xs text-moto-orange font-bold uppercase tracking-wider">Founder & Lead Test Rider</p>
            <p className="text-xs text-gray-300 leading-relaxed">
              Motorcycle enthusiast, adventure touring rider, and content creator behind MotoShift.in. Dedicated to delivering raw two-wheeled stories for Indian riding communities.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
              <a href="https://www.instagram.com/motoshift.in_official" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-moto-orange">
                <Instagram size={18} />
              </a>
              <a href="https://youtube.com/@nandayvlogs8655" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-moto-orange">
                <Youtube size={18} />
              </a>
              <a href="https://facebook.com/nandaydas" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-moto-orange">
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
