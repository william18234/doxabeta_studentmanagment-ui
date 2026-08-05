export type UserRole = 'ADMIN' | 'MENTOR' | 'STUDENT';

export interface User {
  username: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  mentorId?: string;
}

export interface Student {
  id: string;
  code?: string;
  name: string;
  email: string;
  phone?: string;
  mentorId?: string | number | null;
  mentorName?: string;
  cohortId?: string | number | null;
  cohortName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'Active' | 'Graduated' | 'On Leave' | 'Inactive';
  track: string;
  startDate?: string;
  bio?: string;
}

export interface Mentor {
  id: string;
  code?: string;
  name: string;
  email: string;
  phone?: string;
  title: string;
  department: string;
  maxMentees: number;
  activeMenteesCount?: number;
  bio?: string;
}

export interface Cohort {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  track: string;
  maxCapacity: number;
  studentCount?: number;
  status: 'Upcoming' | 'Active' | 'Completed';
}

export interface DailyHour {
  id: string;
  studentId: string;
  studentName?: string;
  date: string;
  hoursLogged: number;
  project: string;
  category: string;
  description: string;
  status: 'Submitted' | 'Approved' | 'Flagged';
}

export interface Review {
  id: string;
  studentId: string;
  studentName?: string;
  reviewerId: string;
  reviewerName?: string;
  reviewDate: string;
  rating: number; // 1-5
  technicalSkills: number; // 1-5
  communication: number; // 1-5
  initiative: number; // 1-5
  feedback: string;
  recommendations: string;
}

export interface Assignment {
  id: string;
  title: string;
  studentId: string;
  studentName?: string;
  description: string;
  repositoryUrl: string;
  submissionDate: string;
  dueDate: string;
  score?: number;
  maxScore: number;
  status: 'Submitted' | 'Graded' | 'Pending Review';
  feedback?: string;
  gradedBy?: string;
}

export interface AdminOverview {
  totalStudents: number;
  activeStudents: number;
  totalMentors: number;
  totalCohorts: number;
  totalHoursLogged: number;
  pendingAssignments: number;
  averageRating: number;
  recentActivities: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    actor: string;
  }[];
}

export interface ApiErrorResponse {
  error: string;
  status: number;
  details?: string;
}
