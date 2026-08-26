import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KioskMode from './components/KioskMode';
import MobileCheckIn from './components/MobileCheckIn';
import AdminDashboard from './components/AdminDashboard';
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

  const [activeCount, setActiveCount] = useState(0);
  const { t } = useLanguage();

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
      
      {/* Top Navbar (rendered unless pure standalone mobile frame) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCount={activeCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'kiosk' ? (
          <KioskMode
            activeOccupantsCount={activeCount}
            onSessionUpdate={fetchActiveCount}
            onOpenMobilePortal={() => setActiveTab('mobile')}
          />
        ) : activeTab === 'mobile' ? (
          <MobileCheckIn
            onNavigateEntrance={() => setActiveTab('kiosk')}
          />
        ) : (
          <AdminDashboard
            onStatsUpdate={setActiveCount}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>{t('footerCopyright')}</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>{t('footerRoleInfo')}</span>
            <span>•</span>
            <span className="text-teal-400">{t('footerTech')}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
