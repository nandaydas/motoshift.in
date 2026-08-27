import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SearchModal from './components/common/SearchModal';
import AuthModal from './components/common/AuthModal';
import GoogleAnalytics from './components/common/GoogleAnalytics';

// Public Pages
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import CategoryPage from './pages/CategoryPage';
import BookmarksPage from './pages/BookmarksPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Admin CMS Pages
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import PostsListPage from './pages/admin/PostsListPage';
import PostEditorPage from './pages/admin/PostEditorPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import MediaLibraryPage from './pages/admin/MediaLibraryPage';
import CommentsModerationPage from './pages/admin/CommentsModerationPage';
import ContactSubmissionsPage from './pages/admin/ContactSubmissionsPage';

export default function App() {
  return (
    <Router>
      <AppProvider>
        <GoogleAnalytics />
        <div className="min-h-screen flex flex-col bg-moto-dark text-gray-100 font-sans">
          <Navbar />
          <SearchModal />
          <AuthModal />
          
          <div className="flex-1">
            <Routes>
              {/* Public Portal Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:slug" element={<ArticleDetailPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Admin CMS Portal Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="posts" element={<PostsListPage />} />
                <Route path="posts/new" element={<PostEditorPage />} />
                <Route path="posts/edit/:id" element={<PostEditorPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="media" element={<MediaLibraryPage />} />
                <Route path="comments" element={<CommentsModerationPage />} />
                <Route path="contact" element={<ContactSubmissionsPage />} />
              </Route>
            </Routes>
          </div>

          <Footer />
        </div>
      </AppProvider>
    </Router>
  );
}
