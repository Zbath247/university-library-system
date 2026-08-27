import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, CheckCircle2, BookOpen, Clock, AlertCircle, User, Phone, GraduationCap, Building, Activity } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { playSuccessChime, playErrorSound } from '../utils/audioChime';

export default function EditSessionModal({
  isOpen,
  onClose,
  session,
  roles = [],
  departments = [],
  onSaveSuccess,
  onDeleteSuccess
}) {
  if (!isOpen || !session) return null;

  const { t, tRole, tDept, tPurpose } = useLanguage();
  const user = session.user || {};

  // Form states for all session & user details
  const [fullName, setFullName] = useState(user.full_name || '');
  const [universityId, setUniversityId] = useState(user.university_id || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [roleId, setRoleId] = useState(user.role_id || (roles[0]?.id || 1));
  const [deptId, setDeptId] = useState(user.department_id || (departments[0]?.id || 1));
  
  const [purpose, setPurpose] = useState(session.purpose_of_visit || 'Study & Revision');
  const [topic, setTopic] = useState(session.research_topic || '');
  const [duration, setDuration] = useState(session.duration_minutes || 0);
  const [status, setStatus] = useState(session.status || 'COMPLETED');

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state if session changes
  useEffect(() => {
    if (session) {
      const u = session.user || {};
      setFullName(u.full_name || '');
      setUniversityId(u.university_id || '');
      setPhone(u.phone || '');
      setRoleId(u.role_id || (roles[0]?.id || 1));
      setDeptId(u.department_id || (departments[0]?.id || 1));
      setPurpose(session.purpose_of_visit || 'Study & Revision');
      setTopic(session.research_topic || '');
      setDuration(session.duration_minutes || 0);
      setStatus(session.status || 'COMPLETED');
    }
  }, [session]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !universityId.trim()) {
      setErrorMsg('សូមបំពេញឈ្មោះ និងអត្តលេខសម្គាល់!');
      playErrorSound();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.updateSession(session.id, {
        full_name: fullName.trim(),
        university_id: universityId.trim().toUpperCase(),
        phone: phone.trim(),
        role_id: Number(roleId),
        department_id: Number(deptId),
        purpose_of_visit: purpose,
        research_topic: topic.trim(),
        duration_minutes: Number(duration),
        status: status
      });

      if (res.success) {
        playSuccessChime();
        onSaveSuccess(res.session);
        onClose();
      } else {
        throw new Error(res.message || 'Update failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'ការកែប្រែមិនជោគជ័យ!');
      playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបកំណត់ត្រា #${session.id} របស់ ${fullName || 'Visitor'} មែនទេ?`)) {
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
      setErrorMsg(err.message || 'Delete failed.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[88dvh] sm:max-h-[92vh] flex flex-col my-auto">
        
        {/* Sticky Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-5 bg-gradient-to-r from-teal-950/90 via-slate-900 to-indigo-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                កែសម្រួលព័ត៌មាន #{session.id}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Admin Full Access Control • កែសម្រួលព័ត៌មាន User & Session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-3.5 sm:space-y-4 overscroll-contain">
            
            {errorMsg && (
              <div className="p-3 rounded-xl sm:rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: User Profile Details */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3">
              <h4 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>១. ព័ត៌មានផ្ទាល់ខ្លួនរបស់សមាជិក (Member Profile)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    គោត្តនាម និងនាម (Full Name) *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ឧ. សុខ ចាន់ដារ៉ា"
                    required
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                {/* University ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    អត្តលេខ (University ID) *
                  </label>
                  <input
                    type="text"
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value.toUpperCase())}
                    placeholder="ឧ. DUC2024-0417"
                    required
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm font-mono uppercase text-teal-300 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-bold"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>លេខទូរស័ព្ទ (Phone Number)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="012 345 678"
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                {/* Academic Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    <span>តួនាទី (Academic Role)</span>
                  </label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    {roles.length > 0 ? roles.map(r => (
                      <option key={r.id} value={r.id}>{tRole(r.name)}</option>
                    )) : (
                      <>
                        <option value="1">និស្សិត (Student)</option>
                        <option value="2">សាស្ត្រាចារ្យ (Lecturer)</option>
                        <option value="3">សាស្ត្រាចារ្យជាន់ខ្ពស់ (Professor)</option>
                        <option value="4">អ្នកស្រាវជ្រាវ (Researcher)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Department */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>មហាវិទ្យាល័យ / ដេប៉ាតឺម៉ង់ (Department)</span>
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    {departments.length > 0 ? departments.map(d => (
                      <option key={d.id} value={d.id}>{tDept(d.name)} ({d.code})</option>
                    )) : (
                      <option value="1">Computer Science & IT (CS)</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Session & Purpose Details */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3">
              <h4 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>២. ព័ត៌មានការស្រាវជ្រាវ & ខ្ចី-សងសៀវភៅ (Visit & Book Details)</span>
              </h4>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  គោលបំណង (Purpose of Visit) *
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {popularPurposes.map((p, idx) => (
                    <option key={idx} value={p}>{tPurpose(p)}</option>
                  ))}
                </select>
              </div>

              {/* Book Title / Research Topic */}
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {purpose === 'Book Borrowing' ? 'ឈ្មោះសៀវភៅដែលបានខ្ចី (Book Title)' :
                     purpose === 'Book Return' ? 'ឈ្មោះសៀវភៅដែលបានសង (Book Title)' :
                     'ប្រធានបទស្រាវជ្រាវ ឬឈ្មោះសៀវភៅ (Topic / Title)'}
                  </span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="ឧ. Data Structures & Algorithms, កុលាបប៉ៃលិន..."
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-400" />
                    <span>ថិរវេលា (នាទី / Minutes)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-teal-400" />
                    <span>ស្ថានភាព (Status)</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 font-semibold"
                  >
                    <option value="ACTIVE">🟢 {t('statusActive')} (កំពុងនៅក្នុងបណ្ណាល័យ)</option>
                    <option value="COMPLETED">⚪ {t('statusCompleted')} (បានចាកចេញរួចរាល់)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Actions Footer - Always Visible on Mobile */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/95 border-t border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleteLoading ? 'កំពុងលុប...' : 'លុបកំណត់ត្រា (Delete)'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition text-center"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
