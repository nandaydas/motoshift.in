import React, { useState } from 'react';
import { submitContactForm } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Mail, Send, CheckCircle2, MapPin, Instagram, Youtube, Facebook } from 'lucide-react';

export default function ContactPage() {
  const { showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    await submitContactForm({ name, email, subject, message });
    setLoading(false);
    setSubmitted(true);
    showToast('Message sent to MotoShift editorial team!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 min-h-screen">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="badge-orange">Contact Editorial Desk</span>
        <h1 className="font-heading text-4xl text-white font-extrabold">GET IN TOUCH WITH MOTOSHIFT</h1>
        <p className="text-sm text-gray-300 max-w-xl mx-auto">
          Have a motorcycle news tip, review request, sponsorship inquiry, or route suggestion? Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact info sidebar */}
        <div className="space-y-6">
          <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-4">
            <h4 className="font-heading text-base text-white font-bold border-b border-moto-border pb-2">Editorial Desk</h4>
            
            <div className="flex items-start gap-3 text-xs text-gray-300">
              <Mail size={16} className="text-moto-orange shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">General & Press Inquiries</p>
                <p className="text-gray-400">editorial@motoshift.in</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-gray-300">
              <MapPin size={16} className="text-moto-orange shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Location</p>
                <p className="text-gray-400">Bengaluru & Tripura, India</p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-3 text-xs">
            <h4 className="font-heading text-base text-white font-bold">Official Handles</h4>
            <div className="space-y-2">
              <a href="https://www.instagram.com/motoshift.in_official" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-moto-orange">
                <Instagram size={16} /> @motoshift.in_official
              </a>
              <a href="https://youtube.com/@nandayvlogs8655" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-moto-orange">
                <Youtube size={16} /> @nandayvlogs8655
              </a>
              <a href="https://facebook.com/nandaydas" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-moto-orange">
                <Facebook size={16} /> nandaydas
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-moto-panel border border-moto-border rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="font-heading text-xl text-white font-bold">Send Us a Direct Message</h3>

          {submitted ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm space-y-2 text-center">
              <CheckCircle2 size={36} className="mx-auto" />
              <h4 className="font-bold text-lg text-white">Message Delivered!</h4>
              <p className="text-xs text-gray-300">
                Thank you for reaching out. Our editorial team will review your message and get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
                className="mt-4 bg-moto-orange text-white text-xs font-bold uppercase px-4 py-2 rounded"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-moto-card border border-moto-border rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-moto-card border border-moto-border rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Subject / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Motorcycle Review Request / Press Release"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-moto-card border border-moto-border rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Your Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-moto-card border border-moto-border rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-moto-orange"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg shadow-glow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>{loading ? 'Sending...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
