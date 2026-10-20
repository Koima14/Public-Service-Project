const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Register a new citizen
 * POST /api/auth/register
 */
exports.register = (req, res) => {
  try {
    const { name, email, phone, national_id, password } = req.body;

    if (!name || !email || !phone || !national_id || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check duplicate email or national_id
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const existingId = db.prepare('SELECT id FROM users WHERE national_id = ?').get(national_id.trim());
    if (existingId) {
      return res.status(409).json({ success: false, message: 'An account with this National ID already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const insert = db.prepare(`
      INSERT INTO users (name, email, phone, national_id, password_hash, role)
      VALUES (?, ?, ?, ?, ?, 'citizen')
    `);

    const result = insert.run(
      name.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      national_id.trim(),
      passwordHash
    );

    const user = db.prepare('SELECT id, name, email, phone, national_id, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Initial welcome notification
    db.prepare(`
      INSERT INTO notifications (user_id, channel, title, message, recipient)
      VALUES (?, 'In-App', 'Welcome to eCitizen Civic Services', 'Your citizen account has been successfully verified. You can now submit and track public service requests.', ?)
    `).run(user.id, user.phone);

    return res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

/**
 * Citizen & Admin Login
 * POST /api/auth/login
 */
exports.login = (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or national_id

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier (Email or National ID) and password are required.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Query by email OR national_id
    const user = db.prepare(`
      SELECT * FROM users
      WHERE LOWER(email) = ? OR LOWER(national_id) = ?
    `).get(cleanIdentifier, cleanIdentifier);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please verify and try again.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password_hash
    const { password_hash, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

/**
 * Get Current Logged-in User Profile
 * GET /api/auth/me
 */
exports.getMe = (req, res) => {
  try {
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id).count;

    return res.json({
      success: true,
      user: {
        ...req.user,
        unreadNotifications: unreadCount
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Get User Notifications
 * GET /api/auth/notifications
 */
exports.getNotifications = (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(req.user.id);

    return res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * Mark notifications as read
 * PATCH /api/auth/notifications/read
 */
exports.markNotificationsRead = (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    return res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications as read.' });
  }
};
