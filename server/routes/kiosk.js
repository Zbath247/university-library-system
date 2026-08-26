const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const db = require('../database');

// GET /api/kiosk/meta - Metadata for dropdowns
router.get('/meta', (req, res) => {
  try {
    const roles = db.getRoles();
    const departments = db.getDepartments();
    res.json({ success: true, roles, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/kiosk/lookup - Fast scan or ID entry lookup
router.post('/lookup', async (req, res) => {
  try {
    const { university_id } = req.body;
    if (!university_id || !university_id.trim()) {
      return res.status(400).json({ success: false, message: 'University ID is required.' });
    }

    const cleanId = university_id.trim().toUpperCase();
    const user = db.findUserByUniversityId(cleanId);

    if (!user) {
      return res.json({
        success: true,
        registered: false,
        university_id: cleanId,
        message: 'Unregistered profile detected. Please complete registration.'
      });
    }

    // Check if user has an active or pending session
    let activeSession = db.getActiveSessionForUser(user.id);
    if (!activeSession) {
      const pendingSession = db.data.sessions.find(s => s.user_id === user.id && s.status === 'PENDING_APPROVAL');
      if (pendingSession) {
        activeSession = { ...pendingSession, user };
      }
    }

    return res.json({
      success: true,
      registered: true,
      user,
      activeSession: activeSession || null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/kiosk/register-and-checkin - First-time visitor registration + auto check-in
router.post('/register-and-checkin', async (req, res) => {
  try {
    const {
      university_id,
      full_name,
      email,
      phone,
      role_id,
      department_id,
      research_field,
      purpose_of_visit
    } = req.body;

    if (!university_id || !full_name || !email || !role_id || !department_id) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory fields: Full Name, University ID, Role, Department, and Email.'
      });
    }

    // 1. Create User
    const newUser = db.createUser({
      university_id,
      full_name,
      email,
      phone,
      role_id,
      department_id,
      research_field: research_field || 'General Academic Research',
      default_purpose: purpose_of_visit || 'Academic Research'
    });

    // 2. Immediate Check-In Session
    const sessionResult = db.createSession(
      newUser.id,
      purpose_of_visit || 'First-Time Library Research Session',
      research_field || newUser.research_field
    );

    // 3. Generate QR code payload data URL
    let qrDataUrl = null;
    try {
      qrDataUrl = await QRCode.toDataURL(newUser.university_id, {
        margin: 2,
        width: 280,
        color: {
          dark: '#1E293B',
          light: '#FFFFFF'
        }
      });
    } catch (qrErr) {
      console.warn('QR Code generation warning:', qrErr);
    }

    const session = sessionResult.session;
    const isPending = session.status === 'PENDING_APPROVAL';
    
    return res.json({
      success: true,
      isNewUser: true,
      user: newUser,
      session: session,
      qrDataUrl,
      message: isPending 
        ? `Welcome, ${newUser.full_name}! Your request to borrow/return is pending admin approval.`
        : `Welcome to the University Library, ${newUser.full_name}! Registration and check-in completed.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/kiosk/checkin - Returning visitor instant check-in
router.post('/checkin', async (req, res) => {
  try {
    const { university_id, purpose_of_visit, research_topic } = req.body;
    if (!university_id) {
      return res.status(400).json({ success: false, message: 'University ID is required.' });
    }

    let user = db.findUserByUniversityId(university_id);
    if (!user) {
      const { full_name, role_id, department_id, email, phone } = req.body;
      if (full_name) {
        user = db.createUser({
          university_id,
          full_name,
          role_id: Number(role_id) || 1,
          department_id: Number(department_id) || 1,
          email: email || `${university_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@duc.edu.kh`,
          phone: phone || '',
          research_field: research_topic || 'Academic Research',
          default_purpose: purpose_of_visit || 'Study & Revision'
        });
      } else {
        return res.status(404).json({
          success: false,
          registered: false,
          message: 'User profile not found. Please click "Switch Profile / Register" to register.'
        });
      }
    }

    const sessionResult = db.createSession(
      user.id,
      purpose_of_visit || user.default_purpose || 'Academic Research',
      research_topic || user.research_field || 'Academic Research'
    );

    if (sessionResult.alreadyActive) {
      return res.json({
        success: true,
        alreadyActive: true,
        user,
        session: sessionResult.session,
        message: `Welcome back, ${user.full_name}. You are currently already checked in since ${new Date(sessionResult.session.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      });
    }

    const isPending = sessionResult.session.status === 'PENDING_APPROVAL';

    return res.json({
      success: true,
      alreadyActive: false,
      user,
      session: sessionResult.session,
      message: isPending 
        ? `Welcome back, ${user.full_name}. Your request to borrow/return is pending admin approval.`
        : `Welcome back, ${user.full_name} — Check-in successful. Happy researching!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/kiosk/checkout - Check-out / End session
router.post('/checkout', (req, res) => {
  try {
    const session_id = req.body.session_id || req.body.sessionId;
    const university_id = req.body.university_id || req.body.universityId;

    let checkoutTarget = session_id;
    if (!checkoutTarget && university_id) {
      const user = db.findUserByUniversityId(university_id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      checkoutTarget = user.id;
    }

    if (!checkoutTarget) {
      return res.status(400).json({ success: false, message: 'Session ID or University ID is required to check out.' });
    }

    const completedSession = db.checkOutSession(checkoutTarget);

    const hours = Math.floor(completedSession.duration_minutes / 60);
    const mins = completedSession.duration_minutes % 60;
    const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

    return res.json({
      success: true,
      session: completedSession,
      durationFormatted,
      message: `Check-out successful! Thank you for visiting, ${completedSession.user ? completedSession.user.full_name : ''}. Total research duration: ${durationFormatted}.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/kiosk/badge/:university_id - Get digital QR badge
router.get('/badge/:university_id', async (req, res) => {
  try {
    const { university_id } = req.params;
    const user = db.findUserByUniversityId(university_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const qrDataUrl = await QRCode.toDataURL(user.university_id, {
      margin: 2,
      width: 320,
      color: { dark: '#0F172A', light: '#FFFFFF' }
    });

    res.json({
      success: true,
      user,
      qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/kiosk/session/:id - Get session status for polling
router.get('/session/:id', (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const session = db.data.sessions.find(s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
