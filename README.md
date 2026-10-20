# 🇰🇪 eCitizen Public Service Request System (Mini eCitizen-Style)

A digital public service fault reporting, tracking, and municipal resolution portal inspired by Kenya's **eCitizen** and **Huduma Kenya** platforms. Built for citizens to report civic infrastructure issues (e.g. broken streetlights, burst water pipes, uncollected garbage, dangerous potholes) and for county administration to triage, dispatch field crews, track resolution timelines, and monitor citizen satisfaction.

---

## 📋 Project Overview

The **Public Service Request System** is a web-based platform inspired by Kenya's eCitizen and Huduma Kenya services. It aims to improve communication between citizens and public service administrators by providing a centralized way to report public service issues, track requests, and manage their resolution.

The system provides the following key features:

- **Citizen Registration and Authentication:** Allows citizens to create accounts and log in using their email address or National ID.
- **Service Request Submission:** Enables citizens to report public service issues by providing a category, location, description, and supporting photographic evidence.
- **Request Tracking:** Allows citizens to monitor the progress of their requests through statuses such as Pending, In Progress, Resolved, and Rejected.
- **Administrative Dashboard:** Provides administrators with tools to review submitted requests, manage cases, update statuses, and monitor service delivery.
- **Analytics and Reporting:** Presents service request statistics, including total requests, resolution rates, and category breakdowns.
- **Public Reference Tracking:** Allows users to check request status using a reference code without logging in.
- **Citizen Feedback:** Supports satisfaction ratings and reviews after a request has been resolved.
- **Notifications:** Includes simulated SMS and in-app notifications to communicate request updates.
- **Data Export:** Enables administrators to export service request information to CSV for reporting.
- **Location Services:** Supports GPS-based location detection and Google Maps integration to help identify where issues occur.
- **Department and Officer Assignment:** Supports assigning requests to relevant departments or field officers and maintaining a history of status changes.

### Technology Stack

The application uses **React and Vite** for the frontend, **Node.js and Express** for the backend, and **SQLite** for data storage. JSON Web Tokens (JWT) support authentication and role-based access control.

### User Interface and Design

The system features a responsive interface with Kenyan civic-service-inspired branding, status indicators, request progress tracking, and notifications to help users navigate the service request process.

### Project Goal

The goal is to demonstrate how a digital public service platform can make issue reporting more accessible, improve request tracking, and support more transparent and efficient public service management.

---

## 🚀 Quick Start (Single-Command Launch)

### Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node v24.3.0 with native built-in SQLite)
- **npm**: v9.0.0 or later

### Installation & Launch

```bash
# 1. Navigate to the project root
cd "C:\Users\KOIMA ANGELA\.gemini\antigravity\scratch\public-service-request-system"

# 2. Install dependencies (Root & Client)
npm install
npm install --prefix client

# 3. Build the frontend for production
npm run build

# 4. Start the fullstack server
npm start
```

Open your browser at:
👉 **`http://localhost:5000`**

*(Alternatively, for active frontend development with Hot Module Replacement, run `npm run dev` to launch concurrently on `http://localhost:5173` with proxying to port 5000).*

---

## 🔑 Pre-Seeded Demo Credentials

The database automatically seeds realistic demo data on first boot. You can use the **1-Click Quick Login** buttons on the landing page or login manually with:

| Role | Email / Identifier | Password | Default Profile Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ecitizen.go.ke` | `Admin@12345` | County Operations Command Desk (`ADM-001`) |
| **Citizen** | `citizen@ecitizen.go.ke` | `Citizen@12345` | Angela Koima (National ID: `34567890`) |
| **Citizen (2)** | `brian.mwangi@example.com` | `Citizen@12345` | Brian Mwangi (National ID: `29871234`) |

---

## 🏛️ System Features & User Journey

### 1. Citizen Portal
- **Registration & Authentication**: Sign up with Full Legal Name, National ID, Email, Phone Number, and Password. Secure login via either Email or National ID.
- **Service Request Lodging**:
  - **7 Preset Categories**: Streetlighting, Water Supply & Leakages, Garbage & Waste, Roads & Potholes, Sewerage & Drainage, Public Safety, Other Civic Services.
  - **Location Presets**: Kenyan County selector (Nairobi, Mombasa, Kiambu, Nakuru, Kisumu, Machakos, Uasin Gishu) with matching Sub-Counties/Constituencies.
  - **GPS Integration**: One-click "Auto-detect Device Location" via browser Geolocation API.
  - **Photo Evidence**: Upload JPG, PNG, or WebP images up to 5 MB with preview.
  - **Instant Reference Code**: Generates an official tracking number (e.g. `REQ-2026-ST8901`) and triggers a simulated SMS notification to the citizen.
- **Citizen Dashboard**:
  - Personal ticket status cards (Pending, In Progress, Resolved).
  - Search and filter personal history.
  - Interactive **5-Star Rating & Feedback modal** once an issue is marked Resolved.

### 2. Admin Operations Desk
- **Live Civic Analytics**:
  - Number of **Open Cases** (Pending + In Progress) vs **Resolved Cases**.
  - Total tickets logged across all sectors.
  - Overall Resolution Rate percentage.
  - Average citizen satisfaction score (e.g. 4.7 / 5.0).
  - Visual category breakdown showing open/resolved distribution.
- **Ticket Management**:
  - Filter requests by Status, Category, Priority (Low, Medium, High, Critical), or County.
  - Search by ticket reference code, citizen name, phone number, or landmark.
  - **Status Update Drawer**: Update state (`Pending` → `In Progress` → `Resolved` / `Rejected`), assign responsible department (e.g., *Nairobi Water NCWSC*, *Kenya Power*, *KeNHA*), assign technician/engineer, and record resolution remarks.
  - Updating a ticket immediately dispatches a simulated SMS notification to the citizen's phone.
- **Reporting**: Export the complete filtered queue to CSV format with a single click.

### 3. Public Ticket Tracking (No Login Required)
- Any citizen or stakeholder can type a reference number (e.g. `REQ-2026-ST8901`) on the home page or navigation bar.
- Displays live status badge, responsible agency, resolution remarks, and a visual progress stepper. Citizen personal contact details are automatically masked (e.g. `Angela K***`) for privacy.

---

## 🧱 Architecture & Project Directory Structure

```text
public-service-request-system/
├── client/                               # React + Vite Frontend
│   ├── src/
│   │   ├── components/                   # Reusable UI widgets
│   │   │   ├── Navbar.jsx                # Official eCitizen header & tricolor
│   │   │   ├── StatusBadge.jsx           # Pending, In Progress, Resolved badges
│   │   │   ├── PriorityBadge.jsx         # Low, Medium, High, Critical badges
│   │   │   ├── StatusTimeline.jsx        # Stepper & audit trail log
│   │   │   ├── PublicTrackModal.jsx      # Public ticket lookup modal
│   │   │   ├── FeedbackModal.jsx         # 5-star citizen rating dialog
│   │   │   └── NotificationDrawer.jsx    # Simulated SMS notification feed
│   │   ├── pages/                        # Application views
│   │   │   ├── LandingPage.jsx           # Public portal hero, stats & categories
│   │   │   ├── LoginPage.jsx             # Auth with demo fast-fill chips
│   │   │   ├── RegisterPage.jsx          # Official citizen profile registration
│   │   │   ├── NewRequestPage.jsx        # Fault reporting form + GPS + image
│   │   │   ├── CitizenDashboard.jsx      # Citizen's personal request queue
│   │   │   ├── AdminDashboard.jsx        # Command desk & analytics
│   │   │   └── RequestDetailPage.jsx     # Full ticket dossier & maps link
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Global auth & notification state
│   │   ├── services/
│   │   │   └── api.js                    # Fetch wrapper with JWT headers
│   │   ├── App.jsx                       # Root router & layout
│   │   ├── index.css                     # Tailwind CSS imports & base styles
│   │   └── main.jsx                      # React 19 entry point
│   ├── dist/                             # Compiled production bundle
│   ├── index.html                        # HTML entry with Plus Jakarta font
│   ├── vite.config.js                    # Vite configuration with proxy
│   └── package.json
│
├── server/                               # Node.js + Express Backend
│   ├── config/                           # Environment & secrets
│   ├── controllers/
│   │   ├── authController.js             # Register, login, profile, alerts
│   │   ├── requestController.js          # Create, update, track, export CSV
│   │   └── analyticsController.js        # Open vs Resolved metrics & charts
│   ├── db/
│   │   ├── database.js                   # Native SQLite schema & demo seed
│   │   └── ecitizen_services.db          # Auto-generated SQLite database file
│   ├── middleware/
│   │   └── auth.js                       # JWT token verification & RBAC
│   ├── routes/
│   │   ├── authRoutes.js                 # /api/auth routes
│   │   ├── requestRoutes.js              # /api/requests routes
│   │   └── analyticsRoutes.js            # /api/analytics routes
│   ├── uploads/                          # Stored photo evidence files
│   └── server.js                         # Main Express server entry point
│
├── scratch/
│   └── test-flow.js                      # Automated full-cycle integration test
├── package.json                          # Unified scripts & backend dependencies
└── README.md                             # System documentation
```

---

## 🗄️ Database Schema (SQLite)

```sql
-- Users (Citizens & Administrators)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  national_id TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('citizen', 'admin')) NOT NULL DEFAULT 'citizen',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Public Service Requests
CREATE TABLE service_requests (
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

-- Request History & Audit Timeline
CREATE TABLE request_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

-- Citizen Satisfaction Feedback
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Citizen Notifications (Simulated SMS & In-App Alerts)
CREATE TABLE notifications (
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
```

---

## 📡 REST API Specification

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new citizen account
- `POST /api/auth/login` — Sign in via Email/National ID + Password
- `GET /api/auth/me` — Retrieve current authenticated profile & unread notification count
- `GET /api/auth/notifications` — Retrieve citizen's SMS/In-App alerts
- `PATCH /api/auth/notifications/read` — Mark all alerts as read

### Service Requests (`/api/requests`)
- `POST /api/requests` — Submit a service request with optional photo (Citizen)
- `GET /api/requests/my-requests` — Get list of tickets submitted by the logged-in citizen
- `GET /api/requests/track/:referenceNo` — Public ticket lookup by reference code (No Auth required)
- `GET /api/requests/:identifier` — Get full ticket dossier with history timeline and feedback
- `GET /api/requests/admin/all` — Get all tickets with filtering & search (Admin only)
- `PATCH /api/requests/:id/status` — Update status, notes, and department assignment (Admin only)
- `POST /api/requests/:id/feedback` — Submit 1–5 star rating and comment on resolved ticket (Citizen)
- `GET /api/requests/admin/export/csv` — Export all requests into CSV spreadsheet (Admin only)

### Analytics (`/api/analytics`)
- `GET /api/analytics/summary` — Retrieve high-level open vs resolved counts, resolution rate %, category breakdown, and satisfaction average.

---

## 🧪 Automated Verification Script

You can verify the complete end-to-end integration at any time by running:

```bash
node scratch/test-flow.js
```

This automated script performs:
1. Citizen authentication
2. New fault ticket submission
3. Public tracking lookup (verifying name masking)
4. Admin status update to `In Progress`
5. Admin status transition to `Resolved`
6. Citizen 5-star rating submission
7. Simulated SMS alert verification
8. Real-time analytics recalculation

---

## 🇰🇪 Republic of Kenya • eCitizen Civic Services
Built for citizen empowerment, transparency, and accountable public service delivery.
