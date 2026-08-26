import React, { useEffect, useState } from 'react';
import { X, Printer, Download, Sparkles, BookOpen, ShieldCheck, QrCode } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function DigitalPassModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { t, tRole, tDept } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    async function loadQr() {
      try {
        setLoading(true);
        const data = await api.getBadge(user.university_id);
        if (isMounted && data.success) {
          setQrUrl(data.qrDataUrl);
        }
      } catch (err) {
        console.error('Failed to load QR badge', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadQr();
    return () => { isMounted = false; };
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">{t('passTitle')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          
          {/* Printable Card */}
          <div id="printable-badge" className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-teal-500/30 shadow-xl relative overflow-hidden">
            
            {/* Watermark University Crest */}
            <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
              <BookOpen className="w-48 h-48 text-teal-300" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 block">
                  {t('appName')} {t('library')}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {t('passAttendanceCard')}
                </span>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono text-white shadow-sm"
                style={{ backgroundColor: user.role_badge_color || '#3B82F6' }}
              >
                {tRole(user.role_name)}
              </span>
            </div>

            {/* QR Code */}
            <div className="flex justify-center my-3">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                {loading ? (
                  <div className="w-44 h-44 flex items-center justify-center">
                    <span className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <img src={qrUrl} alt="Library QR Pass" className="w-44 h-44 object-contain" />
                )}
              </div>
            </div>

            {/* Member Details */}
            <div className="text-center mt-3">
              <h4 className="text-base font-extrabold text-white">{user.full_name}</h4>
              <p className="text-xs font-mono font-bold text-teal-300 tracking-wider mt-0.5">
                {user.university_id}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {tDept(user.department_name)}
              </p>
              <p className="text-[10px] text-teal-400/80 mt-1">
                {t('passValidText')}
              </p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-md shadow-teal-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>{t('btnPrintPass')}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {t('btnClose')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
