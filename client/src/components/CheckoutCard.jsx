import React, { useEffect, useState } from 'react';
import { LogOut, Clock, Award, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CheckoutCard({ session, durationFormatted, onDismiss }) {
  const [countdown, setCountdown] = useState(10);
  const { t } = useLanguage();

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

  if (!session) return null;

  const user = session.user || {};
  const inTime = session.check_in_time ? new Date(session.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const outTime = session.check_out_time ? new Date(session.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl bg-slate-900 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-500/10 overflow-hidden animate-slide-up">
      
      {/* Top Banner */}
      <div className="px-6 py-4 bg-indigo-500/15 border-b border-indigo-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{t('checkoutTitle')}</h4>
            <p className="text-[11px] text-indigo-200">{t('checkoutSub')}</p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        
        {/* Total Time Badge */}
        <div className="text-center py-6 px-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5 relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20 mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('durationLabel')}</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-white to-indigo-300 font-mono tracking-tight my-1">
            {durationFormatted || `${session.duration_minutes || 1} min`}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {t('wishingMsg')}
          </p>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">{t('entryTimeLabel')}</span>
            <span className="font-mono font-bold text-teal-300 text-sm">{inTime}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">{t('exitTimeLabel')}</span>
            <span className="font-mono font-bold text-indigo-300 text-sm">{outTime}</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
        >
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{t('btnDoneNext')}</span>
        </button>

      </div>

      {/* Countdown progress */}
      <div className="w-full bg-slate-800/60 h-1.5">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 10) * 100}%` }}
        />
      </div>

    </div>
  );
}
