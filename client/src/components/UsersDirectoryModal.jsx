import React, { useState } from 'react';
import { X, Users, Search, QrCode, UserPlus, Mail, Phone, BookOpen, GraduationCap, Building } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function UsersDirectoryModal({
  isOpen,
  onClose,
  users = [],
  roles = [],
  departments = [],
  onViewPass,
  onAddUser
}) {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { t, tRole, tDept } = useLanguage();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('directoryTitle')}</h3>
              <p className="text-xs text-slate-400">
                {t('directorySub')} ({filteredUsers.length})
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

        {/* Filter Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchMemberPlaceholder')}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="">{t('filterAllRoles')}</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{tRole(r.name)}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => { onClose(); onAddUser(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('btnAddMember')}</span>
          </button>
        </div>

        {/* Directory Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
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
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    ID: {user.university_id}
                  </span>
                  <button
                    onClick={() => { onClose(); onViewPass(user); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{t('viewPass')}</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
