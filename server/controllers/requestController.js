const { db } = require('../db/database');

/**
 * Generate a clean, official Kenyan eCitizen-style reference number
 * Format: REQ-YYYY-XXXXX (e.g., REQ-2026-A7K92)
 */
function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REQ-${year}-${randomPart}`;
}

/**
 * Submit a new service request (Citizen)
 * POST /api/requests
 */
exports.submitRequest = (req, res) => {
  try {
    const {
      category,
      priority = 'Medium',
      county,
      subcounty,
      ward_or_landmark,
      gps_coordinates,
      description
    } = req.body;

    if (!category || !county || !subcounty || !ward_or_landmark || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Category, County, Sub-county, Location, Description).'
      });
    }

    // Handle optional uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      imageUrl = req.body.image_url;
    }

    // Generate unique reference number with retry for uniqueness
    let referenceNo = generateReferenceNumber();
    let collision = db.prepare('SELECT id FROM service_requests WHERE reference_no = ?').get(referenceNo);
    while (collision) {
      referenceNo = generateReferenceNumber();
      collision = db.prepare('SELECT id FROM service_requests WHERE reference_no = ?').get(referenceNo);
    }

    // Determine default department based on category
    const departmentMap = {
      'Streetlighting': 'Urban Infrastructure & Energy',
      'Water Supply & Leakages': 'Water & Sanitation Services',
      'Garbage & Waste Management': 'Environment & Waste Management',
      'Roads & Potholes': 'Roads, Transport & Public Works',
      'Sewerage & Drainage': 'Public Health & Sanitation',
      'Public Safety & Noise': 'County Enforcement & Security',
      'Other Civic Services': 'Citizen Affairs & Public Relations'
    };
    const assignedDepartment = departmentMap[category] || 'General Public Works';

    const insertRequest = db.prepare(`
      INSERT INTO service_requests (
        reference_no, user_id, category, priority, county, subcounty,
        ward_or_landmark, gps_coordinates, description, image_url,
        status, assigned_department
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
    `);

    const result = insertRequest.run(
      referenceNo,
      req.user.id,
      category,
      priority,
      county,
      subcounty,
      ward_or_landmark,
      gps_coordinates || null,
      description.trim(),
      imageUrl,
      assignedDepartment
    );

    const requestId = result.lastInsertRowid;

    // Record initial status in request_history
    db.prepare(`
      INSERT INTO request_history (request_id, status, changed_by, notes)
      VALUES (?, 'Pending', ?, 'Service ticket registered on civic portal. Awaiting departmental assignment.')
    `).run(requestId, `${req.user.name} (Citizen)`);

    // Simulated SMS & In-App Notification
    const smsText = `Dear ${req.user.name.split(' ')[0]}, your service request ${referenceNo} for ${category} has been received. You can track its progress online. - eCitizen Team`;
    db.prepare(`
      INSERT INTO notifications (user_id, request_id, channel, title, message, recipient)
      VALUES (?, ?, 'SMS', 'Request Submitted: ' || ?, ?, ?)
    `).run(req.user.id, requestId, referenceNo, smsText, req.user.phone);

    const created = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(requestId);

    return res.status(201).json({
      success: true,
      message: 'Service request submitted successfully.',
      request: created
    });
  } catch (error) {
    console.error('Submit request error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while creating service request.' });
  }
};

/**
 * Get all requests for the logged-in citizen
 * GET /api/requests/my-requests
 */
exports.getMyRequests = (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT 
        sr.*,
        fb.rating as feedback_rating,
        fb.comments as feedback_comments
      FROM service_requests sr
      LEFT JOIN feedback fb ON fb.request_id = sr.id
      WHERE sr.user_id = ?
      ORDER BY sr.created_at DESC
    `).all(req.user.id);

    return res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your requests.' });
  }
};

/**
 * Get all service requests (Admin Dashboard) with filters & search
 * GET /api/requests/admin/all
 */
exports.getAllRequestsAdmin = (req, res) => {
  try {
    const { status, category, priority, county, search, sort = 'desc' } = req.query;

    let query = `
      SELECT 
        sr.*,
        u.name as citizen_name,
        u.email as citizen_email,
        u.phone as citizen_phone,
        u.national_id as citizen_national_id,
        fb.rating as feedback_rating,
        fb.comments as feedback_comments
      FROM service_requests sr
      JOIN users u ON u.id = sr.user_id
      LEFT JOIN feedback fb ON fb.request_id = sr.id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'All') {
      query += ` AND sr.status = ?`;
      params.push(status);
    }

    if (category && category !== 'All') {
      query += ` AND sr.category = ?`;
      params.push(category);
    }

    if (priority && priority !== 'All') {
      query += ` AND sr.priority = ?`;
      params.push(priority);
    }

    if (county && county !== 'All') {
      query += ` AND sr.county = ?`;
      params.push(county);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ` AND (
        LOWER(sr.reference_no) LIKE ? OR
        LOWER(u.name) LIKE ? OR
        LOWER(u.phone) LIKE ? OR
        LOWER(sr.ward_or_landmark) LIKE ? OR
        LOWER(sr.subcounty) LIKE ?
      )`;
      params.push(term, term, term, term, term);
    }

    query += ` ORDER BY sr.created_at ${sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;

    const requests = db.prepare(query).all(...params);

    return res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error('Get admin requests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve service requests.' });
  }
};

/**
 * Get single request details by ID or Reference Number
 * Includes timeline history & citizen feedback
 * GET /api/requests/:identifier
 */
exports.getRequestDetails = (req, res) => {
  try {
    const { identifier } = req.params;

    let request;
    if (isNaN(identifier)) {
      request = db.prepare(`
        SELECT sr.*, u.name as citizen_name, u.phone as citizen_phone, u.email as citizen_email
        FROM service_requests sr
        JOIN users u ON u.id = sr.user_id
        WHERE LOWER(sr.reference_no) = ?
      `).get(identifier.trim().toLowerCase());
    } else {
      request = db.prepare(`
        SELECT sr.*, u.name as citizen_name, u.phone as citizen_phone, u.email as citizen_email
        FROM service_requests sr
        JOIN users u ON u.id = sr.user_id
        WHERE sr.id = ?
      `).get(Number(identifier));
    }

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    // Check authorization: citizen can only see their own unless they are admin or this is a public lookup
    // If not authenticated or different citizen, we sanitize personal citizen details for privacy
    const isOwnerOrAdmin = req.user && (req.user.role === 'admin' || req.user.id === request.user_id);

    if (!isOwnerOrAdmin) {
      // Obfuscate citizen name & contacts for public tracking
      const nameParts = request.citizen_name.split(' ');
      request.citizen_name = nameParts[0] + ' ' + (nameParts[1] ? nameParts[1][0] + '***' : '');
      request.citizen_phone = request.citizen_phone ? request.citizen_phone.slice(0, 4) + '****' + request.citizen_phone.slice(-3) : null;
      request.citizen_email = null;
    }

    // Fetch history
    const history = db.prepare(`
      SELECT * FROM request_history
      WHERE request_id = ?
      ORDER BY created_at ASC
    `).all(request.id);

    // Fetch feedback
    const feedback = db.prepare(`
      SELECT * FROM feedback WHERE request_id = ?
    `).get(request.id);

    return res.json({
      success: true,
      request,
      history,
      feedback: feedback || null
    });
  } catch (error) {
    console.error('Get request details error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve request details.' });
  }
};

/**
 * Public Track by Reference Number (No Auth required)
 * GET /api/requests/track/:referenceNo
 */
exports.publicTrack = (req, res) => {
  try {
    const { referenceNo } = req.params;

    if (!referenceNo) {
      return res.status(400).json({ success: false, message: 'Reference number is required.' });
    }

    const request = db.prepare(`
      SELECT 
        sr.id, sr.reference_no, sr.category, sr.priority, sr.county, sr.subcounty,
        sr.ward_or_landmark, sr.description, sr.image_url, sr.status,
        sr.admin_notes, sr.assigned_department, sr.created_at, sr.updated_at, sr.resolved_at,
        u.name as citizen_name
      FROM service_requests sr
      JOIN users u ON u.id = sr.user_id
      WHERE LOWER(sr.reference_no) = ?
    `).get(referenceNo.trim().toLowerCase());

    if (!request) {
      return res.status(404).json({ success: false, message: `No service ticket found for "${referenceNo}". Please verify the reference number.` });
    }

    // Sanitize citizen name (e.g. Angela K***)
    const parts = request.citizen_name.split(' ');
    request.citizen_name = parts[0] + ' ' + (parts[1] ? parts[1][0] + '***' : '');

    const history = db.prepare(`
      SELECT status, changed_by, notes, created_at
      FROM request_history
      WHERE request_id = ?
      ORDER BY created_at ASC
    `).all(request.id);

    return res.json({
      success: true,
      request,
      history
    });
  } catch (error) {
    console.error('Public track error:', error);
    return res.status(500).json({ success: false, message: 'Failed to query reference number.' });
  }
};

/**
 * Update Request Status & Admin Assignment (Admin Only)
 * PATCH /api/requests/:id/status
 */
exports.updateRequestStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, assigned_department, assigned_to } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const current = db.prepare('SELECT sr.*, u.phone, u.name, u.email FROM service_requests sr JOIN users u ON u.id = sr.user_id WHERE sr.id = ?').get(Number(id));
    if (!current) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    const resolvedAt = status === 'Resolved' ? new Date().toISOString() : (status === 'Pending' ? null : current.resolved_at);

    db.prepare(`
      UPDATE service_requests
      SET status = ?,
          admin_notes = COALESCE(?, admin_notes),
          assigned_department = COALESCE(?, assigned_department),
          assigned_to = COALESCE(?, assigned_to),
          resolved_at = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      status,
      admin_notes || null,
      assigned_department || null,
      assigned_to || null,
      resolvedAt,
      id
    );

    // Add entry to history log
    const notesText = admin_notes || `Status transitioned to ${status}. Assigned to ${assigned_department || 'field team'}.`;
    db.prepare(`
      INSERT INTO request_history (request_id, status, changed_by, notes)
      VALUES (?, ?, ?, ?)
    `).run(id, status, `${req.user.name} (Admin)`, notesText);

    // Trigger simulated SMS & In-app Notification to the Citizen
    const citizenFirstName = current.name.split(' ')[0];
    let notificationMsg = `Dear ${citizenFirstName}, your ticket ${current.reference_no} (${current.category}) has been updated to ${status.toUpperCase()}.`;
    if (admin_notes) {
      notificationMsg += ` Note: ${admin_notes}`;
    }

    db.prepare(`
      INSERT INTO notifications (user_id, request_id, channel, title, message, recipient)
      VALUES (?, ?, 'SMS', 'Status Update: ' || ?, ?, ?)
    `).run(current.user_id, current.id, status, notificationMsg, current.phone);

    const updated = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(id);

    return res.json({
      success: true,
      message: `Request status updated to "${status}". Citizen notified.`,
      request: updated
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update request status.' });
  }
};

/**
 * Submit Citizen Feedback & Rating on Resolved Request
 * POST /api/requests/:id/feedback
 */
exports.submitFeedback = (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comments } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5 stars.' });
    }

    const request = db.prepare('SELECT * FROM service_requests WHERE id = ?').get(Number(id));
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    if (request.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only leave feedback on your own requests.' });
    }

    if (request.status !== 'Resolved') {
      return res.status(400).json({ success: false, message: 'Feedback can only be provided after a request is marked Resolved.' });
    }

    const existingFeedback = db.prepare('SELECT id FROM feedback WHERE request_id = ?').get(id);
    if (existingFeedback) {
      return res.status(409).json({ success: false, message: 'You have already submitted feedback for this request.' });
    }

    db.prepare(`
      INSERT INTO feedback (request_id, user_id, rating, comments)
      VALUES (?, ?, ?, ?)
    `).run(id, req.user.id, rating, comments || null);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been registered and helps improve civic services.'
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
  }
};

/**
 * Export requests data to CSV format (Admin only)
 * GET /api/requests/admin/export/csv
 */
exports.exportCsv = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        sr.reference_no,
        u.name as citizen_name,
        u.phone as citizen_phone,
        sr.category,
        sr.priority,
        sr.county,
        sr.subcounty,
        sr.ward_or_landmark,
        sr.status,
        sr.assigned_department,
        sr.created_at,
        sr.resolved_at
      FROM service_requests sr
      JOIN users u ON u.id = sr.user_id
      ORDER BY sr.created_at DESC
    `).all();

    const header = ['Reference No', 'Citizen Name', 'Phone', 'Category', 'Priority', 'County', 'Subcounty', 'Landmark', 'Status', 'Department', 'Created At', 'Resolved At'];
    const csvLines = [header.join(',')];

    for (const r of rows) {
      const line = [
        `"${r.reference_no}"`,
        `"${(r.citizen_name || '').replace(/"/g, '""')}"`,
        `"${r.citizen_phone || ''}"`,
        `"${r.category}"`,
        `"${r.priority}"`,
        `"${r.county}"`,
        `"${r.subcounty}"`,
        `"${(r.ward_or_landmark || '').replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${r.assigned_department || 'Unassigned'}"`,
        `"${r.created_at}"`,
        `"${r.resolved_at || 'N/A'}"`
      ];
      csvLines.push(line.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ecitizen_service_requests.csv"');
    return res.send(csvLines.join('\n'));
  } catch (error) {
    console.error('Export CSV error:', error);
    return res.status(500).json({ success: false, message: 'Failed to export CSV.' });
  }
};
