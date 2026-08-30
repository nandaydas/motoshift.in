import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getCategories, createCategory, logActivity, signOutUser } from '../lib/supabase';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('motoshift_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('motoshift_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [adminHeader, setAdminHeader] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    loadCategories();

    // Listen for Supabase auth state changes (token refresh, login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && !user) {
        // Sync user state from active Supabase session
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.email.split('@')[0],
          role: profile?.role || 'author',
          avatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addCategory = async (catData) => {
    const created = await createCategory(catData);
    setCategories(prev => {
      const exists = prev.some(c => c.id === created.id || c.slug === created.slug);
      if (exists) return prev;
      return [...prev, created];
    });
    return created;
  };

  useEffect(() => {
    localStorage.setItem('motoshift_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('motoshift_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('motoshift_user');
    }
  }, [user]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleBookmark = (postId) => {
    setBookmarks(prev => {
      const exists = prev.includes(postId);
      const updated = exists ? prev.filter(id => id !== postId) : [...prev, postId];
      showToast(exists ? 'Removed from bookmarks' : 'Added to bookmarks!', exists ? 'info' : 'success');
      return updated;
    });
  };

  const loginAsAdmin = () => {
    const adminUser = {
      id: 'admin-1',
      name: 'Nanday Das',
      email: 'admin@motoshift.in',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };
    setUser(adminUser);
    logActivity({
      action: 'USER_SIGNED_IN',
      entity_type: 'user',
      entity_id: adminUser.id,
      description: `User "${adminUser.name}" (${adminUser.email}) signed in as Admin`,
      actor_name: adminUser.name,
      actor_email: adminUser.email
    });
    showToast('Signed in as Admin', 'success');
  };

  const loginAsReader = () => {
    const readerUser = {
      id: 'reader-1',
      name: 'Community Reader',
      email: 'rider@motoshift.in',
      role: 'author',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    };
    setUser(readerUser);
    logActivity({
      action: 'USER_SIGNED_IN',
      entity_type: 'user',
      entity_id: readerUser.id,
      description: `User "${readerUser.name}" (${readerUser.email}) signed in`,
      actor_name: readerUser.name,
      actor_email: readerUser.email
    });
    showToast('Signed in as Community Member', 'success');
  };

  const logout = () => {
    if (user) {
      logActivity({
        action: 'USER_SIGNED_OUT',
        entity_type: 'user',
        entity_id: user.id,
        description: `User "${user.name || user.email || 'User'}" signed out of MotoShift`,
        actor_name: user.name || 'User',
        actor_email: user.email
      });
      signOutUser(user);
    }
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <AppContext.Provider value={{
      categories,
      addCategory,
      bookmarks,
      toggleBookmark,
      isBookmarked: (id) => bookmarks.includes(id),
      user,
      setUser,
      loginAsAdmin,
      loginAsReader,
      logout,
      isSearchOpen,
      setIsSearchOpen,
      isAuthModalOpen,
      setIsAuthModalOpen,
      showToast,
      adminHeader,
      setAdminHeader
    }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-glow-orange border border-moto-orange/40 bg-moto-panel text-white text-sm font-medium animate-bounce">
          <span className="w-2 h-2 rounded-full bg-moto-orange animate-ping" />
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
