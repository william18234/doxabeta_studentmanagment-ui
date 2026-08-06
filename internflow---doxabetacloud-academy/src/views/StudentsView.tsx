import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals & Detail
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAssignMentorOpen, setIsAssignMentorOpen] = useState(false);
  const [isAssignCohortOpen, setIsAssignCohortOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    code: 'STU001',
    name: '',
    email: '',
    phone: '',
    mentorId: '',
    cohortId: '',
    track: 'Cloud & DevOps',
    status: 'ACTIVE' as const,
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
        code: formData.code || 'STU001',
        name: formData.name || '',
        email: formData.email || '',
        status: formData.status || 'ACTIVE',
        cohortId: formData.cohortId ? Number(formData.cohortId) : null,
        mentorId: formData.mentorId ? Number(formData.mentorId) : null,
        phone: formData.phone || '',
        track: formData.track || 'Cloud & DevOps',
        bio: formData.bio || ''
      };
      await apiService.createStudent(authHeader, payload);
      setIsAddModalOpen(false);
      setFormData({ code: 'STU001', name: '', email: '', phone: '', mentorId: '', cohortId: '', track: 'Cloud & DevOps', status: 'ACTIVE', bio: '' });
      fetchInitialData();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader || !editingStudent) return;
    try {
      const payload = {
        code: formData.code || (editingStudent as any).code || 'STU001',
        name: formData.name || editingStudent.name || '',
        email: formData.email || editingStudent.email || '',
        status: formData.status || 'ACTIVE',
        cohortId: formData.cohortId ? Number(formData.cohortId) : null,
        mentorId: formData.mentorId ? Number(formData.mentorId) : null,
        phone: formData.phone || '',
        track: formData.track || editingStudent.track || 'Cloud & DevOps',
        bio: formData.bio || editingStudent.bio || ''
      };
      await apiService.updateStudent(authHeader, editingStudent.id, payload);
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

  const handleDeleteStudent = async (id: string) => {
    if (!authHeader || !id) return;
    try {
      await apiService.deleteStudent(authHeader, id);
      setIsDeleteModalOpen(false);
      setDeleteStudentId('');
      setSuccessMsg('Student deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchInitialData();
    } catch (err: any) {
      setError(err);
    }
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormData({
      code: (s as any).code || 'STU001',
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

  const safeStudents = Array.isArray(students) ? students : [];
  const filteredStudents = safeStudents.filter(s => {
    if (selectedMentorId && String(s.mentorId) !== String(selectedMentorId)) return false;
    if (selectedCohortId && String(s.cohortId) !== String(selectedCohortId) && s.cohortName !== String(selectedCohortId)) return false;
    if (selectedStatus && (s.status || '').toLowerCase() !== selectedStatus.toLowerCase()) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    const name = (s.name || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const phone = (s.phone || '').toLowerCase();
    const code = ((s as any).code || '').toLowerCase();
    const mentorName = (s.mentorName || '').toLowerCase();
    const cohortName = (s.cohortName || '').toLowerCase();
    const track = (s.track || '').toLowerCase();
    const status = (s.status || '').toLowerCase();
    const bio = (s.bio || '').toLowerCase();
    const id = String(s.id || '').toLowerCase();

    return (
      name.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      code.includes(q) ||
      mentorName.includes(q) ||
      cohortName.includes(q) ||
      track.includes(q) ||
      status.includes(q) ||
      bio.includes(q) ||
      id.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchInitialData} />

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-xs">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm px-1">✕</button>
        </div>
      )}

      {/* Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Student Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            DoxabetaCloud Academy Interns
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {user?.role !== 'STUDENT' && (
            <CSVExportButton
              data={filteredStudents}
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
          )}

          {isStaff ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFormData({
                    code: 'STU001',
                    name: '',
                    email: '',
                    phone: '',
                    mentorId: mentors.length > 0 ? String(mentors[0].id) : '',
                    cohortId: cohorts.length > 0 ? String(cohorts[0].id) : '',
                    track: 'Cloud & DevOps',
                    status: 'ACTIVE',
                    bio: ''
                  });
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>

              <button
                onClick={() => {
                  if (students.length > 0) setDeleteStudentId(String(students[0].id));
                  setIsDeleteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Student</span>
              </button>
            </div>
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
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="GRADUATED">GRADUATED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {search.trim() && (
        <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              Search active for <strong>"{search.trim()}"</strong>: Showing <strong>{filteredStudents.length}</strong> matching student record{filteredStudents.length === 1 ? '' : 's'}. All other students are hidden from view.
            </span>
          </div>
          <button
            onClick={() => setSearch('')}
            className="px-2.5 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-all shrink-0 cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

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
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                    {search.trim() ? (
                      <div className="py-4 space-y-1">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No student found matching "{search.trim()}"</p>
                        <p className="text-xs text-slate-400">All other student records are hidden from view.</p>
                        <button
                          onClick={() => setSearch('')}
                          className="mt-2 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold text-xs rounded-md transition-colors"
                        >
                          Clear Search
                        </button>
                      </div>
                    ) : (
                      "No students match the selected filter criteria."
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map(s => (
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
                          s.status === 'ACTIVE' || s.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : s.status === 'GRADUATED' || s.status === 'Graduated'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : s.status === 'SUSPENDED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
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

                          <button
                            onClick={() => {
                              setDeleteStudentId(String(s.id));
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Remove Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                {isAddModalOpen ? 'Create New Student' : 'Update Student'}
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
                <label className="block font-semibold mb-1">Student Code (code)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
                  placeholder="e.g. STU001"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Name (name)</label>
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
                <label className="block font-semibold mb-1">Email (email)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  placeholder="alex@student.doxabeta.com"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone (phone)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Track (track)</label>
                  <input
                    type="text"
                    value={formData.track}
                    onChange={e => setFormData({ ...formData, track: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    placeholder="Cloud & DevOps"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Status (status)</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="GRADUATED">GRADUATED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Mentor (mentorId)</label>
                  <select
                    value={formData.mentorId}
                    onChange={e => setFormData({ ...formData, mentorId: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="">Select Mentor</option>
                    {(Array.isArray(mentors) ? mentors : []).map(m => (
                      <option key={m.id} value={m.id}>{m.name} (ID: {m.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Cohort (cohortId)</label>
                  <select
                    value={formData.cohortId}
                    onChange={e => setFormData({ ...formData, cohortId: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="">Select Cohort</option>
                    {(Array.isArray(cohorts) ? cohorts : []).map(c => (
                      <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Bio (bio)</label>
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
            <p className="text-xs text-slate-500">Select a mentor to assign to this student.</p>

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

      {/* DELETE STUDENT MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Student</span>
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Are you sure you want to delete this student? This action cannot be undone.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Select Student to Delete
                </label>
                <select
                  value={deleteStudentId}
                  onChange={e => setDeleteStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Choose a Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email}) - ID: {s.id}
                    </option>
                  ))}
                </select>
              </div>

              {deleteStudentId && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 space-y-1">
                  <p className="font-semibold">⚠️ Confirmation Warning</p>
                  <p className="text-[11px] opacity-90">
                    Deleting student <strong>{students.find(s => String(s.id) === String(deleteStudentId))?.name}</strong> will erase their account profile, assigned mentor linkage, and records.
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
                disabled={!deleteStudentId}
                onClick={() => handleDeleteStudent(deleteStudentId)}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
