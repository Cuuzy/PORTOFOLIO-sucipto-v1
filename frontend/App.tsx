import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import ProfilePage from './pages/ProfilePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ProjectCaseStudyPage from './pages/ProjectCaseStudyPage';
import SocialProofNotification from './components/SocialProofNotification';
import AnnouncementBanner from './components/AnnouncementBanner';
import { registerServiceWorker, setupInstallPrompt } from './lib/pwa';
import client from '~backend/client';

function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    client.analytics.trackPageView({
      pagePath: location.pathname,
      referrer: document.referrer,
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}

export default function App() {
  useEffect(() => {
    registerServiceWorker();
    setupInstallPrompt();

    const link = document.querySelector("link[rel='manifest']");
    if (!link) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="portfolio-ui-theme">
      <LanguageProvider>
      <Router>
        <PageViewTracker />
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Routes>
            <Route path="/" element={<ProfilePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/projects/:id" element={<ProjectCaseStudyPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
          <Toaster />
          <AnnouncementBanner />
          <SocialProofNotification />
        </div>
      </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}
