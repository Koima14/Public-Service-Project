const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'ecitizen-public-service-secret-key-2026';

/**
 * Middleware to authenticate requests using JWT
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, phone, national_id, role, created_at FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session or user not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token is invalid or expired. Please log in again.' });
  }
}

/**
 * Middleware to enforce Admin role
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Administrative privileges required.' });
  }
  next();
}

/**
 * Middleware to enforce Citizen or Admin role
 */
function requireCitizen(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  verifyToken,
  requireAdmin,
  requireCitizen
};
