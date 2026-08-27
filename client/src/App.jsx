import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KioskMode from './components/KioskMode';
import MobileCheckIn from './components/MobileCheckIn';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import { api } from './services/api';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'mobile') {
      return 'mobile';
    }
    return 'kiosk'; // 'kiosk' | 'mobile' | 'admin'
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('duc_admin_auth') === 'true';
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const { t } = useLanguage();

  const handleTabSelect = (tab) => {
    if (tab === 'admin') {
      if (isAdminLoggedIn) {
        setActiveTab('admin');
      } else {
        setShowAdminLoginModal(true);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('duc_admin_auth');
    sessionStorage.removeItem('duc_admin_token');
    setIsAdminLoggedIn(false);
    setActiveTab('kiosk');
  };

  const fetchActiveCount = async () => {
    try {
      const res = await api.getAdminStats();
      if (res.success && res.stats) {
        setActiveCount(res.stats.activeCount);
      }
    } catch (e) {
      console.warn('Stats fetch warning', e);
    }
  };

  useEffect(() => {
    fetchActiveCount();
    const interval = setInterval(fetchActiveCount, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabSelect}
        activeCount={activeCount}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'kiosk' ? (
          <KioskMode
            activeOccupantsCount={activeCount}
            onSessionUpdate={fetchActiveCount}
            onOpenMobilePortal={() => handleTabSelect('mobile')}
          />
        ) : activeTab === 'mobile' ? (
          <MobileCheckIn
            onNavigateEntrance={() => handleTabSelect('kiosk')}
          />
        ) : isAdminLoggedIn ? (
          <AdminDashboard
            onStatsUpdate={setActiveCount}
            onLogout={handleAdminLogout}
          />
        ) : (
          <KioskMode
            activeOccupantsCount={activeCount}
            onSessionUpdate={fetchActiveCount}
            onOpenMobilePortal={() => handleTabSelect('mobile')}
          />
        )}
      </main>

      {/* Admin Login Modal */}
      {showAdminLoginModal && (
        <AdminLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>{t('footerCopyright')}</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>{t('footerRoleInfo')}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
