import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, ExternalLink, CheckCircle, Clock, Award, Filter, X } from 'lucide-react';
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
    title: 'Cloud Architecture Assignment',
    studentId: '',
    description: 'Submitted Terraform module for VPC provisioning.'
  });

  // Grade Modal
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState('');
  const [gradeForm, setGradeForm] = useState({
    grade: 92,
    feedback: 'Excellent work. Clean architecture and strong documentation.'
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
      const fetchedStudents = Array.isArray(studentsData) ? studentsData : [];
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setStudents(fetchedStudents);

      if (fetchedStudents.length > 0 && !submitForm.studentId) {
        setSubmitForm(prev => ({ ...prev, studentId: String(fetchedStudents[0].id) }));
      }
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

    if (!submitForm.studentId) {
      setError(new ApiError('Please select a student.', 400));
      return;
    }

    if (!submitForm.title || submitForm.title.trim() === '') {
      setError(new ApiError('Title is required.', 400));
      return;
    }

    const payload: any = {
      studentId: Number(submitForm.studentId),
      title: submitForm.title.trim()
    };

    if (submitForm.description && submitForm.description.trim() !== '') {
      payload.description = submitForm.description.trim();
    }

    try {
      await apiService.submitAssignment(authHeader, payload);
      setIsSubmitModalOpen(false);
      setSubmitForm({
        studentId: students.length > 0 ? String(students[0].id) : '',
        title: '',
        description: ''
      });
      fetchData();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleGradeAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader || !gradingAssignment) return;

    if (gradeForm.grade < 0 || gradeForm.grade > 100) {
      setError(new ApiError('Grade must be between 0 and 100.', 400));
      return;
    }

    const payload: any = {
      grade: Number(gradeForm.grade)
    };

    if (gradeForm.feedback && gradeForm.feedback.trim() !== '') {
      payload.feedback = gradeForm.feedback.trim();
    }

    try {
      await apiService.gradeAssignment(authHeader, gradingAssignment.id, payload);
      setGradingAssignment(null);
      fetchData();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!authHeader || !id) return;
    try {
      await apiService.deleteAssignment(authHeader, id);
      setIsDeleteModalOpen(false);
      setDeleteAssignmentId('');
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
            Submit projects, code repositories & mentor grading
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Assignment</span>
            </button>

            <button
              onClick={() => {
                if (assignments.length > 0) setDeleteAssignmentId(String(assignments[0].id));
                setIsDeleteModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Assignment</span>
            </button>
          </div>
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
            {(Array.isArray(students) ? students : []).map(s => (
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
              ) : !Array.isArray(assignments) || assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No project assignments submitted yet.</td>
                </tr>
              ) : (
                assignments.map((a, index) => {
                  const studentObj = students.find(s => String(s.id) === String(a.studentId));
                  const studentDisplay = studentObj
                    ? `${studentObj.name} (ID: ${studentObj.id})`
                    : (a.studentName ? `${a.studentName} (ID: ${a.studentId})` : `Student ID: ${a.studentId}`);
                  const isGraded = a.status === 'GRADED' || a.status === 'Graded' || a.grade !== undefined || a.score !== undefined;
                  const gradeVal = a.grade ?? a.score;

                  return (
                    <tr key={a.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{a.title}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{a.description || 'No description provided.'}</p>
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {studentDisplay}
                      </td>

                      <td className="px-4 py-3 font-mono">
                        {a.repositoryUrl ? (
                          <a
                            href={a.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[160px]">{a.repositoryUrl}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {a.submittedAt || a.submissionDate || '—'}
                      </td>

                      <td className="px-4 py-3">
                        {isGraded && gradeVal !== undefined && gradeVal !== null ? (
                          <div>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                              {gradeVal} / 100
                            </span>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{a.feedback || `Graded by ${a.gradedBy || 'Mentor'}`}</p>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full">
                            SUBMITTED
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isStaff && (
                            <button
                              onClick={() => {
                                setGradingAssignment(a);
                                setGradeForm({
                                  grade: a.grade ?? a.score ?? 92,
                                  feedback: a.feedback || 'Excellent work. Clean architecture and strong documentation.'
                                });
                              }}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold text-[11px] rounded-md cursor-pointer"
                            >
                              Grade Assignment
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setDeleteAssignmentId(String(a.id));
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Remove Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <h3 className="font-bold text-sm">Assignment Submission</h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Student (studentId)</label>
                <select
                  required
                  value={submitForm.studentId}
                  onChange={e => setSubmitForm({ ...submitForm, studentId: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">Select Student</option>
                  {(Array.isArray(students) ? students : []).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (ID: {s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Title (title)</label>
                <input
                  type="text"
                  required
                  value={submitForm.title}
                  onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. Cloud Architecture Assignment"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description (description)</label>
                <textarea
                  value={submitForm.description}
                  onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. Submitted Terraform module for VPC provisioning."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer">Submit Assignment</button>
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
              <h3 className="font-bold text-sm">Grade Assignment</h3>
              <button onClick={() => setGradingAssignment(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Grade (grade: 0–100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeForm.grade}
                  onChange={e => setGradeForm({ ...gradeForm, grade: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 font-bold text-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Feedback (feedback)</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. Excellent work. Clean architecture and strong documentation."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setGradingAssignment(null)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer">Submit Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE ASSIGNMENT MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Remove Assignment</span>
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an assignment submission to permanently remove from the system records.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Select Assignment to Delete
                </label>
                <select
                  value={deleteAssignmentId}
                  onChange={e => setDeleteAssignmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Choose an Assignment --</option>
                  {assignments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.studentName}) - ID: {a.id}
                    </option>
                  ))}
                </select>
              </div>

              {deleteAssignmentId && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 space-y-1">
                  <p className="font-semibold">⚠️ Confirmation Warning</p>
                  <p className="text-[11px] opacity-90">
                    Deleting assignment <strong>{assignments.find(a => String(a.id) === String(deleteAssignmentId))?.title}</strong> will erase its repository reference and grade evaluation.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!deleteAssignmentId}
                onClick={() => handleDeleteAssignment(deleteAssignmentId)}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Delete Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
