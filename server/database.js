const User = require('./models/User');
const Session = require('./models/Session');
const Role = require('./models/Role');
const Department = require('./models/Department');

class DatabaseWrapper {
  constructor() {
    this.seedReferenceData();
  }

  async seedReferenceData() {
    const rolesCount = await Role.countDocuments();
    if (rolesCount === 0) {
      await Role.insertMany([
        { id: 1, name: 'Student', badge_color: '#2563EB', description: 'Undergraduate & Postgraduate Students' },
        { id: 2, name: 'Lecturer', badge_color: '#059669', description: 'Teaching Faculty & Course Instructors' },
        { id: 3, name: 'Professor', badge_color: '#7C3AED', description: 'Tenured & Principal Academic Researchers' },
        { id: 4, name: 'Research Scholar', badge_color: '#D97706', description: 'PhD Candidates & Postdoctoral Fellows' }
      ]);
    }

    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany([
        { id: 1, name: 'ក្រាហ្វិកឌីហ្សាញ', code: 'GD', faculty: 'សិល្បៈ និងរចនា' },
        { id: 2, name: 'ទីផ្សារឌីជីថល', code: 'DM', faculty: 'គ្រប់គ្រងធុរកិច្ច' },
        { id: 3, name: 'ប្រព័ន្ធផ្សព្វផ្សាយសង្គម', code: 'SM', faculty: 'ទំនាក់ទំនង' },
        { id: 4, name: 'ព័ត៌មានវិទ្យា', code: 'IT', faculty: 'វិទ្យាសាស្ត្រកុំព្យូទ័រ' },
        { id: 5, name: 'នីតិសាធារណ:', code: 'PL', faculty: 'ច្បាប់ និងនីតិសាស្ត្រ' },
        { id: 6, name: 'រដ្ឋបាលសាធារណៈ', code: 'PA', faculty: 'រដ្ឋបាលសាធារណៈ' },
        { id: 7, name: 'ក្សេត្រសាស្ត្រ និងសាកវប្បកម្ម', code: 'AH', faculty: 'កសិកម្ម' },
        { id: 8, name: 'វិស្វកម្មសំណង់ស៊ីវិល', code: 'CE', faculty: 'វិស្វកម្ម' },
        { id: 9, name: 'ស្ថាបត្យកម្ម', code: 'ARC', faculty: 'ស្ថាបត្យកម្ម និងនគរូបនីយកម្ម' },
        { id: 10, name: 'បង្រៀនភាសាអង់គ្លេស', code: 'TE', faculty: 'ភាសាបរទេស' },
        { id: 11, name: 'សេដ្ឋកិច្ចនីជីថល', code: 'DE', faculty: 'សេដ្ឋកិច្ច' }
      ]);
    }
  }

  // --- QUERY METHODS ---

  async getRoles() {
    return await Role.find({}).lean();
  }

  async getDepartments() {
    return await Department.find({}).lean();
  }

  async findRoleById(id) {
    return await Role.findOne({ id: Number(id) }).lean();
  }

  async findDepartmentById(id) {
    return await Department.findOne({ id: Number(id) }).lean();
  }

  async findUserByUniversityId(rawId) {
    if (!rawId) return null;
    const cleanId = String(rawId).trim().toUpperCase();
    // Case insensitive exact match
    const user = await User.findOne({ university_id: { $regex: new RegExp('^' + cleanId + '$', 'i') } }).lean();
    if (!user) return null;
    return await this.hydrateUser(user);
  }

  async findUserById(id) {
    const user = await User.findOne({ id: Number(id) }).lean();
    if (!user) return null;
    return await this.hydrateUser(user);
  }

  async hydrateUser(user) {
    if (!user) return null;
    const role = await this.findRoleById(user.role_id) || { name: 'Unknown', badge_color: '#6B7280' };
    const dept = await this.findDepartmentById(user.department_id) || { name: 'General', code: 'GEN', faculty: 'University' };
    return {
      ...user,
      role_name: role.name,
      role_badge_color: role.badge_color,
      department_name: dept.name,
      department_code: dept.code,
      faculty_name: dept.faculty
    };
  }

  async getAllUsers() {
    const users = await User.find({}).lean();
    const hydrated = [];
    for (let u of users) {
      hydrated.push(await this.hydrateUser(u));
    }
    return hydrated;
  }

  async createUser(payload) {
    const cleanId = String(payload.university_id).trim().toUpperCase();
    let existing = null;
    
    if (payload.editing_user_id) {
      existing = await User.findOne({ id: Number(payload.editing_user_id) });
    } else {
      existing = await User.findOne({ university_id: { $regex: new RegExp('^' + cleanId + '$', 'i') } });
    }
    
    if (existing) {
      if (payload.university_id) existing.university_id = cleanId;
      if (payload.full_name) existing.full_name = payload.full_name.trim();
      if (payload.email) existing.email = payload.email.trim();
      if (payload.phone !== undefined) existing.phone = payload.phone.trim();
      if (payload.role_id) existing.role_id = Number(payload.role_id);
      if (payload.department_id) existing.department_id = Number(payload.department_id);
      if (payload.research_field) existing.research_field = payload.research_field.trim();
      if (payload.default_purpose) existing.default_purpose = payload.default_purpose.trim();
      else if (payload.purpose_of_visit) existing.default_purpose = payload.purpose_of_visit.trim();
      if (payload.gender) existing.gender = payload.gender.trim();
      if (payload.room) existing.room = payload.room.trim();
      
      existing.updated_at = new Date().toISOString();
      await existing.save();
      return await this.hydrateUser(existing.toObject());
    }

    const lastUser = await User.findOne().sort({ id: -1 });
    const nextId = lastUser ? lastUser.id + 1 : 1;

    const newUser = new User({
      id: nextId,
      university_id: cleanId,
      full_name: payload.full_name.trim(),
      email: payload.email.trim(),
      phone: payload.phone ? payload.phone.trim() : '',
      role_id: Number(payload.role_id),
      department_id: Number(payload.department_id),
      research_field: payload.research_field ? payload.research_field.trim() : 'Academic Research',
      default_purpose: payload.default_purpose ? payload.default_purpose.trim() : (payload.purpose_of_visit || 'Academic Research'),
      gender: payload.gender ? payload.gender.trim() : '',
      room: payload.room ? payload.room.trim() : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await newUser.save();
    return await this.hydrateUser(newUser.toObject());
  }

  async getActiveSessionForUser(userId) {
    const session = await Session.findOne({ user_id: Number(userId), status: 'ACTIVE' }).lean();
    if (!session) return null;
    const user = await this.findUserById(userId);
    return {
      ...session,
      user
    };
  }

  async getPendingSessionForUser(userId) {
    const session = await Session.findOne({ user_id: Number(userId), status: 'PENDING_APPROVAL' }).lean();
    if (!session) return null;
    const user = await this.findUserById(userId);
    return {
      ...session,
      user
    };
  }

  async createSession(userId, purposeOfVisit, researchTopic) {
    const user = await this.findUserById(userId);
    if (!user) throw new Error('User not found.');

    // Check for both ACTIVE and PENDING_APPROVAL sessions
    const existingActive = await this.getActiveSessionForUser(userId);
    const existingPending = await this.getPendingSessionForUser(userId);
    const existingSession = existingActive || existingPending;

    if (existingSession) {
      if (purposeOfVisit || researchTopic) {
        const updateDoc = {};
        if (purposeOfVisit) updateDoc.purpose_of_visit = purposeOfVisit;
        if (researchTopic) updateDoc.research_topic = researchTopic;
        
        // If purpose changes to borrowing/returning, it should become PENDING_APPROVAL.
        // If purpose changes from borrowing to normal reading, it should become ACTIVE.
        const requiresApproval = (purposeOfVisit === 'Book Borrowing' || purposeOfVisit === 'Book Return');
        const newStatus = requiresApproval ? 'PENDING_APPROVAL' : 'ACTIVE';
        updateDoc.status = newStatus;

        await Session.updateOne({ id: existingSession.id }, { $set: updateDoc });
        
        if (purposeOfVisit) existingSession.purpose_of_visit = purposeOfVisit;
        if (researchTopic) existingSession.research_topic = researchTopic;
        existingSession.status = newStatus;
      }
      return {
        alreadyActive: true,
        session: existingSession
      };
    }

    const now = new Date();
    const lastSession = await Session.findOne().sort({ id: -1 });
    const nextId = lastSession ? lastSession.id + 1 : 1;
    const requiresApproval = (purposeOfVisit === 'Book Borrowing' || purposeOfVisit === 'Book Return');
    const initialStatus = requiresApproval ? 'PENDING_APPROVAL' : 'ACTIVE';

    const newSession = new Session({
      id: nextId,
      user_id: Number(userId),
      check_in_time: now.toISOString(),
      check_out_time: null,
      purpose_of_visit: purposeOfVisit || user.default_purpose || 'Academic Research',
      research_topic: researchTopic || user.research_field || 'Academic Research',
      duration_minutes: 0,
      status: initialStatus,
      created_at: now.toISOString()
    });

    await newSession.save();

    return {
      alreadyActive: false,
      session: {
        ...newSession.toObject(),
        user
      }
    };
  }

  async checkOutSession(sessionIdOrUserId) {
    const now = new Date();
    let sessionDoc = null;

    if (typeof sessionIdOrUserId === 'number' || !isNaN(Number(sessionIdOrUserId))) {
      sessionDoc = await Session.findOne({ id: Number(sessionIdOrUserId) });
    }
    
    if (!sessionDoc) {
      sessionDoc = await Session.findOne({ user_id: Number(sessionIdOrUserId), status: 'ACTIVE' });
    }

    if (!sessionDoc) {
      throw new Error('Active session not found.');
    }

    const checkInDate = new Date(sessionDoc.check_in_time);
    const durationMins = Math.max(1, Math.round((now.getTime() - checkInDate.getTime()) / 60000));

    sessionDoc.check_out_time = now.toISOString();
    sessionDoc.duration_minutes = durationMins;
    sessionDoc.status = 'COMPLETED';
    await sessionDoc.save();

    const user = await this.findUserById(sessionDoc.user_id);
    return {
      ...sessionDoc.toObject(),
      user
    };
  }

  async approveSession(sessionId) {
    const session = await Session.findOne({ id: Number(sessionId) });
    if (!session) throw new Error('Session not found.');
    if (session.status !== 'PENDING_APPROVAL') throw new Error('Session is not pending approval.');

    session.status = 'ACTIVE';
    session.check_in_time = new Date().toISOString();
    await session.save();
    
    return {
      ...session.toObject(),
      user: await this.findUserById(session.user_id)
    };
  }

  async rejectSession(sessionId) {
    const session = await Session.findOne({ id: Number(sessionId) });
    if (!session) throw new Error('Session not found.');
    if (session.status !== 'PENDING_APPROVAL') throw new Error('Session is not pending approval.');

    session.status = 'REJECTED';
    session.check_out_time = new Date().toISOString();
    await session.save();
    
    return {
      ...session.toObject(),
      user: await this.findUserById(session.user_id)
    };
  }

  async deleteSession(sessionId) {
    const deleted = await Session.findOneAndDelete({ id: Number(sessionId) });
    if (!deleted) throw new Error('Session not found.');
    
    // Check if the user has any other sessions left
    if (deleted.user_id) {
      const remainingSessionsCount = await Session.countDocuments({ user_id: deleted.user_id });
      if (remainingSessionsCount === 0) {
        // If no sessions left, delete the user profile too
        await User.findOneAndDelete({ id: deleted.user_id });
      }
    }
    
    return deleted;
  }

  async updateSession(sessionId, updates = {}) {
    const session = await Session.findOne({ id: Number(sessionId) });
    if (!session) throw new Error('Session not found.');
    
    if (updates.purpose_of_visit) session.purpose_of_visit = updates.purpose_of_visit;
    if (updates.research_topic !== undefined) session.research_topic = updates.research_topic;
    if (updates.status) session.status = updates.status;
    if (updates.duration_minutes !== undefined) session.duration_minutes = Number(updates.duration_minutes);
    if (updates.check_in_time) session.check_in_time = updates.check_in_time;
    if (updates.check_out_time !== undefined) session.check_out_time = updates.check_out_time;
    await session.save();

    if (session.user_id) {
      const user = await User.findOne({ id: session.user_id });
      if (user) {
        let userUpdated = false;
        if (updates.full_name) { user.full_name = updates.full_name.trim(); userUpdated = true; }
        if (updates.university_id) { user.university_id = updates.university_id.trim().toUpperCase(); userUpdated = true; }
        if (updates.phone !== undefined) { user.phone = updates.phone.trim(); userUpdated = true; }
        if (updates.email !== undefined) { user.email = updates.email.trim(); userUpdated = true; }
        if (updates.role_id) { user.role_id = Number(updates.role_id); userUpdated = true; }
        if (updates.department_id) { user.department_id = Number(updates.department_id); userUpdated = true; }
        if (userUpdated) {
          user.updated_at = new Date().toISOString();
          await user.save();
        }
      }
    }

    const userObj = await this.findUserById(session.user_id);
    return {
      ...session.toObject(),
      user: userObj
    };
  }

  async deleteUser(userId) {
    const deletedUser = await User.findOneAndDelete({ id: Number(userId) });
    if (!deletedUser) throw new Error('User not found.');
    await Session.deleteMany({ user_id: Number(userId) });
    return deletedUser;
  }

  async updateUser(userId, updates = {}) {
    const user = await User.findOne({ id: Number(userId) });
    if (!user) throw new Error('User not found.');
    
    if (updates.full_name) user.full_name = updates.full_name.trim();
    if (updates.university_id) user.university_id = updates.university_id.trim().toUpperCase();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.email !== undefined) user.email = updates.email.trim();
    if (updates.role_id) user.role_id = Number(updates.role_id);
    if (updates.department_id) user.department_id = Number(updates.department_id);
    if (updates.research_field) user.research_field = updates.research_field.trim();
    if (updates.default_purpose) user.default_purpose = updates.default_purpose.trim();
    if (updates.gender !== undefined) user.gender = updates.gender.trim();
    if (updates.room !== undefined) user.room = updates.room.trim();
    
    user.updated_at = new Date().toISOString();
    await user.save();
    return await this.hydrateUser(user.toObject());
  }

  async getSessions(filters = {}) {
    let query = {};
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.check_in_time = {};
      if (filters.startDate) query.check_in_time.$gte = new Date(filters.startDate).toISOString();
      if (filters.endDate) query.check_in_time.$lte = new Date(filters.endDate).toISOString();
    }

    const sessions = await Session.find(query).sort({ check_in_time: -1 }).lean();
    
    // Bulk load reference data to avoid N+1 queries
    const roles = await Role.find({}).lean();
    const depts = await Department.find({}).lean();
    const roleMap = new Map(roles.map(r => [r.id, r]));
    const deptMap = new Map(depts.map(d => [d.id, d]));
    
    // Bulk load users referenced in these sessions
    const userIds = [...new Set(sessions.map(s => s.user_id).filter(Boolean))];
    const users = await User.find({ id: { $in: userIds } }).lean();
    const userMap = new Map(users.map(u => {
       const role = roleMap.get(u.role_id) || { name: 'Unknown', badge_color: '#6B7280' };
       const dept = deptMap.get(u.department_id) || { name: 'General', code: 'GEN', faculty: 'University' };
       return [u.id, {
         ...u,
         role_name: role.name,
         role_badge_color: role.badge_color,
         department_name: dept.name,
         department_code: dept.code,
         faculty_name: dept.faculty
       }];
    }));

    let list = [];
    
    for (let s of sessions) {
      const user = userMap.get(s.user_id) || {};
      let duration = s.duration_minutes;
      if (s.status === 'ACTIVE') {
        const checkIn = new Date(s.check_in_time);
        duration = Math.max(1, Math.round((Date.now() - checkIn.getTime()) / 60000));
      }
      list.push({
        ...s,
        duration_minutes: duration,
        user
      });
    }

    if (filters.role_id) {
      list = list.filter(s => s.user && s.user.role_id === Number(filters.role_id));
    }
    if (filters.department_id) {
      list = list.filter(s => s.user && s.user.department_id === Number(filters.department_id));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(s => {
        return (
          (s.user.full_name && s.user.full_name.toLowerCase().includes(q)) ||
          (s.user.university_id && s.user.university_id.toLowerCase().includes(q)) ||
          (s.purpose_of_visit && s.purpose_of_visit.toLowerCase().includes(q)) ||
          (s.research_topic && s.research_topic.toLowerCase().includes(q)) ||
          (s.user.department_name && s.user.department_name.toLowerCase().includes(q))
        );
      });
    }

    const totalCount = list.length;
    
    // Support Pagination if requested
    if (filters.page && filters.limit) {
      const page = Number(filters.page);
      const limit = Number(filters.limit);
      const startIndex = (page - 1) * limit;
      list = list.slice(startIndex, startIndex + limit);
      
      return {
        sessions: list,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      };
    }

    return list;
  }

  async getDashboardStats() {
    const allSessions = await this.getSessions();
    const activeSessions = allSessions.filter(s => s.status === 'ACTIVE');
    
    let activeStudents = 0, activeLecturers = 0, activeProfessors = 0, activeScholars = 0;
    activeSessions.forEach(s => {
      const roleId = s.user ? s.user.role_id : 0;
      if (roleId === 1) activeStudents++;
      else if (roleId === 2) activeLecturers++;
      else if (roleId === 3) activeProfessors++;
      else if (roleId === 4) activeScholars++;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = allSessions.filter(s => new Date(s.check_in_time).getTime() >= today.getTime());

    const completedSessions = allSessions.filter(s => s.status === 'COMPLETED');
    const totalDuration = completedSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    const avgDuration = completedSessions.length > 0 ? Math.round(totalDuration / completedSessions.length) : 0;

    const hourCounts = new Array(24).fill(0);
    allSessions.forEach(s => {
      const hour = new Date(s.check_in_time).getHours();
      hourCounts[hour]++;
    });
    let peakHour = 0, maxHourCount = 0;
    hourCounts.forEach((count, h) => {
      if (count > maxHourCount) { maxHourCount = count; peakHour = h; }
    });

    const totalUsers = await User.countDocuments();

    return {
      activeCount: activeSessions.length,
      activeBreakdown: { students: activeStudents, lecturers: activeLecturers, professors: activeProfessors, scholars: activeScholars },
      todayVisits: todaySessions.length,
      avgDurationMinutes: avgDuration,
      peakHour: `${peakHour.toString().padStart(2, '0')}:00 - ${(peakHour + 1).toString().padStart(2, '0')}:00`,
      totalRegisteredUsers: totalUsers,
      totalAllTimeSessions: allSessions.length
    };
  }

  async getAnalyticsData() {
    const allSessions = await this.getSessions();
    
    const hourlyLabels = [];
    const hourlyData = [];
    for (let h = 8; h <= 21; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      hourlyLabels.push(label);
      hourlyData.push(allSessions.filter(s => new Date(s.check_in_time).getHours() === h).length);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const last30DaysSessions = allSessions.filter(s => new Date(s.check_in_time).getTime() >= thirtyDaysAgo.getTime());

    const depts = await this.getDepartments();
    const deptMap = {};
    depts.forEach(d => { deptMap[d.id] = { name: d.name, code: d.code, count: 0 }; });
    last30DaysSessions.forEach(s => {
      if (s.user && s.user.department_id && deptMap[s.user.department_id]) {
        deptMap[s.user.department_id].count++;
      }
    });
    const departmentDistribution = Object.values(deptMap).sort((a, b) => b.count - a.count);

    const roleMap = { 1: 0, 2: 0, 3: 0, 4: 0 };
    last30DaysSessions.forEach(s => {
      if (s.user && s.user.role_id) roleMap[s.user.role_id] = (roleMap[s.user.role_id] || 0) + 1;
    });
    const rolesDistribution = [
      { name: 'Students', count: roleMap[1] || 0, color: '#3B82F6' },
      { name: 'Lecturers', count: roleMap[2] || 0, color: '#10B981' },
      { name: 'Professors', count: roleMap[3] || 0, color: '#8B5CF6' },
      { name: 'Research Scholars', count: roleMap[4] || 0, color: '#F59E0B' }
    ];

    const trendLabels = [], trendData = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now.getTime() - d * 86400000);
      trendLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
      trendData.push(allSessions.filter(s => {
        const time = new Date(s.check_in_time).getTime();
        return time >= dayStart.getTime() && time <= dayEnd.getTime();
      }).length);
    }

    const purposeCounts = {};
    allSessions.forEach(s => {
      const p = s.purpose_of_visit || 'General Research';
      purposeCounts[p] = (purposeCounts[p] || 0) + 1;
    });
    const topPurposes = Object.entries(purposeCounts)
      .map(([purpose, count]) => ({ purpose, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const monthlyLabels = [], monthlyVisits = [], monthlyBorrows = [], monthlyReturns = [];
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now.getTime() - d * 86400000);
      monthlyLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
      
      const daySessions = allSessions.filter(s => {
        const time = new Date(s.check_in_time).getTime();
        return time >= dayStart.getTime() && time <= dayEnd.getTime();
      });
      
      monthlyVisits.push(daySessions.filter(s => s.purpose_of_visit !== 'Book Borrowing' && s.purpose_of_visit !== 'Book Return').length);
      monthlyBorrows.push(daySessions.filter(s => s.purpose_of_visit === 'Book Borrowing').length);
      monthlyReturns.push(daySessions.filter(s => s.purpose_of_visit === 'Book Return').length);
    }

    let outstandingBooks = 0;
    allSessions.forEach(s => {
      if (s.purpose_of_visit === 'Book Borrowing') outstandingBooks++;
      else if (s.purpose_of_visit === 'Book Return') outstandingBooks--;
    });
    outstandingBooks = Math.max(0, outstandingBooks);

    return {
      hourly: { labels: hourlyLabels, data: hourlyData },
      departments: departmentDistribution,
      roles: rolesDistribution,
      trend: { labels: trendLabels, data: trendData },
      monthlyTrend: { labels: monthlyLabels, visits: monthlyVisits, borrows: monthlyBorrows, returns: monthlyReturns },
      topPurposes,
      books: {
        total: 637,
        outstanding: outstandingBooks,
        available: 637 - outstandingBooks
      }
    };
  }

  async resetSessions() {
    await Session.deleteMany({});
    return { success: true, count: 0, message: 'All attendance and research logs have been reset.' };
  }
}

const db = new DatabaseWrapper();
module.exports = db;
