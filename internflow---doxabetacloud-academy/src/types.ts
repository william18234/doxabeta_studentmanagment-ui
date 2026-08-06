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
  studentId: number | string;
  studentName?: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  hoursLogged?: number;
  project?: string;
  category?: string;
  description?: string;
  notes?: string;
  status?: string;
}

export interface Review {
  id: string;
  studentId: number | string;
  studentName?: string;
  mentorId?: number | string;
  reviewerId?: string;
  reviewerName?: string;
  reviewDate: string;
  score?: number;
  rating?: number; // 1-5 fallback
  technicalSkills?: number; // 1-5
  communication?: number; // 1-5
  initiative?: number; // 1-5
  learningOutcomes?: string;
  notes?: string;
  nextSteps?: string;
  feedback?: string;
  recommendations?: string;
  status?: string;
}

export interface Assignment {
  id: string;
  title: string;
  studentId: number | string;
  studentName?: string;
  description?: string;
  submittedAt?: string;
  submissionDate?: string;
  grade?: number;
  score?: number;
  status?: 'SUBMITTED' | 'GRADED' | 'Submitted' | 'Graded' | 'Pending Review' | string;
  feedback?: string;
  repositoryUrl?: string;
  dueDate?: string;
  maxScore?: number;
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
