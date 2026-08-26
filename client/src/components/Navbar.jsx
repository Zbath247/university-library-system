import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ScanLine, Smartphone, Clock, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ activeTab, setActiveTab, activeCount }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { lang, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setActiveTab('kiosk')}>
            <div className="h-16 w-16 flex items-center justify-center flex-shrink-0">
              <img 
                src="/duc-logo.png" 
                alt="DUC Logo" 
                className="h-16 w-16 object-contain drop-shadow-lg"
                onError={(e) => { e.target.style.display='none'; }}
              />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <span className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase">
                DIGITAL UNIVERSITY
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-amber-300 uppercase">
                OF CAMBODIA
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-teal-400">
                {lang === 'km' ? 'ចូលបណ្ណាល័យ' : 'Library Entrance'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            
            {/* Entrance Kiosk Screen */}
            <button
              onClick={() => setActiveTab('kiosk')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'kiosk'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>{t('navKiosk')}</span>
            </button>

            {/* Mobile Portal Simulation */}
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'mobile'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{t('navMobilePortal')}</span>
            </button>

            {/* Admin Dashboard */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('navAdmin')}</span>
            </button>
          </div>

          {/* Controls: Language Switcher, Live Occupants & Clock */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              title="Switch Language / ផ្លាស់ប្ដូរភាសា"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all shadow-sm hover:border-teal-500/50 hover:shadow-teal-500/10"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span className="flex items-center gap-1.5">
                <span className={lang === 'km' ? 'text-teal-400 font-bold' : 'text-slate-400'}>🇰🇭 ខ្មែរ</span>
                <span className="text-slate-600">|</span>
                <span className={lang === 'en' ? 'text-teal-400 font-bold' : 'text-slate-400'}>🇬🇧 EN</span>
              </span>
            </button>

            {/* Occupants Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
              <span className="text-slate-400">{t('insideLibrary')}</span>
              <span className="font-bold text-teal-300 font-mono">{activeCount} {t('activeOccupants')}</span>
            </div>

            {/* Time */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/60">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
