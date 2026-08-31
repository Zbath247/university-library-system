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

export default function AdminDashboard({ view = 'OVERVIEW', onStatsUpdate, onLogout }) {
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



  // Removed local dashboardTab state as it is now controlled by the 'view' prop

  const handleViewPass = (user) => {
    setSelectedPassUser(user);
    setShowPassModal(true);
  };

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/95 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shadow-sm shadow-teal-400/50" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t('adminTitle')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium pl-5">
            {t('adminSub')}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowDirectoryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 shadow-sm hover:shadow transition active:scale-95"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{t('btnAcademicDirectory')}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-indigo-300 text-[10px] font-mono border border-indigo-500/20">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 shadow-sm hover:shadow-teal-500/10 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span>{t('btnEnrollMember')}</span>
          </button>

          <button
            onClick={fetchAllData}
            title={t('btnRefreshData')}
            className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 shadow-sm transition active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      {view === 'OVERVIEW' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Active Occupants */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-teal-950/20 border border-teal-500/30 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/50 transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                {t('statInsideNow')}
              </span>
              <div className="p-2.5 rounded-2xl bg-teal-500/15 text-teal-300 border border-teal-500/20 group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {stats?.activeCount ?? 0}
              </span>
              <span className="text-xs text-teal-300 font-semibold">{t('statInsideFacility')}</span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-slate-800/80 text-[11px] flex-wrap">
            <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/20 font-mono font-medium">
              {stats?.activeBreakdown?.students ?? 0} {tRole('Student')}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-mono font-medium">
              {stats?.activeBreakdown?.lecturers ?? 0} {tRole('Lecturer')}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/20 font-mono font-medium">
              {stats?.activeBreakdown?.professors ?? 0} {tRole('Professor')}
            </span>
          </div>
        </div>

        {/* Card 2: Today's Total Visits */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-indigo-950/20 border border-indigo-500/25 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {t('statTodayVisits')}
              </span>
              <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {stats?.todayVisits ?? 0}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{t('activeOccupants')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-5 pt-3 border-t border-slate-800/80">
            <span>{t('totalMembersCount')}:</span>
            <strong className="text-white font-mono bg-slate-800/90 px-2 py-0.5 rounded-lg border border-slate-700/60">
              {stats?.totalAllTimeSessions ?? 0}
            </strong>
          </div>
        </div>

        {/* Card 3: Peak Hours */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-purple-950/20 border border-purple-500/25 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                {t('statPeakHour')}
              </span>
              <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight bg-gradient-to-r from-purple-300 to-indigo-200 bg-clip-text text-transparent">
                {stats?.peakHour || '14:00 - 15:00'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-5 pt-3 border-t border-slate-800/80 truncate">
            {t('statPeakHourDesc')}
          </p>
        </div>

        </div>
      )}

      {/* Sub-Tab Navigation removed - now handled by Sidebar tabs */}

      {/* Tab 1: Live Overview View */}
      {view === 'OVERVIEW' && (
        <div className="space-y-6 animate-fade-in">
          {/* Member Directory Inline */}
          <UsersDirectoryModal
            inline={true}
            users={users}
            roles={roles}
            departments={departments}
            onViewPass={handleViewPass}
            onAddUser={() => setShowAddUserModal(true)}
            onUserDeleted={fetchAllData}
          />
        </div>
      )}

      {/* Tab 2: Attendance Logs View */}
      {view === 'LOGS' && (
        <div className="space-y-6 animate-fade-in">
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
        </div>
      )}

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
