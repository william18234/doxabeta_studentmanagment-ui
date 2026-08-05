# Agent Instructions

Use Basic Authentication, not JWT.
Always send:  
Authorization: Basic <base64(username:password)>  
Content-Type: application/json

All POST bodies must match the backend DTO exactly.
Never send missing fields.
Never rename fields.
Never send null.
Never send empty JSON.
Never send malformed JSON.

The backend will return:
- 409 if the cohort name already exists
- 400 if JSON is invalid
- 500 if IDs do not exist or required fields are missing

Do not retry failed requests automatically.
Show a user-friendly error message instead.

## DTO Specifications

### Student DTO
- name: string
- email: string
- phone: string
- mentorId: number
- cohortId: number
- track: string
- status: string
- bio: string

### Mentor DTO
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
