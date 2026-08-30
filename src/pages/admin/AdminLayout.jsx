import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, TrendingUp, FileText, PlusCircle, FolderKanban, 
  Image as ImageIcon, MessageSquare, Mail, User,
  Globe, LogOut, ShieldCheck, ArrowLeft, Save 
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, showToast, adminHeader, setAdminHeader } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
    { label: 'Manage Articles', path: '/admin/posts', icon: FileText },
    { label: 'Create New Article', path: '/admin/posts/new', icon: PlusCircle },
    { label: 'Categories', path: '/admin/categories', icon: FolderKanban },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { label: 'Comment Moderation', path: '/admin/comments', icon: MessageSquare },
    { label: 'Contact Submissions', path: '/admin/contact', icon: Mail },
    { label: 'Profile Settings', path: '/admin/profile', icon: User },
  ];

  // Reset custom adminHeader when navigating away from editor routes
  React.useEffect(() => {
    if (!location.pathname.includes('/posts/new') && !location.pathname.includes('/posts/edit/')) {
      if (adminHeader) setAdminHeader(null);
    }
  }, [location.pathname]);

  return (
    <div className="h-screen w-full bg-[#070707] text-gray-200 flex flex-col md:flex-row overflow-hidden">
      
      {/* Admin Sidebar - Always Fixed */}
      <aside className="w-full md:w-64 md:h-screen bg-moto-panel border-r border-moto-border flex flex-col justify-between shrink-0 overflow-y-auto">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-moto-border flex items-center justify-between sticky top-0 bg-moto-panel z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="MotoShift Logo" className="w-8 h-8 object-contain drop-shadow-md" />
              <div className="flex flex-col">
                <span className="font-display text-lg font-black text-white">MOTOSHIFT</span>
                <span className="text-[9px] text-moto-orange font-bold uppercase tracking-wider">ADMIN CMS v1.0</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase text-gray-500 font-bold">Content Control</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    active 
                      ? 'bg-moto-orange text-white shadow-glow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-moto-card'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-moto-border space-y-3 sticky bottom-0 bg-moto-panel z-10">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2 bg-moto-card hover:bg-moto-border border border-moto-border rounded text-xs text-moto-orange font-bold uppercase tracking-wider transition-colors"
          >
            <Globe size={14} />
            <span>View Public Site</span>
          </Link>

          <div className="flex items-center justify-between pt-2 text-xs">
            <Link to="/admin/profile" className="flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt="User"
                className="w-7 h-7 rounded-full object-cover border border-moto-orange group-hover:scale-105 transition-transform"
              />
              <div className="truncate max-w-[100px]">
                <p className="font-bold text-white text-[11px] truncate group-hover:text-moto-orange transition-colors">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user?.role || 'admin'}</p>
              </div>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area - Only Center Body Scrolls */}
      <main className="flex-1 h-full md:h-screen flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar (Fixed) */}
        <header className="shrink-0 bg-moto-panel border-b border-moto-border px-6 py-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            {adminHeader?.backLink ? (
              <button
                type="button"
                onClick={() => navigate(adminHeader.backLink || '/admin/posts')}
                className="p-1.5 bg-moto-card hover:bg-moto-border text-gray-400 hover:text-white rounded-lg border border-moto-border transition-colors cursor-pointer"
                title="Back to Articles"
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <ShieldCheck size={18} className="text-moto-orange" />
            )}
            <div>
              <h2 className="font-heading text-lg text-white font-bold tracking-wider leading-none">
                {adminHeader?.title || navItems.find(i => i.path === location.pathname)?.label || 'Editorial Portal'}
              </h2>
              {adminHeader?.subTitle && (
                <p className="text-[11px] text-gray-400 mt-0.5">{adminHeader.subTitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {adminHeader?.formId ? (
              <button
                form={adminHeader.formId}
                type="submit"
                disabled={adminHeader.saving}
                className="bg-moto-orange hover:bg-moto-orange-hover text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-lg shadow-glow-orange transition-all flex items-center gap-2"
              >
                <Save size={15} />
                <span>{adminHeader.saving ? 'Saving...' : 'Save & Publish'}</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live DB Connected</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Outlet Container (Scrollable) */}
        <div className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
