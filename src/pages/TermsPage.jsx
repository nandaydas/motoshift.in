import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-gray-300 min-h-screen">
      <h1 className="font-heading text-4xl text-white font-extrabold">TERMS OF SERVICE</h1>
      <p className="text-xs text-gray-500 font-mono">Last updated: August 2026</p>

      <div className="prose prose-invert max-w-none text-sm space-y-4 leading-relaxed">
        <p>
          Welcome to <strong>MotoShift.in</strong>. By accessing or using our media portal, you agree to comply with the following terms.
        </p>

        <h3 className="font-heading text-lg text-white font-bold">1. Content Intellectual Property</h3>
        <p>
          All motorcycle review articles, photographs, route guides, GPX telemetry, and branding elements are the exclusive intellectual property of MotoShift.in unless stated otherwise.
        </p>

        <h3 className="font-heading text-lg text-white font-bold">2. Riding Safety & Route Disclaimer</h3>
        <p>
          Riding routes, mountain pass conditions, and track specs are provided for informational purposes. Riders are solely responsible for verifying local weather, road closures, wearing full protective gear, and abiding by speed laws.
        </p>

        <h3 className="font-heading text-lg text-white font-bold">3. User Conduct in Comments</h3>
        <p>
          Reader comments must remain respectful and relevant. Harassment, spam, or abusive language will result in comment deletion and IP bans.
        </p>
      </div>
    </div>
  );
}
