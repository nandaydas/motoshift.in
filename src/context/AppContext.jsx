import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCategories } from '../lib/supabase';

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

  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

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
      name: 'Admin User',
      email: 'admin@motoshift.in',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };
    setUser(adminUser);
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
    showToast('Signed in as Community Member', 'success');
  };

  const logout = () => {
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <AppContext.Provider value={{
      categories,
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
      showToast
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
