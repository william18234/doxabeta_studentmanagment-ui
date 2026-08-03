import {
  Student,
  Mentor,
  Cohort,
  DailyHour,
  Review,
  Assignment,
  AdminOverview,
  User,
  ApiErrorResponse
} from '../types';

export class ApiError extends Error {
  public status: number;
  public details?: string;

  constructor(message: string, status: number, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Configurable base URL: Defaults to '/api' which works both locally and via our Express proxy
let baseUrlSetting = '/api';

export function getBaseUrl(): string {
  return baseUrlSetting;
}

export function setBaseUrl(url: string) {
  baseUrlSetting = url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Executes API requests with Basic Authentication headers.
 */
async function request<T>(
  endpoint: string,
  method: string = 'GET',
  authHeader?: string | null,
  body?: any
): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };

  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrlSetting}${cleanEndpoint}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      let errData: ApiErrorResponse = {
        error: `HTTP ${response.status} ${response.statusText}`,
        status: response.status
      };

      try {
        const json = await response.json();
        if (json.error) errData.error = json.error;
        if (json.details) errData.details = json.details;
      } catch {
        // Fallback text parsing
      }

      throw new ApiError(errData.error, response.status, errData.details);
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Failed to connect to backend server',
      500,
      `Connection error when fetching ${fullUrl}`
    );
  }
}

export const apiService = {
  // Auth & Profile
  getMe: (authHeader: string): Promise<User> => request<User>('/me', 'GET', authHeader),

  // Student Management
  getStudents: (
    authHeader: string,
    params?: { mentorId?: string; cohort?: string; cohortId?: string; status?: string; search?: string }
  ): Promise<Student[]> => {
    const searchParams = new URLSearchParams();
    if (params?.mentorId) searchParams.append('mentorId', params.mentorId);
    if (params?.cohortId) searchParams.append('cohortId', params.cohortId);
    else if (params?.cohort) searchParams.append('cohort', params.cohort);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    return request<Student[]>(`/students${query ? `?${query}` : ''}`, 'GET', authHeader);
  },

  getStudentById: (authHeader: string, id: string): Promise<Student> =>
    request<Student>(`/students/${id}`, 'GET', authHeader),

  createStudent: (authHeader: string, data: Partial<Student>): Promise<Student> =>
    request<Student>('/students', 'POST', authHeader, data),

  updateStudent: (authHeader: string, id: string, data: Partial<Student>): Promise<Student> =>
    request<Student>(`/students/${id}`, 'PUT', authHeader, data),

  assignMentor: (authHeader: string, studentId: string, mentorId: string): Promise<Student> =>
    request<Student>(`/students/${studentId}/mentor/${mentorId}`, 'PUT', authHeader),

  assignCohort: (authHeader: string, studentId: string, cohortId: string): Promise<Student> =>
    request<Student>(`/students/${studentId}/cohort`, 'PUT', authHeader, { cohortId }),

  // Mentor Management
  getMentors: (authHeader: string): Promise<Mentor[]> =>
    request<Mentor[]>('/mentors', 'GET', authHeader),

  getMentorById: (authHeader: string, id: string): Promise<Mentor> =>
    request<Mentor>(`/mentors/${id}`, 'GET', authHeader),

  createMentor: (authHeader: string, data: Partial<Mentor>): Promise<Mentor> =>
    request<Mentor>('/mentors', 'POST', authHeader, data),

  getMentorStudents: (authHeader: string, mentorId: string): Promise<Student[]> =>
    request<Student[]>(`/mentors/${mentorId}/students`, 'GET', authHeader),

  // Cohort Management
  getCohorts: (authHeader: string): Promise<Cohort[]> =>
    request<Cohort[]>('/cohorts', 'GET', authHeader),

  createCohort: (authHeader: string, data: Partial<Cohort>): Promise<Cohort> =>
    request<Cohort>('/cohorts', 'POST', authHeader, data),

  getCohortStudents: (authHeader: string, cohortId: string): Promise<Student[]> =>
    request<Student[]>(`/cohorts/${cohortId}/students`, 'GET', authHeader),

  // Daily Hours Tracking
  getDailyHours: (authHeader: string, studentId?: string): Promise<DailyHour[]> => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return request<DailyHour[]>(`/daily-hours${query}`, 'GET', authHeader);
  },

  logDailyHours: (authHeader: string, data: Partial<DailyHour>): Promise<DailyHour> =>
    request<DailyHour>('/daily-hours', 'POST', authHeader, data),

  // Review Management
  getReviews: (authHeader: string, studentId?: string): Promise<Review[]> => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return request<Review[]>(`/reviews${query}`, 'GET', authHeader);
  },

  createReview: (authHeader: string, data: Partial<Review>): Promise<Review> =>
    request<Review>('/reviews', 'POST', authHeader, data),

  // Assignment Management
  getAssignments: (authHeader: string, studentId?: string): Promise<Assignment[]> => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return request<Assignment[]>(`/assignments${query}`, 'GET', authHeader);
  },

  submitAssignment: (authHeader: string, data: Partial<Assignment>): Promise<Assignment> =>
    request<Assignment>('/assignments', 'POST', authHeader, data),

  gradeAssignment: (authHeader: string, id: string, data: { score: number; feedback?: string }): Promise<Assignment> =>
    request<Assignment>(`/assignments/${id}/grade`, 'PUT', authHeader, data),

  // Admin Dashboard
  getAdminOverview: (authHeader: string): Promise<AdminOverview> =>
    request<AdminOverview>('/admin/overview', 'GET', authHeader),

  getAdminRawJson: (authHeader: string): Promise<any> =>
    request<any>('/admin/raw-json', 'GET', authHeader),

  seedAdminData: (authHeader: string): Promise<{ message: string }> =>
    request<{ message: string }>('/admin/seed', 'POST', authHeader)
};
