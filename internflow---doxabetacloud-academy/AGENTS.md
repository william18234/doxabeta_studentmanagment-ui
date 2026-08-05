# Agent Instructions

Use Basic Authentication, not JWT.
Always send:  
Authorization: Basic <base64(username:password)>  
Content-Type: application/json

When submitting mentors, cohorts, or students, use the exact backend DTO fields.
All POST/PUT/DELETE bodies must match the backend DTO exactly:
- Do not rename fields.
- Do not omit fields.
- Do not send null.
- Do not send empty JSON.
- Do not send malformed JSON.
- Do not send text/plain.

The backend will return:
- 409 if the cohort name already exists
- 400 if JSON is invalid
- 500 if IDs do not exist or required fields are missing

Do not retry failed requests automatically.
Show a user-friendly error message instead.

## DTO Specifications

### Student DTO
- code: string (required, unique, e.g. STU001)
- name: string (required)
- email: string (valid email format)
- status: string (enum: ACTIVE, INACTIVE, GRADUATED, or SUSPENDED)
- cohortId: number | null (nullable, must reference existing cohort or null)
- mentorId: number | null (nullable, must reference existing mentor or null)
- phone: string
- track: string
- bio: string

### Mentor DTO
- code: string
- name: string
- email: string
- phone: string
- title: string
- department: string
- maxMentees: number
- bio: string

### Cohort DTO
- name: string
- description: string
- startDate: string (YYYY-MM-DD)
- endDate: string (YYYY-MM-DD)
