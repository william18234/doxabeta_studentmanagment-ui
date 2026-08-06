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
 * Executes API requests using JSON bodies and Basic Authentication.
 */
async function request<T>(
  endpoint: string,
  method: string = 'GET',
  authHeader?: string | null,
  body?: any
): Promise<T> {
  const methodUpper = method.toUpperCase();
  const isWriteMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(methodUpper);

  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };

  // Always enforce Content-Type: application/json for POST/PUT/DELETE/PATCH or when body is present
  if (isWriteMethod || body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Format Authorization header: strictly enforce Basic <base64>
  if (authHeader) {
    let raw = authHeader.trim();
    if (raw.startsWith('Bearer ')) {
      raw = raw.slice(7).trim();
    }
    if (raw.startsWith('Basic ')) {
      raw = raw.slice(6).trim();
    }
    headers['Authorization'] = `Basic ${raw}`;
  }

  const fullUrl = `${baseUrlSetting}${cleanEndpoint}`;

  try {
    const response = await fetch(fullUrl, {
      method: methodUpper,
      headers,
      body: body !== undefined ? JSON.stringify(body) : (isWriteMethod && methodUpper !== 'DELETE' ? '{}' : undefined)
    });

    if (!response.ok) {
      let defaultError = `HTTP ${response.status} ${response.statusText}`;
      if (response.status === 409) {
        defaultError = 'A cohort with this name already exists.';
      } else if (response.status === 400) {
        defaultError = 'Invalid data. Please check all fields.';
      } else if (response.status === 500) {
        defaultError = 'Invalid mentorId or cohortId.';
      }

      let errData: ApiErrorResponse = {
        error: defaultError,
        status: response.status
      };

      try {
        const json = await response.json();
        if (json.error || json.message) errData.error = json.error || json.message;
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

/**
 * Safely extracts an array from various API response shapes (plain array, wrapped object, or fallback empty array).
 */
function extractArray<T>(res: any, possibleKeys: string[] = []): T[] {
  if (Array.isArray(res)) {
    return res;
  }
  if (res && typeof res === 'object') {
    for (const key of possibleKeys) {
      if (Array.isArray(res[key])) {
        return res[key];
      }
    }
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.content)) return res.content;
    if (Array.isArray(res.results)) return res.results;
    if (Array.isArray(res.items)) return res.items;
  }
  return [];
}

function cleanPayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
}

export const apiService = {
  // Auth & Profile
  getMe: (authHeader: string): Promise<User> => request<User>('/me', 'GET', authHeader),

  // Student Management
  getStudents: async (
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
    const res = await request<any>(`/students${query ? `?${query}` : ''}`, 'GET', authHeader);
    return extractArray<Student>(res, ['students']);
  },

  getStudentById: (authHeader: string, id: string): Promise<Student> =>
    request<Student>(`/students/${id}`, 'GET', authHeader),

  createStudent: (authHeader: string, data: Partial<Student>): Promise<Student> =>
    request<Student>('/students', 'POST', authHeader, data),

  updateStudent: (authHeader: string, id: string, data: Partial<Student>): Promise<Student> =>
    request<Student>(`/students/${id}`, 'PUT', authHeader, data),

  deleteStudent: (authHeader: string, id: string): Promise<void> =>
    request<void>(`/students/${id}`, 'DELETE', authHeader),

  assignMentor: (authHeader: string, studentId: string, mentorId: string): Promise<Student> =>
    request<Student>(`/students/${studentId}/mentor/${mentorId}`, 'PUT', authHeader),

  assignCohort: (authHeader: string, studentId: string, cohortId: string): Promise<Student> =>
    request<Student>(`/students/${studentId}/cohort`, 'PUT', authHeader, { cohortId }),

  // Mentor Management
  getMentors: async (authHeader: string): Promise<Mentor[]> => {
    const res = await request<any>('/mentors', 'GET', authHeader);
    return extractArray<Mentor>(res, ['mentors']);
  },

  getMentorById: (authHeader: string, id: string): Promise<Mentor> =>
    request<Mentor>(`/mentors/${id}`, 'GET', authHeader),

  createMentor: (authHeader: string, data: Partial<Mentor>): Promise<Mentor> =>
    request<Mentor>('/mentors', 'POST', authHeader, data),

  deleteMentor: (authHeader: string, id: string): Promise<void> =>
    request<void>(`/mentors/${id}`, 'DELETE', authHeader),

  getMentorStudents: async (authHeader: string, mentorId: string): Promise<Student[]> => {
    const res = await request<any>(`/mentors/${mentorId}/students`, 'GET', authHeader);
    return extractArray<Student>(res, ['students', 'mentees']);
  },

  // Cohort Management
  getCohorts: async (authHeader: string): Promise<Cohort[]> => {
    const res = await request<any>('/cohorts', 'GET', authHeader);
    return extractArray<Cohort>(res, ['cohorts']);
  },

  getCohortById: (authHeader: string, id: string): Promise<Cohort> =>
    request<Cohort>(`/cohorts/${id}`, 'GET', authHeader),

  createCohort: (authHeader: string, data: Partial<Cohort>): Promise<Cohort> =>
    request<Cohort>('/cohorts', 'POST', authHeader, data),

  deleteCohort: (authHeader: string, id: string): Promise<void> =>
    request<void>(`/cohorts/${id}`, 'DELETE', authHeader),

  getCohortStudents: async (authHeader: string, cohortId: string): Promise<Student[]> => {
    const res = await request<any>(`/cohorts/${cohortId}/students`, 'GET', authHeader);
    return extractArray<Student>(res, ['students']);
  },

  // Daily Hours Tracking
  getDailyHours: async (authHeader: string, studentId?: string): Promise<DailyHour[]> => {
    const query = studentId ? `?studentId=${studentId}` : '';
    const res = await request<any>(`/daily-hours${query}`, 'GET', authHeader);
    return extractArray<DailyHour>(res, ['dailyHours', 'hours', 'logs']);
  },

  logDailyHours: (authHeader: string, data: Partial<DailyHour>): Promise<DailyHour> =>
    request<DailyHour>('/daily-hours', 'POST', authHeader, data),

  // Review Management
  getReviews: async (authHeader: string, studentId?: string): Promise<Review[]> => {
    const query = studentId ? `?studentId=${studentId}` : '';
    const res = await request<any>(`/reviews${query}`, 'GET', authHeader);
    return extractArray<Review>(res, ['reviews']);
  },

  createReview: (authHeader: string, data: { studentId: number; mentorId: number; reviewDate: string; score?: number; learningOutcomes?: string; notes?: string; nextSteps?: string } | Partial<Review>): Promise<Review> =>
    request<Review>('/reviews', 'POST', authHeader, data),

  // Assignment Management
  getAssignments: async (authHeader: string, studentId?: string): Promise<Assignment[]> => {
    const query = studentId ? `?studentId=${studentId}` : '';
    const res = await request<any>(`/assignments${query}`, 'GET', authHeader);
    return extractArray<Assignment>(res, ['assignments']);
  },

  submitAssignment: (authHeader: string, data: { studentId: number; title: string; description?: string } | Partial<Assignment>): Promise<Assignment> =>
    request<Assignment>('/assignments', 'POST', authHeader, data),

  deleteAssignment: (authHeader: string, id: string): Promise<void> =>
    request<void>(`/assignments/${id}`, 'DELETE', authHeader),

  gradeAssignment: (authHeader: string, id: string, data: { grade: number; feedback?: string }): Promise<Assignment> =>
    request<Assignment>(`/assignments/${id}/grade`, 'PUT', authHeader, data),

  // Admin Dashboard
  getAdminOverview: async (authHeader: string): Promise<AdminOverview> => {
    const res = await request<any>('/admin/overview', 'GET', authHeader);
    if (res && typeof res === 'object') {
      return {
        totalStudents: Number(res.totalStudents) || 0,
        activeStudents: Number(res.activeStudents) || 0,
        totalMentors: Number(res.totalMentors) || 0,
        totalCohorts: Number(res.totalCohorts) || 0,
        totalHoursLogged: Number(res.totalHoursLogged) || 0,
        pendingAssignments: Number(res.pendingAssignments) || 0,
        averageRating: Number(res.averageRating) || 0,
        recentActivities: extractArray(res.recentActivities || res.activities)
      };
    }
    return {
      totalStudents: 0,
      activeStudents: 0,
      totalMentors: 0,
      totalCohorts: 0,
      totalHoursLogged: 0,
      pendingAssignments: 0,
      averageRating: 0,
      recentActivities: []
    };
  },

  getAdminRawJson: (authHeader: string): Promise<any> =>
    request<any>('/admin/raw-json', 'GET', authHeader),

  seedAdminData: (authHeader: string): Promise<{ message: string }> =>
    request<{ message: string }>('/admin/seed', 'POST', authHeader)
};
