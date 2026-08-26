import React, { useState } from 'react';
import { X, Edit3, Trash2, CheckCircle2, BookOpen, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { playSuccessChime, playErrorSound } from '../utils/audioChime';

export default function EditSessionModal({ isOpen, onClose, session, onSaveSuccess, onDeleteSuccess }) {
  if (!isOpen || !session) return null;

  const { t, tRole, tDept, tPurpose } = useLanguage();
  const user = session.user || {};

  const [purpose, setPurpose] = useState(session.purpose_of_visit || 'Study & Revision');
  const [topic, setTopic] = useState(session.research_topic || '');
  const [duration, setDuration] = useState(session.duration_minutes || 0);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.updateSession(session.id, {
        purpose_of_visit: purpose,
        research_topic: topic,
        duration_minutes: Number(duration)
      });
      if (res.success) {
        playSuccessChime();
        onSaveSuccess(res.session);
        onClose();
      } else {
        throw new Error(res.message || 'Update failed.');
      }
    } catch (err) {
      setErrorMsg(err.message);
      playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបកំណត់ត្រា #${session.id} របស់ ${user.full_name || 'Visitor'} មែនទេ?`)) {
      return;
    }
    setDeleteLoading(true);
    setErrorMsg('');
    try {
      const res = await api.deleteSession(session.id);
      if (res.success) {
        playSuccessChime();
        onDeleteSuccess(session.id);
        onClose();
      } else {
        throw new Error(res.message || 'Delete failed.');
      }
    } catch (err) {
      setErrorMsg(err.message);
      playErrorSound();
    } finally {
      setDeleteLoading(false);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                កែសម្រួលកំណត់ត្រាវត្តមាន #{session.id}
              </h3>
              <p className="text-xs text-slate-400">
                {user.full_name} ({user.university_id})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Member Details */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">សមាជិក៖</span>
              <span className="font-bold text-white">{user.full_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">តួនាទី / ដេប៉ាតឺម៉ង់៖</span>
              <span className="font-medium text-slate-300">{tRole(user.role_name)} - {tDept(user.department_name)}</span>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              គោលបំណង (Purpose) *
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {popularPurposes.map((p, idx) => (
                <option key={idx} value={p}>{tPurpose(p)}</option>
              ))}
            </select>
          </div>

          {/* Book Title / Research Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>ឈ្មោះសៀវភៅ ឬប្រធានបទស្រាវជ្រាវ (Book Title / Topic)</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ឧ. [ខ្ចី] Data Structures & Algorithms..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          {/* Duration in Minutes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>ថិរវេលា (នាទី / Minutes)</span>
            </label>
            <input
              type="number"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleteLoading ? 'កំពុងលុប...' : 'លុបកំណត់ត្រា (Delete)'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
