const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/admin/stats - KPI summary
router.get('/stats', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/analytics - Chart and breakdown data
router.get('/analytics', (req, res) => {
  try {
    const analytics = db.getAnalyticsData();
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/sessions - Filtered sessions list
router.get('/sessions', (req, res) => {
  try {
    const { status, role_id, department_id, search, startDate, endDate } = req.query;
    const sessions = db.getSessions({
      status,
      role_id,
      department_id,
      search,
      startDate,
      endDate
    });
    res.json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users - User directory
router.get('/users', (req, res) => {
  try {
    const users = db.getAllUsers();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users - Create new academic user
router.post('/users', (req, res) => {
  try {
    const user = db.createUser(req.body);
    res.json({ success: true, user, message: 'Academic profile registered successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/admin/checkout/:sessionId - Force check-out session
router.post('/checkout/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = db.checkOutSession(Number(sessionId));
    res.json({
      success: true,
      session,
      message: `Session for ${session.user ? session.user.full_name : 'Visitor'} checked out successfully.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/admin/export/csv - Direct CSV download of attendance & research logs
router.get('/export/csv', (req, res) => {
  try {
    const { status, role_id, department_id, search, startDate, endDate } = req.query;
    const sessions = db.getSessions({
      status,
      role_id,
      department_id,
      search,
      startDate,
      endDate
    });

    const headers = [
      'Session ID',
      'University ID',
      'Full Name',
      'Role',
      'Department / Faculty',
      'Contact Email',
      'Contact Phone',
      'Purpose of Visit',
      'Research Topic / Field',
      'Check-in Timestamp',
      'Check-out Timestamp',
      'Duration (Minutes)',
      'Status'
    ];

    const rows = sessions.map(s => {
      const u = s.user || {};
      return [
        s.id,
        `"${(u.university_id || '').replace(/"/g, '""')}"`,
        `"${(u.full_name || '').replace(/"/g, '""')}"`,
        `"${(u.role_name || '').replace(/"/g, '""')}"`,
        `"${(u.department_name || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.phone || '').replace(/"/g, '""')}"`,
        `"${(s.purpose_of_visit || '').replace(/"/g, '""')}"`,
        `"${(s.research_topic || '').replace(/"/g, '""')}"`,
        `"${s.check_in_time}"`,
        `"${s.check_out_time || 'N/A'}"`,
        s.duration_minutes || 0,
        s.status
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="library_attendance_report_${new Date().toISOString().slice(0, 10)}.csv"`);
    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens Khmer and English text flawlessly
    return res.send('\uFEFF' + csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/seed-demo - Reset/repopulate demo data
router.post('/seed-demo', (req, res) => {
  try {
    db.seedInitialData(true);
    res.json({ success: true, message: 'Database reset and re-seeded with realistic demo records.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
