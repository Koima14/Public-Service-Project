const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure db directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'ecitizen_services.db');
const db = new DatabaseSync(dbPath);

// Enable Foreign Keys & WAL mode for performance
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Initialize Database Schema
 */
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      national_id TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('citizen', 'admin')) NOT NULL DEFAULT 'citizen',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_no TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')) NOT NULL DEFAULT 'Medium',
      county TEXT NOT NULL,
      subcounty TEXT NOT NULL,
      ward_or_landmark TEXT NOT NULL,
      gps_coordinates TEXT,
      description TEXT NOT NULL,
      image_url TEXT,
      status TEXT CHECK(status IN ('Pending', 'In Progress', 'Resolved', 'Rejected')) NOT NULL DEFAULT 'Pending',
      admin_notes TEXT,
      assigned_department TEXT,
      assigned_to TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS request_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      request_id INTEGER,
      channel TEXT CHECK(channel IN ('SMS', 'Email', 'In-App')) NOT NULL DEFAULT 'In-App',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      recipient TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedDefaultData();
}

/**
 * Seed initial administrative & demo citizen data if empty
 */
function seedDefaultData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    return; // Already seeded
  }

  console.log('🌱 Seeding initial demo data for eCitizen Public Service Request System...');

  const adminPass = bcrypt.hashSync('Admin@12345', 10);
  const citizenPass = bcrypt.hashSync('Citizen@12345', 10);

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, phone, national_id, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('County Operations Desk (Admin)', 'admin@ecitizen.go.ke', '+254700000000', 'ADM-001', adminPass, 'admin');
  insertUser.run('Angela Koima', 'citizen@ecitizen.go.ke', '+254712345678', '34567890', citizenPass, 'citizen');
  insertUser.run('Brian Mwangi', 'brian.mwangi@example.com', '+254722334455', '29871234', citizenPass, 'citizen');

  // 2. Seed Sample Service Requests
  const insertRequest = db.prepare(`
    INSERT INTO service_requests (
      reference_no, user_id, category, priority, county, subcounty, ward_or_landmark, gps_coordinates,
      description, image_url, status, admin_notes, assigned_department, assigned_to, created_at, updated_at, resolved_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHistory = db.prepare(`
    INSERT INTO request_history (request_id, status, changed_by, notes, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertFeedback = db.prepare(`
    INSERT INTO feedback (request_id, user_id, rating, comments, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, request_id, channel, title, message, recipient, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Sample 1: Broken Streetlight - In Progress
  insertRequest.run(
    'REQ-2026-ST8901',
    2,
    'Streetlighting',
    'High',
    'Nairobi',
    'Westlands',
    'Waiyaki Way near Sarit Centre Footbridge',
    '-1.2618, 36.8044',
    'Three consecutive pole lamps are dark for over a week, posing a severe mugging risk to pedestrians crossing after 8 PM.',
    null,
    'In Progress',
    'Maintenance contractor Kenya Power & County Lighting team dispatched. Replacement LED fittings pending delivery.',
    'Urban Infrastructure & Energy',
    'Officer James Ochieng',
    '2026-10-15 08:30:00',
    '2026-10-16 14:10:00',
    null
  );
  insertHistory.run(1, 'Pending', 'Angela Koima (Citizen)', 'Ticket submitted via Civic Portal.', '2026-10-15 08:30:00');
  insertHistory.run(1, 'In Progress', 'Admin Desk', 'Assigned to Urban Infrastructure & Energy. Field inspection ongoing.', '2026-10-16 14:10:00');
  insertNotification.run(2, 1, 'SMS', 'Request In Progress', 'Dear Angela, your request REQ-2026-ST8901 (Streetlighting) has been assigned to Officer James Ochieng and is now In Progress.', '+254712345678', '2026-10-16 14:10:00');

  // Sample 2: Water Supply Leakage - Resolved
  insertRequest.run(
    'REQ-2026-WA4321',
    2,
    'Water Supply & Leakages',
    'Critical',
    'Nairobi',
    'Kilimani',
    'Argwings Kodhek Rd, opp Yaya Centre',
    '-1.2974, 36.7909',
    'High-pressure main municipal water pipe burst. Clean drinking water flooding the road and causing severe erosion and low pressure in nearby apartments.',
    null,
    'Resolved',
    'Nairobi Water & Sewerage Co (NCWSC) emergency response team replaced the broken 8-inch valve and restored normal water distribution.',
    'Water & Sanitation Services',
    'Eng. Faith Mutua',
    '2026-10-12 11:15:00',
    '2026-10-14 16:45:00',
    '2026-10-14 16:45:00'
  );
  insertHistory.run(2, 'Pending', 'Angela Koima (Citizen)', 'Submitted urgent water pipe burst report.', '2026-10-12 11:15:00');
  insertHistory.run(2, 'In Progress', 'Admin Desk', 'Emergency plumbing crew NCWSC dispatched to site.', '2026-10-12 12:30:00');
  insertHistory.run(2, 'Resolved', 'Admin Desk', 'Burst valve replaced, pavement backfilled, water pressure tested and normal.', '2026-10-14 16:45:00');
  insertFeedback.run(2, 2, 5, 'NCWSC acted promptly within 48 hours. Clean water is back and road is clear. Excellent service!', '2026-10-15 09:00:00');
  insertNotification.run(2, 2, 'SMS', 'Request Resolved', 'Dear Angela, your ticket REQ-2026-WA4321 (Water Supply) has been marked RESOLVED. Please rate our service on the portal.', '+254712345678', '2026-10-14 16:45:00');

  // Sample 3: Garbage Collection - Pending
  insertRequest.run(
    'REQ-2026-GB7719',
    3,
    'Garbage & Waste Management',
    'Medium',
    'Mombasa',
    'Nyali',
    'Links Road market area corner',
    '-4.0322, 39.7042',
    'Waste collection trucks have missed 2 scheduled collection cycles. Piles of organic refuse overflowing bins near residential gates.',
    null,
    'Pending',
    null,
    'Environment & Waste Management',
    null,
    '2026-10-17 19:40:00',
    '2026-10-17 19:40:00',
    null
  );
  insertHistory.run(3, 'Pending', 'Brian Mwangi (Citizen)', 'Ticket submitted. Awaiting review by Department of Environment.', '2026-10-17 19:40:00');
  insertNotification.run(3, 3, 'SMS', 'Request Received', 'Dear Brian, your request REQ-2026-GB7719 has been received and assigned reference number REQ-2026-GB7719. Track status online anytime.', '+254722334455', '2026-10-17 19:40:00');

  // Sample 4: Pothole & Road Damage - In Progress
  insertRequest.run(
    'REQ-2026-RD5502',
    3,
    'Roads & Potholes',
    'High',
    'Kiambu',
    'Ruiru',
    'Eastern Bypass junction near Kamakis',
    '-1.1648, 36.9589',
    'Deep crater pothole in the left driving lane causing tire blowouts and sudden braking accidents.',
    null,
    'In Progress',
    'KeNHA regional maintenance team scheduled for cold-mix asphalt patching on Saturday.',
    'Roads, Transport & Public Works',
    'Inspector Daniel Kiprop',
    '2026-10-16 09:20:00',
    '2026-10-17 10:15:00',
    null
  );
  insertHistory.run(4, 'Pending', 'Brian Mwangi (Citizen)', 'Road hazard reported.', '2026-10-16 09:20:00');
  insertHistory.run(4, 'In Progress', 'Admin Desk', 'Inspection verified. Assigned to KeNHA maintenance section.', '2026-10-17 10:15:00');

  // Sample 5: Blocked Sewerage - Resolved
  insertRequest.run(
    'REQ-2026-SW1029',
    2,
    'Sewerage & Drainage',
    'Critical',
    'Nairobi',
    'Embakasi East',
    'Tassia Stage 3 near Chief\'s camp',
    '-1.3120, 36.8950',
    'Overflowing sewage manhole flooding the pedestrian walkway with foul odor and health hazard.',
    null,
    'Resolved',
    'Exhauster unit and high-pressure jetting machine cleared the blockage caused by solid plastic debris.',
    'Public Health & Sanitation',
    'Officer Grace Wanjiku',
    '2026-10-10 07:50:00',
    '2026-10-11 15:30:00',
    '2026-10-11 15:30:00'
  );
  insertHistory.run(5, 'Pending', 'Angela Koima (Citizen)', 'Urgent sanitary hazard reported.', '2026-10-10 07:50:00');
  insertHistory.run(5, 'In Progress', 'Admin Desk', 'Manhole jetting crew mobilized.', '2026-10-10 11:00:00');
  insertHistory.run(5, 'Resolved', 'Admin Desk', 'Blockage flushed and manhole secured with heavy concrete lid.', '2026-10-11 15:30:00');
  insertFeedback.run(5, 2, 4, 'Very fast intervention by the sanitation crew. Thank you!', '2026-10-12 08:15:00');

  console.log('✅ Demo data seeded successfully with Admin and Citizen accounts.');
}

// Initialize on require
initSchema();

module.exports = {
  db,
  initSchema
};
