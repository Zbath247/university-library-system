import React, { useState } from 'react';
import { LayoutDashboard, ScanLine, Smartphone, Globe, Menu, X, ShieldCheck, ChevronRight, Users, Sparkles, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ activeTab, setActiveTab, activeCount, isAdminLoggedIn, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24 gap-3 lg:gap-6">
            
            {/* Left: Mobile Hamburger (☰) + University Logo & Title */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* 3-Bar Hamburger Menu Button (☰ Like YouTube) for Mobile */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition active:scale-95 shrink-0"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-teal-400" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Logo & University Name */}
              <div
                className="flex items-center gap-3 cursor-pointer shrink-0 select-none group"
                onClick={() => handleNavClick('kiosk')}
              >
                <div className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center shrink-0">
                  <img 
                    src="/duc-logo.png" 
                    alt="DUC Logo" 
                    className="h-12 w-12 sm:h-16 sm:w-16 object-contain drop-shadow-lg group-hover:scale-105 transition"
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                </div>
                <div className="flex flex-col justify-center leading-tight">
                  <span className="text-[11px] sm:text-xs font-extrabold tracking-widest text-amber-400 uppercase whitespace-nowrap">
                    DIGITAL UNIVERSITY
                  </span>
                  <span className="text-[11px] sm:text-xs font-extrabold tracking-widest text-amber-300 uppercase whitespace-nowrap">
                    OF CAMBODIA
                  </span>
                  <span className="text-xs sm:text-sm font-black text-teal-400 whitespace-nowrap tracking-wide">
                    {lang === 'km' ? 'ចូលបណ្ណាល័យ' : 'Library Entrance'}
                  </span>
                </div>
              </div>

            </div>

            {/* Desktop Navigation Tabs (Clean & Compact to avoid any overlap) */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900/95 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              
              {/* Entrance Kiosk Screen */}
              <button
                onClick={() => handleNavClick('kiosk')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === 'kiosk'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ScanLine className="w-4 h-4" />
                <span className="whitespace-nowrap">{t('navKiosk')}</span>
              </button>

              {/* Mobile Portal Simulation */}
              <button
                onClick={() => handleNavClick('mobile')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === 'mobile'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="whitespace-nowrap">{t('navMobilePortal')}</span>
              </button>

              {/* Admin Dashboard */}
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="whitespace-nowrap">{t('navAdmin')}</span>
              </button>
            </div>

            {/* Right Controls: Language Switcher & Indicators */}
            <div className="flex items-center gap-2.5 shrink-0">
              
              {/* Language Switcher Toggle */}
              <button
                onClick={toggleLanguage}
                title="Switch Language / ផ្លាស់ប្ដូរភាសា"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition-all shadow-sm"
              >
                <Globe className="w-4 h-4 text-teal-400" />
                <span className="flex items-center gap-1">
                  <span className={lang === 'km' ? 'text-teal-400 font-bold' : 'text-slate-400'}>🇰🇭 ខ្មែរ</span>
                  <span className="text-slate-600">|</span>
                  <span className={lang === 'en' ? 'text-teal-400 font-bold' : 'text-slate-400'}>🇬🇧 EN</span>
                </span>
              </button>

              {/* Admin Logout */}
              {isAdminLoggedIn && onLogout && (
                <button
                  onClick={onLogout}
                  title="ចាកចេញពីគណនី Admin (Logout)"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-400 transition-all shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">ចាកចេញ (Logout)</span>
                </button>
              )}



            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu (Slide-Out Sidebar triggered by ☰) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[280px] sm:w-[320px] bg-slate-900 border-r border-slate-800 shadow-2xl z-50 flex flex-col justify-between p-5 animate-slide-right">
            
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <img src="/duc-logo.png" alt="DUC Logo" className="h-9 w-9 object-contain" />
                  <div>
                    <h3 className="text-xs font-extrabold text-white leading-tight">
                      DIGITAL UNIVERSITY
                    </h3>
                    <span className="text-[11px] font-bold text-teal-400 block">
                      {lang === 'km' ? 'ចូលបណ្ណាល័យ' : 'Library Portal'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                  ជ្រើសរើសផ្ទាំងដំណើរការ (Menu)
                </p>

                {/* 1. Admin Dashboard (Requested prominently!) */}
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block">{t('navAdmin')}</span>
                      <span className="text-[10px] opacity-80 font-normal">Dashboard & All Logs</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>

                {/* 2. Mobile Portal */}
                <button
                  onClick={() => handleNavClick('mobile')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'mobile'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block">{t('navMobilePortal')}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Check-In & Digital Pass</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* 3. Entrance Kiosk Screen */}
                <button
                  onClick={() => handleNavClick('kiosk')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'kiosk'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-lg shadow-teal-500/20'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                      <ScanLine className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block">{t('navKiosk')}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Entrance QR Scanner</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

              </div>

              {/* Live Occupants Status in Drawer */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                    <span>{t('insideLibrary')}</span>
                  </span>
                  <span className="font-bold text-teal-300 font-mono">
                    {activeCount} {t('activeOccupants')}
                  </span>
                </div>
              </div>

              {/* Admin Logout in Drawer */}
              {isAdminLoggedIn && onLogout && (
                <button
                  onClick={onLogout}
                  className="mt-4 w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ចាកចេញ (Logout)</span>
                </button>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
              <span>Digital University of Cambodia</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
