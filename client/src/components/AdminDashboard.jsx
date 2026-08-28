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



  const [dashboardTab, setDashboardTab] = useState('OVERVIEW'); // 'OVERVIEW', 'ANALYTICS', 'LOGS'

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

      {/* Modern Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-start gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setDashboardTab('OVERVIEW')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            dashboardTab === 'OVERVIEW'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>ទិដ្ឋភាពទូទៅ & វត្តមានផ្ទាល់ (Live Overview)</span>
          {activeSessions.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${dashboardTab === 'OVERVIEW' ? 'bg-slate-950/20 text-slate-950' : 'bg-teal-500/20 text-teal-300'}`}>
              {activeSessions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setDashboardTab('ANALYTICS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            dashboardTab === 'ANALYTICS'
              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>ស្ថិតិវិភាគទិន្នន័យ (Analytics & Charts)</span>
        </button>

        <button
          type="button"
          onClick={() => setDashboardTab('LOGS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            dashboardTab === 'LOGS'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>កំណត់ត្រាវត្តមានទាំងអស់ (Attendance Logs)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${dashboardTab === 'LOGS' ? 'bg-slate-950/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
            {sessions.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Live Overview View */}
      {dashboardTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Live Occupants Room Monitor */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-teal-500/30 shadow-2xl p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {t('tabLiveSessions')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono font-bold border border-teal-500/30">
                  {activeSessions.length} {t('activeOccupants')}
                </span>
              </div>
            </div>

            {activeSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSessions.map(session => {
                  const u = session.user || {};
                  const checkInTime = new Date(session.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-teal-500/50 shadow-md flex flex-col justify-between transition duration-200 group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate group-hover:text-teal-300 transition-colors">
                              {u.full_name}
                            </h4>
                            <span className="text-xs font-mono font-bold text-teal-400">
                              {u.university_id}
                            </span>
                          </div>
                          <span
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono text-white shadow-sm shrink-0"
                            style={{ backgroundColor: u.role_badge_color || '#3B82F6' }}
                          >
                            {tRole(u.role_name)}
                          </span>
                        </div>

                        {(() => {
                          const purpose = session.purpose_of_visit || u.default_purpose || 'Study & Revision';
                          const rawTopic = session.research_topic || u.research_field || '';
                          const cleanTopic = rawTopic.replace(/^\[(ខ្ចី|សង)\]\s*/, '').trim();

                          if (purpose === 'Book Borrowing') {
                            return (
                              <div className="mb-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                  📚 {tPurpose('Book Borrowing')}
                                </span>
                                {cleanTopic && <p className="text-[11px] text-amber-200 font-medium truncate mt-0.5">📖 {cleanTopic}</p>}
                              </div>
                            );
                          }
                          if (purpose === 'Book Return') {
                            return (
                              <div className="mb-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  📗 {tPurpose('Book Return')}
                                </span>
                                {cleanTopic && <p className="text-[11px] text-emerald-200 font-medium truncate mt-0.5">📥 {cleanTopic}</p>}
                              </div>
                            );
                          }
                          return (
                            <div className="mb-3 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                              <span className="text-slate-300 font-medium truncate block">
                                🔬 {tPurpose(purpose)}
                              </span>
                              {cleanTopic && cleanTopic !== purpose && (
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {cleanTopic}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {t('inSince')} {checkInTime} ({session.duration_minutes}m)
                        </span>
                        <button
                          onClick={() => handleForceCheckout(session.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition shadow-sm"
                        >
                          {t('btnForceCheckout')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs sm:text-sm bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                <p>បច្ចុប្បន្នគ្មានវត្តមានអ្នកនៅក្នុងបណ្ណាល័យឡើយ (No active occupants currently inside)</p>
              </div>
            )}
          </div>

          {/* Quick Analytics Visualizations Preview */}
          <AnalyticsCharts analytics={analytics} />

        </div>
      )}

      {/* Tab 2: Analytics & Charts View */}
      {dashboardTab === 'ANALYTICS' && (
        <div className="space-y-6 animate-fade-in">
          <AnalyticsCharts analytics={analytics} />
        </div>
      )}

      {/* Tab 3: Attendance Logs View */}
      {dashboardTab === 'LOGS' && (
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
