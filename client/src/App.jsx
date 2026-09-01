import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KioskMode from './components/KioskMode';
import MobileCheckIn from './components/MobileCheckIn';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import { api } from './services/api';
import { useLanguage } from './context/LanguageContext';
import { io } from 'socket.io-client';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'mobile') {
      return 'mobile';
    }
    return 'kiosk'; // 'kiosk' | 'mobile' | 'admin'
  });

  const [isQRScan] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'mobile';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('duc_admin_auth') === 'true';
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const { t } = useLanguage();

  const [pendingAdminTab, setPendingAdminTab] = useState('admin');

  const handleTabSelect = (tab) => {
    if (tab === 'admin' || tab === 'logs') {
      if (isAdminLoggedIn) {
        setActiveTab(tab);
      } else {
        setPendingAdminTab(tab);
        setShowAdminLoginModal(true);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setActiveTab(pendingAdminTab);
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
    
    // Set up Socket.IO for real-time updates
    const socketUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://university-library-system-1.onrender.com';
      
    const socket = io(socketUrl);
    
    socket.on('session_updated', () => {
      fetchActiveCount();
    });

    const interval = setInterval(fetchActiveCount, 60000);
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      
      {/* Navbar / Sidebar */}
      {!(activeTab === 'mobile' && isQRScan) && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleTabSelect}
          activeCount={activeCount}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleAdminLogout}
        />
      )}

      {/* Main Content Container (Padded left for sidebar on desktop) */}
      <div className={`flex-1 flex flex-col min-h-screen w-full ${!(activeTab === 'mobile' && isQRScan) ? 'md:pl-[280px]' : ''}`}>
        
        {/* Main Area */}
        <main className={`flex-1 ${!(activeTab === 'mobile' && isQRScan) ? 'mt-20 md:mt-0' : ''}`}>
          {activeTab === 'kiosk' ? (
            <KioskMode
              activeOccupantsCount={activeCount}
              onSessionUpdate={fetchActiveCount}
              onOpenMobilePortal={() => handleTabSelect('mobile')}
            />
          ) : activeTab === 'mobile' ? (
            <MobileCheckIn
              onNavigateEntrance={() => handleTabSelect('kiosk')}
              isQRScan={isQRScan}
            />
          ) : isAdminLoggedIn && (activeTab === 'admin' || activeTab === 'logs') ? (
            <AdminDashboard
              view={activeTab === 'logs' ? 'LOGS' : 'OVERVIEW'}
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

        {/* Footer */}
        {!(activeTab === 'mobile' && isQRScan) && (
          <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>{t('footerCopyright')}</p>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span>{t('footerRoleInfo')}</span>
              </div>
            </div>
          </footer>
        )}

      </div>

      {/* Admin Login Modal */}
      {showAdminLoginModal && (
        <AdminLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

    </div>
  );
}
