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

// POST /api/admin/login - Authenticate admin credentials
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    // Secret administrator credentials
    if ((cleanUser === 'admin' || cleanUser === 'zbaths' || cleanUser === 'zbath247') && cleanPass === 'zbath@247') {
      return res.json({
        success: true,
        token: 'duc_admin_token_' + Date.now(),
        admin: { username: cleanUser, role: 'Super Administrator' },
        message: 'Admin authentication successful.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid administrator username or password. Please try again.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/sessions/:sessionId - Delete attendance session
router.delete('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = db.deleteSession(Number(sessionId));
    res.json({
      success: true,
      deleted,
      message: `Attendance log #${sessionId} deleted successfully.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/sessions/:sessionId - Update attendance session details
router.put('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const updated = db.updateSession(Number(sessionId), req.body);
    res.json({
      success: true,
      session: updated,
      message: `Attendance log #${sessionId} updated successfully.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:userId - Delete academic user profile
router.delete('/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = db.deleteUser(Number(userId));
    res.json({
      success: true,
      deleted,
      message: `User ${deleted.full_name} (${deleted.university_id}) deleted successfully.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:userId - Update academic user profile
router.put('/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updated = db.updateUser(Number(userId), req.body);
    res.json({
      success: true,
      user: updated,
      message: `User profile ${updated.full_name} updated successfully.`
    });
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
    const { status, role_id, department_id, search, startDate, endDate, category } = req.query;
    let sessions = db.getSessions({
      status,
      role_id,
      department_id,
      search,
      startDate,
      endDate
    });

    // Category filter: visit, borrow, return
    if (category === 'BORROW' || category === 'borrow') {
      sessions = sessions.filter(s => s.purpose_of_visit === 'Book Borrowing');
    } else if (category === 'RETURN' || category === 'return') {
      sessions = sessions.filter(s => s.purpose_of_visit === 'Book Return');
    } else if (category === 'VISIT' || category === 'visit') {
      sessions = sessions.filter(s => s.purpose_of_visit !== 'Book Borrowing' && s.purpose_of_visit !== 'Book Return');
    }

    const headers = [
      'Session ID',
      'Category (ប្រភេទទិន្នន័យ)',
      'University ID',
      'Full Name',
      'Role',
      'Department / Faculty',
      'Contact Email',
      'Contact Phone',
      'Purpose of Visit',
      'Book Title / Research Topic (ឈ្មោះសៀវភៅ / ប្រធានបទ)',
      'Check-in Timestamp',
      'Check-out Timestamp',
      'Duration (Minutes)',
      'Status'
    ];

    const rows = sessions.map(s => {
      const u = s.user || {};
      let catLabel = '១. ចូលបណ្ណាល័យ (Library Visit)';
      if (s.purpose_of_visit === 'Book Borrowing') {
        catLabel = '២. ខ្ចីសៀវភៅ (Book Borrowing)';
      } else if (s.purpose_of_visit === 'Book Return') {
        catLabel = '៣. សងសៀវភៅ (Book Return)';
      }

      return [
        s.id,
        `"${catLabel}"`,
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

    let filenamePrefix = 'library_all_attendance';
    if (category === 'BORROW' || category === 'borrow') filenamePrefix = 'library_book_borrowing_report';
    else if (category === 'RETURN' || category === 'return') filenamePrefix = 'library_book_return_report';
    else if (category === 'VISIT' || category === 'visit') filenamePrefix = 'library_visits_attendance_report';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv"`);
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
