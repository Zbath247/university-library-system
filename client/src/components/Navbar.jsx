import React, { useState } from 'react';
import { LayoutDashboard, QrCode, Smartphone, Globe, Menu, X, ChevronRight, LogOut, ScanLine, Layers } from 'lucide-react';
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
      <header className="fixed top-0 left-0 z-40 w-full md:w-[280px] md:h-screen border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl shadow-xl flex flex-col transition-all">
        {/* Top Area: Mobile Bar or Desktop Logo */}
        <div className="relative flex items-center justify-between h-20 px-4 sm:px-6 shrink-0 md:static md:flex-col md:h-auto md:py-8 md:gap-4 w-full">
          
          {/* 3-Bar Hamburger Menu Button for Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative z-10 md:hidden p-2.5 rounded-2xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 focus:outline-none transition active:scale-95 shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-teal-400" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Logo & University Name (Absolutely Centered on Mobile) */}
          <div className="absolute inset-0 flex items-center justify-center md:static md:w-full pointer-events-none md:pointer-events-auto">
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group md:flex-col md:text-center pointer-events-auto"
              onClick={() => handleNavClick('kiosk')}
            >
              <div className="h-10 w-10 sm:h-11 sm:w-11 md:h-16 md:w-16 flex items-center justify-center shrink-0">
                <img 
                  src="/duc-logo.png" 
                  alt="DUC Logo" 
                  className="h-full w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => { e.target.style.display='none'; }}
                />
              </div>
              <div className="flex flex-col justify-center leading-tight">
                <span className="text-[10px] sm:text-[11px] md:text-[12px] font-black tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent uppercase font-sans text-center">
                  DIGITAL UNIVERSITY OF CAMBODIA
                </span>
                <span className="text-[11px] sm:text-xs font-extrabold text-teal-400 whitespace-nowrap tracking-wide mt-0.5 md:mt-1 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse hidden md:block"></span>
                  {lang === 'km' ? 'ចូលបណ្ណាល័យ' : 'Library Portal'}
                </span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Desktop Navigation Tabs (Sidebar style) */}
        <div className="hidden md:flex flex-col flex-1 px-4 pb-6 overflow-y-auto w-full">
          
          <nav className="flex flex-col gap-2 w-full mt-4">
            {/* 1. Scan QR Code */}
            <button
              onClick={() => handleNavClick('kiosk')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'kiosk'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-black shadow-lg shadow-teal-500/25 scale-[1.02]'
                  : 'bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/50'
              }`}
            >
              <QrCode className="w-5 h-5 shrink-0" />
              <div className="text-left leading-tight flex-1">
                <span className="block">{t('navKiosk')}</span>
                <span className={`text-[10px] font-normal ${activeTab === 'kiosk' ? 'text-slate-800' : 'text-slate-500'}`}>Entrance Scanner</span>
              </div>
            </button>

            {/* 2. បំពេញព័ត៌មាន (Mobile Portal) */}
            <button
              onClick={() => handleNavClick('mobile')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'mobile'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-lg shadow-cyan-500/25 scale-[1.02]'
                  : 'bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/50'
              }`}
            >
              <Smartphone className="w-5 h-5 shrink-0" />
              <div className="text-left leading-tight flex-1">
                <span className="block">{t('navMobilePortal')}</span>
                <span className={`text-[10px] font-normal ${activeTab === 'mobile' ? 'text-blue-100' : 'text-slate-500'}`}>Check-In & Pass</span>
              </div>
            </button>

            {/* 3. Admin Overview */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <div className="text-left leading-tight flex-1">
                <span className="block">{t('adminTitle') || 'ទិដ្ឋភាពទូទៅ'}</span>
                <span className={`text-[10px] font-normal ${activeTab === 'admin' ? 'text-amber-100' : 'text-slate-500'}`}>Admin Overview</span>
              </div>
            </button>

            {/* 4. Attendance Logs */}
            <button
              onClick={() => handleNavClick('logs')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'logs'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black shadow-lg shadow-purple-500/25 scale-[1.02]'
                  : 'bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/50'
              }`}
            >
              <Layers className="w-5 h-5 shrink-0" />
              <div className="text-left leading-tight flex-1">
                <span className="block">កំណត់ត្រាវត្តមានទាំងអស់</span>
                <span className={`text-[10px] font-normal ${activeTab === 'logs' ? 'text-purple-100' : 'text-slate-500'}`}>Attendance Logs</span>
              </div>
            </button>


          </nav>

          {/* Bottom Area (Language, Logout, Stats) */}
          <div className="mt-auto w-full flex flex-col gap-3 pt-6 border-t border-slate-800/80">
            {/* Live Stats */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>Active</span>
              </span>
              <span className="text-xs font-bold text-teal-300 font-mono">
                {activeCount} {t('activeOccupants')}
              </span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title="Switch Language / ផ្លាស់ប្ដូរភាសា"
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-all shadow-sm active:scale-95 w-full"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <span>{lang === 'km' ? 'ភាសា' : 'Language'}</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs">
                <span className={lang === 'km' ? 'text-teal-400 font-bold' : 'text-slate-500'}>🇰🇭 ខ្មែរ</span>
                <span className="text-slate-700 font-normal">|</span>
                <span className={lang === 'en' ? 'text-teal-400 font-bold' : 'text-slate-500'}>🇬🇧 EN</span>
              </span>
            </button>

            {/* Admin Logout */}
            {isAdminLoggedIn && onLogout && (
              <button
                onClick={onLogout}
                title="Logout"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400 hover:text-rose-300 transition-all shadow-sm active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
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
                      DIGITAL UNIVERSITY OF CAMBODIA
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

                {/* 1. Scan QR Code */}
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
                      <span className="text-[10px] text-slate-400 font-normal">Entrance Scanner</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* 2. បំពេញព័ត៌មាន (Mobile Portal) */}
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

                {/* 3. Admin Overview */}
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block">{t('adminTitle') || 'ទិដ្ឋភាពទូទៅ'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Admin Overview</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* 4. Attendance Logs */}
                <button
                  onClick={() => handleNavClick('logs')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'logs'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block">កំណត់ត្រាវត្តមានទាំងអស់</span>
                      <span className="text-[10px] text-slate-400 font-normal">Attendance Logs</span>
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

              {/* Language Switcher in Mobile Drawer */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between shadow-sm">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-400" />
                  <span>{lang === 'km' ? 'ភាសា / Language' : 'Language / ភាសា'}</span>
                </span>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition shadow-sm active:scale-95"
                >
                  <span className={lang === 'km' ? 'text-teal-400 font-bold' : 'text-slate-400'}>🇰🇭 ខ្មែរ</span>
                  <span className="text-slate-600">|</span>
                  <span className={lang === 'en' ? 'text-teal-400 font-bold' : 'text-slate-400'}>🇬🇧 EN</span>
                </button>
              </div>

              {/* Admin Logout in Drawer */}
              {isAdminLoggedIn && onLogout && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all shadow-sm active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
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
