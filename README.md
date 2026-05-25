# EDOT (Educational Technology Platform)

A premium, production-ready, full-stack Learning Management System (LMS) designed to solve structural challenges in online learning, student progress tracking, educational equity (sponsorships), parent-child monitoring, and real-time collaboration.

---

## 🛠️ The Problems Solved by EDOT

1. **Fragmentation of EdTech Tools**: Traditional online learning is fragmented across distinct tools (e.g., Slack for chat, Zoom for live lectures, Google Forms for quizzes, custom LMS for slides). EDOT resolves this by unifying course building, lesson delivery, quizzes, live class streams, parent tracking, sponsor funding, and messaging in one glassmorphic dashboard.
2. **Access and Financial Barriers**: Education is often inaccessible due to tuition limits. EDOT introduces a dedicated **Sponsorship Engine**, enabling students to request funding, and sponsors to fund specific course fees or general educational allowances anonymously or publicly.
3. **Lack of Parent/Guardian Oversight**: Many online learning systems exclude parents. EDOT implements a secure **Parent-Child Linkage** system where parents send consent connection requests to view their children’s grades, attendance, study goals, and milestones in real time.
4. **Lack of Administrative Action Auditing**: Traditional LMS platforms make auditing difficult. EDOT introduces an **Executive Statistics Exporter** generating comprehensive structural audits (.txt) of course counts, finance logs, and student performance.
5. **Delayed Feedback Loops**: Normal systems rely on emails for approval/rejection updates. EDOT deploys **Socket.io WebSockets** combined with a database-backed notification logger to instantly push critical alerts (e.g., course approvals, enrollment status changes) directly to the target user's active session.

---

## 👥 System Actors & Role-Based Permissions

EDOT implements a robust **Role-Based Access Control (RBAC)** architecture governing five distinct actors:

### 1. 🛡️ Administrator (Admin)
*   **System Oversight**: Monitors all registered users, sections, batches, and system activity logs.
*   **Approvals Pipeline**: Manages the approval/rejection of course publishing requests and student enrollment applications.
*   **Financial & Expense Control**: Tracks tuition fee structures, logs operating expenses, and reviews platform revenue stats.
*   **Report Generation**: Accesses the cumulative database to export comprehensive, text-based platform performance reports.

### 2. 🎓 Instructor
*   **Course Builder**: Constructs full syllabus hierarchies, structures video/text lessons, schedules quiz question arrays, and toggles final exam requirements.
*   **Academic Control**: Logs student attendance, submits term performance reports, and manages sections.
*   **Live Broadcasts**: Schedules live virtual classes on the internal streaming studio or connects exterior Google Meet events.
*   **Direct Feedback**: Connects directly with assigned student pools via chat channels.

### 3. 🧑‍🎓 Student
*   **Interactive Learning**: Registers for courses, watches lesson videos, completes quizzes, tracks study goals, and downloads verified PDF certificates.
*   **Social & Collaboration**: Participates in live lectures, requests mentorship connection loops, and interacts in group channels.
*   **Financial Support**: Requests sponsorships for courses they cannot afford.

### 4. 🤝 Sponsor
*   **Impact Funding**: Reviews students requesting financial backing, accepting terms to sponsor course fees.
*   **Progress Auditing**: Accesses a sponsor dashboard detailing the attendance, grades, and completed course counts of funded students.
*   **Transaction Tracking**: Views donation histories, cycle schedules, and downloads institutional impact reports.

### 5. 👪 Parent
*   **Learning Oversight**: Links to children's accounts using connection tokens and accepts consent requests.
*   **Real-time Monitoring**: Reviews children’s weekly study goals, completed lessons, grades, and certificates.

---

## 💻 Tech Stack Analysis

```
                      +-------------------+
                      |   React 19 / Vite | <---+ (Socket.io Client Events)
                      +-------------------+     |
                                |               |
                         (REST HTTP API)        | (WebSockets Port 5005)
                                v               |
                      +-------------------+     |
                      | Express.js Server | ----+
                      +-------------------+
                                |
                          (Prisma ORM)
                                v
                      +-------------------+
                      |   PostgreSQL DB   |
                      +-------------------+
```

### Frontend Architecture
*   **Core UI Engine**: React 19 and Vite for lightning-fast hot module replacement.
*   **State & Data Fetching**: TanStack React Query (`@tanstack/react-query`) for cache synchronization and automatic API re-validation.
*   **Routing System**: React Router Dom v7 for client-side routing, query parameter binding, and role-protected layout routes.
*   **Animation & Interactions**: Framer Motion for premium micro-animations, layout shifts, and transitions.
*   **Visual Analytics**: Recharts for custom analytics, glassmorphic tooltips, completion rates, and pie-chart category distributions.
*   **Real-time Interface**: Socket.io Client for persistent full-duplex socket hookups.
*   **Toaster Alerts**: `react-hot-toast` configured for custom HTML-rendering toasts.

### Backend Infrastructure
*   **Application Server**: Node.js & Express.js implementing modular controllers, route segregation, and centralized error logging.
*   **Real-time Orchestration**: Socket.io Server emitting events directly to targeted TCP channels.
*   **Database & ORM**: PostgreSQL database mapped via Prisma ORM for type-safe queries, migration control, and complex relationship joins.
*   **Security & Verification**: JsonWebToken (JWT) for authentication state, HttpOnly cookie storage, and BcryptJS for secure password hashing.
*   **Storage & CDN**: Multer storage backend mapped to Cloudinary APIs for dynamic media hosting.
*   **Utility & Tasks**: Nodemailer for transactional email triggers, and Node-Cron for recurring batch actions.

---

## 📁 Project Directory Layout

```text
futurelearning/
├── backend/                    # Express.js REST API & WebSocket Server
│   ├── controllers/            # Controller layer containing core business logic
│   ├── middleware/             # Route guards, authentication, and upload middleware
│   ├── prisma/                 # Database schema definitions and migrations
│   │   ├── migrations/         # Auto-generated SQL schema migrations
│   │   └── schema.prisma       # Core Prisma database model configuration
│   ├── routes/                 # Express routing mounts
│   └── server.js               # Entry point; binds HTTP server & WebSockets
├── frontend/                   # React.js Single Page Application (SPA)
│   ├── public/                 # Static public assets
│   ├── src/                    # Source code
│   │   ├── components/         # Reusable UI controls & layout templates
│   │   │   ├── EDOTLayout.jsx  # Glassmorphic sidebar wrapper for dashboard routes
│   │   │   └── Navbar.jsx      # Global public header
│   │   ├── context/            # AuthContext provider containing user status
│   │   ├── hooks/              # Custom hooks (e.g. useThemeMode)
│   │   ├── pages/              # Primary views and role-based panels
│   │   │   ├── EDOTDashboard.jsx # Dashboard analytics, charts, & exporter card
│   │   │   ├── StudentsList.jsx  # Student registry with advanced query filters
│   │   │   └── AdminCourseApprovals.jsx # Approval dashboard with dual-search board
│   │   ├── App.jsx             # Socket initialization, router tree, global toasts
│   │   └── main.jsx            # React root mount
│   ├── package.json            # Frontend dependency specifications
│   └── vite.config.js          # Build, proxy, and plugin configurations
└── README.md                   # System documentation
```

---

## 🗄️ Database Entity-Relationship Summary

The relational database schema defined in [schema.prisma](file:///c:/Users/kenenisa/Documents/futurelearning/backend/prisma/schema.prisma) handles:
*   **User**: Models logins, profile data, roles (`student`, `instructor`, `admin`, `sponsor`, `parent`), outstanding financial balance, parent-child links, and relationships to instructor pools.
*   **UserCourseProgress**: Maps N-to-N relationships between users and courses. Stores progress completion metrics, watched video frames, passed quiz results, and final exam grades.
*   **Course & Lesson**: Tracks course meta properties, status (`draft`, `pending`, `published`), pricing, requirements, and lesson arrays holding video URLs, order indexes, and quiz payloads.
*   **Section & LearnerGroup**: Manages class divisions, section schedules, capacities, and parent learning groups.
*   **Enrollment**: Manages course enrollment requests, storing statuses (`pending`, `approved`, `rejected`), rejection rationales, and timestamps.
*   **Sponsorship & Transactions**: Governs funding requests, raised balances, funding goals, transaction reference logs, cycles, and student support progress sheets.
*   **Notification**: Stores persistent database logs for user alerts (`sponsorship_update`, `course_update`, `enrollment_update`, etc.).
*   **LiveClass & Attendance**: Handles class schedules, Google Meet event metadata, and student check-ins.

---

## 🚀 Setup & Local Development Guide

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL Database instance

### 1. Environment Setup

#### Backend configuration:
Create a file at `backend/.env` containing:
```env
PORT=5005
DATABASE_URL="postgresql://username:password@localhost:5432/edotplatform?schema=public"
JWT_SECRET="your_jwt_signing_key_here"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

#### Frontend configuration:
Create a file at `frontend/.env` containing:
```env
VITE_API_URL="http://localhost:5005"
```

### 2. Dependency Installation & Database Synchronization

Open a terminal at the repository root and run:

```bash
# Set up database schema and client generation
cd backend
npm install
npx prisma generate
npx prisma db push

# Start backend dev server
npm run dev
```

In a separate terminal:

```bash
# Setup frontend application
cd frontend
npm install

# Start Vite dev server
npm run dev
```

---

## 🔎 Subsystem & Code Analysis

### 1. API Orchestration & WebSockets Integration
The server entrypoint ([server.js](file:///c:/Users/kenenisa/Documents/futurelearning/backend/server.js)) acts as the system hub:
*   Attaches a Socket.io server to the HTTP pipeline.
*   Injects the `io` instance into incoming Express requests (`req.io = io`) via a global middleware, making live broadcasts available in all route controllers.
*   Maps room subscriptions: clients join room channels identified as `user_${userId}` to receive scoped personal events.

### 2. Dynamic Admin & Student List Filtering
*   **Students Listing**: [StudentsList.jsx](file:///c:/Users/kenenisa/Documents/futurelearning/frontend/src/pages/StudentsList.jsx) incorporates responsive filtering. Students are filtered locally based on state hooks: `searchQuery` (name, email, or instructor), `batchFilter` (2026/2027/2028), `sectionFilter` (A/B/C), and `instructorFilter`.
*   **Approvals Panels**: [AdminCourseApprovals.jsx](file:///c:/Users/kenenisa/Documents/futurelearning/frontend/src/pages/AdminCourseApprovals.jsx) splits administrative reviews into independent tabs (Courses vs. Enrollments). It provides a Category Filter Panel and a Dual-Search interface to quickly process pending requests.

### 3. Glassmorphic Analytics & Report Exporting
*   **Analytics Tooltips**: [EDOTDashboard.jsx](file:///c:/Users/kenenisa/Documents/futurelearning/frontend/src/pages/EDOTDashboard.jsx) integrates interactive Recharts graphs. Default tooltips are replaced with custom CSS components styled with backing blur, modern typography (Inter/Outfit), and color schemes adjusted dynamically for dark/light themes.
*   **Platform Report Exporter**: A utility function `exportFullPlatformReport` is added to [EDOTDashboard.jsx](file:///c:/Users/kenenisa/Documents/futurelearning/frontend/src/pages/EDOTDashboard.jsx). It aggregates data from the React Query cache, formatting total course enrollments, completion rates, category stats, and financial activity into a structured text audit report downloaded as a `.txt` file.

### 4. Real-time Toast Notifications
*   **Backend Events**: In [adminRoutes.js](file:///c:/Users/kenenisa/Documents/futurelearning/backend/routes/adminRoutes.js), actions that update a course status (`PUT /courses/:id/status`), approve an enrollment (`POST /enrollments/:id/approve`), or reject an enrollment (`POST /enrollments/:id/reject`) perform two tasks:
    1. Save a new `Notification` in PostgreSQL.
    2. Invoke `req.io.to("user_" + targetId).emit("notification", ...)` to push the event.
*   **Frontend Interceptor**: In [App.jsx](file:///c:/Users/kenenisa/Documents/futurelearning/frontend/src/App.jsx), a socket listener registers on user login. When a `'notification'` event is received, a premium `react-hot-toast` sliding card is triggered, matching the app's light/dark mode and displaying details of the course or enrollment update instantly.
