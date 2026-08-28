import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  LogOut,
  Sparkles,
  BookOpen,
  User,
  GraduationCap,
  Building,
  Clock,
  QrCode,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Zap,
  ChevronRight,
  Phone,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import DigitalPassModal from './DigitalPassModal';

export default function MobileCheckIn({ onNavigateEntrance, initialUser = null }) {
  const { t, tRole, tDept, tPurpose, lang, toggleLanguage } = useLanguage();

  const [savedUser, setSavedUser] = useState(() => {
    if (initialUser) return initialUser;
    const local = localStorage.getItem('saved_library_user');
    return local ? JSON.parse(local) : null;
  });

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState('Study & Revision');
  const [bookTitle, setBookTitle] = useState('');
  const [agreementAgreed, setAgreementAgreed] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Form state for first-time registration
  const [formData, setFormData] = useState({
    full_name: '',
    university_id: '',
    email: '',
    phone: '',
    role_id: '',
    department_id: '',
    research_field: '',
    purpose_of_visit: 'Study & Revision'
  });

  // Fetch metadata & sync user's active status
  useEffect(() => {
    let isMounted = true;
    async function loadMeta() {
      try {
        const meta = await api.getKioskMeta();
        if (isMounted && meta.success) {
          setRoles(meta.roles || []);
          setDepartments(meta.departments || []);
          if (meta.roles?.length && !formData.role_id) {
            setFormData(prev => ({
              ...prev,
              role_id: meta.roles[0].id,
              department_id: meta.departments?.[0]?.id || 1
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load kiosk meta', err);
      }
    }
    loadMeta();
    return () => { isMounted = false; };
  }, []);

  // Sync active session if user is saved
  useEffect(() => {
    let isMounted = true;
    let pollingTimer;

    async function syncStatus() {
      if (!savedUser?.university_id) return;
      try {
        const res = await api.lookupId(savedUser.university_id);
        if (isMounted && res.success) {
          if (res.registered && res.user) {
            setSavedUser(res.user);
            localStorage.setItem('saved_library_user', JSON.stringify(res.user));
            setActiveSession(res.activeSession || null);
          }
        }
      } catch (err) {
        console.error('Failed to sync user status', err);
      }
    }
    syncStatus();

    // Setup polling if the session is pending
    if (activeSession?.status === 'PENDING_APPROVAL') {
      pollingTimer = setInterval(async () => {
        try {
          const res = await api.getSessionStatus(activeSession.id);
          if (res.success && res.session) {
            setActiveSession(res.session);
            if (res.session.status === 'REJECTED') {
              setMessage({ type: 'error', text: 'សំណើរបស់អ្នកត្រូវបានបដិសេធ (Request Rejected)' });
              setActiveSession(null);
            } else if (res.session.status === 'ACTIVE') {
              setMessage({ type: 'success', text: 'សំណើត្រូវបានអនុម័ត! (Request Approved!)' });
            }
          }
        } catch (err) {}
      }, 2000);
    }

    return () => {
      isMounted = false;
      if (pollingTimer) clearInterval(pollingTimer);
    };
  }, [savedUser?.university_id, activeSession?.status, activeSession?.id]);

  // Handle One-Tap Check-In for returning user
  const handleOneTapCheckIn = async () => {
    if (!savedUser) return;

    const isBookAction = selectedPurpose === 'Book Borrowing' || selectedPurpose === 'Book Return';
    if (isBookAction) {
      if (!bookTitle.trim()) {
        setMessage({ type: 'error', text: t('bookTitleRequiredError') });
        return;
      }
      if (!agreementAgreed) {
        setMessage({ type: 'error', text: t('agreementRequiredError') });
        return;
      }
    }

    setLoading(true);
    setMessage(null);
    try {
      const topic = isBookAction && bookTitle.trim()
        ? `[${selectedPurpose === 'Book Borrowing' ? 'ខ្ចី' : 'សង'}] ${bookTitle.trim()}`
        : savedUser.research_field || 'Academic Research';

      const res = await api.checkin(
        savedUser.university_id,
        selectedPurpose,
        topic,
        savedUser
      );
      if (res.success) {
        setActiveSession(res.session);
        setBookTitle('');
        setAgreementAgreed(false);
        setMessage({
          type: 'success',
          text: t('mobileCheckInSuccess')
        });
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle One-Tap Check-Out for returning user
  const handleOneTapCheckOut = async () => {
    if (!savedUser) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.checkout({
        universityId: savedUser.university_id,
        sessionId: activeSession?.id
      });
      if (res.success) {
        setActiveSession(null);
        setMessage({
          type: 'info',
          text: `${t('mobileCheckOutSuccess')} (${res.durationFormatted || ''})`
        });
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Check-out failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle First-Time User Registration + Immediate Check-In
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.university_id) {
      setMessage({ type: 'error', text: t('inputRequired') });
      return;
    }

    const isBookAction = formData.purpose_of_visit === 'Book Borrowing' || formData.purpose_of_visit === 'Book Return';
    if (isBookAction) {
      if (!bookTitle.trim()) {
        setMessage({ type: 'error', text: t('bookTitleRequiredError') });
        return;
      }
      if (!agreementAgreed) {
        setMessage({ type: 'error', text: t('agreementRequiredError') });
        return;
      }
    }

    setLoading(true);
    setMessage(null);
    try {
      const finalTopic = isBookAction && bookTitle.trim()
        ? `[${formData.purpose_of_visit === 'Book Borrowing' ? 'ខ្ចី' : 'សង'}] ${bookTitle.trim()}`
        : formData.research_field || 'Academic Research';

      const payload = {
        ...formData,
        role_id: Number(formData.role_id) || (roles[0]?.id || 1),
        department_id: Number(formData.department_id) || (departments[0]?.id || 1),
        purpose_of_visit: formData.purpose_of_visit || selectedPurpose,
        research_field: finalTopic,
        email: formData.email || `${formData.university_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@university.edu.kh`
      };

      const res = await api.registerAndCheckin(payload);
      if (res.success) {
        setSavedUser(res.user);
        localStorage.setItem('saved_library_user', JSON.stringify(res.user));
        setActiveSession(res.session);
        setBookTitle('');
        setAgreementAgreed(false);
        setMessage({
          type: 'success',
          text: `${t('mobileCheckInSuccess')} ${t('mobileSaveSuccessMsg')}`
        });
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Registration failed. Please check your network connection.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (savedUser) {
      setFormData({
        university_id: savedUser.university_id || '',
        full_name: savedUser.full_name || '',
        email: savedUser.email || '',
        phone: savedUser.phone || '',
        role_id: savedUser.role_id || (roles[0]?.id || 1),
        department_id: savedUser.department_id || (departments[0]?.id || 1),
        purpose_of_visit: selectedPurpose || savedUser.default_purpose || 'Study & Revision',
        research_field: savedUser.research_field || ''
      });
      setSavedUser(null);
      setMessage(null);
    }
  };

  const handleSwitchProfile = () => {
    localStorage.removeItem('saved_library_user');
    setSavedUser(null);
    setActiveSession(null);
    setMessage(null);
  };

  const popularPurposes = [
    'Study & Revision',
    'Thesis & Academic Research',
    'Book Borrowing',
    'Book Return',
    'Group Discussion & Project',
    'Computer & Digital Lab'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 font-sans">
      
      {/* Top Mobile Bar */}
      <div className="w-full max-w-md flex items-center justify-center py-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-center">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="text-left flex items-center h-full">
            <span className="text-sm font-extrabold uppercase tracking-wider text-teal-400 block">
              {t('appName')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container Phone Frame */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 glass-panel relative overflow-hidden animate-slide-up">
        
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Message Banner */}
        {message && (
          <div className={`mb-4 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-slide-up ${
            message.type === 'error'
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200'
              : message.type === 'info'
              ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-200'
              : 'bg-teal-500/15 border border-teal-500/30 text-teal-200'
          }`}>
            <Sparkles className="w-4 h-4 shrink-0 text-teal-400" />
            <span className="font-medium leading-relaxed">{message.text}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE A: RETURNING VISITOR (2nd time or daily) - 1-TAP INSTANT CHECK-IN    */}
        {/* ========================================================================= */}
        {savedUser ? (
          <div className="space-y-5">
            
            {/* Header Greeting */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('mobileReturningTitle')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {savedUser.full_name}
              </h2>
            </div>

            {/* Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                    {savedUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-300 block">
                      {savedUser.university_id}
                    </span>
                    <span className="text-xs text-slate-300 font-medium truncate block max-w-[180px]">
                      {tDept(savedUser.department_name)}
                    </span>
                  </div>
                </div>

                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono text-white shadow-xs"
                  style={{ backgroundColor: savedUser.role_badge_color || '#3B82F6' }}
                >
                  {tRole(savedUser.role_name)}
                </span>
              </div>

              {/* Status Indicator */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">{t('colStatus')}:</span>
                {activeSession ? (
                  activeSession.status === 'PENDING_APPROVAL' ? (
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      រង់ចាំការអនុម័ត (Pending)
                    </span>
                  ) : (
                    <span className="font-semibold text-teal-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                      {t('mobileCurrentlyInside')}
                    </span>
                  )
                ) : (
                  <span className="text-slate-400 font-medium">
                    {t('mobileNotInside')}
                  </span>
                )}
              </div>
            </div>

            {/* Purpose Selector (if checking in) */}
            {!activeSession && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t('mobileSelectPurpose')}
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {popularPurposes.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPurpose(p);
                        setAgreementAgreed(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition flex items-center justify-between ${
                        selectedPurpose === p
                          ? 'bg-teal-500/15 border-teal-500 text-teal-200 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{tPurpose(p)}</span>
                      {selectedPurpose === p && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  ))}
                </div>

                {/* Specific Book Details & Agreement Section */}
                {(selectedPurpose === 'Book Borrowing' || selectedPurpose === 'Book Return') && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>{selectedPurpose === 'Book Borrowing' ? 'ឈ្មោះសៀវភៅ / ចំណងជើងដែលត្រូវខ្ចី *' : 'ឈ្មោះសៀវភៅ / ចំណងជើងដែលត្រូវសង *'}</span>
                    </label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder={selectedPurpose === 'Book Borrowing' ? t('bookTitleBorrowPlaceholder') : t('bookTitleReturnPlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                      required
                    />

                    {/* Agreement Confirmation Checkbox */}
                    <label className="mt-3 flex items-start gap-2.5 cursor-pointer select-none bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/20">
                      <input
                        type="checkbox"
                        checked={agreementAgreed}
                        onChange={(e) => setAgreementAgreed(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 h-4 w-4"
                      />
                      <span className="text-[11px] text-amber-200/90 leading-snug font-medium">
                        {selectedPurpose === 'Book Borrowing' ? t('bookAgreementBorrow') : t('bookAgreementReturn')}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* THE ONE-TAP BUTTON THAT USER SPECIFICALLY REQUESTED!       */}
            {/* ========================================================== */}
            <div className="pt-2">
              {!activeSession ? (
                <button
                  onClick={handleOneTapCheckIn}
                  disabled={loading}
                  className="w-full group relative py-4 px-6 rounded-2xl font-black text-base tracking-wide bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 hover:from-teal-300 hover:to-emerald-300 text-slate-950 shadow-xl shadow-teal-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-6 h-6 fill-slate-950" />
                      <span className="font-extrabold">{t('mobileOneTapCheckIn')}</span>
                    </>
                  )}
                </button>
              ) : (
                activeSession.status === 'PENDING_APPROVAL' ? (
                  <div className="w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wide bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="font-extrabold">កំពុងរង់ចាំ Admin អនុម័ត...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleOneTapCheckOut}
                    disabled={loading}
                    className="w-full group relative py-4 px-6 rounded-2xl font-black text-base tracking-wide bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-xl shadow-rose-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <LogOut className="w-6 h-6" />
                        <span className="font-extrabold">{t('mobileOneTapCheckOut')}</span>
                      </>
                    )}
                  </button>
                )
              )}
            </div>

            {/* Bottom Actions - Centered & Clean Design */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col items-center gap-2.5">
              
              {/* Digital Pass Button (Centered, Prominent & Sleek) */}
              <button
                type="button"
                onClick={() => setShowPassModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/25 font-bold text-xs shadow-sm transition active:scale-95"
              >
                <QrCode className="w-4 h-4 text-teal-400" />
                <span>{t('passTitle')}</span>
              </button>

              {/* Secondary Controls (Centered Row: Edit & Switch Profile) */}
              <div className="flex items-center justify-center gap-2 flex-wrap w-full">
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition active:scale-95 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'km' ? 'កែប្រែព័ត៌មាន (Edit)' : 'Edit Profile'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSwitchProfile}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-medium transition active:scale-95 shadow-sm"
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>{t('mobileSwitchProfile')}</span>
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* CASE B: FIRST-TIME VISITOR - QUICK REGISTRATION FORM + AUTO CHECK-IN      */
          /* ========================================================================= */
          <div>
            
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('firstTimeAttendee')}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {t('mobileFirstTimeTitle')}
              </h2>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder={t('fullNamePlaceholder')}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* University ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('universityId')} *
                </label>
                <input
                  type="text"
                  value={formData.university_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, university_id: e.target.value.toUpperCase() }))}
                  placeholder={t('idPlaceholder')}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono uppercase text-teal-300 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('phone')}</span>
                  <span className="text-[10px] text-teal-400 font-normal">សម្រាប់ទំនាក់ទំនង</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('phonePlaceholder') || '012 345 678'}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('selectRole')} *
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{tRole(r.name)}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('selectDept')} *
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, department_id: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{tDept(d.name)} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('purposeSectionTitle')}
                </label>
                <select
                  value={formData.purpose_of_visit}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, purpose_of_visit: e.target.value }));
                    setAgreementAgreed(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  {popularPurposes.map((p, idx) => (
                    <option key={idx} value={p}>{tPurpose(p)}</option>
                  ))}
                </select>
              </div>

              {/* Book Details & Agreement for First-Time registration */}
              {(formData.purpose_of_visit === 'Book Borrowing' || formData.purpose_of_visit === 'Book Return') && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>{formData.purpose_of_visit === 'Book Borrowing' ? 'ឈ្មោះសៀវភៅ / ចំណងជើងដែលត្រូវខ្ចី *' : 'ឈ្មោះសៀវភៅ / ចំណងជើងដែលត្រូវសង *'}</span>
                  </label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder={formData.purpose_of_visit === 'Book Borrowing' ? t('bookTitleBorrowPlaceholder') : t('bookTitleReturnPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                    required
                  />

                  {/* Agreement Confirmation Checkbox */}
                  <label className="mt-3 flex items-start gap-2.5 cursor-pointer select-none bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/20">
                    <input
                      type="checkbox"
                      checked={agreementAgreed}
                      onChange={(e) => setAgreementAgreed(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span className="text-[11px] text-amber-200/90 leading-snug font-medium">
                      {formData.purpose_of_visit === 'Book Borrowing' ? t('bookAgreementBorrow') : t('bookAgreementReturn')}
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-xl shadow-teal-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{t('btnSaveAndPass')}</span>
                  </>
                )}
              </button>

            </form>

          </div>
        )}

      </div>

      {/* Digital Pass Modal */}
      {showPassModal && savedUser && (
        <DigitalPassModal
          isOpen={showPassModal}
          onClose={() => setShowPassModal(false)}
          user={savedUser}
        />
      )}

    </div>
  );
}
