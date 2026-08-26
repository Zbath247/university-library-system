const API_BASE = '/api';

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

  checkin: async (universityId, purposeOfVisit, researchTopic) => {
    const res = await fetch(`${API_BASE}/kiosk/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        university_id: universityId,
        purpose_of_visit: purposeOfVisit,
        research_topic: researchTopic
      })
    });
    return res.json();
  },

  checkout: async ({ sessionId, universityId }) => {
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

  seedDemoData: async () => {
    const res = await fetch(`${API_BASE}/admin/seed-demo`, {
      method: 'POST'
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
