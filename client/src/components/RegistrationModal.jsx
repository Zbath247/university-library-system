import React, { useState } from 'react';
import { X, UserPlus, GraduationCap, Building, Sparkles, Mail, Phone, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessChime, playErrorSound } from '../utils/audioChime';
import { useLanguage } from '../context/LanguageContext';

export default function RegistrationModal({
  isOpen,
  onClose,
  initialId,
  roles = [],
  departments = [],
  onSuccess
}) {
  if (!isOpen) return null;

  const { t, tRole, tDept, tPurpose } = useLanguage();

  const [formData, setFormData] = useState({
    university_id: initialId || '',
    full_name: '',
    email: '',
    phone: '',
    role_id: roles.length > 0 ? roles[0].id : 1,
    department_id: departments.length > 0 ? departments[0].id : 1,
    research_field: '',
    purpose_of_visit: 'Study & Revision'
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const popularPurposes = [
    'Study & Revision',
    'Thesis & Academic Research',
    'Book Reading & Borrowing',
    'Group Discussion & Project',
    'Computer & Digital Lab',
    'Printing & Document Service'
  ];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setErrorMsg('');
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({ ...prev, role_id: roleId }));
  };

  const handleNext = () => {
    if (!formData.full_name.trim()) {
      setErrorMsg(t('inputRequired'));
      playErrorSound();
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/kiosk/register-and-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      playSuccessChime();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      onSuccess(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
      playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{t('regTitle')}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ID: {formData.university_id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('regSub')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              step === 1 ? 'bg-teal-500 text-slate-950' : 'bg-teal-500/20 text-teal-300'
            }`}>
              1
            </div>
            <span className={step === 1 ? 'font-semibold text-white' : 'text-slate-400'}>
              {t('fullName')} & {t('selectRole')}
            </span>
          </div>

          <div className="h-0.5 w-12 bg-slate-800">
            <div className={`h-full bg-teal-500 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              step === 2 ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              2
            </div>
            <span className={step === 2 ? 'font-semibold text-white' : 'text-slate-400'}>
              {t('selectDept')} & {t('purposeLabel')}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="p-6">
          
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  {t('selectRole')} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {roles.map(role => {
                    const isSelected = Number(formData.role_id) === Number(role.id);
                    return (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-teal-500/15 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <GraduationCap className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                        </div>
                        <p className="text-xs font-bold">{tRole(role.name)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name & University ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder={t('fullNamePlaceholder')}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('universityId')} *
                  </label>
                  <input
                    type="text"
                    name="university_id"
                    value={formData.university_id}
                    onChange={handleChange}
                    placeholder={t('idPlaceholder')}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono uppercase text-teal-300 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('emailPlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('phone')}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('phonePlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              
              {/* Department / Faculty */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('selectDept')} *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition appearance-none"
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                        {tDept(dept.name)} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Research Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('researchField')} *
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="research_field"
                    value={formData.research_field}
                    onChange={handleChange}
                    placeholder={t('researchFieldPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
              </div>

              {/* Purpose of Visit */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('purposeSectionTitle')}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {popularPurposes.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormData(prev => ({ ...prev, purpose_of_visit: p }))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        formData.purpose_of_visit === p
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-medium'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tPurpose(p)}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                {t('btnBack')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                {t('btnCancel')}
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20"
              >
                <span>{t('btnContinueToStep2')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 transition shadow-lg shadow-teal-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{t('processing')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('btnSaveAndPass')}</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
