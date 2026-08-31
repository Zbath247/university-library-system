const express = require('express');
const router = express.Router();
const db = require('../database');
const ExcelJS = require('exceljs');

// GET /api/admin/stats - KPI summary
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/analytics - Chart and breakdown data
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await db.getAnalyticsData();
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/sessions - Filtered sessions list
router.get('/sessions', async (req, res) => {
  try {
    const { status, role_id, department_id, search, startDate, endDate, page, limit } = req.query;
    const result = await db.getSessions({
      status,
      role_id,
      department_id,
      search,
      startDate,
      endDate,
      page,
      limit
    });
    
    // If paginated, result is an object { sessions, totalCount, totalPages }
    if (page && limit) {
      res.json({ success: true, ...result });
    } else {
      res.json({ success: true, count: result.length, sessions: result });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users - User directory
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users - Create new academic user
router.post('/users', async (req, res) => {
  try {
    const user = await db.createUser(req.body);
    res.json({ success: true, user, message: 'Academic profile registered successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/admin/login - Authenticate admin credentials
router.post('/login', async (req, res) => {
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
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = await db.deleteSession(Number(sessionId));
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
router.put('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updated = await db.updateSession(Number(sessionId), req.body);
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
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await db.deleteUser(Number(userId));
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
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updated = await db.updateUser(Number(userId), req.body);
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
router.post('/checkout/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await db.checkOutSession(Number(sessionId));
    res.json({
      success: true,
      session,
      message: `Session for ${session.user ? session.user.full_name : 'Visitor'} checked out successfully.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/admin/approve-session/:sessionId - Approve pending book borrow/return
router.post('/approve-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await db.approveSession(Number(sessionId));
    res.json({
      success: true,
      session,
      message: `Session for ${session.user ? session.user.full_name : 'Visitor'} approved successfully.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/admin/reject-session/:sessionId - Reject pending book borrow/return
router.post('/reject-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await db.rejectSession(Number(sessionId));
    res.json({
      success: true,
      session,
      message: `Session for ${session.user ? session.user.full_name : 'Visitor'} rejected.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/admin/export/csv - Direct CSV download of attendance & research logs
router.get('/export/csv', async (req, res) => {
  try {
    const { status, role_id, department_id, search, startDate, endDate, category } = req.query;
    let sessions = await db.getSessions({
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
      'Gender (ភេទ)',
      'Role',
      'Department / Faculty',
      'Contact Phone',
      'Room (បន្ទប់)',
      'Purpose of Visit',
      'Book Title / Research Topic (ឈ្មោះសៀវភៅ / ប្រធានបទ)',
      'Check-in Timestamp',
      'Check-out Timestamp',
      'Status'
    ];

    const rows = sessions.map(s => {
      const u = s.user || {};
      let catLabel = 'ចូលបណ្ណាល័យ (Library Visit)';
      if (s.purpose_of_visit === 'Book Borrowing') {
        catLabel = 'ខ្ចីសៀវភៅ (Book Borrowing)';
      } else if (s.purpose_of_visit === 'Book Return') {
        catLabel = 'សងសៀវភៅ (Book Return)';
      }

      return [
        s.id,
        `"${catLabel}"`,
        `"${(u.university_id || '').replace(/"/g, '""')}"`,
        `"${(u.full_name || '').replace(/"/g, '""')}"`,
        `"${(u.gender || '').replace(/"/g, '""')}"`,
        `"${(u.role_name || '').replace(/"/g, '""')}"`,
        `"${(u.department_name || '').replace(/"/g, '""')}"`,
        `"${(u.phone || '').replace(/"/g, '""')}"`,
        `"${(u.room || '').replace(/"/g, '""')}"`,
        `"${(s.purpose_of_visit || '').replace(/"/g, '""')}"`,
        `"${(s.research_topic || '').replace(/"/g, '""')}"`,
        `"${s.check_in_time}"`,
        `"${s.check_out_time || 'N/A'}"`,
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

// POST /api/admin/reset-sessions - Clear all attendance sessions with admin password protection
router.post('/reset-sessions', async (req, res) => {
  try {
    const { password } = req.body;
    const cleanPass = String(password || '').trim();

    if (cleanPass !== 'zbath@247') {
      return res.status(401).json({
        success: false,
        message: 'លេខសម្ងាត់ Admin មិនត្រឹមត្រូវ! (Incorrect Admin Password)'
      });
    }

    const result = await db.resetSessions();
    res.json({
      success: true,
      message: 'ទិន្នន័យវត្តមាន និងការខ្ចី-សងទាំងអស់ត្រូវបាន Reset ជាថ្មីជោគជ័យ!',
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/export/excel - Excel download with Summary and Detailed Logs
router.get('/export/excel', async (req, res) => {
  try {
    const { status, role_id, department_id, search, startDate, endDate, category } = req.query;
    let sessions = await db.getSessions({
      status,
      role_id,
      department_id,
      search,
      startDate,
      endDate
    });

    if (category === 'BORROW' || category === 'borrow') {
      sessions = sessions.filter(s => s.purpose_of_visit === 'Book Borrowing');
    } else if (category === 'RETURN' || category === 'return') {
      sessions = sessions.filter(s => s.purpose_of_visit === 'Book Return');
    } else if (category === 'VISIT' || category === 'visit') {
      sessions = sessions.filter(s => s.purpose_of_visit !== 'Book Borrowing' && s.purpose_of_visit !== 'Book Return');
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'University Library System';
    
    // ==========================================
    // SHEET 1: Summary Stats
    // ==========================================
    const summarySheet = workbook.addWorksheet('របាយការណ៍សង្ខេប (Summary)');
    
    // Calculate Stats
    let totalVisits = 0;
    let totalBorrows = 0;
    let totalReturns = 0;
    let totalMale = 0;
    let totalFemale = 0;
    const bookCounts = {};

    sessions.forEach(s => {
      const u = s.user || {};
      const gender = u.gender || '';
      
      if (s.purpose_of_visit === 'Book Borrowing') {
        const topic = s.research_topic || '';
        // Extract quantity from "[ខ្ចី X ក្បាល]" or "[សង X ក្បាល]"
        const qtyMatch = topic.match(/^\[(?:ខ្ចី|សង)\s+(\d+)\s+ក្បាល\]/);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        
        totalBorrows += qty;
        
        // Remove the prefix to get the clean title
        const cleanTopic = topic.replace(/^\[(ខ្ចី|សង)(?:\s+\d+\s+ក្បាល)?\]\s*/, '').trim();
        if (cleanTopic) {
          bookCounts[cleanTopic] = (bookCounts[cleanTopic] || 0) + qty;
        }
      } else if (s.purpose_of_visit === 'Book Return') {
        const topic = s.research_topic || '';
        const qtyMatch = topic.match(/^\[(?:ខ្ចី|សង)\s+(\d+)\s+ក្បាល\]/);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        totalReturns += qty;
      } else {
        totalVisits++;
      }

      if (gender === 'Male' || gender === 'ប្រុស') totalMale++;
      if (gender === 'Female' || gender === 'ស្រី') totalFemale++;
    });

    // Top 10 Books
    const sortedBooks = Object.entries(bookCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Apply some styling to header
    const headerStyle = {
      font: { name: 'Khmer OS Battambang', bold: true, size: 11 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
      }
    };
    
    const dataStyle = {
      font: { name: 'Khmer OS Battambang', size: 11 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
      }
    };

    summarySheet.columns = [
      { width: 10 }, // A
      { width: 25 }, // B
      { width: 15 }, // C
      { width: 5 },  // D (spacing)
      { width: 10 }, // E
      { width: 40 }, // F
      { width: 15 }, // G
    ];

    // Headers
    summarySheet.getCell('A1').value = 'ល.រ';
    summarySheet.getCell('B1').value = 'ប្រភេទ';
    summarySheet.getCell('C1').value = 'ចំនួន';
    summarySheet.getCell('E1').value = 'Top';
    summarySheet.getCell('F1').value = 'ខ្ចីសៀវភៅ (ចំណងជើង)';
    summarySheet.getCell('G1').value = 'ចំនួន';

    ['A1','B1','C1','E1','F1','G1'].forEach(cell => {
      summarySheet.getCell(cell).style = headerStyle;
    });

    // Table 1 Data
    const table1 = [
      [1, 'ចូលបណ្ណាល័យសរុប', `${totalVisits} នាក់`],
      [2, 'ខ្ចីសៀវភៅសរុប', `${totalBorrows} ក្បាល`],
      [3, 'សងសៀវភៅសរុប', `${totalReturns} ក្បាល`],
      [4, 'ភេទប្រុសសរុប', `${totalMale} នាក់`],
      [5, 'ភេទស្រីសរុប', `${totalFemale} នាក់`],
    ];

    table1.forEach((row, i) => {
      const rowIndex = i + 2;
      summarySheet.getCell(`A${rowIndex}`).value = row[0];
      summarySheet.getCell(`B${rowIndex}`).value = row[1];
      summarySheet.getCell(`C${rowIndex}`).value = row[2];
      
      ['A','B','C'].forEach(col => {
        summarySheet.getCell(`${col}${rowIndex}`).style = dataStyle;
      });
    });

    // Table 2 Data
    for (let i = 0; i < 10; i++) {
      const rowIndex = i + 2;
      summarySheet.getCell(`E${rowIndex}`).value = i + 1;
      
      if (i < sortedBooks.length) {
        summarySheet.getCell(`F${rowIndex}`).value = sortedBooks[i][0];
        summarySheet.getCell(`G${rowIndex}`).value = sortedBooks[i][1];
      } else {
        summarySheet.getCell(`F${rowIndex}`).value = '';
        summarySheet.getCell(`G${rowIndex}`).value = '';
      }

      ['E','F','G'].forEach(col => {
        summarySheet.getCell(`${col}${rowIndex}`).style = dataStyle;
      });
    }

    // ==========================================
    // SHEET 2: Raw Detailed Logs
    // ==========================================
    const logsSheet = workbook.addWorksheet('ទិន្នន័យលម្អិត (Raw Data)');
    
    logsSheet.columns = [
      { header: 'Session ID', key: 'id', width: 15 },
      { header: 'Category (ប្រភេទទិន្នន័យ)', key: 'cat', width: 25 },
      { header: 'University ID', key: 'uid', width: 15 },
      { header: 'Full Name', key: 'name', width: 20 },
      { header: 'Gender (ភេទ)', key: 'gender', width: 10 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Department / Faculty', key: 'dept', width: 25 },
      { header: 'Contact Phone', key: 'phone', width: 15 },
      { header: 'Room (បន្ទប់)', key: 'room', width: 10 },
      { header: 'Purpose of Visit', key: 'purpose', width: 20 },
      { header: 'Book Title / Research Topic (ឈ្មោះសៀវភៅ / ប្រធានបទ)', key: 'topic', width: 30 },
      { header: 'Check-in Timestamp', key: 'inTime', width: 20 },
      { header: 'Check-out Timestamp', key: 'outTime', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    logsSheet.getRow(1).font = { bold: true };

    sessions.forEach(s => {
      const u = s.user || {};
      let catLabel = 'ចូលបណ្ណាល័យ (Library Visit)';
      if (s.purpose_of_visit === 'Book Borrowing') {
        catLabel = 'ខ្ចីសៀវភៅ (Book Borrowing)';
      } else if (s.purpose_of_visit === 'Book Return') {
        catLabel = 'សងសៀវភៅ (Book Return)';
      }

      logsSheet.addRow({
        id: s.session_id,
        cat: catLabel,
        uid: u.university_id || '',
        name: u.full_name || '',
        gender: u.gender || '',
        role: u.role ? u.role.name : (s.role_id || ''),
        dept: u.department ? u.department.name : (s.department_id || ''),
        phone: u.phone || '',
        room: u.room || '',
        purpose: s.purpose_of_visit || '',
        topic: s.research_topic || '',
        inTime: s.check_in_time ? new Date(s.check_in_time).toLocaleString() : '',
        outTime: s.check_out_time ? new Date(s.check_out_time).toLocaleString() : '',
        status: s.status || ''
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Library_Logs_${new Date().toISOString().slice(0, 10)}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to generate Excel file' });
  }
});

module.exports = router;
