import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  UserCheck,
  FolderGit2,
  Filter,
  Eye,
  Edit2,
  UserPlus,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Student, Mentor, Cohort } from '../types';
import { apiService, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CSVExportButton } from '../components/CSVExportButton';
import { ErrorBanner } from '../components/ErrorBanner';

export const StudentsView: React.FC = () => {
  const { authHeader, user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals & Detail
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAssignMentorOpen, setIsAssignMentorOpen] = useState(false);
  const [isAssignCohortOpen, setIsAssignCohortOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mentorId: '',
    cohortId: '',
    track: 'Cloud & DevOps',
    status: 'Active' as const,
    bio: ''
  });

  const [assignMentorId, setAssignMentorId] = useState('');
  const [assignCohortId, setAssignCohortId] = useState('');

  const isStaff = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  const fetchInitialData = async () => {
    if (!authHeader) return;
    setIsLoading(true);
    setError(null);
    try {
      const [studentsData, mentorsData, cohortsData] = await Promise.all([
        apiService.getStudents(authHeader, {
          mentorId: selectedMentorId || undefined,
          cohortId: selectedCohortId || undefined,
          status: selectedStatus || undefined,
          search: search || undefined
        }),
        apiService.getMentors(authHeader),
        apiService.getCohorts(authHeader)
      ]);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setMentors(Array.isArray(mentorsData) ? mentorsData : []);
      setCohorts(Array.isArray(cohortsData) ? cohortsData : []);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [authHeader, selectedMentorId, selectedCohortId, selectedStatus, search]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader) return;
    try {
      const payload = {
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        mentorId: formData.mentorId ? Number(formData.mentorId) : 0,
        cohortId: formData.cohortId ? Number(formData.cohortId) : 0,
        track: formData.track || 'Cloud & DevOps',
        status: formData.status || 'Active',
        bio: formData.bio || ''
      };
      await apiService.createStudent(authHeader, payload);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', mentorId: '', cohortId: '', track: 'Cloud & DevOps', status: 'Active', bio: '' });
      fetchInitialData();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader || !editingStudent) return;
    try {
      await apiService.updateStudent(authHeader, editingStudent.id, formData);
      setIsEditModalOpen(false);
      setEditingStudent(null);
      fetchInitialData();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleAssignMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader || !editingStudent || !assignMentorId) return;
    try {
      await apiService.assignMentor(authHeader, editingStudent.id, assignMentorId);
      setIsAssignMentorOpen(false);
      fetchInitialData();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleAssignCohortSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader || !editingStudent || !assignCohortId) return;
    try {
      await apiService.assignCohort(authHeader, editingStudent.id, assignCohortId);
      setIsAssignCohortOpen(false);
      fetchInitialData();
    } catch (err: any) {
      setError(err);
    }
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormData({
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      mentorId: s.mentorId || '',
      cohortId: s.cohortId || '',
      track: s.track || 'Cloud & DevOps',
      status: s.status,
      bio: s.bio || ''
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchInitialData} />

      {/* Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Student Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            DoxabetaCloud Academy Interns (`GET /api/students`)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CSVExportButton
            data={students}
            filename="doxabeta-students"
            title="Export Students CSV"
            columnMapping={{
              id: 'Student ID',
              name: 'Full Name',
              email: 'Email Address',
              phone: 'Phone',
              mentorName: 'Assigned Mentor',
              cohortName: 'Cohort Name',
              status: 'Status',
              track: 'Learning Track',
              startDate: 'Start Date'
            }}
          />

          {isStaff ? (
            <button
              onClick={() => {
                setFormData({ name: '', email: '', phone: '', mentorId: '', cohortId: '', track: 'Cloud & DevOps', status: 'Active', bio: '' });
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              Read Only (Student Role)
            </span>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Filter Students</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, track..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Mentor Filter */}
          <select
            value={selectedMentorId}
            onChange={e => setSelectedMentorId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
          >
            <option value="">All Mentors</option>
            {(Array.isArray(mentors) ? mentors : []).map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.department})
              </option>
            ))}
          </select>

          {/* Cohort Filter */}
          <select
            value={selectedCohortId}
            onChange={e => setSelectedCohortId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
          >
            <option value="">All Cohorts</option>
            {(Array.isArray(cohorts) ? cohorts : []).map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Graduated">Graduated</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Assigned Mentor</th>
                <th className="px-4 py-3">Cohort</th>
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : !Array.isArray(students) || students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{s.name}</span>
                        <p className="text-[11px] text-slate-400 font-mono">{s.email}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {s.mentorName ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-medium">
                          <UserCheck className="w-3 h-3" />
                          {s.mentorName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {s.cohortName ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium">
                          <FolderGit2 className="w-3 h-3" />
                          {s.cohortName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No Cohort</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {s.track}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          s.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : s.status === 'Graduated'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => setSelectedStudentDetail(s)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {isStaff && (
                        <>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Edit Student Info"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingStudent(s);
                              setAssignMentorId(s.mentorId || '');
                              setIsAssignMentorOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Assign Mentor"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT STUDENT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAddModalOpen ? 'Create New Student (POST /api/students)' : 'Update Student (PUT /api/students/{id})'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleCreateStudent : handleUpdateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  placeholder="alex@student.doxabeta.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Track</label>
                  <input
                    type="text"
                    value={formData.track}
                    onChange={e => setFormData({ ...formData, track: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    placeholder="Cloud & DevOps"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Assigned Mentor</label>
                  <select
                    value={formData.mentorId}
                    onChange={e => setFormData({ ...formData, mentorId: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="">None</option>
                    {(Array.isArray(mentors) ? mentors : []).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Cohort</label>
                  <select
                    value={formData.cohortId}
                    onChange={e => setFormData({ ...formData, cohortId: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="">None</option>
                    {(Array.isArray(cohorts) ? cohorts : []).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Bio / Notes</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg"
                >
                  {isAddModalOpen ? 'Create Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MENTOR MODAL */}
      {isAssignMentorOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-sm">Assign Mentor to {editingStudent.name}</h3>
            <p className="text-xs text-slate-500">PUT /api/students/{editingStudent.id}/mentor/{assignMentorId || '{mentorId}'}</p>

            <form onSubmit={handleAssignMentorSubmit} className="space-y-3 text-xs">
              <select
                value={assignMentorId}
                onChange={e => setAssignMentorId(e.target.value)}
                required
                className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <option value="">Select Mentor</option>
                {(Array.isArray(mentors) ? mentors : []).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.title})</option>
                ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAssignMentorOpen(false)} className="px-3 py-1.5 bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL DRAWER */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudentDetail.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedStudentDetail.email}</p>
              </div>
              <button onClick={() => setSelectedStudentDetail(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div><span className="text-slate-400">Track:</span> {selectedStudentDetail.track}</div>
                <div><span className="text-slate-400">Status:</span> {selectedStudentDetail.status}</div>
                <div><span className="text-slate-400">Assigned Mentor:</span> {selectedStudentDetail.mentorName || 'None'}</div>
                <div><span className="text-slate-400">Cohort:</span> {selectedStudentDetail.cohortName || 'None'}</div>
              </div>

              {selectedStudentDetail.bio && (
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Biography / Overview</p>
                  <p className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                    {selectedStudentDetail.bio}
                  </p>
                </div>
              )}
            </div>

            <div className="text-right pt-2 border-t">
              <button onClick={() => setSelectedStudentDetail(null)} className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-xs rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
