import React, { useState } from 'react';
import { X, Users, Search, QrCode, UserPlus, Mail, Phone, Building, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export default function UsersDirectoryModal({
  isOpen,
  onClose,
  users = [],
  roles = [],
  departments = [],
  onViewPass,
  onAddUser,
  onUserDeleted,
  inline = false
}) {
  if (!inline && !isOpen) return null;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { t, tRole, tDept } = useLanguage();

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបគណនីរបស់ ${user.full_name} (${user.university_id}) មែនទេ?`)) {
      return;
    }
    setDeletingId(user.id);
    try {
      const res = await api.deleteUser(user.id);
      if (res.success) {
        if (onUserDeleted) onUserDeleted(user.id);
      } else {
        alert(res.message || 'Delete failed.');
      }
    } catch (err) {
      alert('Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter && String(u.role_id) !== String(roleFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = u.full_name && u.full_name.toLowerCase().includes(q);
      const matchId = u.university_id && u.university_id.toLowerCase().includes(q);
      const matchField = u.research_field && u.research_field.toLowerCase().includes(q);
      const matchDept = u.department_name && u.department_name.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchField && !matchDept) return false;
    }
    return true;
  });

  return (
    <div className={inline ? "w-full animate-fade-in" : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"}>
      <div className={`relative w-full overflow-hidden flex flex-col ${inline ? 'bg-transparent' : 'max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-h-[88vh] animate-slide-up'}`}>
        
        {/* Header */}
        <div className={`p-6 bg-slate-950 flex items-center justify-between ${inline ? 'rounded-t-3xl border border-slate-800' : 'border-b border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('directoryTitle')}</h3>
              <p className="text-xs text-slate-400">
                {t('directorySub')} ({filteredUsers.length} នាក់)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddUser}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('btnAddMember')}</span>
            </button>

            {!inline && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchMemberPlaceholder')}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">{t('allRoles')}</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{tRole(r.name)}</option>
            ))}
          </select>
        </div>

        {/* Users List Grid */}
        <div className={`p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${inline ? 'border-x border-b border-slate-800 rounded-b-3xl bg-slate-900/40' : ''}`}>
          {filteredUsers.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-sm">
              {t('noSessionsFound')}
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-sm text-teal-300 border border-slate-700 shrink-0">
                        {user.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[180px]">
                          {user.full_name}
                        </h4>
                        <span className="font-mono text-xs text-teal-400 font-semibold">
                          {user.university_id}
                        </span>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold font-mono text-white shadow-xs"
                      style={{ backgroundColor: user.role_badge_color || '#3B82F6' }}
                    >
                      {tRole(user.role_name)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 mb-3">
                    <p className="truncate flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{tDept(user.department_name)} ({user.department_code})</span>
                    </p>
                    <p className="truncate flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{user.email || 'N/A'}</span>
                    </p>
                    {user.phone && (
                      <p className="truncate flex items-center gap-1 text-slate-300 font-mono">
                        <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{user.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    ID: {user.university_id}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDeleteUser(user)}
                      disabled={deletingId === user.id}
                      title="លុបគណនី (Delete Profile)"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 hover:text-rose-200 border border-rose-500/20 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => { onClose(); onViewPass(user); }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{t('viewPass')}</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
