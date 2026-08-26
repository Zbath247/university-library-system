import React, { useState } from 'react';
import { X, KeyRound, AlertTriangle, Trash2, Eye, EyeOff, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import { playSuccessChime, playErrorSound } from '../utils/audioChime';

export default function ConfirmResetModal({ isOpen, onClose, onSuccess, title, description }) {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('សូមបញ្ចូលលេខសម្ងាត់ Admin!');
      playErrorSound();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.resetSessions(password);
      if (res.success) {
        playSuccessChime();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error(res.message || 'លេខសម្ងាត់មិនត្រឹមត្រូវ!');
      }
    } catch (err) {
      setErrorMsg(err.message || 'លេខសម្ងាត់ Admin មិនត្រឹមត្រូវ!');
      playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {title || 'បញ្ជាក់ការ Reset ទិន្នន័យ'}
              </h3>
              <p className="text-xs text-slate-400">
                Admin Password Verification Required
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
        <form onSubmit={handleConfirmReset} className="p-6 space-y-4">
          
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-start gap-2.5 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              {description || 'សកម្មភាពនេះនឹងសម្អាតទិន្នន័យវត្តមាន និងការខ្ចី-សងទាំងអស់ ដើម្បីចាប់ផ្តើមវដ្តទិន្នន័យថ្មីជា ០។ សូមបញ្ចូលលេខសម្ងាត់ Admin ដើម្បីបញ្ជាក់៖'}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 font-bold flex items-center gap-2">
              <X className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Admin Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              លេខសម្ងាត់ Admin (Admin Password) *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="បញ្ចូលលេខសម្ងាត់ Admin..."
                required
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              បោះបង់ (Cancel)
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>កំពុងផ្ទៀងផ្ទាត់...</span>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>បញ្ជាក់ការ Reset ឥឡូវនេះ</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
