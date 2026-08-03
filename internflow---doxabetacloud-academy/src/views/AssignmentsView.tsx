import React, { useState, useEffect } from 'react';
import { FileText, Plus, ExternalLink, CheckCircle, Clock, Award, Filter, X } from 'lucide-react';
import { Assignment, Student } from '../types';
import { apiService, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CSVExportButton } from '../components/CSVExportButton';
import { ErrorBanner } from '../components/ErrorBanner';

export const AssignmentsView: React.FC = () => {
  const { authHeader, user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Submit Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: 'REST API Security & Basic Auth Implementation',
    studentId: user?.studentId || 's1',
    description: 'Build a secure Express REST server enforcing HTTP Basic Auth for admin, mentor, and student roles.',
    repositoryUrl: 'https://github.com/doxabeta-academy/internflow-auth-backend',
    dueDate: '2026-08-15'
  });

  // Grade Modal
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [gradeForm, setGradeForm] = useState({
    score: 95,
    feedback: 'Great implementation of Basic Auth security middleware and CORS policy!'
  });

  const isStaff = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  const fetchData = async () => {
    if (!authHeader) return;
    setIsLoading(true);
    setError(null);
    try {
      const [assignmentsData, studentsData] = await Promise.all([
        apiService.getAssignments(authHeader, selectedStudentId || undefined),
        apiService.getStudents(authHeader)
      ]);
      setAssignments(assignmentsData);
      setStudents(studentsData);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authHeader, selectedStudentId]);

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader) return;
    try {
      await apiService.submitAssignment(authHeader, submitForm);
      setIsSubmitModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleGradeAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader || !gradingAssignment) return;
    try {
      await apiService.gradeAssignment(authHeader, gradingAssignment.id, gradeForm);
      setGradingAssignment(null);
      fetchData();
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchData} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Assignment Submissions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Submit projects, code repositories & mentor grading (`POST /api/assignments`, `PUT /api/assignments/:id/grade`)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CSVExportButton
            data={assignments}
            filename="doxabeta-assignments"
            title="Export Assignments CSV"
            columnMapping={{
              id: 'Assignment ID',
              title: 'Project Title',
              studentName: 'Student',
              repositoryUrl: 'Repository Link',
              submissionDate: 'Submitted Date',
              dueDate: 'Due Date',
              status: 'Status',
              score: 'Score Out Of 100',
              gradedBy: 'Graded By Mentor',
              feedback: 'Mentor Feedback'
            }}
          />

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Assignment</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
          >
            <option value="">All Student Submissions</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Assignment Title</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Repository Link</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Score / Grade</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading assignments...</td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No project assignments submitted yet.</td>
                </tr>
              ) : (
                assignments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{a.title}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{a.description}</p>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {a.studentName || 'Student'}
                    </td>

                    <td className="px-4 py-3 font-mono">
                      <a
                        href={a.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">{a.repositoryUrl}</span>
                      </a>
                    </td>

                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {a.submissionDate}
                    </td>

                    <td className="px-4 py-3">
                      {a.status === 'Graded' ? (
                        <div>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                            {a.score} / {a.maxScore}
                          </span>
                          <p className="text-[10px] text-slate-400">Graded by {a.gradedBy || 'Mentor'}</p>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full">
                          Pending Grade
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {isStaff && (
                        <button
                          onClick={() => {
                            setGradingAssignment(a);
                            setGradeForm({
                              score: a.score ?? 90,
                              feedback: a.feedback || 'Good code structure and API validation.'
                            });
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold text-[11px] rounded-md cursor-pointer"
                        >
                          Grade (`PUT /grade`)
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUBMIT ASSIGNMENT MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Submit Assignment (POST /api/assignments)</h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={submitForm.title}
                  onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Repository URL (GitHub / GitLab)</label>
                <input
                  type="url"
                  required
                  value={submitForm.repositoryUrl}
                  onChange={e => setSubmitForm({ ...submitForm, repositoryUrl: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 font-mono"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Technical Stack</label>
                <textarea
                  value={submitForm.description}
                  onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="px-3 py-1.5 bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg">Submit Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADE ASSIGNMENT MODAL */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Grade Submission (`PUT /api/assignments/{gradingAssignment.id}/grade`)</h3>
              <button onClick={() => setGradingAssignment(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Score Out Of 100</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeForm.score}
                  onChange={e => setGradeForm({ ...gradeForm, score: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 font-bold text-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mentor Grade Feedback</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="Provide constructive code review and architectural suggestions..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setGradingAssignment(null)} className="px-3 py-1.5 bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
