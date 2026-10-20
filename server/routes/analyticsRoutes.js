const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Public & Admin analytics summary
router.get('/summary', analyticsController.getAnalyticsSummary);

module.exports = router;
