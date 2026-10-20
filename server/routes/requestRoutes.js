const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const requestController = require('../controllers/requestController');
const { verifyToken, requireAdmin, requireCitizen } = require('../middleware/auth');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'evidence-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image attachments are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter
});

// 1. Public Track Endpoint (No login required)
router.get('/track/:referenceNo', requestController.publicTrack);

// 2. Citizen Request Endpoints
router.post('/', verifyToken, requireCitizen, upload.single('image'), requestController.submitRequest);
router.get('/my-requests', verifyToken, requireCitizen, requestController.getMyRequests);
router.post('/:id/feedback', verifyToken, requireCitizen, requestController.submitFeedback);

// 3. Admin Request Management Endpoints
router.get('/admin/all', verifyToken, requireAdmin, requestController.getAllRequestsAdmin);
router.patch('/:id/status', verifyToken, requireAdmin, requestController.updateRequestStatus);
router.get('/admin/export/csv', verifyToken, requireAdmin, requestController.exportCsv);

// 4. Single Request Details (Authenticated - Citizen or Admin)
router.get('/:identifier', verifyToken, requestController.getRequestDetails);

module.exports = router;
