import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  LogOut,
  Sparkles,
  QrCode,
  GraduationCap,
  Building,
  RefreshCw,
  BookOpen,
  Edit3,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import EditSessionModal from './EditSessionModal';

export default function SessionsTable({
  sessions = [],
  roles = [],
  departments = [],
  loading = false,
  onRefresh,
  onForceCheckout,
  onViewPass
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [categoryTab, setCategoryTab] = useState('ALL'); // 'ALL', 'VISIT', 'BORROW', 'RETURN'
  const [editingSession, setEditingSession] = useState(null);

  const { t, tRole, tDept, tPurpose } = useLanguage();

  // Category counts
  const countAll = sessions.length;
  const countVisit = sessions.filter(s => s.purpose_of_visit !== 'Book Borrowing' && s.purpose_of_visit !== 'Book Return').length;
  const countBorrow = sessions.filter(s => s.purpose_of_visit === 'Book Borrowing').length;
  const countReturn = sessions.filter(s => s.purpose_of_visit === 'Book Return').length;

  // Client-side filtering for immediate snappy responses
  const filteredSessions = sessions.filter(s => {
    const user = s.user || {};

    // 1. Category segmentation
    if (categoryTab === 'VISIT') {
      if (s.purpose_of_visit === 'Book Borrowing' || s.purpose_of_visit === 'Book Return') return false;
    } else if (categoryTab === 'BORROW') {
      if (s.purpose_of_visit !== 'Book Borrowing') return false;
    } else if (categoryTab === 'RETURN') {
      if (s.purpose_of_visit !== 'Book Return') return false;
    }

    if (statusFilter && s.status !== statusFilter) return false;
    if (roleFilter && String(user.role_id) !== String(roleFilter)) return false;
    if (deptFilter && String(user.department_id) !== String(deptFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = user.full_name && user.full_name.toLowerCase().includes(q);
      const matchId = user.university_id && user.university_id.toLowerCase().includes(q);
      const matchTopic = s.research_topic && s.research_topic.toLowerCase().includes(q);
      const matchPurpose = s.purpose_of_visit && s.purpose_of_visit.toLowerCase().includes(q);
      const matchDept = user.department_name && user.department_name.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchTopic && !matchPurpose && !matchDept) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const exportUrl = api.getExportCsvUrl({
      status: statusFilter,
      role_id: roleFilter,
      department_id: deptFilter,
      search,
      category: categoryTab !== 'ALL' ? categoryTab : undefined
    });
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden glass-panel">
      
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t('tabAllLogs')}
              </h3>
              <p className="text-xs text-slate-400">
                {filteredSessions.length} / {sessions.length} កំណត់ត្រា
              </p>
            </div>
          </div>
        </div>

        {/* Actions: Refresh & Export CSV */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('btnRefreshData')}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20"
            title={categoryTab === 'ALL' ? 'ទាញយកទិន្នន័យទាំងអស់' : `ទាញយកតែទិន្នន័យ៖ ${categoryTab}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('btnExportCsv')} {categoryTab !== 'ALL' && `(${categoryTab === 'BORROW' ? 'ខ្ចី' : categoryTab === 'RETURN' ? 'សង' : 'ចូល'})`}</span>
          </button>
        </div>

      </div>

      {/* Segmented Category Filter Tabs */}
      <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center gap-2">
        
        {/* All */}
        <button
          type="button"
          onClick={() => setCategoryTab('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'ALL'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>📑 ទាំងអស់ (All)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${categoryTab === 'ALL' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
            {countAll}
          </span>
        </button>

        {/* 1. ចូលបណ្ណាល័យ */}
        <button
          type="button"
          onClick={() => setCategoryTab('VISIT')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'VISIT'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🏛️ ១. ចូលបណ្ណាល័យ</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${categoryTab === 'VISIT' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
            {countVisit}
          </span>
        </button>

        {/* 2. ខ្ចីសៀវភៅ */}
        <button
          type="button"
          onClick={() => setCategoryTab('BORROW')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'BORROW'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>📚 ២. ខ្ចីសៀវភៅ</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${categoryTab === 'BORROW' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'}`}>
            {countBorrow}
          </span>
        </button>

        {/* 3. សងសៀវភៅ */}
        <button
          type="button"
          onClick={() => setCategoryTab('RETURN')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            categoryTab === 'RETURN'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>📗 ៣. សងសៀវភៅ</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${categoryTab === 'RETURN' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-emerald-300'}`}>
            {countReturn}
          </span>
        </button>

      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchMemberPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="">{t('statusActive')} & {t('statusCompleted')}</option>
            <option value="ACTIVE">🟢 {t('statusActive')}</option>
            <option value="COMPLETED">⚪ {t('statusCompleted')}</option>
          </select>
        </div>

        {/* Role */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="">{t('filterAllRoles')}</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{tRole(r.name)}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="">{t('colDept')}</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{tDept(d.name)} ({d.code})</option>
            ))}
          </select>
        </div>

      </div>

      {/* Sessions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">{t('colMember')}</th>
              <th className="py-3.5 px-4">{t('colRole')} & {t('colDept')}</th>
              <th className="py-3.5 px-4">{t('colPurpose')}</th>
              <th className="py-3.5 px-4">{t('colEntryTime')} / {t('colExitTime')}</th>
              <th className="py-3.5 px-4">{t('colDuration')}</th>
              <th className="py-3.5 px-4">{t('colStatus')}</th>
              <th className="py-3.5 px-4 text-right">{t('colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  {t('noSessionsFound')}
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => {
                const user = session.user || {};
                const isActive = session.status === 'ACTIVE';
                const inTime = new Date(session.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const inDate = new Date(session.check_in_time).toLocaleDateString([], { month: 'short', day: 'numeric' });
                const outTime = session.check_out_time ? new Date(session.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isActive ? t('statusActive') : '-');

                const hours = Math.floor(session.duration_minutes / 60);
                const mins = session.duration_minutes % 60;
                const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                return (
                  <tr key={session.id} className="hover:bg-slate-800/30 transition">
                    
                    {/* Visitor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-slate-700 shrink-0">
                          {(user.full_name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">
                            {user.full_name || 'Visitor'}
                          </p>
                          <p className="font-mono text-[10px] text-teal-400">
                            {user.university_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white shadow-xs"
                          style={{ backgroundColor: user.role_badge_color || '#3B82F6' }}
                        >
                          {tRole(user.role_name || 'Student')}
                        </span>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {tDept(user.department_name)}
                        </p>
                      </div>
                    </td>

                    {/* Purpose & Book Title / Research Topic */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {(() => {
                        const purpose = session.purpose_of_visit || user.default_purpose || 'Study & Revision';
                        const isBorrow = purpose === 'Book Borrowing';
                        const isReturn = purpose === 'Book Return';
                        const rawTopic = session.research_topic || user.research_field || '';
                        const cleanTopic = rawTopic.replace(/^\[(ខ្ចី|សង)\]\s*/, '').trim();

                        if (isBorrow) {
                          return (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <BookOpen className="w-3 h-3 text-amber-400" />
                                  {tPurpose('Book Borrowing')}
                                </span>
                              </div>
                              {cleanTopic && (
                                <p className="text-xs text-amber-100 font-bold flex items-center gap-1.5 truncate max-w-[220px]" title={cleanTopic}>
                                  <span>📖</span> <span className="underline decoration-amber-500/50">{cleanTopic}</span>
                                </p>
                              )}
                            </div>
                          );
                        }

                        if (isReturn) {
                          return (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <BookOpen className="w-3 h-3 text-emerald-400" />
                                  {tPurpose('Book Return')}
                                </span>
                              </div>
                              {cleanTopic && (
                                <p className="text-xs text-emerald-100 font-bold flex items-center gap-1.5 truncate max-w-[220px]" title={cleanTopic}>
                                  <span>📗</span> <span className="underline decoration-emerald-500/50">{cleanTopic}</span>
                                </p>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col gap-0.5">
                            <p className="font-semibold text-slate-200 truncate">
                              {tPurpose(purpose)}
                            </p>
                            {cleanTopic && cleanTopic !== purpose && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[220px]" title={cleanTopic}>
                                🔬 {cleanTopic}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Times */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-mono text-slate-200 block">
                          {inTime} <span className="text-slate-500">({inDate})</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          → {outTime}
                        </span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-bold ${isActive ? 'text-teal-400 animate-pulse' : 'text-slate-300'}`}>
                        {durationFormatted}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                          <span>{t('statusActive')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                          {t('statusCompleted')}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewPass(user)}
                          title={t('passTitle')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <QrCode className="w-3.5 h-3.5 text-teal-400" />
                        </button>

                        {/* Edit Record Button */}
                        <button
                          onClick={() => setEditingSession(session)}
                          title="កែសម្រួលកំណត់ត្រា (Edit Record)"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {isActive && (
                          <button
                            onClick={() => onForceCheckout(session.id)}
                            title={t('btnForceCheckout')}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>{t('tabCheckOut')}</span>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <EditSessionModal
          isOpen={!!editingSession}
          session={editingSession}
          roles={roles}
          departments={departments}
          onClose={() => setEditingSession(null)}
          onSaveSuccess={() => onRefresh && onRefresh()}
          onDeleteSuccess={() => onRefresh && onRefresh()}
        />
      )}

    </div>
  );
}
