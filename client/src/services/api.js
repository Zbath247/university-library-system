const API_BASE = window.location.hostname === 'localhost'
  ? '/api'
  : 'https://university-library-system-1.onrender.com/api';


export const api = {
  // Kiosk endpoints
  getKioskMeta: async () => {
    const res = await fetch(`${API_BASE}/kiosk/meta`);
    return res.json();
  },

  lookupId: async (universityId) => {
    const res = await fetch(`${API_BASE}/kiosk/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ university_id: universityId })
    });
    return res.json();
  },

  registerAndCheckin: async (formData) => {
    const res = await fetch(`${API_BASE}/kiosk/register-and-checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return res.json();
  },

  checkin: async (universityId, purposeOfVisit, researchTopic, userDetails = {}) => {
    const res = await fetch(`${API_BASE}/kiosk/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        university_id: universityId,
        purpose_of_visit: purposeOfVisit,
        research_topic: researchTopic,
        full_name: userDetails.full_name,
        role_id: userDetails.role_id,
        department_id: userDetails.department_id,
        email: userDetails.email,
        phone: userDetails.phone
      })
    });
    return res.json();
  },

  checkout: async (params = {}) => {
    const sessionId = params.sessionId || params.session_id;
    const universityId = params.universityId || params.university_id;
    const res = await fetch(`${API_BASE}/kiosk/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        university_id: universityId
      })
    });
    return res.json();
  },

  getSessionStatus: async (sessionId) => {
    const res = await fetch(`${API_BASE}/kiosk/session/${sessionId}`);
    return res.json();
  },

  getBadge: async (universityId) => {
    const res = await fetch(`${API_BASE}/kiosk/badge/${encodeURIComponent(universityId)}`);
    return res.json();
  },

  // Admin endpoints
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`);
    return res.json();
  },

  getAdminAnalytics: async () => {
    const res = await fetch(`${API_BASE}/admin/analytics`);
    return res.json();
  },

  getSessions: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const res = await fetch(`${API_BASE}/admin/sessions?${params.toString()}`);
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/users`);
    return res.json();
  },

  createUser: async (userData) => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  adminCheckout: async (sessionId) => {
    const res = await fetch(`${API_BASE}/admin/checkout/${sessionId}`, {
      method: 'POST'
    });
    return res.json();
  },

  adminApproveSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/admin/approve-session/${sessionId}`, {
      method: 'POST'
    });
    return res.json();
  },

  adminRejectSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/admin/reject-session/${sessionId}`, {
      method: 'POST'
    });
    return res.json();
  },

  adminLogin: async (username, password) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  deleteSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/admin/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  updateSession: async (sessionId, updates) => {
    const res = await fetch(`${API_BASE}/admin/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  deleteUser: async (userId) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  updateUser: async (userId, updates) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  resetSessions: async (password) => {
    const res = await fetch(`${API_BASE}/admin/reset-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  },


  getExportCsvUrl: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    return `${API_BASE}/admin/export/csv?${params.toString()}`;
  }
};
