import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-gray-300 min-h-screen">
      <h1 className="font-heading text-4xl text-white font-extrabold">PRIVACY POLICY</h1>
      <p className="text-xs text-gray-500 font-mono">Last updated: August 2026</p>

      <div className="prose prose-invert max-w-none text-sm space-y-4 leading-relaxed">
        <p>
          At <strong>MotoShift.in</strong>, we respect your privacy regarding any information we may collect while operating our website.
        </p>

        <h3 className="font-heading text-lg text-white font-bold">1. Information We Collect</h3>
        <p>
          We collect information you provide directly to us when subscribing to our waitlist, submitting reader comments, or contacting our editorial desk via form. This may include your name, email address, and message contents.
        </p>

        <h3 className="font-heading text-lg text-white font-bold">2. How We Use Information</h3>
        <p>
          We use collected information to send waitlist newsletters, process reader inquiries, display moderated reader comments, and analyze site performance via Google Analytics.
        </p>

        <h3 className="font-heading text-lg text-white font-bold">3. Data Security</h3>
        <p>
          Your data is stored securely using encrypted cloud database infrastructure and SSL/TLS connection protocols. We do not sell or rent reader emails to third parties.
        </p>
      </div>
    </div>
  );
}
