# InternFlow — DoxabetaCloud Academy Student Management Portal

Welcome to the frontend testing and user guide for **InternFlow**, the Student Management Portal for DoxabetaCloud Academy. This document provides step-by-step instructions for running, testing, and verifying all features of the application.

---

##  Quick Start & Installation

### Prerequisites
- **Node.js**: v18.x or later
- **Package Manager**: `npm` (or `bun` / `yarn`)

### Installation & Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   *The application will boot the integrated server and React frontend on `http://localhost:3000`.*

3. **Production Build & Preview**
   ```bash
   npm run build
   npm run start
   ```

4. **Code Quality & Type Check**
   ```bash
   npm run lint
   ```

---

##  Authentication & Roles

The system uses **HTTP Basic Authentication** (`Authorization: Basic <base64(username:password)>`) for all server requests.

### Pre-Configured Test Credentials

You can log in directly using the form or click any of the **Quick Test Credentials** on the login screen:

| Role | Username | Password | Permissions Summary |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full access to create, edit, delete, manage system settings, and export CSV reports. |
| **Mentor** | `mentor` | `mentor123` | Can create & manage students, cohorts, assignments, daily hours, and performance reviews. Can export CSV reports. |
| **Student** | `student` | `student123` | Read-only view of directories (Students, Mentors, Cohorts). Access to submit daily hours & view assignments. **CSV Export is restricted for security.** |

---

##  Connection Settings (API Environments)

Click the **Wifi Icon** on the login card or footer status bar to open the **Backend Connection Settings**:

- **Production Mode (Render Cloud API)**: Connects to live hosted backend (`https://doxabeta-student-management-1.onrender.com/api`).
- **Proxy Mode (`/api`)**: Routes API requests through the local Express dev server.
- **Direct Mode (`http://localhost:8080/api`)**: Connects directly to a locally running Java/Spring backend on port 8080.

---

##  Frontend Test Scenarios

### 1. Search & Isolated View Testing
**Objective**: Verify that searching hides non-matching items and shows only matching records.

1. Navigate to **Students** (`/students`).
2. Enter a specific search query (e.g., `STU001` or a student name) in the search input.
3. **Expected Behavior**:
   - Only the student matching the query is displayed.
   - All other students are hidden from view.
   - A search notification banner appears displaying the match count and a **Clear Search** button.
   - Clearing the search restores the full list.
4. Repeat on **Mentors** (`/mentors`) and **Cohorts** (`/cohorts`).

---

### 2. Role-Based Security & CSV Export Restriction
**Objective**: Ensure Students cannot download CSV exports containing sensitive directory data.

1. Log in as **Admin** or **Mentor**.
2. Go to **Students**, **Mentors**, or **Cohorts**.
3. Observe the **Export CSV** button in the header toolbar. Click it to verify CSV generation.
4. Log out and log back in as **Student** (`student` / `student123`).
5. Navigate to **Students**, **Mentors**, and **Cohorts**.
6. **Expected Behavior**:
   - The **Export CSV** button is completely **hidden** for Student accounts across all directory views.

---

### 3. Student Management & CRUD Operations
**Objective**: Test adding, editing, and deleting student records.

1. Log in as **Admin** or **Mentor**.
2. **Add Student**:
   - Click **+ Add Student**.
   - Fill in required DTO fields: `code` (e.g. `STU999`), `name`, `email`, `status` (`ACTIVE`, `INACTIVE`, `GRADUATED`, or `SUSPENDED`), `track`, `phone`, `cohortId`, `mentorId`.
   - Submit form and verify the student appears in the list.
3. **Edit Student**:
   - Click the **Edit** action button on a student card or table row.
   - Modify fields (e.g., change status or track) and save changes.
4. **Delete Student**:
   - Click the **Delete Student** button.
   - Confirm deletion in the modal dialog.
   - **Expected Behavior**: Student is deleted, a green success banner appears, and the list reloads.

---

### 4. Daily Hours & Attendance Logging
**Objective**: Verify submitting time logs.

1. Navigate to **Daily Hours** (`/daily-hours`).
2. Select a **Student**, enter a **Date** (`YYYY-MM-DD`), **Time In** (`HH:mm`), **Time Out** (`HH:mm`, must be after Time In), and notes.
3. Click **Submit Hours Log**.
4. Verify the entry appears in the daily hours log history.

---

### 5. Assignments & Mentor Reviews
**Objective**: Verify assignment distribution and performance evaluation logs.

1. Go to **Assignments** (`/assignments`) to create new tasks with title, description, and student assignment.
2. Go to **Reviews** (`/reviews`) to log mentor evaluation reviews (score 1-5, learning outcomes, next steps).

---

## 🛠 Backend DTO Requirements

All POST / PUT payloads sent to the backend strictly adhere to the expected DTO structures:

- **Student DTO**: `{ code, name, email, status, cohortId, mentorId, phone, track, bio }`
- **Mentor DTO**: `{ code, name, email, phone, title, department, maxMentees, bio }`
- **Cohort DTO**: `{ name, description, startDate, endDate }`
- **Daily Hours DTO**: `{ studentId, date, timeIn, timeOut, notes }`
- **Assignment DTO**: `{ studentId, title, description }`
- **Review DTO**: `{ studentId, mentorId, reviewDate, score, learningOutcomes, notes, nextSteps }`

---

##  Error Handling Guidelines

- If the backend returns `409 Conflict` (e.g. duplicate cohort name), `400 Bad Request`, or `401 Unauthorized`, a clear, dismissible red error banner will be presented at the top of the view.
- Automatic retry loops are disabled on failure to prevent continuous server overload.

---

