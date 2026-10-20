const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public Auth Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Auth Endpoints
router.get('/me', verifyToken, authController.getMe);
router.get('/notifications', verifyToken, authController.getNotifications);
router.patch('/notifications/read', verifyToken, authController.markNotificationsRead);

module.exports = router;
