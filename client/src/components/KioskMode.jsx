import React, { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  Camera,
  Search,
  UserPlus,
  CheckCircle2,
  LogOut,
  Sparkles,
  GraduationCap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Layers,
  Users,
  Smartphone,
  QrCode,
  RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../services/api';
import { playBeep, playSuccessChime, playCheckoutChime, playErrorSound } from '../utils/audioChime';
import { useLanguage } from '../context/LanguageContext';
import WelcomeCard from './WelcomeCard';
import CheckoutCard from './CheckoutCard';
import DigitalPassModal from './DigitalPassModal';
import CameraScannerModal from './CameraScannerModal';

export default function KioskMode({ onSessionUpdate, activeOccupantsCount = 0, onOpenMobilePortal }) {
  const [kioskMode, setKioskMode] = useState('CHECK_IN'); // 'CHECK_IN' | 'CHECK_OUT'
  const [viewMode, setViewMode] = useState('QR_SCREEN'); // 'QR_SCREEN' | 'MANUAL_INPUT'
  const [universityIdInput, setUniversityIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Entrance QR Code URL
  const [entranceQrDataUrl, setEntranceQrDataUrl] = useState('');
  const [mobilePortalUrl, setMobilePortalUrl] = useState('');

  // Modals state
  const [showRegModal, setShowRegModal] = useState(false);
  const [unregisteredId, setUnregisteredId] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showDigitalPassModal, setShowDigitalPassModal] = useState(false);
  const [selectedPassUser, setSelectedPassUser] = useState(null);

  // Active result cards
  const [welcomeData, setWelcomeData] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  // Metadata
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);

  const inputRef = useRef(null);
  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());

  const { t, tRole, tDept, tPurpose } = useLanguage();

  // Generate Entrance QR Code on load
  useEffect(() => {
    async function generateEntranceQr() {
      try {
        // Determine accessible host URL (e.g. current origin or Wi-Fi IP)
        const host = window.location.host;
        const protocol = window.location.protocol;
        const portalUrl = `${protocol}//${host}/?mode=mobile`;
        setMobilePortalUrl(portalUrl);

        const qrUrl = await QRCode.toDataURL(portalUrl, {
          margin: 1.5,
          width: 420,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF'
          }
        });
        setEntranceQrDataUrl(qrUrl);
      } catch (err) {
        console.error('Failed to generate entrance QR', err);
      }
    }
    generateEntranceQr();
  }, []);

  // Load roles, departments & recent live sessions
  const fetchKioskData = async () => {
    try {
      const [metaRes, sessionsRes] = await Promise.all([
        api.getKioskMeta(),
        api.getSessions({ limit: 4 })
      ]);
      if (metaRes.success) {
        setRoles(metaRes.roles);
        setDepartments(metaRes.departments);
      }
      if (sessionsRes.success) {
        setRecentSessions((sessionsRes.sessions || []).slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load kiosk data', err);
    }
  };

  useEffect(() => {
    fetchKioskData();
    const interval = setInterval(fetchKioskData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus input for USB barcode scanners when in manual mode
  useEffect(() => {
    if (viewMode === 'MANUAL_INPUT') {
      const focusTimer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 500);
      return () => clearTimeout(focusTimer);
    }
  }, [viewMode, welcomeData, checkoutData, showRegModal, showCameraModal]);

  // Global Key Listener for Hardware Barcode Scanners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showRegModal || showCameraModal || showDigitalPassModal) return;

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length >= 3) {
          const scannedCode = barcodeBufferRef.current.trim();
          barcodeBufferRef.current = '';
          handleProcessScan(scannedCode);
        }
      } else if (e.key.length === 1) {
        if (timeDiff > 100) {
          barcodeBufferRef.current = e.key;
        } else {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRegModal, showCameraModal, showDigitalPassModal, kioskMode]);

  // Main ID Processing Logic
  const handleProcessScan = async (rawId) => {
    if (!rawId || !rawId.trim()) return;
    const cleanId = rawId.trim().toUpperCase();
    setUniversityIdInput('');
    setLoading(true);
    setStatusMessage(null);
    playBeep();

    try {
      if (kioskMode === 'CHECK_OUT') {
        const res = await api.checkout({ universityId: cleanId });
        if (!res.success) {
          throw new Error(res.message || t('notCheckedIn'));
        }
        playCheckoutChime();
        setCheckoutData({
          session: res.session,
          durationFormatted: res.durationFormatted
        });
        setWelcomeData(null);
        if (onSessionUpdate) onSessionUpdate();
        fetchKioskData();
      } else {
        const lookup = await api.lookupId(cleanId);
        
        if (!lookup.registered) {
          playErrorSound();
          setStatusMessage({
            type: 'error',
            text: `អត្តលេខ ${cleanId} មិនទាន់មានក្នុងប្រព័ន្ធឡើយ! សូមទាក់ទង Admin/បណ្ណារក្សដើម្បីចុះឈ្មោះ។ (Unregistered ID: ${cleanId}. Please contact Admin to register.)`
          });
        } else {
          if (lookup.activeSession) {
            setWelcomeData({
              user: lookup.user,
              session: lookup.activeSession,
              isAlreadyActive: true,
              isNewUser: false
            });
            setCheckoutData(null);
          } else {
            const checkinRes = await api.checkin(cleanId);
            if (!checkinRes.success) {
              throw new Error(checkinRes.message || t('alreadyCheckedIn'));
            }
            playSuccessChime();
            setWelcomeData({
              user: checkinRes.user,
              session: checkinRes.session,
              isAlreadyActive: false,
              isNewUser: false
            });
            setCheckoutData(null);
            if (onSessionUpdate) onSessionUpdate();
            fetchKioskData();
          }
        }
      }
    } catch (err) {
      playErrorSound();
      setStatusMessage({ type: 'error', text: err.message || t('userNotFound') });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (universityIdInput.trim()) {
      handleProcessScan(universityIdInput);
    }
  };

  const handleRegistrationSuccess = (data) => {
    setWelcomeData({
      user: data.user,
      session: data.session,
      isAlreadyActive: false,
      isNewUser: true
    });
    setCheckoutData(null);
    if (onSessionUpdate) onSessionUpdate();
    fetchKioskData();
  };

  const handleForceCheckoutFromWelcome = async (sessionIdOrUserId) => {
    try {
      setLoading(true);
      const res = await api.checkout({ sessionId: sessionIdOrUserId });
      if (res.success) {
        playCheckoutChime();
        setWelcomeData(null);
        setCheckoutData({
          session: res.session,
          durationFormatted: res.durationFormatted
        });
        if (onSessionUpdate) onSessionUpdate();
        fetchKioskData();
      }
    } catch (err) {
      playErrorSound();
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDigitalPass = (user) => {
    setSelectedPassUser(user);
    setShowDigitalPassModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      
      {/* Top Toggle Switcher: Entrance QR Screen vs Manual Scanner Mode */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        
        {/* Left: Mode Buttons */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1.5 shadow-xl">
          <button
            onClick={() => setViewMode('QR_SCREEN')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              viewMode === 'QR_SCREEN'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-lg shadow-teal-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{t('btnQrScreenMode')}</span>
          </button>

          <button
            onClick={() => setViewMode('MANUAL_INPUT')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              viewMode === 'MANUAL_INPUT'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>{t('btnManualMode')}</span>
          </button>
        </div>


      </div>

      {/* Active Confirmation Cards */}
      {welcomeData && (
        <div className="mb-8">
          <WelcomeCard
            user={welcomeData.user}
            session={welcomeData.session}
            isAlreadyActive={welcomeData.isAlreadyActive}
            isNewUser={welcomeData.isNewUser}
            onCheckOut={handleForceCheckoutFromWelcome}
            onViewPass={handleOpenDigitalPass}
            onDismiss={() => setWelcomeData(null)}
          />
        </div>
      )}

      {checkoutData && (
        <div className="mb-8">
          <CheckoutCard
            session={checkoutData.session}
            durationFormatted={checkoutData.durationFormatted}
            onDismiss={() => setCheckoutData(null)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ENTRANCE SCREEN WITH LARGE GLOWING QR CODE (DEFAULT / REQUESTED FLOW)   */}
      {/* ========================================================================= */}
      {viewMode === 'QR_SCREEN' && (
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-teal-500/40 p-8 sm:p-12 shadow-2xl overflow-hidden glass-panel">
          
          {/* Glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-teal-500/10 border border-teal-500/30 text-teal-300 mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>{t('entranceQrTitle')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans mb-2">
              {t('entranceQrTitle')}
            </h1>


            {/* Big Interactive Glowing QR Code Display Box */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div
                onClick={onOpenMobilePortal}
                title="Click to simulate mobile scan"
                className="group cursor-pointer p-5 sm:p-6 bg-white rounded-3xl shadow-2xl shadow-teal-500/20 border-4 border-teal-400 hover:border-teal-300 transition-all transform hover:scale-[1.03] relative"
              >
                {entranceQrDataUrl ? (
                  <img
                    src={entranceQrDataUrl}
                    alt="Scan with mobile camera to check in"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-slate-800 animate-spin" />
                  </div>
                )}

                {/* Center Badge in QR */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-slate-950 text-teal-400 border-2 border-teal-400 shadow-xl pointer-events-none">
                  <Smartphone className="w-6 h-6" />
                </div>
              </div>


            </div>

            {/* 2-Step Flow Explanation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">
                    {t('firstTimeAttendee')} (លើកទី១)
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t('mobileFirstTimeSub')}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">
                    {t('mobileReturningTitle')} (លើកទី២/រាល់ថ្ងៃ)
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t('mobileReturningSub')}
                  </p>
                </div>
              </div>

            </div>


          </div>

          {/* Quick Demo Scan Shortcuts at Bottom */}
          <div className="mt-10 pt-8 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                {t('btnDemoUsers')}:
              </span>
              <span className="text-slate-500 text-[11px] hidden sm:block">
                {t('btnDemoUsersSub')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleProcessScan('DUCP2024-0101')}
                className="p-3 rounded-2xl bg-slate-950/70 border border-purple-500/30 hover:border-purple-400 text-left transition hover:bg-purple-950/20 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300">
                    {tRole('Professor')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">DUCP2024-0101</span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-purple-200 truncate">
                  Dr. Evelyn Vance
                </p>
                <p className="text-[10px] text-slate-400 truncate">{tDept('Computer Science & IT')}</p>
              </button>

              <button
                onClick={() => handleProcessScan('DUCL2024-0201')}
                className="p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/30 hover:border-emerald-400 text-left transition hover:bg-emerald-950/20 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                    {tRole('Lecturer')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">DUCL2024-0201</span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-emerald-200 truncate">
                  Dr. Marcus Holloway
                </p>
                <p className="text-[10px] text-slate-400 truncate">{tDept('Science & Technology')}</p>
              </button>

              <button
                onClick={() => handleProcessScan('DUC2024-0417')}
                className="p-3 rounded-2xl bg-slate-950/70 border border-blue-500/30 hover:border-blue-400 text-left transition hover:bg-blue-950/20 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300">
                    {tRole('Student')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">DUC2024-0417</span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-blue-200 truncate">
                  Mok Sambath
                </p>
                <p className="text-[10px] text-slate-400 truncate">{tDept('Computer Science & IT')}</p>
              </button>

              <button
                onClick={() => handleProcessScan('DUCR2024-0501')}
                className="p-3 rounded-2xl bg-slate-950/70 border border-teal-500/30 hover:border-teal-400 text-left transition hover:bg-teal-950/20 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-teal-500/20 text-teal-300">
                    {tRole('Researcher')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">DUCR2024-0501</span>
                </div>
                <p className="text-xs font-bold text-white group-hover:text-teal-200 truncate">
                  Elena Rostova
                </p>
                <p className="text-[10px] text-slate-400 truncate">{tDept('Physics & Quantum Computing')}</p>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MANUAL BARCODE SCANNER / ID INPUT MODE (FALLBACK OR PHYSICAL SCANNER)  */}
      {/* ========================================================================= */}
      {viewMode === 'MANUAL_INPUT' && (
        <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-12 shadow-2xl overflow-hidden glass-panel">
          
          {/* Glow backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mode Switcher inside manual card */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2">
              <button
                onClick={() => { setKioskMode('CHECK_IN'); setStatusMessage(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                  kioskMode === 'CHECK_IN'
                    ? 'bg-teal-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ScanLine className="w-4 h-4" />
                <span>{t('tabCheckIn')}</span>
              </button>
              <button
                onClick={() => { setKioskMode('CHECK_OUT'); setStatusMessage(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                  kioskMode === 'CHECK_OUT'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>{t('tabCheckOut')}</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {kioskMode === 'CHECK_IN' ? t('kioskTitle') : t('kioskDepartureTitle')}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
              {kioskMode === 'CHECK_IN' ? t('kioskSub') : t('kioskDepartureSub')}
            </p>

            {/* Interactive Scan Target Box */}
            <div
              onClick={() => setShowCameraModal(true)}
              className={`group cursor-pointer mx-auto max-w-md p-6 rounded-3xl border-2 border-dashed transition-all duration-300 relative overflow-hidden mb-6 ${
                kioskMode === 'CHECK_IN'
                  ? 'border-teal-500/40 bg-teal-950/20 hover:border-teal-400 hover:bg-teal-950/40 shadow-lg shadow-teal-500/5'
                  : 'border-rose-500/40 bg-rose-950/20 hover:border-rose-400 hover:bg-rose-950/40 shadow-lg shadow-rose-500/5'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`p-3.5 rounded-2xl mb-2 transition-transform duration-300 group-hover:scale-110 ${
                  kioskMode === 'CHECK_IN'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  <Camera className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold text-white mb-0.5">
                  {t('btnCameraScan')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {t('btnCameraScanSub')}
                </span>
              </div>
            </div>

            {/* Manual ID Input */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-2 justify-between text-xs text-slate-400">
                <span>{t('inputPlaceholder')}</span>
                <span className="font-mono text-teal-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {t('scannerReady')}
                </span>
              </div>

              <form onSubmit={handleFormSubmit} className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={universityIdInput}
                  onChange={(e) => setUniversityIdInput(e.target.value)}
                  placeholder="DUC2024-0417 / DUCL2024-0201..."
                  disabled={loading}
                  className="w-full pl-4 pr-28 py-3.5 rounded-2xl bg-slate-950 border border-slate-700/80 text-white font-mono uppercase placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition shadow-inner"
                />

                <button
                  type="submit"
                  disabled={loading || !universityIdInput.trim()}
                  className={`absolute right-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 disabled:opacity-40 ${
                    kioskMode === 'CHECK_IN'
                      ? 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                      : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{kioskMode === 'CHECK_IN' ? t('btnCheckIn') : t('btnCheckOut')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Status feedback message */}
            {statusMessage && (
              <div className={`mt-4 p-3 rounded-xl text-xs flex items-center justify-center gap-2 ${
                statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                  : 'bg-teal-500/10 border border-teal-500/20 text-teal-300'
              }`}>
                <span>{statusMessage.text}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Modals */}
      <CameraScannerModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onScanSuccess={handleProcessScan}
      />

      <DigitalPassModal
        isOpen={showDigitalPassModal}
        onClose={() => setShowDigitalPassModal(false)}
        user={selectedPassUser}
      />

    </div>
  );
}
