import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, RefreshCw, Download, Monitor, Smartphone, Globe, 
  ArrowUpRight, ArrowDownRight, Calendar, AlertCircle, BarChart3
} from 'lucide-react';

export default function AnalyticsPage() {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  async function fetchAnalyticsData() {
    setLoading(true);
    setApiError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || 'sb_publishable_v3fezo9RVI75FyozbavCbQ_z6zCEHR-';

      const res = await fetch('https://qugkwcwhnvzwmdknljky.supabase.co/functions/v1/fetch-google-analytics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': 'sb_publishable_v3fezo9RVI75FyozbavCbQ_z6zCEHR-',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Functions' })
      });

      const data = await res.json();

      if (res.ok && data && !data.error) {
        setAnalytics(data);
      } else {
        const errorMsg = data?.error || `HTTP ${res.status}: Failed to load live Analytics from Supabase Edge Function`;
        setApiError(errorMsg);
      }
    } catch (err) {
      console.error('Error calling fetch-google-analytics Edge Function:', err);
      setApiError('Network connection error to Supabase Edge Function.');
    }
    setLoading(false);
  }

  const handleSyncLive = async () => {
    setSyncing(true);
    showToast('Fetching live metric data from Supabase Edge Function...', 'info');
    await fetchAnalyticsData();
    setSyncing(false);
    showToast('Live Analytics updated!', 'success');
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Extract totals and change metrics directly from Supabase API
  const totals = analytics?.totals || {};
  const change = analytics?.change || {};

  const activeUsers = totals.activeUsers?.toLocaleString() ?? 0;
  const sessions = totals.sessions?.toLocaleString() ?? 0;
  const pageViews = totals.pageViews?.toLocaleString() ?? 0;
  const newUsers = totals.newUsers?.toLocaleString() ?? 0;
  const returningUsers = totals.returningUsers?.toLocaleString() ?? 0;

  const avgSec = totals.avgSessionDuration || 0;
  const avgDuration = `${Math.floor(avgSec / 60)}m ${Math.round(avgSec % 60)}s`;

  const bounceVal = totals.bounceRate || 0;
  const bounceRate = typeof bounceVal === 'number' ? `${(bounceVal * (bounceVal > 1 ? 1 : 100)).toFixed(1)}%` : '0%';

  const timeseries = Array.isArray(analytics?.timeseries) ? analytics.timeseries : [];
  const topPages = Array.isArray(analytics?.topPages) ? analytics.topPages : [];
  const topCountries = Array.isArray(analytics?.country) ? analytics.country : [];
  const trafficSources = Array.isArray(analytics?.trafficSource) ? analytics.trafficSource : [];
  const deviceCategories = Array.isArray(analytics?.deviceCategory) ? analytics.deviceCategory : [];

  const renderPercentBadge = (changeItem) => {
    const pct = changeItem?.percent;
    if (pct === null || pct === undefined) return <span className="text-gray-500 font-mono text-xs">--</span>;
    const isPos = pct >= 0;
    return (
      <div className={`flex items-center gap-0.5 text-xs font-mono font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{isPos ? '+' : ''}{pct.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-moto-border pb-4">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-3xl text-white font-extrabold tracking-wide">
            Analytics
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#141414] border border-moto-border rounded-full text-xs text-gray-300 font-mono">
            <Calendar size={13} className="text-moto-orange" />
            <span>Supabase Live Analytics API</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-[#141414] hover:bg-moto-panel border border-moto-border text-xs text-gray-200 font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>

          <button
            onClick={handleSyncLive}
            disabled={syncing}
            className="px-5 py-2 bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-glow-orange flex items-center gap-2 transition-all"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Live Data'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert Box if Edge Function Returns Error */}
      {apiError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-red-400" />
          <div className="space-y-0.5">
            <p className="font-bold text-red-200">Supabase Edge Function Message:</p>
            <p className="font-mono">{apiError}</p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid (100% Real Live Data) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Active Users */}
        <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-2 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">Active Users</p>
          <p className="text-2xl font-extrabold text-white font-heading">{loading ? '...' : activeUsers}</p>
          {renderPercentBadge(change.activeUsers)}
        </div>

        {/* Sessions */}
        <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-2 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">Sessions</p>
          <p className="text-2xl font-extrabold text-white font-heading">{loading ? '...' : sessions}</p>
          {renderPercentBadge(change.sessions)}
        </div>

        {/* Page Views */}
        <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-2 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">Page Views</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-heading">{loading ? '...' : pageViews}</p>
          {renderPercentBadge(change.pageViews)}
        </div>

        {/* Avg Duration */}
        <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-2 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">Avg. Duration</p>
          <p className="text-2xl font-extrabold text-white font-heading">{loading ? '...' : avgDuration}</p>
          {renderPercentBadge(change.avgSessionDuration)}
        </div>

        {/* Bounce Rate */}
        <div className="p-5 bg-moto-card border border-moto-border rounded-xl space-y-2 shadow-lg">
          <p className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">Bounce Rate</p>
          <p className="text-2xl font-extrabold text-white font-heading">{loading ? '...' : bounceRate}</p>
          {renderPercentBadge(change.bounceRate)}
        </div>

      </div>

      {/* Traffic Activity Trends Chart */}
      <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-moto-orange" />
            <h3 className="font-heading text-base text-white font-bold">Traffic Activity Trends</h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-gray-300">Page Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-gray-300">Active Users</span>
            </div>
          </div>
        </div>

        {timeseries.length > 0 ? (
          <div className="h-64 flex items-end gap-2 pt-6 pb-2 border-b border-moto-border overflow-x-auto">
            {timeseries.map((d, idx) => {
              const maxVal = Math.max(...timeseries.map(t => Math.max(t.pageViews || 0, t.activeUsers || 0)), 1);
              const viewHeight = Math.min(100, Math.max(5, ((d.pageViews || 0) / maxVal) * 100));
              const userHeight = Math.min(100, Math.max(5, ((d.activeUsers || 0) / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 min-w-[24px] flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-moto-border p-2 rounded shadow-2xl z-30 pointer-events-none text-[10px] whitespace-nowrap font-mono text-white">
                    <p className="font-bold text-moto-orange">{d.date || `Day ${idx + 1}`}</p>
                    <p>Views: {d.pageViews || 0}</p>
                    <p>Users: {d.activeUsers || 0}</p>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-48">
                    <div
                      className="w-2 bg-blue-500 rounded-t group-hover:bg-blue-400 transition-all duration-300"
                      style={{ height: `${viewHeight}%` }}
                    />
                    <div
                      className="w-2 bg-emerald-500 rounded-t group-hover:bg-emerald-400 transition-all duration-300"
                      style={{ height: `${userHeight}%` }}
                    />
                  </div>

                  <span className="text-[9px] text-gray-500 font-mono truncate">{d.date || idx + 1}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-500 font-mono text-xs border border-dashed border-moto-border/60 rounded-lg bg-[#0d0d0d] space-y-2">
            <BarChart3 size={28} className="mx-auto text-gray-600" />
            <p className="text-gray-400 font-semibold">No timeseries traffic records returned yet by Google Analytics API.</p>
            <p className="text-[11px] text-gray-600">As public visitors read posts on MotoShift, Google Analytics telemetry will display daily trends here.</p>
          </div>
        )}
      </div>

      {/* Middle Grid: Device Category & Top Visited Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): Device Breakdown & Composition */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Device Breakdown */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-5 shadow-xl">
            <h3 className="font-heading text-sm text-white font-bold uppercase border-b border-moto-border pb-2">Device Category Breakdown</h3>
            
            {deviceCategories.length > 0 ? (
              <div className="space-y-3 text-xs">
                {deviceCategories.map((dev, idx) => (
                  <div key={idx} className="flex items-center justify-between font-mono bg-[#141414] p-3 rounded border border-moto-border">
                    <span className="text-white font-semibold capitalize flex items-center gap-2">
                      {dev.category?.toLowerCase() === 'mobile' ? <Smartphone size={14} className="text-emerald-400" /> : <Monitor size={14} className="text-blue-400" />}
                      <span>{dev.category || 'Desktop'}</span>
                    </span>
                    <span className="text-gray-400 font-bold">{dev.users || 0} users ({dev.share || '0%'})</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 font-mono text-xs">
                No device category distribution recorded yet.
              </div>
            )}
          </div>

          {/* User Composition */}
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-3 shadow-xl">
            <h3 className="font-heading text-sm text-white font-bold uppercase border-b border-moto-border pb-2">User Composition</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <span className="text-gray-300">New Users: <strong className="text-white">{newUsers}</strong></span>
              <span className="text-gray-300">Returning Users: <strong className="text-white">{returningUsers}</strong></span>
            </div>
          </div>

        </div>

        {/* Right Column (7 Cols): Top Visited Pages */}
        <div className="lg:col-span-7">
          <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-4 shadow-xl h-full flex flex-col justify-between">
            <div>
              <h3 className="font-heading text-sm text-white font-bold uppercase border-b border-moto-border pb-3">Top Visited Pages</h3>
              
              {topPages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="border-b border-moto-border uppercase font-mono text-[10px] text-gray-400">
                      <tr>
                        <th className="py-2">Path</th>
                        <th className="py-2 text-right">Views</th>
                        <th className="py-2 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-moto-border/40 font-mono text-[11px]">
                      {topPages.map((p, idx) => (
                        <tr key={idx} className="hover:bg-moto-panel transition-colors">
                          <td className="py-2.5 text-white font-semibold truncate max-w-xs">{p.path || p.pagePath || '/'}</td>
                          <td className="py-2.5 text-right font-bold text-emerald-400">{p.views || p.screenPageViews || 0}</td>
                          <td className="py-2.5 text-right text-gray-400">{p.share || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500 font-mono text-xs space-y-1">
                  <p className="text-gray-400 font-semibold">No top visited page records returned yet.</p>
                  <p className="text-[11px] text-gray-600">Pageviews will populate automatically as users browse public articles.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Grid: Top Countries & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Countries */}
        <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-4 shadow-xl">
          <h3 className="font-heading text-sm text-white font-bold uppercase border-b border-moto-border pb-2">Top Countries</h3>
          
          {topCountries.length > 0 ? (
            <div className="space-y-3 text-xs">
              {topCountries.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-white font-semibold flex items-center gap-2">
                      <Globe size={13} className="text-moto-orange" />
                      <span>{c.code || ''} {c.country || 'Unknown'}</span>
                    </span>
                    <span className="text-gray-400">{c.users || 0} users ({c.share || '--'})</span>
                  </div>

                  <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: c.share || '10%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 font-mono text-xs">
              No country geographic telemetry recorded yet.
            </div>
          )}
        </div>

        {/* Traffic Sources */}
        <div className="p-6 bg-moto-card border border-moto-border rounded-xl space-y-4 shadow-xl">
          <h3 className="font-heading text-sm text-white font-bold uppercase border-b border-moto-border pb-2">Traffic Sources</h3>
          
          {trafficSources.length > 0 ? (
            <div className="space-y-3 text-xs">
              {trafficSources.map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-white font-semibold">{s.source || 'Direct'}</span>
                    <span className="text-gray-400">{s.sessions || 0} sessions ({s.share || '--'})</span>
                  </div>
                  <div className="w-full h-2 bg-[#181818] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: s.share || '20%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 font-mono text-xs">
              No referral or organic traffic sources recorded yet.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
