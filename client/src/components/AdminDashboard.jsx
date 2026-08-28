import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  TrendingUp,
  Activity,
  UserCheck,
  Building,
  Sparkles,
  RefreshCw,
  LogOut,
  QrCode,
  Layers,
  Database,
  PlusCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import AnalyticsCharts from './AnalyticsCharts';
import SessionsTable from './SessionsTable';
import DigitalPassModal from './DigitalPassModal';
import UsersDirectoryModal from './UsersDirectoryModal';
import RegistrationModal from './RegistrationModal';
import { playCheckoutChime, playSuccessChime } from '../utils/audioChime';

export default function AdminDashboard({ onStatsUpdate, onLogout }) {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { t, tRole, tDept, tPurpose } = useLanguage();

  // Modals
  const [showPassModal, setShowPassModal] = useState(false);
  const [selectedPassUser, setSelectedPassUser] = useState(null);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, sessionsRes, usersRes, metaRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminAnalytics(),
        api.getSessions(),
        api.getUsers(),
        api.getKioskMeta()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (sessionsRes.success) setSessions(sessionsRes.sessions);
      if (usersRes.success) setUsers(usersRes.users);
      if (metaRes.success) {
        setRoles(metaRes.roles);
        setDepartments(metaRes.departments);
      }

      if (onStatsUpdate && statsRes.stats) {
        onStatsUpdate(statsRes.stats.activeCount);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleForceCheckout = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      const res = await api.adminCheckout(sessionId);
      if (res.success) {
        playCheckoutChime();
        await fetchAllData();
      }
    } catch (err) {
      alert(err.message || 'Check-out failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveSession = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      const res = await api.adminApproveSession(sessionId);
      if (res.success) {
        await fetchAllData();
      }
    } catch (err) {
      alert(err.message || 'Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSession = async (sessionId) => {
    try {
      setActionLoading(sessionId);
      const res = await api.adminRejectSession(sessionId);
      if (res.success) {
        await fetchAllData();
      }
    } catch (err) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };



  const handleViewPass = (user) => {
    setSelectedPassUser(user);
    setShowPassModal(true);
  };

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 animate-fade-in">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 bg-slate-900/80 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl glass-panel">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {t('adminTitle')}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
            {t('adminSub')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowDirectoryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('btnAcademicDirectory')} ({users.length})</span>
          </button>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('btnEnrollMember')}</span>
          </button>

          <button
            onClick={fetchAllData}
            title={t('btnRefreshData')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>


        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Active Occupants */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/30 shadow-xl glass-panel relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              {t('statInsideNow')}
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-mono tracking-tight">
              {stats?.activeCount ?? 0}
            </span>
            <span className="text-xs text-slate-400">{t('statInsideFacility')}</span>
          </div>

          {/* Breakdown Pills */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80 text-[10px] flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              {stats?.activeBreakdown?.students ?? 0} {tRole('Student')}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              {stats?.activeBreakdown?.lecturers ?? 0} {tRole('Lecturer')}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
              {stats?.activeBreakdown?.professors ?? 0} {tRole('Professor')}
            </span>
          </div>
        </div>

        {/* Card 2: Today's Total Visits */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl glass-panel">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {t('statTodayVisits')}
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-mono tracking-tight">
              {stats?.todayVisits ?? 0}
            </span>
            <span className="text-xs text-slate-400">{t('activeOccupants')}</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
            {t('totalMembersCount')}: <strong className="text-white font-mono">{stats?.totalAllTimeSessions ?? 0}</strong>
          </p>
        </div>

        {/* Card 4: Peak Hours */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl glass-panel">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              {t('statPeakHour')}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {stats?.peakHour || '09:00 - 10:00'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
            {t('statPeakHourDesc')}
          </p>
        </div>

      </div>

      {/* Live Occupants Room Monitor */}
      {activeSessions.length > 0 && (
        <div className="rounded-3xl bg-slate-900/90 border-2 border-teal-500/30 shadow-xl p-6 glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
              </span>
              <h3 className="text-base font-bold text-white">
                {t('tabLiveSessions')} ({activeSessions.length} {t('activeOccupants')})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeSessions.map(session => {
              const u = session.user || {};
              const checkInTime = new Date(session.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between hover:border-teal-500/40 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-bold text-white truncate">{u.full_name}</h4>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white"
                        style={{ backgroundColor: u.role_badge_color || '#3B82F6' }}
                      >
                        {tRole(u.role_name)}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-teal-400 mb-1">{u.university_id}</p>
                    {(() => {
                      const purpose = session.purpose_of_visit || u.default_purpose || 'Study & Revision';
                      const rawTopic = session.research_topic || u.research_field || '';
                      const cleanTopic = rawTopic.replace(/^\[(ខ្ចី|សង)\]\s*/, '').trim();

                      if (purpose === 'Book Borrowing') {
                        return (
                          <div className="mb-2 text-xs">
                            <span className="text-amber-400 font-bold">📚 {tPurpose('Book Borrowing')}</span>
                            {cleanTopic && <p className="text-[11px] text-amber-200 font-medium truncate mt-0.5">📖 {cleanTopic}</p>}
                          </div>
                        );
                      }
                      if (purpose === 'Book Return') {
                        return (
                          <div className="mb-2 text-xs">
                            <span className="text-emerald-400 font-bold">📗 {tPurpose('Book Return')}</span>
                            {cleanTopic && <p className="text-[11px] text-emerald-200 font-medium truncate mt-0.5">📥 {cleanTopic}</p>}
                          </div>
                        );
                      }
                      return (
                        <p className="text-xs text-slate-300 font-medium truncate mb-2">
                          🔬 {tPurpose(purpose)}
                          {cleanTopic && cleanTopic !== purpose && <span className="text-slate-400 text-[11px]"> ({cleanTopic})</span>}
                        </p>
                      );
                    })()}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">
                      {t('inSince')} {checkInTime} ({session.duration_minutes}m)
                    </span>
                    <button
                      onClick={() => handleForceCheckout(session.id)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition"
                    >
                      {t('btnForceCheckout')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Visualizations */}
      <AnalyticsCharts analytics={analytics} />

      {/* Filterable Attendance & Research Session History Table */}
      <SessionsTable
        sessions={sessions}
        roles={roles}
        departments={departments}
        loading={loading}
        actionLoading={actionLoading}
        onRefresh={fetchAllData}
        onForceCheckout={handleForceCheckout}
        onApproveSession={handleApproveSession}
        onRejectSession={handleRejectSession}
        onViewPass={handleViewPass}
      />

      {/* Modals */}
      <DigitalPassModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        user={selectedPassUser}
      />

      {/* Academic Directory Modal */}
      {showDirectoryModal && (
        <UsersDirectoryModal
          isOpen={showDirectoryModal}
          onClose={() => setShowDirectoryModal(false)}
          users={users}
          roles={roles}
          departments={departments}
          onViewPass={handleViewPass}
          onAddUser={() => {
            setShowDirectoryModal(false);
            setShowAddUserModal(true);
          }}
          onUserDeleted={fetchAllData}
        />
      )}

      <RegistrationModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        initialId={`ACAD-${Math.floor(1000 + Math.random() * 9000)}`}
        roles={roles}
        departments={departments}
        onSuccess={() => {
          fetchAllData();
        }}
      />

    </div>
  );
}
