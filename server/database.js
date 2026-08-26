const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'library_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class RelationalDatabase {
  constructor() {
    this.data = {
      roles: [],
      departments: [],
      users: [],
      sessions: []
    };
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, re-initializing...', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  seedInitialData(force = false) {
    if (force || !this.data.roles || this.data.roles.length === 0) {
      this.data.roles = [
        { id: 1, name: 'Student', badge_color: '#2563EB', description: 'Undergraduate & Postgraduate Students' },
        { id: 2, name: 'Lecturer', badge_color: '#059669', description: 'Teaching Faculty & Course Instructors' },
        { id: 3, name: 'Professor', badge_color: '#7C3AED', description: 'Tenured & Principal Academic Researchers' },
        { id: 4, name: 'Research Scholar', badge_color: '#D97706', description: 'PhD Candidates & Postdoctoral Fellows' }
      ];
    }

    if (force || !this.data.departments || this.data.departments.length === 0) {
      this.data.departments = [
        { id: 1, name: 'Computer Science & AI', code: 'CS', faculty: 'Faculty of Information Technology' },
        { id: 2, name: 'Biomedical Engineering & Health Sciences', code: 'BME', faculty: 'Faculty of Engineering & Medicine' },
        { id: 3, name: 'Data Science & Analytics', code: 'DSA', faculty: 'Faculty of Computing & Mathematics' },
        { id: 4, name: 'Civil & Environmental Engineering', code: 'CEE', faculty: 'Faculty of Engineering' },
        { id: 5, name: 'Economics, Finance & Banking', code: 'ECO', faculty: 'Faculty of Business & Management' },
        { id: 6, name: 'Molecular Biology & Genetics', code: 'MBG', faculty: 'Faculty of Science' },
        { id: 7, name: 'Law, Ethics & International Policy', code: 'LAW', faculty: 'Faculty of Social Sciences & Law' },
        { id: 8, name: 'Architecture & Urban Planning', code: 'ARCH', faculty: 'Faculty of Built Environment' },
        { id: 9, name: 'Physics & Quantum Computing', code: 'PHY', faculty: 'Faculty of Natural Sciences' },
        { id: 10, name: 'Humanities & World Literature', code: 'HUM', faculty: 'Faculty of Arts & Humanities' }
      ];
    }

    if (force || !this.data.users || this.data.users.length === 0) {
      const sampleUsers = [
        {
          id: 1,
          university_id: 'DUCP2024-0101',
          full_name: 'Dr. Evelyn Vance',
          email: 'evelyn.vance@duc.edu.kh',
          phone: '+855 12 234 567',
          role_id: 3,
          department_id: 1,
          research_field: 'Deep Reinforcement Learning in Autonomous Robotics',
          default_purpose: 'Grant Research & Paper Peer Review',
          created_at: new Date(Date.now() - 30 * 86400000).toISOString()
        },
        {
          id: 2,
          university_id: 'DUCP2024-0102',
          full_name: 'Dr. Arthur Sterling',
          email: 'arthur.sterling@duc.edu.kh',
          phone: '+855 12 345 678',
          role_id: 3,
          department_id: 2,
          research_field: 'CRISPR Gene Editing & Neurobiology Diagnostics',
          default_purpose: 'Clinical Trial Meta-Analysis',
          created_at: new Date(Date.now() - 25 * 86400000).toISOString()
        },
        {
          id: 3,
          university_id: 'DUCL2024-0201',
          full_name: 'Dr. Marcus Holloway',
          email: 'marcus.h@duc.edu.kh',
          phone: '+855 12 456 789',
          role_id: 2,
          department_id: 3,
          research_field: 'Time-Series Forecasting in High-Frequency Markets',
          default_purpose: 'Course Curriculum & Journal Writing',
          created_at: new Date(Date.now() - 20 * 86400000).toISOString()
        },
        {
          id: 4,
          university_id: 'DUCL2024-0202',
          full_name: 'Sarah Lin, M.Sc.',
          email: 'sarah.lin@duc.edu.kh',
          phone: '+855 12 567 890',
          role_id: 2,
          department_id: 7,
          research_field: 'International Human Rights & Cyber-Jurisdiction',
          default_purpose: 'Legal Precedent Archival Study',
          created_at: new Date(Date.now() - 15 * 86400000).toISOString()
        },
        {
          id: 5,
          university_id: 'DUC2024-0301',
          full_name: 'Sophia Chen',
          email: 'sophia.chen@student.duc.edu.kh',
          phone: '+855 12 678 901',
          role_id: 1,
          department_id: 1,
          research_field: 'Neural Network Acceleration on Edge Hardware',
          default_purpose: 'Senior Thesis Literature Review',
          created_at: new Date(Date.now() - 10 * 86400000).toISOString()
        },
        {
          id: 6,
          university_id: 'DUC2024-0417',
          full_name: 'Mok Sambath',
          email: 'mok.sambath@student.duc.edu.kh',
          phone: '+855 12 789 012',
          role_id: 1,
          department_id: 1,
          research_field: 'Web Development & Digital Systems',
          default_purpose: 'Academic Research & Study',
          created_at: new Date(Date.now() - 8 * 86400000).toISOString()
        },
        {
          id: 7,
          university_id: 'DUCR2024-0501',
          full_name: 'Elena Rostova',
          email: 'elena.rostova@duc.edu.kh',
          phone: '+855 12 890 123',
          role_id: 4,
          department_id: 9,
          research_field: 'Quantum Error Correction in Topological Qubits',
          default_purpose: 'PhD Dissertation Writing',
          created_at: new Date(Date.now() - 5 * 86400000).toISOString()
        }
      ];
      this.data.users = sampleUsers;
    }

    if (force || !this.data.sessions || this.data.sessions.length === 0) {
      const pastPurposes = [
        { purpose: 'Book Borrowing', topic: 'Academic Textbook & Reference Loan', duration: 15 },
        { purpose: 'Book Return', topic: 'Library Book Return & Check-in', duration: 10 },
        { purpose: 'Study & Revision', topic: 'Self-Study & Final Exam Prep', duration: 120 },
        { purpose: 'Thesis & Academic Research', topic: 'Graph Neural Networks for Drug Discovery', duration: 135 },
        { purpose: 'Grant Proposal & Research Review', topic: 'Clean Energy Microgrid Resilience', duration: 210 },
        { purpose: 'PhD Dissertation Manuscript Drafting', topic: 'Algorithmic Fairness in Automated Systems', duration: 180 },
        { purpose: 'Journal Peer Review & Archival Reference', topic: 'Photonic Computing Architectures', duration: 95 },
        { purpose: 'Capstone Project Experimental Analysis', topic: 'Urban Heat Island Mitigation Strategies', duration: 110 },
        { purpose: 'Computer & Digital Lab', topic: 'Online Database Search & Python Scripting', duration: 90 },
        { purpose: 'Archival Law & Policy Research', topic: 'Digital Sovereignty in Distributed Computing', duration: 150 }
      ];

      const sessions = [];
      let sessionId = 1;
      const now = new Date();

      // Seed 25 historical sessions across past 7 days
      for (let day = 7; day >= 1; day--) {
        const count = 3 + (day % 3);
        for (let i = 0; i < count; i++) {
          const userIdx = (day * 3 + i) % this.data.users.length;
          const user = this.data.users[userIdx];
          const template = pastPurposes[(day * 2 + i) % pastPurposes.length];
          const hour = 8 + (i * 3) + ((day * 2) % 4);
          const checkIn = new Date(now.getTime() - day * 86400000);
          checkIn.setHours(hour, (i * 18) % 60, 0, 0);

          const duration = template.duration + ((i * 7) % 30) - 15;
          const checkOut = new Date(checkIn.getTime() + duration * 60000);

          sessions.push({
            id: sessionId++,
            user_id: user.id,
            check_in_time: checkIn.toISOString(),
            check_out_time: checkOut.toISOString(),
            purpose_of_visit: template.purpose,
            research_topic: template.topic,
            duration_minutes: duration,
            status: 'COMPLETED',
            created_at: checkIn.toISOString()
          });
        }
      }

      // Seed 3 currently ACTIVE sessions today
      const active1 = new Date(now.getTime() - 85 * 60000);
      sessions.push({
        id: sessionId++,
        user_id: 1, // Dr. Evelyn Vance (Professor)
        check_in_time: active1.toISOString(),
        check_out_time: null,
        purpose_of_visit: 'Grant Research & Paper Peer Review',
        research_topic: 'Deep Reinforcement Learning in Autonomous Robotics',
        duration_minutes: 85,
        status: 'ACTIVE',
        created_at: active1.toISOString()
      });

      const active2 = new Date(now.getTime() - 145 * 60000);
      sessions.push({
        id: sessionId++,
        user_id: 3, // Dr. Marcus Holloway (Lecturer)
        check_in_time: active2.toISOString(),
        check_out_time: null,
        purpose_of_visit: 'Course Curriculum & Journal Writing',
        research_topic: 'Time-Series Forecasting in High-Frequency Markets',
        duration_minutes: 145,
        status: 'ACTIVE',
        created_at: active2.toISOString()
      });

      const active3 = new Date(now.getTime() - 32 * 60000);
      sessions.push({
        id: sessionId++,
        user_id: 5, // Sophia Chen (Student)
        check_in_time: active3.toISOString(),
        check_out_time: null,
        purpose_of_visit: 'Senior Thesis Literature Review',
        research_topic: 'Neural Network Acceleration on Edge Hardware',
        duration_minutes: 32,
        status: 'ACTIVE',
        created_at: active3.toISOString()
      });

      this.data.sessions = sessions;
    }

    this.save();
  }

  // --- QUERY METHODS ---

  getRoles() {
    return this.data.roles;
  }

  getDepartments() {
    return this.data.departments;
  }

  findRoleById(id) {
    return this.data.roles.find(r => r.id === Number(id));
  }

  findDepartmentById(id) {
    return this.data.departments.find(d => d.id === Number(id));
  }

  findUserByUniversityId(rawId) {
    if (!rawId) return null;
    const cleanId = String(rawId).trim().toUpperCase();
    const user = this.data.users.find(u => u.university_id.toUpperCase() === cleanId);
    if (!user) return null;
    return this.hydrateUser(user);
  }

  findUserById(id) {
    const user = this.data.users.find(u => u.id === Number(id));
    if (!user) return null;
    return this.hydrateUser(user);
  }

  hydrateUser(user) {
    const role = this.findRoleById(user.role_id) || { name: 'Unknown', badge_color: '#6B7280' };
    const dept = this.findDepartmentById(user.department_id) || { name: 'General', code: 'GEN', faculty: 'University' };
    return {
      ...user,
      role_name: role.name,
      role_badge_color: role.badge_color,
      department_name: dept.name,
      department_code: dept.code,
      faculty_name: dept.faculty
    };
  }

  getAllUsers() {
    return this.data.users.map(u => this.hydrateUser(u));
  }

  createUser(payload) {
    const cleanId = String(payload.university_id).trim().toUpperCase();
    const existing = this.data.users.find(u => u.university_id.toUpperCase() === cleanId);
    if (existing) {
      throw new Error(`University ID ${cleanId} already registered.`);
    }

    const nextId = this.data.users.length > 0 ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: nextId,
      university_id: cleanId,
      full_name: payload.full_name.trim(),
      email: payload.email.trim(),
      phone: payload.phone ? payload.phone.trim() : '',
      role_id: Number(payload.role_id),
      department_id: Number(payload.department_id),
      research_field: payload.research_field ? payload.research_field.trim() : 'Academic Research',
      default_purpose: payload.default_purpose ? payload.default_purpose.trim() : (payload.purpose_of_visit || 'Academic Research'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();
    return this.hydrateUser(newUser);
  }

  getActiveSessionForUser(userId) {
    const session = this.data.sessions.find(s => s.user_id === Number(userId) && s.status === 'ACTIVE');
    if (!session) return null;
    const user = this.findUserById(userId);
    return {
      ...session,
      user
    };
  }

  createSession(userId, purposeOfVisit, researchTopic) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found.');

    // Check if user is already checked in
    const existingActive = this.getActiveSessionForUser(userId);
    if (existingActive) {
      return {
        alreadyActive: true,
        session: existingActive
      };
    }

    const now = new Date();
    const nextId = this.data.sessions.length > 0 ? Math.max(...this.data.sessions.map(s => s.id)) + 1 : 1;
    const newSession = {
      id: nextId,
      user_id: Number(userId),
      check_in_time: now.toISOString(),
      check_out_time: null,
      purpose_of_visit: purposeOfVisit || user.default_purpose || 'Academic Research',
      research_topic: researchTopic || user.research_field || 'Academic Research',
      duration_minutes: 0,
      status: 'ACTIVE',
      created_at: now.toISOString()
    };

    this.data.sessions.unshift(newSession);
    this.save();

    return {
      alreadyActive: false,
      session: {
        ...newSession,
        user
      }
    };
  }

  checkOutSession(sessionIdOrUserId) {
    const now = new Date();
    let session = null;

    if (typeof sessionIdOrUserId === 'number' || !isNaN(Number(sessionIdOrUserId))) {
      session = this.data.sessions.find(s => s.id === Number(sessionIdOrUserId));
    }
    
    if (!session) {
      // Try finding active session by user_id
      session = this.data.sessions.find(s => s.user_id === Number(sessionIdOrUserId) && s.status === 'ACTIVE');
    }

    if (!session) {
      throw new Error('Active session not found.');
    }

    const checkInDate = new Date(session.check_in_time);
    const durationMins = Math.max(1, Math.round((now.getTime() - checkInDate.getTime()) / 60000));

    session.check_out_time = now.toISOString();
    session.duration_minutes = durationMins;
    session.status = 'COMPLETED';

    this.save();
    const user = this.findUserById(session.user_id);
    return {
      ...session,
      user
    };
  }

  deleteSession(sessionId) {
    const idx = this.data.sessions.findIndex(s => s.id === Number(sessionId));
    if (idx === -1) {
      throw new Error('Session not found.');
    }
    const deleted = this.data.sessions.splice(idx, 1)[0];
    this.save();
    return deleted;
  }

  updateSession(sessionId, updates = {}) {
    const session = this.data.sessions.find(s => s.id === Number(sessionId));
    if (!session) {
      throw new Error('Session not found.');
    }
    if (updates.purpose_of_visit) session.purpose_of_visit = updates.purpose_of_visit;
    if (updates.research_topic !== undefined) session.research_topic = updates.research_topic;
    if (updates.status) session.status = updates.status;
    if (updates.duration_minutes !== undefined) session.duration_minutes = Number(updates.duration_minutes);
    if (updates.check_in_time) session.check_in_time = updates.check_in_time;
    if (updates.check_out_time !== undefined) session.check_out_time = updates.check_out_time;

    // Also update linked user profile if user details were edited
    if (session.user_id) {
      const user = this.data.users.find(u => u.id === session.user_id);
      if (user) {
        if (updates.full_name) user.full_name = updates.full_name.trim();
        if (updates.university_id) user.university_id = updates.university_id.trim().toUpperCase();
        if (updates.phone !== undefined) user.phone = updates.phone.trim();
        if (updates.email !== undefined) user.email = updates.email.trim();
        if (updates.role_id) user.role_id = Number(updates.role_id);
        if (updates.department_id) user.department_id = Number(updates.department_id);
        user.updated_at = new Date().toISOString();
      }
    }

    this.save();
    const user = this.findUserById(session.user_id);
    return {
      ...session,
      user
    };
  }

  deleteUser(userId) {
    const idx = this.data.users.findIndex(u => u.id === Number(userId));
    if (idx === -1) {
      throw new Error('User not found.');
    }
    // Delete user and cascade delete their sessions
    const deletedUser = this.data.users.splice(idx, 1)[0];
    this.data.sessions = this.data.sessions.filter(s => s.user_id !== Number(userId));
    this.save();
    return deletedUser;
  }

  updateUser(userId, updates = {}) {
    const user = this.data.users.find(u => u.id === Number(userId));
    if (!user) {
      throw new Error('User not found.');
    }
    if (updates.full_name) user.full_name = updates.full_name.trim();
    if (updates.university_id) user.university_id = updates.university_id.trim().toUpperCase();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.email !== undefined) user.email = updates.email.trim();
    if (updates.role_id) user.role_id = Number(updates.role_id);
    if (updates.department_id) user.department_id = Number(updates.department_id);
    if (updates.research_field) user.research_field = updates.research_field.trim();
    if (updates.default_purpose) user.default_purpose = updates.default_purpose.trim();
    user.updated_at = new Date().toISOString();
    this.save();
    return this.hydrateUser(user);
  }

  getSessions(filters = {}) {
    let list = this.data.sessions.map(s => {
      const user = this.findUserById(s.user_id) || {};
      // Calculate live duration if active
      let duration = s.duration_minutes;
      if (s.status === 'ACTIVE') {
        const checkIn = new Date(s.check_in_time);
        duration = Math.max(1, Math.round((Date.now() - checkIn.getTime()) / 60000));
      }
      return {
        ...s,
        duration_minutes: duration,
        user
      };
    });

    if (filters.status) {
      list = list.filter(s => s.status === filters.status);
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

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      list = list.filter(s => new Date(s.check_in_time).getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      list = list.filter(s => new Date(s.check_in_time).getTime() <= end);
    }

    // Sort newest check-in first
    list.sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time));
    return list;
  }

  getDashboardStats() {
    const allSessions = this.getSessions();
    const activeSessions = allSessions.filter(s => s.status === 'ACTIVE');
    
    // Active counts by role
    let activeStudents = 0;
    let activeLecturers = 0;
    let activeProfessors = 0;
    let activeScholars = 0;

    activeSessions.forEach(s => {
      const roleId = s.user ? s.user.role_id : 0;
      if (roleId === 1) activeStudents++;
      else if (roleId === 2) activeLecturers++;
      else if (roleId === 3) activeProfessors++;
      else if (roleId === 4) activeScholars++;
    });

    // Today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = allSessions.filter(s => new Date(s.check_in_time).getTime() >= today.getTime());

    // Average duration of completed sessions
    const completedSessions = allSessions.filter(s => s.status === 'COMPLETED');
    const totalDuration = completedSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    const avgDuration = completedSessions.length > 0 ? Math.round(totalDuration / completedSessions.length) : 0;

    // Peak research hour computation
    const hourCounts = new Array(24).fill(0);
    allSessions.forEach(s => {
      const hour = new Date(s.check_in_time).getHours();
      hourCounts[hour]++;
    });
    let peakHour = 0;
    let maxHourCount = 0;
    hourCounts.forEach((count, h) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        peakHour = h;
      }
    });

    return {
      activeCount: activeSessions.length,
      activeBreakdown: {
        students: activeStudents,
        lecturers: activeLecturers,
        professors: activeProfessors,
        scholars: activeScholars
      },
      todayVisits: todaySessions.length,
      avgDurationMinutes: avgDuration,
      peakHour: `${peakHour.toString().padStart(2, '0')}:00 - ${(peakHour + 1).toString().padStart(2, '0')}:00`,
      totalRegisteredUsers: this.data.users.length,
      totalAllTimeSessions: allSessions.length
    };
  }

  getAnalyticsData() {
    const allSessions = this.getSessions();
    
    // 1. Hourly Distribution (08:00 to 22:00)
    const hourlyLabels = [];
    const hourlyData = [];
    for (let h = 8; h <= 21; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      hourlyLabels.push(label);
      const count = allSessions.filter(s => new Date(s.check_in_time).getHours() === h).length;
      hourlyData.push(count);
    }

    // 2. Department Breakdown
    const deptMap = {};
    this.data.departments.forEach(d => {
      deptMap[d.id] = { name: d.name, code: d.code, count: 0 };
    });
    allSessions.forEach(s => {
      if (s.user && s.user.department_id && deptMap[s.user.department_id]) {
        deptMap[s.user.department_id].count++;
      }
    });
    const departmentDistribution = Object.values(deptMap).sort((a, b) => b.count - a.count);

    // 3. Role Breakdown
    const roleMap = { 1: 0, 2: 0, 3: 0, 4: 0 };
    allSessions.forEach(s => {
      if (s.user && s.user.role_id) {
        roleMap[s.user.role_id] = (roleMap[s.user.role_id] || 0) + 1;
      }
    });
    const rolesDistribution = [
      { name: 'Students', count: roleMap[1] || 0, color: '#3B82F6' },
      { name: 'Lecturers', count: roleMap[2] || 0, color: '#10B981' },
      { name: 'Professors', count: roleMap[3] || 0, color: '#8B5CF6' },
      { name: 'Research Scholars', count: roleMap[4] || 0, color: '#F59E0B' }
    ];

    // 4. Last 7 Days Attendance Trend
    const trendLabels = [];
    const trendData = [];
    const now = new Date();
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now.getTime() - d * 86400000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendLabels.push(dateStr);

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const count = allSessions.filter(s => {
        const time = new Date(s.check_in_time).getTime();
        return time >= dayStart.getTime() && time <= dayEnd.getTime();
      }).length;
      trendData.push(count);
    }

    // 5. Purpose & Research Topic Cloud / Highlights
    const purposeCounts = {};
    allSessions.forEach(s => {
      const p = s.purpose_of_visit || 'General Research';
      purposeCounts[p] = (purposeCounts[p] || 0) + 1;
    });
    const topPurposes = Object.entries(purposeCounts)
      .map(([purpose, count]) => ({ purpose, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      hourly: { labels: hourlyLabels, data: hourlyData },
      departments: departmentDistribution,
      roles: rolesDistribution,
      trend: { labels: trendLabels, data: trendData },
      topPurposes
    };
  }
}

const db = new RelationalDatabase();

module.exports = db;
