import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { mockDb } from './server/mockDb.js';
import { UserRole, User } from './src/types.js';

const app = express();
const PORT = 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Demo accounts database
const VALID_USERS: Record<string, { pass: string; role: UserRole; name: string; email: string; studentId?: string; mentorId?: string }> = {
  admin: { pass: 'admin123', role: 'ADMIN', name: 'Doxabeta Admin', email: 'admin@doxabetacloudacademy.com' },
  mentor: { pass: 'mentor123', role: 'MENTOR', name: 'Sarah Jenkins', email: 's.jenkins@doxabetacloudacademy.com', mentorId: 'm1' },
  student: { pass: 'student123', role: 'STUDENT', name: 'Alex Rivera', email: 'alex.rivera@student.doxabeta.com', studentId: 's1' }
};

interface AuthenticatedRequest extends Request {
  authUser?: User;
}

// Authentication middleware for Basic Auth
function authenticateBasicAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.path === '/api/health') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      error: '401 Unauthorized: Missing or invalid Basic Authorization header',
      details: 'Please provide HTTP Basic Auth credentials (e.g. admin/admin123, mentor/mentor123, or student/student123)'
    });
  }

  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const account = VALID_USERS[username];
  if (!account || account.pass !== password) {
    return res.status(401).json({
      error: '401 Unauthorized: Invalid Basic Auth credentials',
      details: 'Incorrect username or password. Available demo logins: admin/admin123, mentor/mentor123, student/student123'
    });
  }

  req.authUser = {
    username,
    name: account.name,
    email: account.email,
    role: account.role,
    studentId: account.studentId,
    mentorId: account.mentorId
  };

  next();
}

// Backend security authorization guard
function authorizeRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.path === '/api/health' || req.path === '/api/me') {
    return next();
  }

  const user = req.authUser;
  if (!user) {
    return res.status(401).json({ error: '401 Unauthorized' });
  }

  const path = req.path;
  const method = req.method;

  // Admin endpoints: /api/admin/**
  if (path.startsWith('/api/admin')) {
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        error: `403 Forbidden: Access Denied to ${path}`,
        details: `Role ${user.role} is not authorized to access admin endpoints. Required role: ADMIN`
      });
    }
    return next();
  }

  // All authenticated users can perform GET requests under /api/**
  if (method === 'GET') {
    return next();
  }

  // Student write actions:
  // - Students can log daily hours (POST /api/daily-hours)
  // - Students can submit assignments (POST /api/assignments)
  if (user.role === 'STUDENT') {
    if (path === '/api/daily-hours' && method === 'POST') {
      return next();
    }
    if (path === '/api/assignments' && method === 'POST') {
      return next();
    }
    return res.status(403).json({
      error: `403 Forbidden: Cannot perform ${method} on ${path}`,
      details: `Students are only authorized to POST to /api/daily-hours and /api/assignments. Admin or Mentor permissions are required for staff operations.`
    });
  }

  // Admin and Mentor can perform staff POST/PUT under /api/**
  if (user.role === 'ADMIN' || user.role === 'MENTOR') {
    return next();
  }

  return res.status(403).json({
    error: `403 Forbidden: Insufficient permissions for role ${user.role}`
  });
}

// Check backend proxy status
let backendAvailable = false;
let lastCheckTime = 0;

async function checkBackendConnectivity(): Promise<boolean> {
  const now = Date.now();
  if (now - lastCheckTime < 5000) return backendAvailable;
  lastCheckTime = now;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${BACKEND_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  return backendAvailable;
}

// Smart proxy / Fallback router for /api
app.use('/api', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // First check if the real backend is reachable
  const isUp = await checkBackendConnectivity();
  if (isUp) {
    try {
      const targetUrl = `${BACKEND_URL}${req.originalUrl}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const proxyRes = await fetch(targetUrl, fetchOptions);
      const data = await proxyRes.json().catch(() => ({}));
      return res.status(proxyRes.status).json(data);
    } catch (e) {
      console.warn(`Backend proxy to ${BACKEND_URL} failed, using mock fallback engine.`, e);
    }
  }
  next();
});

// Mock Backend API implementation (Runs when the real backend is not available)
app.use('/api', authenticateBasicAuth, authorizeRole);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'InternFlow Backend Proxy API',
    company: 'DoxabetaCloud Academy',
    backendActive: backendAvailable,
    backendUrl: BACKEND_URL,
    timestamp: new Date().toISOString()
  });
});

// Me endpoint
app.get('/api/me', (req: AuthenticatedRequest, res) => {
  res.json(req.authUser);
});

// --- STUDENT MANAGEMENT ---
// GET /api/students
app.get('/api/students', (req, res) => {
  let list = [...mockDb.students];
  const { mentorId, cohort, cohortId, status, search } = req.query;

  if (mentorId) {
    list = list.filter(s => s.mentorId === String(mentorId));
  }
  const targetCohort = cohortId || cohort;
  if (targetCohort) {
    list = list.filter(s => s.cohortId === String(targetCohort) || s.cohortName === String(targetCohort));
  }
  if (status) {
    list = list.filter(s => s.status.toLowerCase() === String(status).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.track.toLowerCase().includes(q));
  }

  res.json(list);
});

// GET /api/students/:id
app.get('/api/students/:id', (req, res) => {
  const student = mockDb.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: '404 Not Found: Student with ID ' + req.params.id + ' does not exist' });
  }
  res.json(student);
});

// POST /api/students
app.post('/api/students', (req, res) => {
  const { name, email, phone, mentorId, cohortId, track, bio } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields: name and email' });
  }

  const mentor = mockDb.mentors.find(m => m.id === mentorId);
  const cohort = mockDb.cohorts.find(c => c.id === cohortId);

  const newStudent = {
    id: 's' + (mockDb.students.length + 1),
    name,
    email,
    phone: phone || '',
    mentorId: mentor ? mentor.id : undefined,
    mentorName: mentor ? mentor.name : undefined,
    cohortId: cohort ? cohort.id : undefined,
    cohortName: cohort ? cohort.name : undefined,
    status: 'Active' as const,
    track: track || 'Cloud Infrastructure',
    startDate: new Date().toISOString().split('T')[0],
    bio: bio || ''
  };

  mockDb.students.push(newStudent);
  mockDb.updateCounts();
  res.status(201).json(newStudent);
});

// PUT /api/students/:id
app.put('/api/students/:id', (req, res) => {
  const index = mockDb.students.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '404 Not Found: Student not found' });
  }

  const current = mockDb.students[index];
  const updated = { ...current, ...req.body, id: current.id };
  mockDb.students[index] = updated;
  mockDb.updateCounts();
  res.json(updated);
});

// PUT /api/students/:id/mentor/:mentorId
app.put('/api/students/:id/mentor/:mentorId', (req, res) => {
  const student = mockDb.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: '404 Not Found: Student not found' });
  }

  const mentor = mockDb.mentors.find(m => m.id === req.params.mentorId);
  if (!mentor) {
    return res.status(404).json({ error: '404 Not Found: Mentor not found' });
  }

  student.mentorId = mentor.id;
  student.mentorName = mentor.name;
  mockDb.updateCounts();
  res.json(student);
});

// PUT /api/students/:id/cohort
app.put('/api/students/:id/cohort', (req, res) => {
  const student = mockDb.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: '404 Not Found: Student not found' });
  }

  const cohortId = req.body.cohortId || req.body.cohort;
  const cohort = mockDb.cohorts.find(c => c.id === cohortId);
  if (!cohort) {
    return res.status(404).json({ error: '404 Not Found: Cohort not found' });
  }

  student.cohortId = cohort.id;
  student.cohortName = cohort.name;
  mockDb.updateCounts();
  res.json(student);
});

// PUT /api/students/:id/cohort/:cohortId
app.put('/api/students/:id/cohort/:cohortId', (req, res) => {
  const student = mockDb.students.find(s => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ error: '404 Not Found: Student not found' });
  }

  const cohort = mockDb.cohorts.find(c => c.id === req.params.cohortId);
  if (!cohort) {
    return res.status(404).json({ error: '404 Not Found: Cohort not found' });
  }

  student.cohortId = cohort.id;
  student.cohortName = cohort.name;
  mockDb.updateCounts();
  res.json(student);
});


// --- MENTOR MANAGEMENT ---
// GET /api/mentors
app.get('/api/mentors', (req, res) => {
  mockDb.updateCounts();
  res.json(mockDb.mentors);
});

// GET /api/mentors/:id
app.get('/api/mentors/:id', (req, res) => {
  const mentor = mockDb.mentors.find(m => m.id === req.params.id);
  if (!mentor) {
    return res.status(404).json({ error: '404 Not Found: Mentor not found' });
  }
  res.json(mentor);
});

// POST /api/mentors
app.post('/api/mentors', (req, res) => {
  const { name, email, phone, title, department, maxMentees, bio } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields: name and email' });
  }

  const newMentor = {
    id: 'm' + (mockDb.mentors.length + 1),
    name,
    email,
    phone: phone || '',
    title: title || 'Cloud Mentor',
    department: department || 'Engineering',
    maxMentees: Number(maxMentees) || 10,
    activeMenteesCount: 0,
    bio: bio || ''
  };

  mockDb.mentors.push(newMentor);
  res.status(201).json(newMentor);
});

// GET /api/mentors/:id/students
app.get('/api/mentors/:id/students', (req, res) => {
  const students = mockDb.students.filter(s => s.mentorId === req.params.id);
  res.json(students);
});


// --- COHORT MANAGEMENT ---
// GET /api/cohorts
app.get('/api/cohorts', (req, res) => {
  mockDb.updateCounts();
  res.json(mockDb.cohorts);
});

// POST /api/cohorts
app.post('/api/cohorts', (req, res) => {
  const { name, code, startDate, endDate, track, maxCapacity } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Missing required fields: name and code' });
  }

  const newCohort = {
    id: 'c' + (mockDb.cohorts.length + 1),
    name,
    code,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2026-12-31',
    track: track || 'Cloud & DevOps',
    maxCapacity: Number(maxCapacity) || 25,
    studentCount: 0,
    status: 'Active' as const
  };

  mockDb.cohorts.push(newCohort);
  res.status(201).json(newCohort);
});

// GET /api/cohorts/:id/students
app.get('/api/cohorts/:id/students', (req, res) => {
  const students = mockDb.students.filter(s => s.cohortId === req.params.id);
  res.json(students);
});


// --- DAILY HOURS TRACKING ---
// GET /api/daily-hours
app.get('/api/daily-hours', (req, res) => {
  let list = [...mockDb.dailyHours];
  if (req.query.studentId) {
    list = list.filter(h => h.studentId === String(req.query.studentId));
  }
  res.json(list);
});

// POST /api/daily-hours
app.post('/api/daily-hours', (req: AuthenticatedRequest, res) => {
  const { studentId, date, hoursLogged, project, category, description } = req.body;
  const effStudentId = studentId || req.authUser?.studentId || 's1';
  const student = mockDb.students.find(s => s.id === effStudentId);

  if (!hoursLogged || !project) {
    return res.status(400).json({ error: 'Missing required fields: hoursLogged and project' });
  }

  const newEntry = {
    id: 'dh' + (mockDb.dailyHours.length + 1),
    studentId: effStudentId,
    studentName: student ? student.name : (req.authUser?.name || 'Alex Rivera'),
    date: date || new Date().toISOString().split('T')[0],
    hoursLogged: Number(hoursLogged),
    project,
    category: category || 'General Engineering',
    description: description || '',
    status: 'Approved' as const
  };

  mockDb.dailyHours.unshift(newEntry);
  res.status(201).json(newEntry);
});


// --- REVIEWS MANAGEMENT ---
// GET /api/reviews
app.get('/api/reviews', (req, res) => {
  let list = [...mockDb.reviews];
  if (req.query.studentId) {
    list = list.filter(r => r.studentId === String(req.query.studentId));
  }
  res.json(list);
});

// POST /api/reviews
app.post('/api/reviews', (req: AuthenticatedRequest, res) => {
  const { studentId, rating, technicalSkills, communication, initiative, feedback, recommendations } = req.body;
  if (!studentId || !feedback) {
    return res.status(400).json({ error: 'Missing required fields: studentId and feedback' });
  }

  const student = mockDb.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: '404 Not Found: Student not found' });
  }

  const newReview = {
    id: 'r' + (mockDb.reviews.length + 1),
    studentId,
    studentName: student.name,
    reviewerId: req.authUser?.mentorId || 'm1',
    reviewerName: req.authUser?.name || 'Sarah Jenkins',
    reviewDate: new Date().toISOString().split('T')[0],
    rating: Number(rating) || 5,
    technicalSkills: Number(technicalSkills) || 5,
    communication: Number(communication) || 5,
    initiative: Number(initiative) || 5,
    feedback,
    recommendations: recommendations || ''
  };

  mockDb.reviews.unshift(newReview);
  res.status(201).json(newReview);
});


// --- ASSIGNMENTS MANAGEMENT ---
// GET /api/assignments
app.get('/api/assignments', (req, res) => {
  let list = [...mockDb.assignments];
  if (req.query.studentId) {
    list = list.filter(a => a.studentId === String(req.query.studentId));
  }
  res.json(list);
});

// POST /api/assignments
app.post('/api/assignments', (req: AuthenticatedRequest, res) => {
  const { title, studentId, description, repositoryUrl, dueDate } = req.body;
  if (!title || !repositoryUrl) {
    return res.status(400).json({ error: 'Missing required fields: title and repositoryUrl' });
  }

  const effStudentId = studentId || req.authUser?.studentId || 's1';
  const student = mockDb.students.find(s => s.id === effStudentId);

  const newAssignment = {
    id: 'a' + (mockDb.assignments.length + 1),
    title,
    studentId: effStudentId,
    studentName: student ? student.name : (req.authUser?.name || 'Alex Rivera'),
    description: description || '',
    repositoryUrl,
    submissionDate: new Date().toISOString().split('T')[0],
    dueDate: dueDate || '2026-08-15',
    maxScore: 100,
    status: 'Submitted' as const
  };

  mockDb.assignments.unshift(newAssignment);
  res.status(201).json(newAssignment);
});

// PUT /api/assignments/:id/grade
app.put('/api/assignments/:id/grade', (req: AuthenticatedRequest, res) => {
  const assignment = mockDb.assignments.find(a => a.id === req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: '404 Not Found: Assignment not found' });
  }

  const { score, feedback } = req.body;
  assignment.score = Number(score);
  assignment.feedback = feedback || '';
  assignment.status = 'Graded';
  assignment.gradedBy = req.authUser?.name || 'Mentor Staff';

  res.json(assignment);
});


// --- ADMIN DASHBOARD ENDPOINTS ---
// GET /api/admin/overview
app.get('/api/admin/overview', (req, res) => {
  res.json(mockDb.getAdminOverview());
});

// GET /api/admin/raw-json
app.get('/api/admin/raw-json', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    students: mockDb.students,
    mentors: mockDb.mentors,
    cohorts: mockDb.cohorts,
    dailyHours: mockDb.dailyHours,
    reviews: mockDb.reviews,
    assignments: mockDb.assignments
  });
});

// POST /api/admin/seed
app.post('/api/admin/seed', (req, res) => {
  mockDb.seed();
  res.json({ message: 'Database successfully re-seeded with DoxabetaCloud Academy baseline data.' });
});


// Start server function handling Vite in dev and static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InternFlow Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
