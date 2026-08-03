import { Student, Mentor, Cohort, DailyHour, Review, Assignment, AdminOverview } from '../src/types.js';

export class MockDatabase {
  public students: Student[] = [];
  public mentors: Mentor[] = [];
  public cohorts: Cohort[] = [];
  public dailyHours: DailyHour[] = [];
  public reviews: Review[] = [];
  public assignments: Assignment[] = [];

  constructor() {
    this.seed();
  }

  public seed() {
    this.mentors = [
      {
        id: 'm1',
        name: 'Sarah Jenkins',
        email: 's.jenkins@doxabetacloudacademy.com',
        phone: '+1 (555) 234-5678',
        title: 'Senior Cloud Architect',
        department: 'Cloud Infrastructure & DevOps',
        maxMentees: 10,
        activeMenteesCount: 3,
        bio: 'Specialist in GCP, Kubernetes, and automated CI/CD pipelines with 12+ years industry experience.'
      },
      {
        id: 'm2',
        name: 'Dr. Marcus Vance',
        email: 'm.vance@doxabetacloudacademy.com',
        phone: '+1 (555) 876-5432',
        title: 'Lead AI Engineer',
        department: 'AI & Data Engineering',
        maxMentees: 8,
        activeMenteesCount: 2,
        bio: 'PhD in Computer Science. Focuses on Gemini API integration, LLM fine-tuning, and scalable microservices.'
      },
      {
        id: 'm3',
        name: 'Elena Rostova',
        email: 'e.rostova@doxabetacloudacademy.com',
        phone: '+1 (555) 345-6789',
        title: 'Principal Full Stack Lead',
        department: 'Web Applications & API Security',
        maxMentees: 10,
        activeMenteesCount: 2,
        bio: 'Expert in React, Node.js, REST Security, and Cloud-native frontend architectures.'
      }
    ];

    this.cohorts = [
      {
        id: 'c1',
        name: 'Cloud Native Engineering 2026-Q1',
        code: 'CNE-2026Q1',
        startDate: '2026-01-15',
        endDate: '2026-06-30',
        track: 'Cloud & DevOps',
        maxCapacity: 25,
        studentCount: 3,
        status: 'Active'
      },
      {
        id: 'c2',
        name: 'Full Stack AI Development 2026-Q2',
        code: 'FSAI-2026Q2',
        startDate: '2026-04-01',
        endDate: '2026-09-30',
        track: 'AI & Full Stack',
        maxCapacity: 20,
        studentCount: 2,
        status: 'Active'
      },
      {
        id: 'c3',
        name: 'Enterprise Cloud Architecture 2025-Q4',
        code: 'ECA-2025Q4',
        startDate: '2025-10-01',
        endDate: '2026-03-31',
        track: 'Cloud Architecture',
        maxCapacity: 15,
        studentCount: 2,
        status: 'Completed'
      }
    ];

    this.students = [
      {
        id: 's1',
        name: 'Alex Rivera',
        email: 'alex.rivera@student.doxabeta.com',
        phone: '+1 (555) 101-2020',
        mentorId: 'm1',
        mentorName: 'Sarah Jenkins',
        cohortId: 'c1',
        cohortName: 'Cloud Native Engineering 2026-Q1',
        status: 'Active',
        track: 'Cloud & DevOps',
        startDate: '2026-01-15',
        bio: 'Passionate student focusing on Docker, Terraform, and Kubernetes deployments.'
      },
      {
        id: 's2',
        name: 'Priya Sharma',
        email: 'priya.sharma@student.doxabeta.com',
        phone: '+1 (555) 202-3030',
        mentorId: 'm1',
        mentorName: 'Sarah Jenkins',
        cohortId: 'c1',
        cohortName: 'Cloud Native Engineering 2026-Q1',
        status: 'Active',
        track: 'Cloud & DevOps',
        startDate: '2026-01-15',
        bio: 'Specializing in GCP Cloud Run, Serverless backend development, and OpenTelemetry.'
      },
      {
        id: 's3',
        name: 'Jordan Chen',
        email: 'jordan.chen@student.doxabeta.com',
        phone: '+1 (555) 303-4040',
        mentorId: 'm2',
        mentorName: 'Dr. Marcus Vance',
        cohortId: 'c2',
        cohortName: 'Full Stack AI Development 2026-Q2',
        status: 'Active',
        track: 'AI & Full Stack',
        startDate: '2026-04-01',
        bio: 'Building intelligent AI agents using Gemini 2.5 and React.'
      },
      {
        id: 's4',
        name: 'David Okafor',
        email: 'david.okafor@student.doxabeta.com',
        phone: '+1 (555) 404-5050',
        mentorId: 'm2',
        mentorName: 'Dr. Marcus Vance',
        cohortId: 'c2',
        cohortName: 'Full Stack AI Development 2026-Q2',
        status: 'Active',
        track: 'AI & Full Stack',
        startDate: '2026-04-01',
        bio: 'Focused on vector databases, RAG implementations, and Node.js REST services.'
      },
      {
        id: 's5',
        name: 'Maria Santos',
        email: 'maria.santos@student.doxabeta.com',
        phone: '+1 (555) 505-6060',
        mentorId: 'm3',
        mentorName: 'Elena Rostova',
        cohortId: 'c1',
        cohortName: 'Cloud Native Engineering 2026-Q1',
        status: 'Active',
        track: 'Cloud & DevOps',
        startDate: '2026-01-15',
        bio: 'Frontend enthusiast mastering TypeScript, Tailwind CSS, and UX accessibility.'
      },
      {
        id: 's6',
        name: 'Liam O\'Connor',
        email: 'liam.oconnor@student.doxabeta.com',
        phone: '+1 (555) 606-7070',
        mentorId: 'm3',
        mentorName: 'Elena Rostova',
        cohortId: 'c3',
        cohortName: 'Enterprise Cloud Architecture 2025-Q4',
        status: 'Graduated',
        track: 'Cloud Architecture',
        startDate: '2025-10-01',
        bio: 'Graduated intern now working on multi-region Cloud SQL & OAuth integration.'
      },
      {
        id: 's7',
        name: 'Chloe Bennett',
        email: 'chloe.bennett@student.doxabeta.com',
        phone: '+1 (555) 707-8080',
        mentorId: 'm1',
        mentorName: 'Sarah Jenkins',
        cohortId: 'c3',
        cohortName: 'Enterprise Cloud Architecture 2025-Q4',
        status: 'Graduated',
        track: 'Cloud Architecture',
        startDate: '2025-10-01',
        bio: 'Alumni pursuing GCP Professional Cloud Architect Certification.'
      }
    ];

    this.dailyHours = [
      {
        id: 'dh1',
        studentId: 's1',
        studentName: 'Alex Rivera',
        date: '2026-08-01',
        hoursLogged: 7.5,
        project: 'InternFlow Dashboard API',
        category: 'Backend & REST API',
        description: 'Implemented Basic Auth security middleware and student endpoint routing.',
        status: 'Approved'
      },
      {
        id: 'dh2',
        studentId: 's1',
        studentName: 'Alex Rivera',
        date: '2026-08-02',
        hoursLogged: 8.0,
        project: 'Doxabeta Cloud Infrastructure',
        category: 'Cloud Infrastructure',
        description: 'Configured Docker container deployment on Cloud Run and environment variables.',
        status: 'Approved'
      },
      {
        id: 'dh3',
        studentId: 's1',
        studentName: 'Alex Rivera',
        date: '2026-08-03',
        hoursLogged: 6.5,
        project: 'CSV Export Engine',
        category: 'Frontend & Analytics',
        description: 'Added client-side CSV dataset export for Student and Daily Hours tables.',
        status: 'Submitted'
      },
      {
        id: 'dh4',
        studentId: 's2',
        studentName: 'Priya Sharma',
        date: '2026-08-02',
        hoursLogged: 8.0,
        project: 'Kubernetes Pod Security',
        category: 'Cloud Infrastructure',
        description: 'Reviewed RBAC configurations and ingress controller network policies.',
        status: 'Approved'
      },
      {
        id: 'dh5',
        studentId: 's3',
        studentName: 'Jordan Chen',
        date: '2026-08-02',
        hoursLogged: 7.0,
        project: 'Gemini Assistant Integration',
        category: 'AI & Data Engineering',
        description: 'Integrated Gemini API for automated code analysis and feedback generation.',
        status: 'Approved'
      }
    ];

    this.reviews = [
      {
        id: 'r1',
        studentId: 's1',
        studentName: 'Alex Rivera',
        reviewerId: 'm1',
        reviewerName: 'Sarah Jenkins',
        reviewDate: '2026-07-28',
        rating: 5,
        technicalSkills: 5,
        communication: 4,
        initiative: 5,
        feedback: 'Alex has shown outstanding initiative in understanding HTTP Basic Auth security patterns and RESTful server proxying.',
        recommendations: 'Continue exploring multi-tenant data access control and automated integration testing.'
      },
      {
        id: 'r2',
        studentId: 's2',
        studentName: 'Priya Sharma',
        reviewerId: 'm1',
        reviewerName: 'Sarah Jenkins',
        reviewDate: '2026-07-25',
        rating: 4,
        technicalSkills: 4,
        communication: 5,
        initiative: 4,
        feedback: 'Priya consistently communicates progress clearly and builds clean, reliable containerized applications.',
        recommendations: 'Recommend taking the GCP Associate Cloud Engineer practice assessment next week.'
      },
      {
        id: 'r3',
        studentId: 's3',
        studentName: 'Jordan Chen',
        reviewerId: 'm2',
        reviewerName: 'Dr. Marcus Vance',
        reviewDate: '2026-07-30',
        rating: 5,
        technicalSkills: 5,
        communication: 5,
        initiative: 5,
        feedback: 'Exceptional performance in integrating AI capabilities with React frontend state management.',
        recommendations: 'Lead the upcoming tech talk on LLM streaming responses in web applications.'
      }
    ];

    this.assignments = [
      {
        id: 'a1',
        title: 'REST API Security & Basic Auth Implementation',
        studentId: 's1',
        studentName: 'Alex Rivera',
        description: 'Build a secure Express REST server enforcing HTTP Basic Auth for admin, mentor, and student roles.',
        repositoryUrl: 'https://github.com/doxabeta-academy/internflow-auth-backend',
        submissionDate: '2026-07-29',
        dueDate: '2026-07-31',
        score: 98,
        maxScore: 100,
        status: 'Graded',
        feedback: 'Excellent work! Role permissions are cleanly enforced across all endpoints.',
        gradedBy: 'Sarah Jenkins'
      },
      {
        id: 'a2',
        title: 'Cloud Run Containerization & Health Checks',
        studentId: 's1',
        studentName: 'Alex Rivera',
        description: 'Package the InternFlow web service into a Docker container exposing port 3000 with health endpoints.',
        repositoryUrl: 'https://github.com/doxabeta-academy/internflow-container',
        submissionDate: '2026-08-01',
        dueDate: '2026-08-05',
        score: undefined,
        maxScore: 100,
        status: 'Submitted',
        feedback: undefined,
        gradedBy: undefined
      },
      {
        id: 'a3',
        title: 'React Dashboard UI with Client-Side CSV Export',
        studentId: 's2',
        studentName: 'Priya Sharma',
        description: 'Develop a responsive frontend matching DoxabetaCloud Academy branding and CSV export capabilities.',
        repositoryUrl: 'https://github.com/doxabeta-academy/internflow-react-ui',
        submissionDate: '2026-08-02',
        dueDate: '2026-08-05',
        score: 95,
        maxScore: 100,
        status: 'Graded',
        feedback: 'Great UI polish and clean table filter exports.',
        gradedBy: 'Sarah Jenkins'
      }
    ];

    this.updateCounts();
  }

  public updateCounts() {
    this.mentors.forEach(m => {
      m.activeMenteesCount = this.students.filter(s => s.mentorId === m.id && s.status === 'Active').length;
    });
    this.cohorts.forEach(c => {
      c.studentCount = this.students.filter(s => s.cohortId === c.id).length;
    });
  }

  public getAdminOverview(): AdminOverview {
    const totalStudents = this.students.length;
    const activeStudents = this.students.filter(s => s.status === 'Active').length;
    const totalMentors = this.mentors.length;
    const totalCohorts = this.cohorts.length;
    const totalHoursLogged = this.dailyHours.reduce((sum, h) => sum + Number(h.hoursLogged), 0);
    const pendingAssignments = this.assignments.filter(a => a.status === 'Submitted').length;
    
    const totalRatingSum = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = this.reviews.length > 0 ? Number((totalRatingSum / this.reviews.length).toFixed(1)) : 5.0;

    return {
      totalStudents,
      activeStudents,
      totalMentors,
      totalCohorts,
      totalHoursLogged: Math.round(totalHoursLogged * 10) / 10,
      pendingAssignments,
      averageRating,
      recentActivities: [
        { id: 'act1', type: 'HOURS_LOGGED', description: 'Alex Rivera logged 6.5 hours for CSV Export Engine', timestamp: '2026-08-03T08:30:00Z', actor: 'Alex Rivera' },
        { id: 'act2', type: 'ASSIGNMENT_SUBMITTED', description: 'Priya Sharma submitted React Dashboard UI', timestamp: '2026-08-02T16:45:00Z', actor: 'Priya Sharma' },
        { id: 'act3', type: 'REVIEW_CREATED', description: 'Sarah Jenkins created performance review for Alex Rivera', timestamp: '2026-07-28T11:15:00Z', actor: 'Sarah Jenkins' },
        { id: 'act4', type: 'COHORT_STARTED', description: 'Full Stack AI Development 2026-Q2 cohort initialized', timestamp: '2026-04-01T09:00:00Z', actor: 'System' }
      ]
    };
  }
}

export const mockDb = new MockDatabase();
