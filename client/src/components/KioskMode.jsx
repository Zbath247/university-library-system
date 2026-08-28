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
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        
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
            

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans mb-8">
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-slate-950 text-teal-400 border-2 border-teal-400 shadow-xl pointer-events-none flex items-center justify-center">
                  <img src="/duc-logo.png" alt="DUC Logo" className="w-8 h-8 object-contain" />
                </div>
              </div>


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
                <span className="text-sm font-bold text-white">
                  {t('btnCameraScan')}
                </span>
              </div>
            </div>

            {/* Manual ID Input */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-2 justify-between text-xs text-slate-400">
                <span>{t('inputPlaceholder')}</span>
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
