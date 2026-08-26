import React, { useEffect, useState } from 'react';
import { CheckCircle2, QrCode, LogOut, Clock, BookOpen, GraduationCap, X, Sparkles, Building } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WelcomeCard({
  user,
  session,
  isAlreadyActive = false,
  isNewUser = false,
  onCheckOut,
  onViewPass,
  onDismiss
}) {
  const [countdown, setCountdown] = useState(12);
  const { t, tRole, tDept, tPurpose } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDismiss]);

  if (!user) return null;

  const checkInTimeStr = session?.check_in_time
    ? new Date(session.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isPending = session?.status === 'PENDING_APPROVAL';

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-teal-500/40 shadow-2xl shadow-teal-500/10 overflow-hidden animate-slide-up">
      
      {/* Top Banner */}
      <div className={`px-6 py-4 flex items-center justify-between ${
        isPending
          ? 'bg-amber-500/15 border-b border-amber-500/30 text-amber-300'
          : isAlreadyActive
            ? 'bg-amber-500/15 border-b border-amber-500/30 text-amber-300'
            : 'bg-teal-500/15 border-b border-teal-500/30 text-teal-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-xl ${isPending || isAlreadyActive ? 'bg-amber-500/20 text-amber-400' : 'bg-teal-500/20 text-teal-400'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-white">
              {isPending ? 'Pending Admin Approval' : isAlreadyActive ? t('welcomeActiveTitle') : isNewUser ? t('welcomeRegisteredTitle') : t('checkInSuccess')}
            </h4>
            <p className="text-[11px] opacity-80">
              {isPending
                ? 'Please wait for the librarian to approve your request.'
                : isAlreadyActive
                  ? `${t('alreadyActiveMsg')} ${checkInTimeStr}`
                  : `${t('colEntryTime')}: ${checkInTimeStr}`}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        
        {/* User Card */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/10 shrink-0">
            {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg font-extrabold text-white truncate font-sans">
                {user.full_name}
              </h3>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono text-white shadow-sm"
                style={{ backgroundColor: user.role_badge_color || '#3B82F6' }}
              >
                {tRole(user.role_name)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <span className="font-mono text-teal-300 font-semibold">{user.university_id}</span>
              <span>•</span>
              <span className="truncate">{tDept(user.department_name)}</span>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-5">
          <p className="text-sm text-teal-200 font-medium leading-relaxed">
            {isAlreadyActive ? (
              <span>
                {t('alreadyActiveMsg')} <strong className="text-white font-mono">{checkInTimeStr}</strong>
              </span>
            ) : (
              <span>
                {t('welcomeMsg')}
              </span>
            )}
          </p>
        </div>

        {/* Research Context Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-5">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold">{t('deptLabel')}</span>
            </div>
            <p className="text-slate-200 font-medium truncate">
              {tDept(user.department_name)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">{t('purposeLabel')}</span>
            </div>
            <p className="text-slate-200 font-medium truncate">
              {tPurpose(session?.purpose_of_visit || user.default_purpose || 'Study & Revision')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAlreadyActive ? (
            <button
              onClick={() => onCheckOut(session?.id || user.id)}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white transition shadow-lg shadow-rose-500/25"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('tabCheckOut')}</span>
            </button>
          ) : (
            <button
              onClick={onDismiss}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('btnContinueLibrary')}</span>
            </button>
          )}

          <button
            onClick={() => onViewPass(user)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span>{t('passTitle')}</span>
          </button>
        </div>

      </div>

      {/* Auto-Dismiss Countdown Bar */}
      <div className="w-full bg-slate-800/60 h-1.5">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 12) * 100}%` }}
        />
      </div>

    </div>
  );
}
